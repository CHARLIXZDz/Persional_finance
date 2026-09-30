import React from 'react';
import { ArrowRight, ChevronRight, PlusCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from './CategoryIcon';

export const RecentTransactions = ({
  transactions: propTransactions,
  selectedYear,
  selectedMonth,
}) => {
  const {
    recentTransactions: defaultRecentTransactions,
    formatCurrency,
    setCurrentTab,
    setIsAddModalOpen,
    t,
    getCategoryName,
    getPaymentMethodName,
    formatDateLocalized,
  } = useFinance();

  const isMonthScoped = propTransactions !== undefined;
  const transactionsToDisplay = isMonthScoped
    ? propTransactions
    : defaultRecentTransactions;

  const monthLabel =
    selectedYear !== undefined && selectedMonth !== undefined
      ? formatDateLocalized(new Date(selectedYear, selectedMonth, 1), {
          month: 'short',
          year: 'numeric',
        })
      : null;

  // Helper to format transaction date / time
  const formatTxTime = (dateString) => {
    if (!dateString) return '';
    const txDate = new Date(dateString);
    if (isNaN(txDate.getTime())) return '';
    const now = new Date();
    const diffHours = Math.round((now.getTime() - txDate.getTime()) / (1000 * 60 * 60));

    if (
      diffHours < 24 &&
      now.getDate() === txDate.getDate() &&
      now.getMonth() === txDate.getMonth() &&
      now.getFullYear() === txDate.getFullYear()
    ) {
      return txDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
    return formatDateLocalized(txDate, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="px-5 py-2">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {t('recent.title')}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {monthLabel
              ? t('recent.subtitleMonth', { month: monthLabel }) || t('recent.subtitle')
              : t('recent.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('history')}
          className="group inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
        >
          <span>{t('common.viewAll')}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Transactions List */}
      {transactionsToDisplay.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isMonthScoped ? t('recent.emptyMonth') : t('recent.empty')}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-glow-emerald"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('recent.addBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactionsToDisplay.map((tx) => {
            const cat = CATEGORIES[tx.category] || {
              name: 'Other',
              icon: 'HelpCircle',
              bgColor: 'bg-slate-500/10 text-slate-500',
            };
            const catName = getCategoryName(tx.category);
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${cat.bgColor} transition-transform group-hover:scale-105`}
                  >
                    <CategoryIcon iconName={cat.icon} className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 pr-2 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </p>
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden">
                      <span className="font-medium text-slate-600 dark:text-slate-300 shrink-0">
                        {catName}
                      </span>
                      <span className="shrink-0">•</span>
                      <span className="truncate">{getPaymentMethodName(tx.paymentMethod)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Time */}
                <div className="text-right flex flex-col items-end shrink-0 pl-2">
                  <div
                    className={`text-sm font-bold tracking-tight whitespace-nowrap ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatCurrency(tx.amount)}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 whitespace-nowrap">
                    {formatTxTime(tx.date)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
