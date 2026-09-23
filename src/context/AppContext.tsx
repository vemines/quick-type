import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Snippet, Environment, AppSettings, ToastMessage } from '../types';
import { t, LanguageCode } from '../i18n';

interface DuplicateConflict {
  candidate: Snippet;
  existing: Snippet;
}

interface AppContextType {
  environments: Environment[];
  activeEnvironment: Environment;
  activeEnvironmentId: string;
  snippets: Snippet[];
  settings: AppSettings;
  searchQuery: string;
  toasts: ToastMessage[];
  
  // Modals
  isSnippetModalOpen: boolean;
  editingSnippet: Snippet | null;
  isEnvModalOpen: boolean;
  isSettingsModalOpen: boolean;
  duplicateConflict: DuplicateConflict | null;
  
  // Actions
  setSearchQuery: (query: string) => void;
  openAddSnippetModal: () => void;
  openEditSnippetModal: (snippet: Snippet) => void;
  closeSnippetModal: () => void;
  openEnvModal: () => void;
  closeEnvModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  dismissDuplicateConflict: () => void;
  confirmForceEnable: () => void;
  
  // Snippet CRUD
  saveSnippet: (shortcut: string, content: string) => boolean;
  deleteSnippet: (id: string) => void;
  toggleSnippet: (id: string) => void;
  duplicateSnippet: (id: string) => void;
  
  // Environment CRUD
  switchEnvironment: (id: string) => void;
  addEnvironment: (name: string) => boolean;
  renameEnvironment: (id: string, newName: string) => boolean;
  deleteEnvironment: (id: string) => void;
  
  // Settings & Theme
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: LanguageCode) => void;
  
  // Import / Export (Plain JSON & Unikey import)
  exportJsonConfig: () => void;
  importJsonConfig: (file: File) => Promise<boolean>;
  importUnikeyTxt: (file: File) => Promise<number>;
  
  // Toasts
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
}

const DEFAULT_ENVIRONMENT: Environment = {
  id: 'default',
  name: 'Mặc định',
  snippets: [],
};

const DEFAULT_SETTINGS: AppSettings = {
  triggerHotkey: '`',
  autoReplace: false,
  theme: 'light',
  language: 'vi',
  startWithWindows: false,
  runInBackground: true,
};

