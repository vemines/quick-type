import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import type { EnvPrefixConflict } from '../types';
import { AlertTriangle, Layers, X, ShieldAlert, SkipForward, Check } from 'lucide-react';

export const PrefixConflictModal: React.FC = () => {
  const {
    prefixConflictState,
    resolvePrefixConflicts,
    dismissPrefixConflicts,
    settings,
    activeEnvironment,
  } = useApp();

  const [localConflicts, setLocalConflicts] = useState<EnvPrefixConflict[]>([]);

  // Sync state when modal opens
  useEffect(() => {
    if (prefixConflictState?.conflicts) {
      setLocalConflicts(JSON.parse(JSON.stringify(prefixConflictState.conflicts)));
    } else {
      setLocalConflicts([]);
    }
  }, [prefixConflictState]);

  if (!prefixConflictState || localConflicts.length === 0) return null;

  const handleSelectRadio = (envId: string, clusterId: string, snippetId: string | null) => {
    setLocalConflicts((prev) =>
      prev.map((env) => {
        if (env.envId !== envId) return env;
        return {
          ...env,
          clusters: env.clusters.map((cluster) => {
            if (cluster.id !== clusterId) return cluster;
            return {
              ...cluster,
              selectedSnippetId: snippetId,
            };
          }),
        };
      })
    );
  };

  const handleToggleSkipEnv = (envId: string) => {
    setLocalConflicts((prev) =>
      prev.map((env) => {
        if (env.envId !== envId) return env;
        return {
          ...env,
          isSkipped: !env.isSkipped,
        };
      })
    );
  };

  const handleApply = () => {
    resolvePrefixConflicts(localConflicts);
  };

  const handleCancel = () => {
    dismissPrefixConflicts();
  };

  const isSettingsToggle = prefixConflictState.reason === 'settings_toggle';
  const isSnippetSave = prefixConflictState.reason === 'snippet_save';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#182234] rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-600 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between shrink-0 bg-amber-500/5 dark:bg-amber-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/80 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {isSnippetSave
                  ? t('prefixSaveSnippetTitle', settings.language)
                  : t('prefixModalTitle', settings.language)}
              </h3>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Notice / Description */}
        <div className="px-6 py-3.5 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-800/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            {isSnippetSave
              ? t('prefixSaveSnippetDesc', settings.language)
              : t('prefixModalDesc', settings.language)}
          </div>
        </div>

        {/* Modal Body: Conflict Environments & Clusters */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {localConflicts.map((env) => {
            const isCurrentEnv = env.envId === activeEnvironment.id;
            return (
              <div
                key={env.envId}
                className={`rounded-xl border transition-all ${
                  env.isSkipped
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-[#0c1220]/40 opacity-75'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50/40 dark:bg-[#0c1220]/60'
                } overflow-hidden`}
              >
                {/* Environment Group Header */}
                <div className="px-4 py-3 bg-slate-100/80 dark:bg-[#121a29] border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {env.envName}
                    </span>
                    {isCurrentEnv && (
                      <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 rounded border border-sky-300 dark:border-sky-800">
                        {t('envActive', settings.language)}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t('prefixConflictClustersCount', settings.language).replace(
                        '{count}',
                        String(env.clusters.length)
                      )}
                    </span>
                  </div>

                  {/* Allow Skip if multiple environments or not active */}
                  {localConflicts.length > 1 && !isCurrentEnv && (
                    <button
                      type="button"
                      onClick={() => handleToggleSkipEnv(env.envId)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                        env.isSkipped
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          : 'bg-white dark:bg-[#182234] text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <SkipForward className="w-3 h-3" />
                      <span>
                        {env.isSkipped
                          ? t('prefixUnskipEnvBtn', settings.language)
                          : t('prefixSkipEnvBtn', settings.language)}
                      </span>
                    </button>
                  )}
                </div>

                {/* If Skipped Notice */}
                {env.isSkipped ? (
                  <div className="p-4 text-xs text-slate-500 dark:text-slate-400 italic text-center">
                    {t('prefixEnvSkippedNotice', settings.language)}
                  </div>
                ) : (
                  /* Clusters List */
                  <div className="p-4 space-y-4">
                    {env.clusters.map((cluster, cIndex) => {
                      return (
                        <div
                          key={cluster.id}
                          className="bg-white dark:bg-[#182234] rounded-lg border border-slate-200 dark:border-slate-700 p-3.5 space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            <span>
                              {t('prefixClusterTitle', settings.language).replace(
                                '{index}',
                                String(cIndex + 1)
                              )}
                            </span>
                            <span className="font-mono text-amber-600 dark:text-amber-400">
                              {cluster.snippets.map((s) => s.shortcut).join(' ↔ ')}
                            </span>
                          </div>

                          {/* Radio Options for each snippet */}
                          <div className="space-y-1.5">
                            {cluster.snippets.map((snippet) => {
                              const isSelected = cluster.selectedSnippetId === snippet.id;

                              return (
                                <label
                                  key={snippet.id}
                                  className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                                    isSelected
                                      ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 shadow-2xs'
                                      : 'bg-slate-50/60 dark:bg-[#0c1220]/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100/60 dark:hover:bg-[#121927]'
                                  }`}
                                >
                                  {/* Custom Radio Circle */}
                                  <div className="pt-0.5">
                                    <input
                                      type="radio"
                                      name={cluster.id}
                                      checked={isSelected}
                                      onChange={() =>
                                        handleSelectRadio(env.envId, cluster.id, snippet.id)
                                      }
                                      className="sr-only"
                                    />
                                    <div
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                        isSelected
                                          ? 'border-sky-600 bg-sky-600 dark:border-sky-500 dark:bg-sky-500'
                                          : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-[#182234]'
                                      }`}
                                    >
                                      {isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Snippet Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                        {snippet.shortcut}
                                      </span>

                                      {isSelected ? (
                                        <span className="ml-auto text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                                          <Check className="w-3 h-3" /> {t('prefixKeepActive', settings.language)}
                                        </span>
                                      ) : (
                                        <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">
                                          {t('prefixWillDisable', settings.language)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Content preview */}
                                    <div className="text-xs text-slate-600 dark:text-slate-300 truncate mt-1 font-mono">
                                      {snippet.content}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}

                            {/* Option: Disable all in this cluster */}
                            <label
                              className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                                cluster.selectedSnippetId === null
                                  ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-400 dark:border-rose-500 text-rose-700 dark:text-rose-300'
                                  : 'bg-transparent border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#121927]'
                              }`}
                            >
                              <input
                                type="radio"
                                name={cluster.id}
                                checked={cluster.selectedSnippetId === null}
                                onChange={() =>
                                  handleSelectRadio(env.envId, cluster.id, null)
                                }
                                className="sr-only"
                              />
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                  cluster.selectedSnippetId === null
                                    ? 'border-rose-600 bg-rose-600 dark:border-rose-500 dark:bg-rose-500'
                                    : 'border-slate-400 dark:border-slate-500 bg-white dark:bg-[#182234]'
                                }`}
                              >
                                {cluster.selectedSnippetId === null && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                )}
                              </div>
                              <span className="font-medium">
                                {t('prefixDisableAllInCluster', settings.language)}
                              </span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-[#121a29] flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#182234] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {t('prefixCancelBtn', settings.language)}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>
              {isSettingsToggle
                ? t('prefixApplyEnableAutoBtn', settings.language)
                : t('prefixApplyBtn', settings.language)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
