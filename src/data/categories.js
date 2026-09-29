export const CATEGORIES = {
  // Expenses
  food: {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    type: 'expense'
  },
  transport: {
    id: 'transport',
    name: 'Transportation',
    icon: 'Car',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    type: 'expense'
  },
  shopping: {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    type: 'expense'
  },
  bills: {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: 'from-rose-500 to-red-500',
    bgColor: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    type: 'expense'
  },
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    type: 'expense'
  },
  health: {
    id: 'health',
    name: 'Health & Wellness',
    icon: 'HeartPulse',
    color: 'from-teal-500 to-emerald-500',
    bgColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    type: 'expense'
  },
  other_expense: {
    id: 'other_expense',
    name: 'Other Expense',
    icon: 'MoreHorizontal',
    color: 'from-slate-500 to-gray-500',
    bgColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    type: 'expense'
  },

  // Income
  salary: {
    id: 'salary',
    name: 'Monthly Salary',
    icon: 'Briefcase',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    type: 'income'
  },
  freelance: {
    id: 'freelance',
    name: 'Freelance & Side Gig',
    icon: 'TrendingUp',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    type: 'income'
  },
  investment: {
    id: 'investment',
    name: 'Investments / Returns',
    icon: 'Coins',
    color: 'from-amber-400 to-yellow-500',
    bgColor: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    type: 'income'
  },
  gift: {
    id: 'gift',
    name: 'Gift / Bonus',
    icon: 'Gift',
    color: 'from-fuchsia-500 to-pink-500',
    bgColor: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
    type: 'income'
  }
};

export const CURRENCIES = {
  LAK: {
    code: 'LAK',
    symbol: '₭',
    name: 'Lao Kip',
    flag: '🇱🇦',
    rateToUSD: 22000,
    decimals: 0
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    flag: '🇹🇭',
    rateToUSD: 36,
    decimals: 0
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    rateToUSD: 1,
    decimals: 2
  },
  VND: {
    code: 'VND',
    symbol: '₫',
    name: 'Vietnamese Dong',
    flag: '🇻🇳',
    rateToUSD: 25400,
    decimals: 0
  }
};
