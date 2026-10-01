import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Share2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // The application URL
  const appUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  // Generate QR Code URL via public Google Chart QR API or reliable SVG generator
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=0f172a&color=10b981&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pasang / Download ke Android</h2>
              <span className="text-[11px] text-slate-400">Instalasi PWA Langsung & Berkas APK</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Quick Install Banner if browser supports native prompt */}
          {isInstallable && !isInstalled && (
            <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800/60 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-400 block flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Siap Dipasang Langsung
                </span>
                <span className="text-[11px] text-slate-300">
                  Browser Anda mendukung instalasi satu klik ke layar utama.
                </span>
              </div>
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
              >
                Pasang Sekarang
              </button>
            </div>
          )}

          {/* Cara 1: Scan QR Code atau Salin Link ke HP */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Buka di HP Android Anda
            </span>

            {/* QR Code image with fallback */}
            <div className="flex justify-center py-1">
              <div className="p-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Aplikasi"
                  className="w-40 h-40 rounded-xl object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // fallback if offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Arahkan kamera smartphone Android atau Google Lens ke kode QR di atas untuk membuka aplikasi di HP.
            </p>

            {/* Copy Link URL */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-xl border border-slate-800">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-transparent px-2 text-xs font-mono text-emerald-400 outline-none truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-lg flex items-center gap-1 active:scale-95 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
          </div>

          {/* Langkah Instalasi di Google Chrome Android */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-slate-200 block">
              Cara Pasang di HP Android (Tanpa Play Store):
            </span>

            <ol className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  Buka link di browser <strong>Google Chrome</strong> pada HP Android Anda.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Tap ikon menu <strong>titik tiga (⋮)</strong> di sudut kanan atas browser Chrome.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Pilih menu <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama" (Add to Home screen)</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  Ikon aplikasi <strong>DompetKu</strong> akan otomatis muncul di layar HP Anda dan berjalan seperti aplikasi Android native (fullscreen tanpa address bar)!
                </span>
              </li>
            </ol>
          </div>

          {/* Informasi Pembuatan Berkas APK */}
          <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2 text-xs text-slate-400">
            <span className="font-bold text-slate-200 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-sky-400" />
              Ingin Menjadi Berkas APK (.apk)?
            </span>
            <p>
              Aplikasi ini sudah berstandar PWA resmi. Jika Anda memerlukan berkas fisik <code>.apk</code> untuk dibagikan atau diunggah ke Google Play Store, Anda dapat memasukkan link aplikasi ini ke <strong>PWABuilder.com</strong> (alat gratis resmi Microsoft/Google) untuk mengunduh paket APK siap pasang.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-colors"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
