'use client';

import React, { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { Dictionary } from '@/lib/translations';
import { SITE_CONFIG, InvestmentTier } from '@/lib/config';
import { calculateInvestmentReturn, formatCZK, formatPercent, formatYears } from '@/lib/calculator';

interface Props {
  t: Dictionary;
  onOpenModal: (tier: InvestmentTier, amount?: number, years?: number) => void;
  onTriggerDust?: (x?: number, y?: number) => void;
}

export const Calculator: React.FC<Props> = ({ t, onOpenModal, onTriggerDust }) => {
  const [amount, setAmount] = useState<number>(100000);
  const [years, setYears] = useState<number>(5);
  const [hadBonus, setHadBonus] = useState<boolean>(false);

  const amountId = useId();
  const yearsId = useId();

  const calc = calculateInvestmentReturn(amount, years, 'standard');
  const isBonus = years === SITE_CONFIG.STANDARD.BONUS_YEARS;

  useEffect(() => {
    if (isBonus && !hadBonus) {
      setHadBonus(true);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('genesis:golddust'));
        if (onTriggerDust) onTriggerDust();
      }
    } else if (!isBonus && hadBonus) {
      setHadBonus(false);
    }
  }, [isBonus, hadBonus, onTriggerDust]);

  const yearsLabel = formatYears(
    years,
    t.calc_meta_1rok?.replace('1 ', '') || 'rok',
    'roky',
    t.calc_meta_10let?.replace('10 ', '') || 'let'
  );

  const amountPercent = Math.max(
    0,
    Math.min(
      100,
      ((amount - SITE_CONFIG.STANDARD.MIN_AMOUNT) /
        (SITE_CONFIG.STANDARD.MAX_AMOUNT - SITE_CONFIG.STANDARD.MIN_AMOUNT)) *
        100
    )
  );
  const yearsPercent = Math.max(
    0,
    Math.min(
      100,
      ((years - SITE_CONFIG.MIN_YEARS) /
        (SITE_CONFIG.MAX_YEARS - SITE_CONFIG.MIN_YEARS)) *
        100
    )
  );

  return (
    <section className="section section--gray" id="kalkulator" aria-labelledby="calc-h2">
      <div className="container">
        <div className="sec-header sec-header--center reveal">
          <div className="sec-eyebrow">{t.calc_eyebrow || 'Kalkulátor výnosu'}</div>
          <h2
            className="sec-title"
            id="calc-h2"
            dangerouslySetInnerHTML={{
              __html: t.calc_title || 'Zjistěte váš výnos<br><strong>za 30 sekund</strong>',
            }}
          />
        </div>

        <div className="calc-wrap">
          {/* Slider card */}
          <div className="calc-card reveal">
            {/* Amount Slider */}
            <div className="calc-group">
              <div className="calc-label-row">
                <label htmlFor={amountId} className="calc-label">
                  {t.calc_lbl_amount || 'Investovaná částka'}
                </label>
                <span className="calc-val" id="amount-display">
                  {formatCZK(amount)}
                </span>
              </div>
              <input
                id={amountId}
                type="range"
                className="calc-range"
                min={SITE_CONFIG.STANDARD.MIN_AMOUNT}
                max={SITE_CONFIG.STANDARD.MAX_AMOUNT}
                step={10000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                aria-label={t.calc_lbl_amount || 'Výše investované částky'}
                style={{
                  background: `linear-gradient(to right, var(--g-emerald-2) 0%, var(--g-emerald-2) ${amountPercent}%, rgba(0,0,0,0.06) ${amountPercent}%, rgba(0,0,0,0.06) 100%)`,
                }}
              />
              <div className="calc-range-meta">
                <span>10 000 Kč</span>
                <span>500 000 Kč</span>
                <span>990 000 Kč</span>
              </div>
            </div>

            {/* Years Slider */}
            <div className="calc-group">
              <div className="calc-label-row">
                <label htmlFor={yearsId} className="calc-label">
                  {t.calc_lbl_years || 'Délka investice'}
                </label>
                <span className="calc-val" id="years-display">
                  {yearsLabel}
                </span>
              </div>
              <input
                id={yearsId}
                type="range"
                className="calc-range"
                min={SITE_CONFIG.MIN_YEARS}
                max={SITE_CONFIG.MAX_YEARS}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                aria-label={t.calc_lbl_years || 'Délka investice v letech'}
                style={{
                  background: `linear-gradient(to right, var(--g-emerald-2) 0%, var(--g-emerald-2) ${yearsPercent}%, rgba(0,0,0,0.06) ${yearsPercent}%, rgba(0,0,0,0.06) 100%)`,
                }}
              />
              <div className="calc-range-meta">
                <span>{t.calc_meta_1rok || '1 rok'}</span>
                <span>{t.calc_meta_10let || '10 let'}</span>
                <span>{t.calc_meta_20let || '20 let'}</span>
              </div>
            </div>

            <div className="calc-divider" />

            {/* Result Box */}
            <div className="calc-result" id="calc-result-box">
              <div className="calc-result-lbl">
                {t.calc_result_lbl || 'Celková hodnota po splatnosti'}
              </div>
              <div className="calc-result-amount" id="result-total">
                {formatCZK(calc.netTotal)}
              </div>
              <div className="calc-result-gain">
                <span id="result-gain-gross">
                  Hrubý výnos: + {formatCZK(calc.grossGain)}
                </span>
                <br />
                <strong style={{ color: 'var(--white)' }} id="result-gain-net">
                  Čistý výnos: + {formatCZK(calc.netGain)}
                </strong>
                <div className="calc-tax-note">
                  <span>
                    {t.calc_tax_note || 'Čistý výnos po odečtení 15% srážkové daně.'}
                  </span>
                  <span className="tooltip" tabIndex={0}>
                    <span className="tooltip-icon" aria-label="Informace o dani">ℹ️</span>
                    <span className="tooltip-text">
                      {t.calc_tooltip ||
                        'Tříletý „časový test“ se vztahuje na osvobození od daně z příjmu při prodeji cenných papírů po 3 letech. Běžný úrokový výnos z dluhopisů držených do splatnosti však zpravidla podléhá srážkové dani 15 %, kterou odvádíme za vás.'}
                    </span>
                  </span>
                </div>
              </div>

              {isBonus && (
                <div className="calc-bonus active" id="calc-bonus">
                  {t.calc_bonus || '✨ Věrnostní bonus +0,6 % aktivován — 7 % p.a.!'}
                </div>
              )}
            </div>

            {/* Parameters preview */}
            <div className="calc-params">
              <div className="calc-param">
                <div className="calc-param-val" id="param-rate">
                  {formatPercent(calc.rate)}
                </div>
                <div className="calc-param-lbl">
                  {t.calc_rate_lbl || 'Roční sazba p.a.'}
                </div>
              </div>
              <div className="calc-param">
                <div className="calc-param-val" id="param-years">
                  {yearsLabel}
                </div>
                <div className="calc-param-lbl">
                  {t.calc_years_lbl || 'Doba investice'}
                </div>
              </div>
            </div>

            {/* Fee badge */}
            <div className="calc-fee">
              <span className="calc-fee-icon" aria-hidden="true">💎</span>
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.calc_fee ||
                    '<strong>Transparentní struktura:</strong> Jediný fixní poplatek <strong>2 000 Kč</strong> za správu. Žádná skrytá procenta z Vašeho zisku.',
                }}
              />
            </div>

            {/* Action button */}
            <button
              type="button"
              className="btn btn--gold btn--lg"
              style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
              onClick={() => onOpenModal('standard', amount, years)}
              id="calc-invest-btn"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: '20px', height: '20px', marginRight: '8px' }}
                aria-hidden="true"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>{t.calc_btn || 'Chci investovat'}</span>
            </button>
          </div>

          {/* Info side */}
          <div className="calc-info reveal reveal-delay-2">
            <h3
              className="calc-info-title"
              dangerouslySetInnerHTML={{
                __html: t.calc_info_title || 'Jak se výnos<br>počítá?',
              }}
            />
            <p
              className="calc-info-text"
              dangerouslySetInnerHTML={{
                __html:
                  t.calc_info_text ||
                  'Základní sazba je <strong>4,5 % p.a.</strong> Každý další rok přidává <strong>+0,1 %</strong> — odměňujeme věrné investory. Při maximální délce 20 let obdržíte navíc <strong>věrnostní bonus +0,6 %</strong>, celkem tedy <strong>7 % p.a.</strong>',
              }}
            />

            <div className="calc-rates">
              <div className="calc-rate-row">
                <span className="calc-rate-year">1 rok</span>
                <span className="calc-rate-val">4,5 % p.a.</span>
              </div>
              <div className="calc-rate-row">
                <span className="calc-rate-year">5 let</span>
                <span className="calc-rate-val">4,9 % p.a.</span>
              </div>
              <div className="calc-rate-row">
                <span className="calc-rate-year">10 let</span>
                <span className="calc-rate-val">5,4 % p.a.</span>
              </div>
              <div className="calc-rate-row">
                <span className="calc-rate-year">15 let</span>
                <span className="calc-rate-val">5,9 % p.a.</span>
              </div>
              <div className="calc-rate-row calc-rate-row--special">
                <span className="calc-rate-year">🏆 20 let</span>
                <span className="calc-rate-val calc-rate-val--gold">7,0 % p.a.</span>
              </div>
            </div>

            <p
              className="calc-info-text"
              style={{ fontSize: '0.82rem', marginBottom: 0 }}
              dangerouslySetInnerHTML={{
                __html:
                  t.calc_legal ||
                  'Úrok se připisuje ročně ke jistině (složené úročení). Výnos z dluhopisu podléhá zdanění dle platné české daňové legislativy. Minimální investice: 10 000 Kč. Od 1 000 000 Kč platí VIP sazba 7 % p.a.',
              }}
            />
          </div>
        </div>

        {/* VIP Teaser */}
        <Link
          href="#vip"
          className="calc-vip-teaser reveal"
          dangerouslySetInnerHTML={{
            __html:
              t.calc_vip_teaser ||
              '👑 Investujete 1 mil. Kč a více? <strong>VIP zóna — 7 % p.a. od prvního dne</strong> →',
          }}
        />
      </div>
    </section>
  );
};