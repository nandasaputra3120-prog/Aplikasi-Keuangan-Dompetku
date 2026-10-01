import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Download,
  Calendar,
  Wallet as WalletIcon,
  Receipt,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, formatIndonesianDate, getMonthKey, getMonthNameIndo } from '../../utils/formatters';
import { Transaction, TransactionType } from '../../types/finance';
import { ReceiptViewerModal } from '../ReceiptViewerModal';

export const TransactionsView: React.FC = () => {
  const {
    transactions,
    categories,
    wallets,
    openTransactionModal,
    exportToCSV,
    hideBalances,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  // Available months from transactions
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((tx) => {
      try {
        set.add(getMonthKey(new Date(tx.date)));
      } catch {
        // ignore
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const noteMatch = (tx.note || '').toLowerCase().includes(query);
        const tagMatch = tx.tags?.some((t) => t.toLowerCase().includes(query));
        const amountMatch = String(tx.amount).includes(query);
        if (!noteMatch && !tagMatch && !amountMatch) return false;
      }

      // Type
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Wallet
      if (selectedWalletId !== 'all') {
        if (tx.walletId !== selectedWalletId && tx.toWalletId !== selectedWalletId) return false;
      }

      // Category
      if (selectedCategoryId !== 'all' && tx.categoryId !== selectedCategoryId) return false;

      // Month
      if (selectedMonth !== 'all') {
        try {
          if (getMonthKey(new Date(tx.date)) !== selectedMonth) return false;
        } catch {
          return false;
        }
      }

      return true;
    });
  }, [transactions, searchQuery, selectedType, selectedWalletId, selectedCategoryId, selectedMonth]);

  // Filtered Totals
  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  // Group by day
  const groupedTransactions = useMemo(() => {
    const groups: { [dateStr: string]: Transaction[] } = {};
    filteredTransactions.forEach((tx) => {
      const dateKey = tx.date.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header with Title and CSV export */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Catatan Transaksi</h2>
          <span className="text-xs text-slate-400">
            {filteredTransactions.length} transaksi tercatat
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            title="Ekspor ke Excel / CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-emerald-400 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>
          <button
            onClick={() => openTransactionModal()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Catat
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Cari transaksi, toko, keterangan, #tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            &times;
          </button>
        )}
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'expense', label: 'Pengeluaran' },
          { id: 'income', label: 'Pemasukan' },
          { id: 'transfer', label: 'Transfer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === tab.id
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Secondary Dropdown Filters: Wallet & Month */}
      <div className="grid grid-cols-2 gap-2">
        <select
          value={selectedWalletId}
          onChange={(e) => setSelectedWalletId(e.target.value)}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500"
        >
          <option value="all">Semua Rekening & Dompet</option>
          {wallets.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500"
        >
          <option value="all">Semua Periode Bulan</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {getMonthNameIndo(m)}
            </option>
          ))}
        </select>
      </div>

      {/* Filtered Totals Summary Card */}
      <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
        <div>
          <span className="text-[10px] text-slate-400 block">Total Pemasukan</span>
          <span className="text-sm font-mono font-bold text-emerald-400">
            {hideBalances ? '••••••' : `+${formatRupiah(totalIncome)}`}
          </span>
        </div>
        <div className="border-l border-slate-800 pl-3">
          <span className="text-[10px] text-slate-400 block">Total Pengeluaran</span>
          <span className="text-sm font-mono font-bold text-rose-400">
            {hideBalances ? '••••••' : `-${formatRupiah(totalExpense)}`}
          </span>
        </div>
      </div>

      {/* Grouped Transaction List */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
          Tidak ada transaksi yang cocok dengan filter yang dipilih.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedTransactions).map(([dateKey, txList]) => {
            const dateObj = new Date(dateKey);
            const dateLabel = formatIndonesianDate(txList[0].date).split(',')[0];

            return (
              <div key={dateKey} className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 px-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{dateLabel}</span>
                  <span className="text-slate-600 font-normal">({txList.length})</span>
                </div>

                <div className="space-y-1.5">
                  {txList.map((tx) => {
                    const cat = categories.find((c) => c.id === tx.categoryId);
                    const wallet = wallets.find((w) => w.id === tx.walletId);
                    const toWallet = tx.toWalletId
                      ? wallets.find((w) => w.id === tx.toWalletId)
                      : null;
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
                              <span>
                                {isTransfer && toWallet
                                  ? `${wallet?.name} ➔ ${toWallet?.name}`
                                  : wallet?.name || 'Dompet'}
                              </span>
                              <span>·</span>
                              <span>
                                {new Date(tx.date).toLocaleTimeString('id-ID', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {tx.tags && tx.tags.length > 0 && (
                              <div className="flex gap-1 mt-1">
                                {tx.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-[9px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-2">
                          {tx.receiptImage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptTx(tx);
                              }}
                              className="p-1 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700"
                              title="Lihat Foto Struk"
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
              </div>
            );
          })}
        </div>
      )}

      <ReceiptViewerModal transaction={receiptTx} onClose={() => setReceiptTx(null)} />
    </div>
  );
};
