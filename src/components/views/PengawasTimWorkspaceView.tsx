import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  UploadCloud, 
  Eye, 
  Check, 
  X, 
  Filter, 
  Search, 
  ChevronRight, 
  Download, 
  ExternalLink, 
  MessageSquare, 
  Plus, 
  Layers, 
  Compass, 
  UserCheck, 
  ArrowLeftRight,
  ClipboardCheck,
  AlertCircle,
  FileCheck2,
  Send,
  MapPin
} from 'lucide-react';
import { CurrentUserProfile, SatkerMapItem, PoldaSatker } from '../../types';
import { ALL_COMBINED_SATKERS_DATA } from '../../data/allSatkersData';
import { IndonesiaMap } from '../IndonesiaMap';
import { CommandDirectoryPanel } from '../CommandDirectoryPanel';

interface PengawasTimWorkspaceViewProps {
  currentUser: CurrentUserProfile;
  onOpenRoleSwitcher?: () => void;
  onSelectPolda?: (id: string | null) => void;
  poldaList?: PoldaSatker[];
}

interface KKAItem {
  id: string;
  nomorKKA: string;
  satkerId: string;
  satkerNama: string;
  bidang: 'Opsnal' | 'Garkeu' | 'Logistik' | 'SDM';
  judulPengujian: string;
  kondisi: string;
  kriteria: string;
  sebab: string;
  akibat: string;
  rekomendasi: string;
  nilaiTemuanRp?: number;
  status: 'draft' | 'review' | 'final';
  tanggapanAuditee?: string;
  statusSanggahan?: 'belum_ada' | 'diajukan' | 'diterima' | 'ditolak';
  tenggatHari: number;
}

