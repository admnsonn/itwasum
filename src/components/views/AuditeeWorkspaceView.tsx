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
  Download, 
  ExternalLink, 
  MessageSquare, 
  Plus, 
  Layers, 
  Compass, 
  UserCheck, 
  ArrowLeftRight,
  Shield,
  FileCheck2,
  Send,
  MapPin,
  HelpCircle,
  Award,
  AlertCircle
} from 'lucide-react';
import { CurrentUserProfile, PoldaSatker } from '../../types';
import { IndonesiaMap } from '../IndonesiaMap';
import { CommandDirectoryPanel } from '../CommandDirectoryPanel';

interface AuditeeWorkspaceViewProps {
  currentUser: CurrentUserProfile;
  onOpenRoleSwitcher?: () => void;
  onSelectPolda?: (id: string | null) => void;
  poldaList?: PoldaSatker[];
}

interface TemuanAuditee {
  id: string;
  kode: string;
  bidang: 'Garkeu' | 'Opsnal' | 'Logistik' | 'SDM';
  judul: string;
  kondisi: string;
  kriteria: string;
  sebab: string;
  akibat: string;
  rekomendasi: string;
  nilaiTemuanRp?: number;
  tenggatWaktuHari: number;
  statusTL: 'belum' | 'proses' | 'selesai';
  catatanAuditee?: string;
  namaDokumenEviden?: string;
  tanggalUpload?: string;
}

