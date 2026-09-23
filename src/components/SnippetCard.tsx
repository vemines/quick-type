import React, { useMemo } from 'react';
import { Snippet } from '../types';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import {
  Edit2,
  Copy,
  Clipboard,
  Trash2,
  Calendar,
  Clock,
  CalendarClock,
  Tag,
  Check,
} from 'lucide-react';

interface SnippetCardProps {
  snippet: Snippet;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({ snippet }) => {
  const {
    openEditSnippetModal,
    duplicateSnippet,
    deleteSnippet,
    toggleSnippet,
    showToast,
    settings,
    snippets,
  } = useApp();

  const [copied, setCopied] = React.useState(false);

  // Check if there is a conflict (same shortcut found elsewhere in active environment)
  const hasConflict = useMemo(() => {
    return snippets.filter((s) => s.shortcut.toLowerCase() === snippet.shortcut.toLowerCase()).length > 1;
  }, [snippets, snippet.shortcut]);

  // Parse and highlight dynamic variables (both built-in and user-defined {{shortcut}})
  const parsedContent = useMemo(() => {
    const parts = snippet.content.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      if (part === '{{date}}' || part.startsWith('{{date:')) {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40"
          >
            <Calendar className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            {part === '{{date}}' ? 'date' : part.slice(2, -2)}
          </span>
        );
      }
      if (part === '{{time}}') {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40"
          >
            <Clock className="w-3 h-3 text-sky-600 dark:text-sky-400" />
            time
          </span>
        );
      }
      if (part === '{{datetime}}') {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40"
          >
            <CalendarClock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            datetime
          </span>
        );
      }
      // Check for user-defined variable, e.g. {{phone}}
      if (part.startsWith('{{') && part.endsWith('}}')) {
        const inner = part.slice(2, -2);
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono font-semibold bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/40"
          >
            <Tag className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            {inner}
          </span>
        );
      }
      return part;
    });
  }, [snippet.content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.content);
    setCopied(true);
    showToast(t('copied', settings.language), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 ${
        snippet.isEnabled
          ? 'bg-white dark:bg-[#182234] border-slate-200/90 dark:border-slate-600/80 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-lg dark:hover:shadow-sky-950/40 shadow-xs'
          : 'bg-slate-50 dark:bg-[#111824] border-slate-200/50 dark:border-slate-700/50 opacity-60'
      }`}
    >
      {/* Card Header: Shortcut & Toggle */}
      <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-700/70">
        <div className="flex items-center justify-between gap-2">
          {/* Shortcut Title Pill */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-bold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-[#0c1220] text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-500/50 shadow-xs">
              {snippet.shortcut}
            </span>

            {hasConflict && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Trùng phím!
              </span>
            )}
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={snippet.isEnabled}
                onChange={() => toggleSnippet(snippet.id)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Replaced Content Box (High Contrast) */}
      <div className="p-4 flex-1">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1220] border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm font-normal whitespace-pre-wrap break-all max-h-36 overflow-y-auto custom-scrollbar shadow-inner">
          {parsedContent}
        </div>
      </div>

      {/* Card Footer: Action Buttons (Copy on left, actions on right) */}
      <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-[#121927]/60 border-t border-slate-100 dark:border-slate-700/70 rounded-b-2xl flex items-center justify-between gap-1.5 text-xs text-slate-500">
        {/* Copy Button (Left) */}
        <button
          onClick={handleCopy}
          title={t('copy', settings.language)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#182234] hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Clipboard className="w-3.5 h-3.5" />}
          <span>{copied ? (settings.language === 'vi' ? 'Đã chép' : 'Copied') : t('copy', settings.language)}</span>
        </button>

        {/* Right Actions: Edit, Duplicate, Delete */}
        <div className="flex items-center gap-1.5">
          {/* Edit */}
          <button
            onClick={() => openEditSnippetModal(snippet)}
            title={t('edit', settings.language)}
            className="p-1.5 rounded-lg bg-white dark:bg-[#182234] hover:bg-sky-50 dark:hover:bg-sky-950/60 text-slate-700 hover:text-sky-600 dark:text-slate-200 dark:hover:text-sky-300 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            onClick={() => duplicateSnippet(snippet.id)}
            title={t('duplicate', settings.language)}
            className="p-1.5 rounded-lg bg-white dark:bg-[#182234] hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete */}
          <button
            onClick={() => deleteSnippet(snippet.id)}
            title={t('delete', settings.language)}
            className="p-1.5 rounded-lg bg-white dark:bg-[#182234] hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-700 hover:text-rose-600 dark:text-slate-200 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
