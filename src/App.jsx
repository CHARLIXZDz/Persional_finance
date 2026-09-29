import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import DashboardView from './components/views/DashboardView';
import AnalyticsView from './components/views/AnalyticsView';
import HistoryView from './components/views/HistoryView';
import SettingsView from './components/views/SettingsView';
import BottomNav from './components/common/BottomNav';
import AddTransactionModal from './components/common/AddTransactionModal';

const AppContent = () => {
  const { currentTab } = useFinance();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-center items-center sm:py-6">
      {/* Mobile-first simulated shell */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[920px] bg-slate-50 dark:bg-fintech-dark text-slate-900 dark:text-slate-100 sm:rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden sm:border sm:border-slate-200/80 dark:sm:border-slate-800">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'analytics' && <AnalyticsView />}
          {currentTab === 'history' && <HistoryView />}
          {currentTab === 'settings' && <SettingsView />}
        </main>

        {/* Docked Bottom Navigation */}
        <BottomNav />

        {/* Add Transaction Modal / Bottom Sheet */}
        <AddTransactionModal />
      </div>
    </div>
  );
};

export const App = () => {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export default App;
