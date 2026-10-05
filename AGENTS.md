# AGENTS.md

Statische Retro-Website (Stil: Geocities ca. 1996) als Einladung zum 40. Geburtstag von Wolfgang
am 24.10.2026. Bewusst voller Design-Suenden: Frameset, Marquee, Blinken, Comic Sans, Besucherzaehler.

## Dateien

| Datei             | Zweck                                                                         |
|-------------------|-------------------------------------------------------------------------------|
| `index.html`      | `<frameset>` (Banner oben, Navigation links, Inhalt rechts). Leitet bei < 760px Breite auf `einladung.html` um, ausser `?frames=ja`. |
| `banner.html`     | Laufschrift, Titel, Besucherzaehler, Countdown, "MIDI"-Knopf                  |
| `nav.html`        | Menue (`<base target="inhalt">`), Under-Construction, 88x31-Buttons, Webring  |
| `einladung.html`  | Eigentliche Einladung. Eigenstaendig lesbar (Handy), Titelblock wird im Frame per `.in-frame` ausgeblendet |
| `anmeldung.html`  | Rueckmelde-Formular, erzeugt einen `wa.me`-Link mit vorausgefuelltem Text     |
| `retro.css`       | Gesamtes Styling, keine externen Bilder (Hintergrund ist Inline-SVG)          |
| `retro.js`        | Zaehler (localStorage), Countdown, Glitzerspur, Happy Birthday als 4-stimmiger NES-Chiptune per Web Audio (Melodie/Akkorde/Bass/Hi-Hat, Tempo `BPM`)  |

## Regeln

- Keine Build-Tools, keine Frameworks, keine Abhaengigkeiten ausser dem Google-Fonts-Link fuer "Comic Neue".
- Das WhatsApp-Ziel steht genau einmal in `anmeldung.html` (`WHATSAPP_ZIEL`), aktuell der Benutzername `woolph42` (Fallback waere die Telefonnummer).
- Datum und Zaehler-Startwert stehen oben in `retro.js`. Die Rueckmeldefrist (21.10.2026) steht in `einladung.html`, `anmeldung.html` und `banner.html`.
- Inhalte sind Deutsch, Umlaute als HTML-Entities oder UTF-8.
- `birthday-invitation.md` ist die Quelle der Texte und wird nicht committet (`.gitignore`).
- Testen: `firefox --headless --screenshot out.png --window-size=1280,900 file://$PWD/index.html?frames=ja`
  und dasselbe mit `--window-size=400,2400` fuer `einladung.html`.
- Commits nach Conventional Commits 1.0.0.
