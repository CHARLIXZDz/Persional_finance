import React from 'react';
import { Bell, Moon, Sun, Globe } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CURRENCIES } from '../../data/categories';

export const Header = () => {
  const {
    isDarkMode,
    setIsDarkMode,
    currency,
    setCurrency,
    language,
    setLanguage,
    languages,
    t,
    formatDateLocalized,
  } = useFinance();

  // Format today's date localized
  const today = new Date();
  const dateFormatted = formatDateLocalized(today, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="pt-4 pb-3 px-5 flex items-center justify-between">
      {/* User Greeting & Profile */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-[2px] shadow-sm">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              <span className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                EP
              </span>
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
              {dateFormatted}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              {t('common.pro')}
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {t('header.greeting')}
          </h1>
        </div>
      </div>

      {/* Header Actions: Quick Language & Currency Switcher, Theme */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Language Quick Switcher */}
        <div className="relative group">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-xs font-bold appearance-none bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 pr-6 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer transition-all hover:border-emerald-400"
            title={t('header.chooseLanguage')}
            aria-label={t('header.chooseLanguage')}
          >
            {Object.values(languages).map((lang) => (
              <option key={lang.code} value={lang.code} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                {lang.flag} {lang.nativeName}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* Currency Quick Pill */}
        <div className="relative group">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-xs font-bold appearance-none bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-2.5 py-1.5 pr-6 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer transition-all hover:border-emerald-400"
            title={t('header.chooseCurrency')}
            aria-label={t('header.chooseCurrency')}
          >
            {Object.values(CURRENCIES).map((curr) => (
              <option key={curr.code} value={curr.code} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                {curr.flag} {curr.code}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400 text-[10px]">
            ▼
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-8.5 h-8.5 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shadow-sm active:scale-95 shrink-0"
          aria-label={t('header.toggleTheme')}
          title={t('header.toggleTheme')}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
