# Bistro Liekki — verkkosivusto

Puuhiiligrilli Tikkurilan sydämessä vuodesta 2016.
Talvikkitie 30, 01300 Vantaa.

Staattinen verkkosivusto: pelkkää HTML:ää, CSS:ää, JavaScriptiä ja kuvia.
Ei tietokantaa, ei riippuvuuksia, ei build-vaihetta julkaisua varten.

---

## Rakenne

```
sivusto/                    ← tämä viedään palvelimelle
├── index.html              Etusivu
├── meista/                 Meistä
├── menu/                   À la Carte
├── lounas/                 Lounas
├── catering/               Catering
├── galleria/               Galleria
├── lahjakortti/            Lahjakortti
├── yhteystiedot/           Yhteystiedot
├── palaute/                Palaute
├── vahvista-poytavaraus/   Varausjärjestelmän paluusivu
├── 404.html                Virhesivu (Vercel, Netlify, GitHub Pages)
├── assets/
│   ├── css/style.css       Kaikki tyylit
│   ├── js/content.js       ★ SISÄLLÖN HALLINTA — muokkaa tätä
│   ├── js/site.js          Toiminnallisuus
│   └── img/                Kuvat + KUVAT.md
├── favicon.svg
├── site.webmanifest
├── robots.txt
└── sitemap.xml

lahdekoodi/                 Työkalut, jos rakennetta muokataan
├── build.py                Koostaa sivut uudelleen
├── bundle.py               Tekee yhden tiedoston esikatselun
├── kasittele_kuvat.py      Rajaa ja optimoi valokuvat
├── gen_textures.py         Luo hiili- ja liekkitekstuurit
└── sisalto/                Sivujen sisältö ilman headeria/footeria

vercel.json                 Vercel-asetukset (sivusto/ + välimuisti)
esikatselu.html             Koko sivusto yhtenä tiedostona (esittelyyn)
LUE-MINUT.md                Täydellinen ylläpito-ohje
```

## Julkaisu

Kopioi `sivusto/`-kansion **sisältö** palvelimen juureen. Siinä kaikki.
Toimii sellaisenaan tavallisella web-hotellilla, Netlifyssä tai Vercelissä.

**Vercel:** repon juuressa on `vercel.json`, joka kertoo Vercelille että
sivusto on `sivusto/`-kansiossa. Deploy toimii sellaisenaan — älä aseta
projektin Root Directorya, jätä se repon juureen.

**GitHub Pages:** repossa on valmis työnkulku (`.github/workflows/pages.yml`),
joka julkaisee `sivusto/`-kansion. Ota se käyttöön:
**Settings → Pages → Source: GitHub Actions**.

## Paikallinen esikatselu

```bash
cd sivusto
python3 -m http.server 8000
# avaa http://localhost:8000
```

## Ylläpito

Normaalissa käytössä muokataan vain yhtä tiedostoa:
**`sivusto/assets/js/content.js`** — aukioloajat, lounaan ajat ja hinta,
puhelinnumerot, varauslinkki, some-osoitteet, ajankohtaiset ilmoitukset ja
gallerian kuvat. Muutos näkyy heti kaikilla sivuilla.

Sivujen tekstit ovat suoraan sivutiedostoissa. Jos muokkaat mieluummin ilman
toistuvaa headeria ja footeria, muokkaa `lahdekoodi/sisalto/`-tiedostoja ja
aja `python3 lahdekoodi/build.py`.

**Täydelliset ohjeet: [LUE-MINUT.md](LUE-MINUT.md)**

## Ominaisuudet

- Elävä aukiolotila, joka lasketaan Helsingin aikaan ja päivittyy minuutin välein
- TikTok-profiilin uusimmat videot etusivulla, päivittyvät automaattisesti
- Mobile-first: kiinteä varaa/soita-palkki, kokoruudun valikko, kosketuskohteet ≥ 44 px
- Puuhiiliteemainen liikekieli — kaikki animaatiot kunnioittavat `prefers-reduced-motion`
- SEO: omat metatiedot joka sivulle, Open Graph, `Restaurant`-rakenteinen data, sitemap
- Lomakkeissa näkymätön roskapostisuoja — ei captchaa
- Koko sivusto kuvineen noin 2,7 Mt

## Vielä täytettävää

Sivustolle ei ole keksitty yhtään ruokaa, hintaa, arvostelua eikä osoitetta.
Avoimet kohdat on lueteltu [LUE-MINUT.md](LUE-MINUT.md):n luvussa 3 — tärkeimpänä
à la carte -annokset ja lounaan hinnan tarkistus.