const STORAGE_KEY_ENVS = 'quick_type_environments';
const STORAGE_KEY_ACTIVE_ENV = 'quick_type_active_env_id';
const STORAGE_KEY_SETTINGS = 'quick_type_settings';

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Error loading settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Load environments
  const [environments, setEnvironments] = useState<Environment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENVS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading environments', e);
    }
    return [DEFAULT_ENVIRONMENT];
  });

  const [activeEnvironmentId, setActiveEnvironmentId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ENV);
      if (saved) return saved;
    } catch (e) {
      console.error('Error loading active env id', e);
    }
    return 'default';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [duplicateConflict, setDuplicateConflict] = useState<DuplicateConflict | null>(null);

  // Tauri detection helper
  const isTauri = useCallback(() => {
    return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
  }, []);

  // Sync theme with HTML document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    root.setAttribute('lang', settings.language);
  }, [settings.theme, settings.language]);

  const isInitializedRef = useRef(!isTauri());

  // Load data from Tauri backend if running in desktop mode
  useEffect(() => {
    if (!isTauri()) {
      isInitializedRef.current = true;
      return;
    }

    let mounted = true;
    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke('get_initial_data')
        .then((data: any) => {
          if (!mounted || !data) return;
          if (data.environments && Array.isArray(data.environments) && data.environments.length > 0) {
            setEnvironments(data.environments);
          }
          if (data.activeEnvironmentId) {
            setActiveEnvironmentId(data.activeEnvironmentId);
          }
          if (data.settings) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
          isInitializedRef.current = true;
        })
        .catch((err) => {
          console.error('Failed to get initial data from Tauri:', err);
          isInitializedRef.current = true;
        });
    });

    return () => {
      mounted = false;
    };
  }, [isTauri]);

  // Save to localStorage (fallback) & Sync to Tauri backend
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENVS, JSON.stringify(environments));
    } catch (e) {
      console.error('Error saving environments', e);
    }
  }, [environments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ENV, activeEnvironmentId);
    } catch (e) {
      console.error('Error saving active env id', e);
    }
  }, [activeEnvironmentId]);

  // Live sync to Tauri Backend (persists in Documents/QuickType/data.json and syncs keyboard expander)
  // Guarded by isInitializedRef to eliminate startup data wipeout / race condition
  useEffect(() => {
    if (!isTauri() || !isInitializedRef.current) return;

    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke('save_data', {
        data: {
          environments,
          activeEnvironmentId,
          settings,
        },
      }).catch((err) => {
        console.error('Failed to sync data to Tauri backend:', err);
      });
    });
  }, [environments, activeEnvironmentId, settings, isTauri]);

  // Active Environment reference
  const activeEnvironment = useMemo(() => {
    const found = environments.find((e) => e.id === activeEnvironmentId);
    return found || environments[0] || DEFAULT_ENVIRONMENT;
  }, [environments, activeEnvironmentId]);

  const snippets = useMemo(() => {
    return activeEnvironment.snippets || [];
  }, [activeEnvironment]);

  // Toast Helpers
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const environmentsRef = useRef(environments);
  useEffect(() => {
    environmentsRef.current = environments;
  }, [environments]);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Listen for environment-changed event emitted from System Tray
  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void) | undefined;
    let isCancelled = false;

    import('@tauri-apps/api/event').then(({ listen }) => {
      if (isCancelled) return;
      listen<string>('environment-changed', (event) => {
        const newEnvId = event.payload;
        setActiveEnvironmentId((currentId) => {
          if (currentId === newEnvId) return currentId;
          const targetEnv = environmentsRef.current.find((e) => e.id === newEnvId);
          const envName = targetEnv ? targetEnv.name : newEnvId;
          const lang = settingsRef.current.language;
          showToast(
            lang === 'vi'
              ? `Đã chuyển sang môi trường: ${envName}`
              : `Switched to environment: ${envName}`,
            'info'
          );
          return newEnvId;
        });
      }).then((fn) => {
        if (isCancelled) {
          fn();
        } else {
          unlisten = fn;
        }
      });
    });

    return () => {
      isCancelled = true;
      if (unlisten) unlisten();
    };
  }, [isTauri, showToast]);

  // Modal openers
  const openAddSnippetModal = useCallback(() => {
    setEditingSnippet(null);
    setIsSnippetModalOpen(true);
  }, []);

  const openEditSnippetModal = useCallback((snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsSnippetModalOpen(true);
  }, []);

  const closeSnippetModal = useCallback(() => {
    setEditingSnippet(null);
    setIsSnippetModalOpen(false);
  }, []);

  const openEnvModal = useCallback(() => setIsEnvModalOpen(true), []);
  const closeEnvModal = useCallback(() => setIsEnvModalOpen(false), []);
  const openSettingsModal = useCallback(() => setIsSettingsModalOpen(true), []);
  const closeSettingsModal = useCallback(() => setIsSettingsModalOpen(false), []);

  const dismissDuplicateConflict = useCallback(() => {
    setDuplicateConflict(null);
  }, []);

  const confirmForceEnable = useCallback(() => {
    if (!duplicateConflict) return;
    const targetId = duplicateConflict.candidate.id;
    const existingId = duplicateConflict.existing.id;

    setEnvironments((prevEnvs) =>
      prevEnvs.map((env) => {
        if (env.id !== activeEnvironment.id) return env;
        return {
          ...env,
          snippets: env.snippets.map((s) => {
            if (s.id === targetId) {
              return { ...s, isEnabled: true, updatedAt: Date.now() };
            }
            if (s.id === existingId) {
              return { ...s, isEnabled: false, updatedAt: Date.now() };
            }
            return s;
          }),
        };
      })
    );

    setDuplicateConflict(null);
    showToast(t('toastSaved', settings.language), 'info');
  }, [duplicateConflict, activeEnvironment.id, settings.language, showToast]);

  // Snippet CRUD
  const saveSnippet = useCallback(
    (shortcut: string, content: string): boolean => {
      const trimmedShortcut = shortcut.trim();
      const trimmedContent = content;

      if (!trimmedShortcut || !trimmedContent) return false;

      let conflictDetected = false;

      setEnvironments((prevEnvs) => {
        return prevEnvs.map((env) => {
          if (env.id !== activeEnvironment.id) return env;

          const now = Date.now();
          const cleanShortcut = trimmedShortcut.toLowerCase();
          let updatedSnippets: Snippet[];

          if (editingSnippet) {
            // Check if another active snippet already uses this shortcut
            const hasConflict = env.snippets.some(
              (s) => s.id !== editingSnippet.id && s.isEnabled && s.shortcut.toLowerCase() === cleanShortcut
            );
            if (hasConflict && editingSnippet.isEnabled) {
              conflictDetected = true;
            }

            updatedSnippets = env.snippets.map((s) =>
              s.id === editingSnippet.id
                ? {
                    ...s,
                    shortcut: trimmedShortcut,
                    content: trimmedContent,
                    isEnabled: hasConflict ? false : s.isEnabled,
                    updatedAt: now,
                  }
                : s
            );
          } else {
            // Check if an active snippet already uses this shortcut
            const hasConflict = env.snippets.some(
              (s) => s.isEnabled && s.shortcut.toLowerCase() === cleanShortcut
            );
            if (hasConflict) {
              conflictDetected = true;
            }

            const newSnippet: Snippet = {
              id: 'snip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              shortcut: trimmedShortcut,
              content: trimmedContent,
              // If an active snippet with this shortcut already exists, new snippet is disabled to prevent duplicate conflict
              isEnabled: !hasConflict,
              createdAt: now,
              updatedAt: now,
            };
            updatedSnippets = [newSnippet, ...env.snippets];
          }

          return { ...env, snippets: updatedSnippets };
        });
      });

      if (conflictDetected) {
        showToast(
          settings.language === 'vi'
            ? 'Đã lưu từ tắt (tự động tắt kích hoạt do trùng phím với từ đang bật)'
            : 'Saved shortcut (disabled to prevent collision with active shortcut)',
          'info'
        );
      } else {
        showToast(t('toastSaved', settings.language), 'success');
      }
      closeSnippetModal();
      return true;
    },
    [activeEnvironment.id, editingSnippet, closeSnippetModal, settings.language, showToast]
  );

  const deleteSnippet = useCallback(
    (id: string) => {
      setEnvironments((prevEnvs) =>
        prevEnvs.map((env) => {
          if (env.id !== activeEnvironment.id) return env;
          return {
            ...env,
            snippets: env.snippets.filter((s) => s.id !== id),
          };
        })
      );
      showToast(t('toastDeleted', settings.language), 'info');
    },
    [activeEnvironment.id, settings.language, showToast]
  );

  const toggleSnippet = useCallback(
    (id: string) => {
      const target = snippets.find((s) => s.id === id);
      if (!target) return;

      // If turning ON, check for conflicts with other active snippets
      if (!target.isEnabled) {
        const conflictingActive = snippets.find(
          (s) => s.id !== id && s.isEnabled && s.shortcut.toLowerCase() === target.shortcut.toLowerCase()
        );

        if (conflictingActive) {
          // Trigger duplicate conflict warning dialog showing both triggers
          setDuplicateConflict({
            candidate: target,
            existing: conflictingActive,
          });
          return;
        }
      }

      setEnvironments((prevEnvs) =>
        prevEnvs.map((env) => {
          if (env.id !== activeEnvironment.id) return env;
          return {
            ...env,
            snippets: env.snippets.map((s) =>
              s.id === id ? { ...s, isEnabled: !s.isEnabled, updatedAt: Date.now() } : s
            ),
          };
        })
      );
    },
    [snippets, activeEnvironment.id]
  );

  // Duplication with _1 and disabled by default
  const duplicateSnippet = useCallback(
    (id: string) => {
      const target = snippets.find((s) => s.id === id);
      if (!target) return;

      // Find next available _1, _2 suffix
      const baseShortcut = target.shortcut;
      let counter = 1;
      let newShortcut = `${baseShortcut}_${counter}`;

      while (snippets.some((s) => s.shortcut.toLowerCase() === newShortcut.toLowerCase())) {
        counter++;
        newShortcut = `${baseShortcut}_${counter}`;
      }

      const duplicate: Snippet = {
        ...target,
        id: 'snip_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        shortcut: newShortcut,
        isEnabled: false, // Disabled by default
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setEnvironments((prevEnvs) =>
        prevEnvs.map((env) => {
          if (env.id !== activeEnvironment.id) return env;
          return {
            ...env,
            snippets: [duplicate, ...env.snippets],
          };
        })
      );
      showToast(t('toastDuplicateSuccess', settings.language), 'success');
    },
    [activeEnvironment.id, snippets, settings.language, showToast]
  );

  // Environment CRUD
  const switchEnvironment = useCallback(
    (id: string) => {
      setActiveEnvironmentId(id);
      showToast(t('toastEnvSwitched', settings.language), 'info');
    },
    [settings.language, showToast]
  );

  // Add environment with duplicate prevention and NO auto-switch
  const addEnvironment = useCallback(
    (name: string): boolean => {
      const trimmed = name.trim();
      if (!trimmed) return false;

      // Duplicate name check (case-insensitive)
      const isDuplicate = environments.some(
        (e) => e.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        showToast(t('envExistsError', settings.language), 'error');
        return false;
      }

      const newId = 'env_' + Date.now();
      const newEnv: Environment = {
        id: newId,
        name: trimmed,
        snippets: [],
      };

      setEnvironments((prev) => [...prev, newEnv]);
      // Do NOT switch activeEnvironmentId when created
      showToast(t('envCreatedSuccess', settings.language), 'success');
      return true;
    },
    [environments, settings.language, showToast]
  );

  // Rename environment
  const renameEnvironment = useCallback(
    (id: string, newName: string): boolean => {
      const trimmed = newName.trim();
      if (!trimmed) return false;

      const isDuplicate = environments.some(
        (e) => e.id !== id && e.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        showToast(t('envExistsError', settings.language), 'error');
        return false;
      }

      setEnvironments((prev) =>
        prev.map((e) => (e.id === id ? { ...e, name: trimmed } : e))
      );
      showToast(t('toastSaved', settings.language), 'success');
      return true;
    },
    [environments, settings.language, showToast]
  );

  const deleteEnvironment = useCallback(
    (id: string) => {
      setEnvironments((prev) => {
        if (prev.length <= 1) return prev;
        const filtered = prev.filter((e) => e.id !== id);
        if (activeEnvironmentId === id) {
          setActiveEnvironmentId(filtered[0].id);
        }
        return filtered;
      });
      showToast(t('toastDeleted', settings.language), 'info');
    },
    [activeEnvironmentId, settings.language, showToast]
  );

  // Settings
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));

    if (newSettings.startWithWindows !== undefined && isTauri()) {
      import('@tauri-apps/plugin-autostart').then(async (autostart) => {
        try {
          if (newSettings.startWithWindows) {
            await autostart.enable();
          } else {
            await autostart.disable();
          }
        } catch (e) {
          console.warn('Autostart toggle warning:', e);
        }
      });
    }
  }, [isTauri]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setSettings((prev) => ({ ...prev, theme }));
  }, []);

  const setLanguage = useCallback((language: LanguageCode) => {
    setSettings((prev) => ({ ...prev, language }));
  }, []);

  // Standard JSON Export & Import (No Gzip)
  const exportJsonConfig = useCallback(() => {
    try {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings,
        environments,
      };
      const jsonStr = JSON.stringify(data, null, 2);

      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quick_type_config_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(t('toastExportSuccess', settings.language), 'success');
    } catch (err) {
      console.error('Export JSON Error:', err);
      showToast('Export failed', 'error');
    }
  }, [settings, environments, showToast]);

  const importJsonConfig = useCallback(
    async (file: File): Promise<boolean> => {
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.environments && Array.isArray(data.environments)) {
          setEnvironments(data.environments);
          if (data.environments[0]) {
            setActiveEnvironmentId(data.environments[0].id);
          }
        }
        if (data.settings && typeof data.settings === 'object') {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        }

        showToast(t('toastImportSuccess', settings.language), 'success');
        return true;
      } catch (err) {
        console.error('Import JSON Error:', err);
        showToast(t('toastImportError', settings.language), 'error');
        return false;
      }
    },
    [settings.language, showToast]
  );

  // UniKey .txt Import
  const importUnikeyTxt = useCallback(
    async (file: File): Promise<number> => {
      try {
        const text = await file.text();
        const lines = text.split(/\r?\n/);
        const importedSnippets: Snippet[] = [];
        const now = Date.now();

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line || line.startsWith('#') || line.startsWith('//')) continue;

          let separator = ':';
          if (!line.includes(':')) {
            if (line.includes(';')) separator = ';';
            else if (line.includes('\t')) separator = '\t';
            else continue;
          }

          const parts = line.split(separator);
          const shortcut = parts[0]?.trim();
          const content = parts.slice(1).join(separator).trim().replace(/\\n/g, '\n');

          if (shortcut && content) {
            importedSnippets.push({
              id: 'snip_' + (now + i) + '_' + Math.random().toString(36).substring(2, 6),
              shortcut,
              content,
              isEnabled: true,
              createdAt: now,
              updatedAt: now,
            });
          }
        }

        if (importedSnippets.length > 0) {
          setEnvironments((prevEnvs) =>
            prevEnvs.map((env) => {
              if (env.id !== activeEnvironment.id) return env;
              return {
                ...env,
                snippets: [...importedSnippets, ...env.snippets],
              };
            })
          );
          showToast(`${t('toastImportSuccess', settings.language)} (${importedSnippets.length})`, 'success');
          return importedSnippets.length;
        }

        return 0;
      } catch (err) {
        console.error('Import UniKey Error:', err);
        showToast(t('toastImportError', settings.language), 'error');
        return 0;
      }
    },
    [activeEnvironment.id, settings.language, showToast]
  );

  const value: AppContextType = {
    environments,
    activeEnvironment,
    activeEnvironmentId,
    snippets,
    settings,
    searchQuery,
    toasts,
    isSnippetModalOpen,
    editingSnippet,
    isEnvModalOpen,
    isSettingsModalOpen,
    duplicateConflict,
    setSearchQuery,
    openAddSnippetModal,
    openEditSnippetModal,
    closeSnippetModal,
    openEnvModal,
    closeEnvModal,
    openSettingsModal,
    closeSettingsModal,
    dismissDuplicateConflict,
    confirmForceEnable,
    saveSnippet,
    deleteSnippet,
    toggleSnippet,
    duplicateSnippet,
    switchEnvironment,
    addEnvironment,
    renameEnvironment,
    deleteEnvironment,
    updateSettings,
    setTheme,
    setLanguage,
    exportJsonConfig,
    importJsonConfig,
    importUnikeyTxt,
    showToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
