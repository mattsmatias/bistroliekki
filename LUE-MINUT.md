# Bistro Liekki — uusi verkkosivusto

Valmis, toimiva staattinen sivusto. Ei tietokantaa, ei riippuvuuksia, ei build-vaihetta
julkaisua varten — pelkkiä HTML-, CSS-, JS- ja kuvatiedostoja.

---

## 1. Paketin sisältö

```
sivusto/                     ← TÄMÄ VIEDÄÄN PALVELIMELLE
  index.html                 Etusivu
  meista/  menu/  lounas/  catering/  galleria/
  lahjakortti/  yhteystiedot/  palaute/  vahvista-poytavaraus/
  assets/
    css/style.css            Kaikki tyylit
    js/content.js            ★ SISÄLLÖN HALLINTA — muokkaa tätä
    js/site.js               Toiminnallisuus
    img/                     Kuvat
  favicon.svg  apple-touch-icon.png  site.webmanifest
  robots.txt   sitemap.xml

lahdekoodi/                  Sivupohjat, jos haluat muokata rakennetta
  build.py                   Koostaa sivut uudelleen: python3 build.py
  bundle.py                  Tekee yhden tiedoston esikatseluversion
  kasittele_kuvat.py         Rajaa ja optimoi uudet valokuvat
  gen_textures.py            Luo hiili- ja liekkitekstuurit
  sisalto/*.html             Sivujen sisältö ilman headeria/footeria

esikatselu.html              Koko sivusto yhtenä tiedostona (vain esittelyyn)
```

Uusien valokuvien käsittely: luo kansio `lahdekoodi/kuvat_raaka/`, laita
alkuperäiset kuvat sinne ja aja `python3 kasittele_kuvat.py`. Skripti rajaa,
värimäärittelee ja tallentaa ne WebP-muotoon suoraan `sivusto/assets/img/`-kansioon.

**Julkaisu:** kopioi `sivusto/`-kansion sisältö palvelimen juureen. Siinä kaikki.
Toimii sellaisenaan Netlifyssä, Vercelissä, tavallisella web-hotellilla tai
nykyisen palvelimen alikansiossa.

---

## 2. Mitä muokataan ja mistä

### `sivusto/assets/js/content.js` — päivittyvät tiedot

Tämä on tarkoituksella ainoa tiedosto, jota tarvitsee koskea normaalissa ylläpidossa.
Muutos näkyy heti kaikilla sivuilla:

| Mitä | Kohta tiedostossa |
|---|---|
| Aukioloajat | `aukioloajat` |
| Lounaan ajat ja hinta | `lounas` |
| Puhelinnumerot, sähköposti, osoite | tiedoston alku |
| Pöytävarauslinkki | `linkit.varaus` |
| Ruokalistan / tilauksen osoite | `linkit.menuTilaus` |
| Päivän lounaslistan osoite | `linkit.lounaslista` |
| Lahjakortin ostolinkki | `linkit.lahjakortti` |
| Edenred-äänestys | `linkit.edenred` |
| Some-osoitteet | `some` |
| TikTok: tietyt videot (valinnainen) | `tiktokVideot` |
| TikTok-seuraajamäärä | `tiktokSeuraajat` |
| Ajankohtaiset ilmoitukset | `ajankohtaista` |
| Gallerian kuvat ja alt-tekstit | `galleria` |

**Tyhjä osoite ei riko mitään.** Jos linkkiä ei ole, painike ohjaa automaattisesti
puhelinnumeroon tai piiloutuu — sivustolla ei koskaan näy kuollutta linkkiä eikä
keksittyä toimintoa.

### Sivujen tekstit

Tekstit ovat suoraan sivutiedostoissa (`sivusto/meista/index.html` jne.).
Muokkaa niitä tekstieditorilla. Jos muokkaat mieluummin ilman toistuvaa
headeria/footeria, muokkaa `lahdekoodi/sisalto/`-tiedostoja ja aja `python3 build.py`.

---

## 3. Vielä täytettävät kohdat

Sivustolle **ei ole keksitty** yhtään ruokaa, hintaa, arvostelua, palkintoa tai
osoitetta. Alla kohdat, joihin oikea tieto lisätään:

1. **À la carte -lista.** `sivusto/menu/index.html` sisältää valmiin HTML-rakenteen
   kommenttina: kopioi ja täytä annokset ja hinnat. Toistaiseksi painike avaa
   ravintolan nykyisen ruokalistan.
2. **Lounaan hinta** on `content.js`:ssä arvolla `16,00 €`. Tarkista ja päivitä.
3. **Lahjakortin ostolinkki** → `content.js` → `linkit.lahjakortti`.
   Ilman linkkiä painike ohjaa soittamaan.
4. **YouTube-osoite** → `content.js` → `some.youtube`. Tyhjänä ikoni ei näy.
5. **TikTok-seuraajamäärä** → `content.js` → `tiktokSeuraajat`. Päivitä silloin
   tällöin tai jätä tyhjäksi. Videot itsessään päivittyvät automaattisesti.
