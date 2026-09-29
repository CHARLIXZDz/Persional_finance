import React from 'react';
import Header from '../common/Header';
import HeroBalanceCard from '../common/HeroBalanceCard';
import RecentTransactions from '../common/RecentTransactions';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from '../common/CategoryIcon';
import { ArrowUpRight, Sparkles, Target } from 'lucide-react';

export const DashboardView = () => {
  const { transactions, formatCurrency, setCurrentTab, t, getCategoryName } = useFinance();

  // Calculate top spending category for the widget
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const categoryTotals = {};
  expenseTransactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort(
    ([, a], [, b]) => b - a
  );

  const topCategoryKey = sortedCategories[0]?.[0];
  const topCategoryAmount = sortedCategories[0]?.[1] || 0;
  const topCategoryObj = topCategoryKey ? CATEGORIES[topCategoryKey] : null;
  const topCategoryName = topCategoryKey ? getCategoryName(topCategoryKey) : '';
  const topCategoryPct = totalExpense > 0 ? Math.round((topCategoryAmount / totalExpense) * 100) : 0;

  return (
    <div className="flex-1 pb-6 space-y-2 animate-fade-in">
      {/* Header */}
      <Header />

      {/* Hero Balance Card */}
      <HeroBalanceCard />

      {/* Monthly Budget / Smart Insight Pill Widget */}
      {topCategoryObj && (
        <div className="px-5 py-1">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  <span>{t('insight.title')}</span>
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {t('insight.summary', { category: topCategoryName, pct: topCategoryPct })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentTab('analytics')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center shrink-0"
            >
              {t('insight.analyze')}
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <RecentTransactions />
    </div>
  );
};

export default DashboardView;
