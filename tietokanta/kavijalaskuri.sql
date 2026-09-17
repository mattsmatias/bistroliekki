-- ===========================================================================
-- BISTRO LIEKKI — kävijälaskuri
--
-- Taulussa on VAIN päiväkohtaisia summia sivupolkua kohden. Yksittäisiä
-- käyntejä, IP-osoitteita, selaintietoja tai mitään muuta henkilöön
-- yhdistettävää ei tallenneta missään vaiheessa. Siksi laskuri ei vaadi
-- evästebanneria eikä suostumusta.
--
-- Tämä tiedosto on ajettu Supabaseen migraatioina `kavijalaskuri` ja
-- `kavijalaskuri_polkurajaus`. Se on tallessa tässä, jotta laskurin saa
-- tarvittaessa rakennettua uudelleen tyhjään projektiin.
-- ===========================================================================

create table if not exists julkinen_kavijat (
  pvm          date    not null,
  polku        text    not null,
  nayttokerrat integer not null default 0,
  kaynnit      integer not null default 0,
  primary key (pvm, polku)
);

comment on table julkinen_kavijat is
  'Päiväkohtaiset kävijäsummat sivua kohden. Ei henkilötietoja.';

alter table julkinen_kavijat enable row level security;

-- Vain kirjautunut ravintola näkee luvut. Anonyymillä kävijällä ei ole
-- yhtään policya, joten hän ei voi lukea, lisätä, muuttaa eikä poistaa
-- riviä suoraan — kirjaus kulkee pelkästään alla olevan funktion läpi.
drop policy if exists "kirjautunut lukee kavijat" on julkinen_kavijat;
create policy "kirjautunut lukee kavijat"
  on julkinen_kavijat for select
  to authenticated
  using (true);

-- Kirjausfunktio.
--
-- security definer on tässä tarkoituksellinen: anonyymin kävijän pitää
-- pystyä kasvattamaan laskuria, vaikkei hän saa nähdä taulua. Funktio osaa
-- vain kasvattaa lukuja — se ei palauta mitään, ei lue riviä ulos eikä
-- pysty poistamaan mitään. Supabasen tietoturvatarkistin huomauttaa
-- security definer -funktiosta, joka on anonyymin kutsuttavissa; tässä
-- tapauksessa huomautus on odotettu eikä sitä pidä "korjata".
--
-- Polku tarkistetaan sallittujen listaa vasten, joten tauluun ei voi
-- ujuttaa mielivaltaisia rivejä vaikka funktiota kutsuttaisiin suoraan.
create or replace function kirjaa_kaynti(p_polku text, p_uusi boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_polku text;
  v_pvm   date;
  v_sallitut text[] := array[
    '/', '/meista/', '/menu/', '/lounas/', '/catering/', '/galleria/',
    '/lahjakortti/', '/yhteystiedot/', '/palaute/', '/vahvista-poytavaraus/',
    '/404', '/muu'
  ];
begin
  if p_polku is null then return; end if;

  v_polku := left(lower(p_polku), 40);
  if not (v_polku = any (v_sallitut)) then
    v_polku := '/muu';
  end if;

  -- Ravintolan oma aika, ei UTC: muuten illan käynnit valuisivat
  -- seuraavalle päivälle.
  v_pvm := (now() at time zone 'Europe/Helsinki')::date;

  insert into julkinen_kavijat (pvm, polku, nayttokerrat, kaynnit)
  values (v_pvm, v_polku, 1, case when p_uusi then 1 else 0 end)
  on conflict (pvm, polku) do update
    set nayttokerrat = julkinen_kavijat.nayttokerrat + 1,
        kaynnit      = julkinen_kavijat.kaynnit
                       + case when p_uusi then 1 else 0 end;
end;
$$;

revoke all on function kirjaa_kaynti(text, boolean) from public;
grant execute on function kirjaa_kaynti(text, boolean) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Vanhojen rivien siivous (valinnainen)
--
-- Taulu kasvaa noin 12 riviä vuorokaudessa, eli reilut 4 000 riviä vuodessa.
-- Se on mitätön määrä, joten siivousta ei tarvita. Jos historiaa haluaa
-- silti rajata, tämän voi ajaa käsin tai Supabasen ajastetulla tehtävällä:
--
--   delete from julkinen_kavijat
--   where pvm < (now() at time zone 'Europe/Helsinki')::date - 730;
-- ---------------------------------------------------------------------------
