import { csTranslations, Dictionary } from './cs';
import { skTranslations } from './sk';
import { plTranslations } from './pl';
import { Locale } from '../config';

export type { Dictionary, TranslationKey } from './cs';

export const dictionaries: Record<Locale, Dictionary> = {
  cs: csTranslations,
  sk: skTranslations,
  pl: plTranslations,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries.cs;
}
