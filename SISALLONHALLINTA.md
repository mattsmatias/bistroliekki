# Bistro Liekki — sisällönhallinta

Ravintola voi päivittää sivuston sisällön itse selaimella. Mitään ohjelmaa ei
tarvitse asentaa, eikä kenenkään tarvitse koskea koodiin.

**Osoite:** https://bistroliekki.fi/hallinta/

Kannattaa tallentaa osoite kirjanmerkkeihin tai puhelimen aloitusnäytölle.

---

## Kirjautuminen

Kirjautuminen tapahtuu sähköpostilla ja salasanalla. Tunnus on ravintolan
yhteinen — sama tunnus käy kaikilla, jotka päivittävät sivustoa.

Selain muistaa kirjautumisen, joten joka kerta ei tarvitse kirjoittaa
salasanaa uudelleen. Yhteiskäytössä olevalla koneella kannattaa silti
kirjautua ulos työvuoron päätteeksi.

**Salasanan vaihto:** Tili-välilehti → Vaihda salasana. Salasanassa on oltava
vähintään 10 merkkiä. Vaihda salasana heti ensimmäisellä kirjautumisella, ja
aina kun joku lopettaa työt.

---

## Mitä voi muokata

Vasemman reunan valikko (kapealla ruudulla yläreunan välilehdet) jakaa
sisällön osiin.

### Yleiskatsaus

Tämä avautuu ensimmäisenä kirjautumisen jälkeen. Siinä on kaksi asiaa:

**Kävijäluvut vertailuineen.** Neljä lukua: tänään, eilen, 7 päivää ja tässä
kuussa. Iso luku on näyttökertoja eli avattuja sivuja, pienempi teksti kertoo
käyntien määrän. Vihreä ▲ tai punainen ▼ kertoo, miten luku on kehittynyt
edelliseen yhtä pitkään jaksoon verrattuna.

> Kuukausivertailussa kuluvaa kuukautta verrataan **edellisen kuukauden yhtä
> moneen ensimmäiseen päivään**, ei koko edelliseen kuukauteen. Muuten
> kuukauden alussa vertailu näyttäisi aina rajulta romahdukselta.

Alla on pylväskaavio viimeiseltä 30 päivältä. Tarkemmat luvut ja
suosituimmat sivut löytyvät Kävijät-välilehdeltä.

**Tilanne.** Lista siitä, mikä vaatii huomiota juuri nyt:

- Onko lounaslista kuluvalta viikolta
- Montako ilmoitusta on näkyvissä, ja onko joukossa vanhentuneita
- Onko "Työn alla" -ilmoitus vielä päällä
- Onko äänestyslaatikko vielä päällä
- Onko Google-arvosana täytetty

Vihreä merkki tarkoittaa että asia on kunnossa, oranssi että se kannattaa
tarkistaa ja punainen että se vaatii toimia. Jokaisen rivin **Avaa**-napista
pääsee suoraan oikeaan kohtaan.

### Lounaslista

Tämä on se, joka vaihtuu joka viikko. Listan saa kahdella tavalla: tuomalla
Canvasta tai kirjoittamalla käsin.

#### Nopein tapa: tuo Canva-lista

1. Vie viikon lista Canvasta **PDF-muodossa** (Share → Download → PDF).
2. Paina hallintapaneelissa **Valitse tiedosto** ja valitse PDF.
3. Lista luetaan tiedostosta ja näytetään yhteenvetona: montako päivää ja
   annosta löytyi, ja mitä kussakin päivässä lukee.
4. Tarkista yhteenveto. Jos lukemisessa oli epävarmuutta, ne kohdat
   luetellaan punaisella erikseen.
5. Paina **Täytä kentät tällä listalla**. Kentät täyttyvät, mutta mitään ei
   vielä tallenneta.
6. Käy kentät läpi ja paina **Tallenna**.

