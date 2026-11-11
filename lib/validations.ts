import { z } from 'zod';
import { SITE_CONFIG } from './config';

export const orderSchema = z.object({
  tier: z.enum(['standard', 'vip']),
  investorType: z.enum(['FO', 'SRO']),
  name: z.string().trim().min(3, 'Jméno / název musí mít alespoň 3 znaky').max(120),
  street: z.string().trim().min(3, 'Zadejte prosím platnou ulici a číslo popisné').max(120),
  city: z.string().trim().min(2, 'Zadejte prosím platné město a PSČ').max(80),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum narození musí být ve formátu RRRR-MM-DD'),
  email: z.string().trim().email('Zadejte prosím platnou e-mailovou adresu').max(100),
  phone: z.string().trim().max(30).optional().default(''),
  beneficiary: z.string().trim().max(100).optional().default(''),
  beneficiaryYear: z.string().trim().max(4).optional().default(''),
  amount: z.number().int().positive(),
  years: z.number().int().min(SITE_CONFIG.MIN_YEARS).max(SITE_CONFIG.MAX_YEARS),
}).refine((data) => {
  if (data.tier === 'vip') {
    return data.amount >= SITE_CONFIG.VIP.MIN_AMOUNT;
  }
  return data.amount >= SITE_CONFIG.STANDARD.MIN_AMOUNT && data.amount <= SITE_CONFIG.STANDARD.MAX_AMOUNT;
}, {
  message: 'Částka neodpovídá zvolené zóně (Standard 10 000 – 999 999 Kč, VIP od 1 000 000 Kč)',
  path: ['amount'],
});

export type OrderInput = z.infer<typeof orderSchema>;

export interface OrderRecord extends OrderInput {
  id: string;
  timestamp: string;
  vs: string;
  rate: number;
  status: 'pending' | 'paid' | 'sent';
}
