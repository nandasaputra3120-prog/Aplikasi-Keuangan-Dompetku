import React, { useState, useMemo, useRef } from 'react';
import {
  BarChart3,
  Calculator,
  Download,
  Upload,
  RefreshCw,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Coins,
  Percent,
  Calendar,
  CheckCircle,
  HelpCircle,
  Smartphone,
} from 'lucide-react';
import { InstallAppModal } from '../InstallAppModal';
import { useFinance } from '../../context/FinanceContext';
import {
  formatRupiah,
  parseRupiahInput,
  calculateLoan,
  calculateCompoundInterest,
  calculateZakat,
  getMonthKey,
} from '../../utils/formatters';

export const AnalyticsToolsView: React.FC = () => {
  const {
    transactions,
    categories,
    wallets,
    budgets,
    savingsGoals,
    debts,
    monthlyIncome,
    monthlyExpense,
    totalBalance,
    exportToCSV,
    exportToJSON,
    importFromJSON,
    resetToDemoData,
    hideBalances,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'analytics' | 'calculators' | 'backup'>('analytics');
  const [activeCalc, setActiveCalc] = useState<'loan' | 'compound' | 'zakat' | 'emergency'>('loan');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Category Expense Distribution for current month
  const categorySpending = useMemo(() => {
    const currentMonth = getMonthKey();
    const map: { [catId: string]: number } = {};

    transactions
      .filter((t) => {
        try {
          return t.type === 'expense' && getMonthKey(new Date(t.date)) === currentMonth;
        } catch {
          return false;
        }
      })
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });

    const list = Object.entries(map).map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        id: catId,
        name: cat?.name || 'Lain-lain',
        color: cat?.color || '#64748b',
        amount,
        percentage: monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 100) : 0,
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, monthlyExpense]);

  // 2. Cash Flow 6 Months Trend
  const monthlyTrends = useMemo(() => {
    const monthsData: { [key: string]: { income: number; expense: number } } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = getMonthKey(d);
      monthsData[key] = { income: 0, expense: 0 };
    }

    transactions.forEach((tx) => {
      try {
        const key = getMonthKey(new Date(tx.date));
        if (monthsData[key]) {
          if (tx.type === 'income') monthsData[key].income += tx.amount;
          if (tx.type === 'expense') monthsData[key].expense += tx.amount;
        }
      } catch {
        // ignore
      }
    });

    return Object.entries(monthsData).map(([key, data]) => {
      const [year, month] = key.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return {
        key,
        label: `${monthNames[parseInt(month, 10) - 1]}`,
        income: data.income,
        expense: data.expense,
      };
    });
  }, [transactions]);

  // Max value for bar chart scaling
  const maxBarValue = useMemo(() => {
    let max = 1000000;
    monthlyTrends.forEach((m) => {
      if (m.income > max) max = m.income;
      if (m.expense > max) max = m.expense;
    });
    return max;
  }, [monthlyTrends]);

  // 3. Financial Health Metrics
  const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) : 0;
  const activeDebtsTotal = debts
    .filter((d) => d.type === 'debt')
    .reduce((acc, d) => acc + Math.max(0, d.amount - d.paidAmount), 0);
  const debtToIncomeRate = monthlyIncome > 0 ? Math.round((activeDebtsTotal / monthlyIncome) * 100) : 0;

  // Calculators State
  // Loan
  const [loanPrincipalStr, setLoanPrincipalStr] = useState('50000000');
  const [loanInterestRate, setLoanInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(24);
  const [loanType, setLoanType] = useState<'flat' | 'effective'>('effective');

  // Compound
  const [initCompoundStr, setInitCompoundStr] = useState('10000000');
  const [monthlyInvestStr, setMonthlyInvestStr] = useState('1000000');
  const [investRate, setInvestRate] = useState(10);
  const [investYears, setInvestYears] = useState(5);

  // Zakat
  const [zakatIncomeStr, setZakatIncomeStr] = useState('10000000');
  const [zakatOtherStr, setZakatOtherStr] = useState('0');

  // Emergency Fund
  const [emergencyExpenseStr, setEmergencyExpenseStr] = useState('5000000');
  const [emergencyMonths, setEmergencyMonths] = useState(6);

  // Calculation Results
  const loanResult = useMemo(
    () => calculateLoan(parseRupiahInput(loanPrincipalStr), loanInterestRate, loanTenure, loanType),
    [loanPrincipalStr, loanInterestRate, loanTenure, loanType]
  );

  const compoundResult = useMemo(
    () =>
      calculateCompoundInterest(
        parseRupiahInput(initCompoundStr),
        parseRupiahInput(monthlyInvestStr),
        investRate,
        investYears
      ),
    [initCompoundStr, monthlyInvestStr, investRate, investYears]
  );

  const zakatResult = useMemo(
    () => calculateZakat(parseRupiahInput(zakatIncomeStr), parseRupiahInput(zakatOtherStr)),
    [zakatIncomeStr, zakatOtherStr]
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const ok = importFromJSON(text);
        if (ok) {
          alert('Data berhasil dipulihkan dari cadangan JSON!');
        } else {
          alert('Gagal memulihkan data. Format file tidak valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* 3 Main Segmented Modes */}
      <div className="grid grid-cols-3 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'analytics'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Analisis
        </button>
        <button
          onClick={() => setActiveTab('calculators')}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'calculators'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Kalkulator
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
            activeTab === 'backup'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          Data & Backup
        </button>
      </div>

      {/* TAB 1: ANALYTICS & HEALTH */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Health Score Summary */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Rasio Kesehatan Finansial
              </h3>
              <span className="text-[10px] text-slate-400">Standar 50/30/20</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block">Rasio Menabung</span>
                <span
                  className={`text-base font-bold font-mono ${
                    savingsRate >= 20 ? 'text-emerald-400' : savingsRate >= 10 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {savingsRate}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Target: &gt;20%</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block">Beban Hutang</span>
                <span
                  className={`text-base font-bold font-mono ${
                    debtToIncomeRate <= 30 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {debtToIncomeRate}%
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Maks: 30%</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block">Arus Kas</span>
                <span
                  className={`text-base font-bold font-mono ${
                    monthlyIncome >= monthlyExpense ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {monthlyIncome >= monthlyExpense ? 'Surplus' : 'Defisit'}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Net Positif</span>
              </div>
            </div>
          </div>

          {/* 6 Months Bar Chart */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Tren Arus Kas 6 Bulan</h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Masuk
                </span>
                <span className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Keluar
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-slate-800">
              {monthlyTrends.map((m) => {
                const incomeHeight = Math.max(8, Math.round((m.income / maxBarValue) * 110));
                const expenseHeight = Math.max(8, Math.round((m.expense / maxBarValue) * 110));

                return (
                  <div key={m.key} className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="flex items-end gap-1 h-30">
                      {/* Income Bar */}
                      <div
                        className="w-3 bg-emerald-500 rounded-t transition-all duration-500 hover:brightness-125"
                        style={{ height: `${incomeHeight}px` }}
                        title={`Pemasukan: ${formatRupiah(m.income)}`}
                      />
                      {/* Expense Bar */}
                      <div
                        className="w-3 bg-rose-500/80 rounded-t transition-all duration-500 hover:brightness-125"
                        style={{ height: `${expenseHeight}px` }}
                        title={`Pengeluaran: ${formatRupiah(m.expense)}`}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expense Category Breakdown */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-emerald-400" />
              Alokasi Pengeluaran per Kategori
            </h3>

            {categorySpending.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Belum ada pengeluaran yang tercatat pada bulan ini.
              </div>
            ) : (
              <div className="space-y-3">
                {categorySpending.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-white font-medium">{cat.name}</span>
                      </div>
                      <div className="font-mono text-slate-300">
                        <span>{hideBalances ? '••••' : formatRupiah(cat.amount)}</span>
                        <span className="text-slate-500 text-[10px] ml-1.5 font-bold">({cat.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FINANCIAL CALCULATORS */}
      {activeTab === 'calculators' && (
        <div className="space-y-4">
          {/* Sub Calculator Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'loan', label: 'Cicilan Pinjaman / KPR' },
              { id: 'compound', label: 'Investasi & Bunga Berbunga' },
              { id: 'zakat', label: 'Zakat Penghasilan' },
              { id: 'emergency', label: 'Dana Darurat' },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCalc(c.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCalc === c.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* 1. LOAN CALCULATOR */}
          {activeCalc === 'loan' && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white">Simulasi Cicilan Pinjaman & KPR</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Jumlah Pinjaman Pokok (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={new Intl.NumberFormat('id-ID').format(parseRupiahInput(loanPrincipalStr))}
                    onChange={(e) => setLoanPrincipalStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Bunga Per Tahun (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={loanInterestRate}
                      onChange={(e) => setLoanInterestRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tenor (Bulan)</label>
                    <input
                      type="number"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLoanType('effective')}
                    className={`flex-1 py-1.5 text-xs rounded-xl border ${
                      loanType === 'effective'
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 font-bold'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    Bunga Efektif / Anuitas
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoanType('flat')}
                    className={`flex-1 py-1.5 text-xs rounded-xl border ${
                      loanType === 'flat'
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 font-bold'
                        : 'border-slate-800 text-slate-400'
                    }`}
                  >
                    Bunga Flat
                  </button>
                </div>
              </div>

              {/* Result Card */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-900/40 space-y-2 mt-2">
                <span className="text-[10px] text-slate-400 block">Estimasi Angsuran Tiap Bulan:</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 block">
                  {formatRupiah(loanResult.monthlyInstallment)} / bln
                </span>
                <div className="grid grid-cols-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div>
                    <span>Total Bunga:</span>
                    <p className="font-mono text-white font-semibold">{formatRupiah(loanResult.totalInterest)}</p>
                  </div>
                  <div>
                    <span>Total Pelunasan:</span>
                    <p className="font-mono text-white font-semibold">{formatRupiah(loanResult.totalPayment)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. COMPOUND INTEREST */}
          {activeCalc === 'compound' && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white">Proyeksi Investasi & Bunga Berbunga</h3>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Modal Awal (Rp)</label>
                    <input
                      type="text"
                      value={new Intl.NumberFormat('id-ID').format(parseRupiahInput(initCompoundStr))}
                      onChange={(e) => setInitCompoundStr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Setoran Rutin / Bulan (Rp)</label>
                    <input
                      type="text"
                      value={new Intl.NumberFormat('id-ID').format(parseRupiahInput(monthlyInvestStr))}
                      onChange={(e) => setMonthlyInvestStr(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Estimasi Imbal Hasil (%/thn)</label>
                    <input
                      type="number"
                      value={investRate}
                      onChange={(e) => setInvestRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Jangka Waktu (Tahun)</label>
                    <input
                      type="number"
                      value={investYears}
                      onChange={(e) => setInvestYears(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Result */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-sky-900/40 space-y-2 mt-2">
                <span className="text-[10px] text-slate-400 block">Total Nilai Aset Setelah {investYears} Tahun:</span>
                <span className="text-2xl font-bold font-mono text-sky-400 block">
                  {formatRupiah(compoundResult.finalBalance)}
                </span>
                <div className="grid grid-cols-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div>
                    <span>Total Uang Disetor:</span>
                    <p className="font-mono text-white">{formatRupiah(compoundResult.finalInvested)}</p>
                  </div>
                  <div>
                    <span>Keuntungan Bunga/Dividen:</span>
                    <p className="font-mono text-emerald-400 font-bold">+{formatRupiah(compoundResult.finalGains)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. ZAKAT CALCULATOR */}
          {activeCalc === 'zakat' && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white">Kalkulator Zakat Penghasilan & Maal (2.5%)</h3>
              <p className="text-xs text-slate-400">
                Standar BAZNAS: Nisab setara 85 gram emas per tahun (± {formatRupiah(zakatResult.monthlyNisab)}/bulan).
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Penghasilan Pokok Bulanan (Rp)</label>
                  <input
                    type="text"
                    value={new Intl.NumberFormat('id-ID').format(parseRupiahInput(zakatIncomeStr))}
                    onChange={(e) => setZakatIncomeStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Pemasukan Tambahan / Bonus / THR (Rp)</label>
                  <input
                    type="text"
                    value={new Intl.NumberFormat('id-ID').format(parseRupiahInput(zakatOtherStr))}
                    onChange={(e) => setZakatOtherStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Zakat Result */}
              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  zakatResult.isEligible
                    ? 'bg-emerald-950/30 border-emerald-800/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Status Kewajiban Zakat:</span>
                  <span
                    className={`text-xs font-bold ${
                      zakatResult.isEligible ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {zakatResult.isEligible ? '✓ Wajib Zakat (Mencapai Nisab)' : 'Belum Wajib Zakat (Dianjurkan Infaq)'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Zakat Wajib Ditunaikan (2.5%):</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400 block">
                    {formatRupiah(zakatResult.monthlyZakat)} / bulan
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Setara {formatRupiah(zakatResult.annualZakat)} per tahun
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. EMERGENCY FUND */}
          {activeCalc === 'emergency' && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-sm font-bold text-white">Kalkulator Kebutuhan Dana Darurat</h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Pengeluaran Rutin Bulanan Anda (Rp)</label>
                <input
                  type="text"
                  value={new Intl.NumberFormat('id-ID').format(parseRupiahInput(emergencyExpenseStr))}
                  onChange={(e) => setEmergencyExpenseStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono font-bold text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Profil Kebutuhan Tanggungan</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { months: 3, label: 'Lajang (3 Bln)' },
                    { months: 6, label: 'Menikah (6 Bln)' },
                    { months: 12, label: 'Keluarga (12 Bln)' },
                  ].map((m) => (
                    <button
                      key={m.months}
                      type="button"
                      onClick={() => setEmergencyMonths(m.months)}
                      className={`py-2 px-1 text-xs rounded-xl border transition-all ${
                        emergencyMonths === m.months
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-400 font-bold'
                          : 'border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-900/40 space-y-2">
                <span className="text-[10px] text-slate-400 block">Target Total Dana Darurat Wajib Disimpan:</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 block">
                  {formatRupiah(parseRupiahInput(emergencyExpenseStr) * emergencyMonths)}
                </span>
                <p className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  Sebaiknya disimpan di instrumen likuid dan bebas resiko seperti Tabungan Bank & Reksadana Pasar Uang.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BACKUP & SETTINGS */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-white">Ekspor & Cadangan Data</h3>
            <p className="text-xs text-slate-400">
              Semua data transaksi dan rekening Anda tersimpan di perangkat lokal. Anda dapat mengunduh salinan berkas kapan saja.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsInstallModalOpen(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-950/60 to-slate-800 hover:from-emerald-900/60 text-white text-xs font-semibold rounded-2xl flex items-center justify-between border border-emerald-500/40 active:scale-[0.99] transition-all shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300">Pasang Aplikasi ke HP Android (PWA / APK)</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-lg">
                  Install
                </span>
              </button>

              <button
                onClick={exportToCSV}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Ekspor Laporan Transaksi (.CSV / Excel)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">.csv</span>
              </button>

              <button
                onClick={exportToJSON}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Cadangkan Seluruh Data (.JSON Backup)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">.json</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleFileUpload}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-2xl flex items-center justify-between border border-slate-700 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Pulihkan Data dari Berkas Cadangan</span>
                </div>
                <span className="text-[10px] text-slate-400">Restore</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-white">Reset Contoh Data</h3>
            <p className="text-xs text-slate-400">
              Ingin memuat kembali data demo transaksi, anggaran, dan target impian?
            </p>
            <button
              onClick={() => {
                if (window.confirm('Muat ulang data contoh awal? Data custom yang belum dicadangkan akan tertimpa.')) {
                  resetToDemoData();
                  alert('Data contoh berhasil dimuat!');
                }
              }}
              className="py-2.5 px-4 bg-slate-800 text-rose-400 hover:bg-rose-950/40 border border-slate-700 text-xs font-semibold rounded-2xl flex items-center gap-2 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset ke Data Contoh
            </button>
          </div>
        </div>
      )}

      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};
