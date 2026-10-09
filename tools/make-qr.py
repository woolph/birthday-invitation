#!/usr/bin/env python3
"""Erzeugt gruppe-qr.svg: QR-Code zur WhatsApp-Geschenke-Gruppe.
Braucht das Paket segno (z. B. in einem venv: pip install segno)."""
import segno
URL = "https://chat.whatsapp.com/Iy9BjU0aOzW3DNImmz31hW"
qr = segno.make(URL, error="m")
qr.save("gruppe-qr.svg", scale=6, border=2, dark="#000000", light="#ffffff")
print("gruppe-qr.svg:", qr.designator, "Module:", qr.symbol_size())