PNG- ja JPG-kuvat kelpaavat myös, mutta PDF on tarkin: siinä teksti on
yleensä oikeana tekstinä eikä vain kuvana, jolloin lukeminen ei voi mennä
väärin.

> **Tarkista aina ruokavaliomerkinnät.** Kone lukee listan puolestasi, mutta
> se voi lukea väärin tai pudottaa merkinnän. Merkintöjä (L, VL, G, M, V)
> lukevat ihmiset, joilla on allergioita, joten vilkaise ne alkuperäisestä
> listasta ennen tallennusta. Kone on ohjeistettu jättämään epäselvä merkintä
> mieluummin pois kuin arvaamaan sen.

#### Käsin kirjoittaen

1. Vaihda **viikon numero** ja **päivämäärät**.
2. Vaihda jokaisen päivän **päivämäärä**.
3. Kirjoita päivän annokset tekstikenttään, **yksi annos riviä kohden**.

Annoksen merkinnät kirjoitetaan pystyviivan jälkeen:

```
Kermaperunat | L, G
Pariloitua kanaa yrttikastikkeessa | L, G
Päivän pannupizza
```

Jos annoksella on lisäselite, se tulee toisen pystyviivan jälkeen. Merkinnän
paikan voi jättää tyhjäksi:

```
Päivän smash-burgerit |  | Pyydettäessä L, G, kasvis tai vege
```

Tyhjäksi jätetty päivä katoaa sivulta kokonaan — näin esimerkiksi arkipyhän
saa pois listalta.

Samalta välilehdeltä muokataan myös lounaan hinnat ja luettelo siitä, mitä
lounaaseen sisältyy.

### Ruokalista

À la carte, brunssi ja juomat. Annokset on jaettu ryhmiin, esimerkiksi
"Alkuun" ja "Smash burgerit". Avaa ryhmä otsikosta, niin sen annokset tulevat
näkyviin.

Jokaisella annoksella on nimi, hinta, merkinnät ja kuvaus. Hinnan voi
kirjoittaa vapaasti, esimerkiksi `21,50 €` tai `27,00 € / 38,00 €`.

Uusia annoksia ja ryhmiä saa lisättyä painikkeilla. Rivejä voi järjestää
nuolinapeilla ja poistaa ruksista.

### Aukiolo ja ilmoitukset

