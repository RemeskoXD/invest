'use client';

import React, { useState, useId } from 'react';
import { Dictionary } from '@/lib/translations';
import { SITE_CONFIG, InvestmentTier } from '@/lib/config';
import { calculateInvestmentReturn, formatCZK, formatPercent, formatYears } from '@/lib/calculator';

interface Props {
  t: Dictionary;
  onOpenModal: (tier: InvestmentTier, amount?: number, years?: number) => void;
}

export const VipSection: React.FC<Props> = ({ t, onOpenModal }) => {
  const [amount, setAmount] = useState<number>(2000000);
  const [years, setYears] = useState<number>(5);

  const amountId = useId();
  const yearsId = useId();

  const calc = calculateInvestmentReturn(amount, years, 'vip');

  const yearsLabel = formatYears(
    years,
    t.calc_meta_1rok?.replace('1 ', '') || 'rok',
    'roky',
    t.calc_meta_10let?.replace('10 ', '') || 'let'
  );

  const vipAmountPercent = Math.max(
    0,
    Math.min(
      100,
      ((amount - SITE_CONFIG.VIP.MIN_AMOUNT) /
        (20000000 - SITE_CONFIG.VIP.MIN_AMOUNT)) *
        100
    )
  );
  const vipYearsPercent = Math.max(
    0,
    Math.min(
      100,
      ((years - SITE_CONFIG.MIN_YEARS) /
        (SITE_CONFIG.MAX_YEARS - SITE_CONFIG.MIN_YEARS)) *
        100
    )
  );

  return (
    <section className="section section--vip" id="vip" aria-labelledby="vip-h2">
      <div className="container">
        <div className="sec-header sec-header--center reveal">
          <div className="sec-eyebrow sec-eyebrow--gold">
            {t.vip_eyebrow || '👑 VIP zóna · od 1 000 000 Kč'}
          </div>
          <h2
            className="sec-title sec-title--white"
            id="vip-h2"
            dangerouslySetInnerHTML={{
              __html:
                t.vip_title || 'Privátní investice.<br><strong>7 % p.a. od prvního dne.</strong>',
            }}
          />
          <p className="sec-desc sec-desc--light">
            {t.vip_desc ||
              'Pro investory, kteří vkládají 1 000 000 Kč a více, platí pevná sazba 7 % p.a. bez ohledu na délku investice. Žádné čekání na věrnostní bonus — maximální výnos od začátku.'}
          </p>
        </div>

        <div className="calc-wrap calc-wrap--vip">
          {/* VIP Slider card */}
          <div className="calc-card calc-card--vip reveal">
            <div className="vip-card-badge">👑 VIP PRIVÁTNÍ EMISE · 7 % P.A. PEVNĚ</div>

            {/* Amount */}
            <div className="calc-group">
              <div className="calc-label-row">
                <label htmlFor={amountId} className="calc-label calc-label--gold">
                  {t.vip_lbl_amount || 'Investovaná částka'}
                </label>
                <span className="calc-val calc-val--gold" id="vip-amount-display">
                  {formatCZK(amount)}
                </span>
              </div>
              <input
                id={amountId}
                type="range"
                className="calc-range calc-range--gold"
                min={SITE_CONFIG.VIP.MIN_AMOUNT}
                max={20000000}
                step={100000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                aria-label={t.vip_lbl_amount || 'Výše VIP investované částky'}
                style={{
                  background: `linear-gradient(to right, var(--g-gold) 0%, var(--g-gold) ${vipAmountPercent}%, rgba(200, 169, 110, 0.2) ${vipAmountPercent}%, rgba(200, 169, 110, 0.2) 100%)`,
                }}
              />
              <div className="calc-range-meta calc-range-meta--gold">
                <span>{t.vip_meta_1 || '1 mil. Kč'}</span>
                <span>{t.vip_meta_2 || '10 mil. Kč'}</span>
                <span>{t.vip_meta_3 || '20 mil. Kč'}</span>
              </div>
            </div>

            {/* Years */}
            <div className="calc-group">
              <div className="calc-label-row">
                <label htmlFor={yearsId} className="calc-label calc-label--gold">
                  {t.vip_lbl_years || 'Délka investice'}
                </label>
                <span className="calc-val calc-val--gold" id="vip-years-display">
                  {yearsLabel}
                </span>
              </div>
              <input
                id={yearsId}
                type="range"
                className="calc-range calc-range--gold"
                min={SITE_CONFIG.MIN_YEARS}
                max={SITE_CONFIG.MAX_YEARS}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                aria-label={t.vip_lbl_years || 'Délka VIP investice v letech'}
                style={{
                  background: `linear-gradient(to right, var(--g-gold) 0%, var(--g-gold) ${vipYearsPercent}%, rgba(200, 169, 110, 0.2) ${vipYearsPercent}%, rgba(200, 169, 110, 0.2) 100%)`,
                }}
              />
              <div className="calc-range-meta calc-range-meta--gold">
                <span>{t.calc_meta_1rok || '1 rok'}</span>
                <span>{t.calc_meta_10let || '10 let'}</span>
                <span>{t.calc_meta_20let || '20 let'}</span>
              </div>
            </div>

            <div className="calc-divider calc-divider--gold" />

            {/* Result */}
            <div className="calc-result calc-result--gold" id="vip-calc-result-box">
              <div className="calc-result-lbl calc-result-lbl--gold">
                {t.vip_result_lbl || 'Celková hodnota po splatnosti'}
              </div>
              <div className="calc-result-amount calc-result-amount--gold" id="vip-result-total">
                {formatCZK(calc.netTotal)}
              </div>
              <div className="calc-result-gain calc-result-gain--gold">
                <span id="vip-gain-gross">
                  Hrubý výnos: + {formatCZK(calc.grossGain)}
                </span>
                <br />
                <strong id="vip-gain-net">
                  Čistý výnos: + {formatCZK(calc.netGain)}
                </strong>
                <div className="calc-tax-note calc-tax-note--gold">
                  <span>
                    {t.calc_tax_note || 'Čistý výnos po odečtení 15% srážkové daně.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Params */}
            <div className="calc-params calc-params--gold">
              <div className="calc-param calc-param--gold">
                <div className="calc-param-val calc-param-val--gold" id="vip-param-rate">
                  {formatPercent(calc.rate)}
                </div>
                <div className="calc-param-lbl calc-param-lbl--gold">
                  {t.vip_rate_lbl || 'Pevná sazba p.a.'}
                </div>
              </div>
              <div className="calc-param calc-param--gold">
                <div className="calc-param-val calc-param-val--gold" id="vip-param-years">
                  {yearsLabel}
                </div>
                <div className="calc-param-lbl calc-param-lbl--gold">
                  {t.vip_years_lbl || 'Doba investice'}
                </div>
              </div>
            </div>

            {/* Fee */}
            <div className="calc-fee calc-fee--vip">
              <span className="calc-fee-icon" aria-hidden="true">👑</span>
              <span
                dangerouslySetInnerHTML={{
                  __html:
                    t.calc_fee ||
                    '<strong>Transparentní struktura:</strong> Jediný fixní poplatek <strong>2 000 Kč</strong> za správu. Žádná skrytá procenta z Vašeho zisku.',
                }}
              />
            </div>

            <button
              type="button"
              className="btn btn--vip btn--lg"
              style={{ width: '100%', marginTop: '24px', justifyContent: 'center' }}
              onClick={() => onOpenModal('vip', amount, years)}
              id="vip-calc-invest-btn"
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
              <span>{t.vip_btn || 'Chci investovat ve VIP zóně'}</span>
            </button>
          </div>

          {/* VIP Info side */}
          <div className="calc-info calc-info--vip reveal reveal-delay-2">
            <h3
              className="calc-info-title calc-info-title--gold"
              dangerouslySetInnerHTML={{
                __html: t.vip_info_title || 'Výhody<br>VIP zóny',
              }}
            />

            <div className="vip-benefits">
              <div className="vip-benefit-item">
                <div className="vip-benefit-icon" aria-hidden="true">✨</div>
                <div>
                  <h4 className="vip-benefit-title">
                    {t.vip_b1_title || '7 % p.a. od prvního roku'}
                  </h4>
                  <p className="vip-benefit-desc">
                    {t.vip_b1_desc || 'Nejvyšší sazba platí okamžitě — nemusíte čekat 20 let.'}
                  </p>
                </div>
              </div>

              <div className="vip-benefit-item">
                <div className="vip-benefit-icon" aria-hidden="true">⏱️</div>
                <div>
                  <h4 className="vip-benefit-title">
                    {t.vip_b2_title || 'Stejná sazba na 1–20 let'}
                  </h4>
                  <p className="vip-benefit-desc">
                    {t.vip_b2_desc || 'Délku investice si zvolíte podle sebe, sazba se nemění.'}
                  </p>
                </div>
              </div>

              <div className="vip-benefit-item">
                <div className="vip-benefit-icon" aria-hidden="true">🤝</div>
                <div>
                  <h4 className="vip-benefit-title">
                    {t.vip_b3_title || 'Osobně s jednatelem'}
                  </h4>
                  <p className="vip-benefit-desc">
                    {t.vip_b3_desc || 'Všechny podmínky probereme na osobní schůzce.'}
                  </p>
                </div>
              </div>

              <div className="vip-benefit-item">
                <div className="vip-benefit-icon" aria-hidden="true">💎</div>
                <div>
                  <h4 className="vip-benefit-title">
                    {t.vip_b4_title || 'Jediný poplatek 2 000 Kč'}
                  </h4>
                  <p className="vip-benefit-desc">
                    {t.vip_b4_desc || 'Rovnako transparentní struktura jako ve standardní zóně.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison table */}
            <div className="vip-cmp-box">
              <div className="vip-cmp-head">
                <span>{t.vip_cmp_years || 'Délka'}</span>
                <span>{t.vip_cmp_std || 'Standard'}</span>
                <span className="gold-text">{t.vip_cmp_vip || 'VIP (od 1 mil.)'}</span>
              </div>
              <div className="vip-cmp-row">
                <span>1 rok</span>
                <span>4,5 % p.a.</span>
                <strong className="gold-text">7,0 % p.a.</strong>
              </div>
              <div className="vip-cmp-row">
                <span>5 let</span>
                <span>4,9 % p.a.</span>
                <strong className="gold-text">7,0 % p.a.</strong>
              </div>
              <div className="vip-cmp-row">
                <span>10 let</span>
                <span>5,4 % p.a.</span>
                <strong className="gold-text">7,0 % p.a.</strong>
              </div>
              <div className="vip-cmp-row">
                <span>20 let</span>
                <span>7,0 % p.a.</span>
                <strong className="gold-text">7,0 % p.a.</strong>
              </div>
            </div>

            <p
              className="calc-info-text calc-info-text--gold"
              style={{ fontSize: '0.82rem', marginTop: '20px', marginBottom: 0 }}
              dangerouslySetInnerHTML={{
                __html:
                  t.vip_legal ||
                  'Úrok se připisuje ročně k jistině (složené úročení). Čistý výnos je uveden po odečtení 15% srážkové daně. Výnosy mají modelový charakter.',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};