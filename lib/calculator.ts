import { SITE_CONFIG, InvestmentTier } from './config';

export interface CalculationResult {
  rate: number;
  grossTotal: number;
  netTotal: number;
  grossGain: number;
  netGain: number;
}

export function getInterestRate(years: number, tier: InvestmentTier = 'standard'): number {
  if (tier === 'vip') {
    return SITE_CONFIG.VIP.RATE;
  }
  const s = SITE_CONFIG.STANDARD;
  let r = s.BASE_RATE + (years - 1) * s.YEAR_INC;
  if (years === s.BONUS_YEARS) {
    r += s.BONUS_RATE;
  }
  return Math.round(r * 10000) / 10000;
}

export function calculateInvestmentReturn(
  principal: number,
  years: number,
  tier: InvestmentTier = 'standard'
): CalculationResult {
  const rate = getInterestRate(years, tier);
  const gross = principal * Math.pow(1 + rate, years);
  const grossGain = gross - principal;
  const netGain = grossGain * (1 - SITE_CONFIG.TAX_RATE);
  return {
    rate,
    grossTotal: Math.round(gross),
    netTotal: Math.round(principal + netGain),
    grossGain: Math.round(grossGain),
    netGain: Math.round(netGain),
  };
}

export function formatCZK(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatPercent(rate: number): string {
  return (rate * 100).toFixed(1).replace('.', ',') + ' %';
}

export function formatYears(years: number, yrOne: string, yrFew: string, yrMany: string): string {
  if (years === 1) return `1 ${yrOne}`;
  if (years >= 2 && years <= 4) return `${years} ${yrFew}`;
  return `${years} ${yrMany}`;
}
