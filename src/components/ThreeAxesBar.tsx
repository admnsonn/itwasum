import React from 'react';
import { 
  JenjangPengguna, 
  BidangAudit, 
  TingkatObjek,
  CurrentUserProfile,
  BidangName
} from '../types';
import { 
  Shield, 
  Sliders, 
  Lock, 
  ArrowRight, 
  ChevronDown, 
  ShieldCheck, 
  Layers, 
  FileSpreadsheet, 
  Send, 
  Info,
  Check,
  Building2,
  MapPin,
  Compass,
  AlertOctagon,
  User
} from 'lucide-react';
import { ITWIL_METADATA } from '../data/mabesSatkerData';

interface ThreeAxesBarProps {
  jenjang: JenjangPengguna;
  onSelectJenjang: (jenjang: JenjangPengguna) => void;
  bidang: BidangAudit;
  onSelectBidang: (bidang: BidangAudit) => void;
  tingkatObjek: TingkatObjek;
  onSelectTingkatObjek: (tingkat: TingkatObjek) => void;
  onOpenMetodologi?: () => void;
  onOpenDataEditor?: () => void;
  onOpenLogoExplorer?: () => void;
  onOpenRoleSwitcher?: () => void;
  onOpenGapsModal?: () => void;
  onOpenKPICustomizer?: () => void;
  onOpenUsulanModal?: () => void;
  onTriggerSecurityRejection?: (attempted: string, reason: string) => void;
  activeOverridesCount?: number;
  currentUser?: CurrentUserProfile;
}

