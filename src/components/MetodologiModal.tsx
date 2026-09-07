import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  Layers, 
  Brain, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  Scale,
  GitFork
} from 'lucide-react';

interface MetodologiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MetodologiModal: React.FC<MetodologiModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'formula' | 'matriks' | 'kognitif'>('formula');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B2B5C] text-white flex items-center justify-between border-b border-[#143B73]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 text-amber-400 border border-white/15">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                Dokumentasi Rasional Desain & Transparansi Metodologi
              </h2>
              <p className="text-xs text-blue-200">
                Formula matematis, taksonomi metrik, dan cetak biru 3 poros pengawasan Satu Data Itwasum Polri.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setActiveTab('formula')}
            className={`pb-2.5 px-3 text-xs font-extrabold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'formula'
                ? 'border-[#0B2B5C] text-[#0B2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Formula Skor Risiko (RBS)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('matriks')}
            className={`pb-2.5 px-3 text-xs font-extrabold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'matriks'
                ? 'border-[#0B2B5C] text-[#0B2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Matriks 3 Poros Pengawasan</span>
          </button>

          <button
            onClick={() => setActiveTab('kognitif')}
            className={`pb-2.5 px-3 text-xs font-extrabold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
              activeTab === 'kognitif'
                ? 'border-[#0B2B5C] text-[#0B2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Model Kognitif Pimpinan</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          
          {activeTab === 'formula' && (
            <div className="space-y-4">
              
              {/* Formula Card */}
              <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-900">
                  Formula Matematis Skor Risiko Komposit (Composite Risk Score)
                </span>
                
                <div className="p-3 bg-white rounded-xl border border-blue-200 font-mono text-xs sm:text-sm font-bold text-slate-900 text-center shadow-xs">
                  Skor Risiko = (0.30 × GARKEU) + (0.25 × OPSNAL) + (0.20 × SARPRAS) + (0.15 × SDM) + (0.10 × DUMAS)
                </div>

                <p className="text-xs text-blue-800 leading-relaxed">
                  Formula di atas dihitung dengan skala standar 0 - 100 secara transparan dan terukur tanpa bobot tersembunyi.
                </p>
              </div>

              {/* Weight Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs text-blue-700">
                    <span>1. GARKEU (30%)</span>
                    <span className="px-1.5 py-0.2 bg-blue-50 rounded text-[10px]">Bobot Tertinggi</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Nilai temuan BPK/Itwasum, deviasi serapan anggaran vs fisik, dan potensi kerugian negara.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs text-amber-700">
                    <span>2. OPSNAL (25%)</span>
                    <span className="px-1.5 py-0.2 bg-amber-50 rounded text-[10px]">Kamtibmas</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Capaian IKU operasional, beban tunggakan perkara reskrim, dan pengawasan fungsi lalu lintas.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs text-purple-700">
                    <span>3. SARPRAS (20%)</span>
                    <span className="px-1.5 py-0.2 bg-purple-50 rounded text-[10px]">Logistik</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Sertifikasi aset BMN, transparansi pengadaan e-katalog, dan kesiapan alutsista per Polsek.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs text-emerald-700">
                    <span>4. SDM (15%)</span>
                    <span className="px-1.5 py-0.2 bg-emerald-50 rounded text-[10px]">Personel</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Kesenjangan DSP riil, rasio beban kerja penyidik, pelanggaran disiplin/KEPP.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-xs text-rose-700">
                    <span>5. DUMAS (10%)</span>
                    <span className="px-1.5 py-0.2 bg-rose-50 rounded text-[10px]">Pengaduan</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Volume pengaduan masyarakat masuk (Dumas Presisi) yang belum diklarifikasi & ditindaklanjuti.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="font-bold text-xs text-slate-900">
                    Ambang Batas Status
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-rose-700 font-bold">Siaga (Kritis):</span>
                      <span className="font-mono font-bold">Skor &gt; 75.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700 font-bold">Waspada:</span>
                      <span className="font-mono font-bold">50.0 - 75.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700 font-bold">Normal (Aman):</span>
                      <span className="font-mono font-bold">&lt; 50.0</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'matriks' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Dashboard tidak memaksakan satu layar untuk semua orang, melainkan dilapisi menurut 3 poros terintegrasi:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Jenjang Pengguna</th>
                      <th className="p-2.5">Tingkat Mabes / Pusat</th>
                      <th className="p-2.5">Tingkat Polda</th>
                      <th className="p-2.5">Tingkat Polres</th>
                      <th className="p-2.5">Aksi Utama</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2B5C]">Kapolri</td>
                      <td className="p-2.5">Ringkasan Siaga Pusat</td>
                      <td className="p-2.5">Peta 34 Polda &amp; Top 3 Isu</td>
                      <td className="p-2.5 text-slate-400">Tidak di layar harian</td>
                      <td className="p-2.5 font-semibold text-blue-700">Arahan &amp; Prioritas Nasional</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2B5C]">Irwasum / Wairwasum</td>
                      <td className="p-2.5">Daftar Satker Bermasalah</td>
                      <td className="p-2.5">Peta + Pecahan Itwil I-V</td>
                      <td className="p-2.5">Setelah Polda diklik</td>
                      <td className="p-2.5 font-semibold text-blue-700">Disposisi &amp; Fokus PKPT</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2B5C]">Pimpinan Itwil I-V</td>
                      <td className="p-2.5">Satker dalam lingkup Itwil</td>
                      <td className="p-2.5">Polda binaan Itwil sendiri</td>
                      <td className="p-2.5">Drill-down rutin per Polres</td>
                      <td className="p-2.5 font-semibold text-blue-700">Alokasi Tim &amp; Wasrik</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-[#0B2B5C]">Auditor Itwil</td>
                      <td className="p-2.5">Objek audit ditugaskan</td>
                      <td className="p-2.5">Objek audit ditugaskan</td>
                      <td className="p-2.5">Objek pemeriksaan lapangan</td>
                      <td className="p-2.5 font-semibold text-blue-700">Kertas Kerja &amp; Bukti LHP</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Aturan Turun-Naik Data:</strong> Data teknis kertas kerja &amp; aging per rekomendasi berhenti di lapisan Auditor / Itwil. Ke atas hanya angka gulungan dan ringkasan naratif siap disposisi.
              </div>
            </div>
          )}

          {activeTab === 'kognitif' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-xs text-[#0B2B5C] uppercase tracking-wider">
                  Model Kognitif Pengambilan Keputusan Pimpinan (Sense-Making Loop)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 mx-auto rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center mb-1.5">1</div>
                    <div className="font-bold text-slate-900">Spotting (Lihat)</div>
                    <div className="text-[11px] text-slate-500 mt-1">Peta Komando &amp; Strip Indikator 6 lensa</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 mx-auto rounded-full bg-amber-100 text-amber-800 font-black flex items-center justify-center mb-1.5">2</div>
                    <div className="font-bold text-slate-900">Prioritizing (Pilah)</div>
                    <div className="text-[11px] text-slate-500 mt-1">Panel Atensi 2 sisi &amp; Perlu Perhatian Hari Ini</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 mx-auto rounded-full bg-purple-100 text-purple-800 font-black flex items-center justify-center mb-1.5">3</div>
                    <div className="font-bold text-slate-900">Investigating (Bedah)</div>
                    <div className="text-[11px] text-slate-500 mt-1">Slide-Over E-Profil 8 sudut pandang</div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="w-6 h-6 mx-auto rounded-full bg-emerald-100 text-emerald-800 font-black flex items-center justify-center mb-1.5">4</div>
                    <div className="font-bold text-slate-900">Deciding (Tindak)</div>
                    <div className="text-[11px] text-slate-500 mt-1">Nota Disposisi &amp; Instruksi Tim Wasrik</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Versi Dokumen: 2.4-Presisi (Satu Data Itwasum Polri)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#0B2B5C] hover:bg-[#143E78] text-white font-bold text-xs transition cursor-pointer"
          >
            Mengerti &amp; Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
