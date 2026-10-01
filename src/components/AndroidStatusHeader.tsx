import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryCharging, Smartphone, Eye, EyeOff, Sparkles, RefreshCw, Download } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { InstallAppModal } from './InstallAppModal';

export const AndroidStatusHeader: React.FC = () => {
  const { hideBalances, setHideBalances, isAndroidFrame, setIsAndroidFrame, resetToDemoData } = useFinance();
  const [time, setTime] = useState<string>('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full select-none">
      {/* Android System Status Bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 text-xs text-slate-300 font-medium">
        <span className="font-mono tracking-tight text-white font-semibold text-[13px]">{time || '09:41'}</span>

        {/* Camera Punchhole illusion for Android phone frame */}
        {isAndroidFrame && (
          <div className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-800 -mt-1 shadow-inner" />
        )}

        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-[10px] font-semibold text-emerald-400">5G</span>
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <div className="flex items-center gap-0.5">
            <span className="text-[11px] tabular-nums font-mono">94%</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Top App Bar with Quick Toggles */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-sm">
            D
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">DompetKu</h1>
            <span className="text-[10px] text-slate-400 font-medium">Android Finansial Suite</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Download / Install to Phone Button */}
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold active:scale-95 transition-all shadow-sm"
            title="Download / Pasang Aplikasi ke HP Android"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">Pasang</span>
          </button>

          {/* Privacy Toggle (Hide/Show nominal) */}
          <button
            onClick={() => setHideBalances((prev) => !prev)}
            title={hideBalances ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
            aria-label="Toggle Saldo Tersembunyi"
          >
            {hideBalances ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Toggle Device Frame (Phone Mockup vs Full Screen) */}
          <button
            onClick={() => setIsAndroidFrame((prev) => !prev)}
            title={isAndroidFrame ? 'Mode Layar Penuh' : 'Mode HP Android'}
            className={`p-2 rounded-lg transition-all active:scale-95 flex items-center gap-1 text-xs font-medium ${
              isAndroidFrame
                ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset data ke kondisi contoh/demo awal?')) {
                resetToDemoData();
              }
            }}
            title="Reset Contoh Data"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
    </div>
  );
};
