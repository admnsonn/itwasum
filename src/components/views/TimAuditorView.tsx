import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Briefcase, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  Star,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { AuditorData, CurrentUserProfile } from '../../types';
import { AUDITOR_LIST } from '../../data/mockData';
import auditorProfileImg from '../../assets/images/auditor_profile_1787852939070.jpg';

interface TimAuditorViewProps {
  currentUser?: CurrentUserProfile;
}

export const TimAuditorView: React.FC<TimAuditorViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'daftar' | 'matriks' | 'beban'>('daftar');
  const [auditorList, setAuditorList] = useState<AuditorData[]>(AUDITOR_LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Auditor Wizard Form State
  const [newAuditor, setNewAuditor] = useState({
    nama: '',
    pangkat: 'Kombes Pol',
    nrp: '',
    jabatan: 'Auditor Kepolisian Madya',
    subdit: 'Itbidjemen SDM',
    sertifikasi: ['QIA'],
    kapasitasMaksimal: 4,
    satkerTugasAktif: 'Standby / Siap Tugas'
  });

  const filteredAuditors = auditorList.filter(a => 
    a.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.nrp.includes(searchQuery) ||
    a.subdit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveAuditor = () => {
    const created: AuditorData = {
      id: `aud-${Date.now()}`,
      nama: newAuditor.nama || 'AKBP Pratama, S.I.K.',
      pangkat: newAuditor.pangkat,
      nrp: newAuditor.nrp || '82040999',
      jabatan: newAuditor.jabatan,
      subdit: newAuditor.subdit,
      sertifikasi: newAuditor.sertifikasi,
      bebanAktif: 0,
      kapasitasMaksimal: newAuditor.kapasitasMaksimal,
      status: 'Tersedia',
      satkerTugasAktif: newAuditor.satkerTugasAktif,
      totalAuditSelesai: 0,
      ratingKinerja: 95.0
    };

    setAuditorList([created, ...auditorList]);
    setShowWizardModal(false);
    setWizardStep(1);
    setSuccessToast(`Data Auditor ${created.nama} berhasil ditambahkan ke sistem.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div id="tim-auditor-view" className="space-y-4">
      
      {/* Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role Contextual Banner for Pengawas Tim & Koordinator */}
      {currentUser?.peran === 'pengawas_tim' && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#0B2B5C] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Susunan Tim Audit ST/412/VIII/WAS.1.1/2026:</strong> Memantau komposisi pemeriksa, status beban kerja, dan sertifikasi personel tim audit Polda Riau.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#0B2B5C] text-white shrink-0 self-start sm:self-auto">
            Tim Audit Aktif
          </span>
        </div>
      )}

      {currentUser?.peran === 'koordinator_pengendali' && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-indigo-700 shrink-0" />
            <span>
              <strong>Pengendalian Mutu Auditor Itwil I:</strong> Pemantauan kapasitas penugasan dan sertifikasi QIA/CRMO personel Itbidjemen Wilayah I.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-700 text-white shrink-0 self-start sm:self-auto">
            Pengendali Mutu
          </span>
        </div>
      )}

      {/* Sub-Navigation Tabs & Top Action */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'daftar', label: 'Daftar Auditor Itwasum' },
            { id: 'matriks', label: 'Matriks Kompetensi & Sertifikasi' },
            { id: 'beban', label: 'Monitoring Kapasitas Beban Kerja' }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-auditor-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Wizard Add Auditor Button */}
        <button
          id="btn-tambah-auditor-modal"
          onClick={() => {
            setWizardStep(1);
            setShowWizardModal(true);
          }}
          className="min-h-[40px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Auditor Baru</span>
        </button>
      </div>

      {activeTab === 'daftar' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-sm">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama auditor, NRP, atau subdit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[40px] pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2B5C]"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3.5">Nama & NRP</th>
                    <th className="px-4 py-3.5">Pangkat / Jabatan</th>
                    <th className="px-4 py-3.5">Subdit Pengawasan</th>
                    <th className="px-4 py-3.5">Sertifikasi Keahlian</th>
                    <th className="px-4 py-3.5">Beban Tugas Aktif</th>
                    <th className="px-4 py-3.5 text-right">Status Ketersediaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredAuditors.map((a) => (
                    <tr key={a.id} className="min-h-[56px] hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          {a.id === 'aud-1' ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-300 shadow-2xs shrink-0 bg-slate-800">
                              <img
                                src={auditorProfileImg}
                                alt={a.nama}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {a.nama.split(' ').filter(n => !n.includes('.')).slice(0, 2).map(n => n[0]).join('') || 'AP'}
                            </div>
                          )}
                          <div>
                            <div className="font-extrabold text-slate-900">{a.nama}</div>
                            <div className="text-xs text-slate-500 font-mono">NRP: {a.nrp}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 align-middle font-medium text-slate-700">
                        <div>{a.pangkat}</div>
                        <div className="text-xs text-slate-500">{a.jabatan}</div>
                      </td>

                      <td className="px-4 py-3.5 align-middle font-semibold text-slate-800">
                        {a.subdit}
                      </td>

                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {a.sertifikasi.map((s, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 align-middle font-semibold text-slate-800">
                        <div>{a.bebanAktif} / {a.kapasitasMaksimal} Penugasan</div>
                        <div className="text-xs text-slate-500">{a.satkerTugasAktif}</div>
                      </td>

                      <td className="px-4 py-3.5 align-middle text-right">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'matriks' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Matriks Kompetensi & Sertifikasi Auditor Kepolisian
          </h3>
          <p className="text-xs text-slate-600">
            Standar sertifikasi internal dan eksternal BPKP / LKPP / CISA untuk penugasan audit spesifik:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
              <div className="font-bold text-xs text-[#0B2B5C]">
                QIA (Qualified Internal Auditor)
              </div>
              <p className="text-xs text-slate-700">Wajib dimiliki oleh seluruh Ketua Tim Audit Kinerja Itwasum.</p>
              <div className="text-xs font-bold text-blue-900">Total: 42 Auditor Bersertifikasi</div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
              <div className="font-bold text-sm text-amber-900">
                CFrA / Auditor Forensik
              </div>
              <p className="text-xs text-slate-700">Diperuntukkan pada penugasan audit investigatif dan Irsus.</p>
              <div className="text-xs font-bold text-amber-900">Total: 18 Auditor Bersertifikasi</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="font-bold text-sm text-emerald-900">
                Ahli Pengadaan Nasional (LKPP)
              </div>
              <p className="text-xs text-slate-700">Verifikasi tender sarpras pengadaan logistik bernilai tinggi.</p>
              <div className="text-xs font-bold text-emerald-900">Total: 25 Auditor Bersertifikasi</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'beban' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">
            Monitoring Kapasitas Beban Kerja Tim Auditor
          </h3>
          <p className="text-xs text-slate-600">
            Pemerataan beban penugasan audit untuk menjaga kualitas dan objektivitas pengawasan:
          </p>

          <div className="space-y-3">
            {auditorList.map((aud) => {
              const percent = (aud.bebanAktif / aud.kapasitasMaksimal) * 100;

              return (
                <div key={aud.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-[240px]">
                    <div className="font-extrabold text-sm text-slate-900">{aud.nama}</div>
                    <div className="text-xs text-slate-500">{aud.pangkat} • {aud.subdit}</div>
                  </div>

                  <div className="flex-1 min-w-[200px] max-w-md">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Beban Kerja ({aud.bebanAktif}/{aud.kapasitasMaksimal} Satker)</span>
                      <span>{percent.toFixed(0)}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          percent >= 75 ? 'bg-red-600' : percent >= 50 ? 'bg-amber-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    percent >= 75 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {percent >= 75 ? 'Kapasitas Penuh' : 'Dapat Ditugaskan'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WIZARD MODAL 3-LANGKAH TAMBAH AUDITOR (PRD §8.5) */}
      {showWizardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            
            {/* Wizard Header with Step Indicator */}
            <div className="p-5 bg-[#0B2B5C] text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-base">Tambah Data Auditor Baru</h3>
                <button 
                  onClick={() => setShowWizardModal(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Indicator 1/3, 2/3, 3/3 */}
              <div className="flex items-center justify-between text-xs font-bold text-blue-200">
                <span className={wizardStep >= 1 ? 'text-amber-400 font-extrabold' : ''}>1. Biodata</span>
                <span>→</span>
                <span className={wizardStep >= 2 ? 'text-amber-400 font-extrabold' : ''}>2. Sertifikasi & Subdit</span>
                <span>→</span>
                <span className={wizardStep >= 3 ? 'text-amber-400 font-extrabold' : ''}>3. Konfirmasi</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-blue-950 mt-2 overflow-hidden">
                <div 
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${(wizardStep / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Wizard Form Steps */}
            <div className="p-5 space-y-4">
              
              {wizardStep === 1 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar:</label>
                    <input
                      type="text"
                      placeholder="contoh: AKBP Pratama, S.I.K., M.Si."
                      value={newAuditor.nama}
                      onChange={(e) => setNewAuditor({ ...newAuditor, nama: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Pangkat:</label>
                      <select
                        value={newAuditor.pangkat}
                        onChange={(e) => setNewAuditor({ ...newAuditor, pangkat: e.target.value })}
                        className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm"
                      >
                        <option>Kombes Pol</option>
                        <option>AKBP</option>
                        <option>Kompol</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">NRP:</label>
                      <input
                        type="text"
                        placeholder="contoh: 78090123"
                        value={newAuditor.nrp}
                        onChange={(e) => setNewAuditor({ ...newAuditor, nrp: e.target.value })}
                        className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subdit / Bagian Pengawasan:</label>
                    <select
                      value={newAuditor.subdit}
                      onChange={(e) => setNewAuditor({ ...newAuditor, subdit: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    >
                      <option>Itbidjemen SDM</option>
                      <option>Itbidjemen Garkeu</option>
                      <option>Itbidjemen Operasional</option>
                      <option>Itbidjemen Sarpras & Logistik</option>
                      <option>Itbidjemen Khusus (Irsus)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Sertifikasi Utama:</label>
                    <div className="p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs space-y-1.5">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-[#0B2B5C]" />
                        <span>QIA (Qualified Internal Auditor)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-[#0B2B5C]" />
                        <span>CRMO / CRMP Risk Management</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-[#0B2B5C]" />
                        <span>CFrA / Forensik Anti-Korupsi</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-3 animate-in fade-in text-sm">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-[#0B2B5C]">Ringkasan Calon Auditor Baru</h4>
                    <div className="text-xs space-y-1 text-slate-700">
                      <div><strong>Nama:</strong> {newAuditor.nama || 'AKBP Pratama, S.I.K.'}</div>
                      <div><strong>Pangkat/NRP:</strong> {newAuditor.pangkat} / {newAuditor.nrp || '82040999'}</div>
                      <div><strong>Subdit:</strong> {newAuditor.subdit}</div>
                      <div><strong>Status Awal:</strong> Tersedia (Siap Tugas)</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Dengan menyimpan, akun auditor akan diintegrasikan dengan database SIAP ITWASUM Mabes Polri.
                  </p>
                </div>
              )}

            </div>

            {/* Wizard Navigation Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-200 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              ) : <div />}

              {wizardStep < 3 ? (
                <button
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0B2B5C] text-white font-bold text-xs hover:bg-blue-900 flex items-center gap-1.5"
                >
                  <span>Lanjut (Langkah {wizardStep + 1}/3)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveAuditor}
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md"
                >
                  Simpan & Daftarkan Auditor
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