6. **Lomakkeiden vastaanotto** → `content.js` → `lomakeOsoite`. Katso kohta 5.
7. **Lisää valokuvia.** Sivustolla on kuusi ravintolan valokuvaa useassa
   rajauksessa. Lisää kuvia kansioon `sivusto/assets/img/` ja gallerian listaan
   `content.js`:ssä — ohjeet tiedostossa `sivusto/assets/img/KUVAT.md`.

---

## 4. TikTok-videot etusivulla

Etusivulla on oma osio, joka näyttää **TikTok-profiilin uusimmat videot suoraan
TikTokista**. Osio käyttää TikTokin virallista profiiliupotusta, joten:

- videot päivittyvät itsestään aina kun ravintola julkaisee uuden — koodiin ei
  tarvitse koskea
- videot toistuvat sivulla, käyttäjän ei tarvitse poistua
- upotus latautuu vasta kun kävijä vierittää osioon asti, joten se ei hidasta
  sivun avausta

**Jos haluat näyttää tietyt videot** automaattisen listan sijaan, lisää videoiden
numerotunnukset `content.js`:n kohtaan `tiktokVideot`. Tunnus on videon osoitteen
viimeinen osa:

```
https://www.tiktok.com/@bistroliekki/video/7301234567890123456
                                            └──── tämä ────┘
```

**Jos upotus estyy** — kävijällä on mainostenesto tai hän on kieltänyt evästeet —
sivu näyttää automaattisesti kolme ravintolan omaa kuvaa ja linkin profiiliin.
Tyhjää laatikkoa ei jää koskaan näkyviin.

---

## 5. Lomakkeet

Yhteydenotto-, catering- ja palautelomake ovat rakenteeltaan valmiit ja validoivat
syötteen. Roskapostisuoja on moderni ja näkymätön: piilokenttä + aikatarkistus.
**Ei turvalukua eikä captchaa.**

Lomakkeilla on kaksi tilaa:

- **`lomakeOsoite` tyhjä (nykytila):** lomake avaa käyttäjän sähköpostiohjelman
  valmiiksi täytetyllä viestillä. Toimii heti, ei vaadi palvelinta.
- **`lomakeOsoite` täytetty:** lomake lähettää tiedot suoraan taustapalveluun
  (esim. Formspree, oma PHP-käsittelijä) ilman sivunlatausta. Lisää osoite,
  niin loput toimii itsestään.

---

## 6. Puhelinkäyttö

Sivusto on suunniteltu puhelin edellä, ja mobiilinäkymä on oma sommittelunsa —
ei kutistettu työpöytäversio.

- **Kiinteä toimintopalkki** ruudun alareunassa: *Varaa pöytä* ja soittopainike
  ovat aina peukalon ulottuvilla heti heron jälkeen.
- **Kokoruudun valikko**, jossa jokainen kohde on kosketuskokoinen.
- **Kaikki painettavat kohteet vähintään 44 × 44 px** — myös puhelinnumerot ja
  sähköpostiosoitteet tietolistoissa.
- **Lomakekentät 16 px**, jotta iOS ei zoomaa sivua kenttään napautettaessa.
- **Pääpainikkeet koko leveydeltä** kapealla ruudulla.
- **Oma etusivun kuva pystyruudulle** — koko annos näkyy, ei rajattua palaa.
- **Turva-alueet huomioitu** (lovi ja kotipainikkeen alue).
- **Vaaka-asento** matalalla ruudulla: hero ei täytä koko näkymää.
- **Ei vaakavieritystä** millään leveydellä 320 pikselistä ylöspäin.
- Testattu leveyksillä 320, 360, 390, 430 ja 768 px sekä vaaka-asennossa.

---

## 7. Efektit

Sivustolla on joukko hienovaraisia liikkeitä, joiden tehtävä on saada sivu
tuntumaan huolellisesti tehdyltä. Jokainen niistä on lyhyt ja käyttää vain
selaimelle kevyitä ominaisuuksia (siirto ja läpinäkyvyys), joten sivu pysyy
nopeana myös vanhemmilla puhelimilla.

