import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  PlusCircle,
  BarChart3,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const HeroBalanceCard = ({
  selectedYear: propSelectedYear,
  selectedMonth: propSelectedMonth,
  onPrevMonth,
  onNextMonth,
  onResetCurrentMonth,
}) => {
  const {
    formatCurrency,
    isBalanceHidden,
    setIsBalanceHidden,
    setIsAddModalOpen,
    setCurrentTab,
    t,
    formatDateLocalized,
    transactions,
  } = useFinance();

  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth();

  const [internalYear, setInternalYear] = useState(currentRealYear);
  const [internalMonth, setInternalMonth] = useState(currentRealMonth); // 0 - 11
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'cumulative'

  const isControlled = propSelectedYear !== undefined && propSelectedMonth !== undefined;
  const selectedYear = isControlled ? propSelectedYear : internalYear;
  const selectedMonth = isControlled ? propSelectedMonth : internalMonth;

  const isCurrentRealMonth =
    selectedYear === currentRealYear && selectedMonth === currentRealMonth;

  const handlePrevMonth = () => {
    if (onPrevMonth) {
      onPrevMonth();
    } else {
      if (internalMonth === 0) {
        setInternalMonth(11);
        setInternalYear((prev) => prev - 1);
      } else {
        setInternalMonth((prev) => prev - 1);
      }
    }
  };

  const handleNextMonth = () => {
    if (onNextMonth) {
      onNextMonth();
    } else {
      if (internalMonth === 11) {
        setInternalMonth(0);
        setInternalYear((prev) => prev + 1);
      } else {
        setInternalMonth((prev) => prev + 1);
      }
    }
  };

  const handleResetCurrentMonth = () => {
    if (onResetCurrentMonth) {
      onResetCurrentMonth();
    } else {
      setInternalYear(currentRealYear);
      setInternalMonth(currentRealMonth);
    }
  };

  const displayDate = new Date(selectedYear, selectedMonth, 1);
  const currentMonthYear = formatDateLocalized(displayDate, {
    month: 'short',
    year: 'numeric',
  });

  // Transactions for selected month
  const thisMonthTxs = (transactions || []).filter((tx) => {
    if (!tx.date) return false;
    const d = new Date(tx.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  // Previous month date
  const prevMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  // Transactions for previous month
  const lastMonthTxs = (transactions || []).filter((tx) => {
    if (!tx.date) return false;
    const d = new Date(tx.date);
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
  });

  // Calculate Net Flow (Income - Expense) for this selected month and last month
  const thisMonthIncome = thisMonthTxs
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const thisMonthExpense = thisMonthTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const thisMonthNet = thisMonthIncome - thisMonthExpense;

  const lastMonthIncome = lastMonthTxs
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const lastMonthExpense = lastMonthTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const lastMonthNet = lastMonthIncome - lastMonthExpense;

  // Cumulative balance up to the end of the selected month
  const endOfSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
  const cumulativeTxs = (transactions || []).filter((tx) => {
    if (!tx.date) return false;
    const d = new Date(tx.date);
    return d <= endOfSelectedMonth;
  });
  const cumulativeIncome = cumulativeTxs
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const cumulativeExpense = cumulativeTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const cumulativeBalance = cumulativeIncome - cumulativeExpense;

  const activeDisplayBalance = viewMode === 'cumulative' ? cumulativeBalance : thisMonthNet;

  // Real comparison calculation
  let comparison = null;

  if (lastMonthTxs.length === 0) {
    if (thisMonthTxs.length === 0) {
      comparison = {
        type: 'none',
        label: t('hero.noLastMonth'),
      };
    } else {
      comparison = {
        type: 'firstMonth',
        badge: t('hero.firstMonth'),
        label: thisMonthNet >= 0 
          ? `+${formatCurrency(thisMonthNet)}` 
          : `-${formatCurrency(Math.abs(thisMonthNet))}`,
      };
    }
  } else {
    // Both months have data
    if (lastMonthNet === 0) {
      const pct = thisMonthNet > 0 ? 100 : thisMonthNet < 0 ? -100 : 0;
      comparison = {
        type: pct >= 0 ? 'up' : 'down',
        badge: `${pct >= 0 ? '+' : ''}${pct}%`,
        label: t('hero.vsLastMonth'),
      };
    } else {
      const diffPct = Math.round(((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100);
      comparison = {
        type: diffPct > 0 ? 'up' : diffPct < 0 ? 'down' : 'flat',
        badge: `${diffPct > 0 ? '+' : ''}${diffPct}%`,
        label: t('hero.vsLastMonth'),
      };
    }
  }

  return (
    <div className="px-5 pt-2 pb-4">
      {/* Main Hero Card Container */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 shadow-xl dark:shadow-card-dark border border-slate-700/50">
        {/* Subtle geometric glowing gradient backdrops */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        {/* Card Header: Balance Label & Toggle + Month Navigation */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode((prev) => (prev === 'month' ? 'cumulative' : 'month'))}
              className="text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 active:scale-95"
              title="Nhấn để đổi giữa Số dư tháng và Tổng tích lũy"
            >
              <span>
                {viewMode === 'month'
                  ? t('hero.monthlyBalance') || 'ຍອດເງິນເດືອນນີ້'
                  : t('hero.totalBalance') || 'ຍອດເງິນທັງໝົດ'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium normal-case tracking-normal">
                {viewMode === 'month' ? t('hero.modeMonth') || 'Tháng' : t('hero.modeAll') || 'Tích lũy'}
              </span>
            </button>
            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 active:scale-95"
              aria-label={isBalanceHidden ? t('hero.showBalance') : t('hero.hideBalance')}
              title={isBalanceHidden ? t('hero.showBalance') : t('hero.hideBalance')}
            >
              {isBalanceHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!isCurrentRealMonth && (
              <button
                onClick={handleResetCurrentMonth}
                className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all active:scale-95 flex items-center gap-1"
                title="Quay về tháng hiện tại"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>{t('hero.thisMonth') || 'Tháng này'}</span>
              </button>
            )}

            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-full border border-white/10 px-1 py-0.5 shadow-sm">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                title="Tháng trước"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold text-slate-100 capitalize px-1 tracking-tight min-w-[56px] text-center">
                {currentMonthYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                title="Tháng sau"
                aria-label="Tháng sau"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Large Balance Display */}
        <div className="relative z-10 mt-3 mb-6">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline">
            {formatCurrency(activeDisplayBalance)}
          </div>
          <div className="flex items-center space-x-1.5 mt-1.5">
            {comparison.type === 'none' && (
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                {comparison.label}
              </span>
            )}

            {comparison.type === 'firstMonth' && (
              <>
                <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {comparison.badge}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {comparison.label}
                </span>
              </>
            )}

            {(comparison.type === 'up' || comparison.type === 'down' || comparison.type === 'flat') && (
              <>
                <span
                  className={`inline-flex items-center text-xs font-semibold ${
                    comparison.type === 'up'
                      ? 'text-emerald-400'
                      : comparison.type === 'down'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {comparison.type === 'up' && <TrendingUp className="w-3.5 h-3.5 mr-1" />}
                  {comparison.type === 'down' && <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                  {comparison.type === 'flat' && <Minus className="w-3.5 h-3.5 mr-1" />}
                  {comparison.badge}
                </span>
                <span className="text-xs text-slate-400">{comparison.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Two Sub-Cards: Total Income & Total Expenses for this selected Month */}
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
              {formatCurrency(thisMonthIncome)}
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
              {formatCurrency(thisMonthExpense)}
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
