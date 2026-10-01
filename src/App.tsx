/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { AndroidStatusHeader } from './components/AndroidStatusHeader';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { TransactionModal } from './components/TransactionModal';
import { HomeView } from './components/views/HomeView';
import { TransactionsView } from './components/views/TransactionsView';
import { BudgetGoalsView } from './components/views/BudgetGoalsView';
import { DebtsView } from './components/views/DebtsView';
import { AnalyticsToolsView } from './components/views/AnalyticsToolsView';

const AppContent: React.FC = () => {
  const { activeTab, isAndroidFrame } = useFinance();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-0 sm:py-6 sm:px-4">
      {/* Container: Android Device Frame or Full Edge-to-Edge */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isAndroidFrame
            ? 'max-w-[440px] h-[100dvh] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden bg-slate-950 relative'
            : 'max-w-2xl min-h-screen bg-slate-950'
        }`}
      >
        {/* Android Status Bar & Top App Bar */}
        <AndroidStatusHeader />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-2 overscroll-contain">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'transactions' && <TransactionsView />}
          {activeTab === 'budgets' && <BudgetGoalsView />}
          {activeTab === 'debts' && <DebtsView />}
          {activeTab === 'analytics' && <AnalyticsToolsView />}
        </main>

        {/* Android Material 3 Bottom Navigation Bar */}
        <AndroidBottomNav />

        {/* Global Modals */}
        <TransactionModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
