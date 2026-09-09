/**
 * Standar Penilaian Rentang Nilai Risiko & Status Atensi / TLHP
 * Sesuai Dokumen Resmi Itwasum Polri (Matriks 5 Tingkat)
 *
 * Rentang Nilai Risiko | Pernyataan Rentang Nilai Risiko | Simbol Warna
 * ---------------------------------------------------------------------
 * 20 - 25              | Sangat Tinggi                   | Merah
 * 16 - 19              | Tinggi                          | Jingga
 * 12 - 15              | Sedang                          | Kuning
 * 6 - 11               | Rendah                          | Hijau
 * 1 - 5                | Sangat Rendah                   | Biru
 */

export type TingkatRisikoKey = 
  | 'sangat_tinggi' 
  | 'tinggi' 
  | 'sedang' 
  | 'rendah' 
  | 'sangat_rendah';

export interface RentangRisikoDef {
  no: number; // 1 to 5
  key: TingkatRisikoKey;
  label: string; // 'Sangat Tinggi', 'Tinggi', 'Sedang', 'Rendah', 'Sangat Rendah'
  rentang: string; // '20 - 25', '16 - 19', etc.
  minScore: number;
  maxScore: number;
  simbolWarna: 'Merah' | 'Jingga' | 'Kuning' | 'Hijau' | 'Biru';
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  cardBorderLeft: string;
  hexCode: string;
}

export const MATRIKS_RENTANG_RISIKO: RentangRisikoDef[] = [
  {
    no: 1,
    key: 'sangat_tinggi',
    label: 'Sangat Tinggi',
    rentang: '20 - 25',
    minScore: 20,
    maxScore: 25,
    simbolWarna: 'Merah',
    badgeBg: 'bg-red-600',
    badgeText: 'text-white',
    badgeBorder: 'border-red-700',
    dotColor: 'bg-red-600',
    cardBorderLeft: 'border-l-4 border-l-red-600',
    hexCode: '#DC2626'
  },
  {
    no: 2,
    key: 'tinggi',
    label: 'Tinggi',
    rentang: '16 - 19',
    minScore: 16,
    maxScore: 19,
    simbolWarna: 'Jingga',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    badgeBorder: 'border-orange-600',
    dotColor: 'bg-orange-500',
    cardBorderLeft: 'border-l-4 border-l-orange-500',
    hexCode: '#F97316'
  },
  {
    no: 3,
    key: 'sedang',
    label: 'Sedang',
    rentang: '12 - 15',
    minScore: 12,
    maxScore: 15,
    simbolWarna: 'Kuning',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-slate-950 font-bold',
    badgeBorder: 'border-amber-500',
    dotColor: 'bg-amber-400',
    cardBorderLeft: 'border-l-4 border-l-amber-400',
    hexCode: '#FACC15'
  },
  {
    no: 4,
    key: 'rendah',
    label: 'Rendah',
    rentang: '6 - 11',
    minScore: 6,
    maxScore: 11,
    simbolWarna: 'Hijau',
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-white',
    badgeBorder: 'border-emerald-700',
    dotColor: 'bg-emerald-600',
    cardBorderLeft: 'border-l-4 border-l-emerald-600',
    hexCode: '#16A34A'
  },
  {
    no: 5,
    key: 'sangat_rendah',
    label: 'Sangat Rendah',
    rentang: '1 - 5',
    minScore: 1,
    maxScore: 5,
    simbolWarna: 'Biru',
    badgeBg: 'bg-blue-600',
    badgeText: 'text-white',
    badgeBorder: 'border-blue-700',
    dotColor: 'bg-blue-600',
    cardBorderLeft: 'border-l-4 border-l-blue-600',
    hexCode: '#2563EB'
  }
];

/**
 * Mendapatkan definisi risiko berdasarkan nilai skor 1 - 25
 */
export function getDefinisiRisikoByScore(score: number): RentangRisikoDef {
  const clampedScore = Math.max(1, Math.min(25, Math.round(score)));
  
  if (clampedScore >= 20) return MATRIKS_RENTANG_RISIKO[0]; // 20 - 25: Sangat Tinggi (Merah)
  if (clampedScore >= 16) return MATRIKS_RENTANG_RISIKO[1]; // 16 - 19: Tinggi (Jingga)
  if (clampedScore >= 12) return MATRIKS_RENTANG_RISIKO[2]; // 12 - 15: Sedang (Kuning)
  if (clampedScore >= 6)  return MATRIKS_RENTANG_RISIKO[3]; // 6 - 11: Rendah (Hijau)
  return MATRIKS_RENTANG_RISIKO[4];                         // 1 - 5: Sangat Rendah (Biru)
}

