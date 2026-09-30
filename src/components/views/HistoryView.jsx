import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from '../common/CategoryIcon';
import {
  Search,
  Filter,
  Trash2,
  Calendar,
  X,
  PlusCircle,
  Clock
} from 'lucide-react';

export const HistoryView = () => {
  const {
    transactions,
    formatCurrency,
    deleteTransaction,
    setIsAddModalOpen,
    t,
    getCategoryName,
    getPaymentMethodName,
    formatDateLocalized,
  } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'expense' | 'income'
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Format time (HH:mm)
  const formatTxTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // Search match
    const matchSearch =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.paymentMethod && tx.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));

    // Type match
    const matchType = typeFilter === 'all' || tx.type === typeFilter;

    // Category match
    const matchCategory =
      selectedCategory === 'all' || tx.category === selectedCategory;

    return matchSearch && matchType && matchCategory;
  });

  // Group by Date: Today, Yesterday, or Older
  const groupTransactionsByDate = (txList) => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    txList.forEach((tx) => {
      const d = new Date(tx.date);
      let label = '';

      if (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      ) {
        label = t('common.today');
      } else if (
        d.getDate() === yesterday.getDate() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getFullYear() === yesterday.getFullYear()
      ) {
        label = t('common.yesterday');
      } else {
        label = formatDateLocalized(d, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });

    return groups;
  };

  const grouped = groupTransactionsByDate(filtered);

  return (
    <div className="flex-1 px-5 pt-6 pb-28 space-y-4 animate-fade-in">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{t('history.title')}</span>
            <Clock className="w-5 h-5 text-emerald-500" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('history.countSubtitle', { count: filtered.length })}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
        <input
          type="text"
          placeholder={t('history.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 p-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Type Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: t('history.all') },
          { id: 'expense', label: t('history.expensesOnly') },
          { id: 'income', label: t('history.incomeOnly') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTypeFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              typeFilter === tab.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grouped Transactions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {t('history.emptyTitle')}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {t('history.emptyDesc')}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-glow-emerald"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('recent.addBtn')}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([groupTitle, txList]) => (
            <div key={groupTitle} className="space-y-2">
              <div className="flex items-center space-x-2 px-1">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {groupTitle}
                </span>
                <div className="h-[1px] flex-1 bg-slate-200/70 dark:bg-slate-800" />
              </div>

              <div className="space-y-2">
                {txList.map((tx) => {
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
                      className="group relative flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/90 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                    >
                      {/* Left: Icon & Details */}
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.bgColor}`}
                        >
                          <CategoryIcon iconName={cat.icon} className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 pr-2 flex-1">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {tx.title}
                          </p>
                          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5 whitespace-nowrap overflow-hidden">
                            <span className="font-medium text-slate-600 dark:text-slate-300 shrink-0">
                              {catName}
                            </span>
                            <span className="shrink-0">•</span>
                            <span className="truncate">{getPaymentMethodName(tx.paymentMethod)}</span>
                          </div>
                          {tx.notes && (
                            <p className="text-[10px] text-slate-400 italic truncate mt-0.5">
                              "{tx.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Time & Delete Button */}
                      <div className="flex items-center space-x-2.5 shrink-0 pl-2">
                        <div className="text-right flex flex-col items-end">
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
                          {tx.date && formatTxTime(tx.date) && (
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 whitespace-nowrap">
                              {formatTxTime(tx.date)}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-95 shrink-0"
                          title={t('history.deleteTooltip')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
