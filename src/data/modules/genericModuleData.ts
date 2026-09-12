/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generator konten mock deterministik untuk modul baru yang belum punya tampilan bespoke
 * (Plan 2, bagian 2.4 & 2.5). Dipakai oleh `GenericModuleView` di runtime browser, dan bisa
 * dijalankan ulang secara identik lewat `scripts/gen-mock.ts` (tsx) karena seed berbasis kode
 * modul (`ModuleDefinition.kode`), bukan `Math.random()`.
 *
 * Pola tampilan yang dihasilkan konsisten untuk semua modul baru:
 *   header + breadcrumb -> baris KPI (4) -> filter tiga poros (bidang/tingkat/periode)
 *   -> tabel + grafik tren -> panel narasi & insight -> slide-over detail per baris.
 */

import { createSeededRng } from '../../utils/seededRandom';
import { POLDA_DATA } from '../mockData';
import type { ModuleDefinition } from '../../config/moduleRegistry';

export type GenericTone = 'aman' | 'perhatian' | 'kritis' | 'netral';

export interface GenericKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  tone: GenericTone;
}

export interface GenericTableRow {
  id: string;
  cols: string[];
  status: GenericTone;
  statusLabel: string;
  detailRingkasan: string;
  detailCatatan: string[];
}

export interface GenericChartPoint {
  periode: string;
  nilai: number;
  target: number;
}

export interface GenericModuleContent {
  kpis: GenericKpi[];
  tableColumns: string[];
  tableRows: GenericTableRow[];
  chart: GenericChartPoint[];
  chartLabel: string;
  narrative: string;
  insight: string[];
  filterBidang: string[];
  filterTingkat: string[];
  filterPeriode: string[];
}

const TONE_ORDER: GenericTone[] = ['aman', 'perhatian', 'kritis'];

interface ModuleContentBlueprint {
  kpiLabels: [string, string, string, string];
  kpiUnits: [string, string, string, string];
  tableColumns: string[];
  entitySource: 'polda' | 'domain' | 'model' | 'dokumen' | 'kontrak' | 'generic';
  domainNames?: string[];
  chartLabel: string;
  narrativeTemplate: (kode: string, label: string) => string;
  insightTemplates: string[];
  filterTingkat: string[];
}

const DOMAIN_INTEGRASI = [
  'E-DUMAS', 'E-AUDIT', 'E-WAS MBG', 'E-MR', 'OPS', 'SSDM',
  'KORLANTAS', 'SABHARA', 'BINMAS', 'PUSDOKES', 'SRENA', 'LOGISTIK',
];

const MODEL_AI = [
  'Anomaly Detector v2', 'RAG Retriever Pengawasan', 'Auto Summarizer Eksekutif',
  'Document NER Extractor', 'Risk Scoring Model', 'ChatItwasum Intent Classifier',
  'Prompt Guard Filter', 'MLOps Drift Monitor',
];

