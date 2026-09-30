import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, Check, KeyRound } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ResetPasswordModal = () => {
  const {
    isPasswordRecovery,
    setIsPasswordRecovery,
    updatePassword,
    t,
  } = useFinance();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isPasswordRecovery) return null;

  const handleClose = () => {
    setIsPasswordRecovery(false);
    // Clean up url hash without reloading page
    if (typeof window !== 'undefined' && window.history?.replaceState) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError(t('auth.errPasswordRequired') || 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (password.length < 6) {
      setError(t('auth.errPasswordShort') || 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.errPasswordMismatch') || 'Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      const res = await updatePassword(password);
      if (!res.success) {
        setError(res.error || 'Không thể cập nhật mật khẩu, vui lòng thử lại');
      } else {
        handleClose();
      }
    } catch (err) {
      setError(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-modal-pop relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                {t('auth.modalResetTitle') || 'Đặt lại mật khẩu mới'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t('auth.modalResetSub') || 'Nhập mật khẩu mới cho tài khoản của bạn'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.labelNewPassword') || 'Mật khẩu mới'}
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {t('auth.labelConfirmNewPassword') || 'Xác nhận mật khẩu mới'}
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {confirmPassword && password && (
              <p
                className={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${
                  password === confirmPassword ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {password === confirmPassword ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Mật khẩu trùng khớp</span>
                  </>
                ) : (
                  <span>Mật khẩu chưa khớp</span>
                )}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="py-2.5 px-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('common.cancel') || 'Hủy bỏ'}
            </button>
            <button
              type="submit"
              disabled={isLoading || !password || password.length < 6 || password !== confirmPassword}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs shadow-glow-emerald hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{t('auth.btnSavePassword') || 'Lưu mật khẩu mới'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