- **Aukioloajat.** Merkitse "Suljettu", jos päivä on kiinni.
- **Lounasaika ja hinnat.**
- **Ajankohtaiset ilmoitukset.** Esimerkiksi poikkeusaukiolo jouluna.
  Kirjoita alkamis- ja päättymispäivä muodossa `2026-12-24`, niin ilmoitus
  katoaa sivustolta itsestään päättymispäivän jälkeen.
  - **Kuva (vapaaehtoinen).** Kaksi tapaa:
    - *"Valitse valmiista kuvista"* avaa kuvaruudukon, jossa on kaksi ryhmää:
      - **Ravintolan omat kuvat** — sivustolla jo olevat valokuvanne: liekit,
        hiillos, burgerit, lounasbuffet, salaattipöytä ja lämmin pöytä sekä
        muutama pystykuva. Nämä ovat teidän omianne, joten niissä ei ole
        mitään käyttöehtoja.
      - **Ilmaiskuvat — Unsplash** — seitsemän tunnelmakuvaa (hiillosta,
        liekkejä, grillattavaa lihaa, hämärä ravintolasali). Unsplash-lisenssi
        sallii käytön myös kaupallisesti ilman lupaa ja ilman mainintaa.
        Näissä ei näy teidän omaa ruokaanne, joten ne sopivat parhaiten
        tunnelmakuviksi — esimerkiksi aukiolo- tai tapahtumailmoitukseen.
        Kuvaajan nimi näkyy ruudussa. Kuvat haetaan Unsplashin palvelimelta,
        eli ne eivät vie tilaa omasta sivustostanne; jos Unsplash ei jostain
        syystä vastaa, ilmoitus näkyy pelkkänä tekstinä eikä rikkinäisenä
        kuvana.

      Kummassakin ryhmässä valinta täyttää myös kuvatekstin valmiiksi.
    - *"Lataa oma kuva"* poimii kuvan puhelimen tai koneen kuvista. Kuva
      pienennetään automaattisesti, joten isokin puhelinkuva kelpaa
      sellaisenaan. Kirjoita vielä "Mitä kuvassa näkyy" -kenttään lyhyt
      kuvaus — se näkyy näkövammaisille ja silloin, jos kuva ei lataudu.

    Kuvaa ei rajata, joten juliste tai grafiikka säilyy luettavana. Ilman
    kuvaa ilmoitus näkyy pelkkänä tekstinä; se on ihan yhtä hyvä tapa.
  - **Linkki (vapaaehtoinen).** Jos ilmoituksesta pitää päästä eteenpäin —
    äänestykseen, tapahtumasivulle tai vaikka omalle catering-sivulle —
    liitä osoite tähän. "Linkin teksti" on painikkeen teksti; tyhjänä siinä
    lukee "Lue lisää".
  - **Korosta ilmoitus.** Nostaa ilmoituksen esiin oranssilla reunaviivalla.
    Kannattaa käyttää säästeliäästi, korkeintaan yhteen ilmoitukseen
    kerrallaan.

  Jokainen ilmoitus on sivustolla oma laatikkonsa: kuva ylhäällä koko
  laatikon leveydeltä, otsikko ja teksti sen alla. Laatikko on tasan
  sisältönsä korkuinen, joten lyhyt ilmoitus pysyy lyhyenä.

- **Äänestyslaatikko.** Poista valinta "Näytetään sivustolla", kun äänestys
  on ohi.
- **Työn alla -ilmoitus.** Poista valinta, kun sivusto on valmis.

### Tiedot ja tekstit

Yhteystiedot, linkit, some-osoitteet, saavutukset ja sivujen tekstit.

- Puhelinnumeron soittolinkki muodostuu itsestään — kirjoita numero vain
  kerran.
- Tyhjäksi jätetty some-osoite piilottaa kyseisen kanavan sivustolta.
- **Google-arvostelut.** Arvosana ja arvostelujen määrä kirjoitetaan käsin.
  Katso ne Google Mapsista ja kirjoita samassa muodossa kuin Google näyttää
  ne, esimerkiksi `4,6` ja `312`. Osio näkyy etusivulla ja Yhteys-sivulla.
  Osio näkyy myös ilman arvosanaa — silloin siinä on vain napit
  "Lue arvostelut" ja "Arvostele meidät". **Arvosana ja tähdet ilmestyvät
  siihen vasta kun luku on täytetty**, joten sivulla ei voi missään
  vaiheessa näkyä keksittyä tai paikkaa pitävää arvosanaa. Luku ei päivity
  itsestään — käy päivittämässä se esimerkiksi kerran kuussa.

  > Miksei arvosana päivity automaattisesti? Googlen käyttöehdot kieltävät
  > arvostelujen tallentamisen, joten ne pitäisi hakea Googlelta uudelleen
  > jokaisella sivulatauksella. Se maksaisi kävijämäärän mukaan ja hidastaisi
  > sivua. Käsin ylläpidetty luku on tähän tarkoitukseen kevyempi ja
  > ilmainen.
- Sivujen tekstikentät: tyhjä kenttä tarkoittaa, että sivustolla näkyy
  alkuperäinen teksti. Kirjoita kenttään vain jos haluat muuttaa tekstiä.
- Rivinvaihto tekstikentässä tarkoittaa rivinvaihtoa myös sivulla.

### Kävijät

Näyttää, montako kävijää sivustolla käy. Luvut päivittyvät jatkuvasti; mitään
ei tarvitse itse kirjata.

