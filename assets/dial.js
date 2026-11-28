// Hero dial: one day as 288 five-minute ticks. On load the hand sweeps once and every
// tick it passes turns sand, the day handed back. Afterwards the hand follows a mouse.
(() => {
  const canvas = document.querySelector('.hero .dial');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = getComputedStyle(document.documentElement);
  const [STEEL, DUNE, LUME] = ['--steel', '--dune', '--lume'].map(n => css.getPropertyValue(n).trim());
  const TICKS = 288, TAU = Math.PI * 2, SWEEP_AT = 650, SWEEP_FOR = 2600;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  const clamp = t => Math.min(1, Math.max(0, t));
  const gap = (a, b) => Math.abs(((a - b + Math.PI * 3) % TAU) - Math.PI);

  let size = 0, start = 0, frame = 0;
  let grow = still ? 1 : 0, sweep = still ? 1 : 0, hand = 0, target = 0;

  function draw() {
    const s = size, c = s / 2, R = s * .485;
    ctx.clearRect(0, 0, s, s);
    ctx.lineCap = 'round';
    const swept = ease(sweep) * TAU;
    for (let i = 0; i < TICKS; i++) {
      const a = i / TICKS * TAU;
      const hour = i % 12 === 0, half = i % 6 === 0;
      const g = ease(clamp(grow * 1.6 - i / TICKS * .6));
      if (!g) continue;
      const near = Math.max(0, 1 - gap(a, hand) / .32);
      const len = s * (hour ? .055 : half ? .034 : .02) * g * (1 + near * .7);
      const x = Math.sin(a), y = -Math.cos(a);
      ctx.beginPath();
      ctx.moveTo(c + x * R, c + y * R);
      ctx.lineTo(c + x * (R - len), c + y * (R - len));
      ctx.lineWidth = hour ? 2 : 1.25;
      const back = sweep >= 1 || a <= swept;
      ctx.strokeStyle = back ? DUNE : STEEL;
      ctx.globalAlpha = back ? 1 : .38;
      ctx.stroke();
      if (near) { ctx.strokeStyle = LUME; ctx.globalAlpha = near; ctx.stroke(); }
    }
    ctx.fillStyle = STEEL;
    ctx.font = `340 ${Math.round(s * .034)}px "Noto Serif Display", Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    [24, 6, 12, 18].forEach((n, k) => {
      const a = k * TAU / 4, r = R - s * .1;
      ctx.globalAlpha = grow * clamp(gap(a, hand) / .3); // the hand's ball covers the numeral it passes
      ctx.fillText(n, c + Math.sin(a) * r, c - Math.cos(a) * r);
    });
    // The hand copies the Q's stem: a straight line ending in a ball.
    ctx.globalAlpha = clamp(grow * 2 - .4);
    const hx = Math.sin(hand), hy = -Math.cos(hand), tip = R - s * .075;
    ctx.strokeStyle = ctx.fillStyle = DUNE;
    ctx.lineWidth = Math.max(1.5, s * .006);
    ctx.beginPath();
    ctx.moveTo(c - hx * s * .05, c - hy * s * .05);
    ctx.lineTo(c + hx * tip, c + hy * tip);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(c + hx * tip, c + hy * tip, s * .014, 0, TAU);
    ctx.arc(c, c, s * .012, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function tick(now) {
    frame = 0;
    start ||= now;
    const t = now - start;
    grow = still ? 1 : clamp(t / 1100);
    sweep = still ? 1 : clamp((t - SWEEP_AT) / SWEEP_FOR);
    let busy = !still && sweep < 1;
    if (busy) hand = target = ease(sweep) * TAU % TAU;
    else {
      const d = ((target - hand + Math.PI * 3) % TAU) - Math.PI;
      hand = (hand + d * .14 + TAU) % TAU;
      busy = Math.abs(d) > .002;
    }
    draw();
    if (busy) frame = requestAnimationFrame(tick);
  }
  const kick = () => { frame ||= requestAnimationFrame(tick); };

  new ResizeObserver(() => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    size = canvas.clientWidth;
    canvas.width = canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }).observe(canvas);
  document.fonts.load(`340 20px "Noto Serif Display"`).then(draw, () => {});

  if (!still) {
    canvas.closest('.hero').addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || sweep < 1) return;
      const r = canvas.getBoundingClientRect();
      target = (Math.atan2(e.clientX - r.left - r.width / 2, r.top + r.height / 2 - e.clientY) + TAU) % TAU;
      kick();
    });
  }
  kick();
})();
