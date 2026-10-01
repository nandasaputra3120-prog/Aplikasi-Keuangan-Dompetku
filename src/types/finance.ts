export type TransactionType = 'expense' | 'income' | 'transfer';

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  icon: string;
  color: string;
  accountNumber?: string;
  institution?: string; // BCA, Mandiri, GoPay, Cash, etc.
}

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  walletId: string;
  toWalletId?: string; // only for transfer
  adminFee?: number; // for transfer or withdrawal
  categoryId: string;
  date: string; // ISO date format YYYY-MM-DDTHH:mm
  note: string;
  receiptImage?: string; // Base64 data URL
  tags: string[];
}

export interface Budget {
  id: string;
  categoryId: string;
  monthlyLimit: number;
  month: string; // format YYYY-MM
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  icon: string;
  color: string;
  walletId?: string;
  note?: string;
}

export interface DebtPayment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export type DebtType = 'debt' | 'loan'; // 'debt' = Saya Berhutang (Payable), 'loan' = Orang Berhutang ke Saya (Receivable)

export interface Debt {
  id: string;
  type: DebtType;
  personName: string;
  phoneNumber?: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  note?: string;
  walletId?: string;
  payments: DebtPayment[];
  createdAt: string;
}

export type ActiveTab = 'home' | 'transactions' | 'budgets' | 'debts' | 'analytics';
