import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Save,
  Trash2,
  Sparkles,
  DollarSign,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES } from '../../data/categories';
import CategoryIcon from './CategoryIcon';

export const BudgetModal = ({ isOpen, onClose, year, month }) => {
  const {
    budgets,
    saveBudget,
    clearBudget,
    formatCurrency,
    t,
    getCategoryName,
    showToast,
  } = useFinance();

  // 'YYYY-MM'
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const existingBudgets = budgets[monthKey] || {};

  // Form state for category budget amounts
  const [amounts, setAmounts] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expense categories only
  const expenseCategories = Object.values(CATEGORIES).filter(
    (cat) => cat.type === 'expense'
  );

  // Sync state when modal opens or month changes
  useEffect(() => {
    if (isOpen) {
      const initial = {};
      expenseCategories.forEach((cat) => {
        initial[cat.id] = existingBudgets[cat.id] ? String(existingBudgets[cat.id]) : '';
      });
      setAmounts(initial);
    }
  }, [isOpen, monthKey]);

  if (!isOpen) return null;

  const handleAmountChange = (catId, val) => {
    // Only allow positive digits
    const cleaned = val.replace(/[^0-9]/g, '');
    setAmounts((prev) => ({
      ...prev,
      [catId]: cleaned,
    }));
  };

  const handleQuickAdd = (catId, addAmount) => {
    const current = Number(amounts[catId]) || 0;
    const nextVal = current + addAmount;
    setAmounts((prev) => ({
      ...prev,
      [catId]: String(nextVal),
    }));
  };

  // Calculate total budget sum
  const totalBudgetSum = Object.values(amounts).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cleanBudgets = {};
      Object.entries(amounts).forEach(([catId, val]) => {
        const num = Number(val);
        if (num > 0) {
          cleanBudgets[catId] = num;
        }
      });

      await saveBudget(monthKey, cleanBudgets);

      showToast({
        type: 'success',
        title: t('budgets.title'),
        message: t('budgets.saveSuccess'),
      });

      onClose();
    } catch (err) {
      console.error('Failed to save budget:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm(t('budgets.clearConfirm'))) {
      await clearBudget(monthKey);
      showToast({
        type: 'info',
        title: t('budgets.title'),
        message: t('budgets.clearSuccess'),
      });
      onClose();
    }
  };

  const formattedMonth = `${month + 1}/${year}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col">
        {/* Grab handle for mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t('budgets.modalTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('budgets.modalSubtitle', { month: formattedMonth })}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4 flex-1">
          {/* Categories List */}
          <div className="space-y-3">
            {expenseCategories.map((cat) => {
              const currentVal = amounts[cat.id] || '';
              return (
                <div
                  key={cat.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs shrink-0">
                        <CategoryIcon iconName={cat.icon} className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {getCategoryName(cat.id)}
                      </span>
                    </div>

                    {/* Quick increment buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(cat.id, 200000)}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-500 active:scale-95 transition-all"
                      >
                        +200K
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(cat.id, 500000)}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-500 active:scale-95 transition-all"
                      >
                        +500K
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(cat.id, 1000000)}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-500 active:scale-95 transition-all"
                      >
                        +1M
                      </button>
                    </div>
                  </div>

                  {/* Input field */}
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={currentVal ? Number(currentVal).toLocaleString('en-US') : ''}
                      onChange={(e) => handleAmountChange(cat.id, e.target.value)}
                      placeholder="0"
                      className="w-full h-10 px-3.5 pr-10 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                      ₭
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Total Summary & Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t('budgets.totalBudget')}
              </span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalBudgetSum)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {Object.keys(existingBudgets).length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center justify-center shrink-0"
                  title={t('budgets.clearAll')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{t('budgets.saveBudget')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
