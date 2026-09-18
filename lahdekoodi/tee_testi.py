#!/usr/bin/env python3
"""
Rakentaa site/testi.html: etusivun uusi ulkoasu koekayttoa varten.

Sivu kayttaa samaa ylapalkkia, alatunnistetta, tyylitiedostoa ja
site.js:aa kuin oikea sivusto, joten se nayttaa tasmalleen silta milta
se nayttaisi julkaistuna. Paalle tulevat vain assets/css/testi.css ja
assets/js/testi.js. Kaikki sisalto luetaan content.js:sta eli samasta
lahteesta kuin muukin sivusto — mitaan tietoa ei keksita.

Huom: build.py tyhjentaa site/-kansion juuren, joten tama skripti
ajetaan aina buildin JALKEEN.
"""
import re, pathlib, hashlib

TYO = pathlib.Path(__file__).resolve().parent
INDEX = (TYO / 'site' / 'index.html').read_text(encoding='utf-8')

# --- palat oikealta etusivulta -------------------------------------------
HEAD = INDEX[INDEX.index('<head>') + len('<head>'):INDEX.index('</head>')]
YLA = INDEX[INDEX.index('<body>') + len('<body>'):INDEX.index('<main id="sisalto">')]
ALA = INDEX[INDEX.index('</main>') + len('</main>'):INDEX.index('</body>')]

# Restaurant Gurun tunnustusmerkki siirretaan alatunnisteesta arviolohkoon:
# se on oikea tunnustus ja kuuluu sinne, missa vierailija punnitsee
# luotettavuutta. Merkin oma koodi sailyy sellaisenaan.
MERKKI = ''
_ma = ALA.find('<div class="tunnusmerkki" data-tunnusmerkki>')
if _ma > -1:
    _ml = ALA.index('</div>\n      </div>', _ma) + len('</div>\n      </div>')
    MERKKI = ALA[_ma:_ml]
    ALA = ALA[:_ma] + ALA[_ml:]

# some-osio otetaan sellaisenaan nykyiselta etusivulta, jottei mitaan
# toiminnallisuutta katoa koeversiossa
SOME = INDEX[INDEX.index('<!-- =============================================================== SOME -->'):
             INDEX.index('<!-- ====================================================== AJANKOHTAISTA -->')].rstrip()

# --- head: testisivu ei kuulu hakukoneisiin ------------------------------
HEAD = HEAD.replace('<meta name="robots" content="index, follow, max-image-preview:large">',
                    '<meta name="robots" content="noindex, nofollow">')
HEAD = re.sub(r'<title>.*?</title>',
              '<title>Bistro Liekki — etusivun uusi ulkoasu (koeversio)</title>', HEAD, count=1)
HEAD = HEAD.replace('<link rel="canonical" href="https://bistroliekki.fi/">', '')

# Fontit vaihtuvat: Fraunces + Instrument Sans -> Bodoni Moda + Jost.
# Ladataan samalla tavalla kuin sivustolla muutenkin, jotta mittaus ja
# latausjarjestys pysyvat samana.
VANHA_FONTTI = 'family=Fraunces:opsz,wght@9..144,300..700&family=Instrument+Sans:wght@400;500;600'
UUSI_FONTTI = 'family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Jost:wght@300;400;500;600'
HEAD = HEAD.replace(VANHA_FONTTI, UUSI_FONTTI)
# Versiotunnus tiedoston sisallosta. Ilman tata selain nayttaa vanhaa
# tyylitiedostoa valimuistista, vaikka sivu olisi paivittynyt — juuri
# siksi koeversio nautti samalta vaikka se oli muuttunut.
def versio(polku):
    return hashlib.sha1((TYO / 'site' / polku).read_bytes()).hexdigest()[:8]

V_CSS = versio('assets/css/testi.css')
V_JS = versio('assets/js/testi.js')

HEAD = re.sub(r'(<link rel="stylesheet" href="assets/css/style\.css[^"]*">)',
              r'\1\n<link rel="stylesheet" href="assets/css/testi.css?v=' + V_CSS + '">',
              HEAD, count=1)

# --- loppu: oma skripti site.js:n jalkeen --------------------------------
ALA = ALA.replace('<script src="assets/js/site.js',
                  '<script src="assets/js/testi.js?v=' + V_JS + '" defer></script>\n'
                  '<script src="assets/js/site.js')

