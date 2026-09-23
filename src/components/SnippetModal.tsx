import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import {
  X,
  AlertTriangle,
  Calendar,
  Clock,
  CalendarClock,
  Save,
  Sparkles,
  ChevronDown,
  Tag,
} from 'lucide-react';

export const SnippetModal: React.FC = () => {
  const {
    isSnippetModalOpen,
    editingSnippet,
    closeSnippetModal,
    saveSnippet,
    snippets,
    settings,
  } = useApp();

  const [shortcut, setShortcut] = useState('');
  const [content, setContent] = useState('');
  const [isVarMenuOpen, setIsVarMenuOpen] = useState(false);
  const contentInputRef = useRef<HTMLTextAreaElement>(null);
  const varMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (varMenuRef.current && !varMenuRef.current.contains(event.target as Node)) {
        setIsVarMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state when modal opens or editingSnippet changes
  useEffect(() => {
    if (editingSnippet) {
      setShortcut(editingSnippet.shortcut);
      setContent(editingSnippet.content);
    } else {
      setShortcut('');
      setContent('');
    }
    setIsVarMenuOpen(false);
  }, [editingSnippet, isSnippetModalOpen]);

  // Conflict detection
  const conflictSnippet = useMemo(() => {
    if (!shortcut.trim()) return null;
    const clean = shortcut.trim().toLowerCase();
    return snippets.find(
      (s) => s.shortcut.toLowerCase() === clean && (!editingSnippet || s.id !== editingSnippet.id)
    );
  }, [shortcut, snippets, editingSnippet]);

  // Available existing snippets from active environment (for {{shortcut}} variable reuse)
  const reusableSnippets = useMemo(() => {
    return snippets.filter((s) => !editingSnippet || s.id !== editingSnippet.id);
  }, [snippets, editingSnippet]);

  // Examples generator
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentTime = useMemo(() => new Date().toTimeString().slice(0, 5), []);
  const currentDateTime = useMemo(() => `${todayDate} ${currentTime}`, [todayDate, currentTime]);

  if (!isSnippetModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcut.trim() || !content) return;
    saveSnippet(shortcut, content);
  };

  // Helper to insert dynamic variable while preserving native Undo / Redo (Ctrl+Z)
  const insertVariable = (varText: string) => {
    const textarea = contentInputRef.current;
    if (!textarea) {
      setContent((prev) => prev + varText);
      setIsVarMenuOpen(false);
      return;
    }

    textarea.focus();
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.setRangeText(varText, start, end, 'end');
    setContent(textarea.value);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    setIsVarMenuOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#182234] rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-600 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {editingSnippet
              ? t('modalEditTitle', settings.language)
              : t('modalAddTitle', settings.language)}
          </h3>
          <button
            onClick={closeSnippetModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Shortcut Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {t('shortcutLabel', settings.language)} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={shortcut}
              onChange={(e) => setShortcut(e.target.value)}
              placeholder={t('shortcutPlaceholder', settings.language)}
              className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 dark:bg-[#0c1220] text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-colors"
            />

            {/* Conflict Warning */}
            {conflictSnippet && (
              <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {t('conflictWarning', settings.language)} (Đang dùng: "{conflictSnippet.content.slice(0, 25)}...")
                </span>
              </div>
            )}
          </div>

          {/* Replacement Content Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {t('contentLabel', settings.language)} <span className="text-rose-500">*</span>
            </label>

            <textarea
              ref={contentInputRef}
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('contentPlaceholder', settings.language)}
              className="w-full px-3.5 py-2.5 text-sm font-mono bg-slate-50 dark:bg-[#0c1220] text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 resize-y transition-colors"
            />

            {/* Dynamic Variable Dropdown Selector */}
            <div className="mt-2.5 relative" ref={varMenuRef}>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsVarMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[8px] text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-[#0c1220] dark:hover:bg-[#121927] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
                  <span>{t('insertVariableDropdown', settings.language)}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${isVarMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Custom Variable Dropdown Menu */}
              {isVarMenuOpen && (
                <div className="absolute left-0 bottom-full mb-1 w-full max-w-md bg-white dark:bg-[#182234] border border-slate-300 dark:border-slate-600 rounded-[8px] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-1">
                    {/* Group 1: System Variables */}
                    <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      {t('systemVarsGroup', settings.language)}
                    </div>

                    {/* Date */}
                    <button
                      type="button"
                      onClick={() => insertVariable('{{date}}')}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {'{{date}}'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0c1220] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {todayDate}
                      </span>
                    </button>

                    {/* Time */}
                    <button
                      type="button"
                      onClick={() => insertVariable('{{time}}')}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {'{{time}}'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0c1220] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {currentTime}
                      </span>
                    </button>

                    {/* DateTime */}
                    <button
                      type="button"
                      onClick={() => insertVariable('{{datetime}}')}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <CalendarClock className="w-3.5 h-3.5 text-teal-500" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {'{{datetime}}'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0c1220] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {currentDateTime}
                      </span>
                    </button>

                    {/* Group 2: Reusable Shortcuts from Environment */}
                    <div className="pt-1.5 my-1 border-t border-slate-100 dark:border-slate-700/80">
                      <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        {t('customVarsGroup', settings.language)}
                      </div>

                      {reusableSnippets.length === 0 ? (
                        <div className="px-2.5 py-1.5 text-xs text-slate-400 dark:text-slate-500 italic">
                          {t('noCustomVars', settings.language)}
                        </div>
                      ) : (
                        reusableSnippets.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => insertVariable(`{{${s.shortcut}}}`)}
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                                {`{{${s.shortcut}}}`}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] max-w-[160px] truncate px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0c1220] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              {s.content}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={closeSnippetModal}
              className="px-3.5 py-2 text-sm font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('cancel', settings.language)}
            </button>
            <button
              type="submit"
              disabled={!shortcut.trim() || !content}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t('save', settings.language)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
