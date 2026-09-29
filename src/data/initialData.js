// Base currency for storage is LAK
export const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    title: 'Monthly Salary',
    category: 'salary',
    amount: 18500000, // LAK (~30,000 THB / ~$840 USD)
    type: 'income',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago today
    paymentMethod: 'BCEL One Direct',
    notes: 'September Tech Engineering Salary'
  },
  {
    id: 'tx-2',
    title: 'Cafe Amazon & Lunch',
    category: 'food',
    amount: 85000, // LAK (~140 THB / ~$3.8 USD)
    type: 'expense',
    date: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago today
    paymentMethod: 'QR Scan',
    notes: 'Iced Latte & Khao Piak Sen'
  },
  {
    id: 'tx-3',
    title: 'EDL Electricity Bill',
    category: 'bills',
    amount: 480000, // LAK (~780 THB / ~$22 USD)
    type: 'expense',
    date: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(), // yesterday
    paymentMethod: 'Bank Transfer',
    notes: 'Home power consumption'
  },
  {
    id: 'tx-4',
    title: 'Loca Ride to Office',
    category: 'transport',
    amount: 95000, // LAK (~155 THB / ~$4.3 USD)
    type: 'expense',
    date: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(), // yesterday
    paymentMethod: 'Loca Wallet',
    notes: 'Morning rush hour taxi'
  },
  {
    id: 'tx-5',
    title: 'Parkson Supermarket',
    category: 'shopping',
    amount: 620000, // LAK (~1,000 THB / ~$28 USD)
    type: 'expense',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    paymentMethod: 'Credit Card',
    notes: 'Groceries and snacks'
  },
  {
    id: 'tx-6',
    title: 'UI Design Freelance',
    category: 'freelance',
    amount: 6500000, // LAK (~10,600 THB / ~$295 USD)
    type: 'income',
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(), // 5 days ago
    paymentMethod: 'Wire Transfer',
    notes: 'Landing page revamp milestone 1'
  }
];
