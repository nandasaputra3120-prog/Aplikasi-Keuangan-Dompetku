import React from 'react';
import { Home, ReceiptText, Plus, Target, HandCoins, BarChart3 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ActiveTab } from '../types/finance';

export const AndroidBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openTransactionModal } = useFinance();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'transactions', label: 'Transaksi', icon: ReceiptText },
    { id: 'budgets', label: 'Anggaran', icon: Target },
    { id: 'debts', label: 'Hutang', icon: HandCoins },
    { id: 'analytics', label: 'Analisis', icon: BarChart3 },
  ];

  return (
    <div className="sticky bottom-0 z-40 w-full bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="relative max-w-lg mx-auto px-2 pt-1 pb-1">
        {/* Floating Quick Action Button (Android Center FAB) */}
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 z-10">
          <button
            onClick={() => openTransactionModal()}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-90 hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
            aria-label="Tambah Transaksi Cepat"
            title="Tambah Transaksi Baru"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Items Grid */}
        <div className="grid grid-cols-5 items-center h-15">
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            // Give gap for center FAB
            const isCenterAdjacent = idx === 2;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition-all ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Active indicator pill background */}
                {isActive && (
                  <span className="absolute top-1 w-9 h-6 rounded-full bg-emerald-500/15 -z-0 animate-pulse" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.8]'}`} />
                  <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap leading-none">
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Android Gesture Bar */}
        <div className="w-28 h-1 bg-slate-700/80 rounded-full mx-auto my-0.5" />
      </div>
    </div>
  );
};
