import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, CreditCard, Building2, Smartphone, TrendingUp, Banknote } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Wallet, WalletType } from '../types/finance';
import { parseRupiahInput } from '../utils/formatters';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletToEdit?: Wallet | null;
}

const COLOR_PRESETS = [
  '#10b981', // emerald
  '#0284c7', // sky
  '#2563eb', // blue
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ec4899', // pink
  '#64748b', // slate
];

const PRESET_ACCOUNTS = [
  { name: 'Bank BCA', type: 'bank' as WalletType, color: '#0284c7', institution: 'BCA' },
  { name: 'Bank Mandiri', type: 'bank' as WalletType, color: '#2563eb', institution: 'Mandiri' },
  { name: 'Bank BRI', type: 'bank' as WalletType, color: '#0284c7', institution: 'BRI' },
  { name: 'Bank BNI', type: 'bank' as WalletType, color: '#f97316', institution: 'BNI' },
  { name: 'Bank Jago', type: 'bank' as WalletType, color: '#f59e0b', institution: 'Bank Jago' },
  { name: 'Bank Syariah (BSI)', type: 'bank' as WalletType, color: '#059669', institution: 'BSI' },
  { name: 'GoPay', type: 'ewallet' as WalletType, color: '#06b6d4', institution: 'GoTo' },
  { name: 'DANA', type: 'ewallet' as WalletType, color: '#3b82f6', institution: 'DANA' },
  { name: 'OVO', type: 'ewallet' as WalletType, color: '#7c3aed', institution: 'OVO' },
  { name: 'ShopeePay', type: 'ewallet' as WalletType, color: '#ea580c', institution: 'Shopee' },
  { name: 'Bibit / Reksadana', type: 'investment' as WalletType, color: '#8b5cf6', institution: 'Bibit' },
  { name: 'Kas Tunai Dompet', type: 'cash' as WalletType, color: '#10b981', institution: 'Tunai' },
];

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, walletToEdit }) => {
  const { addWallet, updateWallet, deleteWallet } = useFinance();

  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [balanceStr, setBalanceStr] = useState('');
  const [color, setColor] = useState('#10b981');
  const [accountNumber, setAccountNumber] = useState('');
  const [institution, setInstitution] = useState('');

  useEffect(() => {
    if (walletToEdit) {
      setName(walletToEdit.name);
      setType(walletToEdit.type);
      setBalanceStr(String(walletToEdit.balance));
      setColor(walletToEdit.color);
      setAccountNumber(walletToEdit.accountNumber || '');
      setInstitution(walletToEdit.institution || '');
    } else {
      setName('');
      setType('bank');
      setBalanceStr('0');
      setColor('#0284c7');
      setAccountNumber('');
      setInstitution('');
    }
  }, [walletToEdit, isOpen]);

  if (!isOpen) return null;

  const currentBalance = parseRupiahInput(balanceStr);

  const handleSelectPreset = (preset: typeof PRESET_ACCOUNTS[0]) => {
    setName(preset.name);
    setType(preset.type);
    setColor(preset.color);
    setInstitution(preset.institution);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama rekening/dompet harus diisi');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      balance: currentBalance,
      icon: type === 'cash' ? 'Banknote' : type === 'ewallet' ? 'Smartphone' : type === 'investment' ? 'TrendingUp' : 'CreditCard',
      color,
      accountNumber: accountNumber.trim() || undefined,
      institution: institution.trim() || undefined,
    };

    if (walletToEdit) {
      updateWallet(walletToEdit.id, payload);
    } else {
      addWallet(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">
            {walletToEdit ? 'Ubah Rekening / Dompet' : 'Tambah Rekening Baru'}
          </h2>
          <div className="flex items-center gap-2">
            {walletToEdit && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Hapus rekening ini?')) {
                    deleteWallet(walletToEdit.id);
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Quick Presets */}
          {!walletToEdit && (
            <div>
              <span className="text-xs font-semibold text-slate-300 block mb-2">Preset Rekening & E-Wallet Populer</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {PRESET_ACCOUNTS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-all active:scale-95"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallet Name */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Nama Dompet / Rekening</label>
            <input
              type="text"
              required
              placeholder="Contoh: BCA Gaji, GoPay Pribadi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Wallet Type */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Tipe Akun</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'bank', label: 'Bank', icon: Building2 },
                { id: 'ewallet', label: 'E-Wallet', icon: Smartphone },
                { id: 'cash', label: 'Tunai', icon: Banknote },
                { id: 'investment', label: 'Investasi', icon: TrendingUp },
              ].map((item) => {
                const isSelected = type === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as WalletType)}
                    className={`py-2 px-1 flex flex-col items-center justify-center rounded-xl border text-xs gap-1 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-semibold'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Saldo Saat Ini (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              value={balanceStr ? new Intl.NumberFormat('id-ID').format(currentBalance) : '0'}
              onChange={(e) => setBalanceStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-base font-mono font-bold text-white focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Account Number & Color */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nomor Rekening / No HP</label>
              <input
                type="text"
                placeholder="Opsional (cth: 0812..)"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Warna Kartu</label>
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-white scale-110' : 'opacity-80'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {walletToEdit ? 'Simpan Rekening' : 'Tambah Rekening'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
