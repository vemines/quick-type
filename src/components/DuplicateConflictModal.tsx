import React from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { AlertTriangle, X, CheckCircle2, AlertCircle } from 'lucide-react';

export const DuplicateConflictModal: React.FC = () => {
  const { duplicateConflict, dismissDuplicateConflict, confirmForceEnable, settings } = useApp();

  if (!duplicateConflict) return null;

  const { candidate, existing } = duplicateConflict;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#182234] rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-600 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-[#0c1220] border border-amber-200 dark:border-amber-500/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('duplicateWarningTitle', settings.language)}
            </h3>
          </div>
          <button
            onClick={dismissDuplicateConflict}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('duplicateWarningDesc', settings.language)}
          </p>

          {/* Conflict Triggers Comparison */}
          <div className="space-y-3">
            {/* Existing Active */}
            <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-[#0c1220] border border-emerald-300 dark:border-emerald-500/50 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('duplicateActive', settings.language)}:</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                  {existing.shortcut}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-[#121927] p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 line-clamp-2">
                {existing.content}
              </div>
            </div>

            {/* Candidate Trigger */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-[#0c1220] border border-amber-300 dark:border-amber-500/50 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{t('duplicateTurningOn', settings.language)}:</span>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                  {candidate.shortcut}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-[#121927] p-2.5 rounded-lg border border-amber-200 dark:border-amber-800/60 line-clamp-2">
                {candidate.content}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={dismissDuplicateConflict}
              className="px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('cancel', settings.language)}
            </button>
            <button
              type="button"
              onClick={confirmForceEnable}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-sm shadow-amber-600/20 transition-all cursor-pointer"
            >
              {t('confirmEnable', settings.language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
