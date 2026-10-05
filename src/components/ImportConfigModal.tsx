import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import {
  X,
  GitMerge,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileCode2,
  ArrowLeft,
  Check,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
} from 'lucide-react';

export const ImportConfigModal: React.FC = () => {
  const {
    importAnalysis,
    dismissImportAnalysis,
    executeMergeImport,
    executeReplaceImport,
    resolveMergeConflicts,
    settings,
  } = useApp();

  const [stage, setStage] = useState<'initial' | 'replace-warning' | 'merge-conflicts'>('initial');
  const [expandedLostSnippetIds, setExpandedLostSnippetIds] = useState<Set<string>>(new Set());
  const [expandedConflictIds, setExpandedConflictIds] = useState<Set<string>>(new Set());
  const [selectedConflictIds, setSelectedConflictIds] = useState<Set<string>>(new Set());
  const [isLostListOpen, setIsLostListOpen] = useState(false);

  // Always reset to initial stage and clean selection when a new import is loaded
  useEffect(() => {
    if (importAnalysis) {
      setStage('initial');
      setSelectedConflictIds(new Set());
      setExpandedLostSnippetIds(new Set());
      setExpandedConflictIds(new Set());
      setIsLostListOpen(false);
    }
  }, [importAnalysis?.importId]);

  if (!importAnalysis) return null;

  const {
    fileName,
    totalEnvsInFile,
    totalSnippetsInFile,
    newEnvsCount,
    diffSnippetsCount,
    conflicts,
    lostEnvs,
    lostSnippets,
  } = importAnalysis;

  const handleMergeClick = () => {
    executeMergeImport();
    if (conflicts.length > 0) {
      setStage('merge-conflicts');
      setSelectedConflictIds(new Set());
    }
  };

  const toggleExpandLostSnippet = (uniqueKey: string) => {
    setExpandedLostSnippetIds((prev) => {
      const next = new Set(prev);
      if (next.has(uniqueKey)) next.delete(uniqueKey);
      else next.add(uniqueKey);
      return next;
    });
  };

  const toggleExpandConflict = (conflictId: string) => {
    setExpandedConflictIds((prev) => {
      const next = new Set(prev);
      if (next.has(conflictId)) next.delete(conflictId);
      else next.add(conflictId);
      return next;
    });
  };

  const toggleSelectConflict = (conflictId: string) => {
    setSelectedConflictIds((prev) => {
      const next = new Set(prev);
      if (next.has(conflictId)) next.delete(conflictId);
      else next.add(conflictId);
      return next;
    });
  };

  const selectAllConflicts = () => {
    setSelectedConflictIds(new Set(conflicts.map((c) => c.id)));
  };

  const deselectAllConflicts = () => {
    setSelectedConflictIds(new Set());
  };

  const handleClose = () => {
    setStage('initial');
    dismissImportAnalysis();
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
              <FileCode2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t('importModalTitle', settings.language)}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs sm:max-w-md">
                {fileName} ({totalEnvsInFile} nhóm, {totalSnippetsInFile} từ)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
          {/* STAGE 1: Initial Choice (Merge vs Replace) */}
          {stage === 'initial' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {t('importAnalyzeTitle', settings.language)}: Vui lòng chọn phương thức nhập dữ liệu phù hợp với nhu cầu của bạn.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                {/* OPTION 1: MERGE (Recommended) */}
                <div
                  onClick={handleMergeClick}
                  className="group p-4 rounded-xl border-2 border-sky-200 hover:border-sky-500 dark:border-sky-900/60 dark:hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50/90 dark:bg-sky-950/20 dark:hover:bg-sky-950/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-xs">
                        <GitMerge className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
                        An toàn
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {t('importMergeBtn', settings.language)}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {t('importMergeDesc', settings.language)}
                      </p>
                    </div>
                  </div>

                  {/* Merge Stats Summary */}
                  <div className="pt-2 border-t border-sky-200/80 dark:border-sky-900/80 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>+{newEnvsCount} nhóm mới</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>+{diffSnippetsCount} từ viết tắt mới</span>
                    </div>
                    {conflicts.length > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{conflicts.length} từ trùng phím (giữ từ cũ)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* OPTION 2: REPLACE (Warning) */}
                <div
                  onClick={() => setStage('replace-warning')}
                  className="group p-4 rounded-xl border-2 border-rose-200 hover:border-rose-500 dark:border-rose-900/60 dark:hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                        Cảnh báo
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                        {t('importReplaceBtn', settings.language)}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {t('importReplaceDesc', settings.language)}
                      </p>
                    </div>
                  </div>

                  {/* Replace Warning Summary */}
                  <div className="pt-2 border-t border-rose-200/80 dark:border-rose-900/80 space-y-1 text-xs text-rose-700 dark:text-rose-400 font-medium">
                    <div>Mất {lostEnvs.length} nhóm hiện có</div>
                    <div>Mất {lostSnippets.length} từ viết tắt hiện có</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 2: Replace Confirmation & Expand Cards Preview */}
          {stage === 'replace-warning' && (
            <div className="space-y-4">
              {/* Alert Header */}
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                    {t('importReplaceWarnTitle', settings.language)}
                  </h4>
                  <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                    {t('importLostEnvsSummary', settings.language)
                      .replace('{envCount}', String(lostEnvs.length))
                      .replace('{snippetCount}', String(lostSnippets.length))}
                  </p>
                </div>
              </div>

              {/* Lost Environments Badges */}
              {lostEnvs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Các nhóm sẽ bị xóa:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {lostEnvs.map((env) => (
                      <span
                        key={env.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                      >
                        <Layers className="w-3 h-3 text-slate-500" />
                        <span>{env.name}</span>
                        <span className="text-[10px] text-slate-500">({env.snippetCount} từ)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collapsible Expand Cards List of Lost Words */}
              {lostSnippets.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-[#0c1220]/50">
                  <button
                    type="button"
                    onClick={() => setIsLostListOpen(!isLostListOpen)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>
                        {isLostListOpen
                          ? t('importHideLostSnippets', settings.language)
                          : t('importViewLostSnippets', settings.language)}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px]">
                        {lostSnippets.length}
                      </span>
                    </span>
                    {isLostListOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isLostListOpen && (
                    <div className="p-3 space-y-2 max-h-60 overflow-y-auto custom-scrollbar border-t border-slate-200 dark:border-slate-700">
                      {lostSnippets.map(({ envName, snippet }, idx) => {
                        const uniqueKey = `${envName}_${snippet.id}_${idx}`;
                        const isExpanded = expandedLostSnippetIds.has(uniqueKey);

                        return (
                          <div
                            key={uniqueKey}
                            className="p-2.5 rounded-lg bg-white dark:bg-[#121927] border border-slate-200 dark:border-slate-700/80 shadow-2xs space-y-1.5"
                          >
                            <div
                              className="flex items-center justify-between gap-2 cursor-pointer select-none"
                              onClick={() => toggleExpandLostSnippet(uniqueKey)}
                              title={isExpanded ? 'Nhấp để thu gọn' : 'Nhấp để mở rộng xem toàn bộ nội dung'}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                                  {envName}
                                </span>
                                <span className="text-xs font-bold text-slate-400">→</span>
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900 shrink-0">
                                  {snippet.shortcut}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleExpandLostSnippet(uniqueKey)}
                                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer shrink-0"
                                title={isExpanded ? 'Thu gọn' : 'Xem toàn bộ'}
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>

                            {/* Full Expanded Card Content */}
                            {isExpanded && (
                              <div className="mt-1.5 p-2 bg-slate-50 dark:bg-[#0c1220] rounded border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words max-h-36 overflow-y-auto custom-scrollbar animate-in fade-in duration-100">
                                {snippet.content}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStage('initial')}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    {t('importCancel', settings.language)}
                  </button>
                  <button
                    type="button"
                    onClick={executeReplaceImport}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm shadow-rose-600/30 transition-all cursor-pointer"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{t('importConfirmReplace', settings.language)}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 3: Merge Conflict Resolution (Post-Merge Review) */}
          {stage === 'merge-conflicts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    {t('importMergeConflictTitle', settings.language)} ({conflicts.length})
                  </h4>
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {t('importMergeConflictDesc', settings.language)}
                  </p>
                </div>
              </div>

              {/* Selection Bar */}
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={selectAllConflicts}
                    className="font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Chọn tất cả
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={deselectAllConflicts}
                    className="font-medium text-slate-500 hover:underline cursor-pointer"
                  >
                    Bỏ chọn
                  </button>
                </div>
                <span className="text-slate-500 dark:text-slate-400">
                  Đã chọn {selectedConflictIds.size} / {conflicts.length} từ
                </span>
              </div>

              {/* Conflicts List with Expand Cards */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                {conflicts.map((conflict) => {
                  const isSelected = selectedConflictIds.has(conflict.id);
                  const isExpanded = expandedConflictIds.has(conflict.id);

                  return (
                    <div
                      key={conflict.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-amber-400 dark:border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-400/20'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121927]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        {/* Checkbox button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectConflict(conflict.id);
                          }}
                          className="p-1 rounded text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                          title={isSelected ? 'Bỏ chọn ghi đè' : 'Chọn để ghi đè'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </button>

                        {/* Card Content & Header - Clicking anywhere expands / collapses */}
                        <div
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer select-none"
                          onClick={() => toggleExpandConflict(conflict.id)}
                          title={isExpanded ? 'Nhấp để thu gọn' : 'Nhấp để so sánh nội dung'}
                        >
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                            {conflict.targetEnvName}
                          </span>
                          <span className="text-xs font-bold text-slate-400">→</span>
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shrink-0">
                            {conflict.shortcut}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                            <AlertCircle className="w-3 h-3" />
                            <span>Trùng phím</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExpandConflict(conflict.id)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer shrink-0"
                          title={isExpanded ? 'Thu gọn' : 'So sánh nội dung'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Expand Card: Side-by-side comparison */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2 rounded bg-slate-50 dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Hiện tại trong máy (Giữ nguyên):
                            </div>
                            <div className="whitespace-pre-wrap break-words max-h-28 overflow-y-auto custom-scrollbar text-slate-800 dark:text-slate-200">
                              {conflict.existingContent}
                            </div>
                          </div>
                          <div className="p-2 rounded bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80">
                            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
                              Từ file import (Ghi đè nếu chọn):
                            </div>
                            <div className="whitespace-pre-wrap break-words max-h-28 overflow-y-auto custom-scrollbar text-amber-900 dark:text-amber-200">
                              {conflict.incomingContent}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => resolveMergeConflicts([])}
                  className="px-3.5 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('importSkipConflicts', settings.language)}
                </button>
                <button
                  type="button"
                  disabled={selectedConflictIds.size === 0}
                  onClick={() => resolveMergeConflicts(Array.from(selectedConflictIds))}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white shadow-sm shadow-sky-600/30 transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {t('importOverwriteSelected', settings.language)} ({selectedConflictIds.size})
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
