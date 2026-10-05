import type { LanguageCode } from '../i18n';

export interface Snippet {
  id: string;
  shortcut: string;
  content: string;
  isEnabled: boolean;
}

export interface Environment {
  id: string;
  name: string;
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

export interface ImportConflictItem {
  id: string;
  shortcut: string;
  incomingContent: string;
  existingContent: string;
  targetEnvId: string;
  targetEnvName: string;
  incomingSnippet: Snippet;
}

export interface ImportAnalysis {
  importId: string;
  fileName: string;
  rawData: {
    version?: string;
    settings?: Partial<AppSettings>;
    environments?: Environment[];
  };
  totalEnvsInFile: number;
  totalSnippetsInFile: number;
  newEnvsCount: number;
  diffSnippetsCount: number;
  conflicts: ImportConflictItem[];
  lostEnvs: Array<{ id: string; name: string; snippetCount: number }>;
  lostSnippets: Array<{ envName: string; snippet: Snippet }>;
}
