import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  Wallet,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from '../common/CategoryIcon';

export const ReportsView = ({ onBack }) => {
  const {
    transactions,
    formatCurrency,
    setCurrentTab,
    t,
    getCategoryName,
    showToast,
  } = useFinance();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentTab('settings');
    }
  };

  const now = new Date();
  const currentRealYear = now.getFullYear();
  const currentRealMonth = now.getMonth();

  // Find all available years from transactions + current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set([currentRealYear]);
    transactions.forEach((tx) => {
      if (tx.date) {
        const y = new Date(tx.date).getFullYear();
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions, currentRealYear]);

  // State: default to current year and current month (Theo tháng)
  const [selectedYear, setSelectedYear] = useState(currentRealYear);
  const [selectedMonth, setSelectedMonth] = useState(currentRealMonth); // 0 - 11
  const [isAllYear, setIsAllYear] = useState(false); // false = Theo tháng, true = Cả năm
  const [reportType, setReportType] = useState('expense'); // 'expense' | 'income'
  const [isCopied, setIsCopied] = useState(false);

  // Filter transactions for the selected YEAR
  const yearTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const d = new Date(tx.date);
      return d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedYear]);

  // Annual 12-month aggregated data
  const annualStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const monthlyExpenses = Array(12).fill(0);
    const monthlyIncomes = Array(12).fill(0);
    const monthlyTxCount = Array(12).fill(0);

    yearTransactions.forEach((tx) => {
      const d = new Date(tx.date);
      const m = d.getMonth();
      if (tx.type === 'income') {
        totalIncome += tx.amount;
        monthlyIncomes[m] += tx.amount;
      } else {
        totalExpense += tx.amount;
        monthlyExpenses[m] += tx.amount;
      }
      monthlyTxCount[m] += 1;
    });

    const net = totalIncome - totalExpense;
    const maxMonthlyExp = Math.max(...monthlyExpenses, 1);

    return {
      totalIncome,
      totalExpense,
      net,
      monthlyExpenses,
      monthlyIncomes,
      monthlyTxCount,
      maxMonthlyExp,
    };
  }, [yearTransactions]);

  // Filter transactions for active period (Cả năm hoặc Tháng cụ thể)
  const periodTransactions = useMemo(() => {
    if (isAllYear) {
      return yearTransactions;
    }
    return yearTransactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === selectedMonth;
    });
  }, [yearTransactions, isAllYear, selectedMonth]);

  // Active period summary
  const periodStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expenseTxs = [];
    const incomeTxs = [];

    periodTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        income += tx.amount;
        incomeTxs.push(tx);
      } else {
        expense += tx.amount;
        expenseTxs.push(tx);
      }
    });

    const net = income - expense;

    return {
      income,
      expense,
      net,
      expenseTxs,
      incomeTxs,
    };
  }, [periodTransactions]);

  // Group by category and sort DESCENDING (Tiêu nhiều nhất giảm dần)
  const rankedCategories = useMemo(() => {
    const targetTxs = reportType === 'expense' ? periodStats.expenseTxs : periodStats.incomeTxs;
    const totalAmount = reportType === 'expense' ? periodStats.expense : periodStats.income;

    const catMap = {};
    targetTxs.forEach((tx) => {
      if (!catMap[tx.category]) {
        catMap[tx.category] = { amount: 0, count: 0 };
      }
      catMap[tx.category].amount += tx.amount;
      catMap[tx.category].count += 1;
    });

    return Object.entries(catMap)
      .map(([catId, data]) => {
        const catObj = CATEGORIES[catId] || {
          name: catId,
          icon: 'HelpCircle',
          bgColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
        };
        const percentage = totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0;
        return {
          id: catId,
          name: getCategoryName(catId),
          icon: catObj.icon,
          bgColor: catObj.bgColor,
          amount: data.amount,
          count: data.count,
          percentage,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [reportType, periodStats, getCategoryName]);

  // Localized Month labels
  const fullMonthLabels = useMemo(() => {
    const fallback = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
    try {
      const arr = t('reports.fullMonthNames');
      return Array.isArray(arr) ? arr : fallback;
    } catch {
      return fallback;
    }
  }, [t]);

  const activePeriodTitle = isAllYear
    ? `${t('reports.allYear')} ${selectedYear}`
    : `${fullMonthLabels[selectedMonth]} / ${selectedYear}`;

  // Copy summary to clipboard
  const handleCopySummary = () => {
    const lines = [
      `📊 ${t('reports.modalTitle')} - ${activePeriodTitle}`,
      `• ${t('reports.totalExpenses')}: ${formatCurrency(periodStats.expense)}`,
      `• ${t('reports.totalIncome')}: ${formatCurrency(periodStats.income)}`,
      `• ${t('reports.netSavings')}: ${formatCurrency(periodStats.net)}`,
      '',
      `🏆 ${t('reports.topExpensesTitle')}:`,
      ...rankedCategories.map(
        (c, i) => `${i + 1}. ${c.name}: ${formatCurrency(c.amount)} (${c.percentage.toFixed(0)}%)`
      ),
    ];

    if (navigator.clipboard) {
      navigator.clipboard.writeText(lines.join('\n'));
      setIsCopied(true);
      showToast({
        type: 'success',
        title: t('reports.copySummary'),
        message: t('reports.copied'),
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 px-5 pt-6 pb-28 space-y-5 animate-fade-in">
      {/* Top Bar with Back Button & Share/Copy */}
      <div className="flex items-center justify-between pb-1">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-1.5 -ml-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-emerald-500" />
          <span>{t('settings.title')}</span>
        </button>

        <button
          type="button"
          onClick={handleCopySummary}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs cursor-pointer active:scale-95"
          title={t('reports.copySummary')}
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          <span>{isCopied ? t('reports.copied') : t('reports.copySummary')}</span>
        </button>
      </div>

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>{t('reports.modalTitle')}</span>
          <BarChart3 className="w-5 h-5 text-emerald-500" />
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {activePeriodTitle}
        </p>
      </div>

      {/* 1. Year & Period Selector */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-3">
        {/* Row 1: Year Stepper + Mode Toggle */}
        <div className="flex items-center justify-between">
          {/* Year Navigation */}
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setSelectedYear((y) => y - 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-base font-extrabold text-slate-900 dark:text-white px-2">
              {selectedYear}
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear((y) => y + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Toggle: Theo tháng / Cả năm */}
          <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsAllYear(false)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                !isAllYear
                  ? 'bg-emerald-500 text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {t('reports.byMonth')}
            </button>
            <button
              type="button"
              onClick={() => setIsAllYear(true)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                isAllYear
                  ? 'bg-emerald-500 text-white shadow-xs font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {t('reports.allYear')}
            </button>
          </div>
        </div>

        {/* Row 2: Month Stepper */}
        {!isAllYear && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setSelectedMonth((m) => (m === 0 ? 11 : m - 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-slate-900 dark:text-white px-2">
                {fullMonthLabels[selectedMonth]}
              </span>
              <button
                type="button"
                onClick={() => setSelectedMonth((m) => (m === 11 ? 0 : m + 1))}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {periodTransactions.length} {t('reports.txCount', { count: periodTransactions.length })}
            </span>
          </div>
        )}
      </div>

      {/* 2. Overview Boxes - Full Width Horizontal */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-2">
        {/* Chi tiêu */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
              {t('reports.totalExpenses')}
            </span>
          </div>
          <span className="text-base font-extrabold text-rose-500 dark:text-rose-400/90 whitespace-nowrap pl-2">
            - {formatCurrency(periodStats.expense)}
          </span>
        </div>

        {/* Thu nhập */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
              {t('reports.totalIncome')}
            </span>
          </div>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap pl-2">
            + {formatCurrency(periodStats.income)}
          </span>
        </div>

        {/* Tiết kiệm / Số dư */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
              {t('reports.netSavings')}
            </span>
          </div>
          <span
            className={`text-base font-extrabold whitespace-nowrap pl-2 ${
              periodStats.net > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : periodStats.net < 0
                ? 'text-rose-500 dark:text-rose-400/90'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {periodStats.net > 0 ? '+ ' : ''}
            {formatCurrency(periodStats.net)}
          </span>
        </div>
      </div>

      {/* 3. Ranked Categories Breakdown */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {reportType === 'expense' ? t('reports.topExpensesTitle') : t('reports.topIncomeTitle')}
          </h2>

          {/* Type Switcher: Expense / Income */}
          <div className="flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setReportType('expense')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                reportType === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('reports.expensesTab')}
            </button>
            <button
              type="button"
              onClick={() => setReportType('income')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                reportType === 'income'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('reports.incomeTab')}
            </button>
          </div>
        </div>

        {rankedCategories.length === 0 ? (
          <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-400 font-medium">
              {t('reports.noData')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rankedCategories.map((item, index) => {
              return (
                <div key={item.id} className="py-3 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between">
                    {/* Left: #Order, Icon, Name */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="w-5 text-center text-xs font-bold text-slate-400 shrink-0">
                        {index + 1}.
                      </span>

                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bgColor}`}>
                        <CategoryIcon iconName={item.icon} className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {t('reports.txCount', { count: item.count })}
                        </span>
                      </div>
                    </div>

                    {/* Right: Amount & % */}
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(item.amount)}
                      </p>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {item.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Subtle Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(3, item.percentage))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. 12-Month Annual Bar Chart */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t('reports.annualOverview')} ({selectedYear})</span>
          </span>
          <span className="text-slate-400">
            {t('reports.totalExpenses')}: <b className="text-slate-700 dark:text-slate-200">{formatCurrency(annualStats.totalExpense)}</b>
          </span>
        </div>

        <div className="h-28 flex items-end justify-between gap-1.5 pt-4 pb-1 px-1">
          {annualStats.monthlyExpenses.map((exp, mIdx) => {
            const heightPct = Math.round((exp / annualStats.maxMonthlyExp) * 100);
            const isSelected = !isAllYear && selectedMonth === mIdx;
            const isPeak = exp > 0 && exp === Math.max(...annualStats.monthlyExpenses);

            return (
              <div
                key={mIdx}
                onClick={() => {
                  setSelectedMonth(mIdx);
                  setIsAllYear(false);
                }}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
                title={`${fullMonthLabels[mIdx]}: ${formatCurrency(exp)}`}
              >
                {/* Amount Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1 pointer-events-none whitespace-nowrap">
                  {exp > 0 ? (exp >= 1000000 ? `${(exp / 1000000).toFixed(1)}M` : `${Math.round(exp / 1000)}k`) : ''}
                </div>

                {/* Colored Bar */}
                <div
                  className={`w-full max-w-[18px] rounded-t-md transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-sm ring-2 ring-emerald-500/40'
                      : isPeak
                      ? 'bg-gradient-to-t from-amber-500 to-orange-400 hover:from-amber-400 hover:to-orange-300'
                      : exp > 0
                      ? 'bg-gradient-to-t from-emerald-500/80 to-teal-400/80 hover:from-emerald-500 hover:to-teal-400'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                  style={{ height: `${Math.max(6, heightPct)}%` }}
                />

                {/* Numeric Month Label (1 to 12) */}
                <span
                  className={`text-[10px] mt-2 font-bold ${
                    isSelected
                      ? 'text-emerald-600 dark:text-emerald-400 scale-110 font-extrabold'
                      : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                >
                  {mIdx + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;