- **Käynnit** = montako kertaa sivustolle tultiin. Jos sama ihminen selaa
  peräkkäin etusivun, lounaan ja menun, se on **yksi käynti**.
- **Näyttökerrat** = montako sivua kaikkiaan avattiin. Tämä luku on aina
  käyntejä suurempi tai yhtä suuri.
- Yhteenvedossa näkyy tänään, eilen, 7 päivää ja 30 päivää sekä keskiarvo
  päivässä.
- Pylväskaavio näyttää käynnit päivittäin viimeiseltä 30 päivältä.
- **Mistä kävijät tulevat** kertoo, minkä kanavan kautta sivustolle tultiin:
  Instagram, Facebook, TikTok, YouTube, Google-haku, Google Maps, sähköposti
  ja niin edelleen. Tämän avulla näkee, mikä kanava tuo asiakkaita ja mihin
  mainontaa kannattaa laittaa.
- Alimpana on lista siitä, mitkä sivut keräävät eniten katseluita.

#### Mistä kävijät tulevat — mitä rivit tarkoittavat

Kanava tunnistetaan siitä, miltä sivulta kävijä klikkasi linkkiä. Kirjaus
tehdään kerran selailukertaa kohden, ensimmäisellä avatulla sivulla.

- **Suoraan osoitteella** = kävijä kirjoitti osoitteen itse, avasi
  kirjanmerkin tai tuli linkistä, joka ei kerro mistä se tuli. Sovellusten
  omat selaimet (etenkin Instagram ja Facebook) jättävät tämän tiedon usein
  pois, joten osa somesta päätyy tälle riville.
- **Muu sivusto** = tunnistettu linkki, mutta ei mikään seuratuista
  kanavista.

**Merkitse mainoslinkit.** Koska sovellusten selaimet piilottavat lähteen,
maksetut mainokset ja somepostaukset kannattaa linkittää merkinnällä
`?utm_source=` — silloin kanava luetaan suoraan osoitteesta eikä sitä
tarvitse arvata:

```
https://bistroliekki.fi/?utm_source=instagram
https://bistroliekki.fi/lounas/?utm_source=facebook
https://bistroliekki.fi/?utm_source=tiktok
https://bistroliekki.fi/?utm_source=google
```

Lyhenteet `ig`, `fb`, `yt` ja `tt` toimivat myös. Merkintä näkyy kävijälle
vain osoiterivillä eikä vaikuta sivun toimintaan. Osoitteesta tallennetaan
vain kanavan nimi, ei koko linkkiä.

Päivä vaihtuu Suomen ajan mukaan keskiyöllä. Luvut alkavat kertyä siitä
hetkestä, kun laskuri otettiin käyttöön — aiempaa historiaa ei ole.

**Hallintapaneelin omat käynnit eivät näy tilastossa**, joten ravintolan oma
työ ei sotke lukuja. Sivuston selaaminen omalla puhelimella näkyy kyllä
käyntinä.

> **Tietosuoja.** Laskuri kirjaa vain päivän, sivun ja lukumäärän — sekä
> kanavan nimen valmiilta listalta (`instagram`, `google`, `suora`…).
> Viittaavaa osoitetta ei tallenneta sellaisenaan missään vaiheessa.
> Se ei kerää evästeitä, IP-osoitteita, sijaintia eikä mitään
> muutakaan, mistä yksittäisen kävijän voisi tunnistaa. Tiedot ovat teidän
> omassa tietokannassanne, eivät kenenkään ulkopuolisen palvelimella. Tästä
> syystä sivusto ei tarvitse evästebanneria. (Tämä ei ole juridinen
> lausunto — jos sivustolle joskus lisätään esimerkiksi Facebook-pikseli tai
> Google Analytics, tilanne muuttuu ja banneri tarvitaan.)

---

## Tallentaminen

Alareunan palkki kertoo, onko tallentamattomia muutoksia.

