import React, { useState, useEffect } from 'react';
import { Moon, Sun, Cloud } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { FlagIcon } from './FlagIcon';

export const Header = () => {
  const {
    user,
    isDarkMode,
    setIsDarkMode,
    language,
    setLanguage,
    languages,
    t,
    formatDateLocalized,
    isCloudConnected,
    avatarUrl,
  } = useFinance();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#headerLangDropdownWrapper')) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Dynamic user details
  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User');
  const initials =
    user?.user_metadata?.initials ||
    displayName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    displayName.slice(0, 2).toUpperCase() ||
    'MD';
  const plan = user?.user_metadata?.plan || (user?.email?.includes('alex') ? 'PRO' : 'FREE');

  // Format today's date localized
  const today = new Date();
  const dateFormatted = formatDateLocalized(today, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="shrink-0 z-30 bg-white/95 dark:bg-[#0A0F1D]/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/80 px-5 pt-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.75rem))] pb-3 flex items-center justify-between transition-colors shadow-xs">
      {/* User Greeting & Profile */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 p-[2px] shadow-sm">
            <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                  {initials}
                </span>
              )}
            </div>
          </div>
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
        </div>

        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">
              {dateFormatted}
            </span>
            <span
              className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                plan === 'PRO'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
              }`}
            >
              {plan}
            </span>
            {isCloudConnected && (
              <span title="Cloud Sync Active" className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <Cloud className="w-2.5 h-2.5" />
                <span>Cloud</span>
              </span>
            )}
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {t('header.greeting', { name: displayName })}
          </h1>
        </div>
      </div>

      {/* Header Actions: Language Dropdown (Flag only) + Theme Toggle */}
      <div className="flex items-center space-x-2">
        {/* Language Dropdown - Flag only like login page */}
        <div className="relative" id="headerLangDropdownWrapper">
          <button
            type="button"
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/50 flex items-center justify-center transition-all shadow-sm active:scale-95"
            aria-label="Select Language"
            title={languages[language]?.name || 'Language'}
          >
            <FlagIcon code={language} className="w-5 h-3.5" rounded={true} />
          </button>

          {/* Menu */}
          {isLangDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-slide-up flex flex-col gap-1">
              {Object.values(languages).map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                    language === lang.code
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FlagIcon code={lang.code} className="w-5 h-3.5" rounded={true} />
                    <span className="text-xs font-semibold">{lang.nativeName}</span>
                  </div>
                  {language === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shadow-sm active:scale-95 shrink-0"
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
