import { LOCALES, LanguageCode, TranslationKey } from './config';

export * from './config';

export function t(key: TranslationKey | string, lang: LanguageCode = 'vi'): string {
  const dict = LOCALES[lang] || LOCALES.vi;
  return (dict as Record<string, string>)?.[key] || (LOCALES.vi as Record<string, string>)?.[key] || key;
}
