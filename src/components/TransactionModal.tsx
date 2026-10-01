import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  Calendar,
  Wallet as WalletIcon,
  Tag,
  Camera,
  Image as ImageIcon,
  Check,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { TransactionType } from '../types/finance';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';

export const TransactionModal: React.FC = () => {
  const {
    isTransactionModalOpen,
    closeTransactionModal,
    editingTransaction,
    wallets,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [walletId, setWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [adminFeeStr, setAdminFeeStr] = useState<string>('0');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [receiptImage, setReceiptImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize modal state on open/edit
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmountStr(String(editingTransaction.amount));
      setWalletId(editingTransaction.walletId);
      setToWalletId(editingTransaction.toWalletId || '');
      setAdminFeeStr(String(editingTransaction.adminFee || 0));
      setCategoryId(editingTransaction.categoryId);
      setDate(editingTransaction.date.slice(0, 16));
      setNote(editingTransaction.note || '');
      setTags(editingTransaction.tags || []);
      setReceiptImage(editingTransaction.receiptImage);
    } else {
      setType('expense');
      setAmountStr('');
      setWalletId(wallets[0]?.id || '');
      setToWalletId(wallets[1]?.id || '');
      setAdminFeeStr('0');
      // Default to first expense category
      const defaultCat = categories.find((c) => c.type === 'expense');
      setCategoryId(defaultCat?.id || categories[0]?.id || '');
      // Current date in YYYY-MM-DDTHH:mm
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDate(localIso);
      setNote('');
      setTags([]);
      setReceiptImage(undefined);
    }
  }, [editingTransaction, isTransactionModalOpen, wallets, categories]);

  // Adjust category if type changes
  useEffect(() => {
    if (type !== 'transfer') {
      const match = categories.find((c) => c.type === type);
      if (match) setCategoryId(match.id);
    }
  }, [type, categories]);

  if (!isTransactionModalOpen) return null;

  const currentAmount = parseRupiahInput(amountStr);
  const filteredCategories = categories.filter((c) => c.type === type);

  const handleQuickAdd = (value: number) => {
    const next = currentAmount + value;
    setAmountStr(String(next));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Mock Receipt Scanner for quick autofill demo
  const handleAutoScanSampleReceipt = () => {
    setAmountStr('85000');
    setNote('Minimarket Indomaret - Susu & Roti');
    setType('expense');
    const groceryCat = categories.find((c) => c.id === 'cat-groceries');
    if (groceryCat) setCategoryId(groceryCat.id);
    setTags(['indomaret', 'struk-scan']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentAmount <= 0) {
      alert('Masukkan nominal transaksi yang valid.');
      return;
    }
    if (!walletId) {
      alert('Pilih rekening/dompet asal.');
      return;
    }
    if (type === 'transfer' && (!toWalletId || toWalletId === walletId)) {
      alert('Pilih dompet tujuan yang berbeda.');
      return;
    }

    const payload = {
      type,
      amount: currentAmount,
      walletId,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      adminFee: type === 'transfer' ? parseRupiahInput(adminFeeStr) : undefined,
      categoryId: type === 'transfer' ? 'cat-other-exp' : categoryId,
      date: new Date(date).toISOString(),
      note: note.trim(),
      receiptImage,
      tags,
    };

    if (editingTransaction) {
      updateTransaction(editingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    closeTransactionModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer Drag Indicator */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            {editingTransaction ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Baru'}
          </h2>
          <div className="flex items-center gap-2">
            {editingTransaction && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus transaksi ini? Saldo dompet akan disesuaikan kembali.')) {
                    deleteTransaction(editingTransaction.id);
                    closeTransactionModal();
                  }
                }}
                className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Hapus Transaksi"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={closeTransactionModal}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Form Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Segmented Type Selector */}
          <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                type === 'transfer'
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Repeat className="w-3.5 h-3.5" />
              Transfer
            </button>
          </div>

          {/* Big Amount Input */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Nominal Transaksi</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-2xl sm:text-3xl font-bold font-mono text-white">
              <span className="text-slate-500 text-xl font-normal">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={amountStr ? new Intl.NumberFormat('id-ID').format(currentAmount) : ''}
                onChange={(e) => setAmountStr(e.target.value)}
                autoFocus
                className="w-full text-center bg-transparent border-none outline-none font-bold text-white placeholder-slate-600 focus:ring-0"
              />
            </div>

            {/* Quick Add Chips */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
              {[
                { label: '+10rb', val: 10000 },
                { label: '+20rb', val: 20000 },
                { label: '+50rb', val: 50000 },
                { label: '+100rb', val: 100000 },
                { label: '+500rb', val: 500000 },
              ].map((chip) => (
                <button
                  key={chip.val}
                  type="button"
                  onClick={() => handleQuickAdd(chip.val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white active:scale-95 transition-all"
                >
                  {chip.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="px-2 py-1 text-xs font-medium bg-rose-950/40 text-rose-400 rounded-lg hover:bg-rose-900/60 active:scale-95"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Wallet Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
              {type === 'transfer' ? 'Dari Dompet (Sumber)' : 'Dompet / Rekening'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {wallets.map((w) => {
                const isSelected = walletId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setWalletId(w.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 text-white'
                        : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: w.color || '#10b981' }}
                    />
                    <div className="truncate flex-1">
                      <div className="text-xs font-medium truncate">{w.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                        {formatRupiah(w.balance, true)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transfer Target Wallet & Fee */}
          {type === 'transfer' && (
            <div className="p-3 bg-slate-950/60 rounded-2xl border border-sky-900/40 space-y-3">
              <div>
                <label className="text-xs font-semibold text-sky-300 block mb-1">Ke Dompet (Tujuan)</label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-sky-500"
                >
                  <option value="">-- Pilih Dompet Tujuan --</option>
                  {wallets
                    .filter((w) => w.id !== walletId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatRupiah(w.balance, true)})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Biaya Admin Transfer / Top-up (Rp)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={adminFeeStr ? new Intl.NumberFormat('id-ID').format(parseRupiahInput(adminFeeStr)) : '0'}
                  onChange={(e) => setAdminFeeStr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  placeholder="Contoh: 1.000 atau 2.500"
                />
              </div>
            </div>
          )}

          {/* Category Selector (Only for Expense & Income) */}
          {type !== 'transfer' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Kategori</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {filteredCategories.map((c) => {
                  const isSelected = categoryId === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategoryId(c.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs text-left transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-950/30 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/40'
                      }`}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal & Waktu
              </label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Catatan / Keterangan</label>
              <input
                type="text"
                placeholder="Contoh: Makan siang bareng tim"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Tagar / Label (Opsional)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ketik tag lalu tekan enter (cth: kantor)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium rounded-xl"
              >
                + Tag
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 text-slate-300 text-[11px] rounded-lg"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Receipt Attachment / Mock Scanner */}
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                Lampirkan Struk / Kuitansi
              </span>
              <button
                type="button"
                onClick={handleAutoScanSampleReceipt}
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Simulasi Scan OCR Struk
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {receiptImage ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-40 bg-black flex items-center justify-center">
                <img
                  src={receiptImage}
                  alt="Struk Pembayaran"
                  className="max-h-40 object-contain w-auto"
                />
                <button
                  type="button"
                  onClick={() => setReceiptImage(undefined)}
                  className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-lg hover:bg-rose-500 shadow"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2.5 px-3 border border-dashed border-slate-700 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-slate-400" />
                  Pilih Foto dari Galeri / Kamera
                </button>
              </div>
            )}
          </div>

          {/* Sticky Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {editingTransaction ? 'Simpan Perubahan' : 'Catat Transaksi Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
