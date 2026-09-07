import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Shield, 
  ExternalLink, 
  Check, 
  Copy, 
  Globe, 
  Layers,
  Sparkles,
  Info,
  MapPin
} from 'lucide-react';
import { POLDA_LOGOS_DATA, SATKER_JAJARAN_DATA, MABES_ITWASUM_LOGOS_DATA, SatkerLogoItem } from '../data/satkerLogosData';
import { PoldaLogo } from './PoldaLogo';

interface LogoSatkerExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPoldaId?: string;
  poldaList?: any;
}

export const LogoSatkerExplorerModal: React.FC<LogoSatkerExplorerModalProps> = ({
  isOpen,
  onClose,
  initialPoldaId
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTingkat, setSelectedTingkat] = useState<string>('all');
  const [selectedPulau, setSelectedPulau] = useState<string>('all');
  const [selectedLogo, setSelectedLogo] = useState<SatkerLogoItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Combine all Satker data (Mabes/Itwasum/Itwil + 34 Polda + Jajaran Polres & Polsek)
  const allSatkerList = useMemo<SatkerLogoItem[]>(() => {
    const mabesList = Object.values(MABES_ITWASUM_LOGOS_DATA);
    const poldaList = Object.values(POLDA_LOGOS_DATA);
    return [...mabesList, ...poldaList, ...SATKER_JAJARAN_DATA];
  }, []);

  // Filtered List
  const filteredList = useMemo(() => {
    return allSatkerList.filter((item) => {
      const matchSearch = 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.singkatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.wilayahHukum.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.motto.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTingkat = 
        selectedTingkat === 'all' ? true :
        selectedTingkat === 'Mabes' ? (item.tingkat === 'Mabes' || item.tingkat === 'Itwasum') :
        selectedTingkat === 'Itwil' ? item.tingkat === 'Itwil' :
        selectedTingkat === 'Satker-Mabes' ? (item.tingkat === 'Satker-Mabes' || item.tingkat === 'Biro-Mabes') :
        selectedTingkat === 'Polda' ? item.tingkat === 'Polda' :
        selectedTingkat === 'Polres' ? (item.tingkat === 'Polrestabes' || item.tingkat === 'Polresta' || item.tingkat === 'Polres') :
        item.tingkat === 'Polsek';

      const matchPulau = 
        selectedPulau === 'all' ? true : item.pulau === selectedPulau;

      return matchSearch && matchTingkat && matchPulau;
    });
  }, [allSatkerList, searchQuery, selectedTingkat, selectedPulau]);

  // Set initial selected item if not chosen yet
  React.useEffect(() => {
    if (isOpen) {
      if (initialPoldaId && (MABES_ITWASUM_LOGOS_DATA[initialPoldaId] || POLDA_LOGOS_DATA[initialPoldaId])) {
        setSelectedLogo(MABES_ITWASUM_LOGOS_DATA[initialPoldaId] || POLDA_LOGOS_DATA[initialPoldaId]);
      } else if (!selectedLogo && allSatkerList.length > 0) {
        setSelectedLogo(allSatkerList[0]);
      }
    }
  }, [isOpen, initialPoldaId, allSatkerList, selectedLogo]);

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-5xl h-[90vh] max-h-[850px] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="explorer-modal-title"
      >
        {/* Header Bar */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-900 via-[#0B2B5C] to-slate-900 text-white flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 id="explorer-modal-title" className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Katalog & Repositori Logo Satker Polri</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Google & Wikimedia Scraped
                </span>
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Direktori lambang resmi & perisai heraldi 34 Polda, Jajaran Polres/Polresta, dan Polsek Seluruh Indonesia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition focus:outline-none"
            aria-label="Tutup Katalog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Polda, Polres, Polsek, kota..."
              className="w-full pl-9.5 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2B5C] focus:border-transparent placeholder-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tingkat & Pulau Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'Mabes', label: 'Mabes & Itwasum' },
                { id: 'Itwil', label: 'Itwil (I-V)' },
                { id: 'Satker-Mabes', label: 'Satker Mabes' },
                { id: 'Polda', label: 'Polda (34)' },
                { id: 'Polres', label: 'Polres' },
                { id: 'Polsek', label: 'Polsek' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTingkat(t.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedTingkat === t.id
                      ? 'bg-[#0B2B5C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <select
              value={selectedPulau}
              onChange={(e) => setSelectedPulau(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B2B5C]"
            >
              <option value="all">Semua Pulau</option>
              <option value="Sumatera">Sumatera</option>
              <option value="Jawa">Jawa</option>
              <option value="Kalimantan">Kalimantan</option>
              <option value="Sulawesi">Sulawesi</option>
              <option value="Bali-Nusa">Bali & Nusa Tenggara</option>
              <option value="Maluku-Papua">Maluku & Papua</option>
            </select>
          </div>
        </div>

        {/* Content Body: Left Grid List + Right Inspector Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Grid List */}
          <div className="lg:col-span-7 p-4 overflow-y-auto border-r border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>Menampilkan {filteredList.length} Satker Polri</span>
              <span>Klik kartu untuk detail logo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredList.map((item) => {
                const isSelected = selectedLogo?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedLogo(item)}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 relative group ${
                      isSelected
                        ? 'bg-white border-[#0B2B5C] ring-2 ring-[#0B2B5C]/20 shadow-md scale-[1.01]'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <PoldaLogo 
                      poldaId={item.id} 
                      poldaSingkatan={item.singkatan} 
                      poldaNama={item.nama} 
                      size="md" 
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          item.tingkat === 'Polda' ? 'bg-blue-100 text-blue-900' :
                          item.tingkat === 'Polsek' ? 'bg-emerald-100 text-emerald-900' :
                          'bg-amber-100 text-amber-900'
                        }`}>
                          {item.tingkat}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.pulau}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-900 mt-1 truncate group-hover:text-[#0B2B5C] transition">
                        {item.nama}
                      </h4>
                      
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.wilayahHukum}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredList.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-2">
                <Shield className="w-8 h-8 mx-auto text-slate-300" />
                <div className="text-sm font-bold text-slate-700">Tidak ada Satker yang cocok</div>
                <p className="text-xs text-slate-500">Coba ubah kata kunci pencarian atau filter tingkat satuan.</p>
              </div>
            )}
          </div>

          {/* Right Inspector Panel */}
          <div className="lg:col-span-5 p-6 overflow-y-auto bg-white flex flex-col justify-between space-y-6">
            {selectedLogo ? (
              <div className="space-y-6 animate-in fade-in">
                
                {/* Visual Preview Box */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 text-center flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                  <div className="w-28 h-32 flex items-center justify-center mb-3">
                    <PoldaLogo 
                      poldaId={selectedLogo.id} 
                      poldaSingkatan={selectedLogo.singkatan} 
                      poldaNama={selectedLogo.nama} 
                      size="2xl" 
                    />
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    selectedLogo.tingkat === 'Polda' ? 'bg-blue-600 text-white' :
                    selectedLogo.tingkat === 'Polsek' ? 'bg-emerald-600 text-white' :
                    'bg-amber-500 text-slate-950'
                  }`}>
                    Tingkat {selectedLogo.tingkat}
                  </span>

                  <h3 className="text-lg font-black text-slate-900 mt-2">
                    {selectedLogo.nama}
                  </h3>

                  <p className="text-xs font-semibold text-slate-600 italic mt-0.5">
                    "{selectedLogo.motto}"
                  </p>
                </div>

                {/* Metadata & Scraping Source */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#0B2B5C]" />
                    <span>Informasi Lambang & Sumber Scraping</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Deskripsi Makna Lambang:</span>
                      <strong className="text-slate-800 block mt-0.5 leading-relaxed font-medium">
                        {selectedLogo.deskripsi}
                      </strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Wilayah Yurisdiksi Hukum:</span>
                      <strong className="text-slate-800 block mt-0.5 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>{selectedLogo.wilayahHukum}</span>
                      </strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Sumber Terverifikasi:</span>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-[11px] font-bold text-[#0B2B5C] truncate flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{selectedLogo.source}</span>
                        </span>
                        <button
                          onClick={() => handleCopyUrl(selectedLogo.imageUrl, selectedLogo.id)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[10px] flex items-center gap-1 shadow-2xs transition"
                        >
                          {copiedId === selectedLogo.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Salin URL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Raw Image Preview Link */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-[#0B2B5C] block">Format Berkas: High-Res PNG / SVG</span>
                    <span className="text-slate-500 text-[11px]">Dukungan referer policy aman & auto-fallback</span>
                  </div>
                  <a
                    href={selectedLogo.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-[#0B2B5C] text-white hover:bg-blue-900 transition"
                    title="Buka Gambar Asli"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                Pilih Satker dari daftar di sebelah kiri untuk melihat detail logo.
              </div>
            )}

            {/* Bottom Footer Note */}
            <div className="pt-3 border-t border-slate-200 text-center text-[11px] text-slate-400 font-medium">
              Sistem Satu Data Itwasum Polri • Repositori Aset Lambang & Insignia NKRI
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