/**
 * Mendapatkan definisi risiko dari string status legacy (kritis, tinggi, perhatian, aman)
 */
export function getDefinisiRisikoFromLegacy(status?: string, fallbackScore?: number): RentangRisikoDef {
  if (fallbackScore !== undefined && fallbackScore > 0) {
    return getDefinisiRisikoByScore(fallbackScore);
  }

  switch (status?.toLowerCase()) {
    case 'kritis':
    case 'sangat tinggi':
    case 'sangat_tinggi':
      return MATRIKS_RENTANG_RISIKO[0]; // Merah
    case 'tinggi':
      return MATRIKS_RENTANG_RISIKO[1]; // Jingga
    case 'perhatian':
    case 'sedang':
      return MATRIKS_RENTANG_RISIKO[2]; // Kuning
    case 'aman':
    case 'rendah':
      return MATRIKS_RENTANG_RISIKO[3]; // Hijau
    case 'sangat rendah':
    case 'sangat_rendah':
      return MATRIKS_RENTANG_RISIKO[4]; // Biru
    default:
      return MATRIKS_RENTANG_RISIKO[2]; // Sedang
  }
}

/**
 * Hitung nilai risiko Atensi / TLHP (skala 1 - 25) dari jumlah temuan terbuka dan persentase TLHP
 */
export function hitungNilaiRisikoTLHP(temuanTerbuka: number, persenTLHP: number): {
  score: number;
  def: RentangRisikoDef;
} {
  // Bobot: temuan terbuka menyumbang hingga 15 poin, defisit TLHP menyumbang hingga 10 poin
  const poinTemuan = Math.min(15, Math.round((temuanTerbuka / 15) * 15));
  const defisitTLHP = Math.max(0, 100 - persenTLHP);
  const poinDefisit = Math.min(10, Math.round((defisitTLHP / 100) * 10));
  
  const score = Math.max(1, Math.min(25, poinTemuan + poinDefisit));
  return {
    score,
    def: getDefinisiRisikoByScore(score)
  };
}

export interface SatkerAtensiTLHPInfo {
  score: number;
  def: RentangRisikoDef;
  persenTLHP: number;
  statusAtensi: string;
  statusAtensiShort: string;
  statusTLHP: string;
  keterangan: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  hexCode: string;
  ringClass: string;
  borderClass: string;
  heatRadiusKm: number;
  heatOpacity: number;
}

/**
 * Menghitung dan mengekstrak informasi komprehensif Status Atensi & TLHP untuk Satker
 */
