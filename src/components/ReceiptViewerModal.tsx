import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatRupiah, formatIndonesianDate } from '../utils/formatters';

interface ReceiptViewerModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({ transaction, onClose }) => {
  if (!transaction || !transaction.receiptImage) return null;

  const handleDownload = () => {
    if (!transaction.receiptImage) return;
    const a = document.createElement('a');
    a.href = transaction.receiptImage;
    a.download = `Struk_${transaction.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win && transaction.receiptImage) {
      win.document.write(`
        <html>
          <head><title>Struk Transaksi - ${transaction.note || 'DompetKu'}</title></head>
          <body style="text-align: center; margin: 20px; font-family: sans-serif;">
            <h3>Struk Pembayaran: ${formatRupiah(transaction.amount)}</h3>
            <p>${formatIndonesianDate(transaction.date)} - ${transaction.note || ''}</p>
            <img src="${transaction.receiptImage}" style="max-width: 90%; border: 1px solid #ccc; border-radius: 8px;" />
            <script>window.print();</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Lampiran Struk Pembayaran</h3>
            <p className="text-xs text-slate-400">{transaction.note || 'Transaksi'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              title="Cetak Struk"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              title="Unduh Gambar"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-black/40">
          <img
            src={transaction.receiptImage}
            alt="Struk Transaksi"
            className="max-h-[60vh] object-contain rounded-xl border border-slate-800 shadow"
          />
        </div>

        <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
          <span>{formatIndonesianDate(transaction.date)}</span>
          <span className="font-mono font-bold text-emerald-400">{formatRupiah(transaction.amount)}</span>
        </div>
      </div>
    </div>
  );
};
