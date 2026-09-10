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

  /* Pöytävaraukset hoidetaan samasta numerosta kuin muutkin asiat. */
  varausPuhelin: '050 470 8530',
  varausPuhelinHref: '+358504708530',

  /* Yleinen sähköposti: yhteydenotot, tarjouspyynnöt ja lomakkeet. */
  sahkoposti: 'ravintola@bistroliekki.fi',

  /* Keittiön oma osoite: ruokaa ja keittiötä koskevat palautteet. */
  keittioSahkoposti: 'keittio@bistroliekki.fi',

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
    hintaLisatieto: 'Eläkeläiset ja opiskelijat 15,00 €'
  },

  /* ------------------------------------------------------- lounaslista */
  /* Viikon lounasbuffet. Näkyy Lounas-sivulla heti hero-kuvan alla, ja
     kuluva päivä korostuu automaattisesti.

     PÄIVITTÄMINEN JOKA VIIKKO:
       1. Vaihda "viikko" ja "ajalla".
       2. Vaihda jokaisen päivän "pvm" ja annokset.
       3. Tallenna — muuta ei tarvita.

     Annos kirjoitetaan näin:  { nimi: 'Annoksen nimi', merkit: 'L, G' }
     Merkit voi jättää pois, jos niitä ei ole.

     Jos jätät "paivat"-listan tyhjäksi, sivu näyttää kohteliaan
     "lista päivittyy" -tilan ja ohjaa soittamaan. */
  lounaslista: {
    viikko: '37',
    ajalla: '7.9.–11.9.',
    merkkiselite: 'L = laktoositon · VL = vähälaktoosinen · G = gluteeniton · M = maidoton',
    huomio: 'Pidätämme oikeuden kaikkiin muutoksiin.',

    /* Mitä lounaaseen kuuluu — näkyy listan yläpuolella */
    sisaltyy: [
      'Lämpimät ruoat',
      'Burgerit',
      'Pizzat',
      'Alkupala-leivät',
      'Runsas salaattipöytä',
      'Runsas jälkiruokapöytä',
      'Kahvi ja tee',
      'Vesi, sitrusvesi ja limu'
    ],

    hinnat: [
      { nimi: 'Lounasbuffet',    hinta: '16,00 €' },
      { nimi: 'Eläkeläiset',     hinta: '15,00 €' },
      { nimi: 'Opiskelijat',     hinta: '15,00 €' },
      { nimi: 'Lapset 0–9 v.',   hinta: '1,50 € / ikävuosi' }
    ],

    /* paiva: 1 = maanantai … 5 = perjantai */
    paivat: [
      { paiva: 1, nimi: 'Maanantai', pvm: '7.9.', annokset: [
        { nimi: 'Pariloitua kanaa yrttikastikkeessa', merkit: 'L, G' },
        { nimi: 'Hiiligrillattu lohta hummerikastikkeella', merkit: 'L, G' },
        { nimi: 'Naudan maksaa dijon-sipulikastikkeessa', merkit: 'L, G' },
        { nimi: 'Paistettu kebab tomaattikastikkeessa', merkit: 'M, G' },
        { nimi: 'Täytetyt hodarit', merkit: 'L' },
        { nimi: 'Rapeat wingsit', merkit: 'M, G' },
        { nimi: 'Basmatiriisi', merkit: 'M, G' },
        { nimi: 'Kermaperunat', merkit: 'L, G' },
        { nimi: 'Grilliranskalaiset', merkit: 'M, G' },
        { nimi: 'Päivän pannupizza' },
        { nimi: 'Päivän smash-burgerit', lisa: 'Pyydettäessä L, G, kasvis tai vege' },
        { nimi: 'Sriracha-pekoni smash' },
        { nimi: 'Ranch kanaburger' },
        { nimi: 'Pulledpork burger' }
      ] },

      { paiva: 2, nimi: 'Tiistai', pvm: '8.9.', annokset: [
        { nimi: 'Hiiligrillistä Liekin Aura-lihapullat', merkit: 'L' },
        { nimi: 'Pasta carbonara', merkit: 'L' },
        { nimi: 'Mureaa kanaa teriyaki-kastikkeessa', merkit: 'M, G' },
        { nimi: 'Paistettu kebab tomaattikastikkeessa', merkit: 'M, G' },
        { nimi: 'Täytetyt hodarit', merkit: 'L' },
        { nimi: 'Rapeat wingsit', merkit: 'M, G' },
        { nimi: 'Yrttiperunat', merkit: 'L, G' },
        { nimi: 'Grilliranskalaiset', merkit: 'M, G' },
        { nimi: 'Basmatiriisi', merkit: 'M, G' },
        { nimi: 'Päivän pannupizza' },
        { nimi: 'Päivän smash-burgerit', lisa: 'Pyydettäessä L, G, kasvis tai vege' },
        { nimi: 'Fire demon smash' },
        { nimi: 'Ranch kanaburger' },
        { nimi: 'Pulledpork burger' }
      ] },

      { paiva: 3, nimi: 'Keskiviikko', pvm: '9.9.', annokset: [
        { nimi: 'Liekin buffalo-lasagne', merkit: 'L' },
        { nimi: 'Pariloitua kuhaa ja kasviksia tillipestolla', merkit: 'L' },
        { nimi: 'Mureaa kanaa salsakastikkeessa', merkit: 'L, G' },
        { nimi: 'Paistettu kebab tomaattikastikkeessa', merkit: 'M, G' },
        { nimi: 'Täytetyt hodarit', merkit: 'L' },
        { nimi: 'Rapeat wingsit' },
        { nimi: 'Muusi', merkit: 'L, G' },
        { nimi: 'Basmatiriisi', merkit: 'M, G' },
        { nimi: 'Grilliranskalaiset', merkit: 'M, G' },
        { nimi: 'Päivän pannupizza' },
        { nimi: 'Päivän smash-burgerit', lisa: 'Pyydettäessä L, G, kasvis tai vege' },
        { nimi: 'Teriyaki smash' },
        { nimi: 'Ranch kanaburger' },
        { nimi: 'Pulledpork burger' }
      ] },

      { paiva: 4, nimi: 'Torstai', pvm: '10.9.', annokset: [
        { nimi: 'Hiiligrillattua kanaa kreikkalaisessa kastikkeessa', merkit: 'L, G' },
        { nimi: 'Uunilohta mäti-smetanakastikkeella', merkit: 'L, G' },
        { nimi: 'Ylikypsä kassler Aura-kastikkeella', merkit: 'L, G' },
        { nimi: 'Paistettu kebab tomaattikastikkeessa', merkit: 'M, G' },
        { nimi: 'Täytetyt hodarit', merkit: 'L' },
        { nimi: 'Rapeat wingsit', merkit: 'M, G' },
        { nimi: 'Basmatiriisi', merkit: 'M, G' },
        { nimi: 'Grilliranskalaiset', merkit: 'M, G' },
        { nimi: 'Muusi', merkit: 'L, G' },
        { nimi: 'Päivän pannupizza' },
        { nimi: 'Päivän smash-burgerit', lisa: 'Pyydettäessä L, G, kasvis tai vege' },
        { nimi: 'Salsa nacho smash' },
        { nimi: 'Ranch kanaburger' },
        { nimi: 'Pulledpork burger' }
      ] },

      { paiva: 5, nimi: 'Perjantai', pvm: '11.9.', annokset: [
        { nimi: 'Liekin lihamureke chipotle-kastikkeella', merkit: 'L' },
        { nimi: 'Hiiligrillatut kanavartaat curry-kastikkeella', merkit: 'L, G' },
        { nimi: 'Ylikypsää härkää punaviinissä', merkit: 'M, G' },
        { nimi: 'Paistettu kebab tomaattikastikkeessa', merkit: 'L, G' },
        { nimi: 'Täytetyt hodarit', merkit: 'L' },
        { nimi: 'Rapeat wingsit', merkit: 'M, G' },
        { nimi: 'Ranskalaiset', merkit: 'L, G' },
        { nimi: 'Valkosipuli-kermaperunat', merkit: 'L, G' },
        { nimi: 'Päivän pannupizza' },
        { nimi: 'Päivän smash-burgerit', lisa: 'Pyydettäessä L, G, kasvis tai vege' },
        { nimi: 'Onion lover smash' },
        { nimi: 'Ranch kanaburger' },
        { nimi: 'Pulledpork burger' }
      ] }
    ]
  },

  /* ---------------------------------------------------------------- linkit */
  linkit: {
    /* Pöytävaraukset ja lahjakortit hoituvat Operoxin kautta. Sivustolla ei
       ole omaa varaus- tai ostolomaketta, vaan kaikki painikkeet ohjaavat
       tähän osoitteeseen. */
    varaus:      'https://www.operox.fi/restaurants/bistro-liekki',

    /* À la carte -lista / verkkotilaus. Osoittaa toistaiseksi ravintolan
       nykyiseen tilausjärjestelmään — vaihda kun uusi on käytössä. */
    menuTilaus:  'https://bistroliekki.fi/talvikkitie/menu.php',

    /* Lahjakortin ostolinkki — Operoxin oma lahjakorttisivu. */
    lahjakortti: 'https://www.operox.fi/gift-cards/bistro-liekki',

    /* Reittiohjeet ja kartta */
    reittiohjeet: 'https://www.google.com/maps/dir/?api=1&destination=Talvikkitie+30%2C+01300+Vantaa',
    kartta:       'https://www.google.com/maps?q=Talvikkitie+30,+01300+Vantaa&output=embed'
  },

  /* ------------------------------------------------------------------ some */
  /* Tyhjä osoite ('') piilottaa kyseisen kanavan ikonin ja kortin kokonaan.
     Lisää osoite, niin se ilmestyy sivulle itsestään. */
  some: {
    facebook:  'https://www.facebook.com/BistroLiekkiTalvikkitie',
    instagram: 'https://www.instagram.com/bistroliekkitalvikkitie/',
    tiktok:    'https://www.tiktok.com/@bistroliekki',
    snapchat:  '',                    // esim. https://www.snapchat.com/add/kayttajatunnus
    youtube:   ''                     // lisää kanavan osoite kun se on olemassa
  },

  /* ---------------------------------------------------- some-upotukset */
  /* TikTokin ja Facebookin julkaisut tulevat suoraan kanavilta ja
     päivittyvät itsestään — näihin ei tarvitse koskea.

     Kumpikin upotus piirtyy palvelun omassa vaaleassa ulkoasussa, jota ei
     voi tyylitellä. Jos haluat Facebook-kortin tilalle talon oman tumman
     kortin ja pelkän linkin, vaihda arvoksi false. */
  someUpotukset: {
    facebook: true
  },

  /* -------------------------------------------------------- Instagram */
  /* Instagram ei anna kenenkään upottaa koko profiilia ilmaiseksi, joten
     Instagram-kortti täytetään jollakin näistä kolmesta tavasta. Ylin
     täytetty voittaa.

     1) instagramWidget — päivittyy itsestään, vaatii ilmaisen tilin
        widget-palveluun (esim. lightwidget.com, behold.so, sociablekit.com).
        Palvelu antaa iframe-koodin; liitä tähän vain sen src-osoite:
          instagramWidget: 'https://cdn.lightwidget.com/widgets/xxxx.html'

     2) instagramJulkaisut — näyttää nimetyt julkaisut oikeina
        Instagram-postauksina. Kopioi julkaisun osoite Instagramista
        (Jaa → Kopioi linkki) ja liitä se tähän listaan:
          instagramJulkaisut: [
            'https://www.instagram.com/p/XXXXXXXXXXX/',
            'https://www.instagram.com/reel/YYYYYYYYYYY/'
          ]
        Nämä eivät päivity itsestään — lista on vaihdettava käsin, kun
        haluat kortin näyttävän uudempia julkaisuja.

     3) instagramKuvat — jos kumpikaan yllä ei ole käytössä, kortissa
        näkyvät nämä talon omat kuvat, jotka linkittävät profiiliin. */
  instagramWidget: '',
  instagramJulkaisut: [],

  instagramKuvat: [
    { kuva: 'assets/img/pysty-burgeri.webp', alt: 'Burgeri puuhiiligrillistä' },
    { kuva: 'assets/img/pysty-buffet.webp',  alt: 'Lounasbuffetin lämpimät ruoat' },
    { kuva: 'assets/img/pysty-pekoni.webp',  alt: 'Burgeri pekonilla' },
    { kuva: 'assets/img/burgeri-chimichurri.webp', alt: 'Tuplaburgeri ja ranskalaiset' }
  ],

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

  /* --------------------------------------------------------- äänestys */
  /* Edenredin Suomen Paras Lounas -äänestys. Laatikko näkyy sivun
     alalaidassa heti kun kävijä saapuu, ja hän voi sulkea sen.
     Kun kampanja päättyy, vaihda naytetaan: false. */
  aanestys: {
    naytetaan: true,
    ylatunnus: 'Edenred',
    otsikko: 'Suomen Paras Lounas',
    teksti: 'Olemme mukana äänestyksessä. Käy antamassa äänesi Bistro Liekille — ' +
            'se vie vain hetken.',
    painike: 'Äänestä meitä',
    linkki: 'https://paraslounas.edenred.fi/fi/aanesta'
  },

  /* ------------------------------------------------------ sivusto työn alla */
  /* Ilmoitus, joka kertoo kävijälle että sivusto on vielä kesken.
     Kun sivusto on valmis, vaihda naytetaan: false — ilmoitus katoaa
     kaikilta sivuilta. Kävijä voi myös sulkea sen itse, jolloin se pysyy
     poissa loppukäynnin ajan. */
  tyonAlla: {
    naytetaan: true,
    teksti: 'Sivusto on työn alla. Osa sisällöstä on vielä keskeneräistä, ' +
            'ja tiedot voivat muuttua. Varmistathan ruokalistat ja aukioloajat ' +
            'meiltä suoraan.'
  },

  /* ------------------------------------------------------------ saavutukset */
  /* Tarina-sivun tunnustukset. Uusin vuosi ensin — sivu näyttää ne tässä
     järjestyksessä. Lisää uusi vuosi listan alkuun. */
  saavutukset: [
    { vuosi: '2026', tunnustukset: [
      'Suomen paras burger -kisassa sijalla 19'
    ] },
    { vuosi: '2025', tunnustukset: [
      'Suomen 4. paras lounasravintola',
      'Uudenmaan paras ravintola',
      'Suomen paras burger -kisassa sijalla 17'
    ] },
    { vuosi: '2024', tunnustukset: [
      'Suomen 2. paras lounasravintola',
      'Uudenmaan paras ravintola'
    ] }
  ],

  /* -------------------------------------------------------------- ruokalista */
  /* Menu-sivun osiot. Sisältö on kirjoitettu ravintolan omasta
     BL MENU 2026 -listasta.

     Lisää tai muuta annos näin:
       { ryhma: 'Alkuun', ryhmaLisa: '0,33 l / 0,5 l',
         nimi: 'Annoksen nimi', merkit: 'L, G',
         kuvaus: 'Lyhyt kuvaus', hinta: '00,00 €' }

     ryhma      kokoaa annokset otsikon alle. Sama ryhmänimi peräkkäisillä
                riveillä = yksi otsikko. Vaihda ryhmien järjestystä
                siirtämällä rivejä.
     ryhmaLisa  pieni lisätieto ryhmän otsikon perässä (koko, yksikköhinta).
                Riittää kirjoittaa ryhmän ensimmäiselle riville.
     merkit     ruokavaliomerkinnät, näkyvät nimen perässä pienenä.
     kuvaus     valinnainen. Jätä pois jos annos ei tarvitse kuvausta.
     huomiot    osion lopussa näkyvät huomautukset (lista tekstejä).

     Jos osion annoslista on tyhjä, sivu näyttää kohteliaan "tulossa"
     -tilan ja ohjaa soittamaan tai avaamaan nykyisen listan. */
  menu: {
    /* Merkkien selitykset näkyvät ruokalistan alalaidassa. */
    merkkiselite: 'L = laktoositon · VL = vähälaktoosinen · G = gluteeniton · V = vegaani',

    osiot: [
      /* ============================================================ */
      {
        avain: 'alacarte',
        nimi: 'À la carte',
        kuvaus: 'Puuhiiligrillin inspiroimat annokset, pihvit ja burgerit.',
        linkki: '',
        huomiot: [
          'Kaikki burgerit sisältävät tomaattia, jääsalaattia, pikkelöityä punasipulia, maustekurkkua, talon majoneesia, maalais- tai bataattiranskalaisia ja aiolidippikastikkeen. Pihvit paistetaan puuhiiligrillissä medium-kypsyyteen.',
          'Kerrothan allergioista ja erikoisruokavalioista henkilökunnalle, niin katsotaan yhdessä sopiva vaihtoehto.'
        ],
        annokset: [
          /* ------------------------------------------------ ALKUUN */
          { ryhma: 'Alkuun', nimi: 'Etanapannu — valkosipuli / aurajuustovoi', merkit: 'L',
            kuvaus: '6 kpl. Parmesanjuustolla gratinoidut etanat, valkosipulivoilla tai aurajuustovoilla, sekä grillattua leipää.',
            hinta: '14,50 €' },
          { ryhma: 'Alkuun', nimi: 'Jättikatkaravut — valkosipuli / aurajuustovoi', merkit: 'L',
            kuvaus: '6 kpl. Valkosipulivoissa tai aurajuustovoissa grillattuja jättikatkaravun pyrstöjä, aiolia ja grillattua leipää.',
            hinta: '14,50 €' },
          { ryhma: 'Alkuun', nimi: 'Kantarellikeitto', merkit: 'L',
            kuvaus: 'Kanttarelli, kerma ja grillattua leipää.', hinta: '11,00 €' },
          { ryhma: 'Alkuun', nimi: 'Caesarsalaatti', merkit: 'VL',
            kuvaus: 'Romaine-salaattia, valkosipulikrutonkeja, parmesanjuustoa ja Caesar-kastiketta (kastike sis. kalaa).',
            hinta: '9,50 €' },
          { ryhma: 'Alkuun', nimi: 'Liekin loaded fries', merkit: 'VL, G',
            kuvaus: 'Pekoni, parmesan, tuorechili, juustokastike, persilja.', hinta: '9,50 €' },
          { ryhma: 'Alkuun', nimi: 'Olutpaneroidut mozzarellajuustotikut', merkit: 'VL',
            kuvaus: '5 kpl, paholaisenhilloa.', hinta: '9,50 €' },

          /* ---------------------------------------- SMASH BURGERIT */
          { ryhma: 'Smash burgerit', ryhmaLisa: 'Extra smash-pihvi 5 €',
            nimi: 'Chili smash',
            kuvaus: 'Briossisämpylä, 2 × 70 g rotukarjan smash-pihviä, talon majoneesi, cheddarjuusto, Sriracha-majoneesi, pikkelöity tuore chili, pikkelöity punasipuli, maustekurkku, maustetut maalaisranskalaiset tai bataattiranskalaiset ja aiolimajoneesi dippi.',
            hinta: '21,50 €' },
          { ryhma: 'Smash burgerit', nimi: 'Cheese smash',
            kuvaus: 'Briossisämpylä, 2 × 70 g rotukarjan smash-pihviä, talon majoneesi, cheddarjuusto, Pepper Jack -sulatejuusto, paholaisenmajoneesi, salaatti, tomaatti, pikkelöity punasipuli, maustetut maalaisranskalaiset tai bataattiranskalaiset ja aiolimajoneesi dippi.',
            hinta: '21,50 €' },
          { ryhma: 'Smash burgerit', nimi: 'Bacon smash',
            kuvaus: 'Briossisämpylä, 2 × 70 g rotukarjan smash-pihviä, talon majoneesi, cheddarjuusto, 2 × paistettu pekoni, itse tehty BBQ-kastike, pikkelöity punasipuli, maustekurkku, maustetut maalaisranskalaiset tai bataattiranskalaiset ja aiolimajoneesi dippi.',
            hinta: '21,50 €' },
          { ryhma: 'Smash burgerit', nimi: 'Smoky jalopeno bacon smash',
            kuvaus: 'Briossisämpylä, 2 × 70 g rotukarjan smash-pihviä, 2 × savujuusto, 2 × karamellisoitu pekoni, jalopeno-relish, maustekurkku, savuketsuppi, pikkelöity sipuli, talon majoneesi, maustetut maalaisranskalaiset tai bataattiranskalaiset ja aiolimajoneesi dippi.',
            hinta: '21,50 €' },
          { ryhma: 'Smash burgerit', nimi: 'Blue cheese smash',
            kuvaus: 'Briossisämpylä, 2 × 70 g rotukarjan smash-pihviä, aurajuusto, talon majoneesi, rucola, maustekurkku, paistettu tuore ananas, paholaisenmajoneesi, maustetut maalaisranskalaiset tai bataattiranskalaiset ja aioli majoneesi dippi.',
            hinta: '21,50 €' },
          { ryhma: 'Smash burgerit', nimi: "Nduja pineapple smash",
            kuvaus: "Briossisämpylä, 2 × 70 g rotukarjan smash-pihviä, 2 × savujuusto, paistettu mausteinen 'nduja, talon majoneesi, paistettu tuore ananas, chimichurri-kastike, paahdettu sipuli, maustetut maalaisranskalaiset tai bataattiranskalaiset ja aiolimajoneesi dippi.",
            hinta: '21,50 €' },
          { ryhma: 'Smash burgerit', nimi: 'Threesome smash vati',
            kuvaus: '3 kpl valitsemaanne smash-burgeria ja loaded fries (aioli, parmesanjuusto, persilja, pikkelöity tuore chili).',
            hinta: '60,00 €' },

          /* ------------------------------------- PUUHIILIGRILLISTÄ */
          { ryhma: 'Puuhiiligrillistä', nimi: 'Naudansisäfilepihvi', merkit: 'L, G, FI',
            kuvaus: 'Medium. 150 g / 300 g.', hinta: '27,00 € / 38,00 €' },
          { ryhma: 'Puuhiiligrillistä', nimi: 'Entrecôte', merkit: 'L, G, FI',
            kuvaus: 'Medium. 300 g.', hinta: '28,00 €' },
          { ryhma: 'Puuhiiligrillistä', nimi: 'Naudan lehtipihvi', merkit: 'L, G, FI',
            kuvaus: '180 g.', hinta: '25,00 €' },
          { ryhma: 'Puuhiiligrillistä', nimi: 'Merilohi', merkit: 'L, G, EU',
            kuvaus: '200 g.', hinta: '22,00 €' },
          { ryhma: 'Puuhiiligrillistä', nimi: 'Porsaan BBQ-ribs', merkit: 'L, G, FI',
            kuvaus: 'N. 400 g. Paistettu ananas.', hinta: '21,50 €' },
          { ryhma: 'Puuhiiligrillistä', nimi: 'Maissikana vuohenjuustolla', merkit: 'L, G, EU',
            kuvaus: '170 g. Chimichurri.', hinta: '21,00 €' },
          { ryhma: 'Puuhiiligrillistä', nimi: 'Härkäruukku naudan sisäfilepaloista', merkit: 'L, G, FI',
            kuvaus: '200 g. Valitsemallanne kastikkeella.', hinta: '22,50 €' },

          /* --------------------------------------------- KASTIKKEET */
          { ryhma: 'Kastikkeet', ryhmaLisa: '3,90 € kpl',
            nimi: 'Pippurikastike', merkit: 'L, G', hinta: '3,90 €' },
          { ryhma: 'Kastikkeet', nimi: 'Punaviinikastike', merkit: 'L, G', hinta: '3,90 €' },
          { ryhma: 'Kastikkeet', nimi: 'Béarnaisekastike', merkit: 'L, G', hinta: '3,90 €' },
          { ryhma: 'Kastikkeet', nimi: 'Kantarellikastike', merkit: 'L, G', hinta: '3,90 €' },
          { ryhma: 'Kastikkeet', nimi: 'Hollandaisekastike', merkit: 'L, G', hinta: '3,90 €' },
          { ryhma: 'Kastikkeet', nimi: 'Chimichurri-kastike', merkit: 'V', hinta: '3,90 €' },

          /* --------------------------------------------- MAUSTEVOIT */
          { ryhma: 'Maustevoit', ryhmaLisa: '2,90 € kpl',
            nimi: 'Valkosipuli-sitrusvoi', merkit: 'L, G', hinta: '2,90 €' },
          { ryhma: 'Maustevoit', nimi: 'Aurajuustovoi', merkit: 'L, G', hinta: '2,90 €' },

          /* ---------------------------------------------- LISUKKEET */
          { ryhma: 'Lisukkeet', ryhmaLisa: '5,90 € kpl',
            nimi: 'Kermaperunat', merkit: 'L, G', hinta: '5,90 €' },
          { ryhma: 'Lisukkeet', nimi: 'Valkosipulikermaperunat', merkit: 'L, G', hinta: '5,90 €' },
          { ryhma: 'Lisukkeet', nimi: 'Parmesaanilla maustetut maalaisranskalaiset', merkit: 'L, G', hinta: '5,90 €' },
          { ryhma: 'Lisukkeet', nimi: 'Maustetut maalaisranskalaiset', merkit: 'L, G', hinta: '5,90 €' },
          { ryhma: 'Lisukkeet', nimi: 'Maustetut bataattiranskalaiset', merkit: 'L, G', hinta: '5,90 €' },
          { ryhma: 'Lisukkeet', nimi: 'Caesar-salaatti', merkit: 'L',
            kuvaus: 'Romaine-salaattia, valkosipulikrutonkeja, parmesanjuustoa ja Caesar-kastiketta (kastike sis. kalaa).',
            hinta: '5,90 €' },
          { ryhma: 'Lisukkeet', nimi: 'Talon kasvikset', merkit: 'L, G', hinta: '5,90 €' },
          { ryhma: 'Lisukkeet', nimi: 'Liekin salaatti', merkit: 'VL, G',
            kuvaus: 'Salaatti mix, parmesanjuustoa, rapeaa pekonia ja vinegretteä.', hinta: '5,90 €' },
          { ryhma: 'Lisukkeet', nimi: 'Liekin loaded fries', merkit: 'VL, G',
            kuvaus: 'Pekoni, parmesanjuusto, tuore chili, juustokastike, persilja.', hinta: '8,90 €' },

          /* ----------------------------------------------- SALAATIT */
          { ryhma: 'Salaatit', nimi: 'Caesarsalaatti',
            kuvaus: 'Romaine-salaattia, valkosipulikrutonkeja, parmesanjuustoa ja Caesar-kastiketta (kastike sis. kalaa). Valitsemallanne lisukkeella: halloumijuusto, maissikana, merilohi, aurajuusto tai katkarapu.',
            hinta: '21,60 €' },
          { ryhma: 'Salaatit', nimi: 'Liekin salaatti',
            kuvaus: 'Romaine-salaattia, punasalaattia, marinoitua punasipulia, paahdettuja chilicashewpähkinöitä, kirsikkatomaattia, kurkkua, tuoretta ananasta, vinegretteä ja talon leipää. Valitsemallanne lisukkeella: halloumijuusto, maissikana, merilohi, aurajuusto tai katkarapu.',
            hinta: '21,60 €' },

          /* ------------------------------------------------ BURGERIT */
          { ryhma: 'Burgerit puuhiiligrillistä', nimi: 'Aslan burger',
            kuvaus: 'Puuhiilillä medium grillattu 2 × 200 g rotukarjan pihviä, cheddarjuusto, Pepper Jack -sulatejuusto, pikkelöity tuore chili, itse tehtyä BBQ-kastiketta, maalaisranskalaisia ja aiolidippi.',
            hinta: '28,50 €' },
          { ryhma: 'Burgerit puuhiiligrillistä', nimi: 'Smoky jalapeno burger',
            kuvaus: 'Puuhiilillä medium grillattu 200 g rotukarjan pihvi, savujuusto, jalapeno-relish, savuketsuppi, maalaisranskalaisia ja aiolidippi.',
            hinta: '22,50 €' },
          { ryhma: 'Burgerit puuhiiligrillistä', nimi: 'Tripla juusto burger',
            kuvaus: 'Puuhiilillä medium grillattu 200 g rotukarjan pihvi, 1 cheddarjuusto, 2 Pepper Jack -sulatejuustoa, paholaisen hillo, maalaisranskalaisia ja aiolidippi.',
            hinta: '22,50 €' },
          { ryhma: 'Burgerit puuhiiligrillistä', nimi: 'Talon burger',
            kuvaus: 'Puuhiilillä medium grillattu 200 g rotukarjan pihvi, cheddarjuustoa, pekonia, itse tehtyä BBQ-kastiketta, maalaisranskalaisia ja aiolidippi.',
            hinta: '22,50 €' },
          { ryhma: 'Burgerit puuhiiligrillistä', nimi: 'Vegeburger',
            kuvaus: '1 kpl paneroitu vegepihvi, itse tehtyä BBQ-kastiketta, vegejuustoa, paistettu tuore ananas, chimichurri-kastike, maalaisranskalaisia ja itse tehty BBQ-dippi.',
            hinta: '22,50 €' },
          { ryhma: 'Burgerit puuhiiligrillistä', nimi: 'Kanaburger',
            kuvaus: 'Puuhiilillä grillattu maissikanan rintafilee, vuohenjuusto, paholaisenmajoneesi, maalaisranskalaisia ja aiolidippi.',
            hinta: '22,50 €' },
          { ryhma: 'Burgerit puuhiiligrillistä', nimi: 'Aurajuustoburger',
            kuvaus: 'Puuhiilillä medium grillattu 200 g rotukarjan pihvi, aurajuustoa, paistettu tuore ananas, paholaisenmajoneesia, maalaisranskalaisia ja aiolidippi.',
            hinta: '22,50 €' },
          { ryhma: 'Burgerit puuhiiligrillistä', nimi: 'Puuhiili burgervati',
            kuvaus: '3 valitsemaasi puuhiiliburgeria listaltamme (ei Aslan burger), ' +
                    'jokaisessa 200 g rotukarjapihvi. Lisäksi 300 g puuhiiligrillattua ' +
                    'pihvilihaa ja loaded fries: béarnaise-chilimajoneesi, ' +
                    'parmesaanijuusto, ruohosipuli ja kevätsipuli, aioli sekä talossa ' +
                    'pikkelöity tuore chili.',
            hinta: '75,00 €', hintaLisa: 'norm. 95,00 €' },

          /* --------------------------------------------------- LAPSET */
          { ryhma: 'Lapset', nimi: 'Juustoburgeri', merkit: 'FI',
            kuvaus: '100 g. Rotukarjan pihvi, cheddarjuustoa, majoneesia, ketsuppia, maalaisranskalaisia, salaattia ja tomaattia.',
            hinta: '12,00 €' },
          { ryhma: 'Lapset', nimi: 'Lasten lehtipihvi', merkit: 'FI',
            kuvaus: '100 g. Lehtipihvi, maalaisranskalaisia, maustevoi, salaattia ja kurkkua.',
            hinta: '13,00 €' },
          { ryhma: 'Lapset', nimi: 'Lasten herkkukori', merkit: 'FI',
            kuvaus: '2 kpl nauravaa nakkia, 3 kpl kananugettia, maalaisranskalaisia, ketsuppia, salaattia ja kurkkua.',
            hinta: '12,00 €' },

          /* --------------------------------------------- SUU MAKEAKSI */
          { ryhma: 'Suu makeaksi', nimi: 'Liekin Dumle-suklaakakku',
            kuvaus: 'Vaniljajäätelö, suklaakastike.', hinta: '13,00 €' },
          { ryhma: 'Suu makeaksi', nimi: 'Jäätelöpallo kastikkeella',
            kuvaus: 'Mansikka, vanilja tai suklaa. Valitsemasi kastikkeen kera: mansikka-, suklaa- tai kinuskikastike. Kysy päivän valikoimasta henkilökunnalta.',
            hinta: '7,50 €' },
          { ryhma: 'Suu makeaksi', nimi: 'Sorbetti', merkit: 'V',
            kuvaus: 'Kysy päivän valikoimasta henkilökunnalta.', hinta: '8,50 €' }
        ]
      },

      /* ============================================================ */
      {
        avain: 'brunssi',
        nimi: 'Brunssi',
        /* Brunssilistalla on myös M-merkintä, siksi oma selite. */
        merkkiselite: 'L = laktoositon · VL = vähälaktoosinen · M = maidoton · G = gluteeniton · V = vegaani',
        kuvaus: 'Isänpäiväbrunssi katetaan kolmena kattauksena. Paikat kannattaa varata etukäteen — kattaukset täyttyvät nopeasti.',
        linkki: '',
        /* Tiedot näkyvät osion alussa omassa laatikossaan. */
        tiedot: [
          { avain: 'Päivä',      arvo: 'Sunnuntai 8.11.2026' },
          { avain: 'Kattaukset', arvo: 'Klo 12.00–13.45 · 14.00–15.45 · 16.00–17.45' },
          { avain: 'Hinta',      arvo: '39 € / hlö' },
          { avain: 'Lapset',     arvo: '0–9 v. 2 € / ikävuosi' }
        ],
        huomiot: [
          'Kerrothan allergioista ja erikoisruokavalioista varauksen yhteydessä, niin huomioimme ne kattauksessa.'
        ],
        annokset: [
          /* ------------------------------- ALKURUOKA JA SALAATTIPÖYTÄ */
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Munavoi-piirakka', merkit: 'L' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Savuporo ruisnapit', merkit: 'L' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Kurkku', merkit: 'M, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Tomaatti', merkit: 'M, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Punajuurihummus', merkit: 'M, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Zaziki', merkit: 'L, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Paahdetut rakuunajuurekset', merkit: 'M, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Metsäsieni–yrttisalaatti', merkit: 'L, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Kylmäsavuporo–leipäjuustosalaatti', merkit: 'L, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Granaattiomena–vuohenjuustosalaatti' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Graavilohta sitrusvinegrette', merkit: 'M, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Mausteinen salami-pastasalaatti', merkit: 'L' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Vihersalaatti-sekoitus', merkit: 'M, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Tuore hedelmäsalaatti', merkit: 'M, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Viinilehtikääryleet', merkit: 'L, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Dijon perunasalaatti', merkit: 'M, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Välimeren oliivi–fetajuustosalaatti', merkit: 'L, G' },
          { ryhma: 'Alkuruoka ja salaattipöytä', nimi: 'Savustettu kana–pekoni–Caesar', merkit: 'VL, G' },

          /* ------------------------------------------------ PÄÄRUOAT */
          { ryhma: 'Pääruoat', nimi: 'Ylikypsää naudan brisketiä', merkit: 'M, G',
            kuvaus: 'Tummaa punaviinikastiketta ja kasviksia.' },
          { ryhma: 'Pääruoat', nimi: 'Paahdettua paholaisen kanaa', merkit: 'L, G',
            kuvaus: 'Paistettua vuohenjuustoa.' },
          { ryhma: 'Pääruoat', nimi: 'Chimichurri-marinoitua uunilohta', merkit: 'L, G',
            kuvaus: 'Metsäsienikastikkeessa.' },
          { ryhma: 'Pääruoat', nimi: 'Basmatiriisi', merkit: 'M, G' },
          { ryhma: 'Pääruoat', nimi: 'Tryffeli-perunapyree', merkit: 'L, G' },
          { ryhma: 'Pääruoat', nimi: 'Paneroidut sipulirenkaat', merkit: 'L' },
          { ryhma: 'Pääruoat', nimi: 'Röstiperunat', merkit: 'L, G' },
          { ryhma: 'Pääruoat', nimi: 'Lihapulla-nakki ranskalaiset', merkit: 'L' },
          { ryhma: 'Pääruoat', nimi: 'Ranch kanaburger', merkit: 'L, myös G' },
          { ryhma: 'Pääruoat', nimi: 'Pekoni-kananmuna burger', merkit: 'L, myös G' },
          { ryhma: 'Pääruoat', nimi: 'Pannupizza',
            kuvaus: 'Pepperoni, aura, sipuli.' },

          /* ---------------------------------------------- JÄLKIRUOAT */
          { ryhma: 'Jälkiruoat', nimi: 'Mustikkapannukakut', merkit: 'L',
            kuvaus: 'Vaniljakastike (L) ja mansikkahillo (M, G).' },
          { ryhma: 'Jälkiruoat', nimi: 'Liekin suklaakakku', merkit: 'L' },
          { ryhma: 'Jälkiruoat', nimi: 'Mansikka pannacotta', merkit: 'L, G' },
          { ryhma: 'Jälkiruoat', nimi: 'Mintturahka', merkit: 'L, G' },
          { ryhma: 'Jälkiruoat', nimi: 'Tuoreet hedelmät vaniljakastikkeella', merkit: 'G' },
          { ryhma: 'Jälkiruoat', nimi: 'Keksisekoitus', merkit: 'L' },
          { ryhma: 'Jälkiruoat', nimi: 'Karkkisekoitus', merkit: 'L, G' },

          /* --------------------------------------------- RUOKAJUOMAT */
          { ryhma: 'Ruokajuomat', nimi: 'Appelsiinimehu' },
          { ryhma: 'Ruokajuomat', nimi: 'Omenamehu' },
          { ryhma: 'Ruokajuomat', nimi: 'Limubuffet' },
          { ryhma: 'Ruokajuomat', nimi: 'Vesi' }
        ]
      },
      /* ============================================================ */
      {
        avain: 'juomat',
        nimi: 'Juomat',
        kuvaus: 'Oluet, siiderit, viinit, kahvit ja väkevät.',
        linkki: '',
        huomiot: [
          'Anniskelemme alkoholijuomia vain 18 vuotta täyttäneille. Kysy päivän valikoimasta henkilökunnalta.'
        ],
        annokset: [
          /* ------------------------------------------------- HANASTA */
          { ryhma: 'Hanasta', ryhmaLisa: '0,33 l / 0,5 l',
            nimi: 'Karhu III', kuvaus: '4,6 %', hinta: '7,50 € / 8,50 €' },
          { ryhma: 'Hanasta', nimi: 'Kronenburg 1664 Blanc', kuvaus: '5 %', hinta: '8,00 € / 9,90 €' },
          { ryhma: 'Hanasta', nimi: 'Brooklyn Lager', kuvaus: '5,2 %', hinta: '8,50 € / 10,00 €' },

          /* -------------------------------------------- PULLO-OLUET */
          { ryhma: 'Pullo-olut', ryhmaLisa: '0,33 l',
            nimi: 'Karhu IV', kuvaus: '5,3 %', hinta: '7,60 €' },
          { ryhma: 'Pullo-olut', nimi: 'Corona', kuvaus: '4,5 %', hinta: '7,60 €' },

          { ryhma: 'Pullo-olut 0,5 l', nimi: 'Budvar vaalea', kuvaus: '5 %', hinta: '9,90 €' },
          { ryhma: 'Pullo-olut 0,5 l', nimi: 'Budvar tumma', kuvaus: '4,7 %', hinta: '9,90 €' },
          { ryhma: 'Pullo-olut 0,5 l', nimi: 'Ginger Joe 0,33 l', kuvaus: '4 %', hinta: '9,00 €' },

          /* ------------------------------------- SIIDERIT / LONKEROT */
          { ryhma: 'Siiderit ja lonkerot', ryhmaLisa: '0,33 l',
            nimi: 'Crowmoor Extra Dry', kuvaus: '4,7 %', hinta: '8,60 €' },
          { ryhma: 'Siiderit ja lonkerot', nimi: 'Somersby Pear', kuvaus: '4,5 %', hinta: '8,60 €' },
          { ryhma: 'Siiderit ja lonkerot', nimi: 'Somersby Apple', kuvaus: '4,5 %', hinta: '8,60 €' },
          { ryhma: 'Siiderit ja lonkerot', nimi: 'Original lonkero', kuvaus: '5,5 %', hinta: '8,60 €' },
          { ryhma: 'Siiderit ja lonkerot', nimi: 'Original karpalo lonkero', kuvaus: '5,5 %', hinta: '8,60 €' },
          { ryhma: 'Siiderit ja lonkerot', nimi: 'Original ananas lonkero', kuvaus: '5,5 %', hinta: '8,60 €' },
          { ryhma: 'Siiderit ja lonkerot', nimi: 'Original lemonade lonkero', kuvaus: '5,5 %', hinta: '8,60 €' },

          /* ---------------------------------------- ALKOHOLITTOMAT */
          { ryhma: 'Alkoholittomat', ryhmaLisa: '0,33 l / 0,5 l',
            nimi: 'Limu', hinta: '3,60 € / 5,00 €' },
          { ryhma: 'Alkoholittomat', nimi: 'Mehu', hinta: '3,60 € / 5,00 €' },
          { ryhma: 'Alkoholittomat', nimi: 'Kukko Lager', kuvaus: '0 %', hinta: '7,00 €' },

          /* ------------------------------------------ KUUMAT JUOMAT */
          { ryhma: 'Kuumat juomat', nimi: 'Kahvi / tee', hinta: '3,50 €' },
          { ryhma: 'Kuumat juomat', nimi: 'Kaakao', hinta: '4,50 €' },
          { ryhma: 'Kuumat juomat', nimi: 'Erikoiskahvit', hinta: '4,50 €' },
          { ryhma: 'Kuumat juomat', nimi: 'Cappuccino', hinta: '5,00 €' },
          { ryhma: 'Kuumat juomat', nimi: 'Cafe latte', hinta: '5,00 €' },
          { ryhma: 'Kuumat juomat', nimi: 'Espresso', hinta: '4,50 €' },

          /* -------------------------------- KUUMAT ALKOHOLIJUOMAT */
          { ryhma: 'Kuumat alkoholijuomat', nimi: 'Irish coffee', hinta: '11,60 €' },
          { ryhma: 'Kuumat alkoholijuomat', nimi: 'Amaretto coffee', hinta: '11,60 €' },
          { ryhma: 'Kuumat alkoholijuomat', nimi: 'French coffee', hinta: '11,60 €' },
          { ryhma: 'Kuumat alkoholijuomat', nimi: 'Finlandia coffee', hinta: '11,00 €' },
          { ryhma: 'Kuumat alkoholijuomat', nimi: 'Lumumba', hinta: '12,10 €' },
          { ryhma: 'Kuumat alkoholijuomat', nimi: 'Minttu kaakao', hinta: '11,00 €' },

          /* --------------------------------- VISKIT JA KONJAKIT */
          { ryhma: 'Viskit ja konjakit', nimi: 'Chivas Regal 18YO', hinta: '16,40 €' },
          { ryhma: 'Viskit ja konjakit', nimi: 'Jack Daniels', hinta: '8,70 €' },
          { ryhma: 'Viskit ja konjakit', nimi: 'Jack Daniels Honey', hinta: '8,70 €' },
          { ryhma: 'Viskit ja konjakit', nimi: 'Jameson', hinta: '9,50 €' },
          { ryhma: 'Viskit ja konjakit', nimi: 'Laphroaig', kuvaus: 'Single malt.', hinta: '10,90 €' },
          { ryhma: 'Viskit ja konjakit', nimi: 'Cognac VS', hinta: '8,70 €' },
          { ryhma: 'Viskit ja konjakit', nimi: 'Cognac VSOP', hinta: '11,00 €' },
          { ryhma: 'Viskit ja konjakit', nimi: 'Cognac XO', hinta: '18,70 €' },
          { ryhma: 'Viskit ja konjakit', nimi: 'Calvados Berneroy XO', hinta: '9,80 €' },

          /* --------------------------------------------- KUOHUVAT */
          { ryhma: 'Kuohuvat', nimi: 'Soligo Prosecco Brut',
            kuvaus: 'Italia. Erittäin kuiva, keskihapokas, ryhdikäs. Rypäleet: Glera.',
            hinta: '12,00 € / 20 cl' },
          { ryhma: 'Kuohuvat', nimi: 'Jaume Serra Cava Brut',
            kuvaus: 'Espanja. Kuiva, kypsän ananaksinen, maukas.', hinta: '42,90 € / 75 cl' },
          { ryhma: 'Kuohuvat', nimi: 'Rene Schloesser Brut Shampagne',
            kuvaus: 'Ranska. Kuiva, raikkaan hedelmäinen, hienostunut. Rypäleet: Pinot Noir, Chardonnay, Pinot Meunier.',
            hinta: '86,90 € / 75 cl' },

          /* ------------------------------------------ VALKOVIINIT */
          { ryhma: 'Valkoviinit', ryhmaLisa: '16 cl / 75 cl',
            nimi: 'Lobo Loco Macabeo',
            kuvaus: 'Espanja. Kuiva valkoviini, jonka tuoksussa on runsaasti kukkaisia aromeja. Maku on sopivan hapokas sekä kevyen greippinen.',
            hinta: '9,50 € / 30,00 €' },
          { ryhma: 'Valkoviinit', nimi: 'Invenioi Riesling',
            kuvaus: 'Saksa. Rypäle: Riesling. Tuoksussa kukkaisuutta ja sitrusmaisuutta. Maku kuiva, raikas ja tasapainoinen, hieman Rieslingille tyypillistä mineraalisuutta. Ruokapari: merenelävät, salaatit, kasvisruoka.',
            hinta: '12,00 € / 49,00 €' },
          { ryhma: 'Valkoviinit', nimi: 'Tommasi Le Rosse Pinot Grigio',
            kuvaus: 'Italia. Kuiva, päärynäinen, pirteä.', hinta: '13,50 € / 64,90 €' },

          /* -------------------------------------------- ROSEVIINIT */
          { ryhma: 'Roseviinit', ryhmaLisa: '16 cl / 75 cl',
            nimi: 'Weingut Frank Herrnbaumgarten Rosé',
            kuvaus: 'Itävalta. Kuiva, täyteläinen, runsaan marjaisa. Rypäleet: Pinot Noir, Zweigelt, Merlot.',
            hinta: '12,00 € / 53,90 €' },

          /* -------------------------------------------- PUNAVIINIT */
          { ryhma: 'Punaviinit', ryhmaLisa: '16 cl / 75 cl',
            nimi: 'Lobo Loco Tempranillo',
            kuvaus: 'Espanja. Helposti juotava punaviini, jonka tuoksussa on runsaasti mansikkaa. Kevyen hapokas, marjaisen mansikkainen, jälkimaku silkkisen pehmeä.',
            hinta: '9,50 € / 30,00 €' },
          { ryhma: 'Punaviinit', nimi: 'Butchers Cut Premium Malbec',
            kuvaus: 'Argentiina. Tuoksu runsaan hedelmäinen, melko intensiivinen ja mustasävytteinen paahteisin aromein. Maku keskitäyteläinen, runsaan hedelmäinen ja maukas, tasapainoinen. Pehmeän tanniininen, miellyttävän hapankirsikkainen hapokkuus.',
            hinta: '13,10 € / 53,90 €' },
          { ryhma: 'Punaviinit', nimi: 'Rocca Grande Passolo Rosso Salento',
            kuvaus: 'Italia. Täyteläinen, mausteisen runsas, kypsytetty tammitynnyrissä 6 kk. Rypäleet: Negroamaro, Primitivo.',
            hinta: '13,80 € / 64,90 €' },
          { ryhma: 'Punaviinit', nimi: 'Pyros Barrel Selected Syrah',
            kuvaus: 'Argentiina. Täyteläinen, maukas, runsaan hedelmäinen.', hinta: '82,50 €' }
        ]
      }
    ]
  },
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
