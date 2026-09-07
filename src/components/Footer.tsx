import React from 'react';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="main-footer" className="bg-[#0B2B5C] text-slate-300 text-xs border-t border-[#143B73] py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1920px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
        
        {/* Security & System status indicators */}
        <div className="flex items-center gap-3 flex-wrap justify-center text-[11px] text-blue-200/80">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Server Itwasum Mabes Polri</span>
          </div>

          <span className="text-blue-400/40">•</span>

          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-blue-300" />
            <span>Protokol Keamanan TLS 1.3 Terverifikasi</span>
          </div>

          <span className="text-blue-400/40 hidden md:inline">•</span>

          <div className="hidden md:flex items-center gap-1 text-blue-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Versi Sistem 2.4.0 (Presisi)</span>
          </div>
        </div>

        {/* Copyright text */}
        <div className="text-[11px] text-blue-200/70 font-normal">
          © 2026 Inspektorat Pengawasan Umum Kepolisian Negara Republik Indonesia
        </div>

      </div>
    </footer>
  );
};

