import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import DashboardView from './components/views/DashboardView';
import AnalyticsView from './components/views/AnalyticsView';
import HistoryView from './components/views/HistoryView';
import SettingsView from './components/views/SettingsView';
import AuthView from './components/views/AuthView';
import BottomNav from './components/common/BottomNav';
import AddTransactionModal from './components/common/AddTransactionModal';
import ToastNotification from './components/common/ToastNotification';

const AppContent = () => {
  const { currentTab, user, isAuthLoading } = useFinance();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070B14] flex flex-col justify-center items-center sm:py-6 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glow elements matching prototype (hardware accelerated) */}
      <div
        className="fixed -top-24 -left-20 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl transform-gpu will-change-transform pointer-events-none animate-float-orb z-0"
        aria-hidden="true"
      />
      <div
        className="fixed -bottom-28 -right-24 w-[420px] h-[420px] rounded-full bg-indigo-500/20 blur-3xl transform-gpu will-change-transform pointer-events-none animate-float-orb [animation-delay:-7s] z-0"
        aria-hidden="true"
      />
      <div
        className="fixed top-1/3 right-1/4 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl transform-gpu will-change-transform pointer-events-none animate-float-orb [animation-delay:-12s] z-0"
        aria-hidden="true"
      />

      {/* Mobile-first simulated shell */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[850px] sm:max-h-[920px] bg-white/95 dark:bg-[#0A0F1D]/90 backdrop-blur-2xl text-slate-900 dark:text-slate-100 sm:rounded-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden sm:border sm:border-slate-200/80 dark:sm:border-slate-800 z-10">
        
        {/* Modern Toast Notification Alert */}
        <ToastNotification />

        {/* Loading Session */}
        {isAuthLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <span className="w-9 h-9 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">ກຳລັງກວດສອບບັນຊີ...</p>
          </div>
        ) : !user ? (
          /* Authentication Screen */
          <main className="flex-1 overflow-y-auto no-scrollbar">
            <AuthView />
          </main>
        ) : (
          /* Main Authenticated App Screen */
          <>
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
          </>
        )}
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
