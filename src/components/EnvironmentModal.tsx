import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
import { Environment } from '../types';
import {
  X,
  Plus,
  Trash2,
  Users,
  Edit2,
  Check,
} from 'lucide-react';

export const EnvironmentModal: React.FC = () => {
  const {
    isEnvModalOpen,
    closeEnvModal,
    environments,
    activeEnvironmentId,
    switchEnvironment,
    addEnvironment,
    renameEnvironment,
    deleteEnvironment,
    settings,
  } = useApp();

  const [newEnvName, setNewEnvName] = useState('');
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null);
  const [editingEnvName, setEditingEnvName] = useState('');
  const [envToDelete, setEnvToDelete] = useState<Environment | null>(null);

  if (!isEnvModalOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvName.trim()) return;
    const success = addEnvironment(newEnvName);
    if (success) {
      setNewEnvName('');
    }
  };

  const startRename = (id: string, currentName: string) => {
    setEditingEnvId(id);
    setEditingEnvName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (!editingEnvName.trim()) return;
    const success = renameEnvironment(id, editingEnvName);
    if (success) {
      setEditingEnvId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#182234] rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-sky-50 dark:bg-[#0c1220] border border-sky-200 dark:border-sky-500/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('envModalTitle', settings.language)}
            </h3>
          </div>
          <button
            onClick={closeEnvModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 flex-1 overflow-hidden flex flex-col">
          {/* TOP PINNED: Create New Environment Form (Only 1 name field, no description) */}
          <form onSubmit={handleCreate} className="space-y-2 shrink-0">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t('envNameLabel', settings.language)}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                placeholder={t('envNamePlaceholder', settings.language)}
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0c1220] text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!newEnvName.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-md bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white shadow-sm shadow-sky-600/20 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t('createNewEnv', settings.language)}</span>
              </button>
            </div>
          </form>

          {/* DIVIDER */}
          <div className="border-t border-slate-200 dark:border-slate-700/80 shrink-0" />

          {/* SCROLLABLE Environments List (Never pushed out of view) */}
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1 flex-1">
            {environments.map((env) => {
              const isActive = env.id === activeEnvironmentId;
              const isEditing = editingEnvId === env.id;

              return (
                <div
                  key={env.id}
                  onClick={() => {
                    if (!isEditing && !isActive) {
                      switchEnvironment(env.id);
                    }
                  }}
                  className={`group flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer ${isActive
                    ? 'bg-sky-50/90 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500/70 shadow-xs ring-1 ring-sky-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/80 dark:bg-[#121927] dark:hover:bg-[#162032] border-slate-200 dark:border-slate-700/80'
                    }`}
                >
                  {/* Left: Radio/Tick Indicator + Name or Inline Edit Input */}
                  <div className="flex-1 mr-3 flex items-center gap-2.5 min-w-0">
                    {!isEditing && (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${isActive
                          ? 'border-sky-600 bg-sky-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 group-hover:border-sky-400'
                          }`}
                      >
                        {isActive && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    )}

                    {isEditing ? (
                      <div
                        className="flex items-center gap-1.5 flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          autoFocus
                          value={editingEnvName}
                          onChange={(e) => setEditingEnvName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(env.id);
                            if (e.key === 'Escape') setEditingEnvId(null);
                          }}
                          className="w-full px-2.5 py-1 text-xs sm:text-sm font-semibold bg-white dark:bg-[#182234] text-slate-900 dark:text-slate-100 rounded-md border border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(env.id)}
                          className="p-1.5 rounded-md bg-sky-600 text-white hover:bg-sky-500 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEnvId(null)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {env.name}
                      </span>
                    )}
                  </div>

                  {/* Right: Actions (Rename, Delete, and Active Status) */}
                  {!isEditing && (
                    <div
                      className="flex items-center gap-1.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Rename Button */}
                      <button
                        type="button"
                        onClick={() => startRename(env.id, env.name)}
                        title={t('renameEnv', settings.language)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      {environments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEnvToDelete(env)}
                          title={t('delete', settings.language)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Active Status Badge */}
                      {isActive ? (
                        <span className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/40 select-none">
                          {t('envActive', settings.language)}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => switchEnvironment(env.id)}
                          className="ml-1 text-[11px] font-medium px-2 py-0.5 rounded-md text-slate-500 hover:text-sky-600 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-sky-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          {t('envSelect', settings.language)}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Delete Confirmation Sub-Modal */}
        {envToDelete && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setEnvToDelete(null);
            }}
          >
            <div
              className="w-full max-w-sm bg-white dark:bg-[#182234] rounded-xl shadow-2xl border border-slate-300 dark:border-slate-600 p-5 space-y-4 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {t('deleteEnvModalTitle', settings.language)}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {t('deleteEnvConfirmQuestion', settings.language).replace('{name}', envToDelete.name)}
                    <br />
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      {t('deleteEnvWarningCount', settings.language).replace('{count}', String(envToDelete.snippets?.length || 0))}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/70">
                <button
                  type="button"
                  onClick={() => setEnvToDelete(null)}
                  className="px-4 py-2 text-xs font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {t('cancel', settings.language)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteEnvironment(envToDelete.id);
                    setEnvToDelete(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-md bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm shadow-rose-600/20 transition-all cursor-pointer"
                >
                  {t('confirmDelete', settings.language)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
