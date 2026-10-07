#!/usr/bin/env python3
"""Erzeugt die ICS-Dateien fuer die Kalender-Seite. Aufruf aus dem Projektroot."""
import datetime as dt

# Zeiten in UTC. Am 24.10.2026 gilt noch Sommerzeit (UTC+2), Umstellung erst in der Nacht danach.
STAMP = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
URL = "https://woolph.github.io/birthday-invitation/"

def esc(s):
    return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")

def fold(line):
    out, enc = [], line.encode("utf-8")
    while len(enc) > 73:
        cut = 73
        while cut > 0 and (enc[cut] & 0xC0) == 0x80:  # nicht mitten im UTF-8-Zeichen trennen
            cut -= 1
        out.append(enc[:cut].decode("utf-8")); enc = b" " + enc[cut:]
    out.append(enc.decode("utf-8"))
    return "\r\n".join(out)

def ics(datei, uid, summary, start, ende, ort, beschreibung):
    zeilen = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wolfgang wird 40//Retro-Homepage//DE",
        "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        f"UID:{uid}@woolph.github.io", f"DTSTAMP:{STAMP}",
        f"DTSTART:{start}", f"DTEND:{ende}",
        f"SUMMARY:{esc(summary)}", f"LOCATION:{esc(ort)}",
        f"DESCRIPTION:{esc(beschreibung)}", f"URL:{URL}",
        "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-P1D", "DESCRIPTION:Morgen: Wolfgang wird 40!", "END:VALARM",
        "END:VEVENT", "END:VCALENDAR",
    ]
    with open(datei, "w", encoding="utf-8", newline="") as f:
        f.write("\r\n".join(fold(z) for z in zeilen) + "\r\n")
    print("geschrieben:", datei)

ics("wolfgang40.ics", "wolfgang40-ganzer-tag",
    "Wolfgang wird 40: Mission Games + Essen",
    "20261024T084500Z", "20261024T140000Z",
    "Mission Games, Hauptstraße 16, 4040 Linz",
    "10:45 Treffpunkt vor den Mission Games (Hauptstraße 16, 1. Stock, 4040 Linz)\n"
    "11:10 Start Mission Games\n"
    "ca. 12:10 Spaziergang über die Donau\n"
    "13:00 Essen im WAKUWAKU, Hauptplatz 11, 4020 Linz\n"
    "Ende offen.\n\nAlle Infos: " + URL)

ics("wolfgang40-essen.ics", "wolfgang40-essen",
    "Wolfgang wird 40: Essen im Waku Waku",
    "20261024T110000Z", "20261024T140000Z",
    "WAKUWAKU, Hauptplatz 11, 4020 Linz",
    "13:00 Essen im WAKUWAKU, Hauptplatz 11, 4020 Linz. Ende offen.\n\nAlle Infos: " + URL)
