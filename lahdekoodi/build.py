#!/usr/bin/env python3
"""
BISTRO LIEKKI — sivuston koostaja.

Yhdistää yhteisen kehyksen (head, headeri, footeri) ja sivukohtaisen sisällön
kansiosta `sisalto/` valmiiksi staattisiksi HTML-sivuiksi kansioon `site/`.

Käyttö:  python3 build.py
"""
import os
import re
import shutil
import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "sisalto")
OUT = os.path.join(ROOT, "site")

DOMAIN = "https://bistroliekki.fi"

NAV = [
    ("", "Etusivu"),
    ("meista", "Tarina"),
    ("menu", "Menu"),
    ("lounas", "Lounas"),
    ("catering", "Catering"),
    ("galleria", "Galleria"),
    # Lahjakortit myydään Operoxin kautta, joten valikko ohjaa suoraan sinne.
    ("linkki:lahjakortti", "Lahjakortti"),
    ("yhteystiedot", "Yhteys"),
]

# Palaute on yhdistetty Yhteys-sivuun; /palaute/ jää ohjaussivuksi, jottei
# vanhat linkit hajoa. Sitä ei enää näytetä valikoissa.
FOOTER_NAV = NAV

PAGES = [
    dict(slug="", file="etusivu.html",
         title="Bistro Liekki — Puuhiiligrilli Tikkurilan sydämessä | Ravintola Vantaa",
         desc="Bistro Liekki on puuhiiligrilli Tikkurilan keskustassa vuodesta 2016. "
              "Lounasbuffet arkisin 10:30–15, laaja à la carte, catering ja pöytävaraukset. "
              "Talvikkitie 30, Vantaa.",
         og="hero.webp"),
    dict(slug="meista", file="meista.html",
         title="Tarina — Bistro Liekki | Puuhiiligrilli Tikkurilassa vuodesta 2016",
         desc="Bistro Liekki Puuhiiligrilli on tarjonnut kodikkaan ja rennon ruokailuhetken "
              "Tikkurilan keskustassa vuodesta 2016. Ravintolan ylpeys on puuhiiligrilli.",
         og="lounasbuffet.webp"),
    dict(slug="menu", file="menu.html",
         title="Menu — Bistro Liekki | À la carte, pikkujoulu, brunssi ja juomat",
         desc="Bistro Liekin ruokalistat yhdessä paikassa: à la carte, pikkujoulu, brunssi "
              "ja juomat. Puuhiiligrilli Tikkurilan keskustassa, Vantaalla.",
         og="burgeri-pekoni.webp"),
    dict(slug="lounas", file="lounas.html",
         title="Lounas Tikkurilassa — Bistro Liekki | Lounasbuffet arkisin 10:30–15",
         desc="Suosittu lounasbuffet arkisin klo 10:30–15 Tikkurilan keskustassa. "
              "Katso viikon lounaslista ja tule syömään Talvikkitielle, Vantaalle.",
         og="lounas-burgerit.webp"),
    dict(slug="catering", file="catering.html",
         title="Catering Vantaa — Bistro Liekki | Puuhiiligrillin maut juhliin",
         desc="Bistro Liekki tuo puuhiiligrillin maut myös juhliin ja tapahtumiin "
              "Vantaalla ja pääkaupunkiseudulla. Kysy tarjousta cateringista.",
         og="lammin-poyta.webp"),
    dict(slug="galleria", file="galleria.html",
         title="Galleria — Bistro Liekki | Tunnelmaa Tikkurilan puuhiiligrillistä",
         desc="Kuvia Bistro Liekin puuhiiligrillistä, annoksista ja ravintolan tunnelmasta "
              "Tikkurilassa, Vantaalla. Katso hiillos, pihvit, burgerit ja ravintolasali.",
         og="burgeri-chimichurri.webp"),
    dict(slug="lahjakortti", file="lahjakortti.html",
         title="Lahjakortti — Bistro Liekki",
         desc="Bistro Liekin lahjakortit ostetaan varausjärjestelmän kautta.",
         og="salaattipoyta.webp", noindex=True),
    dict(slug="yhteystiedot", file="yhteystiedot.html",
         title="Yhteys — Bistro Liekki | Palaute, tarjouspyyntö ja yhteystiedot",
         desc="Ota yhteyttä Bistro Liekkiin: anna palautetta tai pyydä tarjous. "
              "Talvikkitie 30, 01300 Vantaa. Puhelin 050 470 8530, aukioloajat ja kartta.",
         og="lounasbuffet.webp"),
    dict(slug="palaute", file="palaute.html",
         title="Palaute — Bistro Liekki",
         desc="Palautelomake löytyy nyt Bistro Liekin Yhteys-sivulta.",
         og="band-embers.webp", noindex=True),
    dict(slug="vahvista-poytavaraus", file="vahvista-poytavaraus.html",
         title="Pöytävarauksen vahvistus — Bistro Liekki",
         desc="Pöytävarauksen vahvistussivu. Bistro Liekki, Talvikkitie 30, 01300 Vantaa. "
              "Pöytävaraukset puhelimitse 050 470 8530.",
         og="band-embers.webp", noindex=True),
]

