/* ======================================================================
   WOW interactions: cursor spotlight + counter animation + parallax
   ====================================================================== */
(function () {
  // 1. Global cursor → CSS variables for atmosphere
  const root = document.documentElement;
  let raf = null, mx = 50, my = 30;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth) * 100;
    my = (e.clientY / window.innerHeight) * 100;
    if (!raf) {
      raf = requestAnimationFrame(() => {
        document.body.style.setProperty('--mx', mx + '%');
        document.body.style.setProperty('--my', my + '%');
        raf = null;
      });
    }
  }, { passive: true });

  // 2. Per-element spotlight tracking on cards
  const cards = document.querySelectorAll('.cap, .mode, .metric, .tool, .morph-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--sx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    });
  });

  // 3. Hero diagram — mouse-tilt parallax
  const hero = document.querySelector('.hero');
  const diagram = document.querySelector('.hero-diagram');
  if (hero && diagram) {
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;   // -0.5..0.5
      const py = (e.clientY - r.top) / r.height - 0.5;
      const ry = -8 + px * 6;
      const rx =  6 - py * 6;
      diagram.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
    });
    hero.addEventListener('mouseleave', () => {
      diagram.style.transform = '';
    });
  }

  // 4. Animated counters in proof section
  const counters = document.querySelectorAll('[data-count]');
  const countIo = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const dur = 1400;
      const t0 = performance.now();
      function tick(now) {
        const t = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const v = target * eased;
        el.textContent = prefix + v.toFixed(decimals) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      countIo.unobserve(el);
    }
  }, { threshold: 0.4 });
  counters.forEach(el => countIo.observe(el));
})();
