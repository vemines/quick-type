import type { LanguageCode } from '../i18n';

export interface Snippet {
  id: string;
  shortcut: string;
  content: string;
  description?: string;
  isEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Environment {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  snippets: Snippet[];
}

export interface AppSettings {
  triggerHotkey: string; // default: '`'
  autoReplace: boolean;  // automatic expansion without hotkey
  theme: 'light' | 'dark'; // default: 'light'
  language: LanguageCode;   // default: 'vi'
  startWithWindows: boolean;
  runInBackground: boolean;
  runAsAdmin?: boolean;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
