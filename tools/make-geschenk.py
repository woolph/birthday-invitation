#!/usr/bin/env python3
"""Erzeugt geschenk.gif: ein kleines, sich drehendes Geschenkpaeckchen (Easteregg-Link)."""
from PIL import Image, ImageDraw
import math

S = 48
ROT, GELB, DUNKEL = (220, 0, 0), (255, 220, 0), (140, 0, 0)

def frame(winkel):
    img = Image.new("RGBA", (S * 4, S * 4), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    c = S * 2
    k = math.cos(math.radians(winkel))          # Pseudo-3D: Breite schrumpft
    w = max(6, abs(k) * 56)
    x0, x1 = c - w, c + w
    y0, y1 = c - 56, c + 60
    farbe = ROT if k >= 0 else DUNKEL
    d.rectangle([x0, y0 + 16, x1, y1], fill=farbe, outline=(0, 0, 0), width=3)
    d.rectangle([x0 - 6, y0 + 8, x1 + 6, y0 + 34], fill=farbe, outline=(0, 0, 0), width=3)
    b = max(4, w * 0.3)
    d.rectangle([c - b, y0 + 8, c + b, y1], fill=GELB, outline=(0, 0, 0), width=2)
    d.rectangle([x0 - 6, c - 14, x1 + 6, c - 2], fill=GELB, outline=(0, 0, 0), width=2)
    d.ellipse([c - b * 2.2, y0 - 10, c, y0 + 14], outline=(0, 0, 0), width=3, fill=GELB)
    d.ellipse([c, y0 - 10, c + b * 2.2, y0 + 14], outline=(0, 0, 0), width=3, fill=GELB)
    return img.resize((S, S), Image.LANCZOS)

frames = [frame(a) for a in range(0, 360, 20)]
pal = [f.convert("RGB").quantize(colors=32) for f in frames]
# Transparenz: Alpha-Maske als Index 0 verwenden
out = []
for f, p in zip(frames, pal):
    p = p.convert("RGBA")
    p.putalpha(f.getchannel("A").point(lambda a: 255 if a > 128 else 0))
    out.append(p)
out[0].save("geschenk.gif", save_all=True, append_images=out[1:], duration=70, loop=0,
            disposal=2, transparency=0, optimize=False)
print("geschenk.gif:", len(out), "Frames")
