import React from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  const { language } = useFinance();

  if (!isOpen) return null;

  const content = {
    vi: {
      title: 'Xác nhận đăng xuất',
      desc: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản MoneyDairy không? Mọi dữ liệu đã được đồng bộ an toàn lên Cloud.',
      cancelBtn: 'Hủy bỏ',
      confirmBtn: 'Đăng xuất',
    },
    lo: {
      title: 'ຢືນຢັນການອອກຈາກລະບົບ',
      desc: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກລະບົບບັນຊີ MoneyDairy? ຂໍ້ມູນທັງໝົດໄດ້ຖືກບັນທຶກຢ່າງປອດໄພເທິງ Cloud ແລ້ວ.',
      cancelBtn: 'ຍົກເລີກ',
      confirmBtn: 'ອອກຈາກລະບົບ',
    },
    en: {
      title: 'Confirm Sign Out',
      desc: 'Are you sure you want to sign out of your MoneyDairy account? All your financial data is safely synced to the Cloud.',
      cancelBtn: 'Cancel',
      confirmBtn: 'Sign Out',
    },
  }[language] || {
    title: 'Confirm Sign Out',
    desc: 'Are you sure you want to sign out of your account?',
    cancelBtn: 'Cancel',
    confirmBtn: 'Sign Out',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-center animate-modal-pop">

        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Glow Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4 ring-4 ring-rose-500/10 animate-pulse-glow">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Text */}
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          {content.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {content.desc}
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            {content.cancelBtn}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-bold shadow-lg shadow-rose-500/25 active:scale-95 transition-all flex items-center justify-center space-x-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{content.confirmBtn}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default LogoutModal;
