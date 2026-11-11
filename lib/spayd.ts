import { SITE_CONFIG } from './config';

export function generateTodayVS(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

export function buildSpaydString(options: {
  amount: number;
  vs: string;
  name: string;
  isVip?: boolean;
}): string {
  const label = options.isVip ? 'Dluhopis G3NE5IS VIP' : 'Dluhopis G3NE5IS';
  const cleanName = options.name.replace(/[*;\r\n]/g, ' ').slice(0, 35).trim();
  const msg = `${label} - ${cleanName}`.slice(0, 60);

  return [
    'SPD*1.0',
    `ACC:${SITE_CONFIG.IBAN}+${SITE_CONFIG.BIC}`,
    `AM:${options.amount.toFixed(2)}`,
    'CC:CZK',
    `MSG:${msg}`,
    `X-VS:${options.vs}`,
    `RN:${SITE_CONFIG.LEGAL_NAME}`,
  ].join('*');
}
