import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ToastNotification = () => {
  const { toast, hideToast } = useFinance();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!toast) {
      setIsExiting(false);
      return;
    }

    const duration = toast.duration || 3600;
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        hideToast();
        setIsExiting(false);
      }, 250);
    }, duration);

    return () => clearTimeout(exitTimer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      hideToast();
      setIsExiting(false);
    }, 200);
  };

  return (
    <div
      className={`absolute top-4 inset-x-4 z-50 pointer-events-auto transition-all duration-200 ${
        isExiting
          ? 'opacity-0 -translate-y-3 scale-95 pointer-events-none'
          : 'animate-toast'
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl border ${
          isSuccess
            ? 'bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-emerald-950/80 border-emerald-500/40 text-white'
            : isError
            ? 'bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-rose-950/80 border-rose-500/40 text-white'
            : 'bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-indigo-950/80 border-indigo-500/40 text-white'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5 min-w-0 pr-2">
            {/* Animated Icon badge */}
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/30'
                  : isError
                  ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/30'
                  : 'bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/30'
              }`}
            >
              {isSuccess && <CheckCircle2 className="w-5 h-5 animate-pulse" />}
              {isError && <AlertCircle className="w-5 h-5 animate-bounce" />}
              {!isSuccess && !isError && <Info className="w-5 h-5" />}
            </div>

            {/* Content */}
            <div className="min-w-0">
              {toast.title && (
                <h4 className="text-xs font-bold text-white tracking-tight leading-tight">
                  {toast.title}
                </h4>
              )}
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5 font-medium line-clamp-2">
                {toast.message}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Animated Countdown Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-linear ${
              isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : 'bg-indigo-500'
            }`}
            style={{
              animation: `shrinkWidth ${toast.duration || 3600}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
