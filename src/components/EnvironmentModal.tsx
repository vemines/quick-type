import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n';
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
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-[#0c1220] border border-sky-200 dark:border-sky-500/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t('envModalTitle', settings.language)}
            </h3>
          </div>
          <button
            onClick={closeEnvModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-[#0c1220] text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!newEnvName.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 disabled:opacity-50 text-white shadow-sm shadow-sky-600/20 transition-all cursor-pointer shrink-0"
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
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-sky-50/80 dark:bg-[#0c1220] border-sky-300 dark:border-sky-500/60 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#121927] border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {/* Left: Name or Inline Edit Input */}
                  <div className="flex-1 mr-3">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          autoFocus
                          value={editingEnvName}
                          onChange={(e) => setEditingEnvName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(env.id);
                            if (e.key === 'Escape') setEditingEnvId(null);
                          }}
                          className="w-full px-2.5 py-1 text-xs sm:text-sm font-semibold bg-white dark:bg-[#182234] text-slate-900 dark:text-slate-100 rounded-lg border border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(env.id)}
                          className="p-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-500 transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEnvId(null)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {env.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions (Rename, Delete, and Switch toggle) */}
                  {!isEditing && (
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Rename Button */}
                      <button
                        type="button"
                        onClick={() => startRename(env.id, env.name)}
                        title={t('renameEnv', settings.language)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      {environments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(t('deleteEnvConfirm', settings.language))) {
                              deleteEnvironment(env.id);
                            }
                          }}
                          title={t('delete', settings.language)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Switch Toggle Button */}
                      <label
                        className="relative inline-flex items-center cursor-pointer ml-1"
                        title={
                          isActive
                            ? settings.language === 'vi'
                              ? 'Nhóm đang hoạt động'
                              : 'Active group'
                            : settings.language === 'vi'
                            ? 'Chuyển sang nhóm này'
                            : 'Switch to this group'
                        }
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => {
                            if (!isActive) switchEnvironment(env.id);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-sky-600"></div>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
