#!/usr/bin/env python3
"""Erzeugt bluescreen.gif: ein animierter Windows-98-Bluescreen (deutsch).
Aufruf aus dem Projektroot:  python3 tools/make-bluescreen.py
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 640, 400
BLAU, WEISS, GRAU = (0, 0, 170), (255, 255, 255), (170, 170, 170)
FONT = ImageFont.truetype("/usr/share/fonts/google-noto/NotoSansMono-CondensedMedium.ttf", 14)
ZEILE = 18

ZEILEN = [
    "",
    "",
    ("Windows", "titel"),
    "",
    "Ein schwerwiegender Ausnahmefehler 40 ist bei 1986:0000AB40 in VXD",
    "WOLFGANG(01) + 00000028 aufgetreten. Die aktuelle Jugend wird beendet.",
    "",
    "*  Druecken Sie eine beliebige Taste, um die aktuelle Jugend zu beenden.",
    "*  Druecken Sie STRG+ALT+ENTF, um den Jubilar neu zu starten. Nicht",
    "   gespeicherte Erinnerungen gehen dabei verloren.",
    "",
    "   Laufzeit seit letztem Absturz: 40 Jahre, 0 Tage. Rekord.",
    "",
    "",
    ("Druecken Sie eine beliebige Taste, um fortzufahren _", "zentriert"),
]


def frame(anzahl_zeilen, cursor=True):
    img = Image.new("RGB", (W, H), BLAU)
    d = ImageDraw.Draw(img)
    y = 40
    for i, z in enumerate(ZEILEN[:anzahl_zeilen]):
        if isinstance(z, tuple):
            text, art = z
            if art == "titel":
                w = d.textlength(" " + text + " ", font=FONT)
                d.rectangle([(W - w) / 2, y - 1, (W + w) / 2, y + ZEILE - 2], fill=GRAU)
                d.text(((W - w) / 2, y), " " + text + " ", font=FONT, fill=BLAU)
            else:
                if not cursor:
                    text = text[:-1] + " "
                w = d.textlength(text, font=FONT)
                d.text(((W - w) / 2, y), text, font=FONT, fill=WEISS)
        else:
            d.text((24, y), z, font=FONT, fill=WEISS)
        y += ZEILE
    return img.quantize(colors=8)


frames, dauern = [], []
# 1) leerer Bluescreen
frames.append(frame(0)); dauern.append(700)
# 2) Zeilen erscheinen nacheinander
for n in range(1, len(ZEILEN) + 1):
    frames.append(frame(n)); dauern.append(140)
# 3) Cursor blinkt
for _ in range(5):
    frames.append(frame(len(ZEILEN), cursor=False)); dauern.append(450)
    frames.append(frame(len(ZEILEN), cursor=True)); dauern.append(450)
# 4) kurzer Schwarz-Frame = "Neustart", dann von vorn
frames.append(Image.new("RGB", (W, H), (0, 0, 0)).quantize(colors=2)); dauern.append(600)

frames[0].save("bluescreen.gif", save_all=True, append_images=frames[1:],
               duration=dauern, loop=0, optimize=True)
print("bluescreen.gif:", len(frames), "Frames")
