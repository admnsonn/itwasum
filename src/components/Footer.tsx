import React from 'react';

/**
 * Footer ringkas mengikuti gaya Figma (teks abu-abu kecil di atas latar putih pada setiap
 * halaman): "Sistem Informasi Pengawasan & E-Profile Satker Terintegrasi ITWASUM POLRI (c)
 * 2026 | Sistem Online | Enkripsi AES-256 Aktif" — lihat `figma/README.md`.
 */
export const Footer: React.FC = () => {
  return (
    <footer id="main-footer" className="bg-white border-t border-slate-100 py-2.5 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left text-[11px] text-slate-400">
        <span>Sistem Informasi Pengawasan &amp; E-Profile Satker Terintegrasi ITWASUM POLRI &copy; 2026</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Sistem Online
          </span>
          <span>Enkripsi AES-256 Aktif</span>
        </div>
      </div>
    </footer>
  );
};

