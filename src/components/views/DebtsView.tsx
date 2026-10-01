import React, { useState } from 'react';
import {
  HandCoins,
  Plus,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, formatIndonesianDate, generateWhatsAppReminder } from '../../utils/formatters';
import { Debt, DebtType } from '../../types/finance';
import { DebtModal } from '../DebtModal';

export const DebtsView: React.FC = () => {
  const { debts, hideBalances } = useFinance();

  const [activeType, setActiveType] = useState<DebtType>('loan'); // 'loan' = Piutang (Saya dipinjam), 'debt' = Hutang (Saya meminjam)
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [selectedDebtToEdit, setSelectedDebtToEdit] = useState<Debt | null>(null);
  const [payTargetDebt, setPayTargetDebt] = useState<Debt | null>(null);
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);

  const filteredDebts = debts.filter((d) => d.type === activeType);

  // Totals
  const totalPrincipal = filteredDebts.reduce((acc, d) => acc + d.amount, 0);
  const totalPaid = filteredDebts.reduce((acc, d) => acc + d.paidAmount, 0);
  const totalRemaining = Math.max(0, totalPrincipal - totalPaid);

  const handleSendReminderWA = (debt: Debt) => {
    const remaining = debt.amount - debt.paidAmount;
    const text = generateWhatsAppReminder(debt.personName, remaining, debt.dueDate, debt.note);
    const phone = (debt.phoneNumber || '').replace(/^0/, '62').replace(/[^0-9]/g, '');
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Sub Tabs: Piutang vs Hutang */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveType('loan')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeType === 'loan'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Piutang (Orang Pinjam)
        </button>
        <button
          onClick={() => setActiveType('debt')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeType === 'debt'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Hutang (Saya Berhutang)
        </button>
      </div>

      {/* Summary Card */}
      <div
        className={`p-5 rounded-3xl border ${
          activeType === 'loan'
            ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-900/40'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/30 border-rose-900/40'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>{activeType === 'loan' ? 'Total Sisa Piutang Belum Ditagih' : 'Total Sisa Hutang Wajib Dibayar'}</span>
          <span className="font-mono text-white text-xs font-semibold">
            {filteredDebts.filter((d) => d.paidAmount < d.amount).length} Aktif
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-bold font-mono text-white">
          {hideBalances ? '••••••' : formatRupiah(totalRemaining)}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <span>Total Keseluruhan: {hideBalances ? '••••' : formatRupiah(totalPrincipal)}</span>
          <span className="text-emerald-400 font-semibold">
            Sudah Terbayar: {hideBalances ? '••••' : formatRupiah(totalPaid)}
          </span>
        </div>
      </div>

      {/* List Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-white">
          {activeType === 'loan' ? 'Daftar Tagihan Piutang' : 'Daftar Kewajiban Hutang'}
        </h3>
        <button
          onClick={() => {
            setSelectedDebtToEdit(null);
            setIsDebtModalOpen(true);
          }}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" /> Catat {activeType === 'loan' ? 'Piutang' : 'Hutang'}
        </button>
      </div>

      {/* Debt List */}
      {filteredDebts.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          {activeType === 'loan'
            ? 'Tidak ada catatan piutang aktif. Semua tagihan sudah lunas atau belum dicatat.'
            : 'Hebat! Anda tidak memiliki catatan tanggungan hutang aktif.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.map((debt) => {
            const isFullyPaid = debt.paidAmount >= debt.amount;
            const remaining = Math.max(0, debt.amount - debt.paidAmount);
            const isExpanded = expandedDebtId === debt.id;
            const isOverdue = !isFullyPaid && new Date(debt.dueDate) < new Date();

            return (
              <div
                key={debt.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white">{debt.personName}</h4>
                      {isFullyPaid ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Lunas
                        </span>
                      ) : isOverdue ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> Jatuh Tempo
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> Aktif
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        Jatuh Tempo: {formatIndonesianDate(debt.dueDate).split(',')[0]}
                      </span>
                      {debt.phoneNumber && (
                        <span className="flex items-center gap-0.5 text-slate-500 font-mono">
                          <Phone className="w-3 h-3" /> {debt.phoneNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Sisa Tagihan</span>
                    <span
                      className={`text-sm font-mono font-bold ${
                        isFullyPaid ? 'text-slate-500 line-through' : 'text-white'
                      }`}
                    >
                      {hideBalances ? '••••••' : formatRupiah(remaining)}
                    </span>
                  </div>
                </div>

                {debt.note && (
                  <p className="text-xs text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
                    {debt.note}
                  </p>
                )}

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.round((debt.paidAmount / debt.amount) * 100))}%`,
                    }}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setExpandedDebtId(isExpanded ? null : debt.id)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Riwayat Cicilan ({debt.payments?.length || 0})</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-2">
                    {/* WhatsApp reminder button if piutang */}
                    {activeType === 'loan' && !isFullyPaid && (
                      <button
                        onClick={() => handleSendReminderWA(debt)}
                        className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 border border-emerald-800/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
                        title="Kirim Pesan Pengingat WhatsApp"
                      >
                        <Send className="w-3 h-3" />
                        <span>Tagih WA</span>
                      </button>
                    )}

                    {!isFullyPaid && (
                      <button
                        onClick={() => setPayTargetDebt(debt)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 shadow-md shadow-emerald-500/20"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{activeType === 'debt' ? 'Bayar Cicilan' : 'Terima Pembayaran'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Accordion: Payment History */}
                {isExpanded && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 block">Riwayat Transaksi:</span>
                    {(!debt.payments || debt.payments.length === 0) ? (
                      <div className="text-xs text-slate-500 py-2">Belum ada pembayaran atau cicilan tercatat.</div>
                    ) : (
                      debt.payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs p-2 bg-slate-950/60 rounded-xl border border-slate-800"
                        >
                          <div>
                            <span className="font-semibold text-emerald-400">+{formatRupiah(p.amount)}</span>
                            {p.note && <span className="text-slate-400 ml-2">({p.note})</span>}
                          </div>
                          <span className="text-[10px] text-slate-500">{formatIndonesianDate(p.date)}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Debt Modals */}
      <DebtModal
        isOpen={isDebtModalOpen || Boolean(payTargetDebt)}
        onClose={() => {
          setIsDebtModalOpen(false);
          setSelectedDebtToEdit(null);
          setPayTargetDebt(null);
        }}
        debtToEdit={selectedDebtToEdit}
        payTargetDebt={payTargetDebt}
      />
    </div>
  );
};
