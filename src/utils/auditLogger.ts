import { AuditLogEntry, AuditLogKejadian, CurrentUserProfile } from '../types';

const STORAGE_KEY = 'satudata_itwasum_audit_logs';

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    waktu: '06 Sep 2026, 14:15:22 WIB',
    kejadian: 'Buka Overview',
    user: 'Komjen Pol. Ahmad Dofiri, M.Si.',
    peran: 'Pimpinan Tertinggi (L0)',
    titikWilayah: 'Mabes Polri (Nasional)',
    detail: {
      wilayah: 'Nasional',
      bidang: '4 Bidang (Opsnal, SDM, Logistik, Garkeu)',
      periode: 'T.A. 2026'
    }
  },
  {
    id: 'log-2',
    waktu: '06 Sep 2026, 14:18:05 WIB',
    kejadian: 'Drill-down',
    user: 'Komjen Pol. Ahmad Dofiri, M.Si.',
    peran: 'Pimpinan Tertinggi (L0)',
    titikWilayah: 'Mabes Polri (Nasional)',
    detail: {
      dariSimpul: 'Nasional (L0)',
      keSimpul: 'Polda Sumatera Utara (L2)'
    }
  },
  {
    id: 'log-3',
    waktu: '06 Sep 2026, 13:45:10 WIB',
    kejadian: 'Ekspor',
    user: 'Kombes Pol. Hermansyah, S.I.K., M.H.',
    peran: 'Pimpinan Tertinggi (L2)',
    titikWilayah: 'Polda Riau',
    detail: {
      wilayah: 'Polda Riau & 12 Polres Jajaran',
      bidang: 'Garkeu & Opsnal',
      periode: 'Semester I 2026',
      format: 'PDF Laporan Eksekutif'
    }
  },
  {
    id: 'log-4',
    waktu: '06 Sep 2026, 12:20:41 WIB',
    kejadian: 'Akses ditolak',
    user: 'AKP Denny Prasetyo, S.H.',
    peran: 'Admin Polda (L2)',
    titikWilayah: 'Polda Riau',
    detail: {
      yangDiminta: 'Drill-up ke Agregat Nasional (L0) & Itwil I',
      alasanDitolak: 'Pelanggaran batas wilayah hirarki L2. User hanya berwenang pada titik wilayah terdaftar dan jajaran ke bawah.'
    }
  },
  {
    id: 'log-5',
    waktu: '06 Sep 2026, 11:10:14 WIB',
    kejadian: 'Ubah hak akses user',
    user: 'Kompol Agus Triyono, S.Kom., M.T.I.',
    peran: 'Super Admin (L0)',
    titikWilayah: 'Mabes Polri (Nasional)',
    detail: {
      yangDiminta: 'Penambahan Bidang Audit AKP Denny Prasetyo',
      nilaiLama: 'Bidang: Kosong (Admin Murni)',
      nilaiBaru: 'Bidang: Kosong (Permohonan baca KPI ditolak)',
      siapaMenyetujui: 'Super Admin TI Mabes (Sesuai Aturan E-Audit)'
    }
  },
  {
    id: 'log-6',
    waktu: '06 Sep 2026, 10:02:18 WIB',
    kejadian: 'Akses ditolak',
    user: 'AKBP Ronald Sumaja, S.I.K.',
    peran: 'Auditee (Objek Periksa)',
    titikWilayah: 'Polres Kampar',
    detail: {
      yangDiminta: 'Akses Langsung Halaman Overview Eksekutif',
      alasanDitolak: 'Peran Auditee dibatasi pada lembar kerja E-Audit. Akses dialihkan ke modul E-Audit.'
    }
  }
];

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_AUDIT_LOGS;
  }
}

export function saveAuditLog(entry: Omit<AuditLogEntry, 'id' | 'waktu'>): AuditLogEntry {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Jakarta'
  };
  const waktuStr = `${now.toLocaleDateString('id-ID', options)} WIB`;

  const newEntry: AuditLogEntry = {
    id: `log-${Date.now()}`,
    waktu: waktuStr,
    ...entry
  };

  try {
    const logs = getAuditLogs();
    const updated = [newEntry, ...logs].slice(0, 100); // keep up to 100
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Unable to persist audit log', e);
  }

  return newEntry;
}

