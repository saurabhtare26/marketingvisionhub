/* ═══════════════════════════════════════════════════════
   MARKETING VISION HUB — Main JS
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── Custom Cursor ─────────────────────────────────── */
(function initCursor() {
  const glow = document.getElementById('cursorGlow');
  const dot  = document.getElementById('cursorDot');
  if (!glow || !dot) return;

  /* Check touch device — disable cursor on touch */
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = -1000, my = -1000;
  let gx = -1000, gy = -1000;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  function tickGlow() {
    gx += (mx - gx) * 0.09;
    gy += (my - gy) * 0.09;
    glow.style.left = gx + 'px';
    glow.style.top  = gy + 'px';
    rafId = requestAnimationFrame(tickGlow);
  }
  tickGlow();

  /* Expand dot on interactive element hover */
  document.querySelectorAll('a, button, .btn-primary, .btn-secondary, .card-3d, .bento-cell').forEach(el => {
    el.addEventListener('mouseenter', () => dot.style.transform = 'translate(-50%,-50%) scale(2.5)');
    el.addEventListener('mouseleave', () => dot.style.transform = 'translate(-50%,-50%) scale(1)');
  });
})();

/* ── Scroll Progress Bar ─────────────────────────────── */
(function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;
  function update() {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
    bar.style.width = Math.min(scrolled * 100, 100) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Hero Canvas — Pure Bokeh Cinematic Background ───── */
(function initHeroCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, raf;
  let time = 0;
  let scrollY = 0;

  /* Bokeh orb definitions: [x%, y%, radius%, r, g, b, alpha, speed] */
  const ORBS = [
    { bx: 0.68, by: 0.40, br: 0.55, col: [210, 120, 45],  a: 0.22, sx: 0.04, sy: 0.03 },
    { bx: 0.18, by: 0.65, br: 0.45, col: [190, 95,  30],  a: 0.14, sx: 0.03, sy: 0.05 },
    { bx: 0.50, by: 0.18, br: 0.38, col: [225, 145, 55],  a: 0.12, sx: 0.05, sy: 0.02 },
    { bx: 0.85, by: 0.75, br: 0.30, col: [35,  110, 120], a: 0.08, sx: 0.02, sy: 0.04 },
    { bx: 0.10, by: 0.30, br: 0.28, col: [180, 80,  20],  a: 0.10, sx: 0.06, sy: 0.03 },
    { bx: 0.75, by: 0.10, br: 0.25, col: [240, 160, 70],  a: 0.09, sx: 0.04, sy: 0.06 },
    { bx: 0.35, by: 0.80, br: 0.32, col: [200, 100, 40],  a: 0.11, sx: 0.05, sy: 0.03 },
    { bx: 0.92, by: 0.45, br: 0.20, col: [50,  130, 140], a: 0.06, sx: 0.03, sy: 0.05 },
  ];

  /* Small sparkle particles */
  const sparks = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function buildSparks() {
    sparks.length = 0;
    for (let i = 0; i < 80; i++) {
      const warm = Math.random() > 0.65;
      sparks.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.8 + Math.random() * 3.5,
        a: 0.03 + Math.random() * 0.1,
        vy: -(0.015 + Math.random() * 0.04),
        hue: warm ? 28 + Math.random() * 15 : 185 + Math.random() * 15,
        sat: warm ? 70 : 45,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw() {
    time += 0.006;
    ctx.clearRect(0, 0, W, H);

    /* Base: deep espresso gradient */
    const base = ctx.createLinearGradient(0, 0, W * 0.5, H);
    base.addColorStop(0, '#0F0B08');
    base.addColorStop(0.5, '#141210');
    base.addColorStop(1, '#0A0806');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, W, H);

    /* Bokeh orbs — large, soft, drifting */
    ORBS.forEach((o, i) => {
      const px = (o.bx + Math.sin(time * o.sx + i * 1.1) * 0.07) * W;
      const py = (o.by + Math.cos(time * o.sy + i * 0.9) * 0.055) * H;
      const r  = o.br * Math.min(W, H);
      const scrollFade = Math.max(0, 1 - scrollY / (H * 0.6));
      const alpha = o.a * scrollFade;

      const g = ctx.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0,    `rgba(${o.col[0]},${o.col[1]},${o.col[2]},${alpha})`);
      g.addColorStop(0.45, `rgba(${o.col[0]},${o.col[1]},${o.col[2]},${alpha * 0.35})`);
      g.addColorStop(1,    `rgba(${o.col[0]},${o.col[1]},${o.col[2]},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    /* Moving light streaks — thin diagonal glints */
    for (let s = 0; s < 3; s++) {
      const st = (time * 0.04 + s * 0.33) % 1;
      const sx = st * (W + 400) - 200;
      const sy = -50;
      const ex = sx - 250;
      const ey = H + 50;
      const streakAlpha = 0.04 * Math.sin(Math.PI * st);
      const sg = ctx.createLinearGradient(sx, sy, ex, ey);
      sg.addColorStop(0, `rgba(240,180,90,0)`);
      sg.addColorStop(0.4, `rgba(240,180,90,${streakAlpha})`);
      sg.addColorStop(0.6, `rgba(240,180,90,${streakAlpha})`);
      sg.addColorStop(1, `rgba(240,180,90,0)`);
      ctx.save();
      ctx.fillStyle = sg;
      ctx.fillRect(ex - 6, sy, 12, H + 100);
      ctx.restore();
    }

    /* Floating sparkle particles */
    sparks.forEach(p => {
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      const pa = p.a * (0.7 + 0.3 * Math.sin(time * 2 + p.phase));
      const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
      pg.addColorStop(0, `hsla(${p.hue},${p.sat}%,68%,${pa})`);
      pg.addColorStop(1, `hsla(${p.hue},${p.sat}%,68%,0)`);
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
      ctx.fill();
    });

    /* Warm atmospheric haze at mid-height */
    const hazeY = H * 0.45;
    const haze = ctx.createLinearGradient(0, hazeY - 80, 0, hazeY + 120);
    haze.addColorStop(0, 'rgba(0,0,0,0)');
    haze.addColorStop(0.5, `rgba(190,110,40,${0.04 + 0.015 * Math.sin(time * 0.4)})`);
    haze.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = haze;
    ctx.fillRect(0, hazeY - 80, W, 200);

    /* Vignette: darken edges */
    const vig = ctx.createRadialGradient(W/2, H/2, H * 0.25, W/2, H/2, H * 0.95);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, `rgba(5,3,2,${0.5 + Math.min(scrollY / H, 1) * 0.25})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', () => { resize(); buildSparks(); }, { passive: true });

  resize();
  buildSparks();
  draw();
})();

/* ── IntersectionObserver — Staggered Reveal ─────────── */
(function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(el => observer.observe(el));
})();

/* ── 3D Card Tilt ────────────────────────────────────── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.card-3d');
  if (!cards.length) return;

  const STRENGTH = 12; /* degrees */

  cards.forEach(card => {
    const inner = card.querySelector('.card-inner');
    if (!inner) return;

    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = -dy * STRENGTH;
      const rotY   =  dx * STRENGTH;
      inner.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025)`;
    });

    card.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) scale(1)';
      inner.style.transition = 'transform 0.5s cubic-bezier(0.19,1,0.22,1)';
    });

    card.addEventListener('mouseenter', () => {
      inner.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s';
    });
  });
})();

/* ── KPI Counter Animation ───────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.counter);
    const prefix   = el.dataset.prefix   || '';
    const suffix   = el.dataset.suffix   || '';
    const duration = 1800;
    const start    = performance.now();
    const isFloat  = String(target).includes('.');

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      const value    = target * eased;
      el.textContent = prefix + (isFloat ? value.toFixed(1) : Math.floor(value)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  counters.forEach(el => observer.observe(el));
})();

/* ── Mouse Parallax on Hero ──────────────────────────── */
(function initParallax() {
  const hero    = document.getElementById('hero');
  const content = document.getElementById('heroContent');
  const icons   = hero ? hero.querySelector('.food-icons') : null;
  if (!hero || !content) return;

  const left  = content.querySelector('.hero-left');
  const right = content.querySelector('.hero-right');

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    targetX = (e.clientX - cx) / rect.width;
    targetY = (e.clientY - cy) / rect.height;
  });

  hero.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

  function tick() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    const cx = currentX * 18;
    const cy = currentY * 12;

    if (left)  left.style.transform  = `translate(${cx * 0.4}px, ${cy * 0.35}px)`;
    if (right) right.style.transform = `translate(${cx * -0.6}px, ${cy * -0.5}px)`;

    requestAnimationFrame(tick);
  }

  tick();
})();

/* ── KPI Bar Fill + Dashboard Bar Animation ──────────── */
(function initKpiBars() {
  const targets = document.querySelectorAll('.kpi-bar-fill, .kc-bar, .cgdbr-fill');
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  targets.forEach(el => observer.observe(el));
})();

/* ── Liquid Fill — bottom scroll trigger ─────────────── */
(function initLiquidFill() {
  const fill = document.getElementById('liquidFill');
  if (!fill) return;

  function update() {
    const doc       = document.documentElement;
    const scrollPct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);

    if (scrollPct >= 0.9) {
      const extra = (scrollPct - 0.9) / 0.1; /* 0 → 1 in last 10% */
      fill.classList.add('active');
      fill.style.height = (extra * 30) + 'px';
      fill.style.opacity = extra * 0.6;
    } else {
      fill.classList.remove('active');
      fill.style.height = '0px';
      fill.style.opacity = '0';
    }
  }

  window.addEventListener('scroll', update, { passive: true });
})();

/* ── Nav scroll shrink + blur ────────────────────────── */
(function initNavShrink() {
  const nav = document.getElementById('floatingNav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 80;
    nav.style.top = scrolled ? '0.75rem' : '1.5rem';
    nav.style.opacity = scrolled ? '0.94' : '1';
  }, { passive: true });
})();

/* ── Smooth anchor scroll ────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
})();
