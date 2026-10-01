import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, PiggyBank, Target, Calendar, Sparkles } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal } from '../types/finance';
import { parseRupiahInput, formatRupiah } from '../utils/formatters';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: SavingsGoal | null;
  depositGoal?: SavingsGoal | null; // If opening directly to deposit
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  goalToEdit,
  depositGoal,
}) => {
  const { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, depositToSavingsGoal, wallets } = useFinance();

  const isDepositMode = Boolean(depositGoal);

  // Form states for Goal create/edit
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('0');
  const [targetDate, setTargetDate] = useState('');
  const [color, setColor] = useState('#10b981');
  const [note, setNote] = useState('');

  // Form states for Deposit
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [sourceWalletId, setSourceWalletId] = useState('');

  useEffect(() => {
    if (depositGoal) {
      setDepositAmountStr('');
      setSourceWalletId(wallets[0]?.id || '');
    } else if (goalToEdit) {
      setTitle(goalToEdit.title);
      setTargetAmountStr(String(goalToEdit.targetAmount));
      setCurrentAmountStr(String(goalToEdit.currentAmount));
      setTargetDate(goalToEdit.targetDate);
      setColor(goalToEdit.color);
      setNote(goalToEdit.note || '');
    } else {
      setTitle('');
      setTargetAmountStr('5000000');
      setCurrentAmountStr('0');
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setTargetDate(future.toISOString().split('T')[0]);
      setColor('#3b82f6');
      setNote('');
    }
  }, [goalToEdit, depositGoal, isOpen, wallets]);

  if (!isOpen) return null;

  const currentTarget = parseRupiahInput(targetAmountStr);
  const currentInitial = parseRupiahInput(currentAmountStr);
  const currentDeposit = parseRupiahInput(depositAmountStr);

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    if (currentDeposit <= 0) {
      alert('Masukkan nominal setoran tabungan yang valid.');
      return;
    }

    depositToSavingsGoal(depositGoal.id, currentDeposit, sourceWalletId || undefined);
    onClose();
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Tuliskan nama impian/target tabungan.');
      return;
    }
    if (currentTarget <= 0) {
      alert('Masukkan target nominal yang ingin dicapai.');
      return;
    }

    const payload = {
      title: title.trim(),
      targetAmount: currentTarget,
      currentAmount: currentInitial,
      targetDate: targetDate || new Date().toISOString().split('T')[0],
      icon: 'Target',
      color,
      note: note.trim() || undefined,
    };

    if (goalToEdit) {
      updateSavingsGoal(goalToEdit.id, payload);
    } else {
      addSavingsGoal(payload);
    }
    onClose();
  };

  if (isDepositMode && depositGoal) {
    const remaining = Math.max(0, depositGoal.targetAmount - depositGoal.currentAmount);

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
              Setor Tabungan Impian
            </h2>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleDepositSubmit} className="p-5 space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400">Target Impian:</div>
              <div className="text-sm font-bold text-white mt-0.5">{depositGoal.title}</div>
              <div className="text-xs text-slate-400 mt-1 flex justify-between">
                <span>Terkumpul: {formatRupiah(depositGoal.currentAmount)}</span>
                <span className="text-emerald-400">Sisa: {formatRupiah(remaining)}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nominal Setoran (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                placeholder="0"
                value={depositAmountStr ? new Intl.NumberFormat('id-ID').format(currentDeposit) : ''}
                onChange={(e) => setDepositAmountStr(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xl font-mono font-bold text-white focus:border-emerald-500 outline-none text-center"
              />
              <div className="flex gap-2 mt-2 justify-center">
                {[50000, 100000, 250000, 500000, 1000000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDepositAmountStr(String(v))}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 rounded-lg active:scale-95"
                  >
                    +{v >= 1000000 ? `${v / 1000000} Jt` : `${v / 1000} Rb`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Potong dari Rekening / Dompet (Opsional)
              </label>
              <select
                value={sourceWalletId}
                onChange={(e) => setSourceWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
              >
                <option value="">Jangan potong dompet (Catat manual saja)</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Saldo: {formatRupiah(w.balance, true)})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Simpan Setoran Tabungan
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
            <Target className="w-5 h-5 text-emerald-400" />
            {goalToEdit ? 'Ubah Target Impian' : 'Buat Target Impian Baru'}
          </h2>
          <div className="flex items-center gap-2">
            {goalToEdit && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus target impian ini?')) {
                    deleteSavingsGoal(goalToEdit.id);
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

        <form onSubmit={handleGoalSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Impian / Goal</label>
            <input
              type="text"
              required
              placeholder="Contoh: Dana Darurat, Beli Motor, Liburan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Nominal (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={targetAmountStr ? new Intl.NumberFormat('id-ID').format(currentTarget) : '0'}
                onChange={(e) => setTargetAmountStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Sudah Terkumpul (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                value={currentAmountStr ? new Intl.NumberFormat('id-ID').format(currentInitial) : '0'}
                onChange={(e) => setCurrentAmountStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-emerald-400 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Target Tanggal Tercapai
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Warna Kartu</label>
            <div className="flex gap-2">
              {['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full ${color === c ? 'ring-2 ring-white scale-110' : 'opacity-80'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              placeholder="Contoh: Rencana nabung Rp 500rb per bulan"
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
              {goalToEdit ? 'Simpan Target' : 'Buat Target Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
