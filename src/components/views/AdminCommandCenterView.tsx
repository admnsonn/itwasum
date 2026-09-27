import React from 'react';
import { 
  Shield, 
  Users, 
  KeyRound, 
  Database, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck,
  FileCheck,
  Server,
  Lock,
  ArrowLeftRight
} from 'lucide-react';
import { CurrentUserProfile, MainNavId } from '../../types';

interface AdminCommandCenterViewProps {
  currentUser: CurrentUserProfile;
  onNavigateToPengaturan: (tab?: 'users' | 'rbac' | 'master') => void;
  onOpenRoleSwitcher?: () => void;
}

export const AdminCommandCenterView: React.FC<AdminCommandCenterViewProps> = ({
  currentUser,
  onNavigateToPengaturan,
  onOpenRoleSwitcher
}) => {
  const isSuperAdmin = currentUser.peran === 'super_admin';

  // Sample recent administrative audit logs
  const adminActivityLogs = [
    {
      id: 'log-1',
      waktu: '10 menit yang lalu',
      user: 'AKP Denny Prasetyo, S.H. (Admin Polda Riau)',
      aksi: 'Mengajukan mutasi hak akses operator Polres Dumai ke Auditor Muda',
      status: 'Menunggu Approval Pusat',
      tipe: 'warning'
    },
    {
      id: 'log-2',
      waktu: '35 menit yang lalu',
      user: 'Kompol Agus Triyono (Super Admin Mabes)',
      aksi: 'Menyetujui aktivasi akun Kombes Pol. Dedi Supriyadi (Tim Audit ST/412)',
      status: 'Berhasil Diverifikasi',
      tipe: 'success'
    },
    {
      id: 'log-3',
      waktu: '1 jam yang lalu',
      user: 'Sistem Keamanan Otomatis',
      aksi: 'Sinkronisasi Master Satker 34 Polda & 508 Polres jajaran',
      status: 'Sinkron 100%',
      tipe: 'success'
    },
    {
      id: 'log-4',
      waktu: '2 jam yang lalu',
      user: 'AKBP Ronald Sumaja, S.I.K. (Auditee Polres Kampar)',
      aksi: 'Login sesi terverifikasi melalui autentikasi dua faktor (2FA)',
      status: 'Sesi Aktif',
      tipe: 'info'
    },
    {
      id: 'log-5',
      waktu: '3 jam yang lalu',
      user: 'Super Admin Mabes',
      aksi: 'Rotasi kunci enkripsi sesi AES-256 berkala sistem E-Audit',
      status: 'Sukses Diperbarui',
      tipe: 'success'
    }
  ];

  return (
    <div id="admin-command-center-view" className="space-y-5 animate-in fade-in">
      
      {/* Top Header Card */}
      <div className="bg-[#0B2B5C] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                  {isSuperAdmin ? 'Super Admin L0 (Sistem Mabes)' : 'Admin Polda L2 (Sistem Daerah)'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-blue-200">
                  {currentUser.titikWilayahNama}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Pusat Kendali Administrator Sistem E-Audit
              </h1>
              <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                Pengelolaan akun personel, kontrol hak akses (RBAC), data master satker, dan audit log sistem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              onClick={() => onNavigateToPengaturan('users')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Kelola Pengguna</span>
            </button>
          </div>
        </div>
      </div>

      {/* Segregation of Duties (SoD) Explanatory Notice */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start gap-3.5 shadow-xs">
        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
          <Lock className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-amber-950 flex-1">
          <div className="font-extrabold text-sm text-amber-900">
            Prinsip Pemisahan Tugas (Segregation of Duties - SoD)
          </div>
          <p className="leading-relaxed">
            Sesuai pedoman baku E-Audit Itwasum Polri, akun <strong>Administrator ({currentUser.peranLabel})</strong> bertugas menjaga integritas infrastruktur pengguna, hak akses, dan log aktivitas. Admin <strong>sengaja tidak menampilkan indikator operasional temuan audit</strong> untuk memastikan independensi sistem dari konflik kepentingan pemeriksa atau auditee.
          </p>
          <div className="pt-1 flex items-center gap-2 font-bold text-[11px] text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Kewenangan Aktif: {isSuperAdmin ? 'Manajemen Pengguna Nasional & Persetujuan Hak Akses' : 'Manajemen Pengguna Wilayah Polda Riau & 12 Polres Jajaran'}</span>
          </div>
        </div>
      </div>

      {/* 4 Administrative KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">Total Akun Terdaftar</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{isSuperAdmin ? '128' : '19'}</span>
            <span className="text-xs font-bold text-slate-500">Personel</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSuperAdmin ? '124 Akun Aktif (96.8%)' : '18 Akun Aktif (94.7%)'}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">Usulan Hak Akses</span>
            <KeyRound className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{isSuperAdmin ? '3' : '1'}</span>
            <span className="text-xs font-bold text-amber-600 font-semibold">Menunggu Review</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {isSuperAdmin ? 'Pusat persetujuan nasional' : 'Diusulkan ke Itwasum Mabes'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">Cakupan Satker</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{isSuperAdmin ? '542' : '13'}</span>
            <span className="text-xs font-bold text-slate-500">Satker / Satwil</span>
          </div>
          <div className="text-[11px] text-blue-600 font-bold">
            {isSuperAdmin ? 'Mabes, 34 Polda & 508 Polres' : 'Mapolda Riau & 12 Polres'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-bold">Audit Trail (24 Jam)</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{isSuperAdmin ? '412' : '48'}</span>
            <span className="text-xs font-bold text-slate-500">Log Tercatat</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Enkripsi Log Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => onNavigateToPengaturan('users')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#0B2B5C] shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-[#0B2B5C] group-hover:text-white text-[#0B2B5C] flex items-center justify-center transition">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0B2B5C] transition">
              Tata Kelola Akun Pengguna
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Tambah, nonaktifkan, atau atur profil login operator, auditor, auditee, dan pimpinan satuan kerja.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-bold text-[#0B2B5C]">
            <span>Buka Modul Pengguna</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateToPengaturan('rbac')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#0B2B5C] shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 group-hover:bg-amber-500 group-hover:text-slate-950 text-amber-700 flex items-center justify-center transition">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0B2B5C] transition">
              Kontrol Akses (Role-Based RBAC)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Konfigurasi 8 peran resmi, matriks hak akses 3 poros, dan review permohonan mutasi wewenang.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-bold text-amber-700">
            <span>Buka Matriks RBAC</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateToPengaturan('master')}
          className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-[#0B2B5C] shadow-xs hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-700 flex items-center justify-center transition">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-[#0B2B5C] transition">
              Pengaturan Data Master Terpadu
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Katalog kode satker, nomenklatur jabatan pimpinan, parameter IKU, dan kategori jenis temuan wasrik.
            </p>
          </div>
          <div className="pt-4 flex items-center gap-1 text-xs font-bold text-emerald-700">
            <span>Buka Master Data</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </div>
        </div>
      </div>

      {/* Recent Administrative Audit Trail */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Jejak Audit Aktivitas Sistem (Audit Trail)
            </h3>
            <p className="text-xs text-slate-500">
              Catatan autentikasi dan manipulasi hak akses yang tercatat otomatis dalam log server:
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Real-Time Log
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {adminActivityLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  log.tipe === 'warning' ? 'bg-amber-100 text-amber-700' :
                  log.tipe === 'success' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {log.tipe === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                   log.tipe === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                   <Activity className="w-4 h-4" />}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {log.aksi}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Oleh: <strong className="text-slate-700">{log.user}</strong> • {log.waktu}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 ${
                log.tipe === 'warning' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                log.tipe === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
