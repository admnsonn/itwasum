import React, { useMemo } from 'react';
import { PoldaSatker, SatkerMapItem, TingkatObjek } from '../types';
import { ALL_COMBINED_SATKERS_DATA } from '../data/allSatkersData';
import { ShieldAlert, ShieldCheck, AlertCircle, FileText, CheckCircle2, ChevronRight, Building2, Building } from 'lucide-react';

interface AICriticalSatkerAlertCardProps {
  poldaList: PoldaSatker[];
  selectedPolda: PoldaSatker | null;
  satkerItem: SatkerMapItem | null;
  onSelectSatker?: (satkerId: string) => void;
  onClose?: () => void;
  onOpenDetail?: () => void;
  tingkatObjek?: TingkatObjek;
}

export const AICriticalSatkerAlertCard: React.FC<AICriticalSatkerAlertCardProps> = ({
  selectedPolda,
  satkerItem,
  onOpenDetail,
  tingkatObjek = 'semua'
}) => {
  // Identify currently selected satker
  const activeSelectedSatker = useMemo(() => {
    const currentExternal = satkerItem || selectedPolda;
    if (!currentExternal) return null;

    const match = ALL_COMBINED_SATKERS_DATA.find(s => s.id === currentExternal.id);
    if (match) return match;

    if ('kapolda' in currentExternal) {
      const p = currentExternal as PoldaSatker;
      return {
        id: p.id,
        nama: p.nama,
        singkatan: p.singkatan,
        tingkat: 'Polda' as const,
        parentPoldaId: p.id,
        parentPoldaNama: p.nama,
        pulau: p.pulau,
        ibukota: p.ibukota,
        lat: p.lat,
        lng: p.lng,
        status: p.status,
        temuanTerbuka: p.temuanTerbuka,
        temuanSelesai: p.temuanSelesai,
        totalTemuan: p.totalTemuan,
        capaianIKU: p.capaianIKU,
        targetIKU: p.targetIKU,
        dokumenTerkumpul: p.dokumenTerkumpul,
        totalDokumen: p.totalDokumen,
        auditBerjalan: p.auditBerjalan,
        pimpinanNama: p.kapolda,
        pimpinanJabatan: 'Kapolda',
        irwasdaOrKasiwas: p.irwasda,
        wikiLogoUrl: '',
        wilayahHukum: `Provinsi ${p.singkatan}`
      };
    }

    return currentExternal as SatkerMapItem;
  }, [satkerItem, selectedPolda]);

  const isAman = useMemo(() => {
    if (!activeSelectedSatker) return false;
    return activeSelectedSatker.status === 'aman';
  }, [activeSelectedSatker]);

  const conditionTheme = useMemo(() => {
    if (!activeSelectedSatker) return null;
    const s = activeSelectedSatker.status;
    if (s === 'kritis') {
      return {
        cardBorder: 'border-red-300',
        badgeBg: 'bg-red-800 text-white',
        badgeText: 'STATUS SIAGA / KRITIS',
        icon: ShieldAlert,
        iconColor: 'text-red-700'
      };
    }
    if (s === 'tinggi') {
      return {
        cardBorder: 'border-rose-300',
        badgeBg: 'bg-rose-700 text-white',
        badgeText: 'STATUS WASPADA TINGGI',
        icon: AlertCircle,
        iconColor: 'text-rose-600'
      };
    }
    if (s === 'perhatian') {
      return {
        cardBorder: 'border-amber-300',
        badgeBg: 'bg-amber-600 text-white',
        badgeText: 'PERLU ATENSI KHUSUS',
        icon: AlertCircle,
        iconColor: 'text-amber-600'
      };
    }
    return {
      cardBorder: 'border-emerald-300',
      badgeBg: 'bg-emerald-700 text-white',
      badgeText: 'STANDAR WTP / TERKENDALI',
      icon: ShieldCheck,
      iconColor: 'text-emerald-700'
    };
  }, [activeSelectedSatker]);

  const analysisList = useMemo(() => {
    if (!activeSelectedSatker || isAman) return [];

    const temuanTerbuka = activeSelectedSatker.temuanTerbuka;
    const capaianIKU = activeSelectedSatker.capaianIKU;
    const pimpinanNama = activeSelectedSatker.pimpinanNama;
    const pimpinanJabatan = activeSelectedSatker.pimpinanJabatan;
    const status = activeSelectedSatker.status;

    const isCritical = status === 'kritis';
    const isTinggi = status === 'tinggi';

    const items: { title: string; detail: string; category: string }[] = [];

    if (isCritical) {
      items.push({
        category: 'DIAGNOSIS TATA KELOLA',
        title: 'Evaluasi Rekomendasi Wasrik & Kepatuhan IKU',
        detail: `Capaian IKU tercatat ${capaianIKU}% dengan ${temuanTerbuka} rekomendasi pengawasan berstatus terbuka melampaui batas toleransi 60 hari. Terdeteksi deviasi realisasi anggaran operasional dan keterlambatan penyampaian berkas pertanggungjawaban fisik.`
      });
      items.push({
        category: 'INSTRUKSI KOMANDO',
        title: 'Petunjuk Tindak Lanjut Kapolri / Irwasum',
        detail: `Penerbitan Surat Atensi Khusus kepada ${pimpinanJabatan} (${pimpinanNama.split(',')[0]}) serta penugasan Tim Asistensi Itwil untuk supervisi percepatan penyelesaian seluruh tunggakan dalam 7 hari kerja.`
      });
    } else if (isTinggi) {
      items.push({
        category: 'DIAGNOSIS TATA KELOLA',
        title: 'Evaluasi Rekomendasi Wasrik & Kepatuhan IKU',
        detail: `Capaian IKU berada pada angka ${capaianIKU}% dengan beban risiko pengawasan kategori tinggi (${temuanTerbuka} temuan aktif). Diperlukan verifikasi kelengkapan bukti dukung pertanggungjawaban sebelum jatuh tempo sanggah audit BPK.`
      });
      items.push({
        category: 'INSTRUKSI KOMANDO',
        title: 'Petunjuk Tindak Lanjut Kapolri / Irwasum',
        detail: `Instruksikan ${pimpinanJabatan} menyelenggarakan gelar evaluasi internal berkala dan menyampaikan laporan progres mingguan resmi kepada Pengawas Wilayah (Itwil).`
      });
    } else {
      items.push({
        category: 'DIAGNOSIS TATA KELOLA',
        title: 'Evaluasi Rekomendasi Wasrik & Kepatuhan IKU',
        detail: `Capaian IKU tercatat ${capaianIKU}% dengan ${temuanTerbuka} temuan pengawasan dalam proses tindak lanjut. Kepatuhan administrasi memadai namun memerlukan percepatan input dokumen e-audit.`
      });
      items.push({
        category: 'INSTRUKSI KOMANDO',
        title: 'Petunjuk Tindak Lanjut Kapolri / Irwasum',
        detail: `Lakukan pemantauan berkala melalui sistem e-audit dan instruksikan penuntasan sisa dokumen pertanggungjawaban dalam batas waktu triwulan berjalan.`
      });
    }

    return items;
  }, [activeSelectedSatker, isAman]);

  // If no satker is selected, display high-level executive strategic overview tailored by Tingkat Objek
  if (!activeSelectedSatker) {
    if (tingkatObjek === 'pusat') {
      return (
        <div 
          id="executive-inspection-card-mabes"
          className="rounded-2xl border border-amber-300 bg-amber-50/40 p-3.5 sm:p-4 shadow-xs flex flex-col gap-2.5 text-xs text-slate-700"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-600 text-white font-black text-[10px] uppercase tracking-wide">
                FOKUS MABES POLRI
              </span>
              <span className="font-extrabold text-slate-900 text-xs">
                Telaah Wasrik Eksekutif: 10 Satuan Kerja Tingkat Pusat
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-amber-700">DIPA &amp; PNBP Mabes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] leading-relaxed">
            <div className="p-2.5 rounded-xl bg-white border border-amber-200">
              <strong className="text-slate-900 block font-bold mb-1">
                Fokus Pengawasan Sentral (GARKEU &amp; OPSNAL):
              </strong>
              Pengawasan ketat realisasi DIPA Terpusat TA 2026, kepatuhan setoran PNBP lalu lintas Korlantas, transparansi SP2HP Bareskrim, serta kesiapan operasional Korbrimob dan Baharkam Polri.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-amber-200">
              <strong className="text-slate-900 block font-bold mb-1">
                Disiplin Internal &amp; BMN (SARPRAS &amp; SDM):
              </strong>
              Audit logistik senjata/amunisi pada Slog Polri, kepatuhan 100% LHKPN jajaran PJU Mabes, serta monitoring penegakan kode etik internal oleh Divpropam Polri.
            </div>
          </div>
        </div>
      );
    }

    if (tingkatObjek === 'wilayah') {
      return (
        <div 
          id="executive-inspection-card-wilayah"
          className="rounded-2xl border border-blue-200 bg-blue-50/30 p-3.5 sm:p-4 shadow-xs flex flex-col gap-2.5 text-xs text-slate-700"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#0B2B5C] text-white font-black text-[10px] uppercase tracking-wide">
                FOKUS KEWILAYAHAN
              </span>
              <span className="font-extrabold text-slate-900 text-xs">
                Telaah Wasrik Eksekutif: 34 Polda &amp; 514 Polres Jajaran
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700">Supervisi Itwil I - V</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] leading-relaxed">
            <div className="p-2.5 rounded-xl bg-white border border-blue-100">
              <strong className="text-slate-900 block font-bold mb-1">
                Progres Tindak Lanjut TLHP Kewilayahan:
              </strong>
              Penyelesaian temuan wasrik tahap I &amp; II di 34 Polda mencapai 64.8%. Prioritas asistensi diberikan kepada Polda di zona siaga/kritis guna menuntaskan rekomendasi BPK RI.
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-blue-100">
              <strong className="text-slate-900 block font-bold mb-1">
                Kinerja Pelayanan &amp; Dumas Presisi:
              </strong>
              Pemantauan kecepatan respon Dumas Presisi pada level Polres/Polsek serta kepatuhan pelaksanaan standar operasional prosedur penegakan hukum di kewilayahan.
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        id="executive-inspection-card"
        className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3 text-xs text-slate-600"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 uppercase tracking-wide block text-[11px]">
              Ringkasan Evaluasi Pengawasan Satker (Gabungan Pusat &amp; Wilayah)
            </span>
            <p className="text-[11px] text-slate-500">
              Pilih salah satu Polda, Polres, atau Satker Mabes pada peta atau direktori untuk memunculkan telaah pengawasan spesifik.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = conditionTheme?.icon || FileText;

  return (
    <div 
      id="executive-inspection-card"
      className={`rounded-2xl border ${conditionTheme?.cardBorder || 'border-slate-200'} bg-white p-3.5 sm:p-4 shadow-sm space-y-3 transition-all`}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
            <StatusIcon className={`w-5 h-5 ${conditionTheme?.iconColor || 'text-slate-700'}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${conditionTheme?.badgeBg}`}>
                {conditionTheme?.badgeText}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeSelectedSatker.tingkat} • {activeSelectedSatker.singkatan}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 truncate mt-0.5">
              Telaah Wasrik Eksekutif: {activeSelectedSatker.nama}
            </h3>
          </div>
        </div>

        {onOpenDetail && (
          <button
            onClick={onOpenDetail}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0B2B5C] hover:text-white text-slate-700 text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Buka Lembar Wasrik</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content Blocks */}
      {isAman ? (
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="leading-relaxed text-[11px]">
            <strong>Kepatuhan Standar WTP Terpenuhi:</strong> Seluruh rekomendasi wasrik telah ditindaklanjuti 100%. Capaian IKU mencapai <strong>{activeSelectedSatker.capaianIKU}%</strong> dengan kepatuhan tata kelola anggaran dan operasional optimal.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {analysisList.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{item.category}</span>
                <span>Prioritas Utama</span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed pt-0.5">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