# --------------------------------------------------------------------- ikonit
ICONS = {
    "nuoli": '<svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true">'
             '<path d="M9 1l4 4-4 4M13 5H0" stroke="currentColor" stroke-width="1.4" '
             'stroke-linecap="square"/></svg>',
    "facebook": '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
                '<path d="M14 8.5V6.9c0-.8.2-1.2 1.4-1.2H17V2.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v1.8H8v3.2h2.5V21H14v-9.3h2.5l.4-3.2H14z"/>'
                '</svg>',
    "instagram": '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
                 '<rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.7"/>'
                 '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/>'
                 '<circle cx="17.4" cy="6.6" r="1.2" fill="currentColor"/></svg>',
    "tiktok": '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
              '<path d="M16.6 2h-3.1v13.1a2.7 2.7 0 11-2.3-2.7v-3.2a5.9 5.9 0 105.4 5.9V9.3a7 7 0 004 1.3V7.5a4 4 0 01-4-4V2z"/>'
              '</svg>',
    "youtube": '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
               '<path d="M22.5 7.2a2.7 2.7 0 00-1.9-1.9C18.9 4.8 12 4.8 12 4.8s-6.9 0-8.6.5A2.7 2.7 0 001.5 7.2 28 28 0 001 12a28 28 0 00.5 4.8 2.7 2.7 0 001.9 1.9c1.7.5 8.6.5 8.6.5s6.9 0 8.6-.5a2.7 2.7 0 001.9-1.9A28 28 0 0023 12a28 28 0 00-.5-4.8zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z"/>'
               '</svg>',
    "soita": '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
             '<path d="M21 16.4v2.6a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 011 3.2 2 2 0 013 1h2.6a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L6.7 8.9a16 16 0 006 6l1.3-1.1a2 2 0 012.1-.5c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" '
             'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    "posti": '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
             '<rect x="2.5" y="4.5" width="19" height="15" rx="2" stroke="currentColor" stroke-width="1.6"/>'
             '<path d="M3 6l9 6.5L21 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    "sijainti": '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">'
                '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" stroke="currentColor" stroke-width="1.6"/>'
                '<circle cx="12" cy="10" r="2.8" stroke="currentColor" stroke-width="1.6"/></svg>',
    "toisto": '<svg width="17" height="19" viewBox="0 0 17 19" fill="currentColor" aria-hidden="true">'
              '<path d="M16 8.6a1 1 0 010 1.8L2 18.8A1 1 0 010 18V1a1 1 0 011.5-.9L16 8.6z"/></svg>',
    "sulje": '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">'
             '<path d="M1 1l14 14M15 1L1 15" stroke="currentColor" stroke-width="1.5"/></svg>',
    "vasen": '<svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true">'
             '<path d="M10 1L2 9l8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>',
    "oikea": '<svg width="12" height="18" viewBox="0 0 12 18" fill="none" aria-hidden="true">'
             '<path d="M2 1l8 8-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>',
}


def nav_href(slug, depth):
    up = "../" * depth
    if slug == "":
        return up if depth else "./"
    return f"{up}{slug}/"


