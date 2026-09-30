import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from '../common/CategoryIcon';
import BudgetModal from '../common/BudgetModal';
import {
  PieChart as ChartIcon,
  TrendingDown,
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Award,
  PlusCircle,
  Check,
  AlertTriangle,
  Wallet,
  Clock,
  Target,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const AnalyticsView = () => {
  const {
    transactions,
    budgets,
    formatCurrency,
    formatDateLocalized,
    setIsAddModalOpen,
    setCurrentTab,
    t,
    getCategoryName,
    getPaymentMethodName,
  } = useFinance();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); // 0-11
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [breakdownType, setBreakdownType] = useState('expense'); // 'expense' | 'income'

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleSelectCurrentMonth = () => {
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
    setIsMonthPickerOpen(false);
  };

  const isCurrentMonthSelected =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  // Filter transactions for selected Month & Year
  const monthlyTransactions = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const incomeTransactions = monthlyTransactions.filter((tx) => tx.type === 'income');
  const expenseTransactions = monthlyTransactions.filter((tx) => tx.type === 'expense');

  // Tổng tiền cộng vào (Thu nhập trong tháng)
  const monthlyIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Tiêu hết mấy tiền (Chi tiêu trong tháng)
  const monthlyExpense = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Đánh giá cuối tháng: Âm hay Dương, Tiết kiệm được bao nhiêu
  // netFlow = Thu nhập - Chi tiêu
  const netFlow = monthlyIncome - monthlyExpense;
  const isSurplus = netFlow > 0;
  const isDeficit = netFlow < 0;
  const isBalanced = netFlow === 0 && (monthlyIncome > 0 || monthlyExpense > 0);
  const hasNoData = monthlyIncome === 0 && monthlyExpense === 0;

  // Tỷ lệ tiết kiệm (%)
  const savingsRate =
    monthlyIncome > 0 ? Math.max(0, Math.round((netFlow / monthlyIncome) * 100)) : 0;

  // Breakdown for selected type (expense or income)
  const currentBreakdownTxs = breakdownType === 'expense' ? expenseTransactions : incomeTransactions;
  const currentBreakdownTotal = breakdownType === 'expense' ? monthlyExpense : monthlyIncome;

  const categoryMap = {};
  currentBreakdownTxs.forEach((tx) => {
    categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([catId, amount]) => {
      const catObj = CATEGORIES[catId] || {
        name: 'Other',
        icon: 'HelpCircle',
        bgColor: 'bg-slate-500/10 text-slate-500',
      };
      const percentage = currentBreakdownTotal > 0 ? (amount / currentBreakdownTotal) * 100 : 0;
      return {
        id: catId,
        name: getCategoryName(catId),
        icon: catObj.icon,
        bgColor: catObj.bgColor,
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Nhóm chi tiêu nhiều nhất trong tháng (Cố định theo tháng, không bị nhảy layout khi chuyển tab Thu/Chi)
  const topExpenseCategory = (() => {
    if (expenseTransactions.length === 0 || monthlyExpense === 0) return null;
    const expMap = {};
    expenseTransactions.forEach((tx) => {
      expMap[tx.category] = (expMap[tx.category] || 0) + tx.amount;
    });
    const sorted = Object.entries(expMap).sort((a, b) => b[1] - a[1]);
    if (!sorted.length) return null;
    const [topCatId, topAmount] = sorted[0];
    const catObj = CATEGORIES[topCatId] || {
      name: 'Other',
      icon: 'HelpCircle',
      bgColor: 'bg-slate-500/10 text-slate-500',
    };
    return {
      id: topCatId,
      name: getCategoryName(topCatId),
      icon: catObj.icon,
      bgColor: catObj.bgColor,
      amount: topAmount,
      percentage: (topAmount / monthlyExpense) * 100,
    };
  })();

  // Colors for Donut chart
  const DONUT_COLORS = [
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#F43F5E', // Rose
    '#64748B', // Slate
  ];

  const circumference = 2 * Math.PI * 40;

  // Available selectable years
  const availableYears = [
    now.getFullYear() - 1,
    now.getFullYear(),
    now.getFullYear() + 1,
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => i);

  // Month label formatted
  const selectedDateObj = new Date(selectedYear, selectedMonth, 1);
  const formattedMonthLabel = formatDateLocalized(selectedDateObj, {
    month: 'short',
    year: 'numeric',
  });

  // Budget calculations for selected month ('YYYY-MM')
  const currentMonthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const activeMonthlyBudgets = (budgets && budgets[currentMonthKey]) || {};
  const budgetedCategoryIds = Object.keys(activeMonthlyBudgets);
  const totalBudgetAmount = budgetedCategoryIds.reduce(
    (sum, catId) => sum + (Number(activeMonthlyBudgets[catId]) || 0),
    0
  );
  const hasBudgets = budgetedCategoryIds.length > 0 && totalBudgetAmount > 0;

  // Spent per category for selected month
  const spentPerCategory = {};
  expenseTransactions.forEach((tx) => {
    spentPerCategory[tx.category] = (spentPerCategory[tx.category] || 0) + tx.amount;
  });

  const totalBudgetedSpent = budgetedCategoryIds.reduce((sum, catId) => {
    return sum + (spentPerCategory[catId] || 0);
  }, 0);

  const totalBudgetRemaining = totalBudgetAmount - totalBudgetedSpent;
  const overallBudgetPct = totalBudgetAmount > 0
    ? Math.round((totalBudgetedSpent / totalBudgetAmount) * 100)
    : 0;

  const isBudgetOver = totalBudgetRemaining < 0;
  const isBudgetNear = overallBudgetPct >= 75 && !isBudgetOver;

  return (
    <div className="flex-1 px-5 pt-4 pb-28 space-y-4 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t('analytics.title')}</span>
            <ChartIcon className="w-5 h-5 text-emerald-500" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('analytics.subtitle')}
          </p>
        </div>
      </div>

      {/* Month & Year Navigation Control */}
      <div className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between relative">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Center Month Dropdown Button */}
        <div>
          <button
            type="button"
            onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-xs font-bold text-slate-900 dark:text-white transition-all shadow-inner active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            <span className="capitalize">{formattedMonthLabel}</span>
            <span className="text-[10px] text-slate-400">▾</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 cursor-pointer"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Month & Year Popover Picker */}
        {isMonthPickerOpen && (
          <>
            {/* Backdrop for click outside dismiss */}
            <div
              className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-[1px]"
              onClick={() => setIsMonthPickerOpen(false)}
            />

            {/* Centered Popover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[calc(100%-1rem)] max-w-[290px] p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-popover-center space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('analytics.selectMonthYear')}
                </span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-2.5 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                >
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {monthOptions.map((m) => {
                  const mDate = new Date(selectedYear, m, 1);
                  const mName = formatDateLocalized(mDate, { month: 'short' });
                  const isCurrent = selectedMonth === m;

                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(m);
                        setIsMonthPickerOpen(false);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/40'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {mName}
                    </button>
                  );
                })}
              </div>

              {!isCurrentMonthSelected && (
                <button
                  type="button"
                  onClick={handleSelectCurrentMonth}
                  className="w-full mt-1.5 py-2 rounded-xl text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                >
                  {t('analytics.thisMonth')} ({now.getFullYear()})
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* 1. THẺ ĐÁNH GIÁ TÀI CHÍNH CUỐI THÁNG (ÂM HAY DƯƠNG, TIẾT KIỆM ĐƯỢC BAO NHIÊU) */}
      <div
        className={`p-5 rounded-3xl border shadow-card transition-all ${
          isSurplus
            ? 'bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/30'
            : isDeficit
            ? 'bg-gradient-to-br from-rose-500/[0.12] via-rose-500/[0.05] to-transparent border-rose-500/30'
            : isBalanced
            ? 'bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent border-blue-500/30'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
        }`}
      >
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {isSurplus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500 text-white shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>{t('analytics.statusSurplus')}</span>
              </span>
            )}
            {isDeficit && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-3 h-3 text-rose-500 dark:text-rose-400" />
                <span>{t('analytics.statusDeficit')}</span>
              </span>
            )}
            {isBalanced && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500 text-white shadow-sm">
                <Check className="w-3 h-3" />
                <span>{t('analytics.statusBalanced')}</span>
              </span>
            )}
            {hasNoData && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>{t('analytics.statusNoData')}</span>
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold text-slate-400">
            {t('analytics.txCount', {
              count: monthlyTransactions.length,
              month: selectedMonth + 1,
              year: selectedYear,
            })}
          </span>
        </div>

        {/* Big Net Result Headline */}
        <div className="mb-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isDeficit ? t('analytics.netDeficit') : t('analytics.netSavings')}
          </p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h2
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                isSurplus
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isDeficit
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {isDeficit ? '- ' : isSurplus ? '+ ' : ''}
              {formatCurrency(Math.abs(netFlow))}
            </h2>

            {isSurplus && savingsRate > 0 && (
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 px-2 py-0.5 rounded-lg">
                {t('analytics.savedPct', { pct: savingsRate })}
              </span>
            )}
          </div>
        </div>

        {/* Informative advice message */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2 pt-2 border-t border-slate-200/50 dark:border-white/[0.06]">
          {isSurplus
            ? t('analytics.surplusMsg', { amount: formatCurrency(netFlow) })
            : isDeficit
            ? t('analytics.deficitMsg', { amount: formatCurrency(Math.abs(netFlow)) })
            : isBalanced
            ? t('analytics.balancedMsg')
            : t('analytics.noDataMsg', { month: selectedMonth + 1, year: selectedYear })}
        </p>
      </div>

      {/* 2. THẺ TỔNG THU & TỔNG CHI (CỘNG MẤY TIỀN & TIÊU HẾT MẤY TIỀN) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Thu Nhập (Cộng mấy tiền) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{t('analytics.totalIn')}</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              + {formatCurrency(monthlyIncome)}
            </p>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">
            {t('analytics.incomeCount', { count: incomeTransactions.length })}
          </span>
        </div>

        {/* Chi Tiêu (Tiêu hết mấy tiền) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
              <div className="w-6 h-6 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">{t('analytics.totalOut')}</span>
            </div>
            <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              - {formatCurrency(monthlyExpense)}
            </p>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 font-medium">
            {t('analytics.expenseCount', { count: expenseTransactions.length })}
          </span>
        </div>
      </div>

      {/* Visual comparison bar if there are transactions */}
      {(monthlyIncome > 0 || monthlyExpense > 0) && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-emerald-600 dark:text-emerald-400">
              {t('analytics.incomeShort')}: {monthlyIncome + monthlyExpense > 0 ? ((monthlyIncome / (monthlyIncome + monthlyExpense)) * 100).toFixed(0) : 0}%
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              {t('analytics.expenseShort')}: {monthlyIncome + monthlyExpense > 0 ? ((monthlyExpense / (monthlyIncome + monthlyExpense)) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{
                width: `${
                  monthlyIncome + monthlyExpense > 0
                    ? (monthlyIncome / (monthlyIncome + monthlyExpense)) * 100
                    : 50
                }%`,
              }}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{
                width: `${
                  monthlyIncome + monthlyExpense > 0
                    ? (monthlyExpense / (monthlyIncome + monthlyExpense)) * 100
                    : 50
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 2.5 GIỚI HẠN NGÂN SÁCH THÁNG (MONTHLY BUDGET LIMITS BY CATEGORY) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{t('budgets.title')}</span>
                {hasBudgets && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                      isBudgetOver
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                        : isBudgetNear
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isBudgetOver ? (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        {t('budgets.statusDanger')}
                      </>
                    ) : isBudgetNear ? (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        {t('budgets.statusWarning')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        {t('budgets.statusSafe')}
                      </>
                    )}
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-slate-400">
                {t('budgets.subtitle', { month: formattedMonthLabel })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBudgetModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-500" />
            <span>{t(hasBudgets ? 'budgets.editBudget' : 'budgets.setBudget')}</span>
          </button>
        </div>

        {hasBudgets ? (
          <div className="space-y-3">
            {/* Overall Progress & Summary */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t('budgets.spent')}:{' '}
                  <b className="text-slate-900 dark:text-white font-bold">
                    {formatCurrency(totalBudgetedSpent)}
                  </b>
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {t('budgets.totalBudget')}:{' '}
                  <b className="text-slate-900 dark:text-white font-bold">
                    {formatCurrency(totalBudgetAmount)}
                  </b>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isBudgetOver
                      ? 'bg-rose-500'
                      : isBudgetNear
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(overallBudgetPct, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {overallBudgetPct}%
                </span>
                <span
                  className={`font-bold ${
                    isBudgetOver
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isBudgetOver
                    ? `${t('budgets.overBudget')}: ${formatCurrency(Math.abs(totalBudgetRemaining))}`
                    : `${t('budgets.remaining')}: ${formatCurrency(totalBudgetRemaining)}`}
                </span>
              </div>
            </div>

            {/* Category Breakdown Progress */}
            <div className="space-y-2 pt-1">
              {budgetedCategoryIds.map((catId) => {
                const cat = CATEGORIES[catId] || {
                  id: catId,
                  name: catId,
                  icon: 'Tag',
                  bgColor: 'bg-slate-500/10 text-slate-500',
                };
                const catBudget = Number(activeMonthlyBudgets[catId]) || 0;
                const catSpent = spentPerCategory[catId] || 0;
                const catPct = catBudget > 0 ? Math.round((catSpent / catBudget) * 100) : 0;
                const catRemaining = catBudget - catSpent;
                const catIsOver = catRemaining < 0;

                return (
                  <div
                    key={catId}
                    className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex flex-col space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center ${cat.bgColor} shrink-0`}
                        >
                          <CategoryIcon iconName={cat.icon} className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {getCategoryName(catId)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatCurrency(catSpent)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {' '}
                          / {formatCurrency(catBudget)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-1.5 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            catIsOver
                              ? 'bg-rose-500'
                              : catPct >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(catPct, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-extrabold w-10 text-right ${
                          catIsOver
                            ? 'text-rose-600 dark:text-rose-400'
                            : catPct >= 75
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {catPct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-5 px-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {t('budgets.emptyTitle', { month: formattedMonthLabel })}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5 leading-relaxed">
                {t('budgets.emptyDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsBudgetModalOpen(true)}
              className="mt-1 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {t('budgets.setNow')}
            </button>
          </div>
        )}
      </div>

      {/* 3. NHÓM TIÊU NHIỀU NHẤT TRONG THÁNG (TOP SPENDING GROUP SPOTLIGHT) */}
      {topExpenseCategory && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/25 flex items-center justify-between">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {t('analytics.topSpendingTitle')}
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {topExpenseCategory.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {t('analytics.topSpendingDesc', {
                  category: topExpenseCategory.name,
                  pct: topExpenseCategory.percentage.toFixed(0),
                  amount: formatCurrency(topExpenseCategory.amount),
                })}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
              {topExpenseCategory.percentage.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* 4. PHÂN BỔ THEO DANH MỤC (EXPENSE VS INCOME BREAKDOWN) */}
      <div className="space-y-3 pt-2">
        {/* Toggle Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setBreakdownType('expense')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-xl border transition-colors duration-200 select-none cursor-pointer ${
              breakdownType === 'expense'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border-slate-200/80 dark:border-slate-700 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <TrendingDown className={`w-3.5 h-3.5 ${breakdownType === 'expense' ? 'text-rose-500' : 'text-slate-400'}`} />
            <span>{t('analytics.expensesBreakdown')}</span>
          </button>
          <button
            type="button"
            onClick={() => setBreakdownType('income')}
            className={`flex items-center justify-center space-x-1.5 py-2.5 text-xs font-bold rounded-xl border transition-colors duration-200 select-none cursor-pointer ${
              breakdownType === 'income'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-slate-200/80 dark:border-slate-700 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <TrendingUp className={`w-3.5 h-3.5 ${breakdownType === 'income' ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>{t('analytics.incomeBreakdown')}</span>
          </button>
        </div>

        {/* Visual Donut Chart Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col items-center justify-center min-h-[230px]">
          {categoryBreakdown.length === 0 ? (
            <div className="py-6 text-center space-y-1">
              <p className="text-xs text-slate-400 font-medium">
                {t('analytics.noData')}
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-500 hover:underline cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('analytics.addTxForMonth')}</span>
              </button>
            </div>
          ) : (
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                {(() => {
                  let offsetAccumulator = 0;
                  return categoryBreakdown.map((cat, idx) => {
                    const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                    const strokeDashoffset = -offsetAccumulator;
                    offsetAccumulator += (cat.percentage / 100) * circumference;
                    const strokeColor = DONUT_COLORS[idx % DONUT_COLORS.length];

                    return (
                      <circle
                        key={`${breakdownType}-${cat.id}`}
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={strokeColor}
                        strokeWidth="12"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-500 ease-out"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t('analytics.total')}
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(currentBreakdownTotal)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Category List with Progress Bars */}
        {categoryBreakdown.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              {t('analytics.categoriesBreakdown')}
            </h3>

            {categoryBreakdown.map((cat, idx) => {
              const color = DONUT_COLORS[idx % DONUT_COLORS.length];
              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bgColor} shrink-0`}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {cat.name}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(cat.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>




      {/* Budget Limit Setup Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        year={selectedYear}
        month={selectedMonth}
      />
    </div>
  );
};

export default AnalyticsView;
