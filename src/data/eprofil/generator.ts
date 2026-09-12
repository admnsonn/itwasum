/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Generator deterministik detail E-Profile (Plan bagian 5a). `getEProfilDetail(satkerId, anchor)`
 * membangkitkan data lengkap 5 tab profil satker dari seed id satker via `createSeededRng`, agar
 * angka konsisten antar render/reload. Bila anchor Polda tersedia (`PoldaSatker.eProfil` /
 * `rincianTemuan[]`), angka pagu/realisasi dan temuan AI diturunkan darinya agar konsisten dengan
 * Beranda; bila tidak (satker Mabes), seluruh angka dibangkitkan sintetik dari seed id.
 */
import { createSeededRng } from '../../utils/seededRandom';
import type { PoldaSatker } from '../../types';
import type {
  EProfilAnomaliAset,
  EProfilDetail,
  EProfilFokusPraAudit,
  EProfilRekomendasi,
  EProfilSumberDataItem,
  EProfilTemuanAi,
  EProfilTemuanDomainKey,
} from './types';

export interface EProfilAnchor {
  id: string;
  nama: string;
  rincianTemuan?: PoldaSatker['rincianTemuan'];
  eProfilLegacy?: PoldaSatker['eProfil'];
  rbsScoreAnchor?: number; // 0-100, dari analisisLanjutan.rbsScore atau SatkerMabesItem.skorRisiko
}

const DOMAIN_LABELS: Record<EProfilTemuanDomainKey, string> = {
  operasional: 'Operasional/Kinerja',
  sdm: 'SDM',
  sarpras: 'Sarana & Prasarana',
  garkeu: 'Garkeu',
};

const TEMUAN_TEMPLATES: Record<EProfilTemuanDomainKey, string[]> = {
  operasional: [
    'Penurunan penyelesaian perkara tindak pidana prioritas triwulan berjalan',
    'Anomali pola pelaporan gangguan Kamtibmas di wilayah hukum',
    'Keterlambatan input data operasional ke sistem SSOT terpusat',
    'Deviasi target vs realisasi indikator kinerja operasional utama',
    'Pola duplikasi pelaporan kejadian pada beberapa satwil jajaran',
  ],
  sdm: [
    'Kekosongan jabatan strategis pada beberapa satuan kerja jajaran',
    'Tingkat pelanggaran disiplin personel di atas rata-rata nasional',
    'Rasio kehadiran personel menurun dibanding periode sebelumnya',
    'Ketidaksesuaian distribusi golongan pangkat dengan struktur ideal',
    'Keterlambatan proses mutasi personel purna tugas',
  ],
  sarpras: [
    'Anomali pencatatan aset BMN pada beberapa unit kerja',
    'Kondisi kendaraan dinas roda 4 di bawah ambang layak operasional',
    'Kontrak pemeliharaan sarpras mendekati/telah jatuh tempo',
    'Selisih stok persediaan logistik hasil rekonsiliasi sistem',
    'Aset bernilai tinggi belum terverifikasi kondisi fisiknya',
  ],
  garkeu: [
    'Penyerapan DIPA di bawah target pada beberapa mata anggaran',
    'Keterlambatan penyetoran PNBP ke kas negara',
    'Siklus pembayaran vendor melampaui SLA standar',
    'Anomali arus kas pada periode akhir triwulan',
    'Potensi tunggakan pajak pada transaksi belanja modal',
  ],
};

function buildTemuanForDomain(rng: ReturnType<typeof createSeededRng>, domainKey: EProfilTemuanDomainKey, startRank: number, count: number): EProfilTemuanAi[] {
  const templates = TEMUAN_TEMPLATES[domainKey];
  return Array.from({ length: count }, (_, i) => {
    const risiko = rng.pick<EProfilTemuanAi['risiko']>(['TINGGI', 'SEDANG', 'RENDAH']);
    return {
      id: `temuan-${domainKey}-${startRank + i}`,
      rank: startRank + i,
      namaTemuan: templates[i % templates.length],
      domain: DOMAIN_LABELS[domainKey],
      dampak: rng.pick(['Berdampak pada capaian kinerja satker', 'Berpotensi menimbulkan temuan berulang', 'Berdampak pada akurasi pelaporan nasional']),
      risiko,
      aiConfidence: rng.int(72, 98),
      referensi: rng.pick(['Dok. SPJ Triwulan', 'Sistem SSDM', 'Sistem SAKTI/SIMAK-BMN', 'Rekap Laporan Kejadian']),
    };
  });
}

