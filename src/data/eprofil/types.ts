/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tipe detail E-Profile (Plan bagian 5a) — pelengkap `PoldaSatker.eProfil` (11 field) yang
 * sudah dipakai Beranda/peta. Modul ini TIDAK mengubah bentuk `PoldaSatker`; hanya menambah
 * lapisan data baru untuk 5 tab detail B.1 (Ringkasan Eksekutif, Operasional/Kinerja, SDM,
 * Sarpras, Garkeu) yang berlaku untuk seluruh 34 Polda + satker Mabes.
 */

export interface EProfilAiSummary {
  deskripsi: string;
  penekanan: string[];
  highlightChips: string[];
  confidence: number; // 0-100
}

export type EProfilDomain = 'Operasional/Kinerja' | 'SDM' | 'Sarana & Prasarana' | 'Garkeu';

export interface EProfilKualitasDataDomain {
  domain: EProfilDomain;
  persen: number;
  status: 'Data Lengkap' | 'Data Belum Lengkap';
}

export interface EProfilKualitasData {
  persenSiap: number;
  status: 'Data Lengkap' | 'Data Belum Lengkap';
  domains: EProfilKualitasDataDomain[];
}

export interface EProfilRiskDimension {
  axis: string;
  value: number; // 0-100
}

export interface EProfilFokusPraAudit {
  id: string;
  title: string;
  description: string;
  score: number;
  level: 'TINGGI' | 'SEDANG' | 'RENDAH';
}

export interface EProfilSkorRisiko {
  dimensions: EProfilRiskDimension[];
  fokusPraAudit: EProfilFokusPraAudit[];
}

export type EProfilTemuanDomainKey = 'operasional' | 'sdm' | 'sarpras' | 'garkeu';

export interface EProfilTemuanAi {
  id: string;
  rank: number;
  namaTemuan: string;
  domain: string;
  dampak: string;
  risiko: 'TINGGI' | 'SEDANG' | 'RENDAH';
  aiConfidence: number;
  referensi: string;
}

export interface EProfilRekomendasi {
  id: string;
  areaPemeriksaan: string;
  prioritas: 'KRITIS' | 'TINGGI' | 'SEDANG';
  alasanAi: string;
  rekomendasiPemeriksaan: string;
}

export interface EProfilSumberDataItem {
  id: string;
  namaDokumen: string;
  updateTerakhir: string;
}

export interface EProfilLabeledValue {
  label: string;
  value: number;
  displayValue?: string;
}

export interface EProfilTargetRealisasiRow {
  indikator: string;
  target: string;
  realisasi: string;
  gap: string;
  status: 'Tercapai' | 'Mendekati Target' | 'Belum Tercapai';
  trend: 'up' | 'down' | 'flat';
}

export interface EProfilOperasional {
  targetVsRealisasi: EProfilTargetRealisasiRow[];
  statistik: EProfilLabeledValue[];
  top5TindakPidana: EProfilLabeledValue[];
  risikoPerFungsi: EProfilLabeledValue[];
}

export interface EProfilSdm {
  komposisi: EProfilLabeledValue[];
  golongan: EProfilLabeledValue[];
  mutasi: { masuk: number; keluar: number; promosi: number };
  disiplin: { kasus: number; selesai: number };
  kehadiranPersen: number;
}

export interface EProfilAnomaliAset {
  kodeAset: string;
  namaAset: string;
  kategori: string;
  lokasi: string;
  kondisiAset: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  infoAnomaliAi: string;
}

export interface EProfilSarpras {
  statusKendaraan: EProfilLabeledValue[];
  statusKontrak: EProfilLabeledValue[];
  kesehatanAsetPersen: number;
  persediaan: EProfilLabeledValue[];
  anomaliAset: EProfilAnomaliAset[];
}

export interface EProfilGarkeu {
  paguRp: string;
  realisasiRp: string;
  sisaRp: string;
  persenRealisasi: number;
  trenVsTarget: { periode: string; realisasi: number; target: number }[];
  penyerapanDipaPersen: number;
  setoranPnbpRp: string;
  siklusPembayaranHariRataRata: number;
  pajakDipungutRp: string;
  arusKasBersihRp: string;
}

export interface EProfilDetail {
  satkerId: string;
  aiSummary: EProfilAiSummary;
  kualitasData: EProfilKualitasData;
  skorRisiko: EProfilSkorRisiko;
  temuanAiEksekutif: EProfilTemuanAi[];
  temuanAiByDomain: Record<EProfilTemuanDomainKey, EProfilTemuanAi[]>;
  rekomendasiByDomain: Record<EProfilTemuanDomainKey, EProfilRekomendasi[]>;
  sumberDataByDomain: Record<EProfilTemuanDomainKey, EProfilSumberDataItem[]>;
  operasional: EProfilOperasional;
  sdm: EProfilSdm;
  sarpras: EProfilSarpras;
  garkeu: EProfilGarkeu;
}
