import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CURRENCIES } from '../../data/categories';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Languages,
  LogIn,
} from 'lucide-react';

export const SettingsView = () => {
  const {
    currency,
    setCurrency,
    language,
    setLanguage,
    languages,
    isDarkMode,
    setIsDarkMode,
    isBalanceHidden,
    setIsBalanceHidden,
    resetToSampleData,
    t,
  } = useFinance();

  const [activeUser] = useState(() => {
    try {
      const stored = localStorage.getItem('moneydairy_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    return {
      name: 'Alex Phommaseng',
      email: 'alex@moneydairy.app',
      initials: 'EP',
    };
  });

  return (
    <div className="flex-1 px-5 pt-6 pb-28 space-y-5 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>{t('settings.title')}</span>
          <SettingsIcon className="w-5 h-5 text-emerald-500" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-[2px]">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center font-extrabold text-lg text-emerald-500">
              {activeUser.initials || 'EP'}
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {activeUser.name}
            </h2>
            <p className="text-xs text-slate-400">{activeUser.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
              {t('common.proPlanActive')}
            </span>
          </div>
        </div>

        <a
          href="/login funciton test/home.html"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          title="Open Authentication & Login Portal"
        >
          <LogIn className="w-3.5 h-3.5 text-emerald-500" />
          <span>Login / Auth</span>
        </a>
      </div>

      {/* Language Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('settings.languageSection')}</span>
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Object.values(languages).map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 relative ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm ring-1 ring-emerald-500/50'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl mb-1">{lang.flag}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white text-center leading-tight">
                  {lang.nativeName}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{lang.name}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency Section */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          {t('settings.currencySection')}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {Object.values(CURRENCIES).map((curr) => {
            const isSelected = currency === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => setCurrency(curr.code)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all active:scale-95 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm ring-1 ring-emerald-500/50'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <span className="text-xl mb-0.5">{curr.flag}</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {curr.code}
                </span>
                <span className="text-[10px] text-slate-400">{curr.symbol}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Appearance & Security */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          {t('settings.preferencesSection')}
        </h3>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Dark Mode */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('settings.darkMode')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isDarkMode ? t('settings.darkThemeDesc') : t('settings.lightThemeDesc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                isDarkMode ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              aria-label={t('settings.darkMode')}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Privacy Mode */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('settings.hideBalance')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t('settings.hideBalanceDesc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                isBalanceHidden ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
              aria-label={t('settings.hideBalance')}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  isBalanceHidden ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          {t('settings.dataSection')}
        </h3>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('settings.resetData')}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t('settings.resetDataDesc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm(t('settings.resetConfirm'))) {
                  resetToSampleData();
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      </div>

      {/* App Info Footer */}
      <div className="text-center pt-2">
        <p className="text-[11px] font-semibold text-slate-400">
          {t('common.version')}
        </p>
        <p className="text-[10px] text-slate-400/80 mt-0.5">
          {t('common.builtWith')}
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
