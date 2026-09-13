-- ===========================================================================
-- BISTRO LIEKKI — sisällönhallinnan tietokantarakenne
-- ---------------------------------------------------------------------------
-- Kaksi taulua:
--   sisalto     nykyinen sisältö, yksi rivi per osio (avain + jsonb)
--   muutosloki  jokainen tallennus talteen, jotta edellisen version voi palauttaa
--
-- Oikeudet:
--   kuka tahansa saa LUKEA sisältöä   -> sivusto toimii ilman kirjautumista
--   vain kirjautunut saa KIRJOITTAA   -> hallintapaneeli vaatii tunnukset
-- ===========================================================================

create table if not exists public.sisalto (
  avain       text primary key,
  data        jsonb       not null default '{}'::jsonb,
  paivitetty  timestamptz not null default now(),
  paivittaja  text
);

comment on table  public.sisalto is 'Sivuston muokattava sisältö osioittain.';
comment on column public.sisalto.avain is 'Osion tunnus, esim. lounaslista tai menu.';
comment on column public.sisalto.data  is 'Osion sisältö samassa muodossa kuin content.js:ssä.';

create table if not exists public.muutosloki (
  id          bigint generated always as identity primary key,
  avain       text        not null,
  data        jsonb       not null,
  paivitetty  timestamptz not null default now(),
  paivittaja  text
);

create index if not exists muutosloki_avain_aika
  on public.muutosloki (avain, paivitetty desc);

comment on table public.muutosloki is
  'Jokaisen tallennuksen edellinen versio. Vanhin versio poistuu, kun osiolla on yli 30 versiota.';

-- ---------------------------------------------------------------------------
-- Muutosloki täyttyy itsestään: ennen päivitystä vanha versio siirtyy lokiin.
-- Samalla siivotaan yli 30 version ylitys pois, jotta taulu ei kasva rajatta.
-- ---------------------------------------------------------------------------
create or replace function public.tallenna_edellinen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.muutosloki (avain, data, paivitetty, paivittaja)
  values (old.avain, old.data, old.paivitetty, old.paivittaja);

  delete from public.muutosloki
  where id in (
    select id from public.muutosloki
    where avain = old.avain
    order by paivitetty desc
    offset 30
  );

  new.paivitetty := now();
  return new;
end;
$$;

drop trigger if exists sisalto_muutosloki on public.sisalto;
create trigger sisalto_muutosloki
  before update on public.sisalto
  for each row
  when (old.data is distinct from new.data)
  execute function public.tallenna_edellinen();

-- ---------------------------------------------------------------------------
-- Rivitason oikeudet
-- ---------------------------------------------------------------------------
alter table public.sisalto    enable row level security;
alter table public.muutosloki enable row level security;

drop policy if exists "sisalto julkinen luku"     on public.sisalto;
drop policy if exists "sisalto kirjautunut muokkaa" on public.sisalto;
drop policy if exists "sisalto kirjautunut lisaa"   on public.sisalto;
drop policy if exists "muutosloki kirjautunut luku" on public.muutosloki;

-- Sivusto lukee sisällön ilman kirjautumista.
create policy "sisalto julkinen luku"
  on public.sisalto for select
  to anon, authenticated
  using (true);

-- Kirjoittaminen vaatii kirjautumisen.
create policy "sisalto kirjautunut muokkaa"
  on public.sisalto for update
  to authenticated
  using (true) with check (true);

create policy "sisalto kirjautunut lisaa"
  on public.sisalto for insert
  to authenticated
  with check (true);

-- Muutosloki näkyy vain kirjautuneelle.
create policy "muutosloki kirjautunut luku"
  on public.muutosloki for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- Osiot. Sisältö täytetään erikseen content.js:stä, jotta tietokanta ja
-- sivuston sisäänrakennettu varasisältö lähtevät liikkeelle samoista tiedoista.
-- ---------------------------------------------------------------------------
insert into public.sisalto (avain, data) values
  ('perustiedot', '{}'::jsonb),
  ('aukioloajat', '{}'::jsonb),
  ('lounaslista', '{}'::jsonb),
  ('menu',        '{}'::jsonb),
  ('ilmoitukset', '{}'::jsonb),
  ('saavutukset', '{}'::jsonb),
  ('tekstit',     '{}'::jsonb)
on conflict (avain) do nothing;