const BLUEPRINTS: Record<string, ModuleContentBlueprint> = {
  'B.4': {
    kpiLabels: ['Surat Diajukan (Periode Ini)', 'Menunggu Review Berjenjang', 'Disahkan', 'Rata-rata Waktu Proses'],
    kpiUnits: ['surat', 'surat', 'surat', 'hari'],
    tableColumns: ['No. Surat Usulan', 'Perihal', 'Pemohon / Satker', 'Tahap Review', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Volume Surat Usulan per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} mencatat volume pengajuan surat usulan pengawasan (mutasi, hak akses, penugasan khusus) beserta tahap review berjenjang sebelum pengesahan oleh pejabat berwenang.`,
    insightTemplates: [
      'Rata-rata waktu proses surat usulan masih di atas target SOP 3 hari kerja pada sebagian satker.',
      'Tahap review berjenjang kedua (Irwil) menjadi titik antrean terpanjang.',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres'],
  },
  'B.5': {
    kpiLabels: ['Naskah Masuk (Periode Ini)', 'Naskah Keluar', 'Menunggu Disposisi', 'Rata-rata Waktu Disposisi'],
    kpiUnits: ['naskah', 'naskah', 'naskah', 'jam'],
    tableColumns: ['No. Naskah Dinas', 'Perihal', 'Asal / Tujuan', 'Status Disposisi', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Volume Persuratan Elektronik per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} mengelola naskah dinas masuk/keluar Itwasum secara elektronik lengkap dengan riwayat disposisi dan arsip digital bernomor.`,
    insightTemplates: [
      'Naskah dengan klasifikasi "Segera" sudah 100% didisposisikan dalam waktu SOP.',
      'Arsip digital tersinkron penuh dengan Data Protection & DLP (A.4) untuk naskah berklasifikasi terbatas.',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres'],
  },
  'B.8': {
    kpiLabels: ['Rata-rata Skor Maturitas SPIP', 'Satker Level 3+', 'Satker Belum Dievaluasi', 'Komponen Terlemah'],
    kpiUnits: ['skor', 'satker', 'satker', ''],
    tableColumns: ['Satker', 'Skor Maturitas', 'Level', 'Komponen Terlemah', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Distribusi Skor Maturitas SPIP per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} menilai lima komponen SPIP (lingkungan pengendalian, penilaian risiko, kegiatan pengendalian, informasi & komunikasi, pemantauan) per satker sebagai basis penjaminan mutu pengendalian intern.`,
    insightTemplates: [
      'Komponen "Kegiatan Pengendalian" konsisten menjadi titik terlemah di lebih dari sepertiga satker.',
      'Kenaikan skor maturitas berkorelasi dengan penurunan temuan berulang pada satker yang sama.',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres'],
  },
  'B.12': {
    kpiLabels: ['Total Objek Audit Universe', 'Risiko Sangat Tinggi', 'Belum Pernah Diaudit >2 Tahun', 'Skor Risiko Rata-rata'],
    kpiUnits: ['objek', 'objek', 'objek', 'skor'],
    tableColumns: ['Objek Audit', 'Tingkat', 'Skor Risiko Inheren', 'Terakhir Diaudit', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Distribusi Skor Risiko Inheren',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} adalah populasi lengkap objek pengawasan (Mabes/Polda/Polres/Polsek) dengan skor risiko inheren, menjadi basis penyusunan PKPT Berbasis Risiko (B.13).`,
    insightTemplates: [
      'Objek dengan skor risiko sangat tinggi terkonsentrasi pada bidang Logistik & Sarpras.',
      'Sejumlah objek belum diaudit lebih dari 2 tahun dan otomatis diprioritaskan oleh Early Warning (B.18).',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres', 'Polsek'],
  },
  'B.13': {
    kpiLabels: ['Objek Terjadwal PKPT Periode Ini', 'Realisasi Penugasan', 'Deviasi dari Rencana', 'Cakupan Anggaran Wasrik'],
    kpiUnits: ['objek', '%', 'objek', '%'],
    tableColumns: ['Objek Audit', 'Prioritas Risiko', 'Triwulan Rencana', 'Status Penugasan', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Realisasi PKPT vs Rencana per Triwulan',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} menyusun Program Kerja Pengawasan Tahunan berdasar peringkat risiko dari Audit Universe (B.12), termasuk usulan penugasan tim per triwulan.`,
    insightTemplates: [
      'Realisasi penugasan Triwulan II tertinggal dari rencana akibat dependensi ketersediaan auditor.',
      'PKPT berbasis risiko menaikkan proporsi objek risiko tinggi yang diaudit dibanding periode sebelumnya.',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres'],
  },
  'B.15': {
    kpiLabels: ['KKA Aktif', 'Menunggu Validasi Berjenjang', 'Eviden Terunggah', 'Rata-rata Waktu Validasi'],
    kpiUnits: ['berkas', 'berkas', 'berkas', 'hari'],
    tableColumns: ['No. KKA', 'Objek Audit', 'Auditor Penyusun', 'Tahap Validasi', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Volume Kertas Kerja Audit per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} adalah kertas kerja pemeriksaan digital dengan lampiran eviden multifile dan validasi berjenjang (auditor -> ketua tim -> pengawas tim).`,
    insightTemplates: [
      'KKA dengan eviden tidak lengkap menjadi penyebab utama keterlambatan validasi berjenjang.',
      'Digitalisasi KKA memangkas waktu validasi dibanding proses manual sebelumnya.',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres'],
  },
  'B.16': {
    kpiLabels: ['Rekomendasi Terbuka', 'TLHP Overdue', 'TLHP Selesai Periode Ini', 'Rata-rata Aging TLHP'],
    kpiUnits: ['rekomendasi', 'rekomendasi', 'rekomendasi', 'hari'],
    tableColumns: ['Kode Rekomendasi', 'Sumber Temuan', 'Satker', 'Aging (hari)', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Tren Penyelesaian TLHP per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} merekap rekomendasi lintas sumber (Audit Polri, BPK, IRSUS) beserta status dan aging Tindak Lanjut Hasil Pemeriksaan per satker.`,
    insightTemplates: [
      'Rekomendasi bidang Garkeu memiliki aging rata-rata tertinggi dibanding bidang lain.',
      'TLHP yang overdue lebih dari 90 hari otomatis memicu Early Warning (B.18).',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres'],
  },
  'B.17': {
    kpiLabels: ['Skor Maturitas SPIP Nasional', 'Skor Risiko Strategis', 'Satker Turun Level', 'Satker Naik Level'],
    kpiUnits: ['skor', 'skor', 'satker', 'satker'],
    tableColumns: ['Satker', 'Skor Maturitas (B.8)', 'Tren', 'Skor Risiko Strategis', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Tren Maturitas SPIP Nasional per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} adalah dashboard agregat rollup dari data SPIP Satker (B.8) dan peta risiko strategis Itwasum tingkat nasional.`,
    insightTemplates: [
      'Rollup nasional menunjukkan tren maturitas SPIP naik tipis dibanding periode sebelumnya.',
      'Peta risiko strategis mengidentifikasi 3 domain risiko lintas satker yang perlu perhatian pimpinan.',
    ],
    filterTingkat: ['Nasional', 'Itwil', 'Polda'],
  },
  'B.18': {
    kpiLabels: ['Peringatan Aktif', 'Peringatan Kritis', 'Ditindaklanjuti < 24 Jam', 'Rata-rata Waktu Respons'],
    kpiUnits: ['peringatan', 'peringatan', '%', 'jam'],
    tableColumns: ['Kode Peringatan', 'Pemicu (Trigger)', 'Satker Terdampak', 'Sumber Modul', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Volume Peringatan Dini per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} adalah mesin aturan dan pemicu peringatan dini lintas modul: keterlambatan TLHP (B.16), penurunan IKU (B.7), dan anomali data (E.4).`,
    insightTemplates: [
      'Pemicu "Keterlambatan TLHP > 90 hari" menyumbang mayoritas peringatan kritis periode ini.',
      'Waktu respons rata-rata terhadap peringatan kritis berada di dalam target SOP 24 jam.',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres'],
  },
  'A.1': {
    kpiLabels: ['Domain Terkoneksi', 'Panggilan API / Hari (rata-rata)', 'Tingkat Keberhasilan', 'Latensi Rata-rata'],
    kpiUnits: ['domain', 'ribu req', '%', 'ms'],
    tableColumns: ['Domain Sumber', 'Endpoint', 'Status Koneksi', 'Tingkat Keberhasilan', 'Status'],
    entitySource: 'domain',
    domainNames: DOMAIN_INTEGRASI,
    chartLabel: 'Volume Panggilan API Konsumsi per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} memantau lapisan konsumsi API dari DIV TIK / SuperApp Big Data Polri sebagai sumber data resmi tunggal (Single Source of Truth).`,
    insightTemplates: [
      'Seluruh domain terkoneksi memakai kontrol mTLS/OAuth2 sesuai Service Contract (C.1).',
      'Domain E-WAS MBG memiliki tingkat keberhasilan panggilan API terendah dan sedang dalam koordinasi DIV TIK.',
    ],
    filterTingkat: ['Realtime', 'Batch Harian', 'Batch Mingguan'],
  },
  'A.2': {
    kpiLabels: ['Tabel Data Mart Aktif', 'Job ETL Berjalan', 'Kesegaran Data Rata-rata', 'Tingkat Keberhasilan Job'],
    kpiUnits: ['tabel', 'job', 'jam', '%'],
    tableColumns: ['Nama Job ETL', 'Sumber -> Target', 'Jadwal', 'Terakhir Berhasil', 'Status'],
    entitySource: 'domain',
    domainNames: DOMAIN_INTEGRASI,
    chartLabel: 'Volume Baris Data Termuat per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} memantau pipeline ETL/ELT data mart pengawasan Itwasum: sumber, tahapan transformasi, dan kesegaran data untuk seluruh modul B.1-B.18.`,
    insightTemplates: [
      'Job ETL domain SSDM dan Logistik berjalan tepat waktu dengan tingkat keberhasilan di atas 98%.',
      'Kesegaran data rata-rata data mart pengawasan berada di bawah ambang SLA 4 jam.',
    ],
    filterTingkat: ['Full Load', 'Incremental', 'CDC'],
  },
  'A.3': {
    kpiLabels: ['Entitas Data Terdaftar', 'Kepatuhan Kamus Data', 'Data Steward Aktif', 'Permintaan Akses Data Bulan Ini'],
    kpiUnits: ['entitas', '%', 'orang', 'permintaan'],
    tableColumns: ['Domain Data', 'Pemilik Data (Data Owner)', 'Klasifikasi', 'Kepatuhan Kamus Data', 'Status'],
    entitySource: 'domain',
    domainNames: DOMAIN_INTEGRASI,
    chartLabel: 'Kepatuhan Katalog & Kamus Data per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} mengelola katalog data, kamus data, dan kebijakan tata kelola Satu Data Indonesia (SDI) untuk domain pengawasan Itwasum.`,
    insightTemplates: [
      'Seluruh domain integrasi DIV TIK sudah memiliki data steward yang ditugaskan (VI.u SPEKTEK).',
      'Kepatuhan kamus data meningkat setelah penetapan Data Steward Senior per domain.',
    ],
    filterTingkat: ['Master Data', 'Data Transaksional', 'Data Analitik'],
  },
  'A.4': {
    kpiLabels: ['Data Terklasifikasi Rahasia/Terbatas', 'Kebijakan Masking Aktif', 'Insiden DLP Periode Ini', 'Kepatuhan Enkripsi at-Rest'],
    kpiUnits: ['%', 'kebijakan', 'insiden', '%'],
    tableColumns: ['Domain / Modul', 'Klasifikasi Data', 'Kebijakan Masking', 'Status Enkripsi', 'Status'],
    entitySource: 'domain',
    domainNames: DOMAIN_INTEGRASI,
    chartLabel: 'Tren Insiden DLP per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} menegakkan kebijakan klasifikasi data, masking dinamis, dan Data Loss Prevention lintas seluruh modul aplikasi.`,
    insightTemplates: [
      'Nol insiden DLP tereskalasi pada periode berjalan; seluruh percobaan akses tidak sah berhasil diblokir.',
      'Kebijakan masking dinamis sudah diterapkan penuh pada data personel (SDM) dan keuangan (Garkeu).',
    ],
    filterTingkat: ['Data Rahasia', 'Data Terbatas', 'Data Biasa'],
  },
  'C.1': {
    kpiLabels: ['Service Contract Aktif', 'Domain Tervalidasi Skema', 'SLA Terpenuhi', 'Versi Kontrak Terbaru'],
    kpiUnits: ['kontrak', 'domain', '%', ''],
    tableColumns: ['Domain Integrasi', 'Versi Service Contract', 'Metode Otentikasi', 'Pemenuhan SLA', 'Status'],
    entitySource: 'domain',
    domainNames: DOMAIN_INTEGRASI,
    chartLabel: 'Pemenuhan SLA Service Contract per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} mendaftar service contract 8 domain integrasi DIV TIK: status, SLA, dan versi kontrak API sesuai dokumen wajib DOC-04.`,
    insightTemplates: [
      'Seluruh 8 domain integrasi telah memiliki service contract terversi dan tervalidasi skema payload.',
      'Domain E-DUMAS dan E-AUDIT mencatat pemenuhan SLA tertinggi sepanjang periode berjalan.',
    ],
    filterTingkat: ['v1', 'v1.1', 'v2 (draft)'],
  },
  'C.2': {
    kpiLabels: ['Skor Kualitas Data Rata-rata', 'Rekonsiliasi Berhasil', 'Anomali Skema Terdeteksi', 'Domain Sudah Selaras Skema'],
    kpiUnits: ['skor', '%', 'anomali', 'domain'],
    tableColumns: ['Domain Integrasi', 'Completeness', 'Accuracy', 'Timeliness', 'Status'],
    entitySource: 'domain',
    domainNames: DOMAIN_INTEGRASI,
    chartLabel: 'Tren Skor Kualitas Data per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} memantau metrik kualitas data hasil rekonsiliasi antar sumber (completeness, accuracy, timeliness) per domain integrasi DIV TIK.`,
    insightTemplates: [
      'Rekonsiliasi otomatis berhasil menyelaraskan skema pada seluruh domain kecuali satu yang masih menunggu update dari DIV TIK.',
      'Skor kualitas data domain SSDM meningkat signifikan setelah perbaikan mapping NRP-NIK.',
    ],
    filterTingkat: ['Harian', 'Mingguan', 'Bulanan'],
  },
  'E.1': {
    kpiLabels: ['Model Terdaftar di Registry', 'Model Berstatus Produksi', 'Uptime Layanan Inferensi', 'Rata-rata Waktu Deploy'],
    kpiUnits: ['model', 'model', '%', 'menit'],
    tableColumns: ['Nama Model / Pipeline', 'Versi', 'Tahap', 'Terakhir Dilatih Ulang', 'Status'],
    entitySource: 'model',
    chartLabel: 'Uptime Layanan Inferensi per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} memantau pipeline MLOps: registry model, versi, tahap deployment (staging/canary/produksi), dan kesehatan layanan inferensi seluruh model E.2-E.7.`,
    insightTemplates: [
      'Seluruh model produksi memenuhi target uptime 99.5% sesuai kebijakan AI Governance (E.7).',
      'Model dengan drift terdeteksi otomatis ditandai untuk pelatihan ulang oleh MLOps Engineer.',
    ],
    filterTingkat: ['Staging', 'Canary', 'Produksi'],
  },
  'E.2': {
    kpiLabels: ['Dokumen Terindeks', 'Sumber Pengetahuan Aktif', 'Rata-rata Relevansi Retrieval', 'Job Pengindeksan Tertunda'],
    kpiUnits: ['dokumen', 'sumber', '%', 'job'],
    tableColumns: ['Sumber Pengetahuan', 'Jenis Dokumen', 'Jumlah Terindeks', 'Terakhir Diperbarui', 'Status'],
    entitySource: 'dokumen',
    chartLabel: 'Volume Dokumen Terindeks per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} adalah basis pengetahuan pengawasan berbasis Retrieval-Augmented Generation, menyuplai konteks untuk ChatItwasum Copilot (E.5) dan Auto Report Generator (E.3).`,
    insightTemplates: [
      'Basis pengetahuan mencakup seluruh Business Rule dan FSD BA-SA sebagai sumber utama.',
      'Rata-rata relevansi retrieval meningkat setelah pembaruan embedding pada dokumen SPEKTEK.',
    ],
    filterTingkat: ['Regulasi', 'BA-SA', 'Temuan Historis'],
  },
  'E.3': {
    kpiLabels: ['Laporan Dibuat Periode Ini', 'Rata-rata Waktu Generate', 'Tingkat Persetujuan Tanpa Revisi', 'Antrean Aktif'],
    kpiUnits: ['laporan', 'menit', '%', 'antrean'],
    tableColumns: ['ID Antrean', 'Jenis Laporan', 'Diminta Oleh', 'Waktu Generate', 'Status'],
    entitySource: 'model',
    chartLabel: 'Volume Laporan Otomatis per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} menghasilkan laporan otomatis dan ringkasan eksekutif dari data pengawasan aktif, mengurangi waktu penyusunan laporan manual pimpinan.`,
    insightTemplates: [
      'Ringkasan eksekutif otomatis untuk Beranda Overview (SF-002) dihasilkan tanpa revisi pada mayoritas permintaan.',
      'Waktu generate laporan triwulanan turun dibanding proses manual sebelumnya.',
    ],
    filterTingkat: ['Ringkasan Eksekutif', 'Laporan Triwulanan', 'Laporan Ad-hoc'],
  },
  'E.4': {
    kpiLabels: ['Anomali Terdeteksi Periode Ini', 'Anomali Dikonfirmasi Valid', 'False Positive Rate', 'Rata-rata Waktu Deteksi'],
    kpiUnits: ['anomali', '%', '%', 'menit'],
    tableColumns: ['ID Anomali', 'Domain Data', 'Jenis Anomali', 'Tingkat Keyakinan Model', 'Status'],
    entitySource: 'model',
    chartLabel: 'Volume Anomali Terdeteksi per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} mendeteksi anomali data pengawasan (rule + light ML) yang memicu Early Warning Pengawasan (B.18) secara otomatis.`,
    insightTemplates: [
      'False positive rate berada dalam target di bawah 8% setelah kalibrasi threshold model.',
      'Anomali pada domain Garkeu menjadi kategori terbanyak yang tervalidasi sebagai temuan riil.',
    ],
    filterTingkat: ['Anomali Keuangan', 'Anomali Kinerja', 'Anomali Dokumen'],
  },
  'E.6': {
    kpiLabels: ['Dokumen Diproses Periode Ini', 'Akurasi Ekstraksi Entitas', 'Rata-rata Waktu Proses', 'Dokumen Menunggu Review Manual'],
    kpiUnits: ['dokumen', '%', 'detik', 'dokumen'],
    tableColumns: ['Nama Dokumen', 'Jenis Dokumen', 'Entitas Terekstrak', 'Akurasi', 'Status'],
    entitySource: 'dokumen',
    chartLabel: 'Volume Dokumen Diproses Document AI per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} melakukan OCR, Named Entity Recognition, dan ekstraksi entitas dari dokumen audit/temuan yang diunggah ke seluruh modul pengawasan.`,
    insightTemplates: [
      'Akurasi ekstraksi entitas pada dokumen BAST dan LHP berada di atas 95%.',
      'Dokumen tulisan tangan/scan kualitas rendah masih memerlukan review manual auditor.',
    ],
    filterTingkat: ['LHP', 'BAST', 'Bukti Dukung'],
  },
  'E.7': {
    kpiLabels: ['Model dalam Risk Register', 'Risiko Tinggi Belum Dimitigasi', 'Permintaan LLM Diaudit', 'Kepatuhan Kebijakan AI'],
    kpiUnits: ['model', 'risiko', 'permintaan', '%'],
    tableColumns: ['Model / Layanan AI', 'Kategori Risiko', 'Status Mitigasi', 'Pemilik Risiko', 'Status'],
    entitySource: 'model',
    chartLabel: 'Permintaan LLM Diaudit per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} menegakkan kebijakan tata kelola AI, risk register per model, dan audit trail permintaan LLM (dokumen wajib DOC-05, memakai auditLogger.logLLMQuestion yang sudah ada).`,
    insightTemplates: [
      'Seluruh permintaan ke ChatItwasum Copilot (E.5) tercatat pada audit trail sesuai kebijakan AI Governance.',
      'Risk register menandai model Anomaly Detector sebagai risiko sedang karena masih dalam tahap kalibrasi.',
    ],
    filterTingkat: ['Risiko Tinggi', 'Risiko Sedang', 'Risiko Rendah'],
  },
  'E.8': {
    kpiLabels: ['Sisa Kuota Bulan Ini', 'Biaya Berjalan Bulan Ini', 'Sisa Durasi Subscription', 'Uptime Layanan Cloud AI'],
    kpiUnits: ['%', 'Rp', 'bulan', '%'],
    tableColumns: ['Layanan Cloud AI', 'Paket', 'Pemakaian Bulan Ini', 'Biaya Estimasi', 'Status'],
    entitySource: 'model',
    chartLabel: 'Tren Biaya Layanan AI Cloud Managed per Bulan',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} memantau status dan biaya berjalan langganan layanan AI cloud terkelola (Rp 3.758.923.000 nilai penuh RKA-K/L) selama 12 bulan pasca go-live.`,
    insightTemplates: [
      'Pemakaian kuota bulan berjalan masih di bawah alokasi bulanan rata-rata.',
      'Porsi Termin 1 sebesar Rp 995.435.000 dari total paket sudah ditagihkan sesuai BoQ.',
    ],
    filterTingkat: ['Inferensi LLM', 'Penyimpanan Vektor', 'Komputasi Model'],
  },
  'B.11': {
    kpiLabels: ['Sesi Aktif Saat Ini', 'Login Gagal 24 Jam Terakhir', 'Kepatuhan 2FA/OTP', 'Rata-rata Durasi Sesi'],
    kpiUnits: ['sesi', 'percobaan', '%', 'menit'],
    tableColumns: ['Pengguna / Peran', 'Metode 2FA', 'Perangkat', 'Login Terakhir', 'Status'],
    entitySource: 'polda',
    chartLabel: 'Tren Percobaan Login Gagal per Periode',
    narrativeTemplate: (kode, label) => `Modul ${kode} ${label} memantau status konfigurasi keamanan otentikasi: login kredensial, lupa kata sandi berbasis OTP, verifikasi 2FA, dan kebijakan sesi tunggal/timeout (BA-SA Feature Catalog B.11: BR-LA-001..004, BR-OTP-001..002, WF-LP-001..003).`,
    insightTemplates: [
      'Kebijakan single active session mencegah login ganda dari perangkat berbeda secara bersamaan.',
      'Seluruh percobaan login gagal berulang otomatis memicu penguncian sementara sesuai BR-LA-003.',
    ],
    filterTingkat: ['Mabes', 'Polda', 'Polres'],
  },
};

const DEFAULT_BLUEPRINT: ModuleContentBlueprint = {
  kpiLabels: ['Total Objek Dipantau', 'Status Aman', 'Perlu Perhatian', 'Rata-rata Skor'],
  kpiUnits: ['objek', '%', 'objek', 'skor'],
  tableColumns: ['Nama', 'Kategori', 'Nilai', 'Terakhir Diperbarui', 'Status'],
  entitySource: 'polda',
  chartLabel: 'Tren per Periode',
  narrativeTemplate: (kode, label) => `Modul ${kode} ${label} sedang dalam tahap pengembangan mock data awal sesuai lingkup SPEKTEK.`,
  insightTemplates: ['Data ditampilkan sebagai mock deterministik untuk kebutuhan demonstrasi antarmuka.'],
  filterTingkat: ['Mabes', 'Polda', 'Polres'],
};

const BIDANG_FILTER = ['Semua', 'Garkeu', 'Opsnal', 'Sarpras', 'SDM'];
const PERIODE_FILTER = ['Triwulan I 2026', 'Triwulan II 2026', 'Triwulan III 2026', 'Triwulan IV 2026'];

function toneFromScore(rng: ReturnType<typeof createSeededRng>, biasSafe = 0.6): GenericTone {
  const r = rng.next();
  if (r < biasSafe) return 'aman';
  if (r < biasSafe + 0.28) return 'perhatian';
  return 'kritis';
}

function entityLabels(source: ModuleContentBlueprint['entitySource'], domainNames: string[] | undefined, rng: ReturnType<typeof createSeededRng>, count: number): string[] {
  if (source === 'domain') return rng.sample(domainNames || DOMAIN_INTEGRASI, Math.min(count, (domainNames || DOMAIN_INTEGRASI).length));
  if (source === 'model') return rng.sample(MODEL_AI, Math.min(count, MODEL_AI.length));
  if (source === 'dokumen') {
    const jenis = ['LHP', 'BAST', 'KKA', 'Surat Usulan', 'Naskah Dinas', 'Bukti Dukung', 'Risalah Rapat'];
    return Array.from({ length: count }, (_, i) => `${rng.pick(jenis)} No. ${1000 + i}/${rng.pick(['WAS', 'IRSUS', 'ITWIL'])}/2026`);
  }
  return rng.sample(POLDA_DATA, Math.min(count, POLDA_DATA.length)).map((p) => p.nama);
}

/**
 * Menghasilkan konten modul generik secara deterministik. Aman dipanggil berulang kali
 * (misalnya pada setiap render) karena seed = `moduleDef.kode` (+ opsional pengubah filter).
 */
export function getGenericModuleContent(moduleDef: Pick<ModuleDefinition, 'kode' | 'label'>): GenericModuleContent {
  const blueprint = BLUEPRINTS[moduleDef.kode] || DEFAULT_BLUEPRINT;
  const rng = createSeededRng(moduleDef.kode || moduleDef.label);

  const kpis: GenericKpi[] = blueprint.kpiLabels.map((label, idx) => {
    const unit = blueprint.kpiUnits[idx];
    const tone = idx === 1 ? 'aman' : idx === 2 ? toneFromScore(rng, 0.5) : 'netral';
    const isPercent = unit === '%';
    const isRp = unit === 'Rp';
    const raw = isPercent ? rng.round(78, 99, 1) : isRp ? rng.int(180, 950) * 1_000_000 : rng.int(6, 240);
    const value = isPercent
      ? `${raw}%`
      : isRp
      ? `Rp ${raw.toLocaleString('id-ID')}`
      : `${raw.toLocaleString('id-ID')}${unit ? ` ${unit}` : ''}`;
    const deltaSign = rng.bool(0.65) ? '+' : '-';
    const delta = `${deltaSign}${rng.round(0.5, 6.5, 1)}% dibanding periode lalu`;
    return { id: `kpi-${idx}`, label, value, delta, tone };
  });

  const entities = entityLabels(blueprint.entitySource, blueprint.domainNames, rng, 12);
  const statusLabelMap: Record<GenericTone, string> = { aman: 'Aman', perhatian: 'Perlu Perhatian', kritis: 'Kritis', netral: 'Netral' };

  const tableRows: GenericTableRow[] = entities.map((name, idx) => {
    const tone = TONE_ORDER[Math.min(TONE_ORDER.length - 1, rng.int(0, 10) < 6 ? 0 : rng.int(0, 10) < 8 ? 1 : 2)];
    const cols = [name];
    for (let c = 1; c < blueprint.tableColumns.length - 1; c++) {
      cols.push(genericColumnValue(blueprint.tableColumns[c], rng));
    }
    return {
      id: `row-${moduleDef.kode || 'x'}-${idx}`,
      cols,
      status: tone,
      statusLabel: statusLabelMap[tone],
      detailRingkasan: `${name} tercatat dengan status "${statusLabelMap[tone]}" pada periode pemantauan berjalan.`,
      detailCatatan: [
        `Kode modul sumber: ${moduleDef.kode}.`,
        rng.pick(blueprint.insightTemplates),
        'Data ini adalah mock deterministik untuk demonstrasi; nilai riil menunggu integrasi data mart (A.2) & service contract DIV TIK (C.1).',
      ],
    };
  });

  const chart: GenericChartPoint[] = PERIODE_FILTER.map((periode) => ({
    periode,
    nilai: rng.round(60, 96, 1),
    target: 85,
  }));

  return {
    kpis,
    tableColumns: blueprint.tableColumns,
    tableRows,
    chart,
    chartLabel: blueprint.chartLabel,
    narrative: blueprint.narrativeTemplate(moduleDef.kode, moduleDef.label),
    insight: blueprint.insightTemplates,
    filterBidang: BIDANG_FILTER,
    filterTingkat: ['Semua', ...blueprint.filterTingkat],
    filterPeriode: ['Semua Periode', ...PERIODE_FILTER],
  };
}

function genericColumnValue(columnLabel: string, rng: ReturnType<typeof createSeededRng>): string {
  const lower = columnLabel.toLowerCase();
  if (lower.includes('status') || lower.includes('tahap') || lower.includes('level')) {
    return rng.pick(['Draft', 'Dalam Proses', 'Menunggu Persetujuan', 'Selesai']);
  }
  if (lower.includes('skor') || lower.includes('nilai') || lower.includes('akurasi') || lower.includes('kepatuhan') || lower.includes('sla') || lower.includes('completeness') || lower.includes('accuracy') || lower.includes('timeliness')) {
    return `${rng.round(70, 99, 1)}%`;
  }
  if (lower.includes('aging') || lower.includes('hari')) {
    return `${rng.int(1, 180)} hari`;
  }
  if (lower.includes('terakhir') || lower.includes('tanggal')) {
    const tanggal = rng.int(1, 28);
    const bulan = rng.pick(['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep']);
    return `${tanggal} ${bulan} 2026`;
  }
  if (lower.includes('versi')) {
    return `v${rng.int(1, 3)}.${rng.int(0, 9)}`;
  }
  if (lower.includes('auditor') || lower.includes('pemohon') || lower.includes('penyusun') || lower.includes('pemilik')) {
    return rng.pick(['Kompol Fitri Handayani', 'AKBP Wahyu Kuncoro', 'Kombes Pol. Dedi Supriyadi', 'Tim Data Steward Itwasum']);
  }
  return rng.pick(DOMAIN_INTEGRASI);
}
