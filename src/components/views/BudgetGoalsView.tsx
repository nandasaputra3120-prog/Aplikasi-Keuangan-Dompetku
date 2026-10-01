import React, { useState } from 'react';
import {
  Target,
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatRupiah, getMonthKey } from '../../utils/formatters';
import { Budget, SavingsGoal } from '../../types/finance';
import { BudgetModal } from '../BudgetModal';
import { GoalModal } from '../GoalModal';

export const BudgetGoalsView: React.FC = () => {
  const {
    budgets,
    savingsGoals,
    categories,
    transactions,
    hideBalances,
    monthlyExpense,
    triggerConfetti,
  } = useFinance();

  const [activeSubTab, setActiveSubTab] = useState<'budget' | 'goals'>('budget');
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [depositGoalTarget, setDepositGoalTarget] = useState<SavingsGoal | null>(null);

  const currentMonthKey = getMonthKey();

  // Calculate spent amount per category this month
  const categoryExpenses = transactions
    .filter((tx) => {
      try {
        return tx.type === 'expense' && getMonthKey(new Date(tx.date)) === currentMonthKey;
      } catch {
        return false;
      }
    })
    .reduce<{ [catId: string]: number }>((acc, tx) => {
      acc[tx.categoryId] = (acc[tx.categoryId] || 0) + tx.amount;
      return acc;
    }, {});

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalBudgetSpent = budgets.reduce(
    (acc, b) => acc + (categoryExpenses[b.categoryId] || 0),
    0
  );
  const totalBudgetPercent = totalBudgetLimit > 0 ? Math.round((totalBudgetSpent / totalBudgetLimit) * 100) : 0;

  // Goals aggregates
  const totalGoalTarget = savingsGoals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalGoalCurrent = savingsGoals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalGoalPercent = totalGoalTarget > 0 ? Math.round((totalGoalCurrent / totalGoalTarget) * 100) : 0;

  return (
    <div className="space-y-4 pb-6">
      {/* Sub-tab Navigation */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('budget')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'budget'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Target className="w-4 h-4" />
          Anggaran Bulanan
        </button>
        <button
          onClick={() => setActiveSubTab('goals')}
          className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            activeSubTab === 'goals'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          Target Impian ({savingsGoals.length})
        </button>
      </div>

      {/* VIEW 1: ANGGARAN BULANAN */}
      {activeSubTab === 'budget' && (
        <div className="space-y-4">
          {/* Overall Budget Status Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 rounded-3xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Alokasi Anggaran Bulan Ini</span>
              <span className="font-mono text-emerald-400 font-bold">{totalBudgetPercent}%</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">
                {hideBalances ? '••••••' : formatRupiah(totalBudgetSpent)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                dari {hideBalances ? '••••' : formatRupiah(totalBudgetLimit)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalBudgetPercent > 100
                    ? 'bg-rose-500'
                    : totalBudgetPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, totalBudgetPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
              <span>Sisa Alokasi: {hideBalances ? '••••' : formatRupiah(Math.max(0, totalBudgetLimit - totalBudgetSpent))}</span>
              {totalBudgetSpent > totalBudgetLimit && (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Over Budget!
                </span>
              )}
            </div>
          </div>

          {/* Budget List Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white">Daftar Anggaran Kategori</h3>
            <button
              onClick={() => {
                setSelectedBudget(null);
                setBudgetModalOpen(true);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Pasang Anggaran
            </button>
          </div>

          {/* Budget Items */}
          {budgets.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              Belum ada kategori yang dianggarkan. Tekan "+ Pasang Anggaran" untuk mengatur batasan pengeluaran bulanan.
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => {
                const cat = categories.find((c) => c.id === budget.categoryId);
                const spent = categoryExpenses[budget.categoryId] || 0;
                const percent = Math.round((spent / budget.monthlyLimit) * 100);
                const remaining = budget.monthlyLimit - spent;
                const isOver = percent > 100;
                const isWarning = percent >= 80 && !isOver;

                return (
                  <div
                    key={budget.id}
                    onClick={() => {
                      setSelectedBudget(budget);
                      setBudgetModalOpen(true);
                    }}
                    className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl hover:border-slate-700 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: cat?.color || '#10b981' }}
                        />
                        <span className="text-xs font-bold text-white">{cat?.name || 'Kategori'}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`font-mono font-bold ${
                            isOver ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {percent}%
                        </span>
                        <span className="text-slate-500">terpakai</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400 font-mono">
                      <span>Terpakai: {hideBalances ? '••••' : formatRupiah(spent)}</span>
                      <span>
                        {remaining >= 0 ? (
                          <span className="text-slate-400">Sisa: {hideBalances ? '••••' : formatRupiah(remaining)}</span>
                        ) : (
                          <span className="text-rose-400 font-semibold">
                            Lebih: {hideBalances ? '••••' : formatRupiah(Math.abs(remaining))}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: TARGET IMPIAN (SAVINGS GOALS) */}
      {activeSubTab === 'goals' && (
        <div className="space-y-4">
          {/* Overall Goal Card */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/30 border border-slate-800 rounded-3xl">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Progres Semua Impian</span>
              <span className="font-mono text-sky-400 font-bold">{totalGoalPercent}%</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">
                {hideBalances ? '••••••' : formatRupiah(totalGoalCurrent)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Target {hideBalances ? '••••' : formatRupiah(totalGoalTarget)}
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden mt-3">
              <div
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, totalGoalPercent)}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white">Daftar Impian Anda</h3>
            <button
              onClick={() => {
                setSelectedGoal(null);
                setGoalModalOpen(true);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Buat Impian Baru
            </button>
          </div>

          {/* Goal Cards */}
          {savingsGoals.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              Belum ada target impian. Buat target seperti DP Rumah, Gadget, atau Liburan sekarang!
            </div>
          ) : (
            <div className="space-y-3">
              {savingsGoals.map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100)
                );
                const isFinished = percent >= 100;
                const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

                return (
                  <div
                    key={goal.id}
                    className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                          style={{ backgroundColor: goal.color }}
                        >
                          <PiggyBank className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{goal.title}</h4>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>Target: {goal.targetDate || 'Fleksibel'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isFinished ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-800/40">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Tercapai!
                          </span>
                        ) : (
                          <button
                            onClick={() => setDepositGoalTarget(goal)}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl active:scale-95 shadow-md shadow-emerald-500/20"
                          >
                            + Setor Saldo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">
                        {hideBalances ? '••••' : formatRupiah(goal.currentAmount)}
                      </span>
                      <span className="font-bold text-white">{percent}%</span>
                      <span className="text-slate-400">
                        {hideBalances ? '••••' : formatRupiah(goal.targetAmount)}
                      </span>
                    </div>

                    {goal.note && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
                        <span>{goal.note}</span>
                        <button
                          onClick={() => {
                            setSelectedGoal(goal);
                            setGoalModalOpen(true);
                          }}
                          className="text-slate-500 hover:text-white underline text-[10px]"
                        >
                          Ubah
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <BudgetModal
        isOpen={budgetModalOpen}
        onClose={() => {
          setBudgetModalOpen(false);
          setSelectedBudget(null);
        }}
        budgetToEdit={selectedBudget}
      />

      <GoalModal
        isOpen={goalModalOpen || Boolean(depositGoalTarget)}
        onClose={() => {
          setGoalModalOpen(false);
          setSelectedGoal(null);
          setDepositGoalTarget(null);
        }}
        goalToEdit={selectedGoal}
        depositGoal={depositGoalTarget}
      />
    </div>
  );
};
