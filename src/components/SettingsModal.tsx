import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t, SUPPORTED_LANGUAGES } from '../i18n';
import {
  X,
  Settings as SettingsIcon,
  Keyboard,
  Download,
  Upload,
  Sliders,
  Monitor,
  Sun,
  Moon,
  ChevronDown,
  Check,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    closeSettingsModal,
    settings,
    updateSettings,
    setTheme,
    setLanguage,
    exportJsonConfig,
    importJsonConfig,
  } = useApp();

  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const hotkeyInputRef = useRef<HTMLInputElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const [isRecordingHotkey, setIsRecordingHotkey] = useState(false);
  const [recordingCombo, setRecordingCombo] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isSettingsModalOpen) return null;

  const handleJsonFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importJsonConfig(file);
      if (jsonFileInputRef.current) jsonFileInputRef.current.value = '';
    }
  };

  const handleHotkeyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Escape cancels recording if no modifiers are active
    if (e.key === 'Escape' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
      setIsRecordingHotkey(false);
      setRecordingCombo('');
      hotkeyInputRef.current?.blur();
      return;
    }

    const modifiers: string[] = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.altKey) modifiers.push('Alt');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.metaKey) modifiers.push('Win');

    // If only a modifier key is pressed, show live preview
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      setRecordingCombo(modifiers.join(' + ') + ' + ...');
      return;
    }

    // Determine main key name
    let keyName = e.key;
    if (e.code === 'Space' || e.key === ' ') keyName = 'Space';
    else if (e.key === 'Tab') keyName = 'Tab';
    else if (e.key === 'Enter') keyName = 'Enter';
    else if (e.key.length === 1) {
      keyName = (e.key >= 'a' && e.key <= 'z') ? e.key.toUpperCase() : e.key;
    }

    const finalCombo = [...modifiers, keyName].join(' + ');
    updateSettings({ triggerHotkey: finalCombo });
    setIsRecordingHotkey(false);
    setRecordingCombo('');
    hotkeyInputRef.current?.blur();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#182234] rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-600 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-[#0c1220] border border-sky-200 dark:border-sky-500/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <SettingsIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('settingsTitle', settings.language)}
            </h3>
          </div>
          <button
            onClick={closeSettingsModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Section 1: Appearance & Language */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5" />
              <span>{t('appearanceSection', settings.language)}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Theme Selector */}
              <div className="p-3.5 rounded-md bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {t('themeLabel', settings.language)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {settings.theme === 'light' ? t('themeLight', settings.language) : t('themeDark', settings.language)}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-[#182234] p-1 rounded-md border border-slate-300 dark:border-slate-600">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      settings.theme === 'light'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    <span>{t('themeLight', settings.language)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      settings.theme === 'dark'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    <span>{t('themeDark', settings.language)}</span>
                  </button>
                </div>
              </div>

              {/* Language Selector Dropdown */}
              <div className="p-3.5 rounded-md bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-700 flex items-center justify-between relative" ref={langDropdownRef}>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {t('languageLabel', settings.language)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {SUPPORTED_LANGUAGES.find((l) => l.code === settings.language)?.label || 'Tiếng Việt'}
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsLangDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white dark:bg-[#182234] hover:bg-slate-100 dark:hover:bg-[#1d2a40] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 shadow-2xs transition-all cursor-pointer text-xs font-medium"
                  >
                    <span>{SUPPORTED_LANGUAGES.find((l) => l.code === settings.language)?.label || 'Tiếng Việt'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isLangDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-[#182234] border border-slate-200 dark:border-slate-600 rounded-md shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {SUPPORTED_LANGUAGES.map((lang) => {
                        const isSelected = settings.language === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setLanguage(lang.code);
                              setIsLangDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <span>{lang.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 ml-1.5" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Replacement Key & Triggers (Swapped to Section 2) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>{t('replacementKeySection', settings.language)}</span>
            </h4>

            {/* Hotkey Trigger Input (Left-aligned compact wrapper with dialog bg color for high contrast) */}
            <div className="p-3.5 rounded-md bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('triggerHotkeyLabel', settings.language)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {t('triggerHotkeyDesc', settings.language)}
                </div>
              </div>

              {/* Compact Left-aligned Hotkey Wrapper using Dialog bg color for high contrast */}
              <div className="flex justify-start pt-0.5">
                <div
                  onClick={() => {
                    setIsRecordingHotkey(true);
                    hotkeyInputRef.current?.focus();
                  }}
                  className={`inline-flex items-center justify-center px-3.5 py-1.5 rounded-md border transition-all duration-150 cursor-pointer select-none shadow-2xs ${
                    isRecordingHotkey
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 ring-2 ring-sky-500/30 text-sky-600 dark:text-sky-400'
                      : 'bg-white dark:bg-[#182234] border-slate-300 dark:border-slate-600 hover:border-sky-500 dark:hover:border-sky-400 hover:shadow-xs text-slate-900 dark:text-white'
                  }`}
                  title={t('clickToChangeKey', settings.language)}
                >
                  <input
                    ref={hotkeyInputRef}
                    type="text"
                    readOnly
                    onFocus={() => setIsRecordingHotkey(true)}
                    onBlur={() => {
                      setIsRecordingHotkey(false);
                      setRecordingCombo('');
                    }}
                    onKeyDown={handleHotkeyKeyDown}
                    className="sr-only"
                  />

                  {isRecordingHotkey ? (
                    <span className="font-mono text-xs sm:text-sm font-bold text-sky-600 dark:text-sky-400 animate-pulse tracking-wider">
                      {recordingCombo || '...'}
                    </span>
                  ) : (
                    <kbd className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                      {settings.triggerHotkey || '`'}
                    </kbd>
                  )}
                </div>
              </div>
            </div>

            {/* Auto-replace Toggle */}
            <label className="p-3.5 rounded-md bg-slate-50 hover:bg-slate-100/80 dark:bg-[#0c1220] dark:hover:bg-[#121927] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-between cursor-pointer select-none transition-all duration-150">
              <div className="pr-3">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t('autoReplaceLabel', settings.language)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t('autoReplaceDesc', settings.language)}
                </div>
              </div>

              <div className="relative inline-flex items-center shrink-0">
                <input
                  type="checkbox"
                  checked={settings.autoReplace}
                  onChange={(e) => updateSettings({ autoReplace: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </div>
            </label>
          </div>

          {/* Section 3: System & Startup */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5" />
              <span>{t('systemSection', settings.language)}</span>
            </h4>

            <div className="space-y-2">
              <label className="p-3.5 rounded-md bg-slate-50 hover:bg-slate-100/80 dark:bg-[#0c1220] dark:hover:bg-[#121927] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-between cursor-pointer select-none transition-all duration-150">
                <div className="pr-3">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {t('runInBackground', settings.language)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('runInBackgroundDesc', settings.language)}
                  </div>
                </div>
                <div className="relative inline-flex items-center shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.runInBackground}
                    onChange={(e) => updateSettings({ runInBackground: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-sky-600"></div>
                </div>
              </label>

              <label className="p-3.5 rounded-md bg-slate-50 hover:bg-slate-100/80 dark:bg-[#0c1220] dark:hover:bg-[#121927] border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 flex items-center justify-between cursor-pointer select-none transition-all duration-150">
                <div className="pr-3">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {t('startWithWindows', settings.language)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('startWithWindowsDesc', settings.language)}
                  </div>
                </div>
                <div className="relative inline-flex items-center shrink-0">
                  <input
                    type="checkbox"
                    checked={settings.startWithWindows}
                    onChange={(e) => updateSettings({ startWithWindows: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-sky-600"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 4: Backup & Import / Export (Moved to bottom) */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('dataBackupSection', settings.language)}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
              {/* JSON Export */}
              <button
                type="button"
                onClick={exportJsonConfig}
                className="h-full flex items-start gap-2.5 p-3.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-[#0c1220] dark:hover:bg-[#121927] border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">
                    {t('exportJson', settings.language)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {t('exportJsonDesc', settings.language)}
                  </div>
                </div>
              </button>

              {/* JSON Import */}
              <div className="h-full">
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleJsonFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => jsonFileInputRef.current?.click()}
                  className="w-full h-full flex items-start gap-2.5 p-3.5 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-[#0c1220] dark:hover:bg-[#121927] border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {t('importJson', settings.language)}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {t('importJsonDesc', settings.language)}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