def nav_linkki(slug, label, luokka="", tyyli=""):
    """Valikkolinkki. Slug muotoa "linkki:avain" ohjaa content.js:n
    ulkoiseen osoitteeseen (esim. lahjakortti -> Operox)."""
    l = f' class="{luokka}"' if luokka else ""
    s = f' style="{tyyli}"' if tyyli else ""
    if slug.startswith("linkki:"):
        avain = slug.split(":", 1)[1]
        return (f'<a{l}{s} data-linkki="{avain}" data-tyhjana="Soita ja kysy" '
                f'data-vara-href="puhelin" href="#"><span>{label}</span></a>')
    return f'<a{l}{s} href="{{HREF}}">{label}</a>'


def build_header(current, depth):
    up = "../" * depth
    links = "".join(
        nav_linkki(s, t).replace("{HREF}", nav_href(s, depth)) for s, t in NAV
    )
    mob = "".join(
        nav_linkki(s, t, "mob-linkki", f"--i:{i}").replace("{HREF}", nav_href(s, depth))
        for i, (s, t) in enumerate(FOOTER_NAV)
    )
    esirippu = f"""<div class="esirippu" data-esirippu aria-hidden="true">
  <div class="esirippu__sisus">
    <img class="esirippu__logo" src="{up}assets/img/logo.webp" alt=""
         width="538" height="520" fetchpriority="high" decoding="async">
    <span class="esirippu__viiva"></span>
  </div>
</div>""" if current == "" else ""

    return f"""{esirippu}<a class="ohita" href="#sisalto">Siirry sisältöön</a>

<!-- Ilmoitus keskeneräisestä sivustosta. Poistuu näkyvistä kun content.js:n
     tyonAlla-asetus muutetaan arvoon false. -->
<div class="tyonalla" data-tyonalla hidden>
  <div class="kuori tyonalla__rivi">
    <span class="tyonalla__merkki" aria-hidden="true"></span>
    <p class="tyonalla__teksti" data-tyonalla-teksti></p>
    <button class="tyonalla__sulje" type="button" data-tyonalla-sulje
            aria-label="Sulje ilmoitus">{ICONS['sulje']}</button>
  </div>
</div>

<header class="headeri" id="headeri">
  <div class="headeri__sisus">
    <a class="logo" href="{nav_href('', depth)}" aria-label="Bistro Liekki — etusivulle">
      <img class="logo__kuva" src="{up}assets/img/logo.webp"
           alt="Bistro Liekki" width="538" height="520"
           decoding="async" fetchpriority="high">
    </a>

    <nav class="navi" aria-label="Päävalikko">{links}</nav>

    <div class="headeri__oikea">
      <!-- Yhteystiedot valikon vieressä. Leveällä ruudulla numero ja osoite
           näkyvät kokonaan, kapeammalla pelkkä ikoni, puhelimessa nämä ovat
           valikon sisällä ja alapalkissa. -->
      <div class="headeri__yhteys">
        <a class="headeri__yhteyslinkki" data-href="puhelin" href="#" aria-label="Soita ravintolaan">
          {ICONS['soita']}<span data-teksti="puhelin"></span></a>
        <a class="headeri__yhteyslinkki" data-href="sahkoposti" href="#" aria-label="Lähetä sähköpostia">
          {ICONS['posti']}<span data-teksti="sahkoposti"></span></a>
      </div>
      <a class="nappi headeri__cta" data-linkki="varaus" data-tyhjana="Soita ja varaa"
         href="#"><span>Varaa pöytä</span></a>
      <button class="valikkonappi" type="button" aria-expanded="false"
              aria-controls="mobiilivalikko" aria-label="Avaa valikko">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
  <div class="vieritys-palkki" aria-hidden="true"><span data-vieritys></span></div>
</header>

<div class="mobiilivalikko" id="mobiilivalikko" aria-hidden="true">
  <div class="mobiilivalikko__sisus">
    <nav aria-label="Mobiilivalikko">{mob}</nav>
    <div class="mobiilivalikko__jalki">
      <a class="mobiilivalikko__yhteys" data-href="puhelin" href="#">
        Puhelin <strong data-teksti="puhelin"></strong>
      </a>
      <a class="mobiilivalikko__yhteys" data-href="sahkoposti" href="#">
        Sähköposti <strong data-teksti="sahkoposti"></strong>
      </a>
      <a class="nappi" data-linkki="varaus" data-tyhjana="Soita ja varaa" href="#"><span>Varaa pöytä</span></a>
    </div>
  </div>
</div>"""


