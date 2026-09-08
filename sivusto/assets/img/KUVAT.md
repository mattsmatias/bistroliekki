# Kuvat

Sivustolla on ravintolan omat valokuvat. Kaikki on rajattu, kevyesti
värimääritelty (lämmin sävy, kevyt vinjetti) ja tallennettu WebP-muotoon
kahdessa koossa: iso näyttöversio ja `-sm`-mobiiliversio.

## Valokuvat

| Tiedosto | Mitä kuvassa on | Missä näkyy |
|---|---|---|
| `hero.webp` / `hero-sm.webp` | Tuplaburgeri ja ranskalaiset | Etusivun pääkuva. Mobiiliversio on erikseen sommiteltu niin, että koko annos näkyy pystyruudulla |
| `burgeri-chimichurri.webp` | Tuplaburgeri, punainen kastike | Etusivun à la carte, À la Carte -sivu, gallerian pääkuva |
| `burgeri-pekoni.webp` | Pekoniburgeri | À la Carte -sivun yläkuva, Lahjakortti-sivu, galleria |
| `lounasbuffet.webp` | Lounasbuffet ja ravintolasali | Etusivun esittely, Meistä, Catering, Yhteystiedot |
| `lounas-burgerit.webp` | Hampurilaiset lämpöhauteissa | Lounas-sivun yläkuva, galleria |
| `salaattipoyta.webp` | Salaattipöytä | Meistä, Lounas, galleria |
| `lammin-poyta.webp` | Lämpimät ruoat hauteissa | Meistä, Lounas, Catering, galleria |
| `pysty-burgeri.webp` | Burgeri pystykuvana (9:16) | Etusivun TikTok-nosto, galleria |
| `pysty-pekoni.webp` | Pekoniburgeri pystykuvana | Varalla pystypaikkoihin |
| `pysty-buffet.webp` | Lämmin pöytä pystykuvana | Etusivun TikTok-nosto, galleria |

## Brändigrafiikka (ei valokuvia)

Nämä ovat sivustoa varten tehtyjä hiili- ja liekkitekstuureja. Ne toimivat
taustoina siellä, missä valokuva veisi huomion tekstiltä.

```
grill-flame.webp / -sm    "Aito puuhiiligrilli" -osion tausta
band-embers.webp          Pöytävaraus-, Lahjakortti- ja Palaute-sivujen taustat
hero-charcoal-sm.webp     Mobiilivalikon tausta
grain.png                 Hienovarainen filmirae koko sivun päällä
```

## Uuden kuvan lisääminen

**Helpoin tapa:** korvaa olemassa oleva tiedosto samannimisellä. Mitään koodia
ei tarvitse muuttaa. Muista korvata myös `-sm`-versio.

**Uusi kuva galleriaan:** kopioi tiedosto tähän kansioon ja lisää rivi
tiedostoon `assets/js/content.js` kohtaan `galleria`.

**Erä kuvia kerralla:** kansiossa `lahdekoodi/` on `kasittele_kuvat.py`, joka
tekee rajaukset, värimäärittelyn ja WebP-tallennuksen automaattisesti. Laita
alkuperäiset kuvat kansioon `kuvat_raaka/`, säädä tiedoston lopun listaa ja aja
`python3 kasittele_kuvat.py`.

## Tekniset suositukset

- **Muoto:** WebP. Noin 30 % pienempi kuin JPG samalla laadulla.
- **Koko:** vaakakuvat 1500–1700 px leveitä, mobiiliversiot noin 860 px.
- **Tiedostokoko:** pyri alle 250 kt / kuva.
- **Sävy:** sivuston ilme on tumma ja lämmin. Parhaiten toimivat kuvat, joissa
  on lämmin valo ja tumma tausta. Kirkkaassa päivänvalossa otetut, sinertävät
  kuvat rikkovat tunnelman — `kasittele_kuvat.py` korjaa tätä automaattisesti.
- **Alt-teksti:** kirjoita jokaiselle kuvalle lyhyt kuvaus siitä, mitä kuvassa
  on. Se auttaa hakukoneita ja näkövammaisia kävijöitä.

## Muunnos WebP-muotoon ilman skriptiä

```bash
cwebp -q 78 kuva.jpg -o kuva.webp
```

Tai selaimessa: squoosh.app.
