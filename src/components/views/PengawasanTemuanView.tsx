import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  Eye, 
  Building2, 
  Calendar, 
  Coins, 
  ShieldCheck,
  X,
  Check
} from 'lucide-react';
import { PoldaSatker, CurrentUserProfile } from '../../types';
import { PoldaLogo } from '../PoldaLogo';

interface PengawasanTemuanViewProps {
  poldaList: PoldaSatker[];
  initialPoldaFilter?: string;
  currentUser?: CurrentUserProfile;
}

export const PengawasanTemuanView: React.FC<PengawasanTemuanViewProps> = ({
  poldaList,
  initialPoldaFilter,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'polri' | 'bpk' | 'irsus' | 'penugasan'>('polri');
  
  // Default to user's assigned polda if pengawas_tim or auditee
  const defaultPolda = initialPoldaFilter || (
    currentUser?.peran === 'pengawas_tim' || currentUser?.peran === 'auditee' || currentUser?.parentPoldaId === 'polda-riau' || currentUser?.titikWilayahId === 'polda-riau'
      ? 'polda-riau'
      : 'all'
  );
  
  const [selectedPoldaId, setSelectedPoldaId] = useState<string>(defaultPolda);
  const [statusFilter, setStatusFilter] = useState<'all' | 'belum' | 'proses' | 'selesai'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemuanModal, setSelectedTemuanModal] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Flatten all temuan across Polda with satker context
  const allTemuan = poldaList.flatMap(p => 
    p.rincianTemuan.map(t => ({
      ...t,
      poldaId: p.id,
      poldaNama: p.nama,
      poldaStatus: p.status,
      pulau: p.pulau
    }))
  );

  const filteredTemuan = allTemuan.filter(t => {
    // Sub-tab filter
    if (activeTab === 'polri' && t.sumber !== 'Audit Polri') return false;
    if (activeTab === 'bpk' && t.sumber !== 'BPK RI') return false;
    if (activeTab === 'irsus' && t.sumber !== 'Irsus') return false;

    // Polda filter
    if (selectedPoldaId !== 'all' && t.poldaId !== selectedPoldaId) return false;

    // Status filter
    if (statusFilter === 'belum' && t.status !== 'Belum Ditindaklanjuti') return false;
    if (statusFilter === 'proses' && t.status !== 'Dalam Proses') return false;
    if (statusFilter === 'selesai' && t.status !== 'Selesai') return false;

    // Search query
    if (searchQuery) {
      const matchJudul = t.judul.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKode = t.kode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPolda = t.poldaNama.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchJudul && !matchKode && !matchPolda) return false;
    }

    return true;
  });

  const handleUpdateStatus = (newStatus: string) => {
    if (selectedTemuanModal) {
      selectedTemuanModal.status = newStatus;
      setSuccessToast(`Status temuan ${selectedTemuanModal.kode} berhasil diperbarui menjadi "${newStatus}"`);
      setSelectedTemuanModal(null);
      setTimeout(() => setSuccessToast(null), 4000);
    }
  };

  return (
    <div id="pengawasan-temuan-view" className="space-y-4">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role-Specific Contextual Filter Banner */}
      {currentUser?.peran === 'pengawas_tim' && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#0B2B5C] flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shrink-0" />
            <span>
              <strong>Mode Pengawas Tim Audit (ST/412):</strong> Tampilan temuan dipusatkan pada lokus penugasan Polda Riau &amp; 5 satker objek periksa.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#0B2B5C] text-white shrink-0">
            Penugasan Aktif
          </span>
        </div>
      )}

      {currentUser?.peran === 'auditee' && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse shrink-0" />
            <span>
              <strong>Mode Auditee (Polres Kampar - Polda Riau):</strong> Menampilkan daftar temuan dan rekomendasi yang menjadi kewajiban tindak lanjut satker.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-500 text-slate-950 shrink-0">
            Objek Periksa Wasrik
          </span>
        </div>
      )}

      {/* Horizontal Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'polri', label: 'Temuan Audit Polri' },
          { id: 'bpk', label: 'Temuan BPK RI' },
          { id: 'irsus', label: 'Temuan Pemeriksaan Khusus (Irsus)' },
          { id: 'penugasan', label: 'Penugasan Audit & Jadwal' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`subtab-${tab.id}`}
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

      {activeTab !== 'penugasan' ? (
        <>
          {/* Filter Bar (2 Main Dropdowns + Search) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-3 flex-wrap flex-1">
              {/* Wilayah / Polda Filter */}
              <div className="min-w-[200px]">
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Pilih Satker / Polda:
                </label>
                <select
                  id="filter-select-polda"
                  value={selectedPoldaId}
                  onChange={(e) => setSelectedPoldaId(e.target.value)}
                  className="w-full min-h-[40px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2B5C]"
                >
                  <option value="all">Semua Satker ({poldaList.length} Polda)</option>
                  {poldaList.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nama} ({p.temuanTerbuka} Temuan)
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[180px]">
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Status Tindak Lanjut:
                </label>
                <select
                  id="filter-select-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full min-h-[40px] px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2B5C]"
                >
                  <option value="all">Semua Status</option>
                  <option value="belum">Belum Ditindaklanjuti</option>
                  <option value="proses">Dalam Proses</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="w-full sm:w-72">
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Pencarian Cepat:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nomor kode / judul..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-[40px] pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2B5C]"
                />
              </div>
            </div>

          </div>

          {/* Table Container with Sticky Header */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-md border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3.5">Kode & Satker</th>
                    <th className="px-4 py-3.5">Uraian Temuan Pengawasan</th>
                    <th className="px-4 py-3.5">Kategori & Tingkat</th>
                    <th className="px-4 py-3.5">Nilai Kerugian</th>
                    <th className="px-4 py-3.5">Tenggat Waktu</th>
                    <th className="px-4 py-3.5 text-right">Status & Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredTemuan.length > 0 ? (
                    filteredTemuan.map((t) => (
                      <tr 
                        key={t.id} 
                        className="min-h-[56px] hover:bg-blue-50/50 transition cursor-pointer"
                        onClick={() => setSelectedTemuanModal(t)}
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2.5">
                            <PoldaLogo 
                              poldaId={t.poldaId} 
                              poldaNama={t.poldaNama} 
                              size="xs" 
                            />
                            <div>
                              <span className="font-extrabold text-slate-900 block">{t.kode}</span>
                              <span className="text-xs font-semibold text-[#0B2B5C] block mt-0.5">{t.poldaNama}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top max-w-md">
                          <p className="font-semibold text-slate-800 line-clamp-2">{t.judul}</p>
                          <span className="text-xs text-slate-500 mt-1 block">
                            Rekomendasi: {t.rekomendasi}
                          </span>
                        </td>

                        <td className="px-4 py-3 align-top whitespace-nowrap">
                          <span className="font-medium text-slate-700 block">{t.kategori}</span>
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {t.tingkat}
                          </span>
                        </td>

                        <td className="px-4 py-3 align-top whitespace-nowrap font-bold text-slate-800">
                          {t.nilaiRupiah || '-'}
                        </td>

                        <td className="px-4 py-3 align-top whitespace-nowrap text-xs font-semibold text-slate-600">
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{t.tenggat}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            t.status === 'Selesai' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                            t.status === 'Dalam Proses' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                            'bg-slate-900 text-white'
                          }`}>
                            {t.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTemuanModal(t);
                            }}
                            className="block ml-auto mt-1.5 text-xs font-bold text-[#0B2B5C] hover:underline"
                          >
                            Tindak Lanjut →
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <p className="font-semibold text-base">Tidak ada temuan yang sesuai dengan kriteria filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* PENUGASAN AUDIT SUBTAB */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {poldaList.filter(p => p.auditBerjalan).map((polda) => (
              <div key={polda.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-[#0B2B5C]">
                    Audit Aktif
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{polda.pulau}</span>
                </div>

                <div className="flex items-center gap-3">
                  <PoldaLogo 
                    poldaId={polda.id} 
                    poldaSingkatan={polda.singkatan} 
                    poldaNama={polda.nama} 
                    size="md" 
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{polda.nama}</h3>
                    <p className="text-xs text-slate-600 mt-0.5">{polda.namaAudit}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div><strong>Ketua Tim:</strong> {polda.auditorKetua}</div>
                  <div><strong>Jumlah Auditor:</strong> {polda.timAuditorCount} Personel</div>
                  <div><strong>Batas Waktu:</strong> {polda.tenggatAudit}</div>
                </div>

                <button 
                  onClick={() => setSelectedPoldaId(polda.id)}
                  className="w-full min-h-[44px] py-2 rounded-xl bg-[#0B2B5C] text-white font-bold text-xs hover:bg-blue-900 transition"
                >
                  Lihat Berkas & KKP Satker
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Tindak Lanjut Temuan */}
      {selectedTemuanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            
            <div className="p-5 bg-[#0B2B5C] text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-300 font-bold uppercase tracking-wider">
                  Detail Tindak Lanjut Temuan
                </span>
                <h3 className="text-lg font-extrabold">{selectedTemuanModal.kode}</h3>
              </div>
              <button 
                onClick={() => setSelectedTemuanModal(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-sm">
              <div>
                <span className="text-xs font-bold text-slate-500">Satker:</span>
                <div className="font-extrabold text-slate-900">{selectedTemuanModal.poldaNama}</div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500">Uraian Temuan:</span>
                <p className="font-semibold text-slate-800 mt-1">{selectedTemuanModal.judul}</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-xs text-slate-800 space-y-1">
                <strong>Rekomendasi Tim Audit Itwasum:</strong>
                <p>{selectedTemuanModal.rekomendasi}</p>
              </div>

              {selectedTemuanModal.nilaiRupiah && (
                <div className="p-3 bg-red-50 rounded-xl text-xs text-red-900 font-bold">
                  Nilai Kerugian / Pengembalian Kas: {selectedTemuanModal.nilaiRupiah}
                </div>
              )}

              {/* Upload Proof Document section */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition cursor-pointer">
                <UploadCloud className="w-8 h-8 text-[#0B2B5C] mx-auto mb-1" />
                <span className="font-bold text-xs text-slate-800 block">
                  Unggah Bukti Setor / Kuitansi / BAST Tindak Lanjut (PDF/JPG)
                </span>
                <span className="text-[11px] text-slate-500">Maksimal 25MB terenkripsi Mabes Polri</span>
              </div>

              {/* Status Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-700 block">Ubah Status Tindak Lanjut:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus('Belum Ditindaklanjuti')}
                    className="min-h-[44px] py-2 rounded-xl text-xs font-bold bg-red-50 text-red-800 border border-red-200 hover:bg-red-100"
                  >
                    🔴 Belum Sesuai
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Dalam Proses')}
                    className="min-h-[44px] py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                  >
                    🟡 Dalam Proses
                  </button>

                  <button
                    onClick={() => handleUpdateStatus('Selesai')}
                    className="min-h-[44px] py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                  >
                    🟢 Selesai (Tuntas)
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedTemuanModal(null)}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold text-xs hover:bg-slate-300 transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