def build_footer(depth):
    up = "../" * depth
    some = "".join(
        f'<a data-some="{k}" href="#" aria-label="{label}">{ICONS[k]}</a>'
        for k, label in [("facebook", "Facebook"), ("instagram", "Instagram"),
                         ("tiktok", "TikTok"), ("youtube", "YouTube")]
    )
    year = datetime.date.today().year
    return f"""<footer class="footeri">
  <div class="kuori footeri__ruudukko">
    <div>
      <h2 class="footeri__logo">
        <img src="{up}assets/img/logo.webp" alt="Bistro Liekki"
             width="538" height="520" loading="lazy" decoding="async">
      </h2>
      <p class="footeri__iskulause">Puuhiiligrilli Tikkurilan sydämessä vuodesta 2016.</p>
    </div>

    <div>
      <p class="footeri__otsikko">Ravintola</p>
      <address>
        <a data-href="sijainti" href="{nav_href('yhteystiedot', depth)}">
          <span data-teksti="katu"></span>, <span data-teksti="postitoimi"></span>
        </a>
        <a data-href="puhelin" href="#"><span data-teksti="puhelin"></span></a>
        <a data-href="sahkoposti" href="#"><span data-teksti="sahkoposti"></span></a>
      </address>
    </div>

    <div>
      <p class="footeri__otsikko">Seuraa meitä</p>
      <div class="some">{some}</div>
      <p class="footeri__iskulause" style="margin-top:1.4rem">
        Pöytävaraukset ja tiedustelut<br>
        <a data-href="puhelin" href="#" style="color:var(--bone);font-size:1rem">
          <span data-teksti="puhelin"></span></a>
      </p>
    </div>
  </div>

  <div class="kuori footeri__ala">
    <p class="ei-marginia">© {year} Bistro Liekki. Kaikki oikeudet pidätetään.</p>
    <p class="ei-marginia"><span data-teksti="keittio"></span></p>
  </div>
</footer>

<div class="mobiilipalkki" data-mobiilipalkki>
  <a class="nappi" data-linkki="varaus" data-tyhjana="Varaa puhelimitse"
     data-vara-href="varaus-puhelin" href="#"><span>Varaa pöytä</span></a>
  <a class="nappi nappi--ääriviiva nappi--ikoni" data-href="puhelin" href="#"
     aria-label="Soita ravintolaan">{ICONS['soita']}</a>
</div>

<div class="valolaatikko" data-valolaatikko aria-hidden="true" role="dialog" aria-modal="true" aria-label="Kuvagalleria">
  <button class="valolaatikko__sulje" type="button" aria-label="Sulje kuva">{ICONS['sulje']}</button>
  <button class="valolaatikko__nuoli valolaatikko__nuoli--edell" type="button" aria-label="Edellinen kuva">{ICONS['vasen']}</button>
  <button class="valolaatikko__nuoli valolaatikko__nuoli--seur" type="button" aria-label="Seuraava kuva">{ICONS['oikea']}</button>
  <figure style="margin:0;max-width:100%">
    <img alt="" hidden>
    <figcaption class="valolaatikko__teksti" data-valolaatikko-teksti></figcaption>
  </figure>
</div>"""


def structured_data(page):
    """Restaurant / LocalBusiness -rakenteinen data hakukoneille."""
    if page["slug"] not in ("", "yhteystiedot"):
        return ""
    return """<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://bistroliekki.fi/#ravintola",
  "name": "Bistro Liekki",
  "alternateName": "Bistro Liekki Talvikkitie",
  "description": "Puuhiiligrilli Tikkurilan sydämessä vuodesta 2016. Lounasbuffet arkisin, laaja à la carte ja catering.",
  "url": "https://bistroliekki.fi/",
  "telephone": "+358504708530",
  "email": "ravintola@bistroliekki.fi",
  "servesCuisine": ["Grilliruoka", "Bistro", "Burgerit", "Pihvit"],
  "priceRange": "€€",
  "currenciesAccepted": "EUR",
  "foundingDate": "2016",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Talvikkitie 30",
    "postalCode": "01300",
    "addressLocality": "Vantaa",
    "addressRegion": "Uusimaa",
    "addressCountry": "FI"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 60.293383, "longitude": 25.03193 },
  "hasMap": "https://www.google.com/maps?q=Talvikkitie+30,+01300+Vantaa",
  "hasMenu": "https://bistroliekki.fi/menu/",
  "acceptsReservations": "https://operox.fi/book/bistro-liekki",
  "sameAs": [
    "https://www.facebook.com/BistroLiekkiTalvikkitie",
    "https://www.instagram.com/bistroliekkitalvikkitie/",
    "https://www.tiktok.com/@bistroliekki"
  ],
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday"], "opens": "10:30", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "10:30", "closes": "23:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "12:00", "closes": "23:00" }
  ]
}
</script>"""