export const AuditeeWorkspaceView: React.FC<AuditeeWorkspaceViewProps> = ({
  currentUser,
  onOpenRoleSwitcher,
  onSelectPolda,
  poldaList = []
}) => {
  const [viewMode, setViewMode] = useState<'workspace' | 'map_directory'>('workspace');
  const [activeTab, setActiveTab] = useState<'tindak_lanjut' | 'unggah_eviden' | 'polsek' | 'riwayat' | 'konsultasi'>('tindak_lanjut');
  const [searchQuery, setSearchQuery] = useState('');
  const [bidangFilter, setBidangFilter] = useState<'all' | 'Garkeu' | 'Opsnal' | 'Logistik' | 'SDM'>('all');
  const [mapStatusFilter, setMapStatusFilter] = useState<'all' | 'perhatian' | 'audit'>('all');
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload / Response Modal
  const [selectedTemuan, setSelectedTemuan] = useState<TemuanAuditee | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [penjelasanTindakLanjut, setPenjelasanTindakLanjut] = useState('');
  const [fileNameUploaded, setFileNameUploaded] = useState('');

  // 4 Active Findings for Polres Kampar
  const [temuanList, setTemuanList] = useState<TemuanAuditee[]>([
    {
      id: 'kpr-t1',
      kode: 'TL-KPR-01/GK/2026',
      bidang: 'Garkeu',
      judul: 'Pemisahan Rekening Pembukuan Simpan Pinjam Primkoppol dengan Rekening Kas Satker',
      kondisi: 'Terdapat pembukuan dana titipan simpan pinjam primkoppol yang tercampur dengan rekening penerimaan satker sebesar Rp 142.500.000.',
      kriteria: 'Perpol No. 7 Tahun 2022 & Surat Edaran Kapolri tentang Tata Kelola Koperasi Personel Polri.',
      sebab: 'Pengurus Primkoppol belum memisahkan buku kas operasional satker dengan badan hukum koperasi.',
      akibat: 'Menjadi objek temuan berulang BPK RI dan potensi salah saji laporan keuangan.',
      rekomendasi: 'Tutup rekening penampungan bersama, buat rekening baru berbadan hukum koperasi di bank syariah/pemerintah, dan lakukan pemindahan mutasi kas secara tertib.',
      nilaiTemuanRp: 142500000,
      tenggatWaktuHari: 10,
      statusTL: 'proses',
      catatanAuditee: 'Rekening baru di Bank Riau Kepri Syariah telah dibuat (No Rek: 102-21-00892). Saldo Rp 142.500.000 sedang dipindahkan dengan bukti kliring.',
      namaDokumenEviden: 'Surat_Pemisahan_Rekening_Primkoppol_PolresKampar.pdf',
      tanggalUpload: '04 September 2026'
    },
    {
      id: 'kpr-t2',
      kode: 'TL-KPR-02/OP/2026',
      bidang: 'Opsnal',
      judul: 'Penarikan dan Pemusnahan 150 Lembar Blanko Tilang Fisik Kadaluarsa',
      kondisi: 'Terdapat 150 lembar sisa blanko tilang fisik manual T.A. 2025 di 8 Polsek jajaran yang belum ditarik dan direkonsiliasi dengan Ditlantas Polda Riau.',
      kriteria: 'SOP Penindakan Pelanggaran Lalu Lintas Korlantas Polri & Perkap Pengawasan Blanko Tilang.',
      sebab: 'Unit Lantas Polsek jajaran belum mengirimkan kembali sisa lembar tilang manual setelah implementasi E-TLE.',
      akibat: 'Risiko hilangnya akuntabilitas blanko tilang dan kerentanan penyalahgunaan di pos pelayanan.',
      rekomendasi: 'Tarik fisik seluruh sisa blanko tilang, lakukan pencocokan register nomor seri, dan buat Berita Acara Rekonsiliasi/Pemusnahan resmi ke Ditlantas.',
      tenggatWaktuHari: 14,
      statusTL: 'proses',
      catatanAuditee: '120 lembar dari 6 Polsek sudah terkumpul di Satlantas Polres Kampar. 30 lembar sisanya sedang dijemput dari Polsek Kampar Kiri Hulu.',
      namaDokumenEviden: 'BA_Rekonsiliasi_Fisik_Blanko_Tilang_2026.pdf',
      tanggalUpload: '03 September 2026'
    },
    {
      id: 'kpr-t3',
      kode: 'TL-KPR-03/LOG/2026',
      bidang: 'Logistik',
      judul: 'Usulan Penghapusan dan Lelang 4 Unit Ranmor Dinas Roda Dua Rusak Berat',
      kondisi: '4 unit sepeda motor dinas Bhabinkamtibmas kondisi rusak berat terparkir di gudang logistik belum diusulkan penghapusan ke KPKNL Pekanbaru.',
      kriteria: 'PMK No. 83/PMK.06/2016 tentang Tata Cara Pelaksanaan Pemindahtanganan BMN.',
      sebab: 'Panitia penghapusan BMN Polres Kampar belum menyelesaikan uji taksasi fisik dan surat rekomendasi Dinas Perhubungan.',
      akibat: 'Aset BMN tidak produktif membebani neraca barang satker dan biaya administrasi inventaris.',
      rekomendasi: 'Terbitkan SK Kapolres tentang Pembentukan Panitia Penghapusan BMN, lengkapi cek fisik Dishub, dan ajukan surat persetujuan lelang ke KPKNL.',
      tenggatWaktuHari: 21,
      statusTL: 'belum'
    },
    {
      id: 'kpr-t4',
      kode: 'TL-KPR-04/SDM/2026',
      bidang: 'SDM',
      judul: 'Sinkronisasi Data Personel pada Aplikasi SIPP & Kelengkapan DRH 12 Anggota Polsek',
      kondisi: 'Terdapat 12 anggota Polsek jajaran yang belum memutakhirkan riwayat dikjur, kenaikan pangkat terakhir, dan data keluarga pada aplikasi SIPP 2.0.',
      kriteria: 'Perkap No. 9 Tahun 2017 tentang Sistem Informasi Personel Polri (SIPP).',
      sebab: 'Kendala jaringan di polsek pelosok dan kurangnya pendampingan operator Bag SDM.',
      akibat: 'Data profil personel tidak akurat pada sistem pembinaan karier Mabes Polri.',
      rekomendasi: 'Lakukan pemanggilan personel ke Bag SDM Polres Kampar untuk pemutakhiran berkas dan cetak lembar konfirmasi SIPP terverifikasi.',
      tenggatWaktuHari: 7,
      statusTL: 'selesai',
      catatanAuditee: '12 personel telah menyelesaikan input data dan berkas DRH telah disahkan oleh Kabag SDM Polres Kampar.',
      namaDokumenEviden: 'Tanda_Terima_Sinkronisasi_SIPP_BagSDM.pdf',
      tanggalUpload: '02 September 2026'
    }
  ]);

  // 12 Polsek of Polres Kampar
  const polsekList = [
    { nama: 'Polsek Bangkinang Kota', kapolsek: 'Iptu Fitri Yani', personil: 42, status: 'Tertib Administrasi', kasus: 45 },
    { nama: 'Polsek Kampar', kapolsek: 'AKP Marupa Sibarani', personil: 38, status: 'Tertib Administrasi', kasus: 38 },
    { nama: 'Polsek Tambang', kapolsek: 'AKP Asril Syahputra', personil: 44, status: 'Atensi Blanko Tilang', kasus: 52 },
    { nama: 'Polsek Siak Hulu', kapolsek: 'Kompol Surya Putra', personil: 56, status: 'Tertib Administrasi', kasus: 68 },
    { nama: 'Polsek Tapung', kapolsek: 'Kompol David Simarmata', personil: 48, status: 'Tertib Administrasi', kasus: 40 },
    { nama: 'Polsek Tapung Hulu', kapolsek: 'Iptu Wel Etria', personil: 32, status: 'Tertib Administrasi', kasus: 28 },
    { nama: 'Polsek Tapung Hilir', kapolsek: 'AKP Toni', personil: 34, status: 'Tertib Administrasi', kasus: 31 },
    { nama: 'Polsek Kampar Kiri', kapolsek: 'Kompol H. Zamzami', personil: 36, status: 'Tertib Administrasi', kasus: 24 },
    { nama: 'Polsek Kampar Kiri Hilir', kapolsek: 'Iptu Budi Winarko', personil: 26, status: 'Tertib Administrasi', kasus: 18 },
    { nama: 'Polsek Kampar Kiri Hulu', kapolsek: 'Iptu Hendra', personil: 22, status: 'Penarikan Blanko Tilang', kasus: 12 },
    { nama: 'Polsek XIII Koto Kampar', kapolsek: 'AKP Edi Purnama', personil: 30, status: 'Tertib Administrasi', kasus: 22 },
    { nama: 'Polsek Perhentian Raja', kapolsek: 'Iptu Rian', personil: 25, status: 'Tertib Administrasi', kasus: 19 }
  ];

  // Internal Bag/Sat/Sie of Polres Kampar
  const satuanInternal = [
    { nama: 'Bagian Operasi (Bag Ops)', kepala: 'Kompol Hendri', peran: 'Perencanaan operasi, pengamanan kamtibmas & karendik' },
    { nama: 'Bagian Perencanaan (Bag Ren)', kepala: 'Kompol Yulihasman', peran: 'Penyusunan RKA-K/L, DIPA, dan penetapan kinerja IKU' },
    { nama: 'Bagian SDM (Bag SDM)', kepala: 'Kompol Deni', peran: 'Pembinaan karier personel, SIPP, dikjur, dan perawatan rohani' },
    { nama: 'Bagian Logistik (Bag Log)', kepala: 'AKP Supardi', peran: 'Pengelolaan inventaris BMN, senpi, ranmor, dan pergudangan' },
    { nama: 'Satuan Lalu Lintas (Sat Lantas)', kepala: 'AKP Viola Dwi Anggreni', peran: 'Pelayanan SIM, BPKB, E-TLE, dan penindakan tilang' },
    { nama: 'Satuan Reserse Kriminal (Sat Reskrim)', kepala: 'AKP Elvin Septian Akbar', peran: 'Penyelidikan & penyidikan tindak pidana kamtibmas' },
    { nama: 'Seksi Keuangan (Sie Keu)', kepala: 'Iptu Syafril', peran: 'Perwabkeu, pembayaran gaji/tukin, dan rekonsiliasi kasir' },
    { nama: 'Seksi Pengawasan (Sie Was)', kepala: 'AKP Deni Kurniawan', peran: 'PIC Wasrik internal dan pengawalan tindak lanjut temuan' }
  ];

  // Action: Submit response & file
  const handleSubmitTindakLanjut = () => {
    if (!selectedTemuan) return;

    setTemuanList(prev => prev.map(t => {
      if (t.id === selectedTemuan.id) {
        return {
          ...t,
          statusTL: 'proses',
          catatanAuditee: penjelasanTindakLanjut || t.catatanAuditee,
          namaDokumenEviden: fileNameUploaded || 'Bukti_Dukung_PolresKampar_' + Date.now() + '.pdf',
          tanggalUpload: 'Hari ini, ' + new Date().toLocaleDateString('id-ID')
        };
      }
      return t;
    }));

    setIsUploadModalOpen(false);
    setSelectedTemuan(null);
    setPenjelasanTindakLanjut('');
    setFileNameUploaded('');
    setToastMessage(`Bukti tindak lanjut berhasil diunggah! Status temuan kini dalam pemeriksaan Tim Audit.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredTemuan = temuanList.filter(item => {
    if (bidangFilter !== 'all' && item.bidang !== bidangFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.kode.toLowerCase().includes(q) ||
        item.judul.toLowerCase().includes(q) ||
        item.kondisi.toLowerCase().includes(q) ||
        item.rekomendasi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const jumlahSelesai = temuanList.filter(t => t.statusTL === 'selesai').length;
  const tingkatKepatuhan = ((16 + jumlahSelesai) / (16 + temuanList.length) * 100).toFixed(1);

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

      {/* Top Banner Objek Periksa (Auditee) & Role Context */}
      <div className="bg-gradient-to-r from-[#071F42] via-[#0B2B5C] to-[#143E78] rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md flex items-center justify-center shrink-0 text-amber-300 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                  Objek Periksa Wasrik Tahap II T.A. 2026
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-blue-100 border border-white/20">
                  Polres Kampar (Polda Riau)
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Portal Tindak Lanjut Wasrik: {currentUser.nama}
              </h1>
              <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
                NRP {currentUser.nrp} &bull; {currentUser.sebutanPimpinan} &bull; Tim Pemeriksa: <strong>Kombes Pol. Dedi Supriyadi, S.I.K. (ST/412 Itwasum Polri)</strong>.
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
                <span>Portal Tindak Lanjut</span>
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
                <span>Peta Wilayah &amp; Satker</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal / Policy Note on Scope */}
        <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-blue-200/90 leading-relaxed">
          <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Prinsip Hak Akses Auditee (Satker Terperiksa):</strong> Sebagai Objek Periksa tingkat Polres, akses difokuskan pada pemenuhan rekomendasi temuan wasrik, penyampaian sanggahan/eviden riil, pemantauan 12 Polsek jajaran, dan komunikasi dengan tim pemeriksa.
          </span>
        </div>
      </div>

      {/* Mode 1: Main Auditee Portal */}
      {viewMode === 'workspace' && (
        <div className="space-y-5">
          
          {/* 4 Executive Metric Cards for Auditee */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Temuan Aktif Wasrik
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                  ST/412
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-700 tracking-tight">{temuanList.length}</span>
                  <span className="text-xs font-bold text-slate-500">Lembar Temuan</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">1 Garkeu &bull; 1 Opsnal &bull; 1 Log &bull; 1 SDM</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Tenggat Waktu</span>
                <span className="font-extrabold text-amber-800">7 - 21 Hari Kerja</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Temuan Terselesaikan
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  Verifikasi Sah
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">16</span>
                  <span className="text-xs font-bold text-slate-500">Temuan Selesai</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Memenuhi standar BPK &amp; Itwasda</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Status</span>
                <span className="font-extrabold text-emerald-700">Wajar Tanpa Pengecualian</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Kepatuhan TLHP
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-100 text-blue-800">
                  Indeks
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-[#0B2B5C] tracking-tight">{tingkatKepatuhan}%</span>
                  <span className="text-xs font-bold text-slate-500">Capaian Satker</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Target Itwasum: Minimal 85.0%</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Predikat</span>
                <span className="font-extrabold text-blue-700">Baik Sekali</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Jajaran Wilayah
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-800">
                  Kampar
                </span>
              </div>
              <div className="my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">12</span>
                  <span className="text-xs font-bold text-slate-500">Polsek Jajaran</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">8 Bag/Sat/Sie internal satker</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Kondisi Kamtibmas</span>
                <span className="font-extrabold text-purple-700">418 Kasus &bull; Kondusif</span>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
            {[
              { id: 'tindak_lanjut', label: 'Lembar Rekomendasi Temuan', icon: FileText, count: temuanList.length },
              { id: 'unggah_eviden', label: 'Portal Unggah Bukti (Eviden)', icon: UploadCloud, count: temuanList.filter(t => t.namaDokumenEviden).length },
              { id: 'polsek', label: 'Struktur Satker & 12 Polsek', icon: Building2, count: 12 },
              { id: 'riwayat', label: 'Riwayat Kepatuhan TLHP', icon: Award, count: 16 },
              { id: 'konsultasi', label: 'Konsultasi Tim Audit', icon: MessageSquare, count: 2 }
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

          {/* TAB 1: Lembar Rekomendasi Temuan & Aksi Tindak Lanjut */}
          {activeTab === 'tindak_lanjut' && (
            <div className="space-y-4">
              {/* Search & Bidang Filter Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari kode temuan, kata kunci..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#0B2B5C]"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                  {(['all', 'Garkeu', 'Opsnal', 'Logistik', 'SDM'] as const).map(b => (
                    <button
                      key={b}
                      onClick={() => setBidangFilter(b)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        bidangFilter === b ? 'bg-white text-[#0B2B5C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {b === 'all' ? 'Semua Bidang' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temuan Cards */}
              <div className="space-y-4">
                {filteredTemuan.map(t => (
                  <div 
                    key={t.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-xs font-black text-[#0B2B5C] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          {t.kode}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          t.bidang === 'Garkeu' ? 'bg-emerald-100 text-emerald-800' :
                          t.bidang === 'Opsnal' ? 'bg-blue-100 text-blue-800' :
                          t.bidang === 'Logistik' ? 'bg-amber-100 text-amber-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          Bidang {t.bidang}
                        </span>
                        {t.nilaiTemuanRp && (
                          <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Nilai: Rp {t.nilaiTemuanRp.toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          t.statusTL === 'selesai' ? 'bg-emerald-100 text-emerald-800' :
                          t.statusTL === 'proses' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {t.statusTL === 'selesai' && 'Tindak Lanjut Selesai'}
                          {t.statusTL === 'proses' && 'Dalam Proses Verifikasi Tim Audit'}
                          {t.statusTL === 'belum' && 'Belum Ditindaklanjuti'}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Sisa: {t.tenggatWaktuHari} Hari
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {t.judul}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong className="text-slate-800">Kondisi Lapangan: </strong>{t.kondisi}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-slate-600">
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="font-bold text-slate-700 block mb-0.5">Kriteria Regulasi:</span>
                        <span>{t.kriteria}</span>
                      </div>
                      <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                        <span className="font-bold text-slate-700 block mb-0.5">Rekomendasi Tim Audit Itwasum:</span>
                        <span className="text-amber-950 font-medium">{t.rekomendasi}</span>
                      </div>
                    </div>

                    {/* Progress / Uploaded Evidence Details */}
                    {t.namaDokumenEviden && (
                      <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold">{t.namaDokumenEviden}</span>
                            <span className="text-[11px] text-emerald-700 ml-2">({t.tanggalUpload})</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-200 text-emerald-900">
                          Terkirim ke Tim Audit
                        </span>
                      </div>
                    )}

                    {t.catatanAuditee && (
                      <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950">
                        <span className="font-extrabold text-purple-900 block mb-0.5">
                          Tanggapan / Langkah Tindak Lanjut Polres Kampar:
                        </span>
                        <p className="leading-relaxed">{t.catatanAuditee}</p>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div className="text-[11px] text-slate-400">
                        Penanggung Jawab: <strong>Kapolres Kampar / Kasat Terkait</strong>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTemuan(t);
                          setPenjelasanTindakLanjut(t.catatanAuditee || '');
                          setIsUploadModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#0B2B5C] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-amber-300" />
                        <span>{t.namaDokumenEviden ? 'Perbarui Bukti Sanggahan' : 'Tindak Lanjuti & Unggah Bukti'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Portal Unggah Eviden */}
          {activeTab === 'unggah_eviden' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Portal Unggah Eviden &amp; Dokumen Bukti Tindak Lanjut
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kirimkan dokumen pertanggungjawaban, NTPN setoran, BAP fisik, dan SK ke Tim Audit Wasrik ST/412.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                  Enkripsi Dokumen Aktif
                </span>
              </div>

              {/* Upload Dropzone */}
              <div 
                onClick={() => {
                  const simulatedName = `Bukti_TL_Kampar_${Date.now()}.pdf`;
                  setFileNameUploaded(simulatedName);
                  alert(`File ${simulatedName} berhasil dipilih. Silakan pilih temuan yang bersangkutan pada lembar rekomendasi.`);
                }}
                className="border-2 border-dashed border-blue-300 hover:border-[#0B2B5C] bg-blue-50/40 hover:bg-blue-50 rounded-2xl p-8 text-center cursor-pointer transition space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-blue-200 flex items-center justify-center text-[#0B2B5C] mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Klik atau Tarik File Bukti Dukung (PDF, JPG, PNG) ke Sini
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Maksimal 25MB per berkas &bull; Sertakan cap dinas dan tanda tangan Kasatker
                  </p>
                </div>
                <button className="px-4 py-2 bg-[#0B2B5C] text-white rounded-xl text-xs font-bold shadow-xs">
                  Pilih Berkas dari Komputer
                </button>
              </div>

              {/* List of Uploaded Documents */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Daftar Berkas Eviden Terkirim ke Tim Pemeriksa
                </h4>
                {temuanList.filter(t => t.namaDokumenEviden).map(item => (
                  <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.namaDokumenEviden}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Terkait: {item.kode} &bull; Diunggah: {item.tanggalUpload}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        Diterima Auditor
                      </span>
                      <button 
                        onClick={() => alert(`Mengunduh berkas: ${item.namaDokumenEviden}`)}
                        className="p-2 text-slate-600 hover:text-slate-900 bg-white rounded-lg border border-slate-200"
                        title="Unduh"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Struktur Satker & 12 Polsek */}
          {activeTab === 'polsek' && (
            <div className="space-y-5">
              {/* Internal Satker Units */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Bagian, Satuan &amp; Seksi Internal Polres Kampar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {satuanInternal.map((u, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="text-xs font-black text-slate-900">{u.nama}</div>
                      <div className="text-[11px] text-[#0B2B5C] font-bold">Pimpinan: {u.kepala}</div>
                      <div className="text-[11px] text-slate-500 leading-tight">{u.peran}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 12 Polsek Jajaran */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      12 Kepolisian Sektor (Polsek) Jajaran Polres Kampar
                    </h3>
                    <p className="text-xs text-slate-500">
                      Status tata kelola administrasi dan penanganan perkara kamtibmas
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Kondusif
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {polsekList.map((p, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{p.nama}</span>
                        <span className="text-[10px] font-bold text-slate-500">{p.personil} Personel</span>
                      </div>
                      <p className="text-xs text-slate-600">Kapolsek: <strong>{p.kapolsek}</strong></p>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Kasus Ditangani: {p.kasus}</span>
                        <span className={`font-bold ${
                          p.status === 'Tertib Administrasi' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Riwayat Kepatuhan TLHP */}
          {activeTab === 'riwayat' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Riwayat Penyelesaian Tindak Lanjut Wasrik Sebelumnya
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    16 temuan Wasrik Kinerja Tahap I 2026 yang telah disetujui tuntas oleh BPK RI &amp; Irwasum Polri.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>100% Tuntas Tahap I</span>
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { kode: 'LHP-2026/I/KPR-01', bidang: 'Garkeu', judul: 'Penyetoran sisa uang muka perjalanan dinas opsnal Satreskrim Rp 38.000.000 ke kas negara', status: 'Selesai disetor dengan NTPN 8839210091' },
                  { kode: 'LHP-2026/I/KPR-02', bidang: 'Logistik', judul: 'Pencatatan inventaris hibah 2 unit genset kantor Polsek Tambang pada aplikasi SIMAK-BMN', status: 'Tercatat pada NUP BMN 30201' },
                  { kode: 'LHP-2026/I/KPR-03', bidang: 'Opsnal', judul: 'Penyusunan Rencana Pengamanan (Renpam) Pilkada Serentak Kabupaten Kampar', status: 'BAP pengesahan Biro Ops Polda Riau lengkap' },
                  { kode: 'LHP-2026/I/KPR-04', bidang: 'SDM', judul: 'Kepatuhan pelaporan LHKPN & LHKASN pejabat perwira Polres Kampar 100%', status: 'Tanda terima KPK RI lengkap' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.kode}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{item.judul}</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium">{item.status}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 shrink-0">
                      Selesai
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Konsultasi Tim Audit */}
          {activeTab === 'konsultasi' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Saluran Komunikasi &amp; Konsultasi Tim Audit ST/412
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hubungi pemeriksa wasrik untuk konsultasi format bukti sanggahan dan jadwal uji petik fisik.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                  Respon Cepat
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B2B5C] text-white flex items-center justify-center font-bold">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">
                      Kombes Pol. Dedi Supriyadi, S.I.K.
                    </h4>
                    <p className="text-xs text-slate-600">
                      Pengawas Tim Audit Wasrik Tahap II Polda Riau &bull; Itwasum Polri
                    </p>
                    <p className="text-xs text-blue-700 font-medium mt-0.5">
                      Kontak Dinas: dedi.supriyadi@polri.go.id &bull; Hotline Wasrik Itwasum Ext. 412
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700">Kirim Permohonan Konsultasi / Pendampingan:</h4>
                <textarea
                  rows={3}
                  placeholder="Tuliskan pertanyaan klarifikasi atau konfirmasi jadwal pendampingan uji petik fisik..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#0B2B5C]"
                />
                <button 
                  onClick={() => {
                    setToastMessage('Permohonan konsultasi telah dikirimkan ke Tim Pemeriksa Itwasum.');
                    setTimeout(() => setToastMessage(null), 4000);
                  }}
                  className="px-4 py-2 bg-[#0B2B5C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Pesan ke Tim Audit</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Mode 2: Tactical Map & Directory */}
      {viewMode === 'map_directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Peta Wilayah Yurisdiksi Polres Kampar &amp; Polda Riau
                  </h3>
                  <p className="text-xs text-slate-500">
                    Posisi Satker Induk dan 12 Polsek Jajaran
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-[#0B2B5C] text-white">
                  L3 Objek Periksa
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

      {/* Modal Tindak Lanjut / Upload Eviden */}
      {isUploadModalOpen && selectedTemuan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Formulir Tindak Lanjut Rekomendasi Wasrik
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {selectedTemuan.kode} &bull; {selectedTemuan.judul}
                </h3>
                <p className="text-xs text-slate-500">Objek Audit: Polres Kampar &bull; Bidang {selectedTemuan.bidang}</p>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
              <span className="font-extrabold text-amber-900 block">Rekomendasi Tim Audit Itwasum:</span>
              <p className="text-amber-950 font-medium leading-relaxed">{selectedTemuan.rekomendasi}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Uraian Langkah Tindak Lanjut / Catatan Klarifikasi:
                </label>
                <textarea
                  rows={3}
                  placeholder="Jelaskan tindakan perbaikan yang telah dilakukan Polres Kampar..."
                  value={penjelasanTindakLanjut}
                  onChange={(e) => setPenjelasanTindakLanjut(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-[#0B2B5C]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilih Dokumen Eviden / Bukti Dukung (PDF):
                </label>
                <div 
                  onClick={() => {
                    const simName = `Bukti_TL_${selectedTemuan.kode.replace(/[\/]/g, '_')}.pdf`;
                    setFileNameUploaded(simName);
                  }}
                  className="p-4 border-2 border-dashed border-slate-300 hover:border-[#0B2B5C] rounded-xl text-center cursor-pointer bg-slate-50 text-xs text-slate-600 transition"
                >
                  <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  {fileNameUploaded ? (
                    <span className="font-bold text-emerald-700">Berkas Terpilih: {fileNameUploaded}</span>
                  ) : (
                    <span>Klik untuk melampirkan berkas bukti tindak lanjut</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitTindakLanjut}
                className="px-5 py-2.5 rounded-xl bg-[#0B2B5C] hover:bg-blue-900 text-white font-bold text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Kirim Bukti ke Tim Audit</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
