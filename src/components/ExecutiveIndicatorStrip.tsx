import React, { useState } from 'react';
import { PoldaSatker, BidangAudit, JenjangPengguna, TingkatObjek, CurrentUserProfile, BidangName } from '../types';
import { MABES_SATKERS_DATA } from '../data/mabesSatkerData';
import { Sliders, CheckCircle2, Clock, ShieldCheck, Database } from 'lucide-react';

interface ExecutiveIndicatorStripProps {
  poldaList: PoldaSatker[];
  activeBidang: BidangAudit;
  onSelectBidang: (b: BidangAudit) => void;
  activeJenjang: JenjangPengguna;
  tingkatObjek?: TingkatObjek;
  totalSatkerCount?: number;
  currentUser?: CurrentUserProfile;
  onOpenKPICustomizer?: () => void;
}

export const ExecutiveIndicatorStrip: React.FC<ExecutiveIndicatorStripProps> = ({
  poldaList,
  activeBidang,
  onSelectBidang,
  activeJenjang,
  tingkatObjek = 'semua',
  currentUser,
  onOpenKPICustomizer
}) => {
  // L3 Mode State: Standard Document View vs Full Simulation
  const [l3Mode, setL3Mode] = useState<'standar' | 'simulasi'>('standar');

  // If user cannot view KPI or has no bidang, do not render KPI cards
  if (currentUser && currentUser.canViewKPI === false) {
    return null;
  }

  const userBidang: BidangName[] = currentUser?.bidang || ['Opsnal', 'SDM', 'Logistik', 'Garkeu'];
  const isL3Polres = currentUser?.level === 'L3';


  // 1. Calculations based on Tingkat Objek
  const isPusat = tingkatObjek === 'pusat';
  const isWilayah = tingkatObjek === 'wilayah';

  // Wilayah Data
  const totalPolda = poldaList.length;
  const poldaTemuan = poldaList.reduce((acc, curr) => acc + curr.temuanTerbuka, 0);
  const poldaTemuanSelesai = poldaList.reduce((acc, curr) => acc + curr.temuanSelesai, 0);
  const poldaIKU = (poldaList.reduce((acc, curr) => acc + curr.capaianIKU, 0) / (totalPolda || 1));
  const poldaRbs = (poldaList.reduce((acc, curr) => acc + (curr.analisisLanjutan?.rbsScore || 65), 0) / (totalPolda || 1));
  const poldaSerapan = (poldaList.reduce((acc, curr) => acc + (curr.eProfil?.persenSerapan || 88), 0) / (totalPolda || 1));

  // Mabes Data
  const totalMabes = MABES_SATKERS_DATA.length;
  const mabesTemuan = MABES_SATKERS_DATA.reduce((acc, curr) => acc + curr.temuanTerbuka, 0);
  const mabesTemuanSelesai = 126; // Historic closed findings for Mabes
  const mabesIKU = (MABES_SATKERS_DATA.reduce((acc, curr) => acc + curr.capaianIKU, 0) / totalMabes);
  const mabesSerapan = (MABES_SATKERS_DATA.reduce((acc, curr) => acc + curr.serapanAnggaran, 0) / totalMabes);
  const mabesRbs = 34.2; // Low risk score for central headquarters

  // Effective Metrics
  const isL2Riau = currentUser?.level === 'L2' && currentUser.titikWilayahId === 'polda-riau';
  const isL1Itwil3 = currentUser?.level === 'L1' && currentUser.titikWilayahId === 'itwil-3';
  const isL1Itwil1 = currentUser?.level === 'L1' && currentUser.titikWilayahId === 'itwil-1';
  const isPengawasTim = currentUser?.peran === 'pengawas_tim';

  const displaySatkerCount = isL2Riau 
    ? 13 
    : isL1Itwil3 
      ? 7 
      : isL1Itwil1 
        ? 6 
        : isPusat 
          ? totalMabes 
          : isWilayah 
            ? totalPolda 
            : totalPolda + totalMabes;

  const displaySatkerLabel = isL2Riau 
    ? 'Polda & Polres' 
    : isL1Itwil3 || isL1Itwil1 
      ? 'Polda Binaan' 
      : isPusat 
        ? 'Satker Mabes' 
        : isWilayah 
          ? 'Polda' 
          : 'Satker Induk';

  const displaySatkerSub = isL2Riau
    ? 'Polda Riau & 12 Polres Jajaran'
    : isL1Itwil3
      ? '7 Polda Regional & Polres (Itwil III)'
      : isL1Itwil1
        ? '6 Polda Regional & Polres (Itwil I)'
        : isPusat 
          ? '10 Satker Utama • Mabes Polri' 
          : isWilayah 
            ? '34 Polda • 514 Polres Jajaran' 
            : '34 Polda • 514 Polres • 10 Mabes';

  const displayTemuanTerbuka = isL2Riau
    ? 96
    : isPusat 
      ? mabesTemuan 
      : isWilayah 
        ? poldaTemuan 
        : poldaTemuan + mabesTemuan;

  const displayTemuanSelesai = isL2Riau
    ? 212
    : isPusat 
      ? mabesTemuanSelesai 
      : isWilayah 
        ? poldaTemuanSelesai 
        : poldaTemuanSelesai + mabesTemuanSelesai;

  const displayTotalTemuan = displayTemuanTerbuka + displayTemuanSelesai;
  const displayTlhpRate = displayTotalTemuan > 0 ? ((displayTemuanSelesai / displayTotalTemuan) * 100).toFixed(1) : '72.4';

  const displayIKU = isL2Riau
    ? '90.8'
    : isPusat 
      ? mabesIKU.toFixed(1) 
      : isWilayah 
        ? poldaIKU.toFixed(1) 
        : ((poldaIKU * 0.7 + mabesIKU * 0.3)).toFixed(1);

  const displaySerapan = isL2Riau
    ? '91.3'
    : isPusat 
      ? mabesSerapan.toFixed(1) 
      : isWilayah 
        ? poldaSerapan.toFixed(1) 
        : ((poldaSerapan * 0.65 + mabesSerapan * 0.35)).toFixed(1);

  const displayRbs = isL2Riau
    ? '48.2'
    : isPusat 
      ? mabesRbs.toFixed(1) 
      : isWilayah 
        ? poldaRbs.toFixed(1) 
        : ((poldaRbs * 0.75 + mabesRbs * 0.25)).toFixed(1);

  const displaySarprasAkurasi = isL2Riau ? '92.4' : isPusat ? '97.2' : isWilayah ? '86.5' : '88.9';
  const displaySdmLhkpn = isL2Riau ? '98.5' : isPusat ? '99.1' : isWilayah ? '91.4' : '93.2';

  // Specific Tim Audit view (Surat Tugas, Objek Periksa, KKA, Temuan Sementara)
  if (isPengawasTim) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* 1. Objek Pemeriksaan */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Objek Pemeriksaan
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-50 text-[#0B2B5C]">
                ST/412
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">5</span>
                <span className="text-xs font-bold text-slate-500">Satker Target</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Polda Riau, Pekanbaru, Kampar, dll</p>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Bidang</span>
              <span className="font-extrabold text-blue-700">Opsnal &amp; Garkeu</span>
            </div>
          </div>

          {/* 2. Kertas Kerja Audit (KKA) */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Kertas Kerja (KKA)
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700">
                80% Terisi
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">32</span>
                <span className="text-xs font-bold text-slate-500">/ 40 Lembar</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Uji petik dokumen &amp; fisik lapangan</p>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Status</span>
              <span className="font-extrabold text-emerald-700">Tahap Klarifikasi</span>
            </div>
          </div>

          {/* 3. Temuan Sementara */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Temuan Sementara
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-700">
                Proses Sanggah
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-amber-700 tracking-tight">14</span>
                <span className="text-xs font-bold text-slate-500">Temuan Lapangan</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">8 Garkeu • 6 Opsnal</p>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Batas Sanggah</span>
              <span className="font-extrabold text-amber-800">5 Hari Kalender</span>
            </div>
          </div>

          {/* 4. Progres Pelaksanaan Wasrik */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Progres Wasrik
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700">
                TA 2026
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-[#0B2B5C] tracking-tight">78.5%</span>
                <span className="text-xs font-bold text-slate-500">Selesai</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Sesuai timeline jadwal penugasan</p>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Tahap Akhir</span>
              <span className="font-extrabold text-blue-700">Penyusunan LHP</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Specific Polres L3 view (Kasus, Selra, Temuan Polres, Rekomendasi Selesai)
  if (isL3Polres) {
    return (
      <div className="w-full space-y-2.5">
        {/* Status Konektivitas Data Mart L3 (Dokumen Hal 4: Angka lebih sedikit, tanpa profil risiko & IKU jika belum ada) */}
        <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white">Status Data Mart Polres Kampar (L3):</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  TLHP, Kasus Kamtibmas, BMN Terhubung
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  SPIP &amp; IKU Menunggu Integrasi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Buku Manual E-Audit Hal 4: Angka Polres lebih sedikit. Polsek tidak ditampilkan dan barisnya tidak dapat diklik lagi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setL3Mode(l3Mode === 'standar' ? 'simulasi' : 'standar')}
              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition border cursor-pointer ${
                l3Mode === 'simulasi'
                  ? 'bg-amber-400 text-slate-950 border-amber-500'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
              }`}
            >
              {l3Mode === 'standar' ? 'Uji Simulasi Integrasi Penuh' : 'Kembali ke Format Standar Dokumen'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* L3 - 1. Kasus Ditangani */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Kasus Kamtibmas
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200">
                POLRES [OPSNAL]
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">418</span>
                <span className="text-xs font-bold text-slate-500">Perkara</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                Laporan Polisi Kampar (Modul Opsnal)
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Tahun 2026</span>
              <span className="text-blue-700 font-bold">Aktif Terhubung</span>
            </div>
          </div>

          {/* L3 - 2. Penyelesaian Perkara (Selra) */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                Selra (Penyelesaian)
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                79.4% [OPSNAL]
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-emerald-700 tracking-tight">332</span>
                <span className="text-xs font-bold text-slate-400">/ 418</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                Selesai Lidik &amp; Sidik
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Target 75%</span>
              <span className="text-emerald-700 font-bold">Tercapai</span>
            </div>
          </div>

          {/* L3 - 3. Temuan Pengawasan Polres */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                Temuan Wasrik
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-amber-700 tracking-tight">7</span>
                <span className="text-xs font-bold text-slate-400">Temuan</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                2 Administrasi, 5 Logistik BMN
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Audit Wasrik Berkala</span>
              <span className="text-amber-700 font-bold">Terbuka</span>
            </div>
          </div>

          {/* L3 - 4. TLHP Rekomendasi Selesai */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                Penyelesaian TLHP
              </span>
            </div>
            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">85.7%</span>
                <span className="text-xs font-bold text-emerald-600">6 / 7</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                Tindak Lanjut Hasil Periksa
              </div>
            </div>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Sisa 1 Temuan</span>
              <span className="text-rose-700 font-bold">Dalam Proses</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Count active cards to adapt grid layout smoothly
  const showOpsnal = userBidang.includes('Opsnal');
  const showSdm = userBidang.includes('SDM');
  const showLogistik = userBidang.includes('Logistik');
  const showGarkeu = userBidang.includes('Garkeu');
  const showLintas = userBidang.length > 0;

  return (
    <div className="w-full space-y-2">
      {onOpenKPICustomizer && (
        <div className="flex items-center justify-end px-1 text-xs">
          <button
            onClick={onOpenKPICustomizer}
            className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer transition"
          >
            <Sliders className="w-3 h-3" />
            <span>Kustomisasi Metrik</span>
          </button>
        </div>
      )}

      {/* Responsive Grid that shrinks cards appropriately */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr gap-3">
        
        {/* 1. CAKUPAN SATKER (LINTAS) */}
        {showLintas && (
          <div 
            onClick={() => onSelectBidang('semua')}
            className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeBidang === 'semua' ? 'border-[#0B2B5C] ring-2 ring-[#0B2B5C]/20 shadow-md' : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Satker Diawasi
              </span>
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {displaySatkerCount}
                </span>
                <span className="text-xs font-bold text-slate-500">{displaySatkerLabel}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                {displaySatkerSub}
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-600 font-medium">Data SSOT</span>
              <span className="text-emerald-700 font-bold">100% Terpantau</span>
            </div>
          </div>
        )}

        {/* 2. BIDANG OPERASIONAL (OPSNAL) */}
        {showOpsnal && (
          <div 
            onClick={() => onSelectBidang('opsnal')}
            className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeBidang === 'opsnal' ? 'border-amber-600 ring-2 ring-amber-600/20 shadow-md' : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">
                Operasional (IKU)
              </span>
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {displayIKU}
                </span>
                <span className="text-xs font-bold text-amber-600">%</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                Capaian Sasaran Strategis
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-600 font-medium">Gakkum &amp; Yanmas</span>
              <span className="text-amber-700 font-bold">Optimal</span>
            </div>
          </div>
        )}

        {/* 3. BIDANG SDM */}
        {showSdm && (
          <div 
            onClick={() => onSelectBidang('sdm')}
            className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeBidang === 'sdm' ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md' : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                SDM &amp; Integritas
              </span>
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {displaySdmLhkpn}
                </span>
                <span className="text-xs font-bold text-emerald-600">%</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                Kepatuhan LHKPN &amp; Kode Etik
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-600 font-medium">Pelanggaran</span>
              <span className="text-emerald-700 font-bold">Turun 14%</span>
            </div>
          </div>
        )}

        {/* 4. BIDANG LOGISTIK / SARPRAS */}
        {showLogistik && (
          <div 
            onClick={() => onSelectBidang('sarpras')}
            className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeBidang === 'sarpras' ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md' : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                Logistik &amp; BMN
              </span>
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {displaySarprasAkurasi}
                </span>
                <span className="text-xs font-bold text-indigo-600">%</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                Validasi BMN Senpi &amp; Ranmor
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-600 font-medium">Aset Terdata</span>
              <span className="text-indigo-600 font-bold">Tervalidasi</span>
            </div>
          </div>
        )}

        {/* 5. BIDANG GARKEU (ANGGARAN & KEUANGAN) */}
        {showGarkeu && (
          <div 
            onClick={() => onSelectBidang('garkeu')}
            className={`bg-white rounded-2xl p-3 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              activeBidang === 'garkeu' ? 'border-blue-700 ring-2 ring-blue-700/20 shadow-md' : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                Anggaran (Garkeu)
              </span>
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  {displaySerapan}
                </span>
                <span className="text-xs font-bold text-blue-700">%</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                Serapan Anggaran DIPA &amp; BPK
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-600 font-medium">Akuntabel</span>
              <span className="text-blue-700 font-bold">WTP</span>
            </div>
          </div>
        )}

        {/* 6. ATENSI TLHP & TEMUAN (LINTAS) */}
        {showLintas && (
          <div 
            className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-xs relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">
                Atensi &amp; TLHP
              </span>
            </div>

            <div className="my-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl lg:text-3xl font-black text-rose-700 tracking-tight">
                  {displayTemuanTerbuka}
                </span>
                <span className="text-xs font-bold text-slate-400">/ {displayTotalTemuan}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-semibold truncate">
                {displayTlhpRate}% Rekomendasi Selesai
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">Tenggat 60 Hari</span>
              <span className="text-rose-700 font-bold">Prioritas</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
