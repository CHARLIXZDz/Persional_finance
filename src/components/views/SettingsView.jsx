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
  Check,
  Languages,
  LogOut,
  Camera,
  Trash2,
  BarChart3,
  ChevronRight,
  User,
  Edit3,
  X,
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
    setCurrentTab,
    avatarUrl,
    updateAvatar,
    removeAvatar,
    updateUserName,
    showToast,
    t,
  } = useFinance();

  const userName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'User');
  const userEmail = user?.email || 'user@moneydairy.app';

  // Name edit states
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState(userName);
  const [isSavingName, setIsSavingName] = useState(false);

  const handleOpenEditName = () => {
    setEditFullName(userName);
    setIsEditNameModalOpen(true);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    const trimmed = editFullName.trim();
    if (!trimmed) return;
    setIsSavingName(true);
    try {
      const res = await updateUserName(trimmed);
      if (res?.success) {
        setIsEditNameModalOpen(false);
      }
    } finally {
      setIsSavingName(false);
    }
  };
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
    <div className="flex-1 px-5 pt-4 pb-36 space-y-4 animate-fade-in">
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
            <div className="flex items-center gap-1.5 min-w-0">
              <h2
                onClick={handleOpenEditName}
                className="text-base font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:text-emerald-500 transition-colors"
                title={t('settings.editName') || 'Edit Name'}
              >
                {userName}
              </h2>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenEditName}
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
                  title={t('settings.editName') || 'Chỉnh sửa tên'}
                  aria-label={t('settings.editName') || 'Chỉnh sửa tên'}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95"
                    title={t('settings.removeAvatar') || 'Xóa ảnh đại diện'}
                    aria-label={t('settings.removeAvatar') || 'Xóa ảnh đại diện'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
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

        <div className="p-1.5 bg-slate-200/50 dark:bg-slate-800/90 rounded-2xl border border-slate-200/70 dark:border-slate-700/80 grid grid-cols-3 gap-1.5 shadow-inner">
          {Object.values(languages).map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`h-9 px-1.5 sm:px-2 rounded-xl flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-semibold select-none border transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200/90 dark:border-emerald-500/35 shadow-sm dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/[0.04]'
                }`}
              >
                <FlagIcon code={lang.code} className="w-4 h-3 shrink-0" rounded={true} />
                <span className="whitespace-nowrap leading-none">{lang.nativeName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reports & Financial Analytics */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 leading-none">
          {t('settings.reportsSection')}
        </h3>
        <div
          onClick={() => setCurrentTab('reports')}
          className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card hover:border-emerald-500/40 p-4 transition-all duration-200 cursor-pointer active:scale-[0.99]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-500 transition-colors">
                  {t('settings.reportTitle')}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">
                  {t('settings.reportDesc')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentTab('reports');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-glow-emerald active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer self-center"
            >
              <span>{t('settings.openReport')}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
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



      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          signOut();
        }}
      />

      {/* Edit Display Name Modal */}
      {isEditNameModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-modal-pop">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {t('settings.modalEditNameTitle') || 'Chỉnh sửa họ tên'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('settings.modalEditNameSub') || 'Hiển thị ở trang chủ và trên báo cáo'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditNameModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('settings.labelNewName') || 'Họ và tên mới'}
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder={t('settings.placeholderName') || 'Nhập họ tên của bạn'}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditNameModalOpen(false)}
                  className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('common.cancel') || 'Hủy'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingName || !editFullName.trim()}
                  className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs shadow-glow-emerald hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isSavingName ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{t('settings.btnSaveName') || 'Lưu thay đổi'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsView;