export const PengawasTimWorkspaceView: React.FC<PengawasTimWorkspaceViewProps> = ({
  currentUser,
  onOpenRoleSwitcher,
  onSelectPolda,
  poldaList = []
}) => {
  // Main view modes: Work space vs Integrated Map/Directory view
  const [viewMode, setViewMode] = useState<'workspace' | 'map_directory'>('workspace');
  const [activeTab, setActiveTab] = useState<'kka' | 'satker' | 'temuan' | 'agenda' | 'konsultasi'>('kka');
  const [searchQuery, setSearchQuery] = useState('');
  const [bidangFilter, setBidangFilter] = useState<'all' | 'Opsnal' | 'Garkeu' | 'Logistik' | 'SDM'>('all');
  const [selectedSatkerFilter, setSelectedSatkerFilter] = useState<string>('all');
  const [mapStatusFilter, setMapStatusFilter] = useState<'all' | 'perhatian' | 'audit'>('all');
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Selected item modal for review & verifikasi sanggahan
  const [selectedKKA, setSelectedKKA] = useState<KKAItem | null>(null);
  const [isVerifikasiModalOpen, setIsVerifikasiModalOpen] = useState(false);
  const [catatanVerifikator, setCatatanVerifikator] = useState('');

  // 5 Target Satkers of ST/412
  const targetSatkers = [
    {
      id: 'polda-riau',
      nama: 'Polda Riau (Satker Mapolda)',
      singkatan: 'Polda Riau',
      lokasi: 'Pekanbaru',
      pimpinan: 'Kombes Pol. Hermansyah (Irwasda)',
      picWasrik: 'Kompol Hendra (Katim Pendamping)',
      kkaSelesai: 8,
      kkaTotal: 10,
      temuanAktif: 7,
      iku: 86.8,
      status: 'Proses Klarifikasi'
    },
    {
      id: 'polres-pekanbaru',
      nama: 'Kepolisian Resor Kota Pekanbaru',
      singkatan: 'Polresta Pekanbaru',
      lokasi: 'Kota Pekanbaru',
      pimpinan: 'Kombes Pol. Jeki Rahmat Mustika, S.I.K.',
      picWasrik: 'Kompol Syahrizal (Kasiwas)',
      kkaSelesai: 9,
      kkaTotal: 10,
      temuanAktif: 5,
      iku: 71.0,
      status: 'Kritis - PNBP Lalu Lintas'
    },
    {
      id: 'polres-kampar',
      nama: 'Kepolisian Resor Kampar',
      singkatan: 'Polres Kampar',
      lokasi: 'Bangkinang, Kab. Kampar',
      pimpinan: 'AKBP Ronald Sumaja, S.I.K.',
      picWasrik: 'AKP Deni Kurniawan (Kasiwas)',
      kkaSelesai: 7,
      kkaTotal: 8,
      temuanAktif: 4,
      iku: 84.1,
      status: 'Tindak Lanjut Primkoppol'
    },
    {
      id: 'polres-dumai',
      nama: 'Kepolisian Resor Dumai',
      singkatan: 'Polres Dumai',
      lokasi: 'Kota Dumai',
      pimpinan: 'AKBP Dhovan Oktavianton, S.I.K.',
      picWasrik: 'Iptu Ahmad Yani (Kasiwas)',
      kkaSelesai: 4,
      kkaTotal: 6,
      temuanAktif: 2,
      iku: 83.0,
      status: 'Pemeriksaan Lapangan'
    },
    {
      id: 'polres-bengkalis',
      nama: 'Kepolisian Resor Bengkalis',
      singkatan: 'Polres Bengkalis',
      lokasi: 'Kabupaten Bengkalis',
      pimpinan: 'AKBP Setyo Bimo Anggoro, S.I.K.',
      picWasrik: 'AKP Firman (Kasiwas)',
      kkaSelesai: 4,
      kkaTotal: 6,
      temuanAktif: 3,
      iku: 74.2,
      status: 'Atensi BBM Satpolair'
    }
  ];

  // 14 Field Findings (KKA) ST/412
  const [kkaList, setKkaList] = useState<KKAItem[]>([
    {
      id: 'kka-1',
      nomorKKA: 'KKA/ST412/PKU-01/2026',
      satkerId: 'polres-pekanbaru',
      satkerNama: 'Polresta Pekanbaru',
      bidang: 'Garkeu',
      judulPengujian: 'Pengelolaan dan Setoran PNBP Pelayanan SIM & STNK Lalu Lintas',
      kondisi: 'Terdapat selisih kas fisik harian dengan register setoran Simponi BRI senilai Rp 180.000.000 selama Triwulan I 2026 yang belum disetor tepat waktu ke Kas Negara.',
      kriteria: 'PP No. 76 Tahun 2020 tentang Tarif PNBP Polri & PMK Rekening Pemerintah.',
      sebab: 'Petugas bendahara penerimaan pembantu terlambat merekonsiliasi resi setoran bank dan delay rekonsiliasi e-samsat.',
      akibat: 'Potensi keterlambatan penerimaan kas negara dan ketidaksesuaian laporan SAIBA.',
      rekomendasi: 'Segera setorkan sisa saldo PNBP Rp 180.000.000 ke kas negara dan tertibkan rekonsiliasi harian.',
      nilaiTemuanRp: 180000000,
      status: 'review',
      tanggapanAuditee: 'Sebagian bukti setor telah disiapkan senilai Rp 120.000.000 (NTPN terlampir), sisanya dalam proses verifikasi bank daerah.',
      statusSanggahan: 'diajukan',
      tenggatHari: 5
    },
    {
      id: 'kka-2',
      nomorKKA: 'KKA/ST412/PKU-02/2026',
      satkerId: 'polres-pekanbaru',
      satkerNama: 'Polresta Pekanbaru',
      bidang: 'Opsnal',
      judulPengujian: 'Pertanggungjawaban Keuangan (Perwabkeu) BBM Patroli Samapta & Satlantas',
      kondisi: 'Penggunaan kupon BBM non-tunai sejumlah 4.200 liter tidak dilengkapi lembar log-book kilometer kendaraan dinas.',
      kriteria: 'Perkap No. 4 Tahun 2014 tentang Pengawasan Penggunaan BBM Kendaraan Dinas Polri.',
      sebab: 'Operator patroli belum menginput odometer fisik ke buku register patroli presisi.',
      akibat: 'Tidak terverifikasinya rasio konsumsi BBM patroli riil terhadap jam dinas jalan.',
      rekomendasi: 'Lengkapi rekapitulasi odometer fisik per unit ranmor dan buat SOP verifikasi SPJ.',
      status: 'final',
      tanggapanAuditee: 'Telah diterbitkan SOP verifikasi odometer dan rekap log-book 18 unit mobil patroli.',
      statusSanggahan: 'diajukan',
      tenggatHari: 7
    },
    {
      id: 'kka-3',
      nomorKKA: 'KKA/ST412/KPR-01/2026',
      satkerId: 'polres-kampar',
      satkerNama: 'Polres Kampar',
      bidang: 'Garkeu',
      judulPengujian: 'Pengelolaan Dana Koperasi Primkoppol & Pemanfaatan Fasilitas Dinas',
      kondisi: 'Terdapat pembukuan dana titipan usaha simpan pinjam primkoppol yang tercampur dengan rekening penerimaan satker sebesar Rp 142.500.000.',
      kriteria: 'Perpol No. 7 Tahun 2022 & Surat Edaran Kapolri tentang Tata Kelola Koperasi Personel Polri.',
      sebab: 'Pengurus Primkoppol belum memisahkan buku kas operasional satker dengan badan hukum koperasi.',
      akibat: 'Risiko temuan berulang BPK RI terkait akun rekening penampung.',
      rekomendasi: 'Tutup rekening penampungan bersama dan pindahkan mutasi kas ke rekening resmi berbadan hukum koperasi terpisah.',
      nilaiTemuanRp: 142500000,
      status: 'review',
      tanggapanAuditee: 'Rekening baru telah dibuat di Bank Riau Kepri Syariah, saldo Rp 142.500.000 sedang dalam proses pemindahan mutasi.',
      statusSanggahan: 'diajukan',
      tenggatHari: 10
    },
    {
      id: 'kka-4',
      nomorKKA: 'KKA/ST412/KPR-02/2026',
      satkerId: 'polres-kampar',
      satkerNama: 'Polres Kampar',
      bidang: 'Opsnal',
      judulPengujian: 'Pencatatan Register Blanko Tilang Fisik & Pengawasan E-TLE',
      kondisi: 'Terdapat 150 lembar blanko tilang fisik sisa T.A. 2025 yang belum ditarik dan dimusnahkan/direkonsiliasi dengan Ditlantas.',
      kriteria: 'SOP Penindakan Pelanggaran Lalu Lintas Korlantas Polri.',
      sebab: 'Petugas tilang Polsek jajaran belum mengembalikan sisa buku tilang manual.',
      akibat: 'Risiko penyalahgunaan blanko manual di lapangan.',
      rekomendasi: 'Lakukan penarikan fisik seluruh blanko tilang kadaluarsa dan buat BAP pemusnahan resmi.',
      status: 'final',
      tanggapanAuditee: 'Telah ditarik 120 lembar dari 8 Polsek, sisa 30 lembar dalam perjalanan kurir dinas.',
      statusSanggahan: 'diajukan',
      tenggatHari: 14
    },
    {
      id: 'kka-5',
      nomorKKA: 'KKA/ST412/BKS-01/2026',
      satkerId: 'polres-bengkalis',
      satkerNama: 'Polres Bengkalis',
      bidang: 'Garkeu',
      judulPengujian: 'Pengadaan Logistik & Jasa Perawatan Kapal Patroli Satpolairud',
      kondisi: 'Pekerjaan perbaikan docking 1 unit kapal patroli tipe C2 senilai Rp 85.000.000 belum menyertakan berita acara serah terima (BAST) uji kelaikan laut.',
      kriteria: 'Perpres Pengadaan Barang/Jasa Pemerintah & Juklak Sarpras Baharkam.',
      sebab: 'Penyedia jasa galangan kapal belum menyerahkan sertifikat uji coba mesin laut.',
      akibat: 'Pertanggungjawaban belanja pemeliharaan belum dapat dinyatakan selesai 100%.',
      rekomendasi: 'Mintakan sertifikat uji kelaikan laut dan lampirkan BAST final.',
      nilaiTemuanRp: 85000000,
      status: 'review',
      statusSanggahan: 'belum_ada',
      tenggatHari: 12
    },
    {
      id: 'kka-6',
      nomorKKA: 'KKA/ST412/DMI-01/2026',
      satkerId: 'polres-dumai',
      satkerNama: 'Polres Dumai',
      bidang: 'Opsnal',
      judulPengujian: 'Administrasi Penyelidikan & Operasional Intelijen Perbatasan',
      kondisi: 'Laporan informasi khusus (LKI) pengawasan jalur laut gelap tidak didukung bukti pertanggungjawaban dana opsus terperinci.',
      kriteria: 'Jukminlidik Baintelkam Polri T.A. 2025.',
      sebab: 'Personel di lapangan belum membukukan kuitansi riil operasional tertutup.',
      akibat: 'Akuntabilitas SPJ operasional penyelidikan belum memenuhi standar wasrik.',
      rekomendasi: 'Lakukan revisi berkas pertanggungjawaban khusus sesuai format Jukmin Intelkam.',
      status: 'draft',
      statusSanggahan: 'belum_ada',
      tenggatHari: 18
    },
    {
      id: 'kka-7',
      nomorKKA: 'KKA/ST412/RIAU-01/2026',
      satkerId: 'polda-riau',
      satkerNama: 'Polda Riau (Satker Mapolda)',
      bidang: 'Garkeu',
      judulPengujian: 'Penyerapan Anggaran DIPA Bag Renmin Biro Operasi & Logistik',
      kondisi: 'Realisasi penyerapan anggaran Triwulan II pada akun 521211 (Belanja Bahan) melampaui rencana penarikan dana (RPD) sebesar Rp 210.000.000 tanpa revisi POK.',
      kriteria: 'PMK No. 199/PMK.02/2021 tentang Tata Cara Revisi Anggaran.',
      sebab: 'Kebutuhan mendesak pengamanan operasi daerah mendahului proses persetujuan revisi DJPb.',
      akibat: 'Deviasi halaman III DIPA melebihi ambang batas toleransi BPK.',
      rekomendasi: 'Lakukan pemutakhiran revisi DIPA pada aplikasi SAKTI dan konsolidasikan dengan Bidkeu.',
      nilaiTemuanRp: 210000000,
      status: 'review',
      tanggapanAuditee: 'Revisi POK telah diajukan ke Kanwil DJPb Riau tanggal 28 Agustus 2026.',
      statusSanggahan: 'diajukan',
      tenggatHari: 15
    }
  ]);

  // Filtered KKA Items
  const filteredKKA = kkaList.filter(item => {
    if (selectedSatkerFilter !== 'all' && item.satkerId !== selectedSatkerFilter) return false;
    if (bidangFilter !== 'all' && item.bidang !== bidangFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.nomorKKA.toLowerCase().includes(q) ||
        item.satkerNama.toLowerCase().includes(q) ||
        item.judulPengujian.toLowerCase().includes(q) ||
        item.kondisi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action: Handle Verifikasi Sanggahan
  const handleVerifikasiSanggahan = (keputusan: 'diterima' | 'ditolak' | 'revisi') => {
    if (!selectedKKA) return;
    
    setKkaList(prev => prev.map(k => {
      if (k.id === selectedKKA.id) {
        return {
          ...k,
          statusSanggahan: keputusan === 'diterima' ? 'diterima' : keputusan === 'ditolak' ? 'ditolak' : 'diajukan',
          status: keputusan === 'diterima' ? 'final' : k.status
        };
      }
      return k;
    }));

    setIsVerifikasiModalOpen(false);
    setSelectedKKA(null);
    setToastMessage(`Sanggahan ${selectedKKA.nomorKKA} berhasil diproses: Status ${keputusan.toUpperCase()}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-sm font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner Surat Tugas (ST/412) & Role Matrix Authority */}
      <div className="bg-gradient-to-r from-[#071F42] via-[#0B2B5C] to-[#143E78] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md flex items-center justify-center shrink-0 text-amber-300 shadow-inner">
              <ClipboardCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                  Surat Tugas Aktif: ST/412/VIII/WAS.1.1/2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-blue-100 border border-white/20">
                  Tim Audit Tahap II Polda Riau &amp; Jajaran
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Workspace Pengawas Tim Audit: {currentUser.nama}
              </h1>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                NRP {currentUser.nrp} &bull; {currentUser.sebutanPimpinan} &bull; Fokus Bidang: <strong>{currentUser.bidang.join(' & ')}</strong> (5 Satker Objek Periksa di Riau).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full lg:w-auto">
            {/* View Mode Switcher */}
            <div className="bg-white/10 p-1 rounded-xl border border-white/15 flex items-center gap-1">
              <button
                onClick={() => setViewMode('workspace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'workspace' 
                    ? 'bg-amber-400 text-slate-950 shadow-xs' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lembar Kerja KKA</span>
              </button>
              <button
                onClick={() => setViewMode('map_directory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'map_directory' 
                    ? 'bg-amber-400 text-slate-950 shadow-xs' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Peta &amp; Direktori Satker</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal / Policy Note on Scope */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-blue-200/90 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Prinsip Kepatuhan RBAC E-Audit:</strong> Kewenangan Tim Audit didasarkan pada Surat Tugas periksa. Visualisasi dibatasi pada lokus 5 Satker terperiksa guna menjaga objektivitas dan independensi pemeriksaan wasrik.
          </span>
        </div>
      </div>

      {/* Mode 1: Comprehensive KKA Workspace */}
      {viewMode === 'workspace' && (
        <div className="space-y-5">
          
          {/* 4 Executive Metric Cards for Tim Audit */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Objek Periksa
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-[#0B2B5C]">
                  ST/412
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">5</span>
                  <span className="text-xs font-bold text-slate-500">Satker Target</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Polda Riau, Pekanbaru, Kampar, Dumai, Bengkalis</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Jadwal</span>
                <span className="font-extrabold text-blue-700">14 Hari Kerja</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Kertas Kerja (KKA)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  80% Terisi
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">32</span>
                  <span className="text-xs font-bold text-slate-500">/ 40 Lembar Uji</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Uji petik fisik kas, BMN &amp; opsnal</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tahap</span>
                <span className="font-extrabold text-emerald-700">Klarifikasi Lapangan</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Temuan Terbuka
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                  Perlu Respon
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-700 tracking-tight">{kkaList.length}</span>
                  <span className="text-xs font-bold text-slate-500">Temuan KKA</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">8 Garkeu &bull; 6 Opsnal &bull; Rp 617,5 Juta</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Sisa Waktu</span>
                <span className="font-extrabold text-amber-800">5 Hari Kalender</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Progres Penugasan
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                  On-Track
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0B2B5C] tracking-tight">78.5%</span>
                  <span className="text-xs font-bold text-slate-500">Selesai</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Exit Briefing direncanakan 10 September</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Output</span>
                <span className="font-extrabold text-blue-700">Draf Naskah NHAS</span>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'kka', label: 'Daftar Kertas Kerja (KKA)', icon: FileText, count: kkaList.length },
              { id: 'satker', label: '5 Satker Objek Periksa', icon: Building2, count: 5 },
              { id: 'agenda', label: 'Agenda Uji Petik Fisik', icon: Calendar, count: 4 },
              { id: 'konsultasi', label: 'Klarifikasi & Berita Acara', icon: MessageSquare, count: 3 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#0B2B5C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Kertas Kerja Audit (KKA) */}
          {activeTab === 'kka' && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nomor KKA, satker, judul..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#0B2B5C]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                  {/* Satker Filter */}
                  <select
                    value={selectedSatkerFilter}
                    onChange={(e) => setSelectedSatkerFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="all">Semua Satker Objek (5)</option>
                    {targetSatkers.map(s => (
                      <option key={s.id} value={s.id}>{s.singkatan}</option>
                    ))}
                  </select>

                  {/* Bidang Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    {(['all', 'Garkeu', 'Opsnal', 'Logistik', 'SDM'] as const).map(b => (
                      <button
                        key={b}
                        onClick={() => setBidangFilter(b)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          bidangFilter === b ? 'bg-white text-[#0B2B5C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {b === 'all' ? 'Semua' : b}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* KKA Cards List */}
              <div className="space-y-3">
                {filteredKKA.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                    Tidak ditemukan lembar KKA yang cocok dengan kriteria filter.
                  </div>
                ) : (
                  filteredKKA.map(item => (
                    <div 
                      key={item.id}
                      className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-black text-[#0B2B5C] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            {item.nomorKKA}
                          </span>
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {item.satkerNama}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            item.bidang === 'Garkeu' ? 'bg-emerald-100 text-emerald-800' :
                            item.bidang === 'Opsnal' ? 'bg-blue-100 text-blue-800' :
                            item.bidang === 'Logistik' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            Bidang {item.bidang}
                          </span>
                          {item.nilaiTemuanRp && (
                            <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              Rp {item.nilaiTemuanRp.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            item.statusSanggahan === 'diterima' ? 'bg-emerald-100 text-emerald-800' :
                            item.statusSanggahan === 'ditolak' ? 'bg-rose-100 text-rose-800' :
                            item.statusSanggahan === 'diajukan' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {item.statusSanggahan === 'diterima' && 'Sanggahan Diterima (Selesai)'}
                            {item.statusSanggahan === 'ditolak' && 'Sanggahan Ditolak (Tetap Temuan)'}
                            {item.statusSanggahan === 'diajukan' && 'Ada Bukti Masuk - Perlu Verifikasi'}
                            {item.statusSanggahan === 'belum_ada' && 'Menunggu Tanggapan Auditee'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {item.judulPengujian}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <strong className="text-slate-800">Kondisi: </strong>{item.kondisi}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                          <span className="font-bold text-slate-700 block mb-0.5">Kriteria:</span>
                          <span>{item.kriteria}</span>
                        </div>
                        <div className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100">
                          <span className="font-bold text-slate-700 block mb-0.5">Rekomendasi Tim Audit:</span>
                          <span>{item.rekomendasi}</span>
                        </div>
                      </div>

                      {/* Tanggapan Auditee Banner */}
                      {item.tanggapanAuditee && (
                        <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold flex items-center gap-1.5 text-purple-900">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Tanggapan &amp; Bukti Sanggahan Auditee:
                            </span>
                            <span className="text-[10px] text-purple-700 font-bold">
                              Tenggat Respon: {item.tenggatHari} Hari Kerja
                            </span>
                          </div>
                          <p className="leading-relaxed">{item.tanggapanAuditee}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <div className="text-[11px] text-slate-400">
                          Pemeriksa: <strong>{currentUser.nama}</strong> &bull; ST/412
                        </div>
                        <div className="flex items-center gap-2">
                          {item.statusSanggahan === 'diajukan' && (
                            <button
                              onClick={() => {
                                setSelectedKKA(item);
                                setIsVerifikasiModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 bg-[#0B2B5C] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
                              <span>Verifikasi Bukti Sanggahan</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              alert(`Membuka berkas KKA lengkap: ${item.nomorKKA}`);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat KKA Lengkap</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 5 Satker Objek Periksa */}
          {activeTab === 'satker' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {targetSatkers.map(s => (
                <div 
                  key={s.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-[#0B2B5C]">
                        {s.lokasi}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        IKU: <strong className="text-slate-900">{s.iku}%</strong>
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900">
                      {s.nama}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pimpinan: <strong>{s.pimpinan}</strong>
                    </p>
                    <p className="text-xs text-blue-700 font-medium">
                      PIC Auditee: {s.picWasrik}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Progres KKA:</span>
                      <span className="font-bold text-slate-800">{s.kkaSelesai} / {s.kkaTotal} Lembar</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Temuan Aktif:</span>
                      <span className="font-extrabold text-amber-700">{s.temuanAktif} Temuan</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Status Pemeriksaan:</span>
                      <span className="font-bold text-blue-700">{s.status}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSatkerFilter(s.id);
                        setActiveTab('kka');
                      }}
                      className="flex-1 py-2 bg-[#0B2B5C] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition text-center cursor-pointer"
                    >
                      Buka KKA Satker
                    </button>
                    <button
                      onClick={() => {
                        if (onSelectPolda) onSelectPolda('polda-riau');
                        setViewMode('map_directory');
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs transition cursor-pointer"
                      title="Lihat di Peta"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Agenda Uji Petik Fisik */}
          {activeTab === 'agenda' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Jadwal Uji Petik Fisik &amp; Kunjungan Lapangan ST/412
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Agenda verifikasi fisik brankas, ranmor dinas, gudang senjata, dan blanko tilang.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  Tahap Pelaksanaan Wasrik
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    tgl: '08 September 2026',
                    waktu: '09:00 - 12:00 WIB',
                    satker: 'Polresta Pekanbaru',
                    agenda: 'Uji petik fisik loket pelayanan SIM, kas brankas PNBP, dan SPJ BBM Samapta.',
                    petugas: 'Kombes Pol. Dedi Supriyadi & Tim Audit Garkeu',
                    status: 'Terjadwal'
                  },
                  {
                    tgl: '09 September 2026',
                    waktu: '08:30 - 14:00 WIB',
                    satker: 'Polres Kampar',
                    agenda: 'Verifikasi fisik 4 unit ranmor BMN rusak berat & audit administrasi rekening Primkoppol.',
                    petugas: 'Kombes Pol. Dedi Supriyadi & AKP Firman',
                    status: 'Terjadwal'
                  },
                  {
                    tgl: '10 September 2026',
                    waktu: '10:00 - 15:00 WIB',
                    satker: 'Polres Bengkalis & Satpolairud',
                    agenda: 'Cek fisik docking kapal patroli C2 dan gudang amunisi/senpi dinas.',
                    petugas: 'Tim Audit Opsnal Itwasum',
                    status: 'Konfirmasi'
                  },
                  {
                    tgl: '12 September 2026',
                    waktu: '09:00 - 13:00 WIB',
                    satker: 'Mapolda Riau (Pekanbaru)',
                    agenda: 'Exit Briefing Wasrik Kinerja Tahap II & Penyerahan Naskah NHAS Sementara kepada Kapolda Riau.',
                    petugas: 'Seluruh Tim Wasrik Itwasum Polri & Irwasda Riau',
                    status: 'Penutupan'
                  }
                ].map((ag, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#0B2B5C] bg-blue-100 px-2 py-0.5 rounded">
                          {ag.tgl} ({ag.waktu})
                        </span>
                        <span className="font-extrabold text-xs text-slate-800">
                          {ag.satker}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {ag.agenda}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Tim Pemeriksa: {ag.petugas}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      {ag.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Klarifikasi & Berita Acara */}
          {activeTab === 'konsultasi' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Berita Acara &amp; Lembar Klarifikasi Temuan
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dokumen komunikasi resmi antara Tim Audit dengan Kapolres/Auditee jajaran Polda Riau.
                  </p>
                </div>
                <button 
                  onClick={() => alert('Fitur terbitkan Berita Acara Baru')}
                  className="px-3 py-1.5 bg-[#0B2B5C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Terbitkan Lembar Klarifikasi</span>
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    noSurat: 'BA-KLARIFIKASI/04/VIII/2026/WAS',
                    satker: 'Polres Kampar',
                    hal: 'Klarifikasi Pembukuan Simpan Pinjam Primkoppol Rp 142.500.000',
                    tanggal: '02 September 2026',
                    status: 'Menunggu Lampiran Rekening Koran',
                    pic: 'AKBP Ronald Sumaja (Kapolres Kampar)'
                  },
                  {
                    noSurat: 'BA-KLARIFIKASI/05/VIII/2026/WAS',
                    satker: 'Polresta Pekanbaru',
                    hal: 'Konfirmasi Setoran PNBP Pelayanan SIM & Rekonsiliasi Kasir',
                    tanggal: '03 September 2026',
                    status: 'Sebagian Bukti NTPN Diterima',
                    pic: 'Kombes Pol. Jeki Rahmat Mustika'
                  },
                  {
                    noSurat: 'BA-KLARIFIKASI/06/VIII/2026/WAS',
                    satker: 'Polres Bengkalis',
                    hal: 'Permintaan Dokumen Uji Kelaikan Mesin Docking Kapal C2',
                    tanggal: '04 September 2026',
                    status: 'Dalam Pengiriman Dokumen Galangan',
                    pic: 'AKBP Setyo Bimo Anggoro'
                  }
                ].map((ba, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {ba.noSurat}
                        </span>
                        <span className="font-bold text-xs text-[#0B2B5C]">
                          {ba.satker}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900">{ba.hal}</h4>
                      <p className="text-[11px] text-slate-500">Pihak Dituju: {ba.pic} &bull; Tanggal: {ba.tanggal}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 shrink-0">
                      {ba.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Mode 2: Tactical Map & Command Directory View */}
      {viewMode === 'map_directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Peta Taktis Lokus Pemeriksaan ST/412 (Polda Riau)
                  </h3>
                  <p className="text-xs text-slate-500">
                    5 Satker Objek Periksa Wasrik Kinerja Tahap II
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#0B2B5C] text-white">
                  5 Satker Terplot
                </span>
              </div>
              <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-200">
                <IndonesiaMap
                  poldaList={poldaList}
                  selectedPoldaId={'polda-riau'}
                  onSelectPolda={(id) => {
                    if (onSelectPolda) onSelectPolda(id);
                  }}
                  statusFilter={mapStatusFilter}
                  setStatusFilter={setMapStatusFilter}
                  currentUser={currentUser}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <CommandDirectoryPanel
              poldaList={poldaList}
              urgentItems={[]}
              selectedSatkerId={'polda-riau'}
              onSelectSatkerItem={(item) => {
                if (onSelectPolda) onSelectPolda(item.parentPoldaId || null);
              }}
              onSelectPolda={(id) => {
                if (onSelectPolda) onSelectPolda(id);
              }}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      {/* Modal Verifikasi Sanggahan KKA */}
      {isVerifikasiModalOpen && selectedKKA && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Verifikasi Bukti Sanggahan Auditee
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedKKA.nomorKKA} &bull; {selectedKKA.satkerNama}
                </h3>
                <p className="text-xs text-slate-500">{selectedKKA.judulPengujian}</p>
              </div>
              <button 
                onClick={() => setIsVerifikasiModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-xs space-y-2">
              <span className="font-extrabold text-purple-900 block">Tanggapan Resmi Auditee:</span>
              <p className="text-purple-950 leading-relaxed font-medium">
                {selectedKKA.tanggapanAuditee || 'Auditee telah melampirkan berkas bukti tindak lanjut ke sistem.'}
              </p>
              {selectedKKA.nilaiTemuanRp && (
                <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between">
                  <span className="text-purple-800">Nilai Temuan:</span>
                  <span className="font-extrabold text-rose-700">Rp {selectedKKA.nilaiTemuanRp.toLocaleString('id-ID')}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Catatan Evaluasi / Berita Acara Pemeriksa:
              </label>
              <textarea
                rows={3}
                placeholder="Masukkan catatan pertimbangan penerimaan atau penolakan bukti sanggahan..."
                value={catatanVerifikator}
                onChange={(e) => setCatatanVerifikator(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#0B2B5C]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2.5">
              <button
                onClick={() => setIsVerifikasiModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleVerifikasiSanggahan('ditolak')}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Tolak Sanggahan (Tetap Temuan)</span>
              </button>
              <button
                onClick={() => handleVerifikasiSanggahan('diterima')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terima Sanggahan &amp; Tutup Temuan</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
