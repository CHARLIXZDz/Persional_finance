import React from 'react';
import { Home, PieChart, Clock, Settings, Plus } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const BottomNav = () => {
  const { currentTab, setCurrentTab, setIsAddModalOpen, t } = useFinance();

  const tabs = [
    { id: 'dashboard', label: t('nav.home'), icon: Home },
    { id: 'analytics', label: t('nav.analytics'), icon: PieChart },
    // Center Action Button placeholder
    { id: 'history', label: t('nav.history'), icon: Clock },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] sm:pb-4">
      {/* Docked Navigation Bar */}
      <nav className="pointer-events-auto relative w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl px-3 py-2 flex items-center justify-around">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 active:scale-95 ${
            currentTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Home className="w-5 h-5 transition-transform" />
          <span className="text-[10px] mt-1 font-medium leading-none">{t('nav.home')}</span>
          {currentTab === 'dashboard' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Tab 2: Analytics */}
        <button
          onClick={() => setCurrentTab('analytics')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 active:scale-95 ${
            currentTab === 'analytics'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <PieChart className="w-5 h-5 transition-transform" />
          <span className="text-[10px] mt-1 font-medium leading-none">{t('nav.analytics')}</span>
          {currentTab === 'analytics' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Center Action Button (+) - Leveled and centered with other buttons */}
        <div className="flex-1 flex items-center justify-center py-1">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="group relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 active:scale-90"
            aria-label={t('nav.addTransaction')}
            title={t('nav.addTransaction')}
          >
            <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90 group-active:rotate-90 stroke-[2.5]" />
            {/* Subtle pulse animation */}
            <span className="absolute inset-0 rounded-2xl bg-emerald-400/20 animate-ping -z-10 pointer-events-none" />
          </button>
        </div>

        {/* Tab 3: History */}
        <button
          onClick={() => setCurrentTab('history')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 active:scale-95 ${
            currentTab === 'history'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Clock className="w-5 h-5 transition-transform" />
          <span className="text-[10px] mt-1 font-medium leading-none">{t('nav.history')}</span>
          {currentTab === 'history' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5 animate-pulse" />
          )}
        </button>

        {/* Tab 4: Settings */}
        <button
          onClick={() => setCurrentTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 active:scale-95 ${
            currentTab === 'settings' || currentTab === 'reports'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Settings className="w-5 h-5 transition-transform" />
          <span className="text-[10px] mt-1 font-medium leading-none">{t('nav.settings')}</span>
          {(currentTab === 'settings' || currentTab === 'reports') && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5 animate-pulse" />
          )}
        </button>

      </nav>
    </div>
  );
};

export default BottomNav;
