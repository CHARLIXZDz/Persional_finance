import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  TrendingUp,
  PlusCircle,
  BarChart3,
  CreditCard
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const HeroBalanceCard = () => {
  const {
    totalBalanceLAK,
    totalIncomeLAK,
    totalExpenseLAK,
    formatCurrency,
    isBalanceHidden,
    setIsBalanceHidden,
    setIsAddModalOpen,
    setCurrentTab,
    t,
    formatDateLocalized,
  } = useFinance();

  const currentMonthYear = formatDateLocalized(new Date(), {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="px-5 pt-2 pb-4">
      {/* Main Hero Card Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 shadow-xl dark:shadow-card-dark border border-slate-700/50">
        {/* Subtle geometric glowing gradient backdrops */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        {/* Card Header: Total Balance Label + Privacy toggle */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {t('hero.totalBalance')}
            </span>
            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 active:scale-95"
              aria-label={isBalanceHidden ? t('hero.showBalance') : t('hero.hideBalance')}
              title={isBalanceHidden ? t('hero.showBalance') : t('hero.hideBalance')}
            >
              {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-slate-300 backdrop-blur-md border border-white/10 capitalize">
            {currentMonthYear}
          </span>
        </div>

        {/* Large Balance Display */}
        <div className="relative z-10 mt-3 mb-6">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline">
            {formatCurrency(totalBalanceLAK)}
          </div>
          <div className="flex items-center space-x-1.5 mt-1.5">
            <span className="inline-flex items-center text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              +12.4%
            </span>
            <span className="text-xs text-slate-400">{t('hero.vsLastMonth')}</span>
          </div>
        </div>

        {/* Two Sub-Cards: Total Income & Total Expenses */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-1">
          {/* Income Sub-Card */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-300">{t('hero.income')}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-emerald-400 truncate">
              {formatCurrency(totalIncomeLAK)}
            </div>
          </div>

          {/* Expense Sub-Card */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-3.5 border border-rose-500/20 hover:border-rose-500/40 transition-colors">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-7 h-7 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-slate-300">{t('hero.expenses')}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-rose-400 truncate">
              {formatCurrency(totalExpenseLAK)}
            </div>
          </div>
        </div>

        {/* Quick Action Pill Shortcuts */}
        <div className="relative z-10 grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all active:scale-95 truncate"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('hero.addCash')}</span>
          </button>
          <button
            onClick={() => setCurrentTab('analytics')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all active:scale-95 truncate"
          >
            <BarChart3 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('hero.analytics')}</span>
          </button>
          <button
            onClick={() => setCurrentTab('history')}
            className="flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all active:scale-95 truncate"
          >
            <CreditCard className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{t('hero.passbook')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBalanceCard;
