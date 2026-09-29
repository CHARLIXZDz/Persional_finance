import React from 'react';
import { ArrowRight, ChevronRight, PlusCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from './CategoryIcon';

export const RecentTransactions = () => {
  const {
    recentTransactions,
    formatCurrency,
    setCurrentTab,
    setIsAddModalOpen,
    t,
    getCategoryName,
    getPaymentMethodName,
    formatDateLocalized,
  } = useFinance();

  // Helper to format transaction date / time
  const formatTxTime = (dateString) => {
    const txDate = new Date(dateString);
    const now = new Date();
    const diffHours = Math.round((now.getTime() - txDate.getTime()) / (1000 * 60 * 60));

    if (diffHours < 24 && now.getDate() === txDate.getDate()) {
      return txDate.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
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
            {t('recent.subtitle')}
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
      {recentTransactions.length === 0 ? (
        <div className="text-center py-8 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('recent.empty')}</p>
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
          {recentTransactions.map((tx) => {
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

                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tx.title}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {catName}
                      </span>
                      <span>•</span>
                      <span>{formatTxTime(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Indicator */}
                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-bold tracking-tight ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isIncome ? '+ ' : '- '}
                    {formatCurrency(tx.amount)}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {getPaymentMethodName(tx.paymentMethod)}
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