NUOLI = ('<svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">'
         '<path d="M9 1l4 4-4 4M13 5H0" stroke="currentColor" stroke-width="1.4" '
         'stroke-linecap="square"/></svg>')
SOITA = ('<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
         '<path d="M21 16.4v2.6a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 '
         '19.8 0 011 3.2 2 2 0 013 1h2.6a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L6.7 '
         '8.9a16 16 0 006 6l1.3-1.1a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" '
         'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" '
         'stroke-linejoin="round"/></svg>')
SIJAINTI = ('<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
            '<path d="M12 22s7-6.1 7-11a7 7 0 10-14 0c0 4.9 7 11 7 11z" stroke="currentColor" '
            'stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.6" '
            'stroke="currentColor" stroke-width="1.6"/></svg>')

MAIN = '''<main id="sisalto">

<!-- ================================================================ HERO -->
<!-- Kuva, hiilipedin hehku ja kipinakangas ovat omissa kerroksissaan,
     jotta vieritysmoottori voi liikuttaa niita eri nopeuksilla. -->
<section class="t-hero">
  <div class="t-hero__media" data-t-parallaksi>
    <picture>
      <source media="(max-width: 700px)" srcset="assets/img/hero-sm.webp">
      <img src="assets/img/hero.webp"
           alt="Bistro Liekin burgeri puuhiiligrillistä: kaksi pihviä, sulanutta juustoa ja punaista kastiketta, vieressä ranskalaiset"
           width="2000" height="1125" fetchpriority="high" decoding="async">
    </picture>
  </div>
  <div class="t-hero__peite"></div>
  <div class="t-hero__lampo" aria-hidden="true"></div>
  <canvas class="t-hero__hiillos" data-t-hiillos aria-hidden="true"></canvas>
  <div class="t-hero__rae" aria-hidden="true"></div>

  <div class="kuori t-hero__sisus" data-t-hero-sisus>
    <p class="t-hero__kicker">Puuhiiligrilli Tikkurilassa · Vuodesta 2016</p>
    <h1 data-t-syty-heti>Bistro Liekki</h1>
    <p class="t-hero__lead">Hiillos antaa lihalle rapean pinnan ja sen maun,
      jota kaasugrilli ei osaa jäljitellä.</p>

    <div class="napit t-hero__napit">
      <a class="nappi t-hehkunappi" data-linkki="varaus" data-tyhjana="Varaa puhelimitse"
         data-vara-href="varaus-puhelin" href="#"><span>Varaa pöytä</span></a>
      <a class="nappi nappi--ääriviiva" href="menu/"><span>Katso ruokalista</span></a>
    </div>

    <!-- Yksi todellinen tunnustus. Sisalto tulee saavutuksista; jos
         niita ei ole, koko rivi poistuu sivulta. -->
    <p class="t-hero__todiste" data-t-todiste hidden></p>

    <div class="t-hero__fakta">
      <div data-tila>
        <p class="t-fakta__nimi">Juuri nyt</p>
        <p class="t-fakta__arvo">
          <span class="t-fakta__piste" aria-hidden="true"></span><span data-tila-otsikko>Aukiolotieto</span>
        </p>
        <p class="t-fakta__nimi" style="margin-top:.3rem;letter-spacing:.06em;text-transform:none"
           data-tila-aika></p>
      </div>
      <div>
        <p class="t-fakta__nimi">Lounas</p>
        <p class="t-fakta__arvo"><span data-teksti="lounas-paivat"></span>
          <span data-teksti="lounas-aika"></span></p>
      </div>
      <div>
        <p class="t-fakta__nimi">Osoite</p>
        <p class="t-fakta__arvo"><a data-href="sijainti" href="yhteystiedot/"><span data-teksti="katu"></span>, <span data-teksti="postitoimi"></span></a></p>
      </div>
      <div>
        <p class="t-fakta__nimi">Varaukset</p>
        <p class="t-fakta__arvo"><a data-href="puhelin" href="#" data-teksti="puhelin"></a></p>
      </div>
    </div>
  </div>

  <div class="t-hero__kutsu" aria-hidden="true"><span>Selaa</span><i></i></div>
</section>

<!-- ========================================================= ILMOITUSPALKKI -->
<div class="ilmoituspalkki" data-ilmoituspalkki hidden>
  <div class="kuori ilmoituspalkki__rivi">
    <strong data-ilmoitus-otsikko></strong>
    <span data-ilmoitus-teksti></span>
  </div>
</div>

<!-- ========================================================= TUNNUSTUKSET -->
<!-- Sisalto tulee content.js:n saavutukset-listasta. Jos lista tyhjenee,
     koko kaista poistuu sivulta itsestaan. -->
<section class="t-tunnustukset" aria-label="Tunnustukset" data-t-tunnustukset hidden>
  <div class="kuori">
    <div class="t-tunnustukset__rivi" data-t-tunnustukset-rivi></div>
  </div>
</section>

<!-- =============================================================== TÄNÄÄN -->
<section class="osio t-osio" aria-labelledby="tanaan">
  <div class="kuori">
    <div class="t-otsikkorivi" data-t-esiin>
      <div class="t-otsikkorivi__teksti">
        <p class="t-etiketti">Tänään</p>
        <h2 class="otsikko-l" id="tanaan" data-t-syty>Lounas ja aukiolo</h2>
      </div>
      <a class="linkki" href="lounas/">Koko viikon lounaslista __NUOLI__</a>
    </div>

    <div class="t-tanaan">
      <article class="t-kortti t-kortti--korosta" data-t-esiin data-t-lounas>
        <div class="t-kortti__ylä">
          <h3 class="t-kortti__otsikko">Tänään lounaalla</h3>
          <p class="t-kortti__lisa" data-t-lounas-pvm></p>
        </div>
        <div data-t-lounas-sisus style="padding-top:clamp(.9rem,2vw,1.2rem)"></div>
        <div class="t-kortti__ala">
          <div class="napit">
            <a class="nappi nappi--hiljainen" href="lounas/"><span>Viikon lista</span></a>
          </div>
        </div>
      </article>

      <article class="t-kortti" data-t-esiin style="--i:1">
        <div class="t-kortti__ylä">
          <h3 class="t-kortti__otsikko">Aukioloajat</h3>
          <p class="t-kortti__lisa">Talvikkitie 30</p>
        </div>
        <ul class="aukiolot t-aukiolo" data-aukiolot style="padding-top:clamp(.9rem,2vw,1.2rem)"></ul>
        <p class="leipa" style="font-size:.8rem;color:var(--bone-4);margin-top:1rem" data-teksti="keittio"></p>
        <div class="t-kortti__ala">
          <ul class="t-hinnat">
            <li><span class="t-avain">Lounas</span><span class="t-arvo"><strong data-teksti="lounas-hinta"></strong></span></li>
          </ul>
        </div>
      </article>
    </div>
  </div>
</section>

<div class="t-rako" data-t-esiin aria-hidden="true"></div>

<!-- ======================================================== HIILLOS-KAISTA -->
<section class="t-kaista t-osio" aria-labelledby="grilli">
  <div class="t-kaista__media">
    <picture>
      <source media="(max-width: 700px)" srcset="assets/img/grill-flame-sm.webp">
      <img src="assets/img/grill-flame.webp" alt="Liekit nousevat puuhiilestä"
           loading="lazy" decoding="async" width="2000" height="1400">
    </picture>
  </div>
  <div class="t-kaista__peite"></div>
  <div class="t-kaista__raot" aria-hidden="true"><i></i><i></i><i></i></div>
  <span class="t-kaista__leima" aria-hidden="true">HIILLOS</span>

  <div class="kuori" data-t-esiin>
    <p class="t-etiketti" style="justify-content:center">Talon tapa</p>
    <h2 class="otsikko-xl" id="grilli" data-t-syty>Aito puuhiiligrilli</h2>
    <p class="t-kaista__lead">Pihvit ja burgerit paistetaan hiilloksen päällä.
      Se antaa lihalle rapean pinnan ja sen maun, jota kaasugrilli ei osaa
      jäljitellä.</p>

    <div class="t-kaista__faktat">
      <div class="t-kaista__fakta">
        <p class="t-kaista__luku"><span data-t-luku="2016">2016</span></p>
        <p class="t-kaista__selite">Tikkurilassa vuodesta</p>
      </div>
      <div class="t-kaista__fakta">
        <p class="t-kaista__luku">Puuhiili</p>
        <p class="t-kaista__selite">Ei kaasua</p>
      </div>
      <div class="t-kaista__fakta">
        <p class="t-kaista__luku" data-teksti="lounas-aika"></p>
        <p class="t-kaista__selite">Lounas arkisin</p>
      </div>
    </div>
  </div>
</section>

<!-- ================================================================ NAUHA -->
<div class="nauha" aria-hidden="true">
  <div class="nauha__rata">
    <span>Puuhiiligrilli <b>&bull;</b> Tikkurila <b>&bull;</b> Vuodesta 2016 <b>&bull;</b> À la carte <b>&bull;</b> Lounas arkisin <b>&bull;</b> Catering <b>&bull;</b></span>
    <span>Puuhiiligrilli <b>&bull;</b> Tikkurila <b>&bull;</b> Vuodesta 2016 <b>&bull;</b> À la carte <b>&bull;</b> Lounas arkisin <b>&bull;</b> Catering <b>&bull;</b></span>
  </div>
</div>

<!-- ============================================================= TARJONTA -->
<!-- Kolme korttia: kaksi ruokalistan ryhmaa ja lounas. Kortit
     rakennetaan testi.js:ssa content.js:n todellisesta ruokalistasta,
     joten nimet, merkinnat ja hinnat ovat samat kuin Menu-sivulla. -->
<section class="osio osio--char t-osio" aria-labelledby="tarjonta">
  <div class="kuori">
    <div class="t-otsikkorivi" data-t-esiin>
      <div class="t-otsikkorivi__teksti">
        <p class="t-etiketti">Pöytään</p>
        <h2 class="otsikko-l" id="tarjonta" data-t-syty>Kolme tapaa syödä Liekissä</h2>
        <p class="leipa">Hiilloksen burgerit, grillin pihvit ja arkipäivien
          lounasbuffet. Koko lista alkupaloista jälkiruokiin löytyy
          Menu-sivulta.</p>
      </div>
      <a class="linkki" href="menu/">Koko ruokalista __NUOLI__</a>
    </div>

    <div class="t-tarjonta" data-t-tarjonta></div>
  </div>
</section>

<!-- ========================================================= VAAKAGALLERIA -->
<!-- Leveilla ruuduilla kuvat liukuvat sivusuunnassa vierityksen mukana.
     Kapealla sama rata vieritetaan sormella. Kuvat content.js:sta. -->
<section class="t-vaaka t-osio" aria-labelledby="galleria">
  <div class="t-vaaka__kehys" data-t-ratakehys>
    <div class="t-vaaka__tahmea">
      <div class="kuori t-vaaka__ylä" data-t-esiin>
        <div class="t-otsikkorivi" style="margin-bottom:0">
          <div class="t-otsikkorivi__teksti">
            <p class="t-etiketti">Kuvia</p>
            <h2 class="otsikko-l" id="galleria" data-t-syty>Tunnelmaa Liekistä</h2>
          </div>
          <a class="linkki" href="galleria/">Koko galleria __NUOLI__</a>
        </div>
      </div>
      <div class="t-rata" data-t-rata></div>
    </div>
  </div>
</section>

<!-- ========================================================== VARAA PÖYTÄ -->
<section class="band band--keskellä t-osio" data-parallaksi aria-labelledby="varaus">
  <div class="band__media">
    <img src="assets/img/band-embers.webp" alt="" aria-hidden="true"
         loading="lazy" decoding="async" width="1800" height="900">
  </div>
  <div class="band__peite"></div>

  <div class="kuori">
    <div class="band__sisus" data-t-esiin>
      <h2 class="otsikko-l" id="varaus" data-t-syty>Varaa pöytä</h2>
      <p class="ingressi" style="margin-top:1.4rem">Varaukset onnistuvat verkossa tai puhelimitse.</p>
      <div class="napit" style="margin-top:2rem">
        <a class="nappi t-hehkunappi" data-linkki="varaus" data-tyhjana="Varaa puhelimitse"
           data-vara-href="varaus-puhelin" href="#"><span>Varaa verkossa</span></a>
        <a class="nappi nappi--ääriviiva" data-href="varaus-puhelin" href="#">
          __SOITA__<span data-teksti="varaus-puhelin"></span></a>
      </div>
    </div>
  </div>
</section>

<!-- ============================================== CATERING JA LAHJAKORTTI -->
<section class="osio t-osio" aria-label="Catering ja lahjakortti">
  <div class="kuori">
    <div class="t-pari">
      <article class="t-pari__kortti" data-t-esiin>
        <h3>Puuhiilen maut<br>juhliin</h3>
        <p>Kerro tilaisuudestasi, niin suunnitellaan sopiva kokonaisuus yhdessä.</p>
        <a class="linkki" href="catering/">Kysy cateringista __NUOLI__</a>
      </article>

      <article class="t-pari__kortti" data-t-esiin style="--i:1">
        <h3>Anna lahjaksi<br>maut ja tunnelma</h3>
        <p>Lahjakortti käy illalliseen hiilloksen äärellä tai lounaaseen keskellä viikkoa.</p>
        <a class="linkki" data-linkki="lahjakortti" data-tyhjana="Kysy lahjakortista"
           data-vara-href="puhelin" href="#"><span>Lahjakortti</span> __NUOLI__</a>
      </article>
    </div>
  </div>
</section>

<!-- ===================================================== GOOGLE-ARVOSTELUT -->
<section class="osio osio--tiivis viiva-ylä t-osio" aria-labelledby="google-arviot">
  <div class="kuori">
    <div class="t-arviot" data-t-esiin>
      <p class="etiketti etiketti--keskellä">Asiakkaiden arviot</p>
      <h2 class="otsikko-m" id="google-arviot">Mitä Googlessa sanotaan</h2>
      <p class="leipa t-arviot__lead">Arviot kertovat enemmän kuin mikään lupaus.
        Käy lukemassa, mitä vieraamme sanovat — tai jätä oma arviosi.</p>
      <div data-google style="margin-top:clamp(1.6rem,3vw,2.2rem)"></div>
      __MERKKI__
    </div>
  </div>
</section>

__SOME__

<!-- ========================================================= AJANKOHTAISTA -->
<section class="osio osio--tiivis" aria-labelledby="ajankohtaista" data-uutisosio hidden>
  <div class="kuori">
    <p class="etiketti">Ajankohtaista</p>
    <h2 class="otsikko-m" id="ajankohtaista">Uutiset ja poikkeukset</h2>
    <div class="uutiset" data-uutiset></div>
  </div>
</section>

<!-- ========================================================== LÖYDÄ MEIDÄT -->
<section class="osio osio--char viiva-ylä t-osio" aria-labelledby="loyda">
  <div class="kuori t-loyda">
    <div data-t-esiin>
      <div class="kartta" data-kartta>
        <div class="tyhja-tila" style="border:0;min-height:340px;display:grid;place-content:center">Kartta latautuu…</div>
      </div>
    </div>

    <div data-t-esiin style="--i:1">
      <p class="t-etiketti">Käynti</p>
      <h2 class="otsikko-m" id="loyda">Löydä meidät</h2>

      <ul class="t-hinnat" style="margin-top:1.6rem">
        <li><span class="t-avain">Osoite</span><span class="t-arvo"><strong data-teksti="katu"></strong>, <span data-teksti="postitoimi"></span></span></li>
        <li><span class="t-avain">Puhelin</span><span class="t-arvo"><a data-href="puhelin" href="#" data-teksti="puhelin"></a></span></li>
        <li><span class="t-avain">Sähköposti</span><span class="t-arvo"><a data-href="sahkoposti" href="#" data-teksti="sahkoposti"></a></span></li>
      </ul>

      <div class="napit" style="margin-top:1.8rem">
        <a class="nappi nappi--hiljainen" data-href="puhelin" href="#">__SOITA__<span>Soita meille</span></a>
        <a class="nappi nappi--hiljainen" data-linkki="reittiohjeet" href="#">__SIJAINTI__<span>Reittiohjeet</span></a>
      </div>
    </div>
  </div>
</section>

</main>'''

MAIN = (MAIN.replace('__NUOLI__', NUOLI)
            .replace('__SOITA__', SOITA)
            .replace('__SIJAINTI__', SIJAINTI)
            .replace('__SOME__', SOME)
            .replace('__MERKKI__', MERKKI))

SIVU = ('<!doctype html>\n<html lang="fi">\n<head>' + HEAD + '</head>\n<body>' +
        YLA + MAIN + ALA + '</body>\n</html>\n')

(TYO / 'site' / 'testi.html').write_text(SIVU, encoding='utf-8')
print('site/testi.html kirjoitettu,', len(SIVU), 'merkkia')
