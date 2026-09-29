import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TRANSACTIONS } from '../data/initialData';
import { CURRENCIES, CATEGORIES } from '../data/categories';
import { LANGUAGES, TRANSLATIONS } from '../data/translations';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('moneydairy_darkmode');
    return saved !== null ? JSON.parse(saved) : true; // Default sleek dark fintech theme
  });

  // Language state: 'lo' | 'vi' | 'en' (defaults to 'lo' for native Lao, can switch anytime)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('moneydairy_language') || 'lo';
  });

  // Currency state: LAK, THB, USD, VND
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('moneydairy_currency') || 'LAK';
  });

  // Privacy: Hide / Show balance
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    return JSON.parse(localStorage.getItem('moneydairy_hide_balance') || 'false');
  });

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState('dashboard');

  // Add Transaction Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Transactions state
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('moneydairy_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse stored transactions', e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Apply dark mode class to HTML root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('moneydairy_darkmode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Persist language and update html lang attribute
  useEffect(() => {
    localStorage.setItem('moneydairy_language', language);
    document.documentElement.lang = language;
  }, [language]);

  // Persist currency
  useEffect(() => {
    localStorage.setItem('moneydairy_currency', currency);
  }, [currency]);

  // Persist hide balance
  useEffect(() => {
    localStorage.setItem('moneydairy_hide_balance', JSON.stringify(isBalanceHidden));
  }, [isBalanceHidden]);

  // Persist transactions
  useEffect(() => {
    localStorage.setItem('moneydairy_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Translation helper function
  const t = (path, params = {}) => {
    const keys = path.split('.');
    let current = TRANSLATIONS[language] || TRANSLATIONS['en'];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        // Fallback to English
        let fallback = TRANSLATIONS['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk] !== undefined) {
            fallback = fallback[fk];
          } else {
            fallback = null;
            break;
          }
        }
        current = fallback !== null && fallback !== undefined ? fallback : path;
        break;
      }
    }

    if (typeof current === 'string') {
      return Object.entries(params).reduce((str, [paramKey, val]) => {
        return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
      }, current);
    }
    return current;
  };

  // Helper for category names localized
  const getCategoryName = (catId) => {
    const translated = t(`categories.${catId}`);
    if (translated && translated !== `categories.${catId}`) {
      return translated;
    }
    return CATEGORIES[catId]?.name || catId;
  };

  // Helper for payment methods localized
  const getPaymentMethodName = (method) => {
    const translated = t(`payments.${method}`);
    if (translated && translated !== `payments.${method}`) {
      return translated;
    }
    return method;
  };

  // Localized date formatter
  const formatDateLocalized = (date, options) => {
    const d = date instanceof Date ? date : new Date(date);
    const locale = LANGUAGES[language]?.locale || 'en-US';
    return d.toLocaleDateString(locale, options);
  };

  // Add a new transaction
  const addTransaction = (transactionData) => {
    const activeCurrObj = CURRENCIES[currency] || CURRENCIES['LAK'];
    const lakRate = CURRENCIES['LAK'].rateToUSD;
    const currRate = activeCurrObj.rateToUSD;
    
    // Amount in LAK = enteredAmount * (lakRate / currRate)
    const amountInLAK = Math.round(Number(transactionData.amount) * (lakRate / currRate));

    const newTx = {
      id: 'tx-' + Date.now(),
      title: transactionData.title.trim() || (transactionData.type === 'income' ? t('modal.receivedCash') : t('modal.quickExpense')),
      category: transactionData.category || (transactionData.type === 'income' ? 'salary' : 'other_expense'),
      amount: amountInLAK,
      type: transactionData.type, // 'income' | 'expense'
      date: transactionData.date ? new Date(transactionData.date).toISOString() : new Date().toISOString(),
      paymentMethod: transactionData.paymentMethod || 'QR Scan',
      notes: transactionData.notes || ''
    };

    setTransactions((prev) => [newTx, ...prev]);
    setIsAddModalOpen(false);
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // Reset to default sample data
  const resetToSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    localStorage.setItem('moneydairy_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
  };

  // Currency conversion helper
  const convertFromLAK = (amountInLAK) => {
    const lakRate = CURRENCIES['LAK'].rateToUSD;
    const currRate = (CURRENCIES[currency] || CURRENCIES['LAK']).rateToUSD;
    return amountInLAK * (currRate / lakRate);
  };

  // Currency formatted string
  const formatCurrency = (amountInLAK, withSymbol = true) => {
    if (isBalanceHidden) return '••••••';
    const converted = convertFromLAK(amountInLAK);
    const currObj = CURRENCIES[currency] || CURRENCIES['LAK'];

    let formattedNumber;
    if (currency === 'LAK' || currency === 'THB' || currency === 'VND') {
      formattedNumber = Math.round(converted).toLocaleString('en-US');
    } else {
      formattedNumber = converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (withSymbol) {
      return `${currObj.symbol} ${formattedNumber}`;
    }
    return formattedNumber;
  };

  // Aggregate stats
  const totalIncomeLAK = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenseLAK = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBalanceLAK = totalIncomeLAK - totalExpenseLAK;

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        currency,
        setCurrency,
        language,
        setLanguage,
        languages: LANGUAGES,
        currentLanguage: LANGUAGES[language] || LANGUAGES['lo'],
        t,
        getCategoryName,
        getPaymentMethodName,
        formatDateLocalized,
        isDarkMode,
        setIsDarkMode,
        isBalanceHidden,
        setIsBalanceHidden,
        currentTab,
        setCurrentTab,
        isAddModalOpen,
        setIsAddModalOpen,
        addTransaction,
        deleteTransaction,
        resetToSampleData,
        formatCurrency,
        convertFromLAK,
        totalBalanceLAK,
        totalIncomeLAK,
        totalExpenseLAK,
        recentTransactions,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export default FinanceContext;
