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

Yläreunan välilehdet jakavat sisällön neljään osaan.

### Lounaslista

Tämä on se, joka vaihtuu joka viikko.

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
- **Äänestyslaatikko.** Poista valinta "Näytetään sivustolla", kun äänestys
  on ohi.
- **Työn alla -ilmoitus.** Poista valinta, kun sivusto on valmis.

### Tiedot ja tekstit

Yhteystiedot, linkit, some-osoitteet, saavutukset ja sivujen tekstit.

- Puhelinnumeron soittolinkki muodostuu itsestään — kirjoita numero vain
  kerran.
- Tyhjäksi jätetty some-osoite piilottaa kyseisen kanavan sivustolta.
- Sivujen tekstikentät: tyhjä kenttä tarkoittaa, että sivustolla näkyy
  alkuperäinen teksti. Kirjoita kenttään vain jos haluat muuttaa tekstiä.
- Rivinvaihto tekstikentässä tarkoittaa rivinvaihtoa myös sivulla.

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
| Varasisältö | `sivusto/assets/js/content.js` |

**Tärkeä huomio:** kun osio on kerran tallennettu hallintapaneelista,
tietokannan sisältö voittaa `content.js`:n. Jos siis muokkaat `content.js`:ää
suoraan, muutos ei näy sivustolla ennen kuin sama muutos tehdään myös
paneelista. Sisältömuutokset kannattaa tehdä paneelin kautta.

Oikeudet: kuka tahansa saa lukea sisällön (sivusto tarvitsee sen), mutta
kirjoittaminen vaatii kirjautumisen. Tämä on varmistettu tietokannan omalla
rivitason suojauksella, ei pelkällä käyttöliittymällä.
