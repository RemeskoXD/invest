/* =============================================================
   G3NE5IS HOLDINGOVÁ SPOLEČNOST — SCRIPT v3.0
   Kalkulačky (Standard + VIP), graf, výběr zóny, QR platba, navigace
============================================================= */
'use strict';

/* =========================================================
   CONFIG — jediný zdroj pravdy pro sazby
========================================================= */
const CFG = Object.freeze({
  IBAN:      'CZ0355000000006037774568',
  BIC:       'RZBCCZPP',
  COMPANY:   'G3NE5IS s.r.o.',
  FEE_CZK:   2000,
  TAX_RATE:  0.15,
  MIN_YEARS: 1,
  MAX_YEARS: 20,
  STANDARD: Object.freeze({
    MIN_AMOUNT:  10000,
    MAX_AMOUNT:  999999,
    BASE_RATE:   0.045,  // 4,5 % p.a. za 1 rok
    YEAR_INC:    0.001,  // +0,1 % za každý další rok
    BONUS_RATE:  0.006,  // věrnostní bonus při 20 letech → 7,0 %
    BONUS_YEARS: 20,
  }),
  VIP: Object.freeze({
    MIN_AMOUNT: 1000000,
    RATE:       0.07,    // 7,0 % p.a. od prvního dne
  }),
  BANK_RATE: 0.007,      // srovnávací bankovní vklad
});

const TIERS = Object.freeze({ STANDARD: 'standard', VIP: 'vip' });

/* =========================================================
   i18n HELPER — texty z translations.js (fallback čeština)
========================================================= */
function T(key) {
  const site = window.SITE_T;
  if (site && site[key] !== undefined) return site[key];
  const cs = window.TRANSLATIONS && window.TRANSLATIONS.cs;
  if (cs && cs[key] !== undefined) return cs[key];
  return key;
}

/* =========================================================
   FORMATTING
========================================================= */
const czkFormatter = new Intl.NumberFormat('cs-CZ', {
  style: 'currency', currency: 'CZK',
  minimumFractionDigits: 0, maximumFractionDigits: 0,
});
const fmtCZK = (n) => czkFormatter.format(Math.round(n));
const fmtPct = (r) => (r * 100).toFixed(1).replace('.', ',') + ' %';

function fmtYears(y) {
  if (y === 1) return `1 ${T('yr_one')}`;
  if (y >= 2 && y <= 4) return `${y} ${T('yr_few')}`;
  return `${y} ${T('yr_many')}`;
}

function getTodayVS() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

/* =========================================================
   RATE MATH
========================================================= */
function getRate(years, tier = TIERS.STANDARD) {
  if (tier === TIERS.VIP) return CFG.VIP.RATE;
  const s = CFG.STANDARD;
  let r = s.BASE_RATE + (years - 1) * s.YEAR_INC;
  if (years === s.BONUS_YEARS) r += s.BONUS_RATE;
  return Math.round(r * 10000) / 10000; // odstranění chyb plovoucí čárky
}

function calcReturn(principal, years, tier) {
  const rate      = getRate(years, tier);
  const gross     = principal * Math.pow(1 + rate, years);
  const grossGain = gross - principal;
  const netGain   = grossGain * (1 - CFG.TAX_RATE);
  return { rate, grossTotal: gross, netTotal: principal + netGain, grossGain, netGain };
}

/* =========================================================
   DOM HELPERS
========================================================= */
const $ = (id) => document.getElementById(id);
function setText(id, val) { const el = $(id); if (el) el.textContent = val; }
function setVal(id, val)  { const el = $(id); if (el) el.value = val; }

function updateSliderFill(id, val, theme = 'emerald') {
  const el = $(id);
  if (!el) return;
  const min = Number(el.min), max = Number(el.max);
  const pct = ((val - min) / (max - min)) * 100;
  el.style.background = theme === 'gold'
    ? `linear-gradient(to right, #8C6A2F 0%, #E9CF94 ${pct}%, rgba(200,169,110,0.18) ${pct}%, rgba(200,169,110,0.18) 100%)`
    : `linear-gradient(to right, var(--emerald) 0%, var(--emerald-mid) ${pct}%, var(--gray-200) ${pct}%, var(--gray-200) 100%)`;
}

/* =========================================================
   STANDARD CALCULATOR
========================================================= */
let calcAmount = 100000;
let calcYears  = 5;
let prevYears  = 5;

