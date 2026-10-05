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

  /* -------- "MIDI"-Knopf: Happy Birthday als Rechteckwelle */
  var ctx = null;
  var spielt = false;
  var MELODIE = [ // [Frequenz Hz, Dauer in Vierteln]
    [392, 0.75], [392, 0.25], [440, 1], [392, 1], [523, 1], [494, 2],
    [392, 0.75], [392, 0.25], [440, 1], [392, 1], [587, 1], [523, 2],
    [392, 0.75], [392, 0.25], [784, 1], [659, 1], [523, 1], [494, 1], [440, 2],
    [698, 0.75], [698, 0.25], [659, 1], [523, 1], [587, 1], [523, 2]
  ];
  function musik(knopf) {
    if (spielt) { return; }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { alert('Dein Browser hat keine Soundkarte. Bitte Soundblaster 16 einbauen.'); return; }
    ctx = ctx || new AC();
    spielt = true;
    var alt = knopf.textContent;
    knopf.textContent = '♫ Spielt... ♫';
    var t = ctx.currentTime + 0.05;
    var viertel = 0.42;
    MELODIE.forEach(function (n) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = n[0];
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.setValueAtTime(0.0001, t + n[1] * viertel - 0.04);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + n[1] * viertel);
      t += n[1] * viertel;
    });
    setTimeout(function () { spielt = false; knopf.textContent = alt; }, (t - ctx.currentTime) * 1000);
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