SHELL = """<!doctype html>
<html lang="fi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
{robots}
<meta name="theme-color" content="#080707">
<meta name="color-scheme" content="dark">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Bistro Liekki">
<meta name="author" content="Bistro Liekki">
<meta name="geo.region" content="FI-18">
<meta name="geo.placename" content="Tikkurila, Vantaa">

<meta property="og:type" content="{ogtype}">
<meta property="og:site_name" content="Bistro Liekki">
<meta property="og:locale" content="fi_FI">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{ogimage}">
<meta property="og:image:alt" content="Bistro Liekin burgeri puuhiiligrillistä">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{ogimage}">

<link rel="icon" href="{up}favicon.ico" sizes="any">
<link rel="icon" href="{up}favicon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="{up}apple-touch-icon.png">
<link rel="manifest" href="{up}site.webmanifest">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Instrument+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Instrument+Sans:wght@400;500;600&display=swap" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Instrument+Sans:wght@400;500;600&display=swap"></noscript>

<link rel="stylesheet" href="{up}assets/css/style.css">
{preload}
{jsonld}
</head>
<body>
{header}
<main id="sisalto">
{body}
</main>
{footer}
<script src="{up}assets/js/content.js"></script>
<script src="{up}assets/js/site.js" defer></script>
</body>
</html>
"""


