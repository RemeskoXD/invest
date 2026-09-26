/* =============================================================
   GENESIS INVESTIÄŚNĂŤ SPOLEÄŚNOST â€” SCRIPT v2.0
   Ultra-Luxury Web3: Calculator, Chart, QR, Gold Dust, Nav
============================================================= */
'use strict';

/* =========================================================
   CONFIG
========================================================= */
const CFG = {
  IBAN:          'CZ0355000000006037774568',
  BIC:           'RZBCCZPP',
  COMPANY:       'G3NE5IS s.r.o.',
  BASE_RATE:     0.035,
  YEAR_INC:      0.001,
  BONUS_RATE:    0.005,
  BONUS_YEARS:   20,
  FEE_CZK:       2000,
};

/* =========================================================
   FORMATTING UTILITIES
========================================================= */
const fmtCZK = (n) =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency', currency: 'CZK',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Math.round(n));

const fmtPct = (r) => (r * 100).toFixed(1).replace('.', ',') + ' %';

const fmtYears = (y) =>
  y === 1 ? '1 rok' : y < 5 ? `${y} roky` : `${y} let`;

function getTodayVS() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
}

/* =========================================================
   CALCULATOR MATH
========================================================= */
function getRate(years) {
  let r = CFG.BASE_RATE + (years - 1) * CFG.YEAR_INC;
  if (years === CFG.BONUS_YEARS) r += CFG.BONUS_RATE;
  return r;
}

function calcReturn(principal, years) {
  const rate  = getRate(years);
  const total = principal * Math.pow(1 + rate, years);
  const grossGain = total - principal;
  const netGain = grossGain * 0.85; // 15% tax
  const netTotal = principal + netGain;
  return { rate, total: netTotal, grossGain, netGain };
}

/* =========================================================
   SLIDER STATE
========================================================= */
let calcAmount = 100000;
let calcYears  = 5;
let prevYears  = 5;

function updateCalc() {
  const { rate, total, grossGain, netGain } = calcReturn(calcAmount, calcYears);

  // Display values
  setText('amount-display', fmtCZK(calcAmount));
  setText('years-display',  fmtYears(calcYears));
  setText('result-total',   fmtCZK(total));
  setText('result-gain-gross', `HrubĂ˝ vĂ˝nos: + ${fmtCZK(grossGain)}`);
  setText('result-gain-net',   `ÄŚistĂ˝ vĂ˝nos: + ${fmtCZK(netGain)}`);
  setText('param-rate',     fmtPct(rate));
  setText('param-years',    fmtYears(calcYears));

  // Slider fills
  updateSliderFill('amount-slider', 10000, 5000000, calcAmount);
  updateSliderFill('years-slider',  1, 20, calcYears);

  // Bonus badge
  const bonusEl = document.getElementById('calc-bonus');
  if (bonusEl) {
    if (calcYears === CFG.BONUS_YEARS) {
      bonusEl.classList.add('visible');
      // Fire gold dust only when crossing into 20
      if (prevYears !== CFG.BONUS_YEARS) fireGoldDust();
    } else {
      bonusEl.classList.remove('visible');
    }
  }
  prevYears = calcYears;

  // Pre-fill form
  setVal('inp-amount', calcAmount);
  setVal('inp-years',  calcYears);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}

function updateSliderFill(id, min, max, val) {
  const el = document.getElementById(id);
  if (!el) return;
  const pct = ((val - min) / (max - min)) * 100;
  el.style.background = `linear-gradient(to right, var(--emerald) 0%, var(--emerald-mid) ${pct}%, var(--gray-200) ${pct}%, var(--gray-200) 100%)`;
}

/* =========================================================
   GOLD DUST ANIMATION (20-year loyalty bonus)
========================================================= */
const goldCanvas  = document.getElementById('gold-dust-canvas');
let goldParticles = [];
let goldAnimId    = null;

function fireGoldDust() {
  if (!goldCanvas) return;
  goldCanvas.style.display = 'block';
  goldCanvas.width  = window.innerWidth;
  goldCanvas.height = window.innerHeight;
  const ctx = goldCanvas.getContext('2d');
  goldParticles = [];

  // Spawn particles from bottom-center
  for (let i = 0; i < 180; i++) {
    goldParticles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
      y: window.innerHeight * 0.65,
      vx: (Math.random() - 0.5) * 6,
      vy: -(Math.random() * 8 + 3),
      radius: Math.random() * 4 + 1,
      alpha: 1,
      color: Math.random() > 0.5 ? '#D4AF37' : '#E8CC6A',
      decay: Math.random() * 0.012 + 0.008,
      gravity: 0.12,
    });
  }

  cancelAnimationFrame(goldAnimId);

  function animateDust() {
    ctx.clearRect(0, 0, goldCanvas.width, goldCanvas.height);
    let alive = false;
    for (const p of goldParticles) {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;
      if (p.alpha <= 0) continue;
      alive = true;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (alive) {
      goldAnimId = requestAnimationFrame(animateDust);
    } else {
      goldCanvas.style.display = 'none';
    }
  }
  animateDust();
}

