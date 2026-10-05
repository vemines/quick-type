import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { SnippetList } from './components/SnippetList';
import { SnippetModal } from './components/SnippetModal';
import { EnvironmentModal } from './components/EnvironmentModal';
import { SettingsModal } from './components/SettingsModal';
import { DuplicateConflictModal } from './components/DuplicateConflictModal';
import { ImportConfigModal } from './components/ImportConfigModal';
import { TransferSnippetsModal } from './components/TransferSnippetsModal';
import { ToastContainer } from './components/Toast';

const AppContent: React.FC = () => {
  const { importAnalysis } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Snippets Grid & Search */}
        <SnippetList />
      </main>

      {/* Modals & Floating Toasts */}
      <SnippetModal />
      <EnvironmentModal />
      <SettingsModal />
      <DuplicateConflictModal />
      <ImportConfigModal key={importAnalysis?.importId || 'idle'} />
      <TransferSnippetsModal />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
