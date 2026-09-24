import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SnippetCard } from './SnippetCard';
import { t } from '../i18n';
import { Plus, Search, X, Inbox } from 'lucide-react';

export const SnippetList: React.FC = () => {
  const { snippets, searchQuery, setSearchQuery, openAddSnippetModal, settings } = useApp();

  const filteredSnippets = useMemo(() => {
    if (!searchQuery.trim()) return snippets;
    const q = searchQuery.toLowerCase().trim();
    return snippets.filter(
      (s) =>
        s.shortcut.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q)
    );
  }, [snippets, searchQuery]);

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Compact Search Bar with Fixed Max Width (Centered) */}
      <div className="flex justify-center w-full shrink-0">
        <div className="w-full max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder', settings.language)}
            className="w-full pl-10 pr-16 py-2 text-sm bg-white dark:bg-[#182234] text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 shadow-xs transition-colors"
          />
          {searchQuery && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0c1220] text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-slate-700">
                {filteredSnippets.length}
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty State (Expands to fill available viewport height, no scroll, comfortable padding) */}
      {filteredSnippets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700/80 bg-white/70 dark:bg-[#151d2c]/60 shadow-xs min-h-[380px]">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-[#0c1220] border border-sky-200 dark:border-sky-500/40 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 shadow-sm">
            <Inbox className="w-7 h-7" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
            {searchQuery ? t('searchNoResultsTitle', settings.language) : t('emptyTitle', settings.language)}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mb-6 leading-relaxed">
            {searchQuery
              ? t('searchNoResultsDesc', settings.language).replace('{query}', searchQuery)
              : t('emptyDesc', settings.language)}
          </p>

          {!searchQuery && (
            <button
              onClick={openAddSnippetModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-sm font-semibold shadow-sm shadow-sky-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addSnippet', settings.language)}</span>
            </button>
          )}
        </div>
      ) : (
        /* Grid of Snippet Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSnippets.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </div>
  );
};