/* =========================================================
   CHART â€” ANIMATED GROWTH
========================================================= */
function initChart() {
  const canvas = document.getElementById('growthChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const yrs    = 20;
  const labels = ['Start', ...Array.from({length: yrs}, (_, i) => `Rok ${i + 1}`)];

  function genGenesis() {
    const d = [100];
    for (let yr = 1; yr <= yrs; yr++) {
      const r = getRate(yr);
      const noise = (Math.random() * 0.005) - 0.001;
      const prev  = d[d.length - 1];
      d.push(+(prev * (1 + r + noise)).toFixed(2));
    }
    return d;
  }

  function genBank() {
    const d = [100];
    for (let yr = 1; yr <= yrs; yr++) {
      d.push(+(d[d.length - 1] * 1.007).toFixed(2));
    }
    return d;
  }

  const genesis = genGenesis();
  const bank    = genBank();
  const ctx     = canvas.getContext('2d');

  const gGrad = ctx.createLinearGradient(0, 0, 0, 340);
  gGrad.addColorStop(0, 'rgba(4, 74, 34, 0.28)');
  gGrad.addColorStop(1, 'rgba(4, 74, 34, 0)');

  const bGrad = ctx.createLinearGradient(0, 0, 0, 340);
  bGrad.addColorStop(0, 'rgba(150, 150, 150, 0.12)');
  bGrad.addColorStop(1, 'rgba(150, 150, 150, 0)');

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Portfolio Genesis',
          data: genesis,
          borderColor: '#044A22',
          backgroundColor: gGrad,
          borderWidth: 2,
          fill: true,
          tension: 0.5,
          pointRadius: 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#044A22',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
        {
          label: 'BankovnĂ­ vklad',
          data: bank,
          borderColor: 'rgba(180, 180, 195, 0.8)',
          backgroundColor: bGrad,
          borderWidth: 1.5,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          borderDash: [6, 5],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(5, 20, 12, 0.93)',
          titleColor: 'rgba(255,255,255,0.6)',
          bodyColor: '#fff',
          padding: 16,
          cornerRadius: 10,
          titleFont: { family: 'Inter', size: 11, weight: '400' },
          bodyFont: { family: 'Inter', size: 12, weight: '600' },
          callbacks: {
            label(c) {
              const g = (c.parsed.y - 100).toFixed(1);
              return `${c.dataset.label}: ${c.parsed.y.toFixed(1)} (${g >= 0 ? '+' : ''}${g} %)`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
          ticks: {
            color: '#9999AA',
            font: { family: 'Inter', size: 10 },
            maxTicksLimit: 11,
          },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.03)', drawBorder: false },
          ticks: {
            color: '#9999AA',
            font: { family: 'Inter', size: 10 },
            callback: v => v + ' %',
          },
        },
      },
      animation: { duration: 2400, easing: 'easeInOutQuart' },
    },
  });

  // Live pulse â€” update every 3.8s
  setInterval(() => {
    const updated = genesis.map((v, i) => {
      if (i === 0) return v;
      return +(v * (1 + (Math.random() * 0.003 - 0.0005))).toFixed(2);
    });
    // Ensure global uptrend
    for (let i = 1; i < updated.length; i++) {
      if (updated[i] <= updated[i - 1]) {
        updated[i] = +(updated[i - 1] * 1.004).toFixed(2);
      }
    }
    chart.data.datasets[0].data = updated;
    chart.update('none');
    const gain = (updated[yrs] - 100).toFixed(0);
    const lv = document.getElementById('chart-live-val');
    if (lv) lv.textContent = `+${gain} %`;
  }, 3800);
}

/* =========================================================
   NAVIGATION
========================================================= */
const navEl    = document.getElementById('main-nav');
const hambEl   = document.getElementById('hamburger');
const linksEl  = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
  navEl?.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

if (hambEl && linksEl) {
  const closeNav = () => {
    linksEl.classList.remove('open');
    hambEl.classList.remove('open');
    hambEl.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hambEl.addEventListener('click', () => {
    const open = linksEl.classList.toggle('open');
    hambEl.classList.toggle('open', open);
    hambEl.setAttribute('aria-expanded', open.toString());
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close button inside mobile overlay
  const closeBtnEl = document.getElementById('nav-close');
  if (closeBtnEl) closeBtnEl.addEventListener('click', closeNav);

  // Close on link click
  linksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeNav);
  });

  // Close on backdrop tap (click outside links container)
  linksEl.addEventListener('click', (e) => {
    if (e.target === linksEl) closeNav();
  });
}

