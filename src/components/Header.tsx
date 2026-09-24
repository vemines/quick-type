import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import {
  Plus,
  Settings,
  ChevronDown,
  Check,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    settings,
    activeEnvironment,
    environments,
    switchEnvironment,
    openEnvModal,
    openAddSnippetModal,
    openSettingsModal,
  } = useApp();

  const [isEnvMenuOpen, setIsEnvMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsEnvMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#121927]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-700/80 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-15 relative flex items-center justify-between">
        {/* Left: Logo & App Title */}
        <div className="flex items-center gap-2.5 shrink-0 z-10">
          <img
            src="/icon.png"
            alt="Quick Type"
            className="w-8 h-8 rounded-lg object-contain shadow-xs"
          />
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            {t('appName', settings.language)}
          </span>
        </div>

        {/* Center: Environment Selector (Absolute centered so it never shifts left or right UI) */}
        <div className="absolute left-1/2 -translate-x-1/2 z-20" ref={menuRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsEnvMenuOpen((prev) => !prev)}
              className="flex items-center gap-2.5 px-4 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200/80 dark:bg-[#182234] dark:hover:bg-[#1d2a40] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 shadow-xs transition-all cursor-pointer group"
            >
              <span className="text-sm font-semibold">{activeEnvironment.name}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${isEnvMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom Sleek Dropdown Menu */}
            {isEnvMenuOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-52 bg-white dark:bg-[#182234] border border-slate-200 dark:border-slate-600 rounded-md shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  {t('environment', settings.language)}
                </div>

                <div className="max-h-[144px] overflow-y-auto custom-scrollbar">
                  {environments.map((env) => {
                    const isSelected = env.id === activeEnvironment.id;
                    return (
                      <button
                        key={env.id}
                        type="button"
                        onClick={() => {
                          switchEnvironment(env.id);
                          setIsEnvMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                        }`}
                      >
                        <span className="truncate">{env.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700/80" />

                <button
                  type="button"
                  onClick={() => {
                    setIsEnvMenuOpen(false);
                    openEnvModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 text-left transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('manageEnvironments', settings.language)}...</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Add Snippet & Settings (Pinned to right, never shifts) */}
        <div className="flex items-center gap-2 shrink-0 z-10 ml-auto">
          <button
            onClick={openAddSnippetModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addSnippet', settings.language)}</span>
          </button>

          <button
            onClick={openSettingsModal}
            title={t('settings', settings.language)}
            className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-[#182234] dark:hover:bg-[#1d2a40] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
