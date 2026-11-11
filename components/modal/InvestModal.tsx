'use client';

import React, { useState, useEffect } from 'react';
import { Dictionary } from '@/lib/translations';
import { SITE_CONFIG, InvestmentTier, InvestorType } from '@/lib/config';
import { orderSchema, OrderRecord } from '@/lib/validations';
import { calculateInvestmentReturn, formatCZK, formatPercent, getInterestRate } from '@/lib/calculator';
import { generateTodayVS } from '@/lib/spayd';

interface Props {
  t: Dictionary;
  isOpen: boolean;
  initialTier?: InvestmentTier;
  initialAmount?: number;
  initialYears?: number;
  onClose: () => void;
  onSuccess: (order: OrderRecord) => void;
}

export const InvestModal: React.FC<Props> = ({
  t,
  isOpen,
  initialTier = 'standard',
  initialAmount,
  initialYears,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [tier, setTier] = useState<InvestmentTier>(initialTier);
  const [investorType, setInvestorType] = useState<InvestorType>('FO');

  // Form fields
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [beneficiaryYear, setBeneficiaryYear] = useState('');
  const [amount, setAmount] = useState<number>(initialAmount || 100000);
  const [years, setYears] = useState<number>(initialYears || 5);

  // Validation errors & legal check
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [legalChecked, setLegalChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when props change
  useEffect(() => {
    if (isOpen) {
      setTier(initialTier);
      if (initialAmount) setAmount(initialAmount);
      else setAmount(initialTier === 'vip' ? 1000000 : 100000);

      if (initialYears) setYears(initialYears);
      else setYears(5);

      // If opened from a specific tier button, start at Step 1
      if (initialAmount || initialTier === 'vip') {
        setStep(1);
      } else {
        setStep(0);
      }
      setErrors({});
      setLegalChecked(false);
    }
  }, [isOpen, initialTier, initialAmount, initialYears]);

  if (!isOpen) return null;

  const handleSelectTier = (newTier: InvestmentTier) => {
    setTier(newTier);
    if (newTier === 'vip' && amount < SITE_CONFIG.VIP.MIN_AMOUNT) {
      setAmount(1000000);
    } else if (newTier === 'standard' && amount > SITE_CONFIG.STANDARD.MAX_AMOUNT) {
      setAmount(100000);
    }
  };

  const handleGoToStep1 = () => {
    setStep(1);
  };

  const handleGoToStep2 = () => {
    setErrors({});
    const validation = orderSchema.safeParse({
      tier,
      investorType,
      name,
      street,
      city,
      dob,
      email,
      phone,
      beneficiary,
      beneficiaryYear,
      amount,
      years,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        const field = err.path[0]?.toString() || 'general';
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setStep(2);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalChecked || isSubmitting) return;

    setIsSubmitting(true);
    const rate = getInterestRate(years, tier);
    const randSuffix = Math.floor(10 + Math.random() * 90).toString();
    const vs = `${generateTodayVS()}${randSuffix}`;

    const newOrder: OrderRecord = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      vs,
      tier,
      investorType,
      name: name.trim(),
      street: street.trim(),
      city: city.trim(),
      dob,
      email: email.trim(),
      phone: phone.trim(),
      beneficiary: beneficiary.trim(),
      beneficiaryYear: beneficiaryYear.trim(),
      amount,
      years,
      rate,
      status: 'pending',
    };

    // Save to localStorage for instant client retrieval
    try {
      const stored = localStorage.getItem('genesis_orders');
      const orders: OrderRecord[] = stored ? JSON.parse(stored) : [];
      orders.unshift(newOrder);
      localStorage.setItem('genesis_orders', JSON.stringify(orders));
    } catch (err) {
      console.warn('Could not write to localStorage:', err);
    }

    // Persist to Server Action / API Route
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (err) {
      console.warn('Order API sync error:', err);
    }

    setIsSubmitting(false);
    onClose();
    onSuccess(newOrder);
  };

  const calcReturn = calculateInvestmentReturn(amount, years, tier);

  return (
    <div
      className="modal-backdrop active"
      id="invest-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-h2"
    >
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-box">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Zavřít formulář"
        >
          ✕
        </button>

        <h2 className="modal-title" id="modal-h2">
          {t.modal_title || 'Zájem o dluhopis'}
        </h2>
        <p className="modal-sub">
          {t.modal_sub ||
            'Vyplňte prosím níže uvedené údaje. Vše je zabezpečeno a slouží výhradně pro vystavení vašeho certifikovaného dluhopisu. Po odeslání obdržíte platební QR kód.'}
        </p>

        {/* ================= STEP 0: TIER SELECTOR ================= */}
        {step === 0 && (
          <div id="modal-step-0">
            <div className="tier-selection">
              <h3 className="tier-title">{t.tier_title || 'Do které zóny patříte?'}</h3>
              <p className="tier-hint">
                {t.tier_hint ||
                  'Úroková sazba se liší podle výše investice. Všechny ostatní podmínky jsou stejné.'}
              </p>

              <div className="tier-grid">
                <div
                  className={`tier-card ${tier === 'standard' ? 'selected' : ''}`}
                  id="tier-standard"
                  role="radio"
                  aria-checked={tier === 'standard'}
                  tabIndex={0}
                  onClick={() => handleSelectTier('standard')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTier('standard');
                    }
                  }}
                >
                  <span className="tier-card-badge">Základní emise</span>
                  <div className="tier-card-name">{t.tier_std_name || 'Standard'}</div>
                  <div className="tier-card-range">
                    {t.tier_std_range || '10 000 – 999 999 Kč'}
                  </div>
                  <div className="tier-card-rate">{t.tier_std_rate || '4,5 – 7 % p.a.'}</div>
                  <p className="tier-card-desc">
                    {t.tier_std_desc || 'Sazba roste s délkou investice'}
                  </p>
                </div>

                <div
                  className={`tier-card tier-card--vip ${tier === 'vip' ? 'selected' : ''}`}
                  id="tier-vip"
                  role="radio"
                  aria-checked={tier === 'vip'}
                  tabIndex={0}
                  onClick={() => handleSelectTier('vip')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTier('vip');
                    }
                  }}
                >
                  <span className="tier-card-badge">👑 Privátní emise</span>
                  <div className="tier-card-name">{t.tier_vip_name || 'VIP zóna'}</div>
                  <div className="tier-card-range">{t.tier_vip_range || 'od 1 000 000 Kč'}</div>
                  <div className="tier-card-rate">{t.tier_vip_rate || '7 % p.a.'}</div>
                  <p className="tier-card-desc">
                    {t.tier_vip_desc || 'Nejvyšší sazba od prvního dne'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="f-submit"
                id="tier-next"
                onClick={handleGoToStep1}
              >
                <span>{t.tier_next || 'Pokračovat'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 1: FORM FIELDS ================= */}
        {step === 1 && (
          <div id="modal-step-1">
            {/* Tier banner */}
            <div className="tier-badge" id="tier-badge">
              <span className="tier-badge-icon" aria-hidden="true">
                {tier === 'vip' ? '👑' : '💎'}
              </span>
              <span className="tier-badge-text">
                <span>{t.tier_selected || 'Zvolená zóna'}</span>:{' '}
                <strong>{tier === 'vip' ? 'VIP zóna' : 'Standard'}</strong> ·{' '}
                <span>{tier === 'vip' ? '7 % p.a. pevně' : '4,5 – 7 % p.a.'}</span>
              </span>
              <button
                type="button"
                className="tier-badge-btn"
                onClick={() => setStep(0)}
              >
                {t.tier_change || 'Změnit zónu'}
              </button>
            </div>

            {/* Investor type toggle */}
            <div className="f-group">
              <div className="f-sec-title" style={{ marginBottom: '12px' }}>
                {t.modal_type_lbl || 'Typ investora'}
              </div>
              <div className="f-toggle">
                <button
                  type="button"
                  className={`f-toggle-btn ${investorType === 'FO' ? 'active' : ''}`}
                  onClick={() => setInvestorType('FO')}
                  aria-pressed={investorType === 'FO'}
                >
                  {t.modal_type_fo || 'Soukromá osoba'}
                </button>
                <button
                  type="button"
                  className={`f-toggle-btn ${investorType === 'SRO' ? 'active' : ''}`}
                  onClick={() => setInvestorType('SRO')}
                  aria-pressed={investorType === 'SRO'}
                >
                  {t.modal_type_sro || 'Firemní investor (s.r.o.)'}
                </button>
              </div>
            </div>

            <div className="f-sec-title">{t.modal_personal || 'Osobní / firemní údaje'}</div>

            {/* Name */}
            <div className="f-group">
              <label className="f-label" htmlFor="inp-name">
                {t.f_name || 'Jméno a příjmení / Název společnosti *'}
              </label>
              <input
                className={`f-input ${errors.name ? 'error' : ''}`}
                type="text"
                id="inp-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Lukáš Zaoral / ABC investice s.r.o."
                required
                autoComplete="name"
              />
              {errors.name && <div className="f-err-msg">{errors.name}</div>}
            </div>

            {/* Street + City */}
            <div className="f-grid">
              <div className="f-group">
                <label className="f-label" htmlFor="inp-street">
                  {t.f_street || 'Ulice a číslo popisné *'}
                </label>
                <input
                  className={`f-input ${errors.street ? 'error' : ''}`}
                  type="text"
                  id="inp-street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Hlavní 123"
                  required
                  autoComplete="street-address"
                />
                {errors.street && <div className="f-err-msg">{errors.street}</div>}
              </div>
              <div className="f-group">
                <label className="f-label" htmlFor="inp-city">
                  {t.f_city || 'Město a PSČ *'}
                </label>
                <input
                  className={`f-input ${errors.city ? 'error' : ''}`}
                  type="text"
                  id="inp-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Praha 1, 110 00"
                  required
                />
                {errors.city && <div className="f-err-msg">{errors.city}</div>}
              </div>
            </div>

            {/* DOB */}
            <div className="f-group">
              <label className="f-label" htmlFor="inp-dob">
                {t.f_dob || 'Datum narození *'}
              </label>
              <input
                className={`f-input ${errors.dob ? 'error' : ''}`}
                type="date"
                id="inp-dob"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                aria-describedby="dob-note"
              />
              <div className="f-hint" id="dob-note">
                {t.f_dob_hint ||
                  '🔒 Nevyžadujeme rodné číslo — ochrana soukromí (GDPR). Pouze datum narození postačuje.'}
              </div>
              {errors.dob && <div className="f-err-msg">{errors.dob}</div>}
            </div>

            {/* Email + Phone */}
            <div className="f-grid">
              <div className="f-group">
                <label className="f-label" htmlFor="inp-email">
                  {t.f_email || 'E-mail *'}
                </label>
                <input
                  className={`f-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  id="inp-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lukas@email.cz"
                  required
                  autoComplete="email"
                />
                {errors.email && <div className="f-err-msg">{errors.email}</div>}
              </div>
              <div className="f-group">
                <label className="f-label" htmlFor="inp-phone">
                  {t.f_phone || 'Telefon'}
                </label>
                <input
                  className="f-input"
                  type="tel"
                  id="inp-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+420 603 777 456"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Beneficiary */}
            <div className="f-sec-title" style={{ marginTop: '8px' }}>
              {t.f_bene_title || 'Obmyšlená osoba (dědic dluhopisu)'}
            </div>
            <div className="f-grid">
              <div className="f-group">
                <label className="f-label" htmlFor="inp-bene">
                  {t.f_bene || 'Jméno a příjmení obmyšlené osoby'}
                </label>
                <input
                  className="f-input"
                  type="text"
                  id="inp-bene"
                  value={beneficiary}
                  onChange={(e) => setBeneficiary(e.target.value)}
                  placeholder="Marie Zaoralová"
                />
              </div>
              <div className="f-group">
                <label className="f-label" htmlFor="inp-bene-yr">
                  {t.f_bene_yr || 'Rok narození obmyšlené osoby'}
                </label>
                <input
                  className="f-input"
                  type="number"
                  id="inp-bene-yr"
                  value={beneficiaryYear}
                  onChange={(e) => setBeneficiaryYear(e.target.value)}
                  placeholder="1975"
                  min="1920"
                  max="2010"
                />
              </div>
            </div>

            {/* Investment Parameters */}
            <div className="f-sec-title" style={{ marginTop: '8px' }}>
              {t.f_params || 'Parametry investice'}
            </div>
            <div className="f-grid">
              <div className="f-group">
                <label className="f-label" htmlFor="inp-amount">
                  {t.f_amount || 'Výše investice (Kč) *'}
                </label>
                <input
                  className={`f-input ${errors.amount ? 'error' : ''}`}
                  type="number"
                  id="inp-amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={tier === 'vip' ? SITE_CONFIG.VIP.MIN_AMOUNT : SITE_CONFIG.STANDARD.MIN_AMOUNT}
                  max={tier === 'vip' ? 20000000 : SITE_CONFIG.STANDARD.MAX_AMOUNT}
                  required
                />
                {errors.amount && <div className="f-err-msg">{errors.amount}</div>}
              </div>
              <div className="f-group">
                <label className="f-label" htmlFor="inp-years">
                  {t.f_years || 'Délka (roky) *'}
                </label>
                <input
                  className={`f-input ${errors.years ? 'error' : ''}`}
                  type="number"
                  id="inp-years"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  min={SITE_CONFIG.MIN_YEARS}
                  max={SITE_CONFIG.MAX_YEARS}
                  required
                />
                {errors.years && <div className="f-err-msg">{errors.years}</div>}
              </div>
            </div>

            <button
              type="button"
              className="f-submit"
              onClick={handleGoToStep2}
              style={{ marginTop: '16px' }}
            >
              <span>{t.f_next || 'Pokračovat k souhrnu'}</span>
            </button>

            <button
              type="button"
              className="btn btn--ghost"
              style={{
                marginTop: '12px',
                width: '100%',
                justifyContent: 'center',
                padding: '12px',
              }}
              onClick={() => setStep(0)}
            >
              ← {t.f_back}
            </button>
          </div>
        )}

        {/* ================= STEP 2: SUMMARY & SUBMIT ================= */}
        {step === 2 && (
          <form onSubmit={handleSubmitOrder} id="modal-step-2">
            <h3 className="f-sec-title" style={{ fontSize: '1rem', marginBottom: '6px' }}>
              {t.f_confirm_title || 'Potvrzení a legislativa'}
            </h3>
            <p className="f-hint" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
              {t.f_confirm_hint ||
                'Před dokončením rezervace prosím potvrďte, že rozumíte parametrům investice.'}
            </p>

            {/* Dynamic summary */}
            <div className="order-summary" id="order-summary">
              <div className="order-summary-row">
                <span>Investor:</span>
                <strong>{name} ({investorType === 'SRO' ? 's.r.o.' : 'Fyzická osoba'})</strong>
              </div>
              <div className="order-summary-row">
                <span>Investiční zóna:</span>
                <strong>{tier === 'vip' ? '👑 VIP zóna (7 % p.a. pevně)' : 'Standardní zóna'}</strong>
              </div>
              <div className="order-summary-row">
                <span>Investovaná částka:</span>
                <strong>{formatCZK(amount)}</strong>
              </div>
              <div className="order-summary-row">
                <span>Doba investice:</span>
                <strong>{years} {years === 1 ? 'rok' : years < 5 ? 'roky' : 'let'}</strong>
              </div>
              <div className="order-summary-row">
                <span>Úroková sazba p.a.:</span>
                <strong style={{ color: 'var(--emerald-mid)' }}>{formatPercent(calcReturn.rate)}</strong>
              </div>
              <div className="order-summary-row">
                <span>Čistý zisk po zdanění:</span>
                <strong style={{ color: 'var(--emerald-mid)' }}>+ {formatCZK(calcReturn.netGain)}</strong>
              </div>
              <div className="order-summary-row">
                <span>Celková hodnota po splatnosti:</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--emerald-dark)' }}>{formatCZK(calcReturn.netTotal)}</strong>
              </div>
              <div className="order-summary-row">
                <span>Fixní poplatek:</span>
                <span>2 000 Kč</span>
              </div>
            </div>

            <div className="legal-checkbox-wrap" style={{ marginTop: '16px' }}>
              <label className="legal-checkbox-label">
                <input
                  type="checkbox"
                  id="legal-check"
                  checked={legalChecked}
                  onChange={(e) => setLegalChecked(e.target.checked)}
                />
                <span className="legal-checkbox-text">
                  {t.f_legal_check ||
                    'Jsem seznámen s absencí Garančního fondu a riziky spojenými s korporátními dluhopisy.'}
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn--ghost"
                style={{ flex: 1, justifyContent: 'center', padding: '18px' }}
                onClick={() => setStep(1)}
              >
                {t.f_back || 'Zrušit / Zpět'}
              </button>
              <button
                type="submit"
                className="f-submit"
                style={{ margin: 0, flex: 2 }}
                id="form-submit"
                disabled={!legalChecked || isSubmitting}
              >
                <span>
                  {isSubmitting
                    ? 'Zpracovávám...'
                    : t.f_submit || 'Odeslat žádost · Zobrazit QR kód'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};