def build():
    if os.path.isdir(OUT):
        for name in os.listdir(OUT):
            p = os.path.join(OUT, name)
            if name == "assets":
                continue
            shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    os.makedirs(OUT, exist_ok=True)

    # Sivuston juureen kuuluvat tiedostot (ikonit, manifesti) kopioidaan
    # kansiosta staattiset/ — build tyhjentää juuren, joten lähde on siellä.
    staattiset = os.path.join(ROOT, "staattiset")
    if os.path.isdir(staattiset):
        for name in sorted(os.listdir(staattiset)):
            shutil.copy2(os.path.join(staattiset, name), os.path.join(OUT, name))

    for page in PAGES:
        slug = page["slug"]
        depth = 0 if slug == "" else 1
        up = "../" * depth
        with open(os.path.join(SRC, page["file"]), encoding="utf-8") as f:
            body = f.read()

        # ikonit sisältöön
        for k, v in ICONS.items():
            body = body.replace("{{ikoni:%s}}" % k, v)
        body = body.replace("{{up}}", up)
        body = re.sub(r"\{\{linkki:([a-z\-]*)\}\}",
                      lambda m: nav_href(m.group(1), depth), body)

        canonical = DOMAIN + "/" + (slug + "/" if slug else "")
        preload = ('<link rel="preload" as="image" href="%sassets/img/hero.webp" '
                   'fetchpriority="high">' % up) if slug == "" else ""

        html = SHELL.format(
            title=page["title"],
            desc=page["desc"],
            canonical=canonical,
            robots='<meta name="robots" content="noindex, follow">' if page.get("noindex")
                   else '<meta name="robots" content="index, follow, max-image-preview:large">',
            ogtype="website" if slug == "" else "article",
            ogimage=DOMAIN + "/assets/img/" + page["og"],
            up=up,
            preload=preload,
            jsonld=structured_data(page),
            header=build_header(slug, depth),
            body=body,
            footer=build_footer(depth),
        )

        target_dir = OUT if slug == "" else os.path.join(OUT, slug)
        os.makedirs(target_dir, exist_ok=True)
        with open(os.path.join(target_dir, "index.html"), "w", encoding="utf-8") as f:
            f.write(html)
        print(f"  ✓ /{slug + '/' if slug else ''}".ljust(34), f"{len(html)/1024:6.1f} kB")


    # ------------------------------------------------ 404-sivu palvelimen juureen
    # Vercel, Netlify ja GitHub Pages näyttävät tämän, kun osoitetta ei löydy.
    with open(os.path.join(SRC, "404.html"), encoding="utf-8") as f:
        body404 = f.read()
    for k, v in ICONS.items():
        body404 = body404.replace("{{ikoni:%s}}" % k, v)
    body404 = body404.replace("{{up}}", "/")
    body404 = re.sub(r"\{\{linkki:([a-z\-]*)\}\}",
                     lambda m: "/" + (m.group(1) + "/" if m.group(1) else ""), body404)
    html404 = SHELL.format(
        title="Sivua ei löytynyt — Bistro Liekki",
        desc="Etsimääsi sivua ei löytynyt. Bistro Liekki, puuhiiligrilli Tikkurilan "
             "sydämessä. Talvikkitie 30, Vantaa. Katso ruokalista, lounas ja yhteystiedot.",
        canonical=DOMAIN + "/404.html",
        robots='<meta name="robots" content="noindex, follow">',
        ogtype="website",
        ogimage=DOMAIN + "/assets/img/hero.webp",
        up="/",
        preload="",
        jsonld="",
        header=build_header("404", 0).replace('href="./"', 'href="/"')
                                     .replace('href="meista/"', 'href="/meista/"')
                                     .replace('href="menu/"', 'href="/menu/"')
                                     .replace('href="lounas/"', 'href="/lounas/"')
                                     .replace('href="catering/"', 'href="/catering/"')
                                     .replace('href="galleria/"', 'href="/galleria/"')
                                     .replace('href="lahjakortti/"', 'href="/lahjakortti/"')
                                     .replace('href="yhteystiedot/"', 'href="/yhteystiedot/"')
                                     .replace('href="palaute/"', 'href="/palaute/"'),
        body=body404,
        footer=build_footer(0).replace('href="./"', 'href="/"')
                              .replace('href="meista/"', 'href="/meista/"')
                              .replace('href="menu/"', 'href="/menu/"')
                              .replace('href="lounas/"', 'href="/lounas/"')
                              .replace('href="catering/"', 'href="/catering/"')
                              .replace('href="galleria/"', 'href="/galleria/"')
                              .replace('href="lahjakortti/"', 'href="/lahjakortti/"')
                              .replace('href="yhteystiedot/"', 'href="/yhteystiedot/"')
                              .replace('href="palaute/"', 'href="/palaute/"'),
    ).replace('src="assets/', 'src="/assets/').replace('href="assets/', 'href="/assets/') \
     .replace('href="favicon', 'href="/favicon').replace('href="apple-touch', 'href="/apple-touch') \
     .replace('href="site.webmanifest', 'href="/site.webmanifest')
    with open(os.path.join(OUT, "404.html"), "w", encoding="utf-8") as f:
        f.write(html404)
    print("  ✓ 404.html".ljust(34), f"{len(html404)/1024:6.1f} kB")

    # ------------------------------------------------------------ sitemap
    today = datetime.date.today().isoformat()
    urls = "\n".join(
        f"  <url><loc>{DOMAIN}/{(p['slug'] + '/') if p['slug'] else ''}</loc>"
        f"<lastmod>{today}</lastmod>"
        f"<priority>{'1.0' if p['slug'] == '' else '0.8'}</priority></url>"
        for p in PAGES if not p.get("noindex")
    )
    with open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n'
                '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                + urls + "\n</urlset>\n")

    with open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(f"User-agent: *\nAllow: /\nDisallow: /vahvista-poytavaraus/\n\n"
                f"Sitemap: {DOMAIN}/sitemap.xml\n")

    print("\n  ✓ sitemap.xml, robots.txt")


if __name__ == "__main__":
    print("\nBistro Liekki — koostetaan sivusto\n" + "-" * 46)
    build()
    print("-" * 46 + "\n  Valmis. Sivusto on kansiossa site/\n")
