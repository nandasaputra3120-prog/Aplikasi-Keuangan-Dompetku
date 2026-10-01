import { Wallet, Category, Transaction, Budget, SavingsGoal, Debt } from '../types/finance';
import { getMonthKey } from '../utils/formatters';

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'w-cash',
    name: 'Dompet / Tunai',
    type: 'cash',
    balance: 450000,
    icon: 'Banknote',
    color: '#10b981', // emerald
    institution: 'Uang Tunai',
  },
  {
    id: 'w-bca',
    name: 'Bank BCA',
    type: 'bank',
    balance: 8750000,
    icon: 'CreditCard',
    color: '#0284c7', // sky
    accountNumber: '8820-9123-44',
    institution: 'BCA Prioritas / Tahapan',
  },
  {
    id: 'w-mandiri',
    name: 'Bank Mandiri',
    type: 'bank',
    balance: 14200000,
    icon: 'Building2',
    color: '#2563eb', // blue
    accountNumber: '137-00-98442-1',
    institution: 'Mandiri Tabungan Now',
  },
  {
    id: 'w-gopay',
    name: 'GoPay',
    type: 'ewallet',
    balance: 285000,
    icon: 'Smartphone',
    color: '#06b6d4', // cyan
    accountNumber: '0812-3456-7890',
    institution: 'GoTo Financial',
  },
  {
    id: 'w-dana',
    name: 'DANA',
    type: 'ewallet',
    balance: 140000,
    icon: 'Smartphone',
    color: '#3b82f6', // blue
    accountNumber: '0812-3456-7890',
    institution: 'DANA Dompet Digital',
  },
  {
    id: 'w-bibit',
    name: 'Bibit / Reksadana',
    type: 'investment',
    balance: 12500000,
    icon: 'TrendingUp',
    color: '#8b5cf6', // violet
    institution: 'Investasi Pasar Uang & Obligasi',
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  // Pengeluaran
  { id: 'cat-food', name: 'Makanan & Minuman', type: 'expense', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-transport', name: 'Transport & Bensin', type: 'expense', icon: 'Car', color: '#0ea5e9' },
  { id: 'cat-groceries', name: 'Belanja Harian', type: 'expense', icon: 'ShoppingBag', color: '#84cc16' },
  { id: 'cat-bills', name: 'Tagihan & Listrik', type: 'expense', icon: 'Receipt', color: '#ef4444' },
  { id: 'cat-housing', name: 'Tempat Tinggal / Kost', type: 'expense', icon: 'Home', color: '#6366f1' },
  { id: 'cat-entertainment', name: 'Hiburan & Hobi', type: 'expense', icon: 'Gamepad2', color: '#ec4899' },
  { id: 'cat-health', name: 'Kesehatan & Obat', type: 'expense', icon: 'HeartPulse', color: '#14b8a6' },
  { id: 'cat-charity', name: 'Sedekah & Zakat', type: 'expense', icon: 'HeartHandshake', color: '#10b981' },
  { id: 'cat-education', name: 'Pendidikan & Kursus', type: 'expense', icon: 'GraduationCap', color: '#a855f7' },
  { id: 'cat-other-exp', name: 'Lain-lain', type: 'expense', icon: 'MoreHorizontal', color: '#64748b' },

  // Pemasukan
  { id: 'cat-salary', name: 'Gaji Utama', type: 'income', icon: 'Briefcase', color: '#10b981' },
  { id: 'cat-freelance', name: 'Proyek Sampingan', type: 'income', icon: 'Laptop', color: '#06b6d4' },
  { id: 'cat-bonus', name: 'Bonus & THR', type: 'income', icon: 'Award', color: '#f59e0b' },
  { id: 'cat-invest-yield', name: 'Dividen & Bunga', type: 'income', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'cat-cashback', name: 'Cashback & Promo', type: 'income', icon: 'Coins', color: '#ec4899' },
  { id: 'cat-other-inc', name: 'Pemasukan Lainnya', type: 'income', icon: 'PlusCircle', color: '#64748b' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    type: 'income',
    amount: 9500000,
    walletId: 'w-bca',
    categoryId: 'cat-salary',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    note: 'Gaji Bulanan PT Digital Solusi',
    tags: ['kantor', 'gaji'],
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 45000,
    walletId: 'w-gopay',
    categoryId: 'cat-food',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    note: 'Makan Siang Nasi Padang Sederhana',
    tags: ['makan', 'siang'],
  },
  {
    id: 'tx-3',
    type: 'expense',
    amount: 150000,
    walletId: 'w-bca',
    categoryId: 'cat-transport',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    note: 'Isi Bensin Pertamax Shell Full Tank',
    tags: ['motor', 'bensin'],
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 320000,
    walletId: 'w-bca',
    categoryId: 'cat-groceries',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    note: 'Belanja Mingguan Superindo Buah & Telur',
    tags: ['belanja', 'mingguan'],
  },
  {
    id: 'tx-5',
    type: 'expense',
    amount: 350000,
    walletId: 'w-bca',
    categoryId: 'cat-bills',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    note: 'Token Listrik PLN & Tagihan Wifi Rumah',
    tags: ['tagihan', 'rumah'],
  },
  {
    id: 'tx-6',
    type: 'income',
    amount: 1250000,
    walletId: 'w-mandiri',
    categoryId: 'cat-freelance',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    note: 'Desain UI Landing Page Klien Bali',
    tags: ['freelance', 'side-income'],
  },
  {
    id: 'tx-7',
    type: 'transfer',
    amount: 500000,
    walletId: 'w-bca',
    toWalletId: 'w-gopay',
    adminFee: 1000,
    categoryId: 'cat-other-exp',
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    note: 'Top Up Saldo GoPay via BCA Mobile',
    tags: ['topup', 'ewallet'],
  },
  {
    id: 'tx-8',
    type: 'expense',
    amount: 75000,
    walletId: 'w-cash',
    categoryId: 'cat-food',
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    note: 'Kopi Kenangan & Roti Bakar Sore',
    tags: ['nongkrong', 'kopi'],
  },
  {
    id: 'tx-9',
    type: 'expense',
    amount: 100000,
    walletId: 'w-mandiri',
    categoryId: 'cat-charity',
    date: new Date(Date.now() - 7 * 86400000).toISOString(),
    note: 'Sedekah Jumat Rumah Yatim',
    tags: ['sedekah', 'jumat-berkah'],
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-food',
    categoryId: 'cat-food',
    monthlyLimit: 2200000,
    month: getMonthKey(),
  },
  {
    id: 'b-transport',
    categoryId: 'cat-transport',
    monthlyLimit: 750000,
    month: getMonthKey(),
  },
  {
    id: 'b-groceries',
    categoryId: 'cat-groceries',
    monthlyLimit: 1500000,
    month: getMonthKey(),
  },
  {
    id: 'b-entertainment',
    categoryId: 'cat-entertainment',
    monthlyLimit: 600000,
    month: getMonthKey(),
  },
  {
    id: 'b-bills',
    categoryId: 'cat-bills',
    monthlyLimit: 1000000,
    month: getMonthKey(),
  },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-emergency',
    title: 'Dana Darurat 6 Bulan',
    targetAmount: 25000000,
    currentAmount: 18500000,
    targetDate: '2026-12-31',
    icon: 'ShieldCheck',
    color: '#10b981',
    note: 'Simpanan aman likuid di Reksadana Pasar Uang & Tabungan Mandiri',
  },
  {
    id: 'sg-gadget',
    title: 'Beli Laptop Kerja Baru',
    targetAmount: 15000000,
    currentAmount: 10250000,
    targetDate: '2026-11-20',
    icon: 'Laptop',
    color: '#3b82f6',
    note: 'Target beli saat diskon 11.11 atau akhir tahun',
  },
  {
    id: 'sg-vacation',
    title: 'Liburan Akhir Tahun Jogja - Bali',
    targetAmount: 6000000,
    currentAmount: 4200000,
    targetDate: '2026-12-24',
    icon: 'Plane',
    color: '#f59e0b',
    note: 'Tiket pesawat, hotel & kuliner santai',
  },
  {
    id: 'sg-kurban',
    title: 'Tabungan Kurban / Hari Raya',
    targetAmount: 4000000,
    currentAmount: 2800000,
    targetDate: '2027-05-15',
    icon: 'Sparkles',
    color: '#8b5cf6',
  }
];

