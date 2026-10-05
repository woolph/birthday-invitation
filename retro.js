/* ==========================================================
   retro.js  -  Besucherzaehler, Glitzerspur, Countdown, "MIDI"
   Kein Framework. Nur Spass. Alles ohne externe Dateien.
   ========================================================== */
(function () {
  'use strict';

  var PARTY = new Date(2026, 9, 24, 11, 0, 0); // 24.10.2026, 11:00
  var START_ZAEHLER = 198640;                   // Baujahr 1986 + 40, warum nicht

  // Erkennen, ob wir im Frame stecken (dann Titelblock ausblenden)
  if (window.top !== window.self) {
    document.documentElement.className += ' in-frame';
  }

  /* -------- Besucherzaehler (localStorage, zaehlt nur lokal) */
  function zaehler() {
    var el = document.getElementById('zaehler');
    if (!el) { return; }
    var n = START_ZAEHLER;
    try {
      n = parseInt(localStorage.getItem('wolfgang40-hits') || START_ZAEHLER, 10) + 1;
      localStorage.setItem('wolfgang40-hits', String(n));
    } catch (e) { n = START_ZAEHLER + 1; }
    var s = ('00000000' + n).slice(-8);
    el.innerHTML = '';
    for (var i = 0; i < s.length; i++) {
      var d = document.createElement('span');
      d.textContent = s.charAt(i);
      el.appendChild(d);
    }
  }

  /* -------- Countdown bis zur Party */
  function countdown() {
    var el = document.getElementById('countdown');
    if (!el) { return; }
    var diff = PARTY - new Date();
    if (diff <= 0) {
      el.textContent = 'ES IST SOWEIT!!!';
      return;
    }
    var tage = Math.floor(diff / 86400000);
    var std = Math.floor((diff % 86400000) / 3600000);
    var min = Math.floor((diff % 3600000) / 60000);
    var sek = Math.floor((diff % 60000) / 1000);
    el.textContent = tage + ' Tage, ' + std + ' Std, ' + min + ' Min, ' + sek + ' Sek';
    setTimeout(countdown, 1000);
  }

  /* -------- Glitzerspur hinter dem Mauszeiger */
  var FARBEN = ['#ff0', '#f0f', '#0ff', '#0f0', '#f00', '#fff'];
  var letzterGlitzer = 0;
  function glitzer(ev) {
    var jetzt = Date.now();
    if (jetzt - letzterGlitzer < 40) { return; }
    letzterGlitzer = jetzt;
    var g = document.createElement('span');
    g.className = 'glitzer';
    g.textContent = Math.random() < 0.5 ? '✦' : '✧';
    g.style.left = (ev.clientX - 6) + 'px';
    g.style.top = (ev.clientY - 6) + 'px';
    g.style.color = FARBEN[Math.floor(Math.random() * FARBEN.length)];
    document.body.appendChild(g);
    setTimeout(function () { if (g.parentNode) { g.parentNode.removeChild(g); } }, 800);
  }

  /* -------- "MIDI"-Knopf: Happy Birthday als 8-Bit-Chiptune
     Vier Stimmen wie auf einem NES: Pulse 1 (Melodie, 50 % Duty),
     Pulse 2 (Off-Beat-Akkorde, 25 % Duty), Triangle (Bass), Noise (Hi-Hat).
     Happy Birthday ist seit 2016 gemeinfrei, der Sound ist unser eigener. */
  var ctx = null;
  var spielt = false;
  var BPM = 168;                 // huepfendes Tempo im 3/4-Takt
  var BEAT = 60 / BPM;

  var HALBTON = { C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4, 'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2 };
  function hz(note) {              // 'G4' -> 392 Hz
    var m = /^([A-G]#?)(\d)$/.exec(note);
    return 440 * Math.pow(2, (HALBTON[m[1]] + (parseInt(m[2], 10) - 4) * 12) / 12);
  }

  // Melodie: [Note, Dauer in Vierteln]. 'R' = Pause.
  var MELODIE = [
    ['G4', 0.75], ['G4', 0.25],
    ['A4', 1], ['G4', 1], ['C5', 1],
    ['B4', 2], ['G4', 0.75], ['G4', 0.25],
    ['A4', 1], ['G4', 1], ['D5', 1],
    ['C5', 2], ['G4', 0.75], ['G4', 0.25],
    ['G5', 1], ['E5', 1], ['C5', 1],
    ['B4', 1], ['A4', 1], ['F5', 0.75], ['F5', 0.25],
    ['E5', 1], ['C5', 1], ['D5', 1],
    ['C5', 3]
  ];
  // Harmonie pro Takt (Takt 0 ist der einzelne Auftakt-Schlag): [Grundton Bass, Terz, Quinte]
  var AKKORDE = {
    C: ['C2', 'E4', 'G4'], G: ['G2', 'B3', 'D4'], F: ['F2', 'A3', 'C4']
  };
  // Je Takt 3 Schlaege: Akkordname pro Schlag
  var HARMONIE = [
    ['C'],                 // Auftakt (1 Schlag)
    ['C', 'C', 'C'],
    ['G', 'G', 'G'],
    ['G', 'G', 'G'],
    ['C', 'C', 'C'],
    ['C', 'C', 'C'],
    ['F', 'F', 'F'],
    ['C', 'C', 'G'],
    ['C', 'C', 'C']
  ];

  var pulse25 = null;
  function pulseWave() {           // 25 %-Rechteck per Fourier-Reihe
    if (pulse25) { return pulse25; }
    var n = 32, real = new Float32Array(n), imag = new Float32Array(n);
    for (var k = 1; k < n; k++) {
      real[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    }
    pulse25 = ctx.createPeriodicWave(real, imag);
    return pulse25;
  }

  var noiseBuffer = null;
  function rauschen() {
    if (noiseBuffer) { return noiseBuffer; }
    var len = ctx.sampleRate * 0.2;
    noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuffer.getChannelData(0);
    for (var i = 0; i < len; i++) { d[i] = Math.random() * 2 - 1; }
    return noiseBuffer;
  }

  // Ein Ton: typ 'square' | 'pulse25' | 'triangle'
  function ton(typ, freq, start, dauer, lautst, master) {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    if (typ === 'pulse25') { osc.setPeriodicWave(pulseWave()); } else { osc.type = typ; }
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(lautst, start);
    gain.gain.setValueAtTime(lautst, start + dauer * 0.6);
    gain.gain.linearRampToValueAtTime(0.0001, start + dauer);
    osc.connect(gain).connect(master);
    osc.start(start);
    osc.stop(start + dauer + 0.01);
  }

  function hihat(start, lautst, master) {
    var src = ctx.createBufferSource();
    src.buffer = rauschen();
    var filt = ctx.createBiquadFilter();
    filt.type = 'highpass';
    filt.frequency.value = 6000;
    var gain = ctx.createGain();
    gain.gain.setValueAtTime(lautst, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);
    src.connect(filt).connect(gain).connect(master);
    src.start(start);
    src.stop(start + 0.07);
  }

  function arpeggio(noten, start, schritt, master) {
    noten.forEach(function (n, i) {
      ton('square', hz(n), start + i * schritt, schritt * 0.9, 0.09, master);
    });
    return start + noten.length * schritt;
  }

  function musik(knopf) {
    if (spielt) { return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { alert('Dein Browser hat keine Soundkarte. Bitte Soundblaster 16 einbauen.'); return; }
    ctx = ctx || new AC();
    if (ctx.resume) { ctx.resume(); }
    spielt = true;
    var alt = knopf.textContent;
    knopf.textContent = '♫ 8-Bit läuft ♫';

    var master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    var t = ctx.currentTime + 0.05;

    // Intro: kleines Start-Jingle (eigenes Arpeggio, kein Zitat)
    t = arpeggio(['C5', 'E5', 'G5', 'C6'], t, BEAT / 4, master);
    ton('square', hz('E6'), t, BEAT / 2, 0.09, master);
    t += BEAT * 0.75;

    // Begleitung: Bass auf 1, Akkord-Stabs auf 2 und 3, Hi-Hat auf jedem Schlag
    var tb = t;
    HARMONIE.forEach(function (takt) {
      takt.forEach(function (name, schlag) {
        var ak = AKKORDE[name];
        var erster = (takt.length === 1) || schlag === 0;
        if (erster) {
          ton('triangle', hz(ak[0]), tb, BEAT * 0.9, 0.35, master);           // Oom
          hihat(tb, 0.12, master);
        } else {
          ton('triangle', hz(ak[0]) * 1.5, tb, BEAT * 0.5, 0.25, master);     // Pah (Quinte)
          ton('pulse25', hz(ak[1]), tb, BEAT * 0.45, 0.05, master);
          ton('pulse25', hz(ak[2]), tb, BEAT * 0.45, 0.05, master);
          hihat(tb, 0.07, master);
        }
        tb += BEAT;
      });
    });

    // Melodie: Pulse 1, staccato
    var tm = t;
    MELODIE.forEach(function (n) {
      var d = n[1] * BEAT;
      if (n[0] !== 'R') { ton('square', hz(n[0]), tm, d * 0.8, 0.11, master); }
      tm += d;
    });

    // Outro: Schluss-Arpeggio plus Akkord
    var to = Math.max(tb, tm);
    to = arpeggio(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], to, BEAT / 4, master);
    ton('square', hz('C6'), to, BEAT * 1.5, 0.1, master);
    ton('pulse25', hz('E5'), to, BEAT * 1.5, 0.06, master);
    ton('pulse25', hz('G5'), to, BEAT * 1.5, 0.06, master);
    ton('triangle', hz('C2'), to, BEAT * 1.5, 0.35, master);
    to += BEAT * 1.6;

    setTimeout(function () { spielt = false; knopf.textContent = alt; }, (to - ctx.currentTime) * 1000 + 100);
  }

  document.addEventListener('DOMContentLoaded', function () {
    zaehler();
    countdown();
    document.addEventListener('mousemove', glitzer);
    var k = document.getElementById('midi');
    if (k) { k.addEventListener('click', function () { musik(k); }); }
    // "Frames-Version"-Link nur zeigen, wenn wir NICHT im Frame sind
    var f = document.getElementById('frames-link');
    if (f && window.top !== window.self) { f.style.display = 'none'; }
  });
})();
