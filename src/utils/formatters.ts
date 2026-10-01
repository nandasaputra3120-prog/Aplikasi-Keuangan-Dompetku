/**
 * Formatting and Financial Calculation Utilities for DompetKu (IDR)
 */

export const formatRupiah = (amount: number, compact: boolean = false): string => {
  if (isNaN(amount)) return 'Rp 0';

  if (compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    if (abs >= 1_000_000_000) {
      return `${sign}Rp ${(abs / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
    }
    if (abs >= 1_000_000) {
      return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
    }
    if (abs >= 1_000) {
      return `${sign}Rp ${(abs / 1_000).toFixed(0)} Rb`;
    }
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
};

export const parseRupiahInput = (value: string): number => {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

export const formatIndonesianDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Hari ini, ${timeStr}`;
    if (isYesterday) return `Kemarin, ${timeStr}`;

    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const getMonthKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getMonthNameIndo = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const idx = parseInt(month, 10) - 1;
  return `${months[idx] || month} ${year}`;
};

// Kalkulator Angsuran / Pinjaman KPR
export interface LoanSimulationResult {
  monthlyInstallment: number;
  totalInterest: number;
  totalPayment: number;
}

export const calculateLoan = (
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  type: 'flat' | 'effective' = 'flat'
): LoanSimulationResult => {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyInstallment: 0, totalInterest: 0, totalPayment: 0 };
  }

  if (type === 'flat') {
    const totalInterest = principal * (annualInterestRate / 100) * (tenureMonths / 12);
    const totalPayment = principal + totalInterest;
    const monthlyInstallment = totalPayment / tenureMonths;
    return { monthlyInstallment, totalInterest, totalPayment };
  } else {
    // Effective / Annuity
    const monthlyRate = annualInterestRate / 100 / 12;
    if (monthlyRate === 0) {
      return {
        monthlyInstallment: principal / tenureMonths,
        totalInterest: 0,
        totalPayment: principal,
      };
    }
    const monthlyInstallment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const totalPayment = monthlyInstallment * tenureMonths;
    const totalInterest = totalPayment - principal;
    return { monthlyInstallment, totalInterest, totalPayment };
  }
};

// Kalkulator Investasi & Bunga Berbunga (Compound Interest)
export interface InvestmentProjection {
  year: number;
  totalBalance: number;
  totalInvested: number;
  totalInterestEarned: number;
}

export const calculateCompoundInterest = (
  initialAmount: number,
  monthlyDeposit: number,
  annualReturnRate: number,
  years: number
): { projections: InvestmentProjection[]; finalBalance: number; finalInvested: number; finalGains: number } => {
  const projections: InvestmentProjection[] = [];
  const monthlyRate = annualReturnRate / 100 / 12;
  let currentBalance = initialAmount;
  let totalInvested = initialAmount;

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      currentBalance = (currentBalance + monthlyDeposit) * (1 + monthlyRate);
      totalInvested += monthlyDeposit;
    }
    projections.push({
      year: y,
      totalBalance: Math.round(currentBalance),
      totalInvested: Math.round(totalInvested),
      totalInterestEarned: Math.round(currentBalance - totalInvested),
    });
  }

  return {
    projections,
    finalBalance: Math.round(currentBalance),
    finalInvested: Math.round(totalInvested),
    finalGains: Math.round(currentBalance - totalInvested),
  };
};

// Kalkulator Zakat Penghasilan & Maal
export const calculateZakat = (
  monthlyIncome: number,
  otherIncome: number,
  goldPricePerGram: number = 1350000 // Standar harga emas acuan BAZNAS ~Rp 1.350.000/gr
): { isEligible: boolean; monthlyNisab: number; annualNisab: number; totalMonthlyIncome: number; monthlyZakat: number; annualZakat: number } => {
  const annualNisab = 85 * goldPricePerGram; // 85 gram emas
  const monthlyNisab = annualNisab / 12;
  const totalMonthlyIncome = monthlyIncome + otherIncome;
  const isEligible = totalMonthlyIncome >= monthlyNisab;
  const monthlyZakat = isEligible ? totalMonthlyIncome * 0.025 : 0;
  const annualZakat = monthlyZakat * 12;

  return {
    isEligible,
    monthlyNisab,
    annualNisab,
    totalMonthlyIncome,
    monthlyZakat,
    annualZakat,
  };
};

// Pesan Pengingat WhatsApp Sopan
export const generateWhatsAppReminder = (
  personName: string,
  amount: number,
  dueDate: string,
  note?: string
): string => {
  const formattedAmount = formatRupiah(amount);
  const formattedDate = formatIndonesianDate(dueDate);
  const notesText = note ? ` untuk "${note}"` : '';

  const message = `Halo ${personName}, semoga harimu menyenangkan. 🙏 Sekadar mengingatkan dengan sopan terkait catatan titipan/pinjaman sebesar *${formattedAmount}*${notesText} yang berstatus jatuh tempo pada *${formattedDate}*. Jika ada kendala atau butuh konfirmasi, silakan kabari ya. Terima kasih banyak!`;

  return encodeURIComponent(message);
};
