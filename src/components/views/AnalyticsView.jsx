import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from '../common/CategoryIcon';
import {
  PieChart as ChartIcon,
  TrendingDown,
  TrendingUp,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const AnalyticsView = () => {
  const {
    transactions,
    formatCurrency,
    totalIncomeLAK,
    totalExpenseLAK,
    t,
    getCategoryName,
  } = useFinance();
  const [selectedFilter, setSelectedFilter] = useState('expense'); // 'expense' | 'income'

  // Filter transactions
  const filteredTxs = transactions.filter((t) => t.type === selectedFilter);
  const totalAmount = filteredTxs.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryMap = {};
  filteredTxs.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([catId, amount]) => {
      const catObj = CATEGORIES[catId] || {
        name: 'Other',
        icon: 'HelpCircle',
        bgColor: 'bg-slate-500/10 text-slate-500',
      };
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
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

  // Colors for donut chart
  const DONUT_COLORS = [
    '#F59E0B', // Amber
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#64748B', // Slate
  ];

  // Calculate SVG Donut strokes
  const circumference = 2 * Math.PI * 40; // radius = 40
  let strokeOffsetAccumulator = 0;

  // Savings rate
  const savingsRate =
    totalIncomeLAK > 0
      ? Math.max(0, Math.round(((totalIncomeLAK - totalExpenseLAK) / totalIncomeLAK) * 100))
      : 0;

  return (
    <div className="flex-1 px-5 pt-6 pb-28 space-y-5 animate-fade-in">
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
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{t('analytics.thisMonth')}</span>
        </div>
      </div>

      {/* Cash Flow Summary Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card dark:shadow-card-dark">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {t('analytics.savingsPerformance')}
          </span>
          <span className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
            {t('analytics.savedPct', { pct: savingsRate })}
          </span>
        </div>

        {/* Progress Bar comparison */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{
              width: `${
                totalIncomeLAK + totalExpenseLAK > 0
                  ? (totalIncomeLAK / (totalIncomeLAK + totalExpenseLAK)) * 100
                  : 50
              }%`,
            }}
          />
          <div
            className="bg-rose-500 transition-all duration-500"
            style={{
              width: `${
                totalIncomeLAK + totalExpenseLAK > 0
                  ? (totalExpenseLAK / (totalIncomeLAK + totalExpenseLAK)) * 100
                  : 50
              }%`,
            }}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t('analytics.totalIn')}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalIncomeLAK)}
            </p>
          </div>

          <div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>{t('analytics.totalOut')}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {formatCurrency(totalExpenseLAK)}
            </p>
          </div>
        </div>
      </div>

      {/* Switcher: Expenses vs Income */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl">
        <button
          onClick={() => setSelectedFilter('expense')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            selectedFilter === 'expense'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t('analytics.expensesBreakdown')}
        </button>
        <button
          onClick={() => setSelectedFilter('income')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            selectedFilter === 'income'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {t('analytics.incomeBreakdown')}
        </button>
      </div>

      {/* Donut Chart Visual */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card dark:shadow-card-dark flex flex-col items-center">
        {totalAmount === 0 ? (
          <p className="text-xs text-slate-400 py-6">{t('analytics.noData')}</p>
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
              {categoryBreakdown.map((cat, idx) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -strokeOffsetAccumulator;
                strokeOffsetAccumulator += (cat.percentage / 100) * circumference;
                const strokeColor = DONUT_COLORS[idx % DONUT_COLORS.length];

                return (
                  <circle
                    key={cat.id}
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={strokeColor}
                    strokeWidth="12"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                );
              })}
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('analytics.total')}
              </span>
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Category List Breakdown */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
          {t('analytics.categoriesBreakdown')}
        </h3>

        {categoryBreakdown.map((cat, idx) => (
          <div
            key={cat.id}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.bgColor}`}
              >
                <CategoryIcon iconName={cat.icon} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {cat.name}
                </p>
                <div className="flex items-center space-x-2 mt-0.5">
                  <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length],
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {cat.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatCurrency(cat.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsView;