function updateCalc() {
  const { rate, netTotal, grossGain, netGain } = calcReturn(calcAmount, calcYears, TIERS.STANDARD);

  setText('amount-display',    fmtCZK(calcAmount));
  setText('years-display',     fmtYears(calcYears));
  setText('result-total',      fmtCZK(netTotal));
  setText('result-gain-gross', `${T('calc_gross')}: + ${fmtCZK(grossGain)}`);
  setText('result-gain-net',   `${T('calc_net')}: + ${fmtCZK(netGain)}`);
  setText('param-rate',        fmtPct(rate));
  setText('param-years',       fmtYears(calcYears));

  updateSliderFill('amount-slider', calcAmount);
  updateSliderFill('years-slider',  calcYears);

  const bonusEl = $('calc-bonus');
  if (bonusEl) {
    const isBonus = calcYears === CFG.STANDARD.BONUS_YEARS;
    bonusEl.classList.toggle('visible', isBonus);
    if (isBonus && prevYears !== CFG.STANDARD.BONUS_YEARS) fireGoldDust();
  }
  prevYears = calcYears;
}

/* =========================================================
   VIP CALCULATOR (od 1 000 000 Kč — 7 % p.a.)
========================================================= */
let vipAmount = 2000000;
let vipYears  = 5;

function updateVipCalc() {
  const { rate, netTotal, grossGain, netGain } = calcReturn(vipAmount, vipYears, TIERS.VIP);

  setText('vip-amount-display', fmtCZK(vipAmount));
  setText('vip-years-display',  fmtYears(vipYears));
  setText('vip-result-total',   fmtCZK(netTotal));
  setText('vip-gain-gross',     `${T('calc_gross')}: + ${fmtCZK(grossGain)}`);
  setText('vip-gain-net',       `${T('calc_net')}: + ${fmtCZK(netGain)}`);
  setText('vip-param-rate',     fmtPct(rate));
  setText('vip-param-years',    fmtYears(vipYears));

  updateSliderFill('vip-amount-slider', vipAmount, 'gold');
  updateSliderFill('vip-years-slider',  vipYears,  'gold');
}

/* =========================================================
   GOLD DUST ANIMATION (20letý věrnostní bonus)
========================================================= */
const goldCanvas  = $('gold-dust-canvas');
let goldParticles = [];
let goldAnimId    = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function fireGoldDust() {
  if (!goldCanvas || prefersReducedMotion) return;
  goldCanvas.style.display = 'block';
  goldCanvas.width  = window.innerWidth;
  goldCanvas.height = window.innerHeight;
  const ctx = goldCanvas.getContext('2d');
  goldParticles = [];

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
   CHART — modelový vývoj (20 let, sazba 7 % p.a.)
========================================================= */
const MODEL_YEARS = 20;
const MODEL_RATE  = getRate(MODEL_YEARS, TIERS.STANDARD); // 7,0 %
const MODEL_GAIN_PCT = Math.round((Math.pow(1 + MODEL_RATE, MODEL_YEARS) - 1) * 100); // 287

function initChart() {
  const canvas = $('growthChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels  = [T('chart_start'), ...Array.from({ length: MODEL_YEARS }, (_, i) => `${T('chart_year')} ${i + 1}`)];
  const genesis = Array.from({ length: MODEL_YEARS + 1 }, (_, y) => +(100 * Math.pow(1 + MODEL_RATE, y)).toFixed(2));
  const bank    = Array.from({ length: MODEL_YEARS + 1 }, (_, y) => +(100 * Math.pow(1 + CFG.BANK_RATE, y)).toFixed(2));
  const ctx     = canvas.getContext('2d');

  const gGrad = ctx.createLinearGradient(0, 0, 0, 340);
  gGrad.addColorStop(0, 'rgba(4, 74, 34, 0.28)');
  gGrad.addColorStop(1, 'rgba(4, 74, 34, 0)');

  const bGrad = ctx.createLinearGradient(0, 0, 0, 340);
  bGrad.addColorStop(0, 'rgba(150, 150, 150, 0.12)');
  bGrad.addColorStop(1, 'rgba(150, 150, 150, 0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: T('growth_legend1'),
          data: genesis,
          borderColor: '#044A22',
          backgroundColor: gGrad,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#044A22',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        },
        {
          label: T('growth_legend2'),
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
              const g = (c.parsed.y - 100).toFixed(1).replace('.', ',');
              return `${c.dataset.label}: +${g} %`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(0,0,0,0.03)' },
          ticks: { color: '#9999AA', font: { family: 'Inter', size: 10 }, maxTicksLimit: 11 },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.03)' },
          ticks: { color: '#9999AA', font: { family: 'Inter', size: 10 }, callback: (v) => v + ' %' },
        },
      },
      animation: prefersReducedMotion ? false : { duration: 2400, easing: 'easeInOutQuart' },
    },
  });

  setText('chart-live-val', `+${MODEL_GAIN_PCT} %`);
}

