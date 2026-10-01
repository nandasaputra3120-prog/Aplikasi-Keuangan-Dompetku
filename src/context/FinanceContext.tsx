import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  Wallet,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  Debt,
  ActiveTab,
  DebtPayment,
} from '../types/finance';
import {
  INITIAL_WALLETS,
  INITIAL_CATEGORIES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_DEBTS,
} from '../data/initialData';
import { getMonthKey } from '../utils/formatters';

interface FinanceContextType {
  // State
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  debts: Debt[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  hideBalances: boolean;
  setHideBalances: (hide: boolean | ((prev: boolean) => boolean)) => void;
  isAndroidFrame: boolean;
  setIsAndroidFrame: (frame: boolean | ((prev: boolean) => boolean)) => void;

  // Modals & Action Sheet
  isTransactionModalOpen: boolean;
  openTransactionModal: (tx?: Transaction) => void;
  closeTransactionModal: () => void;
  editingTransaction: Transaction | null;

  // Calculators & Summaries
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashflow: number;

  // Actions
  addTransaction: (data: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, data: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, wallet: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;

  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, limit: number) => void;
  deleteBudget: (id: string) => void;

  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  depositToSavingsGoal: (goalId: string, amount: number, walletId?: string) => void;

  addDebt: (debt: Omit<Debt, 'id' | 'payments' | 'createdAt'>) => void;
  payDebt: (debtId: string, payment: Omit<DebtPayment, 'id'>, walletId?: string) => void;
  deleteDebt: (debtId: string) => void;

  resetToDemoData: () => void;
  exportToCSV: () => void;
  exportToJSON: () => void;
  importFromJSON: (jsonString: string) => boolean;
  triggerConfetti: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WALLETS: 'dompetku_wallets_v2',
  TRANSACTIONS: 'dompetku_transactions_v2',
  CATEGORIES: 'dompetku_categories_v2',
  BUDGETS: 'dompetku_budgets_v2',
  GOALS: 'dompetku_goals_v2',
  DEBTS: 'dompetku_debts_v2',
  HIDE_BALANCES: 'dompetku_hide_balances',
  DEVICE_FRAME: 'dompetku_device_frame',
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state with fallback
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WALLETS);
      return saved ? JSON.parse(saved) : INITIAL_WALLETS;
    } catch {
      return INITIAL_WALLETS;
    }
  });

  const [categories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GOALS);
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEBTS);
      return saved ? JSON.parse(saved) : INITIAL_DEBTS;
    } catch {
      return INITIAL_DEBTS;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [hideBalances, setHideBalances] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.HIDE_BALANCES) === 'true';
  });
  const [isAndroidFrame, setIsAndroidFrame] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEVICE_FRAME);
    return saved !== null ? saved === 'true' : true;
  });

  // Modal State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  }, [debts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIDE_BALANCES, String(hideBalances));
  }, [hideBalances]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICE_FRAME, String(isAndroidFrame));
  }, [isAndroidFrame]);

  // Calculations
  const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);

  const currentMonthKey = getMonthKey();
  const currentMonthTransactions = transactions.filter((tx) => {
    try {
      return getMonthKey(new Date(tx.date)) === currentMonthKey;
    } catch {
      return false;
    }
  });

  const monthlyIncome = currentMonthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const monthlyExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const netCashflow = monthlyIncome - monthlyExpense;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b'],
      });
    } catch {
      // safe fallback
    }
  };

  // Transaction Actions with automated balance recalculation
  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...data,
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    };

    setWallets((prevWallets) =>
      prevWallets.map((wallet) => {
        if (data.type === 'expense' && wallet.id === data.walletId) {
          return { ...wallet, balance: wallet.balance - data.amount };
        }
        if (data.type === 'income' && wallet.id === data.walletId) {
          return { ...wallet, balance: wallet.balance + data.amount };
        }
        if (data.type === 'transfer') {
          if (wallet.id === data.walletId) {
            const admin = data.adminFee || 0;
            return { ...wallet, balance: wallet.balance - (data.amount + admin) };
          }
          if (wallet.id === data.toWalletId) {
            return { ...wallet, balance: wallet.balance + data.amount };
          }
        }
        return wallet;
      })
    );

    setTransactions((prev) => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updatedData: Omit<Transaction, 'id'>) => {
    const oldTx = transactions.find((t) => t.id === id);
    if (!oldTx) return;

    // Rollback old transaction balance effect, then apply new
    setWallets((prevWallets) => {
      let temp = prevWallets.map((w) => {
        if (oldTx.type === 'expense' && w.id === oldTx.walletId) {
          return { ...w, balance: w.balance + oldTx.amount };
        }
        if (oldTx.type === 'income' && w.id === oldTx.walletId) {
          return { ...w, balance: w.balance - oldTx.amount };
        }
        if (oldTx.type === 'transfer') {
          const admin = oldTx.adminFee || 0;
          if (w.id === oldTx.walletId) return { ...w, balance: w.balance + (oldTx.amount + admin) };
          if (w.id === oldTx.toWalletId) return { ...w, balance: w.balance - oldTx.amount };
        }
        return w;
      });

      // Apply updated
      return temp.map((w) => {
        if (updatedData.type === 'expense' && w.id === updatedData.walletId) {
          return { ...w, balance: w.balance - updatedData.amount };
        }
        if (updatedData.type === 'income' && w.id === updatedData.walletId) {
          return { ...w, balance: w.balance + updatedData.amount };
        }
        if (updatedData.type === 'transfer') {
          const admin = updatedData.adminFee || 0;
          if (w.id === updatedData.walletId) return { ...w, balance: w.balance - (updatedData.amount + admin) };
          if (w.id === updatedData.toWalletId) return { ...w, balance: w.balance + updatedData.amount };
        }
        return w;
      });
    });

    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...updatedData, id } : tx))
    );
  };

  const deleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    // Reverse balance effect
    setWallets((prev) =>
      prev.map((w) => {
        if (tx.type === 'expense' && w.id === tx.walletId) {
          return { ...w, balance: w.balance + tx.amount };
        }
        if (tx.type === 'income' && w.id === tx.walletId) {
          return { ...w, balance: w.balance - tx.amount };
        }
        if (tx.type === 'transfer') {
          const admin = tx.adminFee || 0;
          if (w.id === tx.walletId) return { ...w, balance: w.balance + (tx.amount + admin) };
          if (w.id === tx.toWalletId) return { ...w, balance: w.balance - tx.amount };
        }
        return w;
      })
    );

    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Wallet Actions
  const addWallet = (data: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      ...data,
      id: 'w-' + Date.now(),
    };
    setWallets((prev) => [...prev, newWallet]);
  };

  const updateWallet = (id: string, patch: Partial<Wallet>) => {
    setWallets((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  };

  const deleteWallet = (id: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== id));
  };

  // Budget Actions
  const addBudget = (data: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...data,
      id: 'b-' + Date.now(),
    };
    setBudgets((prev) => [...prev, newBudget]);
  };

  const updateBudget = (id: string, limit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, monthlyLimit: limit } : b))
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  // Savings Goal Actions
  const addSavingsGoal = (data: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...data,
      id: 'sg-' + Date.now(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, patch: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const depositToSavingsGoal = (goalId: string, amount: number, walletId?: string) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const newCurrent = g.currentAmount + amount;
          if (newCurrent >= g.targetAmount && g.currentAmount < g.targetAmount) {
            triggerConfetti();
          }
          return { ...g, currentAmount: newCurrent };
        }
        return g;
      })
    );

    // If source wallet is selected, deduct from wallet and record transaction
    if (walletId && amount > 0) {
      const goal = savingsGoals.find((g) => g.id === goalId);
      addTransaction({
        type: 'expense',
        amount,
        walletId,
        categoryId: 'cat-invest-yield',
        date: new Date().toISOString(),
        note: `Setor Tabungan: ${goal?.title || 'Target Impian'}`,
        tags: ['tabungan', 'impian'],
      });
    }
  };

  // Debt Actions
  const addDebt = (data: Omit<Debt, 'id' | 'payments' | 'createdAt'>) => {
    const newDebt: Debt = {
      ...data,
      id: 'debt-' + Date.now(),
      payments: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDebts((prev) => [newDebt, ...prev]);
  };

  const payDebt = (debtId: string, payment: Omit<DebtPayment, 'id'>, walletId?: string) => {
    const newPayment: DebtPayment = {
      ...payment,
      id: 'p-' + Date.now(),
    };

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newPaid = d.paidAmount + payment.amount;
          return {
            ...d,
            paidAmount: newPaid,
            payments: [newPayment, ...d.payments],
          };
        }
        return d;
      })
    );

    // If wallet provided, adjust balance & create transaction record
    if (walletId && payment.amount > 0) {
      const debt = debts.find((d) => d.id === debtId);
      if (debt) {
        if (debt.type === 'debt') {
          // Saya bayar hutang -> pengeluaran
          addTransaction({
            type: 'expense',
            amount: payment.amount,
            walletId,
            categoryId: 'cat-bills',
            date: new Date().toISOString(),
            note: `Bayar Cicilan Hutang: ${debt.personName}`,
            tags: ['hutang', 'cicilan'],
          });
        } else {
          // Orang bayar hutang ke saya -> pemasukan
          addTransaction({
            type: 'income',
            amount: payment.amount,
            walletId,
            categoryId: 'cat-other-inc',
            date: new Date().toISOString(),
            note: `Penerimaan Pelunasan/Cicilan: ${debt.personName}`,
            tags: ['piutang', 'pelunasan'],
          });
        }
      }
    }
  };

  const deleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const openTransactionModal = (tx?: Transaction) => {
    setEditingTransaction(tx || null);
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(false);
  };

  const resetToDemoData = () => {
    setWallets(INITIAL_WALLETS);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(INITIAL_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setDebts(INITIAL_DEBTS);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Tipe', 'Nominal', 'Dompet', 'Kategori', 'Tanggal', 'Catatan', 'Tags'];
    const rows = transactions.map((t) => {
      const wallet = wallets.find((w) => w.id === t.walletId)?.name || t.walletId;
      const category = categories.find((c) => c.id === t.categoryId)?.name || t.categoryId;
      return [
        t.id,
        t.type,
        t.amount,
        `"${wallet}"`,
        `"${category}"`,
        t.date,
        `"${(t.note || '').replace(/"/g, '""')}"`,
        `"${t.tags?.join(', ') || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DompetKu_Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const data = {
      wallets,
      transactions,
      budgets,
      savingsGoals,
      debts,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `DompetKu_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.wallets)) setWallets(parsed.wallets);
      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
      if (Array.isArray(parsed.savingsGoals)) setSavingsGoals(parsed.savingsGoals);
      if (Array.isArray(parsed.debts)) setDebts(parsed.debts);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <FinanceContext.Provider
      value={{
        wallets,
        categories,
        transactions,
        budgets,
        savingsGoals,
        debts,
        activeTab,
        setActiveTab,
        hideBalances,
        setHideBalances,
        isAndroidFrame,
        setIsAndroidFrame,
        isTransactionModalOpen,
        openTransactionModal,
        closeTransactionModal,
        editingTransaction,
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        netCashflow,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addWallet,
        updateWallet,
        deleteWallet,
        addBudget,
        updateBudget,
        deleteBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        depositToSavingsGoal,
        addDebt,
        payDebt,
        deleteDebt,
        resetToDemoData,
        exportToCSV,
        exportToJSON,
        importFromJSON,
        triggerConfetti,
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