| Efekti | Missä | Mitä tekee |
|---|---|---|
| **Sivun avaus** | Etusivu, kerran istunnossa | Ravintolan nimi nousee hiilloksesta, kuparinen viiva vetäistään auki ja verho nousee pois. Kesto noin sekunti. Ohitettavissa napauttamalla. |
| **Otsikot sana kerrallaan** | Kaikki pääotsikot | Sanat nousevat näkyviin porrastetusti, kuin ladottuna. |
| **Kuvien verho** | Kaikki isot kuvat | Kuva paljastuu alhaalta ylös nousevan verhon takaa ja asettuu paikalleen hienoisesta lähikuvasta. |
| **Syvyysvaikutelma** | Hero ja täysleveät kuvaosiot | Taustakuva liikkuu hitaammin kuin teksti. |
| **Hiillosnauha** | Etusivu | Hitaasti liukuva typografinen nauha. Pysähtyy, kun hiiri viedään päälle. |
| **Kursorin hehku** | Painikkeet ja kortit | Lämmin hehku syttyy sinne, missä osoitin on. |
| **Kipinät väistävät** | Etusivun hero | Nousevat kipinät työntyvät pehmeästi pois osoittimen tieltä. |
| **Vierityspalkki** | Headerin alareuna | Ohut hiillosviiva kertoo, missä kohtaa sivua ollaan. |
| **Lukujen laskuri** | Meistä, TikTok-osio | Vuosiluku ja seuraajamäärä laskeutuvat paikalleen. |
| **Gallerian zoom** | Galleria | Kuva kasvaa juuri siitä pikkukuvasta, jota napsautettiin. |
| **Sivunvaihto** | Kaikki sivut | Sivut vaihtuvat pehmeästi ristiinhäivyttäen (View Transitions). Selaimissa jotka eivät tue tätä, sivu vaihtuu normaalisti. |

**Kaikki liike kytkeytyy pois**, jos käyttäjä on valinnut käyttöjärjestelmästään
"vähennä liikettä" -asetuksen. Silloin sivusto näyttää saman sisällön ilman
animaatioita — mitään ei jää piiloon.

Kosketuslaitteilla syvyysvaikutelma ja kursorihehku on kytketty pois, koska ne
eivät toimi ilman hiirtä ja kuluttaisivat turhaan akkua.

**Efektin voi poistaa** muokkaamalla `assets/css/style.css` -tiedoston osiota 24
tai poistamalla vastaavan `data-`-määreen sivun HTML:stä (`data-sanat`,
`data-verho`, `data-parallaksi`, `data-esirippu`).

---

## 8. Tekniset ratkaisut

- **Aukiolotila** lasketaan selaimessa Euroopan/Helsingin aikaan riippumatta
  kävijän aikavyöhykkeestä, ja päivittyy minuutin välein.
- **Kuvat** ovat ravintolan omia valokuvia: rajattu, kevyesti värimääritelty
  (lämmin sävy, hienovarainen vinjetti) ja tallennettu WebP-muotoon. Jokaisesta
  on erillinen mobiiliversio, ja heron alapuoliset kuvat lazy-loadataan.
  Etusivun mobiilikuva on sommiteltu erikseen niin, että koko annos näkyy
  pystyruudulla.
- **Kartta** ladataan vasta kun se tulee näkyviin — se ei hidasta sivun avausta.
- **Animaatiot** kunnioittavat `prefers-reduced-motion`-asetusta. Heron kipinät
  pysähtyvät, kun välilehti ei ole näkyvissä, eivätkä käynnisty heikoilla
  mobiililaitteilla.
- **SEO:** jokaisella sivulla oma title ja meta description, Open Graph -tiedot,
  semanttinen HTML, yksi h1 per sivu, alt-tekstit, `sitemap.xml`, `robots.txt`
  ja `Restaurant`-rakenteinen data (JSON-LD) aukioloaikoineen.
- **Saavutettavuus:** näppäimistönavigointi, näkyvät fokusreunat, "siirry
  sisältöön" -linkki, aria-merkinnät, riittävät kosketuskohteet (min. 44 px).
- **Ei ulkoisia kirjastoja.** Ainoa ulkopuolinen resurssi on Google Fonts
  (Fraunces + Instrument Sans), joka ladataan estämättä sivun näkymistä.
  Jos haluat täysin ulkoisitta pyynnöittä: lataa fontit `assets/fonts/`-kansioon
  ja korvaa `<link>`-rivit `@font-face`-määrittelyillä.

---

## 9. Mitä vanhasta sivustosta korjattiin

- Lounaan ajat, kesto ja tilaustapa kerrotaan nyt heti ja kolmesti: elävässä
  tilapalkissa, lounasosiossa ja omalla lounassivulla. Kävijän ei tarvitse
  arvailla, milloin lounasta saa.
- Ei "Gallery Gallery Gallery" -paikkamerkkejä, ei toistuvia sisältöblokkeja,
  ei raakoja HTML-entiteettejä, ei näkyvää turvalukua.
- Asiakaspalautteita **ei** ole nostettu markkinointisisällöksi. Palautelomake
  ohjaa palautteen suoraan ravintolalle, ei julkiseksi arvosteluksi.
- Jokainen navigaation ja CTA:n painike johtaa oikeaan paikkaan.

---

## 10. Nopea tarkistuslista ennen julkaisua

- [ ] Lounaan hinta tarkistettu `content.js`:stä
- [ ] Kuvien alt-tekstit tarkistettu (`content.js` ja sivutiedostot)
- [ ] Lahjakortin linkki lisätty (tai jätetty tarkoituksella puhelinohjaukseen)
- [ ] `lomakeOsoite` asetettu, jos lomakkeet halutaan sähköpostiohjelman sijaan
      suoraan sähköpostiin
- [ ] Verkkotunnus osoittaa uuteen sivustoon
- [ ] `sitemap.xml` lähetetty Google Search Consoleen
