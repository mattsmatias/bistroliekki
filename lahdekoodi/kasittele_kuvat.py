#!/usr/bin/env python3
"""
Bistro Liekin valokuvien käsittely verkkosivustoa varten.

- rajaa kuvat sivuston tarvitsemiin kuvasuhteisiin
- keventää hieman kirkkautta ja lämmittää sävyjä, jotta kuvat istuvat
  sivuston tummaan ilmeeseen ilman että ruoka näyttää tunkkaiselta
- tallentaa WebP-muodossa isona ja mobiiliversiona

Aja uudelleen, jos vaihdat lähdekuvat kansiossa kuvat_raaka/.
"""
import os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "kuvat_raaka")
OUT = os.path.join(ROOT, "site", "assets", "img")
os.makedirs(OUT, exist_ok=True)


def grade(im, vignetti=0.14, lampo=1.0):
    """Hienovarainen värimäärittely: lämmin, hieman kontrastia, kevyt vinjetti."""
    im = ImageEnhance.Color(im).enhance(1.07)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Brightness(im).enhance(0.965)

    a = np.asarray(im).astype(np.float32) / 255.0
    # lämpö: hieman punaa lisää, sinistä pois
    a[..., 0] = np.clip(a[..., 0] * (1 + 0.030 * lampo), 0, 1)
    a[..., 1] = np.clip(a[..., 1] * (1 + 0.004 * lampo), 0, 1)
    a[..., 2] = np.clip(a[..., 2] * (1 - 0.038 * lampo), 0, 1)

    if vignetti > 0:
        h, w = a.shape[:2]
        ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt(((xs - w / 2) / (w * 0.72)) ** 2 + ((ys - h / 2) / (h * 0.75)) ** 2)
        v = 1.0 - vignetti * np.clip(d, 0, 1.35) ** 1.7
        a *= v[..., None]

    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "RGB")


def crop_ratio(im, ratio, kohta=(0.5, 0.5)):
    """Rajaa kuvasuhteeseen niin, että annettu kohta pysyy näkyvissä."""
    w, h = im.size
    if w / h > ratio:                      # liian leveä -> kavennetaan
        nw, nh = int(round(h * ratio)), h
    else:                                  # liian korkea -> madalletaan
        nw, nh = w, int(round(w / ratio))
    cx, cy = kohta[0] * w, kohta[1] * h
    x = int(round(min(max(cx - nw / 2, 0), w - nw)))
    y = int(round(min(max(cy - nh / 2, 0), h - nh)))
    return im.crop((x, y, x + nw, y + nh))


def save(im, name, leveys, laatu=80):
    im = im.copy()
    if im.size[0] > leveys:
        korkeus = int(round(im.size[1] * leveys / im.size[0]))
        im = im.resize((leveys, korkeus), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.1, percent=48, threshold=3))
    p = os.path.join(OUT, name)
    im.save(p, "WEBP", quality=laatu, method=6)
    print(f"  {name:34s} {im.size[0]:>5}×{im.size[1]:<5} {os.path.getsize(p)/1024:7.1f} kB")


def lataa(tiedosto):
    return Image.open(os.path.join(SRC, tiedosto)).convert("RGB")


if __name__ == "__main__":
    print("\nKäsitellään Bistro Liekin valokuvat\n" + "-" * 58)

    # ------------------------------------------------------------- 1. HERO
    # Chimichurri-burgeri: näyttävin kuva -> etusivun hero
    hero = grade(lataa("56e01b19.jpg"), vignetti=0.20)
    save(crop_ratio(hero, 16 / 9, (0.44, 0.52)), "hero.webp", 2000, 76)
    save(crop_ratio(hero, 3 / 4, (0.44, 0.50)), "hero-sm.webp", 900, 72)

    # ------------------------------------------------ 2. VAAKAKUVAT SIVUILLE
    kuvat = [
        # (lähde, nimi, kuvasuhde, tarkennuspiste, vinjetti, leveys, laatu, kylläisyys)
        ("56e01b19.jpg", "burgeri-chimichurri", 16 / 9, (0.44, 0.52), .16, 1600, 78, 1.00),
        ("29db14cf.jpg", "burgeri-pekoni",      16 / 9, (0.42, 0.52), .16, 1600, 78, 1.00),
        ("004041bf.jpg", "lounasbuffet",         3 / 2, (0.50, 0.62), .14, 1500, 72, 1.00),
        # lämpölampun voimakas pinkki sävy rauhoitetaan hieman
        ("79569b1b.jpg", "lounas-burgerit",      3 / 2, (0.50, 0.55), .14, 1500, 72, 0.88),
        ("3d3f32ad.jpg", "salaattipoyta",        3 / 2, (0.45, 0.55), .14, 1500, 72, 1.00),
        ("b73dd3eb.jpg", "lammin-poyta",         3 / 2, (0.50, 0.55), .14, 1500, 72, 1.00),
    ]
    for tiedosto, nimi, suhde, kohta, vin, lev, laatu, kyl in kuvat:
        im = grade(lataa(tiedosto), vignetti=vin)
        if kyl != 1.0:
            im = ImageEnhance.Color(im).enhance(kyl)
        save(crop_ratio(im, suhde, kohta), f"{nimi}.webp", lev, laatu)
        save(crop_ratio(im, suhde, kohta), f"{nimi}-sm.webp", 860, 68)

    # ------------------------------------------ 3. PYSTYKUVAT (TikTok-nostot)
    for tiedosto, nimi, kohta in [
        ("56e01b19.jpg", "pysty-burgeri", (0.44, 0.50)),
        ("29db14cf.jpg", "pysty-pekoni",  (0.42, 0.50)),
        ("b73dd3eb.jpg", "pysty-buffet",  (0.50, 0.55)),
    ]:
        im = grade(lataa(tiedosto), vignetti=0.18)
        save(crop_ratio(im, 9 / 16, kohta), f"{nimi}.webp", 720, 72)

    print("-" * 58 + "\n  Valmis.\n")
