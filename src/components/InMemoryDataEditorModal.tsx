import React, { useState } from 'react';
import { 
  X, 
  Edit3, 
  RotateCcw, 
  Check, 
  AlertTriangle, 
  Zap, 
  Save, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { PoldaSatker, SimulationOverride, StatusKepatuhan } from '../types';
import { PoldaLogo } from './PoldaLogo';

interface InMemoryDataEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  poldaList: PoldaSatker[];
  overrides: Record<string, SimulationOverride>;
  onApplyOverrides: (newOverrides: Record<string, SimulationOverride>) => void;
  onResetOverrides: () => void;
}

export const InMemoryDataEditorModal: React.FC<InMemoryDataEditorModalProps> = ({
  isOpen,
  onClose,
  poldaList,
  overrides,
  onApplyOverrides,
  onResetOverrides
}) => {
  const [localOverrides, setLocalOverrides] = useState<Record<string, SimulationOverride>>({ ...overrides });
  const [selectedPoldaId, setSelectedPoldaId] = useState<string>(poldaList[0]?.id || 'polda-metro');
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const currentPolda = poldaList.find(p => p.id === selectedPoldaId) || poldaList[0];
  const currentOverride = localOverrides[selectedPoldaId] || {
    poldaId: selectedPoldaId,
    temuanTerbuka: currentPolda?.temuanTerbuka || 10,
    capaianIKU: currentPolda?.capaianIKU || 90.0,
    persenSerapan: currentPolda?.eProfil?.persenSerapan || 88.0,
    rbsScore: currentPolda?.analisisLanjutan?.rbsScore || 65,
    status: currentPolda?.status || 'aman',
    auditBerjalan: currentPolda?.auditBerjalan || false
  };

  const handleFieldChange = (field: keyof SimulationOverride, value: any) => {
    setLocalOverrides(prev => ({
      ...prev,
      [selectedPoldaId]: {
        ...currentOverride,
        poldaId: selectedPoldaId,
        [field]: value
      }
    }));
  };

  // Preset Scenarios
  const applyPresetKrisis = () => {
    const newOv: Record<string, SimulationOverride> = {};
    poldaList.forEach((p, idx) => {
      if (idx < 8) {
        newOv[p.id] = {
          poldaId: p.id,
          temuanTerbuka: (p.temuanTerbuka || 15) + 40,
          capaianIKU: Math.max(65, (p.capaianIKU || 90) - 15),
          rbsScore: Math.min(95, (p.analisisLanjutan?.rbsScore || 60) + 25),
          status: 'kritis' as StatusKepatuhan,
          auditBerjalan: true
        };
      }
    });
    setLocalOverrides(newOv);
  };

  const applyPresetOptimal = () => {
    const newOv: Record<string, SimulationOverride> = {};
    poldaList.forEach(p => {
      newOv[p.id] = {
        poldaId: p.id,
        temuanTerbuka: Math.min(5, p.temuanTerbuka),
        capaianIKU: 96.5,
        rbsScore: 42,
        status: 'aman' as StatusKepatuhan,
        auditBerjalan: false
      };
    });
    setLocalOverrides(newOv);
  };

  const handleSaveAndApply = () => {
    onApplyOverrides(localOverrides);
    onClose();
  };

  const filteredPoldaList = poldaList.filter(p => 
    p.nama.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.singkatan.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#0B2B5C] text-white flex items-center justify-between border-b border-[#143B73]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-slate-950">
              <Sliders className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                Editor Data In-Memory &amp; Simulator Pengawasan (Tito Engine)
              </h2>
              <p className="text-xs text-blue-200">
                Ubah metrik satker secara langsung di memori browser untuk simulasi sesi review pimpinan.
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

        {/* Preset Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Simulasi Skenario Cepat:</span>
            <button
              onClick={applyPresetKrisis}
              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Skenario 8 Polda Siaga</span>
            </button>
            <button
              onClick={applyPresetOptimal}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Skenario WTP Optimal</span>
            </button>
          </div>

          <button
            onClick={() => {
              setLocalOverrides({});
              onResetOverrides();
            }}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data Default</span>
          </button>
        </div>

        {/* Editor Body Grid: Left Satker Selector, Right Live Param Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left: Satker List */}
          <div className="md:col-span-5 border-r border-slate-200 p-3 flex flex-col max-h-[55vh] md:max-h-[500px]">
            <input 
              type="text"
              placeholder="Cari Polda..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 mb-2 focus:ring-1.5 focus:ring-[#0B2B5C]"
            />

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 space-y-0.5">
              {filteredPoldaList.map(p => {
                const isSelected = p.id === selectedPoldaId;
                const hasOv = !!localOverrides[p.id];
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPoldaId(p.id)}
                    className={`w-full p-2 rounded-xl text-left transition flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected ? 'bg-blue-50 text-[#0B2B5C] font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <PoldaLogo poldaId={p.id} poldaNama={p.nama} size="xs" />
                      <span className="text-xs truncate">{p.nama}</span>
                    </div>
                    {hasOv && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Ada Modifikasi Data" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Satker Controls */}
          <div className="md:col-span-7 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[55vh] md:max-h-[500px]">
            {currentPolda && (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <PoldaLogo poldaId={currentPolda.id} poldaNama={currentPolda.nama} size="sm" />
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{currentPolda.nama}</h3>
                      <p className="text-xs text-slate-500">{currentPolda.pulau} • {currentPolda.ibukota}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    (currentOverride.status || currentPolda.status) === 'kritis' ? 'bg-rose-100 text-rose-800' :
                    (currentOverride.status || currentPolda.status) === 'perhatian' ? 'bg-amber-100 text-amber-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentOverride.status || currentPolda.status}
                  </span>
                </div>

                {/* Form Controls */}
                <div className="space-y-3 text-xs">
                  
                  {/* Temuan Terbuka */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Jumlah Temuan Terbuka: <span className="font-black text-rose-600 font-mono">{currentOverride.temuanTerbuka ?? currentPolda.temuanTerbuka} temuan</span>
                    </label>
                    <input 
                      type="range" 
                      min="0" 
                      max="150" 
                      value={currentOverride.temuanTerbuka ?? currentPolda.temuanTerbuka}
                      onChange={(e) => handleFieldChange('temuanTerbuka', parseInt(e.target.value, 10))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  {/* Capaian IKU */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Capaian IKU (%): <span className="font-black text-blue-600 font-mono">{(currentOverride.capaianIKU ?? currentPolda.capaianIKU).toFixed(1)}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      step="0.5"
                      value={currentOverride.capaianIKU ?? currentPolda.capaianIKU}
                      onChange={(e) => handleFieldChange('capaianIKU', parseFloat(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  {/* Skor Risiko Komposit (RBS) */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Skor Risiko RBS: <span className="font-black text-amber-600 font-mono">{(currentOverride.rbsScore ?? (currentPolda.analisisLanjutan?.rbsScore || 65))} / 100</span>
                    </label>
                    <input 
                      type="range" 
                      min="20" 
                      max="100" 
                      value={currentOverride.rbsScore ?? (currentPolda.analisisLanjutan?.rbsScore || 65)}
                      onChange={(e) => {
                        const score = parseInt(e.target.value, 10);
                        handleFieldChange('rbsScore', score);
                        if (score > 75) handleFieldChange('status', 'kritis');
                        else if (score >= 50) handleFieldChange('status', 'perhatian');
                        else handleFieldChange('status', 'aman');
                      }}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Status Kepatuhan Radio */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tingkat Status Kepatuhan:</label>
                    <div className="flex gap-2">
                      {(['aman', 'perhatian', 'kritis'] as StatusKepatuhan[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleFieldChange('status', st)}
                          className={`flex-1 py-1.5 rounded-lg font-bold capitalize transition cursor-pointer border text-center ${
                            (currentOverride.status ?? currentPolda.status) === st
                              ? st === 'kritis' ? 'bg-rose-600 text-white border-rose-600' :
                                st === 'perhatian' ? 'bg-amber-600 text-white border-amber-600' :
                                'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}
                        >
                          {st === 'kritis' ? 'Siaga / Kritis' : st === 'perhatian' ? 'Waspada' : 'Normal / Aman'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Audit Berjalan Toggle */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <span className="font-bold text-slate-700">Status Audit Lapangan Aktif (Wasrik):</span>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('auditBerjalan', !(currentOverride.auditBerjalan ?? currentPolda.auditBerjalan))}
                      className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                        (currentOverride.auditBerjalan ?? currentPolda.auditBerjalan)
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {(currentOverride.auditBerjalan ?? currentPolda.auditBerjalan) ? 'Sedang Audit' : 'Tidak Ada Audit'}
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {Object.keys(localOverrides).length} Satker termodifikasi
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSaveAndApply}
              className="px-4 py-1.5 rounded-xl bg-[#0B2B5C] hover:bg-[#143E78] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Terapkan Simulasi</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