// Shortcut logging helpers
export function logBukaOverview(user: CurrentUserProfile, simpulName?: string) {
  saveAuditLog({
    kejadian: 'Buka Overview',
    user: user.nama,
    peran: `${user.peranLabel} (${user.level})`,
    titikWilayah: user.titikWilayahNama,
    detail: {
      wilayah: simpulName || user.titikWilayahNama,
      bidang: user.bidang.length > 0 ? user.bidang.join(', ') : 'Tanpa Bidang (Admin)',
      periode: 'T.A. 2026'
    }
  });
}

export function logDrillDown(user: CurrentUserProfile, dari: string, ke: string) {
  saveAuditLog({
    kejadian: 'Drill-down',
    user: user.nama,
    peran: `${user.peranLabel} (${user.level})`,
    titikWilayah: user.titikWilayahNama,
    detail: {
      dariSimpul: dari,
      keSimpul: ke
    }
  });
}

export function logEkspor(user: CurrentUserProfile, format: string, wilayah: string) {
  saveAuditLog({
    kejadian: 'Ekspor',
    user: user.nama,
    peran: `${user.peranLabel} (${user.level})`,
    titikWilayah: user.titikWilayahNama,
    detail: {
      wilayah,
      bidang: user.bidang.join(', ') || 'Semua',
      format
    }
  });
}

export function logAksesDitolak(user: CurrentUserProfile, yangDiminta: string, alasanDitolak: string) {
  saveAuditLog({
    kejadian: 'Akses ditolak',
    user: user.nama,
    peran: `${user.peranLabel} (${user.level})`,
    titikWilayah: user.titikWilayahNama,
    detail: {
      yangDiminta,
      alasanDitolak
    }
  });
}

export function logUbahHakAkses(
  actor: CurrentUserProfile, 
  targetUser: string, 
  nilaiLama: string, 
  nilaiBaru: string,
  penyetuju: string
) {
  saveAuditLog({
    kejadian: 'Ubah hak akses user',
    user: actor.nama,
    peran: `${actor.peranLabel} (${actor.level})`,
    titikWilayah: actor.titikWilayahNama,
    detail: {
      yangDiminta: `Ubah hak akses personel: ${targetUser}`,
      nilaiLama,
      nilaiBaru,
      siapaMenyetujui: penyetuju
    }
  });
}

export function logRingkasanAI(user: CurrentUserProfile, levelLabel: string, summary: string) {
  saveAuditLog({
    kejadian: 'Buka/Perbarui Ringkasan AI',
    user: user.nama,
    peran: `${user.peranLabel} (${user.level})`,
    titikWilayah: user.titikWilayahNama,
    detail: {
      yangDiminta: `Ringkasan AI ${levelLabel}`,
      nilaiBaru: summary,
      alasanDitolak: user.canViewAiSummary ? 'Diperbarui dari data aktif' : 'Akses AI summary dibatasi hak akses'
    }
  });
}

export function logLLMQuestion(user: CurrentUserProfile, question: string, answerScope: string) {
  saveAuditLog({
    kejadian: 'Pertanyaan ke LLM',
    user: user.nama,
    peran: `${user.peranLabel} (${user.level})`,
    titikWilayah: user.titikWilayahNama,
    detail: {
      yangDiminta: question,
      nilaiLama: answerScope,
      nilaiBaru: 'Jawaban dipenuhi dari data aktif saat itu'
    }
  });
}

export function logLLMQuestionDenied(user: CurrentUserProfile, question: string, reason: string) {
  saveAuditLog({
    kejadian: 'Pertanyaan ditolak LLM',
    user: user.nama,
    peran: `${user.peranLabel} (${user.level})`,
    titikWilayah: user.titikWilayahNama,
    detail: {
      yangDiminta: question,
      alasanDitolak: reason
    }
  });
}

export function logUbahMasterItwil(user: CurrentUserProfile, perubahan: string) {
  saveAuditLog({
    kejadian: 'Ubah master penugasan Itwil',
    user: user.nama,
    peran: `${user.peranLabel} (${user.level})`,
    titikWilayah: user.titikWilayahNama,
    detail: {
      yangDiminta: `Master penugasan Itwil: ${perubahan}`,
      nilaiBaru: 'Cakupan objek audit binaan diperbarui dan berlaku pada periode aktif'
    }
  });
}
