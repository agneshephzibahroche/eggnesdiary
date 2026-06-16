// ── Y2K Sparkle cursor trail ──────────────────────────────────────
(function () {
  const CHARS = ['✨','💕','⭐','🌸','💫','✦','♡','★','🦋','💜','✿','◇'];
  const COLORS = ['#ff99ee','#ffccff','#ff66cc','#cc00ff','#ffaaff','#ffffff','#ff88dd'];

  let last = 0;
  const THROTTLE = 40; // ms between particles

  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - last < THROTTLE) return;
    last = now;
    spawnParticle(e.clientX, e.clientY);
  });

  // Touch support
  document.addEventListener('touchmove', e => {
    const now = Date.now();
    if (now - last < THROTTLE) return;
    last = now;
    const t = e.touches[0];
    spawnParticle(t.clientX, t.clientY);
  }, { passive: true });

  function spawnParticle(x, y) {
    const el = document.createElement('span');
    el.className = 'sparkle-particle';
    el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
    el.style.left   = x + 'px';
    el.style.top    = y + 'px';
    el.style.color  = COLORS[Math.floor(Math.random() * COLORS.length)];
    el.style.fontSize = (10 + Math.random() * 10) + 'px';

    // Drift upward slightly
    const dx = (Math.random() - .5) * 30;
    const dy = -(10 + Math.random() * 25);
    el.style.setProperty('--dx', dx + 'px');
    el.style.setProperty('--dy', dy + 'px');
    el.style.animationDuration = (.5 + Math.random() * .4) + 's';

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }
})();
