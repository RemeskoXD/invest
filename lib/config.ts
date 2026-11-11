export const SITE_CONFIG = Object.freeze({
  COMPANY: 'G3NE5IS holdingová společnost s.r.o.',
  LEGAL_NAME: 'G3NE5IS s.r.o.',
  ICO: '23136201',
  DIC: 'CZ23136201',
  ADDRESS: 'Patrice Lumumby 2310/52, Zábřeh, 700 30 Ostrava',
  COURT_RECORD: 'Společnost je vedena u Krajského soudu v Ostravě, spisová značka C 99244',
  PHONE: '+420 603 777 456',
  PHONE_CLEAN: '+420603777456',
  EMAIL: 'info@genesis-invest.cz',
  IBAN: 'CZ0355000000006037774568',
  BIC: 'RZBCCZPP',
  BANK_NAME: 'Raiffeisenbank',
  BANK_ACC: '6037774568/5500',
  FOUNDER: 'Lukáš Zaoral',
  FOUNDING_YEAR: 2015,
  FEE_CZK: 2000,
  TAX_RATE: 0.15,
  MIN_YEARS: 1,
  MAX_YEARS: 20,
  DOMAINS: {
    CZ: 'genesis-invest.cz',
    SK: 'genesis-invest.sk',
    PL: 'genesis-invest.pl',
  },
  STANDARD: Object.freeze({
    MIN_AMOUNT: 10000,
    MAX_AMOUNT: 999999,
    BASE_RATE: 0.045, // 4,5 % p.a.
    YEAR_INC: 0.001,  // +0,1 % za rok
    BONUS_RATE: 0.006, // věrnostní bonus na 7,0 % p.a.
    BONUS_YEARS: 20,
  }),
  VIP: Object.freeze({
    MIN_AMOUNT: 1000000,
    RATE: 0.07, // 7,0 % p.a. pevně od 1. dne
  }),
  BANK_RATE: 0.007,
});

export type InvestmentTier = 'standard' | 'vip';
export type InvestorType = 'FO' | 'SRO';
export type Locale = 'cs' | 'sk' | 'pl';