function buildRekomendasi(rng: ReturnType<typeof createSeededRng>, domainKey: EProfilTemuanDomainKey): EProfilRekomendasi[] {
  const areas: Record<EProfilTemuanDomainKey, string[]> = {
    operasional: ['Tata Kelola Penyelesaian Perkara', 'Akurasi Pelaporan Kejadian', 'Kepatuhan SOP Operasional'],
    sdm: ['Pengelolaan Jabatan Strategis', 'Pembinaan Disiplin Personel', 'Distribusi Pangkat & Golongan'],
    sarpras: ['Pencatatan Aset BMN', 'Kelaikan Kendaraan Dinas', 'Manajemen Kontrak Pemeliharaan'],
    garkeu: ['Optimalisasi Penyerapan DIPA', 'Kepatuhan Penyetoran PNBP', 'Efisiensi Siklus Pembayaran'],
  };
  return areas[domainKey].map((area, i) => {
    const prioritas: EProfilRekomendasi['prioritas'] = i === 0 ? 'KRITIS' : i === 1 ? 'TINGGI' : 'SEDANG';
    return {
      id: `rekom-${domainKey}-${i}`,
      areaPemeriksaan: area,
      prioritas,
      alasanAi: rng.pick([
        'Pola anomali terdeteksi konsisten pada 3 periode pelaporan terakhir.',
        'Deviasi signifikan dibanding rata-rata satker sejenis pada domain yang sama.',
        'Indikasi risiko meningkat berdasarkan korelasi lintas sumber data.',
      ]),
      rekomendasiPemeriksaan: rng.pick([
        'Lakukan uji petik dokumen pendukung dan konfirmasi lapangan.',
        'Verifikasi kesesuaian data sistem dengan bukti fisik/administrasi.',
        'Minta klarifikasi tertulis dan susun rencana tindak lanjut korektif.',
      ]),
    };
  });
}

function buildSumberData(rng: ReturnType<typeof createSeededRng>, domainKey: EProfilTemuanDomainKey): EProfilSumberDataItem[] {
  const docs: Record<EProfilTemuanDomainKey, string[]> = {
    operasional: ['Rekap Laporan Kejadian Bulanan', 'Data SPKT Terpadu', 'Laporan Gelar Perkara', 'Statistik Kriminal Presisi'],
    sdm: ['Data SSDM Personel', 'Rekap Mutasi & Promosi', 'Laporan Disiplin Propam', 'Data Kehadiran Presensi'],
    sarpras: ['Data SIMAK-BMN', 'Kontrak Pemeliharaan Aset', 'Rekap Kondisi Kendaraan Dinas', 'Laporan Persediaan Logistik'],
    garkeu: ['Data SAKTI DIPA', 'Rekap Setoran PNBP', 'Laporan Arus Kas Bendahara', 'Rekap Perpajakan Belanja'],
  };
  return docs[domainKey].map((nama, i) => ({
    id: `sumber-${domainKey}-${i}`,
    namaDokumen: nama,
    updateTerakhir: `${rng.int(1, 28)} Agu 2026`,
  }));
}

const cache = new Map<string, EProfilDetail>();

