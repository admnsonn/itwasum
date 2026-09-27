import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Coins, 
  Users, 
  Truck, 
  ShieldAlert 
} from 'lucide-react';
import { CurrentUserProfile, PoldaSatker } from '../../types';
import { PoldaLogo } from '../PoldaLogo';
import { getRoleScopedPoldas } from '../../utils/roleScope';

interface KinerjaSatkerViewProps {
  poldaList: PoldaSatker[];
  currentUser?: CurrentUserProfile;
}

export const KinerjaSatkerView: React.FC<KinerjaSatkerViewProps> = ({ poldaList, currentUser }) => {
  const scopedPoldaList = getRoleScopedPoldas(poldaList, currentUser);
  const [activeTab, setActiveTab] = useState<'iku' | 'irsus' | 'eprofil' | 'rbs'>('iku');
  const [selectedPulau, setSelectedPulau] = useState<string>('Semua');
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);
  const [selectedPoldaForDetail, setSelectedPoldaForDetail] = useState<PoldaSatker>(scopedPoldaList[0]);

  const filteredPolda = selectedPulau === 'Semua' 
    ? scopedPoldaList
    : scopedPoldaList.filter(p => p.pulau === selectedPulau);

  const chartData = filteredPolda.map(p => ({
    name: p.singkatan,
    fullName: p.nama,
    capaian: p.capaianIKU,
    target: p.targetIKU,
    status: p.status
  }));

  return (
    <div id="kinerja-satker-view" className="space-y-4">
      
      {/* Sub-navigation Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-sm flex items-center gap-1.5 overflow-x-auto">
        {[
          { id: 'iku', label: 'Dashboard IKU Nasional' },
          { id: 'irsus', label: 'Satwil Pemeriksaan Khusus (Irsus)' },
          { id: 'eprofil', label: 'E-Profil Satker (SDM, Sarpras, DIPA)' },
          { id: 'rbs', label: 'Risk-Based Scrutiny (RBS Matrix)' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-kinerja-${tab.id}`}
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

      {activeTab === 'iku' && (
        <div className="space-y-4">
          
          {/* Main Card: 1 Primary Clean Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            
            {/* Header & Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Dashboard IKU Nasional — Perbandingan Capaian Indikator Kinerja Utama (IKU)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target Standar Mabes Polri: <strong>90.0%</strong> (Garis Putus-Putus Merah)
                </p>
              </div>

              {/* Pulau Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {['Semua', 'Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Bali-Nusa', 'Maluku-Papua'].map((pulau) => (
                  <button
                    key={pulau}
                    onClick={() => setSelectedPulau(pulau)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedPulau === pulau
                        ? 'bg-[#0B2B5C] text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pulau}
                  </button>
                ))}
              </div>
            </div>

            {/* Recharts Bar Component */}
            <div className="h-[360px] sm:h-[400px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    domain={[60, 100]} 
                    tick={{ fill: '#475569', fontSize: 11 }}
                    unit="%"
                  />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs">
                            <div className="font-bold text-sm text-amber-400">{data.fullName}</div>
                            <div className="mt-1 flex items-center justify-between gap-4">
                              <span>Capaian IKU:</span>
                              <strong className="text-emerald-400 font-extrabold text-sm">{data.capaian}%</strong>
                            </div>
                            <div className="text-slate-400">Target Nasional: 90.0%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={90} stroke="#C93B3B" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Target 90%', fill: '#C93B3B', fontSize: 11, fontWeight: 'bold' }} />
                  <Bar dataKey="capaian" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.capaian >= 90 ? '#1E8E5A' : entry.capaian >= 85 ? '#D89A1F' : '#C93B3B'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend & Summary */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-[#1E8E5A]"></span> ≥ 90% (Memenuhi Target)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-[#D89A1F]"></span> 85% - 89.9% (Mendekati)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-md bg-[#C93B3B]"></span> &lt; 85% (Perlu Intervensi)</span>
              </div>
              <span className="font-semibold text-slate-800">
                Rata-rata Nasional: <strong>89.6%</strong>
              </span>
            </div>

            {/* Collapsible: Analisis Lanjutan & Gap Analysis */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                id="toggle-advanced-analysis-btn"
                onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)}
                className="w-full min-h-[44px] px-4 py-3 bg-slate-50 hover:bg-slate-100 font-bold text-xs text-[#0B2B5C] flex items-center justify-between transition cursor-pointer"
              >
                <span>Analisis Lanjutan & Rekomendasi Pengawasan</span>
                {showAdvancedAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAdvancedAnalysis && (
                <div className="p-4 bg-white space-y-3 border-t border-slate-200 text-xs animate-in fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                      <h4 className="font-bold text-[#0B2B5C] text-xs">Temuan Pola Anomali Nasional</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Terdapat korelasi kuat antara keterlambatan pengunggahan dokumen pra-audit dengan rendahnya capaian IKU bidang Logistik dan Sarpras pada 5 satker wilayah timur.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                      <h4 className="font-bold text-[#0B2B5C] text-xs">Rekomendasi Kebijakan Itwasum</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Disarankan penerbitan Surat Edaran Irwasum terkait simplifikasi format pelaporan BMP dan asistensi terpadu pada Polda Tipe Papua dan Maluku.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {activeTab === 'eprofil' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <PoldaLogo 
                  poldaId={selectedPoldaForDetail.id} 
                  poldaSingkatan={selectedPoldaForDetail.singkatan} 
                  poldaNama={selectedPoldaForDetail.nama} 
                  size="md" 
                />
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                    E-Profil: {selectedPoldaForDetail.nama}
                  </h3>
                  <p className="text-xs text-slate-500">Ibukota: {selectedPoldaForDetail.ibukota} • Wilayah {selectedPoldaForDetail.pulau}</p>
                </div>
              </div>

              <select
                value={selectedPoldaForDetail.id}
                onChange={(e) => {
                  const found = poldaList.find(p => p.id === e.target.value);
                  if (found) setSelectedPoldaForDetail(found);
                }}
                className="min-h-[44px] px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-[#0B2B5C]"
              >
                {poldaList.map(p => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
            </div>

            {/* Profile KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Kekuatan Personel SDM
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {selectedPoldaForDetail.eProfil.sdmTotal.toLocaleString('id-ID')}
                </div>
                <span className="text-xs text-slate-600 block mt-1">
                  Perwira: {selectedPoldaForDetail.eProfil.sdmPerwira} • Bintara: {selectedPoldaForDetail.eProfil.sdmBintara}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  DIPA & Serapan Anggaran
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {selectedPoldaForDetail.eProfil.persenSerapan}%
                </div>
                <span className="text-xs text-slate-600 block mt-1">
                  Pagu: {selectedPoldaForDetail.eProfil.garkeuDipa}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Sarpras Kendaraan Dinas
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {(selectedPoldaForDetail.eProfil.sarprasKendaraanR2 + selectedPoldaForDetail.eProfil.sarprasKendaraanR4).toLocaleString('id-ID')} Unit
                </div>
                <span className="text-xs text-slate-600 block mt-1">
                  Roda 2: {selectedPoldaForDetail.eProfil.sarprasKendaraanR2} • Roda 4: {selectedPoldaForDetail.eProfil.sarprasKendaraanR4}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Polres & Senpi Dinas
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">
                  {selectedPoldaForDetail.eProfil.totalPolres} Polres
                </div>
                <span className="text-xs text-slate-600 block mt-1">
                  Senpi: {selectedPoldaForDetail.eProfil.sarprasSenpi.toLocaleString('id-ID')} Pucuk
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'irsus' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">
            Satwil Pemeriksaan Khusus (Irsus) & Disiplin
          </h3>
          <p className="text-xs text-slate-600">
            Monitoring penanganan aduan masyarakat (Dumas Presisi) dan investigasi kepatuhan khusus:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {poldaList.filter(p => p.status !== 'aman').map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PoldaLogo poldaId={p.id} poldaNama={p.nama} size="xs" />
                    <strong className="text-sm text-slate-900">{p.nama}</strong>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                    p.status === 'kritis' ? 'bg-red-900 text-white' :
                    p.status === 'tinggi' ? 'bg-rose-500 text-white' :
                    p.status === 'perhatian' ? 'bg-amber-500 text-white' :
                    'bg-emerald-600 text-white'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-slate-700">
                  {p.perhatianKhusus || 'Dalam pemantauan asistensi tindak lanjut'}
                </p>
                <div className="pt-2 text-xs font-semibold text-[#0B2B5C]">
                  Irwasda: {p.irwasda}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rbs' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900">
            Risk-Based Scrutiny (RBS Matrix) Satker
          </h3>
          <p className="text-xs text-slate-600">
            Penilaian matriks resiko audit berbasis serapan anggaran, histori temuan BPK, dan kompleksitas wilayah:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {poldaList.slice(0, 6).map((p) => (
              <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PoldaLogo poldaId={p.id} poldaNama={p.nama} size="xs" />
                    <span className="font-extrabold text-sm text-slate-900">{p.nama}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    p.analisisLanjutan.rbsLevel === 'Rendah' ? 'bg-emerald-100 text-emerald-800' :
                    p.analisisLanjutan.rbsLevel === 'Sedang' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {p.analisisLanjutan.rbsLevel}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Skor Resiko: <strong>{p.analisisLanjutan.rbsScore} / 100</strong>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {p.analisisLanjutan.aiInsight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
