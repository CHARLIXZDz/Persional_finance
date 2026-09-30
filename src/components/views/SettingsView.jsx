import React, { useState, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import LogoutModal from '../common/LogoutModal';
import { FlagIcon } from '../common/FlagIcon';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  Languages,
  LogOut,
  Camera,
  Trash2,
} from 'lucide-react';

export const SettingsView = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const {
    user,
    signOut,
    language,
    setLanguage,
    languages,
    isDarkMode,
    setIsDarkMode,
    isBalanceHidden,
    setIsBalanceHidden,
    resetToSampleData,
    avatarUrl,
    updateAvatar,
    removeAvatar,
    showToast,
    t,
  } = useFinance();

  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User');
  const userEmail = user?.email || 'user@moneydairy.app';
  const initials =
    user?.user_metadata?.initials ||
    userName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    userName.slice(0, 2).toUpperCase() ||
    'MD';
  const plan = user?.user_metadata?.plan || (user?.email?.includes('alex') ? 'PRO' : 'FREE');

  // Handle avatar image upload with client-side canvas compression
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Please select a valid image file',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        updateAvatar(compressedDataUrl);
        showToast({
          type: 'success',
          title: 'Avatar',
          message: t('settings.avatarUpdated'),
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    removeAvatar();
    showToast({
      type: 'info',
      title: 'Avatar',
      message: t('settings.avatarRemoved'),
    });
  };

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

      {/* User Profile Card with Avatar Photo Support */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-3.5 min-w-0">
          {/* Avatar Box with Upload Badge */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 p-[2px] shadow-sm">
              <div className="w-full h-full rounded-[14px] bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-extrabold text-lg text-emerald-500">
                    {initials}
                  </span>
                )}
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Camera Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-90 transition-all border-2 border-white dark:border-slate-900"
              title={t('settings.changeAvatar')}
              aria-label={t('settings.changeAvatar')}
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>

          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                {userName}
              </h2>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-slate-400 hover:text-rose-500 text-[10px] flex items-center gap-0.5 transition-colors"
                  title={t('settings.removeAvatar')}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
            <span
              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                plan === 'PRO'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50'
              }`}
            >
              {plan === 'PRO' ? t('common.proPlanActive') : 'Free Plan Active'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-all border border-rose-200 dark:border-rose-800 shadow-sm active:scale-95 shrink-0 ml-2"
          title="Sign Out of MoneyDairy"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Language Section - Sleek Segmented Switcher */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <Languages className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('settings.languageSection')}</span>
          </h3>
        </div>

        <div className="p-1 bg-slate-200/50 dark:bg-slate-800/90 rounded-2xl border border-slate-200/70 dark:border-slate-700/80 grid grid-cols-3 gap-1 shadow-inner">
          {Object.values(languages).map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`h-9 px-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold select-none border transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200/90 dark:border-emerald-500/35 shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/[0.04]'
                }`}
              >
                <FlagIcon code={lang.code} className="w-4 h-3 shrink-0" rounded={true} />
                <span className="truncate leading-none">{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appearance & Security */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 leading-none">
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
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {t('settings.darkMode')}
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
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
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {t('settings.hideBalance')}
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
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
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 leading-none">
          {t('settings.dataSection')}
        </h3>
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                  {t('settings.resetData')}
                </p>
                <p className="text-[11px] text-slate-400 leading-normal">
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
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-colors"
            >
              {t('common.reset')}
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          signOut();
        }}
      />
    </div>
  );
};

export default SettingsView;
