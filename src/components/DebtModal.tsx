import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, HandCoins, User, Calendar, Phone, DollarSign } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Debt, DebtType } from '../types/finance';
import { parseRupiahInput, formatRupiah } from '../utils/formatters';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtToEdit?: Debt | null;
  payTargetDebt?: Debt | null; // If directly opening to record installment
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  debtToEdit,
  payTargetDebt,
}) => {
  const { addDebt, deleteDebt, payDebt, wallets } = useFinance();

  const isPaymentMode = Boolean(payTargetDebt);

  // Form for new debt/loan
  const [type, setType] = useState<DebtType>('loan');
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  // Form for payment installment
  const [paymentAmountStr, setPaymentAmountStr] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [sourceWalletId, setSourceWalletId] = useState('');

  useEffect(() => {
    if (payTargetDebt) {
      const remaining = Math.max(0, payTargetDebt.amount - payTargetDebt.paidAmount);
      setPaymentAmountStr(String(remaining));
      setPaymentNote('');
      setSourceWalletId(wallets[0]?.id || '');
    } else if (debtToEdit) {
      setType(debtToEdit.type);
      setPersonName(debtToEdit.personName);
      setPhoneNumber(debtToEdit.phoneNumber || '');
      setAmountStr(String(debtToEdit.amount));
      setDueDate(debtToEdit.dueDate);
      setNote(debtToEdit.note || '');
    } else {
      setType('loan'); // default Piutang
      setPersonName('');
      setPhoneNumber('');
      setAmountStr('500000');
      const inTwoWeeks = new Date();
      inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
      setDueDate(inTwoWeeks.toISOString().split('T')[0]);
      setNote('');
    }
  }, [debtToEdit, payTargetDebt, isOpen, wallets]);

  if (!isOpen) return null;

  const currentAmount = parseRupiahInput(amountStr);
  const currentPayment = parseRupiahInput(paymentAmountStr);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTargetDebt) return;
    if (currentPayment <= 0) {
      alert('Masukkan nominal pembayaran/cicilan yang valid.');
      return;
    }

    payDebt(
      payTargetDebt.id,
      {
        amount: currentPayment,
        date: new Date().toISOString(),
        note: paymentNote.trim() || undefined,
      },
      sourceWalletId || undefined
    );
    onClose();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim()) {
      alert('Tuliskan nama orang / pihak terkait.');
      return;
    }
    if (currentAmount <= 0) {
      alert('Masukkan nominal hutang/piutang.');
      return;
    }

    addDebt({
      type,
      personName: personName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      amount: currentAmount,
      paidAmount: 0,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      note: note.trim() || undefined,
    });

    onClose();
  };

  if (isPaymentMode && payTargetDebt) {
    const remaining = Math.max(0, payTargetDebt.amount - payTargetDebt.paidAmount);

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              {payTargetDebt.type === 'debt' ? 'Catat Bayar Hutang' : 'Catat Terima Piutang'}
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePaymentSubmit} className="p-5 space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">
                {payTargetDebt.type === 'debt' ? 'Pemberi Pinjaman:' : 'Peminjam:'}
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{payTargetDebt.personName}</div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between">
                <span>Total: {formatRupiah(payTargetDebt.amount)}</span>
                <span className="text-amber-400 font-semibold">Sisa: {formatRupiah(remaining)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Nominal Pembayaran / Cicilan (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                value={paymentAmountStr ? new Intl.NumberFormat('id-ID').format(currentPayment) : ''}
                onChange={(e) => setPaymentAmountStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xl font-mono font-bold text-white focus:border-emerald-500 outline-none text-center"
              />
              <div className="flex gap-2 mt-2 justify-center">
                <button
                  type="button"
                  onClick={() => setPaymentAmountStr(String(remaining))}
                  className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/40 text-xs rounded-lg active:scale-95 font-medium"
                >
                  Lunasi Penuh ({formatRupiah(remaining, true)})
                </button>
                {remaining > 100000 && (
                  <button
                    type="button"
                    onClick={() => setPaymentAmountStr(String(Math.round(remaining / 2)))}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg active:scale-95"
                  >
                    Setengah ({formatRupiah(Math.round(remaining / 2), true)})
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {payTargetDebt.type === 'debt'
                  ? 'Potong dari Rekening (Otomatis Catat Transaksi)'
                  : 'Masuk ke Rekening (Otomatis Catat Pemasukan)'}
              </label>
              <select
                value={sourceWalletId}
                onChange={(e) => setSourceWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
              >
                <option value="">Jangan ubah saldo dompet (Catat status saja)</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(w.balance, true)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Catatan Cicilan</label>
              <input
                type="text"
                placeholder="Contoh: Cicilan ke-1 transfer Mandiri"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Simpan Pembayaran
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-emerald-400" />
            Catat Hutang / Piutang Baru
          </h2>
          <div className="flex items-center gap-2">
            {debtToEdit && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus catatan ini?')) {
                    deleteDebt(debtToEdit.id);
                    onClose();
                  }
                }}
                className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Debt vs Loan Segmented Control */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('loan')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                type === 'loan'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Piutang (Orang Pinjam)
            </button>
            <button
              type="button"
              onClick={() => setType('debt')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                type === 'debt'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hutang (Saya Pinjam)
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {type === 'loan' ? 'Nama Peminjam (Teman/Keluarga)' : 'Nama Pemberi Pinjaman'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso, Tokopedia PayLater"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nominal (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={amountStr ? new Intl.NumberFormat('id-ID').format(currentAmount) : '0'}
              onChange={(e) => setAmountStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-bold text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Jatuh Tempo
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                placeholder="0812..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Keterangan / Keperluan</label>
            <textarea
              rows={2}
              placeholder="Contoh: Talangan beli bensin atau servis motor"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Simpan Catatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
