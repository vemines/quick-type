import vi from './vi.json';
import en from './en.json';

export const LOCALES = {
  vi,
  en,
};

export type LanguageCode = keyof typeof LOCALES;

export interface LanguageOption {
  code: LanguageCode;
  label: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
];

export type TranslationKey = keyof typeof vi;
