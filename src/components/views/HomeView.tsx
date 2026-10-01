import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Plus,
  CreditCard,
  Building2,
  Smartphone,
  TrendingUp,
  Banknote,
  PiggyBank,
  ChevronRight,
  ShieldCheck,
  Receipt,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, formatIndonesianDate } from '../../utils/formatters';
import { Wallet, Transaction } from '../../types/finance';
import { WalletModal } from '../WalletModal';
import { ReceiptViewerModal } from '../ReceiptViewerModal';
import { GoalModal } from '../GoalModal';
import { InstallAppModal } from '../InstallAppModal';
import { Download } from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    wallets,
    transactions,
    categories,
    budgets,
    savingsGoals,
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    netCashflow,
    hideBalances,
    setHideBalances,
    openTransactionModal,
    setActiveTab,
  } = useFinance();

  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedWalletToEdit, setSelectedWalletToEdit] = useState<Wallet | null>(null);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [depositGoalTarget, setDepositGoalTarget] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Time greeting in Indonesian
  const getIndonesianGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi 🌅';
    if (hour >= 11 && hour < 15) return 'Selamat Siang ☀️';
    if (hour >= 15 && hour < 18) return 'Selamat Sore 🌇';
    return 'Selamat Malam 🌙';
  };

  // Safe to spend daily calculation
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, daysInMonth - now.getDate() + 1);
  const totalMonthlyBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const remainingBudgetTotal = Math.max(0, totalMonthlyBudget - monthlyExpense);
  const safeDailySpend = totalMonthlyBudget > 0 ? Math.round(remainingBudgetTotal / remainingDays) : 0;

  const topGoal = savingsGoals[0];
  const recentTransactions = transactions.slice(0, 5);

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return Banknote;
      case 'ewallet':
        return Smartphone;
      case 'investment':
        return TrendingUp;
      default:
        return Building2;
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* User Greeting & Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs text-slate-400 font-medium">{getIndonesianGreeting()}</span>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Finansial Anda</h2>
        </div>
        <button
          onClick={() => setHideBalances((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs text-slate-300 transition-all active:scale-95"
        >
          {hideBalances ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Sensor</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Terbuka</span>
            </>
          )}
        </button>
      </div>

      {/* Main Net Worth & Cashflow Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-5 border border-slate-800/80 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Saldo Bersih (Net Worth)</span>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Terproteksi Lokal
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {hideBalances ? 'Rp ••••••••' : formatRupiah(totalBalance)}
          </div>

          {/* Monthly Income vs Expense Pill row */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block leading-tight">Pemasukan Bulan Ini</span>
                <span className="text-xs font-mono font-bold text-emerald-400 truncate">
                  {hideBalances ? '••••••' : `+${formatRupiah(monthlyIncome, true)}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="truncate">
                <span className="text-[10px] text-slate-400 block leading-tight">Pengeluaran Bulan Ini</span>
                <span className="text-xs font-mono font-bold text-rose-400 truncate">
                  {hideBalances ? '••••••' : `-${formatRupiah(monthlyExpense, true)}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => openTransactionModal()}
          className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Catat</span>
        </button>

        <button
          onClick={() => openTransactionModal()}
          className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Repeat className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Transfer</span>
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <PiggyBank className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Impian</span>
        </button>

        <button
          onClick={() => setActiveTab('debts')}
          className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-200">Hutang</span>
        </button>
      </div>

      {/* Safe Daily Spend Indicator Banner */}
      {totalMonthlyBudget > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/40 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400">Rekomendasi Aman Belanja Hari Ini</div>
              <div className="text-sm font-bold font-mono text-emerald-300">
                {hideBalances ? 'Rp ••••••' : formatRupiah(safeDailySpend)} / hari
              </div>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 text-right">
            Sisa {remainingDays} hari<br />di bulan ini
          </span>
        </div>
      )}

      {/* Install to Android Quick Banner */}
      <div
        onClick={() => setIsInstallModalOpen(true)}
        className="p-3.5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 rounded-2xl flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all group shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Pasang Aplikasi ke HP Android</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-normal">
                PWA / APK
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Jalankan langsung di layar utama HP tanpa buka browser
            </div>
          </div>
        </div>
        <span className="text-xs text-emerald-400 font-bold px-2.5 py-1 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20">
          Pasang
        </span>
      </div>

      {/* Wallets & Accounts Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Dompet & Rekening</h3>
            <span className="text-xs text-slate-500 font-mono">({wallets.length})</span>
          </div>
          <button
            onClick={() => {
              setSelectedWalletToEdit(null);
              setIsWalletModalOpen(true);
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {wallets.map((wallet) => {
            const Icon = getWalletIcon(wallet.type);
            return (
              <div
                key={wallet.id}
                onClick={() => {
                  setSelectedWalletToEdit(wallet);
                  setIsWalletModalOpen(true);
                }}
                className="w-48 shrink-0 p-4 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 cursor-pointer active:scale-[0.98] transition-all flex flex-col justify-between h-28 relative overflow-hidden group"
              >
                {/* Accent top line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: wallet.color }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: wallet.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white truncate">{wallet.name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {wallet.accountNumber || wallet.institution || 'Rekening'}
                  </span>
                  <span className="text-sm font-bold font-mono text-white">
                    {hideBalances ? 'Rp ••••••' : formatRupiah(wallet.balance)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Add Card */}
          <button
            onClick={() => {
              setSelectedWalletToEdit(null);
              setIsWalletModalOpen(true);
            }}
            className="w-36 shrink-0 rounded-2xl border border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/40 hover:bg-slate-800/40 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors h-28"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-medium">+ Rekening</span>
          </button>
        </div>
      </div>

      {/* Top Savings Goal Highlight */}
      {topGoal && (
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: topGoal.color }}
              >
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{topGoal.title}</span>
                <span className="text-[10px] text-slate-400">Target Impian Utama</span>
              </div>
            </div>

            <button
              onClick={() => setDepositGoalTarget(topGoal)}
              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg active:scale-95 transition-all"
            >
              + Setor
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100))}%`,
                backgroundColor: topGoal.color,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono mt-1.5 text-slate-400">
            <span>{hideBalances ? '••••' : formatRupiah(topGoal.currentAmount, true)}</span>
            <span className="text-emerald-400 font-bold">
              {Math.min(100, Math.round((topGoal.currentAmount / topGoal.targetAmount) * 100))}%
            </span>
            <span>{formatRupiah(topGoal.targetAmount, true)}</span>
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-white">Transaksi Terkini</h3>
          <button
            onClick={() => setActiveTab('transactions')}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 active:scale-95 transition-transform"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
            Belum ada transaksi. Tekan tombol "+" untuk mencatat!
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const cat = categories.find((c) => c.id === tx.categoryId);
              const wallet = wallets.find((w) => w.id === tx.walletId);
              const isIncome = tx.type === 'income';
              const isTransfer = tx.type === 'transfer';

              return (
                <div
                  key={tx.id}
                  onClick={() => openTransactionModal(tx)}
                  className="flex items-center justify-between p-3.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800/80 rounded-2xl cursor-pointer active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isTransfer
                          ? '#0284c720'
                          : isIncome
                          ? '#10b98120'
                          : `${cat?.color || '#f97316'}20`,
                        color: isTransfer
                          ? '#0284c7'
                          : isIncome
                          ? '#10b981'
                          : cat?.color || '#f97316',
                      }}
                    >
                      {isTransfer ? (
                        <Repeat className="w-4 h-4" />
                      ) : isIncome ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>

                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">
                        {tx.note || cat?.name || (isTransfer ? 'Transfer Saldo' : 'Transaksi')}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{wallet?.name || 'Dompet'}</span>
                        <span>·</span>
                        <span>{formatIndonesianDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    {tx.receiptImage && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReceiptTx(tx);
                        }}
                        className="p-1 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700"
                        title="Lihat Struk"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <span
                      className={`text-xs font-mono font-bold ${
                        isTransfer
                          ? 'text-sky-400'
                          : isIncome
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {hideBalances
                        ? '••••••'
                        : `${isIncome ? '+' : isTransfer ? '' : '-'}${formatRupiah(tx.amount)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Supporting Modals */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => {
          setIsWalletModalOpen(false);
          setSelectedWalletToEdit(null);
        }}
        walletToEdit={selectedWalletToEdit}
      />

      <ReceiptViewerModal
        transaction={selectedReceiptTx}
        onClose={() => setSelectedReceiptTx(null)}
      />

      <GoalModal
        isOpen={Boolean(depositGoalTarget)}
        onClose={() => setDepositGoalTarget(null)}
        depositGoal={depositGoalTarget}
      />

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};