export function getEProfilDetail(anchor: EProfilAnchor): EProfilDetail {
  const cacheKey = anchor.id;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const rng = createSeededRng(`eprofil-${anchor.id}`);
  const rbsAnchor = anchor.rbsScoreAnchor ?? rng.int(40, 95);
  const confidence = rng.int(78, 97);

  const temuanAiByDomain = (['operasional', 'sdm', 'sarpras', 'garkeu'] as EProfilTemuanDomainKey[]).reduce((acc, key) => {
    acc[key] = buildTemuanForDomain(rng, key, 1, 5);
    return acc;
  }, {} as Record<EProfilTemuanDomainKey, EProfilTemuanAi[]>);

  // Eksekutif: turunan dari `rincianTemuan[]` bila ada (tidak pernah dirender sebelumnya), gabungan seluruh domain jika tidak.
  const temuanAiEksekutif: EProfilTemuanAi[] = anchor.rincianTemuan && anchor.rincianTemuan.length > 0
    ? anchor.rincianTemuan.slice(0, 5).map((t, i) => ({
        id: `temuan-eksekutif-${t.id}`,
        rank: i + 1,
        namaTemuan: t.judul,
        domain: t.kategori,
        dampak: t.nilaiRupiah ? `Nilai indikatif ${t.nilaiRupiah}` : 'Berdampak pada capaian kinerja satker',
        risiko: t.tingkat === 'Kritis' ? 'TINGGI' : t.tingkat === 'Sedang' ? 'SEDANG' : 'RENDAH',
        aiConfidence: rng.int(80, 98),
        referensi: t.sumber,
      }))
    : [temuanAiByDomain.operasional[0], temuanAiByDomain.sdm[0], temuanAiByDomain.sarpras[0], temuanAiByDomain.garkeu[0], temuanAiByDomain.operasional[1]]
        .map((t, i) => ({ ...t, rank: i + 1 }));

  const rekomendasiByDomain = (['operasional', 'sdm', 'sarpras', 'garkeu'] as EProfilTemuanDomainKey[]).reduce((acc, key) => {
    acc[key] = buildRekomendasi(rng, key);
    return acc;
  }, {} as Record<EProfilTemuanDomainKey, EProfilRekomendasi[]>);

  const sumberDataByDomain = (['operasional', 'sdm', 'sarpras', 'garkeu'] as EProfilTemuanDomainKey[]).reduce((acc, key) => {
    acc[key] = buildSumberData(rng, key);
    return acc;
  }, {} as Record<EProfilTemuanDomainKey, EProfilSumberDataItem[]>);

  const persenSiap = rng.int(62, 100);

  const detail: EProfilDetail = {
    satkerId: anchor.id,
    aiSummary: {
      deskripsi: `Analisis AI menunjukkan ${anchor.nama} berada pada profil risiko ${rbsAnchor >= 80 ? 'rendah' : rbsAnchor >= 60 ? 'sedang' : 'tinggi'} dengan kesiapan data pra-audit ${persenSiap}%. Fokus pengawasan diarahkan pada domain dengan deviasi tertinggi terhadap baseline nasional.`,
      penekanan: [
        'Prioritaskan verifikasi domain dengan skor risiko tertinggi pada radar di bawah.',
        'Gunakan 5 Temuan Teratas AI sebagai dasar penyusunan program kerja pemeriksaan (KKA).',
      ],
      highlightChips: rng.sample(['Risiko Garkeu', 'Kepatuhan SDM', 'Aset BMN', 'Kinerja Operasional', 'Kesiapan Data'], 3),
      confidence,
    },
    kualitasData: {
      persenSiap,
      status: persenSiap >= 80 ? 'Data Lengkap' : 'Data Belum Lengkap',
      domains: (['Operasional/Kinerja', 'SDM', 'Sarana & Prasarana', 'Garkeu'] as const).map((domain) => ({
        domain,
        persen: rng.int(55, 100),
        status: rng.bool(0.75) ? 'Data Lengkap' : 'Data Belum Lengkap',
      })),
    },
    skorRisiko: {
      dimensions: [
        { axis: 'Operasional', value: rng.int(30, 95) },
        { axis: 'SDM', value: rng.int(30, 95) },
        { axis: 'Sarpras', value: rng.int(30, 95) },
        { axis: 'Garkeu', value: rng.int(30, 95) },
        { axis: 'Kepatuhan', value: rng.int(30, 95) },
      ],
      fokusPraAudit: Array.from({ length: 3 }, (_, i) => {
        const level: EProfilFokusPraAudit['level'] = i === 0 ? 'TINGGI' : i === 1 ? 'SEDANG' : 'RENDAH';
        return {
          id: `fokus-${anchor.id}-${i}`,
          title: rng.pick(['Verifikasi Realisasi Anggaran Belanja Modal', 'Pengujian Kepatuhan Administrasi SDM', 'Pengecekan Fisik Aset Bernilai Tinggi', 'Reviu Pengendalian Operasional Lapangan']),
          description: 'Direkomendasikan sebagai fokus pemeriksaan berdasarkan skor risiko komposit AI.',
          score: rng.int(60, 95),
          level,
        };
      }),
    },
    temuanAiEksekutif,
    temuanAiByDomain,
    rekomendasiByDomain,
    sumberDataByDomain,
    operasional: {
      targetVsRealisasi: [
        { indikator: 'Penyelesaian Perkara Prioritas', target: '85%', realisasi: `${rng.int(70, 95)}%`, gap: `${rng.round(-10, 5, 1)}%`, status: rng.pick(['Tercapai', 'Mendekati Target', 'Belum Tercapai']), trend: rng.pick(['up', 'down', 'flat']) },
        { indikator: 'Waktu Respons Panggilan Darurat', target: '15 menit', realisasi: `${rng.int(12, 22)} menit`, gap: `${rng.round(-5, 3, 1)} menit`, status: rng.pick(['Tercapai', 'Mendekati Target', 'Belum Tercapai']), trend: rng.pick(['up', 'down', 'flat']) },
        { indikator: 'Indeks Kepuasan Masyarakat', target: '80', realisasi: `${rng.int(70, 90)}`, gap: `${rng.round(-8, 6, 1)}`, status: rng.pick(['Tercapai', 'Mendekati Target', 'Belum Tercapai']), trend: rng.pick(['up', 'down', 'flat']) },
      ],
      statistik: [
        { label: 'Laporan Polisi Diterima', value: rng.int(800, 4200) },
        { label: 'Perkara Diselesaikan', value: rng.int(600, 3600) },
        { label: 'Operasi Kepolisian', value: rng.int(20, 120) },
        { label: 'Kegiatan Preemtif/Preventif', value: rng.int(50, 300) },
        { label: 'Gangguan Kamtibmas Tercatat', value: rng.int(100, 900) },
        { label: 'Kecelakaan Lalu Lintas', value: rng.int(80, 700) },
        { label: 'Patroli Terlaksana', value: rng.int(200, 1500) },
      ],
      top5TindakPidana: ['Pencurian', 'Narkotika', 'Penipuan/Penggelapan', 'KDRT', 'Kekerasan'].map((label) => ({ label, value: rng.int(30, 100), displayValue: `${rng.int(30, 400)} kasus` })),
      risikoPerFungsi: ['Reserse Kriminal', 'Lalu Lintas', 'Sabhara', 'Intelkam', 'Binmas'].map((label) => ({ label, value: rng.int(20, 100), displayValue: `${rng.int(20, 100)}%` })),
    },
    sdm: {
      komposisi: [
        { label: 'Perwira', value: rng.int(500, 4000) },
        { label: 'Bintara', value: rng.int(4000, 30000) },
        { label: 'ASN/PNS', value: rng.int(100, 1500) },
      ],
      golongan: ['Gol. I', 'Gol. II', 'Gol. III', 'Gol. IV'].map((label) => ({ label, value: rng.int(200, 5000) })),
      mutasi: { masuk: rng.int(20, 200), keluar: rng.int(20, 200), promosi: rng.int(10, 90) },
      disiplin: { kasus: rng.int(2, 40), selesai: rng.int(2, 38) },
      kehadiranPersen: rng.int(88, 99),
    },
    sarpras: {
      statusKendaraan: ['Layak Operasional', 'Perlu Perbaikan', 'Rusak Berat'].map((label) => ({ label, value: rng.int(5, 90), displayValue: `${rng.int(5, 90)}%` })),
      statusKontrak: ['Aktif', 'Mendekati Jatuh Tempo', 'Jatuh Tempo'].map((label) => ({ label, value: rng.int(2, 40) })),
      kesehatanAsetPersen: rng.int(70, 98),
      persediaan: ['Amunisi', 'BBM', 'ATK & Cetak', 'Suku Cadang'].map((label) => ({ label, value: rng.int(100, 5000) })),
      anomaliAset: Array.from({ length: rng.int(2, 5) }, (_, i): EProfilAnomaliAset => ({
        kodeAset: `BMN-${rng.int(10000, 99999)}`,
        namaAset: rng.pick(['Kendaraan Patroli R4', 'Radio HT Genggam', 'Genset Cadangan', 'Komputer Server Satwil', 'Rompi Anti Peluru']),
        kategori: rng.pick(['Alat Angkutan', 'Peralatan Komunikasi', 'Peralatan Kantor', 'Alat Keamanan']),
        lokasi: rng.pick(['Mako Utama', 'Gudang Logistik', 'Polsek Jajaran']),
        kondisiAset: rng.pick(['Baik', 'Rusak Ringan', 'Rusak Berat']),
        infoAnomaliAi: rng.pick(['Status pencatatan tidak sesuai kondisi fisik terakhir', 'Tidak ditemukan pada opname fisik terbaru', 'Nilai buku tidak sesuai standar penyusutan']),
      })),
    },
    garkeu: (() => {
      const paguRp = anchor.eProfilLegacy?.garkeuDipa ?? `Rp ${rng.round(0.3, 2, 2)} Triliun`;
      const realisasiRp = anchor.eProfilLegacy?.garkeuRealisasi ?? `Rp ${rng.round(0.2, 1.8, 2)} Triliun`;
      const persenRealisasi = anchor.eProfilLegacy?.persenSerapan ?? rng.round(70, 96, 1);
      return {
        paguRp,
        realisasiRp,
        sisaRp: `Rp ${rng.round(0.02, 0.3, 2)} Triliun`,
        persenRealisasi,
        trenVsTarget: ['Tw I', 'Tw II', 'Tw III', 'Tw IV'].map((periode) => ({ periode, realisasi: rng.round(15, 30, 1), target: rng.round(20, 28, 1) })),
        penyerapanDipaPersen: persenRealisasi,
        setoranPnbpRp: `Rp ${rng.round(1, 40, 1)} Miliar`,
        siklusPembayaranHariRataRata: rng.int(3, 21),
        pajakDipungutRp: `Rp ${rng.round(0.5, 12, 1)} Miliar`,
        arusKasBersihRp: `Rp ${rng.round(0.1, 5, 1)} Miliar`,
      };
    })(),
  };

  cache.set(cacheKey, detail);
  return detail;
}