export const INITIAL_DEBTS: Debt[] = [
  {
    id: 'debt-1',
    type: 'loan', // Piutang (Budi pinjam uang ke saya)
    personName: 'Budi Santoso',
    phoneNumber: '081234567891',
    amount: 750000,
    paidAmount: 250000,
    dueDate: '2026-10-15',
    note: 'Pinjam untuk perbaikan servis motor',
    createdAt: '2026-09-20',
    payments: [
      { id: 'p-1', amount: 250000, date: '2026-09-28', note: 'Cicilan transfer 1 via GoPay' }
    ]
  },
  {
    id: 'debt-2',
    type: 'loan', // Piutang
    personName: 'Dimas Kurniawan',
    phoneNumber: '081987654321',
    amount: 1200000,
    paidAmount: 0,
    dueDate: '2026-10-25',
    note: 'Talangan beli tiket konser & hotel',
    createdAt: '2026-09-22',
    payments: []
  },
  {
    id: 'debt-3',
    type: 'debt', // Hutang (Saya berhutang)
    personName: 'Cicilan Tokopedia Card / Gadget',
    amount: 900000,
    paidAmount: 450000,
    dueDate: '2026-10-20',
    note: 'Cicilan bulan ke-2 dari 3 tenor bunga 0%',
    createdAt: '2026-08-20',
    payments: [
      { id: 'p-2', amount: 450000, date: '2026-09-20', note: 'Bayar via Autodebet BCA' }
    ]
  }
];
