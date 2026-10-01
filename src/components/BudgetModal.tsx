import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, ShieldAlert } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Budget } from '../types/finance';
import { parseRupiahInput, getMonthKey } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetToEdit?: Budget | null;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, budgetToEdit }) => {
  const { categories, addBudget, updateBudget, deleteBudget, budgets } = useFinance();

  const [categoryId, setCategoryId] = useState('');
  const [limitStr, setLimitStr] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  useEffect(() => {
    if (budgetToEdit) {
      setCategoryId(budgetToEdit.categoryId);
      setLimitStr(String(budgetToEdit.monthlyLimit));
    } else {
      // Pick first unbudgeted category or first
      const existingCategoryIds = budgets.map((b) => b.categoryId);
      const available = expenseCategories.find((c) => !existingCategoryIds.includes(c.id));
      setCategoryId(available?.id || expenseCategories[0]?.id || '');
      setLimitStr('1000000');
    }
  }, [budgetToEdit, isOpen, budgets, expenseCategories]);

  if (!isOpen) return null;

  const currentLimit = parseRupiahInput(limitStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert('Pilih kategori untuk anggaran.');
      return;
    }
    if (currentLimit <= 0) {
      alert('Masukkan batas nominal anggaran bulanan.');
      return;
    }

    if (budgetToEdit) {
      updateBudget(budgetToEdit.id, currentLimit);
    } else {
      addBudget({
        categoryId,
        monthlyLimit: currentLimit,
        month: getMonthKey(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            {budgetToEdit ? 'Ubah Batas Anggaran' : 'Pasang Anggaran Kategori'}
          </h2>
          <div className="flex items-center gap-2">
            {budgetToEdit && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus anggaran ini?')) {
                    deleteBudget(budgetToEdit.id);
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Kategori Pengeluaran</label>
            <select
              value={categoryId}
              disabled={Boolean(budgetToEdit)}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-emerald-500 outline-none disabled:opacity-60"
            >
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Batas Maksimal Bulanan (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={limitStr ? new Intl.NumberFormat('id-ID').format(currentLimit) : '0'}
              onChange={(e) => setLimitStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-lg font-mono font-bold text-white focus:border-emerald-500 outline-none"
            />
            <div className="flex gap-2 mt-2">
              {[500000, 1000000, 2000000, 5000000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLimitStr(String(v))}
                  className="px-2.5 py-1 bg-slate-800 text-[11px] text-slate-300 rounded-lg hover:bg-slate-700 active:scale-95"
                >
                  +{v >= 1000000 ? `${v / 1000000} Jt` : `${v / 1000} Rb`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl flex items-start gap-2 text-xs text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              Aplikasi akan memantau pengeluaran Anda di kategori ini dan memberikan indikator visual saat mendekati batas.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {budgetToEdit ? 'Simpan Anggaran' : 'Aktifkan Anggaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
