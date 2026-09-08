"""Generate abstract charcoal / ember / smoke textures for Bistro Liekki.

These are procedural, atmospheric background textures - NOT photographs of food.
They give the site a real charcoal-grill atmosphere while the restaurant's own
photography is dropped into the dedicated photo slots.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

RNG = np.random.default_rng(20160101)  # restaurant founded 2016
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "site", "assets", "img")
os.makedirs(OUT, exist_ok=True)


def upscale(a, shape):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "L")
    im = im.resize((shape[1], shape[0]), Image.BICUBIC)
    return np.asarray(im).astype(np.float32) / 255.0


def fbm(shape, octaves=6, base=3, persistence=0.55, rng=RNG):
    """Fractal value noise in [0,1]."""
    total = np.zeros(shape, np.float32)
    amp, norm = 1.0, 0.0
    for o in range(octaves):
        res = base * (2 ** o)
        h = max(2, int(res * shape[0] / max(shape)))
        w = max(2, int(res * shape[1] / max(shape)))
        layer = rng.random((h, w)).astype(np.float32)
        total += amp * upscale(layer, shape)
        norm += amp
        amp *= persistence
    n = total / norm
    n -= n.min()
    n /= max(n.max(), 1e-6)
    return n


def radial_gradient(shape, cx, cy, radius, falloff=2.0):
    ys, xs = np.mgrid[0:shape[0], 0:shape[1]].astype(np.float32)
    d = np.sqrt(((xs - cx) / radius) ** 2 + ((ys - cy) / radius) ** 2)
    g = np.clip(1.0 - d, 0.0, 1.0) ** falloff
    return g


def vignette(shape, strength=0.85, power=1.6):
    ys, xs = np.mgrid[0:shape[0], 0:shape[1]].astype(np.float32)
    cx, cy = shape[1] / 2, shape[0] / 2
    d = np.sqrt(((xs - cx) / (shape[1] * 0.72)) ** 2 + ((ys - cy) / (shape[0] * 0.78)) ** 2)
    v = 1.0 - strength * np.clip(d, 0, 1.4) ** power
    return np.clip(v, 0.0, 1.0)


def to_img(rgb):
    return Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB")


def grain(shape, amount=0.035, rng=RNG):
    g = rng.normal(0.0, 1.0, shape).astype(np.float32)
    g = np.asarray(Image.fromarray(((g * 0.5 + 0.5) * 255).astype(np.uint8), "L")
                   .filter(ImageFilter.GaussianBlur(0.4))).astype(np.float32) / 255.0
    return (g - 0.5) * 2 * amount


# ---------------------------------------------------------------- charcoal bed
def charcoal_bed(h, w, ember_count=200, ember_scale=1.0, heat=1.0, seed=1):
    rng = np.random.default_rng(seed)
    shape = (h, w)

    # Layered rock / charcoal structure
    big = fbm(shape, octaves=5, base=2, persistence=0.62, rng=rng)
    mid = fbm(shape, octaves=7, base=6, persistence=0.5, rng=rng)
    fine = fbm(shape, octaves=6, base=22, persistence=0.45, rng=rng)

    # Cracked-lump look: ridged noise gives hard charcoal edges
    ridged = 1.0 - np.abs(mid * 2 - 1)
    ridged = ridged ** 2.6

    lum = 0.46 * big + 0.30 * ridged + 0.24 * fine
    lum = (lum - lum.min()) / max(lum.max() - lum.min(), 1e-6)
    lum = lum ** 2.1 * 0.20  # keep it deeply dark

    # Warm charcoal tint (brown-grey, never cold)
    base = np.stack([lum * 1.00, lum * 0.84, lum * 0.71], axis=-1)

    # Cracks between the coals hold residual heat
    crack = np.clip(ridged - 0.30, 0, 1) ** 1.6
    base += np.stack([crack * 0.30, crack * 0.10, crack * 0.025], axis=-1) * heat

    # Glowing embers in the cracks: hottest where the ridged mask is low (gaps)
    gaps = np.clip(1.0 - ridged, 0, 1) * np.clip(big, 0, 1)
    glow = np.zeros(shape, np.float32)
    core = np.zeros(shape, np.float32)

    ys, xs = np.nonzero(gaps > np.quantile(gaps, 0.86))
    if len(ys):
        idx = rng.choice(len(ys), size=min(ember_count, len(ys)), replace=False)
        for i in idx:
            y, x = int(ys[i]), int(xs[i])
            r = rng.uniform(18, 90) * ember_scale * (max(h, w) / 1400.0)
            g = radial_gradient(shape, x, y, r, falloff=2.4)
            glow += g * rng.uniform(0.25, 1.0)
            core += radial_gradient(shape, x, y, r * 0.16, falloff=1.4) * rng.uniform(0.5, 1.0)

    glow = np.clip(glow, 0, 3.2)
    glow = np.asarray(Image.fromarray((np.clip(glow / 3.2, 0, 1) * 255).astype(np.uint8), "L")
                      .filter(ImageFilter.GaussianBlur(max(h, w) / 260))).astype(np.float32) / 255.0 * 3.2
    core = np.clip(core, 0, 1.6)

    ember_rgb = np.stack([
        glow * 0.72 + core * 1.25,
        glow * 0.26 + core * 0.72,
        glow * 0.07 + core * 0.24,
    ], axis=-1) * heat

    img = base + ember_rgb

    # Rising heat haze / smoke
    smoke = fbm(shape, octaves=5, base=2, persistence=0.6, rng=rng)
    grad = np.linspace(1.0, 0.0, h, dtype=np.float32)[:, None] ** 1.8
    smokemask = np.clip(smoke - 0.52, 0, 1) * grad * 0.42
    img += np.stack([smokemask * 0.26, smokemask * 0.20, smokemask * 0.16], axis=-1)

    img *= vignette(shape, strength=0.7, power=1.5)[..., None]
    img += grain(shape, 0.028, rng)[..., None]
    return to_img(img)


# ------------------------------------------------------------------- flame wall
def flame_wall(h, w, seed=7):
    rng = np.random.default_rng(seed)
    shape = (h, w)
    n = fbm(shape, octaves=7, base=3, persistence=0.58, rng=rng)
    n2 = fbm(shape, octaves=6, base=9, persistence=0.5, rng=rng)

    grad = np.linspace(0.0, 1.35, h, dtype=np.float32)[:, None]  # hotter at the bottom
    flame = np.clip((n * 0.65 + n2 * 0.35) * 1.5 * grad - 0.30, 0, 2.2)
    flame = flame ** 1.5

    soft = np.asarray(Image.fromarray((np.clip(flame / 2.2, 0, 1) * 255).astype(np.uint8), "L")
                      .filter(ImageFilter.GaussianBlur(max(h, w) / 200))).astype(np.float32) / 255.0 * 2.2

    img = np.stack([
        soft * 0.95 + flame * 0.55,
        soft * 0.30 + flame * 0.24,
        soft * 0.07 + flame * 0.06,
    ], axis=-1)

    # dark charcoal silhouettes in front
    lump = fbm(shape, octaves=6, base=4, persistence=0.6, rng=rng)
    mask = np.clip((lump - 0.46) * 6.0, 0, 1) * np.linspace(0.15, 1.0, h, dtype=np.float32)[:, None]
    img *= (1.0 - mask * 0.92)[..., None]
    img += np.stack([lump * 0.055, lump * 0.048, lump * 0.042], axis=-1) * mask[..., None]

    img *= vignette(shape, strength=0.62, power=1.4)[..., None]
    img += grain(shape, 0.026, rng)[..., None]
    return to_img(img)


# ----------------------------------------------------------------- smoke sheet
def smoke_sheet(h, w, seed=11):
    rng = np.random.default_rng(seed)
    shape = (h, w)
    n = fbm(shape, octaves=7, base=2, persistence=0.62, rng=rng)
    a = np.clip((n - 0.42) * 1.9, 0, 1) ** 1.4
    a *= np.linspace(1.0, 0.15, h, dtype=np.float32)[:, None]
    rgb = np.stack([np.full(shape, 0.86), np.full(shape, 0.80), np.full(shape, 0.74)], axis=-1)
    out = np.concatenate([rgb, a[..., None] * 0.55], axis=-1)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8), "RGBA")


# ------------------------------------------------------------------ grain tile
def grain_tile(size=180, seed=3):
    rng = np.random.default_rng(seed)
    g = rng.normal(0.5, 0.16, (size, size)).astype(np.float32)
    g = np.clip(g, 0, 1)
    a = np.abs(g - 0.5) * 2 * 0.5
    rgb = np.where(g[..., None] > 0.5, 1.0, 0.0) * np.ones((1, 1, 3), np.float32)
    out = np.concatenate([rgb, a[..., None]], axis=-1)
    return Image.fromarray((out * 255).astype(np.uint8), "RGBA")


# ----------------------------------------------------------- photo placeholders
def photo_slot(h, w, seed=0, warm=0.5):
    """A dark, textured slot that reads as *designed*, never as broken."""
    rng = np.random.default_rng(1000 + seed)
    shape = (h, w)
    n = fbm(shape, octaves=6, base=3, persistence=0.58, rng=rng)
    m = fbm(shape, octaves=6, base=13, persistence=0.48, rng=rng)
    lum = (0.62 * n + 0.38 * m)
    lum = (lum - lum.min()) / max(lum.max() - lum.min(), 1e-6)
    lum = lum ** 2.0 * 0.19
    img = np.stack([lum * 1.0, lum * 0.90, lum * 0.82], axis=-1)

    cx = w * rng.uniform(0.25, 0.75)
    cy = h * rng.uniform(0.45, 0.9)
    g = radial_gradient(shape, cx, cy, max(h, w) * rng.uniform(0.45, 0.75), falloff=2.2)
    img += np.stack([g * 0.20, g * 0.075, g * 0.022], axis=-1) * warm

    img *= vignette(shape, strength=0.55, power=1.5)[..., None]
    img += grain(shape, 0.03, rng)[..., None]
    return to_img(img)


def save(img, name, quality=82):
    path = os.path.join(OUT, name)
    if name.endswith(".webp"):
        img.save(path, "WEBP", quality=quality, method=6)
    else:
        img.save(path, optimize=True)
    print(f"{name:34s} {os.path.getsize(path)/1024:8.1f} kB  {img.size}")


if __name__ == "__main__":
    save(charcoal_bed(1500, 2400, ember_count=240, heat=1.0, seed=2), "hero-charcoal.webp", 78)
    save(charcoal_bed(760, 1200, ember_count=110, heat=1.0, seed=2), "hero-charcoal-sm.webp", 74)
    save(flame_wall(1400, 2000, seed=7), "grill-flame.webp", 80)
    save(flame_wall(720, 1000, seed=7), "grill-flame-sm.webp", 74)
    save(charcoal_bed(900, 1800, ember_count=120, heat=0.75, seed=5), "band-embers.webp", 78)
    save(smoke_sheet(900, 1600), "smoke.webp", 70)
    save(grain_tile(180), "grain.png")

    for i in range(1, 11):
        save(photo_slot(1100, 1500, seed=i, warm=0.35 + 0.1 * (i % 4)), f"slot-{i:02d}.webp", 74)