/* =========================================================
   SMOOTH SCROLL (with nav offset)
========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const tgt = document.querySelector(a.getAttribute('href'));
    if (!tgt) return;
    e.preventDefault();
    const top = tgt.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* =========================================================
   SCROLL REVEAL
========================================================= */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -56px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
  revealObs.observe(el);
});

/* =========================================================
   ACTIVE NAV ON SCROLL
========================================================= */
const secs    = document.querySelectorAll('section[id]');
const navLnks = document.querySelectorAll('.nav__link[href^="#"]');
const navObs  = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLnks.forEach(l => {
        l.classList.toggle('nav__link--featured', l.getAttribute('href') === `#${e.target.id}`);
      });
    }
  });
}, { rootMargin: '-80px 0px -40% 0px', threshold: 0 });
secs.forEach(s => navObs.observe(s));

/* =========================================================
   HERO COUNTER ANIMATION
========================================================= */
function animateCounter(el, end, duration = 1800) {
  const start    = 0;
  const startTs  = performance.now();
  const step = (ts) => {
    const elapsed = ts - startTs;
    const pct     = Math.min(elapsed / duration, 1);
    // ease out
    const val = Math.round(start + (end - start) * (1 - Math.pow(1 - pct, 3)));
    el.textContent = `+${val} %`;
    if (pct < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* =========================================================
   MODAL â€” OPEN / CLOSE
========================================================= */
let investorType = 'FO';

function openModal() {
  const m = document.getElementById('invest-modal');
  m?.classList.add('open');
  document.body.style.overflow = 'hidden';
  
  // reset steps
  const s1 = document.getElementById('modal-step-1');
  const s2 = document.getElementById('modal-step-2');
  if (s1) s1.style.display = 'block';
  if (s2) s2.style.display = 'none';
  
  const chk = document.getElementById('legal-check');
  if (chk) chk.checked = false;
  toggleSubmitBtn();

  setVal('inp-amount', calcAmount);
  setVal('inp-years',  calcYears);
  setTimeout(() => document.getElementById('inp-name')?.focus(), 80);
}
function closeModal() {
  document.getElementById('invest-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('invest-modal')?.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

function setType(t) {
  investorType = t;
  document.getElementById('btn-fo')?.classList.toggle('active', t === 'FO');
  document.getElementById('btn-sro')?.classList.toggle('active', t === 'SRO');
  document.getElementById('btn-fo')?.setAttribute('aria-pressed', (t === 'FO').toString());
  document.getElementById('btn-sro')?.setAttribute('aria-pressed', (t === 'SRO').toString());
  const ni = document.getElementById('inp-name');
  if (ni) ni.placeholder = t === 'FO' ? 'Jan NovĂˇk' : 'ABC investice s.r.o.';
}

/* =========================================================
   FORM VALIDATION & SUBMISSION
========================================================= */
function goToStep2() {
  const name   = document.getElementById('inp-name')?.value.trim();
  const street = document.getElementById('inp-street')?.value.trim();
  const city   = document.getElementById('inp-city')?.value.trim();
  const dob    = document.getElementById('inp-dob')?.value;
  const email  = document.getElementById('inp-email')?.value.trim();
  const amount = parseInt(document.getElementById('inp-amount')?.value);
  const years  = parseInt(document.getElementById('inp-years')?.value);

  if (!name || !street || !city || !dob || !email || !amount || !years) {
    showFormErr('ProsĂ­m vyplĹte vĹˇechna povinnĂˇ pole oznaÄŤenĂˇ *.');
    return;
  }
  if (amount < 10000) { showFormErr('MinimĂˇlnĂ­ vĂ˝Ĺˇe investice je 10 000 KÄŤ.'); return; }
  if (years < 1 || years > 20) { showFormErr('DĂ©lka investice musĂ­ bĂ˝t 1 aĹľ 20 let.'); return; }

  const errEl = document.getElementById('form-err');
  if (errEl) errEl.remove();

  const s1 = document.getElementById('modal-step-1');
  const s2 = document.getElementById('modal-step-2');
  if (s1 && s2) {
    s1.style.display = 'none';
    s2.style.display = 'block';
  }
}

function goToStep1() {
  const s1 = document.getElementById('modal-step-1');
  const s2 = document.getElementById('modal-step-2');
  if (s1 && s2) {
    s2.style.display = 'none';
    s1.style.display = 'block';
  }
}

function toggleSubmitBtn() {
  const chk = document.getElementById('legal-check');
  const btn = document.getElementById('form-submit');
  if (chk && btn) btn.disabled = !chk.checked;
}

function handleSubmit(e) {
  e.preventDefault();
  const name   = document.getElementById('inp-name')?.value.trim();
  const street = document.getElementById('inp-street')?.value.trim();
  const city   = document.getElementById('inp-city')?.value.trim();
  const dob    = document.getElementById('inp-dob')?.value;
  const email  = document.getElementById('inp-email')?.value.trim();
  const amount = parseInt(document.getElementById('inp-amount')?.value);
  const years  = parseInt(document.getElementById('inp-years')?.value);

  const vs    = getTodayVS();
  const spayd = [
    'SPD*1.0',
    `ACC:${CFG.IBAN}+${CFG.BIC}`,
    `AM:${amount.toFixed(2)}`,
    'CC:CZK',
    `MSG:Dluhopis G3NE5IS - ${name}`,
    `X-VS:${vs}`,
    `RN:${CFG.COMPANY}`,
  ].join('*');

  // Save to localStorage
  const order = {
    id: vs + '_' + Date.now(),
    timestamp:       new Date().toISOString(),
    investorType,
    name, street, city, dob, email,
    phone:            document.getElementById('inp-phone')?.value.trim() || '',
    beneficiary:      document.getElementById('inp-bene')?.value.trim() || '',
    beneficiaryYear:  document.getElementById('inp-bene-yr')?.value.trim() || '',
    amount, years,
    vs,
    rate:   getRate(years),
    status: 'pending',
  };
  const all = JSON.parse(localStorage.getItem('genesis_orders') || '[]');
  all.push(order);
  localStorage.setItem('genesis_orders', JSON.stringify(all));

  closeModal();
  openQR(spayd, vs);
}

function showFormErr(msg) {
  let el = document.getElementById('form-err');
  if (!el) {
    el = document.createElement('div');
    el.id = 'form-err';
    Object.assign(el.style, {
      color: '#9b3a32', background: '#fdf2f0',
      border: '1px solid #f5c6cb', borderRadius: '8px',
      padding: '12px 16px', fontSize: '0.875rem',
      marginBottom: '16px',
    });
    document.getElementById('invest-form')?.prepend(el);
  }
  el.textContent = msg;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* =========================================================
   QR CODE MODAL
========================================================= */
function openQR(spayd, vs) {
  const m = document.getElementById('qr-modal');
  m?.classList.add('open');
  document.body.style.overflow = 'hidden';
  setText('vs-display', vs);

  const qc = document.getElementById('qr-canvas');
  if (qc && typeof QRCode !== 'undefined') {
    const ctx2 = qc.getContext('2d');
    ctx2.clearRect(0, 0, qc.width, qc.height);
    QRCode.toCanvas(qc, spayd, {
      width: 200, margin: 2,
      color: { dark: '#044A22', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }, err => {
      if (err) { console.error('QR error:', err); qc.style.display = 'none'; }
    });
  }
}
function closeQR() {
  document.getElementById('qr-modal')?.classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('invest-form')?.reset();
  document.getElementById('form-err')?.remove();
}
document.getElementById('qr-modal')?.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeQR();
});

/* =========================================================
   DOMContentLoaded INIT
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Slider events
  const amtSlider = document.getElementById('amount-slider');
  const yrSlider  = document.getElementById('years-slider');
  amtSlider?.addEventListener('input', e => { calcAmount = parseInt(e.target.value); updateCalc(); });
  yrSlider?.addEventListener('input',  e => { calcYears  = parseInt(e.target.value); updateCalc(); });
  updateCalc();

  // Trigger nav scroll check
  navEl?.classList.toggle('scrolled', window.scrollY > 30);
});

/* =========================================================
   WINDOW LOAD â€” CHART & COUNTER
========================================================= */
window.addEventListener('load', () => {
  initChart();

  // Animate hero badge counter once in view
  const badge = document.getElementById('badge-counter');
  if (badge) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateCounter(badge, 184, 2000);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(badge);
  }

  // Tile keyboard a11y
  document.querySelectorAll('.invest-card').forEach(card => {
    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); }
    });
  });
});

/* =========================================================
   RESIZE: update gold canvas size
========================================================= */
window.addEventListener('resize', () => {
  if (goldCanvas && goldCanvas.style.display !== 'none') {
    goldCanvas.width  = window.innerWidth;
    goldCanvas.height = window.innerHeight;
  }
}, { passive: true });

/* =========================================================
   CONSOLE SIGNATURE
========================================================= */
console.log('%câ¬ˇ G3NE5IS InvestiÄŤnĂ­ SpoleÄŤnost', 'font-family:Georgia,serif;font-size:1.3rem;color:#044A22;font-weight:bold;');
console.log('%c  Emerald Â· Stability Â· Trust Â© 2026', 'color:#D4AF37;font-size:0.85rem;');

