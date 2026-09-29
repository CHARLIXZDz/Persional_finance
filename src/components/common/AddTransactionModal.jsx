import React, { useState } from 'react';
import { X, Check, Calendar, CreditCard, Tag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORIES, CURRENCIES } from '../../data/categories';
import CategoryIcon from './CategoryIcon';

export const AddTransactionModal = () => {
  const {
    isAddModalOpen,
    setIsAddModalOpen,
    addTransaction,
    currency,
    t,
    getCategoryName,
    getPaymentMethodName,
  } = useFinance();

  const [type, setType] = useState('expense'); // 'expense' | 'income'
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('food');
  const [paymentMethod, setPaymentMethod] = useState('QR Scan');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  if (!isAddModalOpen) return null;

  const currentCurrency = CURRENCIES[currency] || CURRENCIES['LAK'];

  // Filter categories by type
  const availableCategories = Object.values(CATEGORIES).filter(
    (cat) => cat.type === type
  );

  // Quick amount suggestions depending on currency
  const quickAmounts =
    currency === 'LAK' || currency === 'VND'
      ? [50000, 100000, 500000, 1000000]
      : currency === 'THB'
      ? [100, 300, 500, 1000]
      : [10, 25, 50, 100];

  const handleQuickAdd = (val) => {
    const current = Number(amount) || 0;
    setAmount((current + val).toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    addTransaction({
      title: title.trim() || (type === 'income' ? t('modal.receivedCash') : t('modal.quickExpense')),
      amount: Number(amount),
      type,
      category,
      paymentMethod,
      date,
    });

    // Fire delightful celebration confetti
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    // Reset form
    setAmount('');
    setTitle('');
  };

  const paymentOptions = [
    'QR Scan',
    'BCEL One Direct',
    'Cash',
    'Credit Card',
    'Bank Transfer',
    'Loca Wallet',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 animate-slide-up max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Header / Grab handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('modal.title')}
          </h3>
          <button
            onClick={() => setIsAddModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type Switcher: Expense vs Income */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mt-4">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('food');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('modal.expense')}
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('salary');
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('modal.income')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Large Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('modal.amount')} ({currentCurrency.code})
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-slate-400">
                {currentCurrency.symbol}
              </span>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-2xl font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center space-x-1.5 mt-2 overflow-x-auto no-scrollbar py-1">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => handleQuickAdd(q)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors whitespace-nowrap active:scale-95"
                >
                  +{q.toLocaleString('en-US')}
                </button>
              ))}
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t('modal.titleLabel')}
            </label>
            <input
              type="text"
              placeholder={type === 'income' ? t('modal.placeholderIncome') : t('modal.placeholderExpense')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {t('modal.category')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableCategories.map((cat) => {
                const isSelected = category === cat.id;
                const catName = getCategoryName(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all active:scale-95 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 ${cat.bgColor}`}
                    >
                      <CategoryIcon iconName={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] leading-tight text-center truncate w-full">
                      {catName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method Row */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('modal.date')}
              </label>
              <div className="relative flex items-center">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                {t('modal.payment')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {paymentOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {getPaymentMethodName(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-glow-emerald active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>{t('modal.saveBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