export const ThreeAxesBar: React.FC<ThreeAxesBarProps> = ({
  jenjang,
  onSelectJenjang,
  bidang,
  onSelectBidang,
  tingkatObjek,
  onSelectTingkatObjek,
  onOpenMetodologi,
  onOpenRoleSwitcher,
  onOpenGapsModal,
  onOpenKPICustomizer,
  onOpenUsulanModal,
  onTriggerSecurityRejection,
  currentUser
}) => {
  const userLevel = currentUser?.level || 'L0';
  const userRole = currentUser?.peran || 'pimpinan_tertinggi';
  const allowedBidang: BidangName[] = currentUser?.bidang || [];
  const isAdmin = userRole === 'super_admin' || userRole === 'admin_polda';
  const isL1 = userLevel === 'L1';
  const isL2 = userLevel === 'L2';
  const isL3 = userLevel === 'L3';

  const hasBidangGarkeu = allowedBidang.includes('Garkeu');
  const hasBidangOpsnal = allowedBidang.includes('Opsnal');
  const hasBidangLogistik = allowedBidang.includes('Logistik');
  const hasBidangSdm = allowedBidang.includes('SDM');

  // Security test simulation
  const handleAttemptIllegalDrillUp = () => {
    if (onTriggerSecurityRejection) {
      onTriggerSecurityRejection(
        `Eskalasi Akses Ilegal: Akun ${currentUser?.nama || 'Pengguna'} (${userLevel}) mencoba membuka Ruang Komando Nasional (L0)`,
        `Berdasarkan Ketentuan Baku RBAC Buku Manual E-Audit (Hal 3 & 5): Pengguna terikat pada satu titik wilayah (${currentUser?.titikWilayahNama}) dan hanya memiliki hak memantau ke bawah dalam jajarannya. Akses vertikal ke atas atau lateral ke wilayah lain dicegat dan dicatat pada Log Audit Siber Polri.`
      );
    }
  };

  // Format clean level label
  const getLevelPill = () => {
    switch (userLevel) {
      case 'L0':
        return { label: 'Tingkat L0 • Nasional', desc: 'Mabes Polri (Komando Pusat)', color: 'bg-[#0B2545] text-amber-300 border-[#1E3A8A]' };
      case 'L1':
        return { label: 'Tingkat L1 • Wilayah', desc: currentUser?.titikWilayahNama || 'Inspektorat Wilayah', color: 'bg-slate-800 text-sky-300 border-slate-700' };
      case 'L2':
        return { label: 'Tingkat L2 • Polda', desc: currentUser?.titikWilayahNama || 'Polda Kewilayahan', color: 'bg-slate-800 text-emerald-300 border-slate-700' };
      case 'L3':
        return { label: 'Tingkat L3 • Polres', desc: currentUser?.titikWilayahNama || 'Polres Definitif', color: 'bg-slate-800 text-amber-300 border-slate-700' };
      default:
        return { label: 'Tingkat Sistem', desc: 'Akses Terbatas', color: 'bg-slate-800 text-slate-200 border-slate-700' };
    }
  };

  const levelInfo = getLevelPill();

  return (
    <div 
      aria-label="Matriks Kendali Pengawasan Tiga Poros"
      className="grid grid-cols-1 md:grid-cols-12 gap-3"
    >
      {/* ============================================================ */}
      {/* POROS 1: Yurisdiksi Wilayah (Hirarki L0 - L3) */}
      {/* ============================================================ */}
      <div className="md:col-span-12 lg:col-span-5 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900">
                Yurisdiksi Wilayah
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {userLevel === 'L0' && 'Cakupan Nasional (L0)'}
              {userLevel === 'L1' && 'Wilayah Binaan (L1)'}
              {userLevel === 'L2' && 'Kewilayahan Polda (L2)'}
              {userLevel === 'L3' && 'Satker Definitif (L3)'}
            </span>
          </div>

          {/* L0: National Commander Selectors */}
          {userLevel === 'L0' && (
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto">
                <button
                  onClick={() => onSelectJenjang('kapolri')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center cursor-pointer ${
                    jenjang === 'kapolri'
                      ? 'bg-[#0B2545] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  Kapolri
                </button>
                <button
                  onClick={() => onSelectJenjang('irwasum')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition text-center cursor-pointer ${
                    jenjang === 'irwasum'
                      ? 'bg-[#0B2545] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  Irwasum
                </button>
              </div>

              {/* Dropdown Itwil with explicit regions */}
              <div className="relative w-full sm:flex-1">
                <select
                  value={jenjang.startsWith('itwil-') ? jenjang : 'itwil-1'}
                  onChange={(e) => onSelectJenjang(e.target.value as JenjangPengguna)}
                  className={`w-full appearance-none px-3 py-1.5 pr-8 rounded-lg text-xs font-medium transition cursor-pointer border ${
                    jenjang.startsWith('itwil-')
                      ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <option value="itwil-1" className="text-slate-900 bg-white">Itwil I (Sumut, Aceh, Riau, Sumbar, Kepri, Jambi)</option>
                  <option value="itwil-2" className="text-slate-900 bg-white">Itwil II (Jawa, Lampung, Sumbagsel, Banten)</option>
                  <option value="itwil-3" className="text-slate-900 bg-white">Itwil III (Jatim, Bali, NTB, NTT, Kalbar, Kalteng)</option>
                  <option value="itwil-4" className="text-slate-900 bg-white">Itwil IV (Sulawesi, Kalsel, Kaltim, Kaltara)</option>
                  <option value="itwil-5" className="text-slate-900 bg-white">Itwil V (Maluku, Maluku Utara, Papua)</option>
                </select>
                <ChevronDown className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  jenjang.startsWith('itwil-') ? 'text-white' : 'text-slate-400'
                }`} />
              </div>
            </div>
          )}

              {/* L1: Fixed Itwil Jurisdiction */}
              {userLevel === 'L1' && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0B2545] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {currentUser?.titikWilayahNama || 'Inspektorat Wilayah I (Itwil I)'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Wilayah Binaan: Aceh, Sumut, Sumbar, Riau, Kepri, Jambi
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 shrink-0">
                    L1 &rarr; L2 &rarr; L3
                  </span>
                </div>
              )}

              {/* L2: Fixed Polda Jurisdiction */}
              {userLevel === 'L2' && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#0B2545] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {currentUser?.titikWilayahNama || 'Polda Riau'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Cakupan: Satker Mapolda & 12 Polres Jajaran
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    L2 &rarr; L3
                  </span>
                </div>
              )}

              {/* L3: Fixed Polres Jurisdiction (Leaf Node) */}
              {userLevel === 'L3' && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#0B2545] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {currentUser?.titikWilayahNama || 'Polres Kampar (Polda Riau)'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Satker Definitif • Tingkat Akhir (Polsek Terkecualikan)
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 shrink-0">
                    Simpul Akhir (L3)
                  </span>
                </div>
              )}
            </div>

            {/* Micro Caption */}
            <div className="mt-2 text-[10px] text-slate-400">
              {userLevel === 'L0' && 'Wewenang penuh pemantauan seluruh data mart komando nasional.'}
              {userLevel === 'L1' && 'Akses terkunci pada wilayah binaan Itwil sesuai mandat pengawasan.'}
              {userLevel === 'L2' && 'Data terpusat pada Polda terdaftar dan Polres di bawah yurisdiksinya.'}
              {userLevel === 'L3' && 'Data mart tunggal Polres. Polsek tidak dimasukkan ke dalam agregat.'}
            </div>
          </div>

          {/* ============================================================ */}
          {/* POROS 2: Bidang Pengawasan (Pilar Audit) */}
          {/* ============================================================ */}
          <div className="md:col-span-12 lg:col-span-4 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    Bidang Pengawasan
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {isAdmin ? 'Admin Sistem' : `${allowedBidang.length} Bidang Dihaki`}
                </span>
              </div>

              {/* Segmented Control for Bidang Audit */}
              {isAdmin ? (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Hak Admin Pengelolaan Akun & Log (Data Pengawasan Kosong)</span>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
                  
                  {/* Option: Semua Bidang */}
                  <button
                    onClick={() => onSelectBidang('semua')}
                    className={`py-1.5 px-1 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                      bidang === 'semua'
                        ? 'bg-[#0B2545] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`}
                    title="Konsolidasi 4 Bidang Pengawasan"
                  >
                    Semua
                  </button>

                  {/* Option: Garkeu */}
                  {hasBidangGarkeu ? (
                    <button
                      onClick={() => onSelectBidang('garkeu')}
                      className={`py-1.5 px-1 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        bidang === 'garkeu'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="Bidang Anggaran & Keuangan (DIPA, IKPA, Temuan BPK)"
                    >
                      Garkeu
                    </button>
                  ) : (
                    <div 
                      className="py-1.5 px-1 rounded-md text-xs text-slate-300 font-medium text-center flex items-center justify-center gap-0.5 cursor-not-allowed opacity-50"
                      title="Bidang Garkeu terkunci untuk akun ini"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      <span>Garkeu</span>
                    </div>
                  )}

                  {/* Option: Opsnal */}
                  {hasBidangOpsnal ? (
                    <button
                      onClick={() => onSelectBidang('opsnal')}
                      className={`py-1.5 px-1 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        bidang === 'opsnal'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="Bidang Operasional & Pemeliharaan Kamtibmas"
                    >
                      Opsnal
                    </button>
                  ) : (
                    <div 
                      className="py-1.5 px-1 rounded-md text-xs text-slate-300 font-medium text-center flex items-center justify-center gap-0.5 cursor-not-allowed opacity-50"
                      title="Bidang Opsnal terkunci untuk akun ini"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      <span>Opsnal</span>
                    </div>
                  )}

                  {/* Option: Logistik */}
                  {hasBidangLogistik ? (
                    <button
                      onClick={() => onSelectBidang('sarpras')}
                      className={`py-1.5 px-1 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        bidang === 'sarpras'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="Bidang Sarana, Prasarana & Logistik (BMN)"
                    >
                      Logistik
                    </button>
                  ) : (
                    <div 
                      className="py-1.5 px-1 rounded-md text-xs text-slate-300 font-medium text-center flex items-center justify-center gap-0.5 cursor-not-allowed opacity-50"
                      title="Bidang Logistik terkunci untuk akun ini"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      <span>Logistik</span>
                    </div>
                  )}

                  {/* Option: SDM */}
                  {hasBidangSdm ? (
                    <button
                      onClick={() => onSelectBidang('sdm')}
                      className={`py-1.5 px-1 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        bidang === 'sdm'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="Bidang Sumber Daya Manusia & Kode Etik"
                    >
                      SDM
                    </button>
                  ) : (
                    <div 
                      className="py-1.5 px-1 rounded-md text-xs text-slate-300 font-medium text-center flex items-center justify-center gap-0.5 cursor-not-allowed opacity-50"
                      title="Bidang SDM terkunci untuk akun ini"
                    >
                      <Lock className="w-2.5 h-2.5" />
                      <span>SDM</span>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Micro Caption */}
            <div className="mt-2 text-[10px] text-slate-400">
              {allowedBidang.length === 4 
                ? 'Seluruh 4 pilar pengawasan aktif sesuai wewenang komando.'
                : `Akses spesifik pilar pengawasan: ${allowedBidang.join(', ')}.`}
            </div>
          </div>

          {/* ============================================================ */}
          {/* POROS 3: Tingkat Objek Pengawasan */}
          {/* ============================================================ */}
          <div className="md:col-span-12 lg:col-span-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900">
                    Tingkat Objek
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {userLevel === 'L0' ? 'Pemisahan Satker' : userLevel === 'L1' ? 'Polda vs Mabes' : 'Kewilayahan'}
                </span>
              </div>

              {/* Segmented Control for Tingkat Objek */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
                {userLevel === 'L0' ? (
                  <>
                    <button
                      onClick={() => onSelectTingkatObjek('semua')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        tingkatObjek === 'semua'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => onSelectTingkatObjek('wilayah')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        tingkatObjek === 'wilayah'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="Objek Kewilayahan (34 Polda & 514 Polres)"
                    >
                      Polda
                    </button>
                    <button
                      onClick={() => onSelectTingkatObjek('pusat')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        tingkatObjek === 'pusat'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="10 Satker Utama Mabes Polri"
                    >
                      Mabes
                    </button>
                  </>
                ) : userLevel === 'L1' ? (
                  <>
                    <button
                      onClick={() => onSelectTingkatObjek('wilayah')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        tingkatObjek !== 'pusat'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="6 Polda Binaan Itwil I"
                    >
                      Polda Binaan
                    </button>
                    <button
                      onClick={() => onSelectTingkatObjek('pusat')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition text-center cursor-pointer ${
                        tingkatObjek === 'pusat'
                          ? 'bg-[#0B2545] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                      }`}
                      title="Satker Mabes Terkait"
                    >
                      Satker Mabes
                    </button>
                  </>
                ) : userLevel === 'L2' ? (
                  <div className="w-full py-1.5 px-2 rounded-md text-xs font-semibold text-slate-700 bg-white text-center shadow-2xs border border-slate-200">
                    Kewilayahan: Polda Riau &amp; 12 Polres
                  </div>
                ) : (
                  <div className="w-full py-1.5 px-2 rounded-md text-xs font-semibold text-slate-700 bg-white text-center shadow-2xs border border-slate-200">
                    Satker Mandiri: Polres Kampar
                  </div>
                )}
              </div>
            </div>

            {/* Micro Caption */}
            <div className="mt-2 text-[10px] text-slate-400">
              {userLevel === 'L0' && 'Pemisahan objek Pusat (Mabes) dan Kewilayahan (Polda/Polres).'}
              {userLevel === 'L1' && 'Menampilkan entitas objek di bawah koordinasi Itwil.'}
              {userLevel === 'L2' && 'Otomatis terkunci pada kesatuan wilayah hukum Polda Riau.'}
              {userLevel === 'L3' && 'Objek periksa tunggal tingkat Polres Kampar.'}
            </div>
          </div>

        </div>
  );
};
