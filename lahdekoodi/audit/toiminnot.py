"""
BISTRO LIEKKI — toiminnallinen tarkistus hallintapaneelille.

Ulkoasutarkistukset (hallinta-laaja.py) eivat huomaa, jos painike lakkaa
toimimasta: sivu nayttaa taysin oikealta. Tama skripti tarkistaa sen sijaan,
etta paneeli oikeasti reagoi muokkaukseen.

Taustalla oikea vika: tiedostossa oli kaksi samannimista funktiota
(muutos()). Myohempi maarittely korvasi aiemman, jolloin kenttien muokkaus
ei enaa merkinnyt tallentamattomia muutoksia eivatka Tallenna- ja
Peru-painikkeet aktivoituneet. Ulkoasu oli virheeton koko ajan.

Kaksi tarkistusta:
  1. Sama funktionimi ei saa esiintya kahdesti samassa tiedostossa.
  2. Kenttaan kirjoittaminen aktivoi Tallenna- ja Peru-painikkeet jokaisella
     valilehdella, jolla on muokattavia kenttia.

Ajo:  python3 -m http.server 8899 -d site   (taustalle)
      python3 audit/toiminnot.py
"""

import asyncio
import re
import sys
from pathlib import Path

from playwright.async_api import async_playwright

JUURI = Path(__file__).resolve().parent.parent
BASE = "http://127.0.0.1:8899/hallinta/"

TIEDOSTOT = [
    JUURI / "staattiset" / "hallinta" / "hallinta.js",
    JUURI / "site" / "assets" / "js" / "site.js",
]

# Sisennys ei kerro nakyvyysaluetta — kaksi samannimista apufunktiota eri
# funktioiden sisalla on taysin kelvollista. Merkitseva on vain se, osuvatko
# ne samaan aaltosulkulohkoon. Siksi tassa lasketaan sulkujen syvyys ja
# ohitetaan merkkijonot ja kommentit, jotta niiden sisalla olevat sulut ja
# sanat eivat sotke laskentaa.
FUNKTIO = re.compile(r"function\s+([A-Za-z_$][\w$]*)\s*\(")


def lohkopolut(teksti):
    """Tuottaa (nimi, rivi, lohkopolku) jokaiselle function-maarittelylle."""
    polku = []          # avattujen aaltosulkujen kohdat
    laskuri = 0         # juokseva tunniste jokaiselle lohkolle
    i, n = 0, len(teksti)
    rivi = 1
    while i < n:
        c = teksti[i]
        if c == "\n":
            rivi += 1
            i += 1
            continue
        # kommentit
        if c == "/" and i + 1 < n and teksti[i + 1] == "/":
            while i < n and teksti[i] != "\n":
                i += 1
            continue
        if c == "/" and i + 1 < n and teksti[i + 1] == "*":
            loppu = teksti.find("*/", i + 2)
            loppu = n if loppu < 0 else loppu + 2
            rivi += teksti.count("\n", i, loppu)
            i = loppu
            continue
        # merkkijonot
        if c in "\"'`":
            i += 1
            while i < n:
                if teksti[i] == "\\":
                    i += 2
                    continue
                if teksti[i] == c:
                    i += 1
                    break
                if teksti[i] == "\n":
                    rivi += 1
                i += 1
            continue
        if c == "{":
            laskuri += 1
            polku.append(laskuri)
            i += 1
            continue
        if c == "}":
            if polku:
                polku.pop()
            i += 1
            continue
        if c == "f" and teksti.startswith("function", i):
            osuma = FUNKTIO.match(teksti, i)
            if osuma:
                yield osuma.group(1), rivi, tuple(polku)
                i = osuma.end()
                continue
        i += 1


def kaksoisnimet():
    viat = []
    for tiedosto in TIEDOSTOT:
        if not tiedosto.exists():
            viat.append(f"{tiedosto.name}: tiedostoa ei ole")
            continue
        nahdyt = {}
        for nimi, rivi, polku in lohkopolut(tiedosto.read_text(encoding="utf-8")):
            avain = (polku, nimi)
            if avain in nahdyt:
                viat.append(
                    f"{tiedosto.name}: funktio {nimi}() maaritellaan kahdesti "
                    f"samassa lohkossa (rivit {nahdyt[avain]} ja {rivi}) — "
                    f"myohempi korvaa aiemman"
                )
            else:
                nahdyt[avain] = rivi
    return viat


