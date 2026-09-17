import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'b11',
  workflowId: 'WF-B11',
  screens: [
    { slug: 'kebijakan-2fa', nama: 'Kebijakan 2FA & OTP', deskripsi: 'Status kepatuhan BR-LA dan BR-OTP untuk seluruh peran aplikasi.' },
    { slug: 'status-sesi', nama: 'Status Sesi', deskripsi: 'Kebijakan sesi tunggal dan timeout sesuai Feature Catalog B.11.' },
  ],
};

export function buildSections(_moduleDef: ModuleDefinition, _screenSlug: string): SectionDescriptor[] {
  return [
    {
      kind: 'awaiting-integration',
      sumber: 'Gateway Otentikasi DIV TIK (target produksi)',
      tahap: 'Sinkronisasi kebijakan OTP produksi',
      kontrak: 'BR-LA-001 s.d. BR-OTP-002',
    },
    {
      kind: 'workflow',
      title: 'Alur kebijakan otentikasi (bukan formulir login)',
      variant: 'steps',
      steps: ['Kredensial', 'OTP', 'Reset sandi'],
      currentStep: 1,
    },
    {
      kind: 'narrative',
      title: 'Acuan Business Rule',
      body:
        'Modul B.11 memantau konfigurasi keamanan otentikasi: kebijakan kredensial (BR-LA-001..004), verifikasi OTP dua faktor (BR-OTP-001..002), serta alur lupa kata sandi (WF-LP-001..003). Tampilan ini bukan halaman login, melainkan dashboard kepatuhan kebijakan untuk administrator sistem.',
      bullets: [
        'BR-LA-003: penguncian sementara setelah percobaan gagal berulang.',
        'BR-OTP-001: OTP wajib untuk peran Pengawas Tim ke atas.',
        'Single active session mencegah sesi ganda pada perangkat berbeda.',
      ],
    },
    {
      kind: 'table',
      title: 'Status kebijakan 2FA per kelompok peran',
      rowKey: 'id',
      columns: [
        { key: 'peran', header: 'Kelompok Peran' },
        { key: 'otp', header: 'OTP Wajib' },
        { key: 'metode', header: 'Metode 2FA' },
        { key: 'sesi', header: 'Kebijakan Sesi' },
        { key: 'status', header: 'Status Kepatuhan' },
      ],
      rows: [
        { id: '1', peran: 'Administrator Sistem', otp: 'Ya', metode: 'TOTP aplikasi', sesi: 'Tunggal · 30 menit idle', status: 'Patuh' },
        { id: '2', peran: 'Pengawas Tim / Irwil', otp: 'Ya', metode: 'TOTP + SMS cadangan', sesi: 'Tunggal · 45 menit', status: 'Patuh' },
        { id: '3', peran: 'Auditor / Ketua Tim', otp: 'Ya', metode: 'TOTP aplikasi', sesi: 'Tunggal · 60 menit', status: 'Patuh' },
        { id: '4', peran: 'Auditee (read-only)', otp: 'Opsional', metode: 'Email OTP', sesi: 'Multi · 120 menit', status: 'Dalam penyesuaian' },
      ],
    },
  ];
}
