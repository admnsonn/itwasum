import React from 'react';
import { 
  Wallet, 
  Activity, 
  Truck, 
  Users, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2
} from 'lucide-react';
import { BidangAudit } from '../types';

interface DomainSummaryCardsProps {
  activeBidang: BidangAudit;
  onSelectBidang: (bidang: BidangAudit) => void;
}

export const DomainSummaryCards: React.FC<DomainSummaryCardsProps> = ({
  activeBidang,
  onSelectBidang
}) => {
  const domains = [
    {
      id: 'garkeu' as BidangAudit,
      nama: 'GARKEU (Anggaran & Keuangan)',
      singkatan: 'GARKEU',
      icon: Wallet,
      color: 'blue',
      borderColor: 'border-blue-200',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/20',
      tagBg: 'bg-blue-50 text-blue-800',
      metrics: [
        { label: 'Realisasi DIPA', value: '88.0%', sub: 'Deviasi 4.2%' },
        { label: 'Temuan Keuangan', value: '312 Kasus', sub: 'Rp 55,4 M Potensi' },
        { label: 'Aging > 90 Hari', value: '48 Temuan', sub: 'Perlu sanggah BPK' }
      ],
      signalAtensi: 'Deviasi serapan Belanja Modal Polda Papua & Kalsel > 18%'
    },
    {
      id: 'opsnal' as BidangAudit,
      nama: 'OPSNAL (Operasional Kepolisian)',
      singkatan: 'OPSNAL',
      icon: Activity,
      color: 'amber',
      borderColor: 'border-amber-200',
      activeBorder: 'border-amber-600 ring-2 ring-amber-500/20',
      tagBg: 'bg-amber-50 text-amber-800',
      metrics: [
        { label: 'Capaian IKU', value: '89.2%', sub: 'Target 90%' },
        { label: 'Beban Perkara', value: '62.4%', sub: 'Penyelesaian SP2HP' },
        { label: 'Wasrik Fungsi', value: '18 Satker', sub: 'Tahap Pelaksanaan' }
      ],
      signalAtensi: 'Kluster penanganan perkara menumpuk pada 3 Polres di Sumut'
    },
    {
      id: 'sarpras' as BidangAudit,
      nama: 'SARPRAS (Sarana & Prasarana)',
      singkatan: 'SARPRAS',
      icon: Truck,
      color: 'purple',
      borderColor: 'border-purple-200',
      activeBorder: 'border-purple-600 ring-2 ring-purple-500/20',
      tagBg: 'bg-purple-50 text-purple-800',
      metrics: [
        { label: 'Kesiapan Alsus', value: '94.1%', sub: 'Siap Operasi' },
        { label: 'Aset BMN Tanah', value: '91.8%', sub: 'Bersertifikat' },
        { label: 'Pengadaan 2026', value: '86 Satker', sub: 'e-Katalog Presisi' }
      ],
      signalAtensi: 'Sertifikasi tanah hibah Polsek di Aceh & Malut dalam proses'
    },
    {
      id: 'sdm' as BidangAudit,
      nama: 'SDM (Personel & Integritas)',
      singkatan: 'SDM',
      icon: Users,
      color: 'emerald',
      borderColor: 'border-emerald-200',
      activeBorder: 'border-emerald-600 ring-2 ring-emerald-500/20',
      tagBg: 'bg-emerald-50 text-emerald-800',
      metrics: [
        { label: 'DSP vs Riil', value: '-4.8%', sub: 'Kesenjangan Kuota' },
        { label: 'Kapasitas Auditor', value: '1.250 Org', sub: 'Tersertifikasi' },
        { label: 'Temuan Disiplin', value: '29 Kasus', sub: 'Dalam Sidang KEPP' }
      ],
      signalAtensi: 'Kebutuhan tambahan Auditor Utama Itwasum di Itwil IV dan V'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider">
            Kartu Ringkasan 4 Bidang Kerja Pengawasan
          </h3>
          <p className="text-[11px] text-slate-500">
            Pecahan audit fungsional Itwasum Polri: Garkeu, Opsnal, Sarpras, dan SDM.
          </p>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          4 Pilar Pengawasan
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {domains.map((dom) => {
          const Icon = dom.icon;
          const isActive = activeBidang === dom.id;

          return (
            <div
              key={dom.id}
              onClick={() => onSelectBidang(isActive ? 'semua' : dom.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive 
                  ? `${dom.activeBorder} bg-slate-50/80 shadow-sm` 
                  : `${dom.borderColor} hover:border-slate-400 bg-white`
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${dom.tagBg}`}>
                    {dom.singkatan}
                  </span>
                  <Icon className="w-4 h-4 text-slate-600" />
                </div>

                <h4 className="font-extrabold text-xs text-slate-900 mt-2 leading-tight">
                  {dom.nama}
                </h4>

                {/* 3 Micro Metrics */}
                <div className="grid grid-cols-3 gap-1 my-2.5 pt-2 border-t border-slate-100 text-center">
                  {dom.metrics.map((m, i) => (
                    <div key={i} className="bg-slate-50 p-1 rounded-lg">
                      <div className="text-[9px] text-slate-400 font-semibold truncate">{m.label}</div>
                      <div className="font-black text-xs text-slate-900 leading-tight">{m.value}</div>
                      <div className="text-[8px] text-slate-500 truncate">{m.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sinyal Atensi Khas */}
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-600 flex items-start gap-1.5">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-tight truncate">{dom.signalAtensi}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
