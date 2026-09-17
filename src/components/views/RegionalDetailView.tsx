/**
 * B.7 halaman detail Polda — #/b7/<poldaId>
 */
import React, { useMemo, useState } from 'react';
import type { CurrentUserProfile, PoldaSatker } from '../../types';
import { getSatkersByPolda } from '../../data/domain/satkerRegistry';
import { byPolda } from '../../data/domain/findingsLedger';
import { PoldaLogo } from '../PoldaLogo';
import { Badge, Card, DonutChart, ProgressBar, StatCard, Table, TabNavigation, Typography } from '../ui';
import { DataIntegrationNotice } from '../ui/DataIntegrationNotice';
import { FadeInUp } from '../ui/motion';

interface RegionalDetailViewProps {
  poldaId: string;
  poldaList: PoldaSatker[];
  currentUser?: CurrentUserProfile;
  onBack: () => void;
}

export const RegionalDetailView: React.FC<RegionalDetailViewProps> = ({
  poldaId,
  poldaList,
  onBack,
}) => {
  const polda = poldaList.find((p) => p.id === poldaId);
  const [tab, setTab] = useState('ringkasan');
  const anak = useMemo(() => getSatkersByPolda(poldaId).filter((s) => s.id !== poldaId), [poldaId]);
  const temuan = useMemo(() => byPolda(poldaId), [poldaId]);
  const polres = anak.filter((s) => s.tingkat === 'Polres' || s.tingkat === 'Polresta' || s.tingkat === 'Polrestabes');

  if (!polda) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Polda {poldaId} tidak ditemukan.</p>
        <button type="button" className="mt-3 text-xs font-bold text-[var(--brand-700)]" onClick={onBack}>Kembali ke IKU Nasional</button>
      </Card>
    );
  }

  const gap = polda.analisisLanjutan?.gapAnalysis ?? [];
  const ikuGap = (polda.capaianIKU - polda.targetIKU);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-xs font-bold text-[var(--brand-700)]">← IKU Nasional</button>
        <PoldaLogo poldaId={polda.id} className="w-10 h-10" />
        <div>
          <h1 className="text-lg font-black text-slate-900">{polda.nama}</h1>
          <p className="text-[11px] text-slate-500">{polda.kapolda} · Irwasda {polda.irwasda}</p>
        </div>
        <DataIntegrationNotice variant="badge" sumber="IKU satker / SSDM" className="ml-auto" />
      </div>

      <TabNavigation
        tabs={[
          { id: 'ringkasan', label: 'Ringkasan Kinerja Polda' },
          { id: 'analisis', label: 'Analisis' },
          { id: 'iku-polres', label: 'Monitoring IKU Polres' },
          { id: 'gap', label: 'Gap Analysis' },
        ]}
        activeTab={tab}
        onTabChange={setTab}
      />

      {tab === 'ringkasan' && (
        <FadeInUp>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Capaian IKU" value={`${polda.capaianIKU}%`} change={{ direction: ikuGap >= 0 ? 'up' : 'down', label: `target ${polda.targetIKU}%` }} />
            <StatCard label="Temuan Terbuka" value={polda.temuanTerbuka} />
            <StatCard label="Dokumen" value={`${polda.dokumenTerkumpul}/${polda.totalDokumen}`} />
            <StatCard label="Jajaran" value={`${polres.length} Polres`} footer={`${anak.length} satker terdaftar`} />
          </div>
          <Card className="mt-4">
            <Typography variant="label-bold" className="text-slate-700 mb-2">Status kepatuhan</Typography>
            <Badge color={polda.status === 'aman' ? 'success' : polda.status === 'kritis' ? 'danger' : 'warning'}>{polda.status}</Badge>
            <p className="text-xs text-slate-600 mt-3">{polda.analisisLanjutan?.aiInsight}</p>
          </Card>
        </FadeInUp>
      )}

      {tab === 'analisis' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-3">Temuan ledger</Typography>
            <DonutChart
              segments={[
                { id: 'b', label: 'Belum', value: temuan.filter((t) => t.statusTL === 'Belum Ditindaklanjuti').length, color: '#E11D48' },
                { id: 'p', label: 'Proses', value: temuan.filter((t) => t.statusTL === 'Dalam Proses').length, color: '#F59E0B' },
                { id: 's', label: 'Selesai', value: temuan.filter((t) => t.statusTL === 'Selesai').length, color: '#16A34A' },
              ]}
              centerLabel="Temuan"
              centerValue={String(temuan.length)}
            />
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Rekomendasi strategis</Typography>
            <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
              {(polda.analisisLanjutan?.rekomendasiStrategis ?? ['Tidak ada catatan']).map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === 'iku-polres' && (
        <Card>
          <Table
            title="IKU jajaran Polres"
            columns={[
              { key: 'nama', header: 'Satker', render: (r) => r.nama },
              { key: 'tingkat', header: 'Tingkat', render: (r) => r.tingkat },
              { key: 'iku', header: 'Capaian IKU', render: (r) => `${r.capaianIKU}%` },
              { key: 'target', header: 'Target', render: (r) => `${r.targetIKU}%` },
              { key: 'gap', header: 'Gap', render: (r) => {
                const g = r.capaianIKU - r.targetIKU;
                return <span className={g >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{g >= 0 ? '+' : ''}{g.toFixed(1)}</span>;
              } },
              { key: 'progress', header: 'Pemenuhan', render: (r) => <ProgressBar showValue={false} value={r.capaianIKU} max={100} /> },
            ]}
            data={polres}
            rowKey={(r) => r.id}
            emptyLabel="Tidak ada Polres jajaran pada registri satker"
          />
        </Card>
      )}

      {tab === 'gap' && (
        <Card>
          <Typography variant="label-bold" className="text-slate-700 mb-3">Gap Analysis jajaran</Typography>
          <ul className="space-y-2 text-xs text-slate-600">
            {gap.map((g) => (
              <li key={g} className="rounded-lg border border-slate-100 px-3 py-2">{g}</li>
            ))}
            {anak.slice(0, 8).map((s) => (
              <li key={s.id} className="rounded-lg border border-slate-100 px-3 py-2 flex justify-between gap-3">
                <span className="font-semibold text-slate-800">{s.nama}</span>
                <span>IKU {s.capaianIKU}% · temuan terbuka {s.temuanTerbuka}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