- **Tallenna** kirjoittaa muutokset. Ne näkyvät sivustolla heti — sivustoa ei
  tarvitse julkaista uudelleen.
- **Peru muutokset** hylkää kaiken tallentamattoman ja hakee sisällön
  uudelleen.

Jos selaimen sulkee tallentamatta, selain varoittaa ensin.

### Jos jokin menee pieleen

Tili-välilehdeltä löytyy **Palauta edellinen versio**. Paina "Hae
muutoshistoria", niin näet viimeisimmät tallennukset osioittain, ja voit
palauttaa haluamasi version yhdellä napilla. Jokaisesta osiosta säilytetään
30 viimeisintä versiota.

---

## Miten tämä toimii

Sivusto on tavallinen staattinen sivusto, joka toimii ilman tietokantaa.
Sisältö haetaan tietokannasta sivun latautuessa ja tallennetaan selaimen
muistiin, jotta seuraava sivunlataus on välitön.

Jos tietokantaa ei jostain syystä tavoiteta, sivusto näyttää sivustoon
sisäänrakennetun sisällön. **Sivusto ei siis mene rikki, vaikka tietokanta
olisi hetken pois käytöstä** — silloin näkyy vain hieman vanhempi sisältö.

---

## Ylläpitäjälle

| Asia | Missä |
|---|---|
| Tietokanta | Supabase, projekti `bistroliekki`, alue eu-north-1 (Tukholma) |
| Taulut | `sisalto` (nykyinen sisältö), `muutosloki` (30 viimeisintä versiota) |
| Käyttäjätunnukset | Supabase → Authentication → Users |
| Yhteysasetukset | `sivusto/assets/js/asetukset.js` |
| Hallintapaneeli | `lahdekoodi/staattiset/hallinta/` |
| Canva-listan luku | Edge Function `lue-lounaslista` |
| Tekoälyavain | Supabase → Edge Functions → Secrets → `ANTHROPIC_API_KEY` |
| Kävijälaskuri | Taulu `julkinen_kavijat` + funktio `kirjaa_kaynti`, koodi `tietokanta/kavijalaskuri.sql` |
| Kävijälähteet | Taulu `julkinen_lahteet` + funktio `kirjaa_lahde`, koodi `tietokanta/kavijalahteet.sql` |
| Varasisältö | `sivusto/assets/js/content.js` |

**Tärkeä huomio:** kun osio on kerran tallennettu hallintapaneelista,
tietokannan sisältö voittaa `content.js`:n. Jos siis muokkaat `content.js`:ää
suoraan, muutos ei näy sivustolla ennen kuin sama muutos tehdään myös
paneelista. Sisältömuutokset kannattaa tehdä paneelin kautta.

Oikeudet: kuka tahansa saa lukea sisällön (sivusto tarvitsee sen), mutta
kirjoittaminen vaatii kirjautumisen. Tämä on varmistettu tietokannan omalla
rivitason suojauksella, ei pelkällä käyttöliittymällä.

### Canva-listan luku

PDF avataan selaimessa. Jos tiedostossa on oikea tekstikerros, lähetetään
palvelimelle pelkkä teksti — se on tarkka ja halpa. Jos teksti on litistetty
kuvaksi, ensimmäinen sivu renderöidään kuvaksi ja lähetetään sellaisena.

Edge Function `lue-lounaslista` kysyy tekoälyltä, mitä listassa lukee, ja
palauttaa sen jäsenneltynä. Funktio tarkistaa itse, että kutsuja on
kirjautunut käyttäjä — pelkkä julkinen avain ei riitä.

Avain asetetaan Supabasen hallintanäkymässä kohdassa Edge Functions →
Secrets, nimellä `ANTHROPIC_API_KEY`. Mallin voi vaihtaa `MALLI`-nimisellä
salaisuudella; oletus on `claude-sonnet-5`. Kustannus on muutamia senttejä
viikossa, koska kutsuja tulee yksi viikossa.