export function getSatkerAtensiTLHP(item: {
  temuanTerbuka?: number;
  temuanSelesai?: number;
  totalTemuan?: number;
  status?: string;
  capaianIKU?: number;
  skorRisiko?: number;
}): SatkerAtensiTLHPInfo {
  const terbuka = item.temuanTerbuka ?? 0;
  const selesai = item.temuanSelesai ?? 0;
  const total = item.totalTemuan ?? (terbuka + selesai);
  
  const persenTLHP = total > 0 ? Math.round((selesai / total) * 100) : 100;
  
  // Jika sudah ada skor risiko terhitung sebelumnya gunakan itu, jika tidak hitung dari TLHP
  const riskResult = item.skorRisiko && item.skorRisiko >= 1 && item.skorRisiko <= 25
    ? { score: item.skorRisiko, def: getDefinisiRisikoByScore(item.skorRisiko) }
    : hitungNilaiRisikoTLHP(terbuka, persenTLHP);

  const { def, score } = riskResult;

  let statusAtensi = 'Atensi Pengawasan (Pemantauan)';
  let statusAtensiShort = 'Atensi Pengawasan';
  let statusTLHP = 'TLHP Berjalan';
  let keterangan = 'Dalam batas toleransi pengawasan rutin.';
  let ringClass = 'ring-amber-400';
  let borderClass = 'border-amber-400';
  let heatRadiusKm = 35;
  let heatOpacity = 0.22;

  switch (def.key) {
    case 'sangat_tinggi':
      statusAtensi = 'Sangat Tinggi';
      statusAtensiShort = 'Sangat Tinggi';
      statusTLHP = 'TLHP <50%';
      keterangan = 'Sangat tinggi: indikator pengawasan prioritas utama dengan pencapaian TLHP di bawah 50%.';
      ringClass = 'ring-red-600';
      borderClass = 'border-red-600';
      heatRadiusKm = 70;
      heatOpacity = 0.35;
      break;

    case 'tinggi':
      statusAtensi = 'Tinggi';
      statusAtensiShort = 'Tinggi';
      statusTLHP = 'TLHP 50-69%';
      keterangan = 'Tinggi: penanganan tindak lanjut perlu dipercepat agar target TLHP segera naik.';
      ringClass = 'ring-orange-500';
      borderClass = 'border-orange-500';
      heatRadiusKm = 50;
      heatOpacity = 0.28;
      break;

    case 'sedang':
      statusAtensi = 'Sedang';
      statusAtensiShort = 'Sedang';
      statusTLHP = 'TLHP 70-84%';
      keterangan = 'Sedang: pemantauan tetap diperlukan agar penyelesaian TLHP konsisten.';
      ringClass = 'ring-amber-400';
      borderClass = 'border-amber-400';
      heatRadiusKm = 35;
      heatOpacity = 0.20;
      break;

    case 'rendah':
      statusAtensi = 'Rendah';
      statusAtensiShort = 'Rendah';
      statusTLHP = 'TLHP 85-94%';
      keterangan = 'Rendah: kinerja tindak lanjut sudah baik dan berada dalam zona aman.';
      ringClass = 'ring-emerald-500';
      borderClass = 'border-emerald-500';
      heatRadiusKm = 22;
      heatOpacity = 0.15;
      break;

    case 'sangat_rendah':
      statusAtensi = 'Sangat Rendah';
      statusAtensiShort = 'Sangat Rendah';
      statusTLHP = 'TLHP ≥95%';
      keterangan = 'Sangat rendah: seluruh rekomendasi audit telah ditindaklanjuti secara akuntabel.';
      ringClass = 'ring-blue-600';
      borderClass = 'border-blue-600';
      heatRadiusKm = 15;
      heatOpacity = 0.12;
      break;
  }

  return {
    score,
    def,
    persenTLHP,
    statusAtensi,
    statusAtensiShort,
    statusTLHP,
    keterangan,
    badgeBg: def.badgeBg,
    badgeText: def.badgeText,
    badgeBorder: def.badgeBorder,
    hexCode: def.hexCode,
    ringClass,
    borderClass,
    heatRadiusKm,
    heatOpacity
  };
}

/**
 * Skala warna Heatmap Triwulan TLHP & Kepatuhan sesuai 5 Tingkat Atensi Itwasum
 */
export function getQuarterlyHeatmapColor(score: number): {
  bgClass: string;
  textClass: string;
  hexCode: string;
  statusKey: TingkatRisikoKey;
  statusLabel: string;
  atensiBadge: string;
} {
  const rounded = Math.round(score);

  if (rounded >= 90) {
    return {
      bgClass: 'bg-blue-600 hover:bg-blue-700',
      textClass: 'text-white',
      hexCode: '#2563EB',
      statusKey: 'sangat_rendah',
      statusLabel: 'Patuh Sempurna',
      atensiBadge: 'Sangat Rendah (≥90%)'
    };
  }
  if (rounded >= 80) {
    return {
      bgClass: 'bg-emerald-600 hover:bg-emerald-700',
      textClass: 'text-white',
      hexCode: '#16A34A',
      statusKey: 'rendah',
      statusLabel: 'Kepatuhan Baik',
      atensiBadge: 'Rendah (80-89%)'
    };
  }
  if (rounded >= 65) {
    return {
      bgClass: 'bg-amber-400 hover:bg-amber-500',
      textClass: 'text-slate-950 font-bold',
      hexCode: '#FACC15',
      statusKey: 'sedang',
      statusLabel: 'Atensi Pengawasan',
      atensiBadge: 'Sedang (65-79%)'
    };
  }
  if (rounded >= 50) {
    return {
      bgClass: 'bg-orange-500 hover:bg-orange-600',
      textClass: 'text-white',
      hexCode: '#F97316',
      statusKey: 'tinggi',
      statusLabel: 'Atensi Khusus',
      atensiBadge: 'Tinggi (50-64%)'
    };
  }
  return {
    bgClass: 'bg-red-600 hover:bg-red-700',
    textClass: 'text-white',
    hexCode: '#DC2626',
    statusKey: 'sangat_tinggi',
    statusLabel: 'Atensi Kritis',
    atensiBadge: 'Sangat Tinggi (<50%)'
  };
}

