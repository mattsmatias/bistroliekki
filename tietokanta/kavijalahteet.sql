-- ===========================================================================
-- BISTRO LIEKKI — mistä kävijät tulevat
--
-- Laajennus kävijälaskuriin (kavijalaskuri.sql). Taulussa on VAIN
-- päiväkohtaisia summia kanavaa kohden: "instagram 12", "google 30".
-- Yksittäisiä käyntejä, viittaavia osoitteita, IP-osoitteita tai mitään
-- henkilöön yhdistettävää ei tallenneta missään vaiheessa. Siksi tämä ei
-- vaadi evästebanneria eikä suostumusta.
--
-- Kanavan nimi tulee SALLITTUJEN LISTALTA. Selain lähettää vain valmiin
-- nimen kuten 'instagram', ei koskaan koko viittaavaa osoitetta. Jos
-- funktiota kutsuttaisiin suoraan jollain muulla arvolla, se muuttuu
-- arvoksi 'muu'. Tauluun ei siis voi ujuttaa mielivaltaista tekstiä.
--
-- Kanava kirjataan vain kerran selailukertaa kohden, ensimmäisellä
-- avatulla sivulla. Sivustolla liikkuminen ei tuota lisärivejä.
-- ===========================================================================

create table if not exists julkinen_lahteet (
  pvm     date    not null,
  lahde   text    not null,
  kaynnit integer not null default 0,
  primary key (pvm, lahde)
);

comment on table julkinen_lahteet is
  'Päiväkohtaiset käyntimäärät kanavittain. Ei henkilötietoja, ei osoitteita.';

alter table julkinen_lahteet enable row level security;

-- Vain kirjautunut ravintola näkee luvut. Anonyymillä kävijällä ei ole
-- yhtään policya, joten hän ei voi lukea, lisätä, muuttaa eikä poistaa
-- riviä suoraan — kirjaus kulkee pelkästään alla olevan funktion läpi.
drop policy if exists "kirjautunut lukee lahteet" on julkinen_lahteet;
create policy "kirjautunut lukee lahteet"
  on julkinen_lahteet for select
  to authenticated
  using (true);

-- Kirjausfunktio.
--
-- security definer on tässä tarkoituksellinen samasta syystä kuin
-- kirjaa_kaynti-funktiossa: anonyymin kävijän pitää pystyä kasvattamaan
-- laskuria, vaikkei hän saa nähdä taulua. Funktio osaa vain kasvattaa
-- lukua — se ei palauta mitään eikä pysty poistamaan mitään.
--
-- Tämä on TARKOITUKSELLA oma funktionsa eikä lisäparametri
-- kirjaa_kaynti-funktioon: uusi parametri tekisi kahden ja kolmen
-- argumentin kutsuista monitulkintaisia, jolloin sivuston laskenta
-- katkeaisi siksi aikaa kunnes uusi site.js on julkaistu.
create or replace function kirjaa_lahde(p_lahde text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lahde text;
  v_pvm   date;
  v_sallitut text[] := array[
    'google', 'bing', 'instagram', 'facebook', 'tiktok', 'youtube',
    'snapchat', 'whatsapp', 'linkedin', 'sahkoposti', 'restaurantguru',
    'kartat', 'suora', 'muu'
  ];
begin
  if p_lahde is null then return; end if;

  v_lahde := left(lower(p_lahde), 20);
  if not (v_lahde = any (v_sallitut)) then
    v_lahde := 'muu';
  end if;

  -- Ravintolan oma aika, ei UTC: muuten illan käynnit valuisivat
  -- seuraavalle päivälle. Sama laskenta kuin kirjaa_kaynti-funktiossa.
  v_pvm := (now() at time zone 'Europe/Helsinki')::date;

  insert into julkinen_lahteet (pvm, lahde, kaynnit)
  values (v_pvm, v_lahde, 1)
  on conflict (pvm, lahde) do update
    set kaynnit = julkinen_lahteet.kaynnit + 1;
end;
$$;

revoke all on function kirjaa_lahde(text) from public;
grant execute on function kirjaa_lahde(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Mainoslinkkien merkitseminen
--
-- Viittaava osoite (document.referrer) katoaa usein sovellusten sisäisissä
-- selaimissa: Instagramin ja Facebookin omat selaimet eivät läheskään aina
-- kerro mistä käyttäjä tuli, ja iOS karsii sitä muutenkin. Siksi maksetut
-- mainokset kannattaa linkittää utm_source-merkinnällä, jolloin kanava
-- luetaan suoraan osoitteesta eikä sitä tarvitse arvata:
--
--   https://bistroliekki.fi/?utm_source=instagram
--   https://bistroliekki.fi/lounas/?utm_source=facebook
--
-- Merkintä ei näy kävijälle muuta kuin osoiterivillä, eikä sitä tallenneta
-- sellaisenaan — siitä poimitaan vain kanavan nimi yllä olevalta listalta.
-- ---------------------------------------------------------------------------
