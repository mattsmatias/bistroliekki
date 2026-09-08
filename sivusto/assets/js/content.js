/* ==========================================================================
   BISTRO LIEKKI — SISÄLLÖN HALLINTA
   --------------------------------------------------------------------------
   Tämä on ainoa tiedosto, jota tarvitsee muokata kun ravintolan tiedot
   muuttuvat: aukioloajat, puhelinnumerot, linkit, some-osoitteet ja
   ajankohtaiset ilmoitukset. Muutokset näkyvät kaikilla sivuilla heti.

   Tyhjä merkkijono ("") tarkoittaa "ei vielä käytössä": sivusto piilottaa
   painikkeen tai näyttää sen kohteliaana "tulossa" -tilana. Älä poista
   riviä — täytä siihen oikea osoite, kun se on saatavilla.
   ========================================================================== */

window.LIEKKI = {

  /* ---------------------------------------------------------- perustiedot */
  nimi: 'Bistro Liekki',
  iskulause: 'Puuhiiligrilli Tikkurilan sydämessä',
  perustettu: 2016,

  osoite: {
    katu: 'Talvikkitie 30',
    postinumero: '01300',
    kaupunki: 'Vantaa'
  },

  /* Puhelin näkyy sivulla muodossa "puhelin", soitetaan muodossa "puhelinHref" */
  puhelin: '050 470 8530',
  puhelinHref: '+358504708530',

  varausPuhelin: '+358 44 9721307',
  varausPuhelinHref: '+358449721307',

  sahkoposti: 'talvikkitie@bistroliekki.fi',

  /* ---------------------------------------------------------- aukioloajat */
  /* paiva: 0 = sunnuntai … 6 = lauantai. Sulje päivä jättämällä auki: null  */
  aukioloajat: [
    { paiva: 0, nimi: 'Sunnuntai',   auki: null,    kiinni: null    },
    { paiva: 1, nimi: 'Maanantai',   auki: '10:30', kiinni: '22:00' },
    { paiva: 2, nimi: 'Tiistai',     auki: '10:30', kiinni: '22:00' },
    { paiva: 3, nimi: 'Keskiviikko', auki: '10:30', kiinni: '22:00' },
    { paiva: 4, nimi: 'Torstai',     auki: '10:30', kiinni: '22:00' },
    { paiva: 5, nimi: 'Perjantai',   auki: '10:30', kiinni: '23:00' },
    { paiva: 6, nimi: 'Lauantai',    auki: '12:00', kiinni: '23:00' }
  ],

  /* Keittiö sulkeutuu näin monta minuuttia ennen ravintolan sulkemista */
  keittioSulkeutuuEnnen: 45,

  /* ---------------------------------------------------------------- lounas */
  lounas: {
    paivat: [1, 2, 3, 4, 5],          // ma–pe
    paivatTeksti: 'Arkisin ma–pe',
    auki: '10:30',
    kiinni: '15:00',
    /* Tarkista hinta ja päivitä tarvittaessa. Jätä tyhjäksi ("") jos et
       halua näyttää hintaa lainkaan. */
    hinta: '16,00 €',
    hintaLisatieto: ''                // esim. 'Eläkeläiset ja opiskelijat 15,00 €'
  },

  /* ---------------------------------------------------------------- linkit */
  linkit: {
    /* Pöytävaraus — ravintolan käytössä oleva varausjärjestelmä */
    varaus:      'https://operox.fi/book/bistro-liekki',

    /* À la carte -lista / verkkotilaus. Osoittaa toistaiseksi ravintolan
       nykyiseen tilausjärjestelmään — vaihda kun uusi on käytössä. */
    menuTilaus:  'https://bistroliekki.fi/talvikkitie/menu.php',

    /* Päivän lounaslista */
    lounaslista: 'https://bistroliekki.fi/talvikkitie/lunchmenu.php',

    /* Lahjakortin ostolinkki. Lisää osoite kun se on saatavilla. */
    lahjakortti: '',

    /* Edenred — Paras lounas -äänestys. Tyhjennä kun kampanja päättyy. */
    edenred:     'https://paraslounas.edenred.fi/fi/aanesta',

    /* Reittiohjeet ja kartta */
    reittiohjeet: 'https://www.google.com/maps/dir/?api=1&destination=Talvikkitie+30%2C+01300+Vantaa',
    kartta:       'https://www.google.com/maps?q=Talvikkitie+30,+01300+Vantaa&output=embed'
  },

  /* ------------------------------------------------------------------ some */
  some: {
    facebook:  'https://www.facebook.com/BistroLiekkiTalvikkitie',
    instagram: 'https://www.instagram.com/bistroliekkitalvikkitie/',
    tiktok:    'https://www.tiktok.com/@bistroliekki',
    youtube:   ''                     // lisää kanavan osoite kun se on olemassa
  },

  /* --------------------------------------------------------------- tiktok */
  /* Etusivulla näkyy TikTok-profiilin uusimmat videot suoraan TikTokista.
     Lista päivittyy itsestään aina kun ravintola julkaisee uuden videon —
     tähän ei tarvitse koskea.

     Jos haluat näyttää tietyt videot automaattisen listan sijaan, lisää
     videoiden numerotunnukset (osoitteen viimeinen osa) tähän:
       tiktokVideot: [
         { id: '7301234567890123456', teksti: 'Pihvi puuhiilellä' },
         { id: '7309876543210987654', teksti: 'Burger night' }
       ]
     Tyhjä lista = uusimmat videot automaattisesti. */
  tiktokVideot: [],

  /* Seuraajamäärä TikTokissa. Näkyy etusivun TikTok-osiossa.
     Päivitä silloin tällöin, tai jätä tyhjäksi ('') niin lukua ei näytetä.
     Tarkistettu 8.9.2026: 43,2 t. seuraajaa. */
  tiktokSeuraajat: '43 000',

  /* ---------------------------------------------------------- ajankohtaista */
  /* Lisää ilmoitus näin:
       { otsikko: 'Poikkeava aukiolo', teksti: 'Juhannuksena suljettu.',
         alkaa: '2026-06-19', paattyy: '2026-06-21', korosta: true }
     Ilmoitus katoaa automaattisesti "paattyy"-päivän jälkeen.
     Jätä lista tyhjäksi, jos ilmoitettavaa ei ole. */
  ajankohtaista: [],

  /* ------------------------------------------------------------- lomakkeet */
  /* Lomakkeiden vastaanotto-osoite. Kun taustajärjestelmä on käytössä,
     vaihda tähän lomakepalvelun osoite (esim. Formspree, oma PHP-käsittelijä).
     Tyhjänä lomake avaa käyttäjän sähköpostiohjelman esitäytetyllä viestillä. */
  lomakeOsoite: '',

  /* ---------------------------------------------------------------- galleria */
  /* Gallerian kuvat järjestyksessä. Lisää rivi, kun uusi kuva on kopioitu
     kansioon assets/img/. koko: 'iso' = leveä nosto, 'pysty' = pystykuva,
     'vaaka' = tavallinen. Alt-teksti kuvaa lyhyesti mitä kuvassa on. */
  galleria: [
    { kuva: 'assets/img/burgeri-chimichurri.webp', alt: 'Tuplaburgeri puuhiiligrillistä, cheddaria ja punaista kastiketta, vieressä ranskalaiset', koko: 'iso' },
    { kuva: 'assets/img/lounasbuffet.webp',        alt: 'Bistro Liekin lounasbuffet katettuna ravintolasalissa Talvikkitiellä',   koko: 'vaaka' },
    { kuva: 'assets/img/salaattipoyta.webp',       alt: 'Salaattipöydän antimia lounasbuffetissa',                                koko: 'vaaka' },
    { kuva: 'assets/img/pysty-buffet.webp',        alt: 'Lounasbuffetin lämpimät ruoat lähikuvassa',                              koko: 'pysty' },
    { kuva: 'assets/img/burgeri-pekoni.webp',      alt: 'Burgeri pekonilla ja cheddarilla, päällä punainen kastike',              koko: 'vaaka' },
    { kuva: 'assets/img/lammin-poyta.webp',        alt: 'Lämpimiä ruokia lounasbuffetin hauteissa',                               koko: 'vaaka' },
    { kuva: 'assets/img/pysty-burgeri.webp',       alt: 'Burgeri puuhiiligrillistä lähikuvassa',                                  koko: 'pysty' },
    { kuva: 'assets/img/lounas-burgerit.webp',     alt: 'Lounasbuffetin hampurilaiset lämpöhauteissa',                            koko: 'vaaka' }
  ]
};