# Sama tynka kuin hallinta-laaja.py:ssa: paneeli saa tietokantavastaukset
# ilman verkkoyhteytta.
def hae_stub():
    lahde = (JUURI / "audit" / "hallinta-laaja.py").read_text(encoding="utf-8")
    tila = {}
    exec(lahde.split("async def main")[0], tila)
    return tila["STUB"]


OHITA = ("Yleiskatsaus", "Kävijät", "Tili")


async def painikkeet():
    viat = []
    tallennusKokeiltu = False
    stub = hae_stub()
    async with async_playwright() as p:
        selain = await p.chromium.launch()
        ctx = await selain.new_context(viewport={"width": 1440, "height": 1000})
        await ctx.add_init_script(stub)
        sivu = await ctx.new_page()
        virheet = []
        sivu.on("pageerror", lambda e: virheet.append(str(e)[:150]))

        await sivu.goto(BASE, wait_until="load", timeout=25000)
        await sivu.fill("#sposti", "a@b.fi")
        await sivu.fill("#salasana", "x")
        await sivu.click("#kirjaudu-nappi")
        await sivu.wait_for_timeout(1500)

        lehdet = await sivu.evaluate(
            "() => [...document.querySelectorAll('.valilehti')].map(e => e.textContent.trim())")

        for i, nimi in enumerate(lehdet):
            if nimi in OHITA:
                continue
            await sivu.click(f".valilehti >> nth={i}")
            await sivu.wait_for_timeout(700)

            loytyi = await sivu.evaluate("""() => {
                const kentat = [...document.querySelectorAll(
                    '#sisus input[type=text], #sisus textarea')]
                    .filter(k => !k.disabled && !k.readOnly && k.offsetParent);
                if (!kentat.length) return null;
                const k = kentat[0];
                const vanha = k.value || '';
                /* Numerokentassa arvo kulkee parseInt:n lapi, joten kirjaimen
                   lisaaminen ei muuta mitaan — se ei ole vika vaan kentan
                   luonne. Siksi numeroon lisataan numero. */
                k.value = /^\\s*\\d+\\s*$/.test(vanha)
                    ? String(parseInt(vanha, 10) + 1)
                    : vanha + ' ZZ';
                k.dispatchEvent(new Event('input', { bubbles: true }));
                return (k.closest('label') || {}).textContent
                    ? k.closest('label').textContent.trim().slice(0, 40) : 'kenttä';
            }""")
            if not loytyi:
                continue
            await sivu.wait_for_timeout(400)

            tila = await sivu.evaluate("""() => ({
                tallenna: document.querySelector('#tallenna').disabled,
                peru:     document.querySelector('#peru').disabled,
                teksti:   document.querySelector('#tila').textContent
            })""")
            if tila["tallenna"] or tila["peru"]:
                viat.append(
                    f"[{nimi}] kentan '{loytyi}' muokkaus ei aktivoinut "
                    f"painikkeita (tallenna disabled={tila['tallenna']}, "
                    f"peru disabled={tila['peru']}, tila='{tila['teksti']}')")
            # Tallenna-painike vain yhdella valilehdella: tarkoitus on
            # todeta, etta painallus oikeasti kaynnistaa tallennuksen ja
            # palauttaa tilan, ei toistaa samaa neljasti.
            if not tila["tallenna"] and not tallennusKokeiltu:
                tallennusKokeiltu = True
                await sivu.click("#tallenna")
                await sivu.wait_for_timeout(1200)
                jalkeen = await sivu.evaluate("""() => ({
                    tallenna: document.querySelector('#tallenna').disabled,
                    teksti:   document.querySelector('#tila').textContent
                })""")
                if not jalkeen["tallenna"]:
                    viat.append(
                        f"[{nimi}] Tallenna-painallus ei nollannut tilaa "
                        f"(tila='{jalkeen['teksti']}')")

            # Palautetaan tila, jotta seuraava valilehti aloittaa puhtaalta
            await sivu.reload(wait_until="load")
            await sivu.wait_for_timeout(1400)

        if virheet:
            viat.append("JS-virheita: " + "; ".join(virheet[:3]))
        await selain.close()
    return viat


async def main():
    viat = kaksoisnimet()
    viat += await painikkeet()
    if viat:
        print("\n".join(viat))
        print(f"\n--- {len(viat)} ongelmariviä ---")
        sys.exit(1)
    print("KAIKKI OK")
    print("\n--- 0 ongelmariviä ---")


asyncio.run(main())