/* =========================================================
   NAVIGATION
========================================================= */
const navEl   = $('main-nav');
const hambEl  = $('hamburger');
const linksEl = $('nav-links');

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

  $('nav-close')?.addEventListener('click', closeNav);
  linksEl.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeNav));
  linksEl.addEventListener('click', (e) => { if (e.target === linksEl) closeNav(); });
}

/* =========================================================
   SMOOTH SCROLL (s odsazením navigace)
========================================================= */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const tgt = document.querySelector(href);
    if (!tgt) return;
    e.preventDefault();
    const top = tgt.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    history.replaceState(null, '', href);
  });
});

/* =========================================================
   SCROLL REVEAL
========================================================= */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -56px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => revealObs.observe(el));

/* =========================================================
   ACTIVE NAV ON SCROLL
========================================================= */
const navLnks = document.querySelectorAll('.nav__link[href^="#"]');
const navObs  = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      navLnks.forEach((l) => {
        l.classList.toggle('nav__link--featured', l.getAttribute('href') === `#${e.target.id}`);
      });
    }
  });
}, { rootMargin: '-80px 0px -40% 0px', threshold: 0 });
document.querySelectorAll('section[id]').forEach((s) => navObs.observe(s));

/* =========================================================
   HERO COUNTER
========================================================= */
function animateCounter(el, end, duration = 1800) {
  if (prefersReducedMotion) { el.textContent = `+${end} %`; return; }
  const startTs = performance.now();
  const step = (ts) => {
    const pct = Math.min((ts - startTs) / duration, 1);
    el.textContent = `+${Math.round(end * (1 - Math.pow(1 - pct, 3)))} %`;
    if (pct < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* =========================================================
   MODAL — výběr zóny → údaje → potvrzení
========================================================= */
let investorType = 'FO';
let selectedTier = null;
let lastFocused  = null;

function isModalOpen(id) { return $(id)?.classList.contains('open') ?? false; }

function showStep(n) {
  [0, 1, 2].forEach((i) => {
    const el = $(`modal-step-${i}`);
    if (el) el.hidden = i !== n;
  });
  const box = document.querySelector('#invest-modal .modal-box');
  if (box) box.scrollTop = 0;
  const focusTarget = {
    0: () => document.querySelector('.tier-card.active') || $('tier-standard'),
    1: () => $('inp-name'),
    2: () => $('legal-check'),
  }[n];
  setTimeout(() => focusTarget?.()?.focus(), 60);
}

function openModal(preTier) {
  lastFocused = document.activeElement;
  $('invest-modal')?.classList.add('open');
  document.body.style.overflow = 'hidden';

  $('form-err')?.remove();
  const chk = $('legal-check');
  if (chk) chk.checked = false;
  toggleSubmitBtn();

  selectedTier = null;
  document.querySelectorAll('.tier-card').forEach((c) => {
    c.classList.remove('active');
    c.setAttribute('aria-checked', 'false');
  });
  const next = $('tier-next');
  if (next) next.disabled = true;

  if (preTier === TIERS.STANDARD || preTier === TIERS.VIP) selectTier(preTier);
  showStep(0);
}

function closeModal() {
  $('invest-modal')?.classList.remove('open');
  document.body.style.overflow = '';
  lastFocused?.focus?.();
}

function selectTier(tier) {
  if (tier !== TIERS.STANDARD && tier !== TIERS.VIP) return;
  selectedTier = tier;

  document.querySelectorAll('.tier-card').forEach((c) => {
    const on = c.dataset.tier === tier;
    c.classList.toggle('active', on);
    c.setAttribute('aria-checked', on.toString());
  });
  const next = $('tier-next');
  if (next) next.disabled = false;

  // Předvyplnění parametrů z odpovídající kalkulačky
  const amountInp = $('inp-amount');
  if (tier === TIERS.VIP) {
    setVal('inp-amount', vipAmount);
    setVal('inp-years',  vipYears);
    if (amountInp) { amountInp.min = String(CFG.VIP.MIN_AMOUNT); amountInp.removeAttribute('max'); amountInp.placeholder = '1000000'; }
  } else {
    setVal('inp-amount', calcAmount);
    setVal('inp-years',  calcYears);
    if (amountInp) { amountInp.min = String(CFG.STANDARD.MIN_AMOUNT); amountInp.max = String(CFG.STANDARD.MAX_AMOUNT); amountInp.placeholder = '100000'; }
  }
  renderTierBadge();
}

function renderTierBadge() {
  const badge = $('tier-badge');
  if (!badge || !selectedTier) return;
  const isVip = selectedTier === TIERS.VIP;
  badge.classList.toggle('tier-badge--vip', isVip);
  setText('tier-badge-name', isVip ? T('tier_vip_name') : T('tier_std_name'));
  setText('tier-badge-rate', isVip ? T('tier_vip_rate') : T('tier_std_rate'));
}

function goToStep1() {
  if (!selectedTier) return;
  showStep(1);
}

function backToStep1() { showStep(1); }

function setType(t) {
  investorType = t === 'SRO' ? 'SRO' : 'FO';
  ['fo', 'sro'].forEach((k) => {
    const btn = $(`btn-${k}`);
    const on  = (k === 'fo') === (investorType === 'FO');
    btn?.classList.toggle('active', on);
    btn?.setAttribute('aria-pressed', on.toString());
  });
  const ni = $('inp-name');
  if (ni) ni.placeholder = investorType === 'FO' ? T('ph_name_fo') : T('ph_name_sro');
}

/* =========================================================
   FORM VALIDATION & SUBMISSION
========================================================= */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readForm() {
  const val = (id) => ($(id)?.value || '').trim();
  return {
    name:   val('inp-name'),
    street: val('inp-street'),
    city:   val('inp-city'),
    dob:    val('inp-dob'),
    email:  val('inp-email'),
    phone:  val('inp-phone'),
    bene:   val('inp-bene'),
    beneYr: val('inp-bene-yr'),
    amount: Number(val('inp-amount')),
    years:  Number(val('inp-years')),
  };
}

/** Vrací chybovou hlášku nebo null, pokud jsou data v pořádku. */
function validateForm(d) {
  if (!selectedTier) return T('err_tier');
  if (!d.name || !d.street || !d.city || !d.dob || !d.email || !d.amount || !d.years) return T('err_required');
  if (!EMAIL_RE.test(d.email)) return T('err_email');
  if (!Number.isInteger(d.years) || d.years < CFG.MIN_YEARS || d.years > CFG.MAX_YEARS) return T('err_years');
  if (!Number.isFinite(d.amount)) return T('err_required');

  if (selectedTier === TIERS.VIP) {
    if (d.amount < CFG.VIP.MIN_AMOUNT) return T('err_vip_min');
  } else {
    if (d.amount < CFG.STANDARD.MIN_AMOUNT) return T('err_std_min');
    if (d.amount > CFG.STANDARD.MAX_AMOUNT) return T('err_std_max');
  }
  return null;
}

function renderSummary(d) {
  const box = $('order-summary');
  if (!box) return;
  const { rate, grossTotal } = calcReturn(d.amount, d.years, selectedTier);
  const rows = [
    [T('sum_tier'),   selectedTier === TIERS.VIP ? T('tier_vip_name') : T('tier_std_name')],
    [T('sum_amount'), fmtCZK(d.amount)],
    [T('sum_years'),  fmtYears(d.years)],
    [T('sum_rate'),   `${fmtPct(rate)} p.a.`],
    [T('sum_total'),  fmtCZK(grossTotal)],
  ];
  box.replaceChildren(...rows.map(([k, v]) => {
    const row = document.createElement('div');
    row.className = 'order-summary-row';
    const key = document.createElement('span');
    key.textContent = k;
    const value = document.createElement('strong');
    value.textContent = v;
    row.append(key, value);
    return row;
  }));
  box.classList.toggle('order-summary--vip', selectedTier === TIERS.VIP);
}

function goToStep2() {
  const d = readForm();
  const err = validateForm(d);
  if (err) { showFormErr(err); return; }
  $('form-err')?.remove();
  renderSummary(d);
  showStep(2);
}

function toggleSubmitBtn() {
  const chk = $('legal-check');
  const btn = $('form-submit');
  if (chk && btn) btn.disabled = !chk.checked;
}

function sanitizeSpayd(str, max) {
  return str.replace(/[*\r\n]/g, ' ').slice(0, max);
}

function handleSubmit(e) {
  e.preventDefault();
  const d = readForm();
  const err = validateForm(d);
  if (err) { showStep(1); showFormErr(err); return; }
  if (!$('legal-check')?.checked) return;

  const vs    = getTodayVS();
  const tier  = selectedTier;
  const label = tier === TIERS.VIP ? 'Dluhopis G3NE5IS VIP' : 'Dluhopis G3NE5IS';
  const spayd = [
    'SPD*1.0',
    `ACC:${CFG.IBAN}+${CFG.BIC}`,
    `AM:${d.amount.toFixed(2)}`,
    'CC:CZK',
    `MSG:${sanitizeSpayd(`${label} - ${d.name}`, 60)}`,
    `X-VS:${vs}`,
    `RN:${CFG.COMPANY}`,
  ].join('*');

  const order = {
    id:              `${vs}_${Date.now()}`,
    timestamp:       new Date().toISOString(),
    investorType,
    tier,
    name: d.name, street: d.street, city: d.city, dob: d.dob, email: d.email,
    phone:           d.phone,
    beneficiary:     d.bene,
    beneficiaryYear: d.beneYr,
    amount:          d.amount,
    years:           d.years,
    vs,
    rate:            getRate(d.years, tier),
    status:          'pending',
  };

  try {
    const all = JSON.parse(localStorage.getItem('genesis_orders') || '[]');
    all.push(order);
    localStorage.setItem('genesis_orders', JSON.stringify(all));
  } catch (storageErr) {
    console.error('Uložení objednávky selhalo:', storageErr);
  }

  closeModal();
  openQR(spayd, vs);
}

function showFormErr(msg) {
  let el = $('form-err');
  if (!el) {
    el = document.createElement('div');
    el.id = 'form-err';
    el.className = 'form-err';
    el.setAttribute('role', 'alert');
    const step1 = $('modal-step-1');
    step1?.prepend(el);
  }
  el.textContent = msg;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* =========================================================
   QR CODE MODAL
========================================================= */
function openQR(spayd, vs) {
  $('qr-modal')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  setText('vs-display', vs);

  const qc = $('qr-canvas');
  if (qc && typeof QRCode !== 'undefined') {
    qc.getContext('2d').clearRect(0, 0, qc.width, qc.height);
    QRCode.toCanvas(qc, spayd, {
      width: 200, margin: 2,
      color: { dark: '#044A22', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }, (err) => {
      if (err) { console.error('QR error:', err); qc.style.display = 'none'; }
    });
  }
  setTimeout(() => $('qr-close-btn')?.focus(), 60);
}

function closeQR() {
  $('qr-modal')?.classList.remove('open');
  document.body.style.overflow = '';
  $('invest-form')?.reset();
  $('form-err')?.remove();
  setType('FO');
}

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (isModalOpen('qr-modal')) closeQR();
  else if (isModalOpen('invest-modal')) closeModal();
});

/* =========================================================
   DOMContentLoaded INIT (běží až po aplikaci překladů)
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const bindSlider = (id, cb) => $(id)?.addEventListener('input', (e) => cb(parseInt(e.target.value, 10)));

  bindSlider('amount-slider',     (v) => { calcAmount = v; updateCalc(); });
  bindSlider('years-slider',      (v) => { calcYears  = v; updateCalc(); });
  bindSlider('vip-amount-slider', (v) => { vipAmount  = v; updateVipCalc(); });
  bindSlider('vip-years-slider',  (v) => { vipYears   = v; updateVipCalc(); });

  updateCalc();
  updateVipCalc();
  setType('FO');

  // Karty pilířů — ovládání klávesnicí (Enter / mezerník)
  document.querySelectorAll('.invest-card').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(); }
    });
  });

  navEl?.classList.toggle('scrolled', window.scrollY > 30);
});

/* =========================================================
   WINDOW LOAD — graf & počítadlo
========================================================= */
window.addEventListener('load', () => {
  initChart();

  const badge = $('badge-counter');
  if (badge) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounter(badge, MODEL_GAIN_PCT, 2000);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(badge);
  }
});

/* =========================================================
   RESIZE: velikost canvasu se zlatým prachem
========================================================= */
window.addEventListener('resize', () => {
  if (goldCanvas && goldCanvas.style.display !== 'none') {
    goldCanvas.width  = window.innerWidth;
    goldCanvas.height = window.innerHeight;
  }
}, { passive: true });

/* =========================================================
   EXPLICIT GLOBAL EXPORTS PRO INLINE HTML EVENT HANDLERY
========================================================= */
window.openModal       = openModal;
window.closeModal      = closeModal;
window.selectTier      = selectTier;
window.showStep        = showStep;
window.goToStep1       = goToStep1;
window.backToStep1     = backToStep1;
window.goToStep2       = goToStep2;
window.setType         = setType;
window.toggleSubmitBtn = toggleSubmitBtn;
window.handleSubmit    = handleSubmit;
window.closeQR         = closeQR;

