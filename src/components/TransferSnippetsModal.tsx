import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { Snippet } from '../types';
import {
  X,
  ArrowRightLeft,
  Search,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Layers,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const TransferSnippetsModal: React.FC = () => {
  const {
    isTransferModalOpen,
    transferTargetEnvId,
    closeTransferModal,
    environments,
    transferSnippets,
    settings,
  } = useApp();

  const targetEnv = useMemo(() => {
    return environments.find((e) => e.id === transferTargetEnvId) || environments[0];
  }, [environments, transferTargetEnvId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnippetIds, setSelectedSnippetIds] = useState<Set<string>>(new Set());
  const [expandedSnippetIds, setExpandedSnippetIds] = useState<Set<string>>(new Set());
  const [overwriteConflict, setOverwriteConflict] = useState(false);

  // All snippets from all other environments (excluding targetEnv)
  const allOtherSnippets = useMemo(() => {
    if (!targetEnv) return [];
    const list: Array<{
      envId: string;
      envName: string;
      snippet: Snippet;
    }> = [];

    environments
      .filter((e) => e.id !== targetEnv.id)
      .forEach((env) => {
        env.snippets.forEach((s) => {
          list.push({
            envId: env.id,
            envName: env.name,
            snippet: s,
          });
        });
      });

    return list;
  }, [environments, targetEnv]);

  // Reset state on modal open
  useEffect(() => {
    setSelectedSnippetIds(new Set());
    setExpandedSnippetIds(new Set());
    setSearchQuery('');
  }, [isTransferModalOpen, transferTargetEnvId]);

  // Shortcuts already present in target environment (case-insensitive set)
  const targetShortcuts = useMemo(() => {
    if (!targetEnv) return new Set<string>();
    return new Set(targetEnv.snippets.map((s) => s.shortcut.toLowerCase()));
  }, [targetEnv]);

  // Filtered source snippets based on search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allOtherSnippets;

    return allOtherSnippets.filter(
      (item) =>
        item.snippet.shortcut.toLowerCase().includes(query) ||
        item.snippet.content.toLowerCase().includes(query) ||
        item.envName.toLowerCase().includes(query)
    );
  }, [allOtherSnippets, searchQuery]);

  if (!isTransferModalOpen || !targetEnv) return null;

  const toggleSelect = (id: string) => {
    setSelectedSnippetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedSnippetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedSnippetIds(new Set(filteredItems.map((item) => item.snippet.id)));
  };

  const deselectAll = () => {
    setSelectedSnippetIds(new Set());
  };

  const handleTransfer = () => {
    if (selectedSnippetIds.size === 0) return;
    transferSnippets(
      targetEnv.id,
      Array.from(selectedSnippetIds),
      overwriteConflict
    );
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#182234] rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-[#0c1220] border border-sky-200 dark:border-sky-500/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t('transferModalTitle', settings.language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('transferTargetLabel', settings.language)}:{' '}
                <span className="font-semibold text-sky-600 dark:text-sky-400">{targetEnv.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeTransferModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {allOtherSnippets.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t('transferNoSourceEnvs', settings.language)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hiện không có từ nào ở các nhóm khác để lấy. Vui lòng tạo thêm từ ở nhóm khác trước.
              </p>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('transferSearchPlaceholder', settings.language)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-[#0c1220] text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-lg border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500"
                />
              </div>

              {/* Selection Bar & Overwrite Conflict Checkbox */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    {t('transferSelectAll', settings.language)}
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="font-medium text-slate-500 hover:underline cursor-pointer"
                  >
                    {t('transferDeselectAll', settings.language)}
                  </button>
                  <span className="text-slate-500 dark:text-slate-400 ml-2">
                    {t('transferSelectedCount', settings.language).replace(
                      '{count}',
                      String(selectedSnippetIds.size)
                    )}{' '}
                    / {filteredItems.length} từ
                  </span>
                </div>

                {/* Overwrite conflict toggle */}
                <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={overwriteConflict}
                    onChange={(e) => setOverwriteConflict(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500/40 cursor-pointer"
                  />
                  <span>{t('transferOverwriteConflict', settings.language)}</span>
                </label>
              </div>

              {/* Snippets List with Expand Cards: Only [Env] -> [Shortcut] on row, content visible on expand */}
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                    Không tìm thấy từ viết tắt nào khớp với từ khóa tìm kiếm.
                  </div>
                ) : (
                  filteredItems.map(({ envName, snippet }) => {
                    const isSelected = selectedSnippetIds.has(snippet.id);
                    const isExpanded = expandedSnippetIds.has(snippet.id);
                    const isConflict = targetShortcuts.has(snippet.shortcut.toLowerCase());

                    return (
                      <div
                        key={snippet.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-sky-400 dark:border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 ring-1 ring-sky-400/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121927]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Left: Checkbox only */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelect(snippet.id);
                            }}
                            className="p-1 rounded text-sky-600 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                            title={isSelected ? 'Bỏ chọn từ này' : 'Chọn từ này'}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          {/* Center: [Nhóm nguồn] -> [Từ viết tắt] + Status Badge (NO replacement text direct on row) */}
                          <div
                            className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer select-none"
                            onClick={() => toggleExpand(snippet.id)}
                            title={isExpanded ? 'Nhấp để thu gọn' : 'Nhấp để xem đoạn văn thay thế'}
                          >
                            {/* Environment Tag */}
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                              {envName}
                            </span>

                            <span className="text-xs font-bold text-slate-400">→</span>

                            {/* Shortcut Badge */}
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 border border-sky-200 dark:border-sky-800 shrink-0">
                              {snippet.shortcut}
                            </span>

                            {/* Conflict or New Status Badge */}
                            {isConflict ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                                <AlertCircle className="w-3 h-3" />
                                <span>{t('transferConflictBadge', settings.language)}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                                <Sparkles className="w-3 h-3" />
                                <span>{t('transferNewBadge', settings.language)}</span>
                              </span>
                            )}
                          </div>

                          {/* Right: Expand/Collapse Arrow */}
                          <button
                            type="button"
                            onClick={() => toggleExpand(snippet.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer shrink-0"
                            title={isExpanded ? 'Thu gọn' : 'Xem đoạn văn thay thế'}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Full Expanded Card Content: ONLY shown when expanded */}
                        {isExpanded && (
                          <div className="mt-2.5 p-2.5 bg-slate-50 dark:bg-[#0c1220] rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words max-h-36 overflow-y-auto custom-scrollbar animate-in fade-in duration-100">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                              Đoạn văn thay thế:
                            </div>
                            {snippet.content}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#0c1220]/50">
          <button
            type="button"
            onClick={closeTransferModal}
            className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t('cancel', settings.language)}
          </button>
          <button
            type="button"
            disabled={selectedSnippetIds.size === 0 || allOtherSnippets.length === 0}
            onClick={handleTransfer}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white shadow-sm shadow-sky-600/30 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>
              {t('transferAddBtn', settings.language).replace(
                '{count}',
                String(selectedSnippetIds.size)
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
