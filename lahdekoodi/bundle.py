#!/usr/bin/env python3
"""
Koostaa koko sivustosta yhden tiedoston esikatseluversion (Artifact-julkaisu).
Kaikki sivut, tyylit, skriptit ja kuvat upotetaan samaan HTML-tiedostoon.
Varsinainen tuotantosivusto on kansiossa site/ — tämä on vain esikatselua varten.
"""
import base64
import mimetypes
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(ROOT, "site")
OUT = os.path.join(ROOT, "esikatselu.html")

PAGES = [("", "Etusivu"), ("meista", "Meistä"), ("menu", "À la Carte"),
         ("lounas", "Lounas"), ("catering", "Catering"), ("galleria", "Galleria"),
         ("lahjakortti", "Lahjakortti"), ("yhteystiedot", "Yhteystiedot"),
         ("palaute", "Palaute"), ("vahvista-poytavaraus", "Pöytävarauksen vahvistus")]


def data_uri(path):
    mime = mimetypes.guess_type(path)[0] or "application/octet-stream"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode()


IMG_CACHE = {}


def img(name):
    if name not in IMG_CACHE:
        IMG_CACHE[name] = data_uri(os.path.join(SITE, "assets", "img", name))
    return IMG_CACHE[name]


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def inline_images(html):
    def rep(m):
        pre, path, post = m.group(1), m.group(2), m.group(3)
        name = path.split("assets/img/")[-1]
        full = os.path.join(SITE, "assets", "img", name)
        return f'{pre}{img(name) if os.path.isfile(full) else path}{post}'
    html = re.sub(r'(src="|srcset="|url\([\'"]?)((?:\.\./)*assets/img/[^"\')]+)(["\')])', rep, html)
    # CSS-tiedostossa polut ovat muotoa ../img/tiedosto
    html = re.sub(r'(url\([\'"]?)(\.\./img/[^"\')]+)(["\')])', rep, html)
    return html


def main():
    css = inline_images(read(os.path.join(SITE, "assets", "css", "style.css")))
    content_js = read(os.path.join(SITE, "assets", "js", "content.js"))
    site_js = read(os.path.join(SITE, "assets", "js", "site.js"))

    kaytetyt = set()

    def irrota_kuvat(html):
        """Poistaa mobiilivariantit ja korvaa src:n kevyellä viitteellä."""
        html = re.sub(r"\s*<source[^>]*>\s*", "", html)

        def rep(m):
            nimi = m.group(1).split("assets/img/")[-1]
            if not os.path.isfile(os.path.join(SITE, "assets", "img", nimi)):
                return m.group(0)
            kaytetyt.add(nimi)
            return f'data-img="{nimi}"'

        return re.sub(r'src="((?:\.\./)*assets/img/[^"]+)"', rep, html)

    # content.js: gallerian polut viittaavat samaan kuvahakemistoon
    def rep_gal(m):
        nimi = m.group(1)
        kaytetyt.add(nimi)
        return f"window.__KUVAT['{nimi}']"
    content_js = re.sub(r"'assets/img/([^']+)'", rep_gal, content_js)

    index = read(os.path.join(SITE, "index.html"))
    header = re.search(r'(<a class="ohita".*?</div>\s*</div>\s*</div>)\s*<main', index, re.S).group(1)
    footer = re.search(r"</main>\s*(.*?)\s*<script", index, re.S).group(1)

    def to_hash(html):
        html = re.sub(r'href="\.\./([a-z\-]+)/"', lambda m: f'href="#/{m.group(1)}"', html)
        html = re.sub(r'href="([a-z\-]+)/"', lambda m: f'href="#/{m.group(1)}"', html)
        return html.replace('href="./"', 'href="#/"').replace('href="../"', 'href="#/"')

    header, footer = to_hash(irrota_kuvat(header)), to_hash(irrota_kuvat(footer))

    osat = []
    for slug, nimi in PAGES:
        p = os.path.join(SITE, slug, "index.html") if slug else os.path.join(SITE, "index.html")
        h = read(p)
        runko = re.search(r'<main id="sisalto">(.*?)</main>', h, re.S).group(1)
        runko = to_hash(irrota_kuvat(runko))
        title = re.search(r"<title>(.*?)</title>", h, re.S).group(1)
        osat.append(f'<div class="sivu" data-sivu="{slug}" data-otsikko="{title}" hidden>{runko}</div>')

    # jokainen kuva mukaan vain kerran
    kartta = ",".join(f'"{n}":"{img(n)}"' for n in sorted(kaytetyt))

    out = f"""<title>Bistro Liekki</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..700&family=Instrument+Sans:wght@400;500;600&display=swap">
<style>{css}
.sivu[hidden]{{display:none!important}}
.esikatselu-huomio{{position:fixed;left:0;right:0;bottom:0;z-index:9600;background:rgba(12,10,9,.94);
  -webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-top:1px solid rgba(244,239,230,.1);
  padding:.6rem 1rem;text-align:center;font-size:.72rem;letter-spacing:.06em;color:#A79C8C;font-family:var(--sans)}}
.esikatselu-huomio b{{color:#E9743B;font-weight:600}}
@media (max-width:719px){{.esikatselu-huomio{{display:none}}}}
</style>
<script>window.__KUVAT={{{kartta}}};</script>
{header}
<main id="sisalto">
{''.join(osat)}
</main>
{footer}
<div class="esikatselu-huomio">Esikatselu — koko sivusto yhdessä tiedostossa. <b>Kartta ja TikTok-upotukset toimivat julkaistulla sivustolla.</b></div>
<script>
/* Kuvat haetaan kertaalleen upotetusta hakemistosta. */
document.querySelectorAll('[data-img]').forEach(function (el) {{
  var s = window.__KUVAT[el.getAttribute('data-img')];
  if (s) el.src = s;
}});
</script>
<script>{content_js}</script>
<script>
/* Kevyt hash-reititin vain esikatselua varten. Oikealla sivustolla jokainen
   sivu on oma HTML-tiedostonsa omassa osoitteessaan. */
(function () {{
  var sivut = Array.prototype.slice.call(document.querySelectorAll('.sivu'));
  function nayta(slug, vieritaYlos) {{
    var loytyi = false;
    sivut.forEach(function (s) {{
      var osuu = s.getAttribute('data-sivu') === slug;
      s.hidden = !osuu;
      if (osuu) {{ loytyi = true; document.title = s.getAttribute('data-otsikko'); }}
    }});
    if (!loytyi) sivut[0].hidden = false;
    document.querySelectorAll('.navi a, .mobiilivalikko a.mob-linkki').forEach(function (a) {{
      var h = (a.getAttribute('href') || '').replace('#/', '');
      if (h === slug) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }});
    if (vieritaYlos) window.scrollTo(0, 0);
  }}
  function reititin(v) {{ nayta((location.hash || '#/').replace(/^#\\/?/, ''), v); }}
  window.addEventListener('hashchange', function () {{ reititin(true); }});
  reititin(false);
}})();
</script>
<script>{site_js}</script>
"""
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"esikatselu.html  {os.path.getsize(OUT)/1024/1024:.2f} MB  ({len(kaytetyt)} kuvaa)")


if __name__ == "__main__":
    main()
