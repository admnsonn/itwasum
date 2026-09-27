/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modul D.1-D.2 - Status Deployment & Environment.
 *
 * SATU-SATUNYA halaman di aplikasi ini yang menampilkan DATA NYATA, bukan mock deterministik.
 * Seluruh nilai berasal dari `src/data/modules/d-deployment.ts` (hasil generate otomatis oleh
 * `scripts/gen-deployment-data.ts` yang membaca READ-ONLY dua repo GitOps referensi:
 * evidence/infra-repoconfig-itwasum dan evidence/helm-repoconfig-itwasum - lihat Plan 1 bagian 1.4
 * dan Plan 2 bagian 2.4.1).
 *
 * Framing wajib: Development & SIT berjalan di cloud penyedia (development-pure.cloud), BUKAN di
 * DC DIVTIK. Halaman ini karena itu menampilkan kartu DC DIVTIK berstatus "Belum Dimigrasi" secara
 * jujur, dan bukti ini diposisikan sebagai realisasi D.2 (staging & baseline konfigurasi) plus
 * pre-migration baseline untuk D.1.
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Server, ShieldAlert, KeyRound, GitCommit, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Boxes, GitBranch, Cloud } from 'lucide-react';
import {
  DEPLOYMENT_ENVIRONMENTS,
  DEPLOYMENT_COMPONENTS,
  VAULT_SECRET_BINDINGS,
  RELEASE_HISTORY,
  DEPLOYMENT_GAPS,
  DEPLOYMENT_SOURCE_META,
  DEPLOYMENT_GENERATED_AT,
} from '../../data/modules/d-deployment';
import { BackgroundDashboard } from '../charts/BackgroundDashboard';
import { AppPieChart } from '../charts/PieChart';

const chartData = ['dev', 'sit'].map((env) => {
  const row: Record<string, string | number> = { env: env === 'dev' ? 'Development' : 'SIT' };
  RELEASE_HISTORY.filter((r) => r.env === env).forEach((r) => {
    row[r.component] = r.commitCount;
  });
  return row;
});

export const DeploymentEnvironmentView: React.FC = () => {
  const totalReleases = RELEASE_HISTORY.reduce((sum, r) => sum + r.commitCount, 0);
  const totalCommits = DEPLOYMENT_SOURCE_META.infraTotalCommits + DEPLOYMENT_SOURCE_META.helmTotalCommits;

  const releaseByComponent = ['Frontend', 'Backend Core', 'IAM / Keycloak'].map((component, idx) => ({
    name: component,
    value: RELEASE_HISTORY.filter((r) => r.component === component).reduce((s, r) => s + r.commitCount, 0),
    color: ['#0B2B5C', '#2563EB', '#F59E0B'][idx],
  }));

  return (
    <div className="space-y-4">
      <BackgroundDashboard
        title="Status Deployment & Environment (D.1-D.2)"
        subtitle="D.1 Implementasi Sistem di Environment DC DIVTIK & D.2 Staging dan Konfigurasi DC DIVTIK. Satu-satunya halaman dengan data nyata (bukan mock), dibaca langsung dari dua repo GitOps referensi."
        stats={[
          { label: 'Total Commit Kedua Repo', value: `${totalCommits}`, icon: GitBranch },
          { label: 'Komponen Terdeploy', value: `${DEPLOYMENT_COMPONENTS.length / 2}`, icon: Boxes },
          { label: 'Binding Vault Secret', value: `${VAULT_SECRET_BINDINGS.length}`, icon: KeyRound },
          { label: 'Environment Cloud', value: '2 dari 3', icon: Cloud },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-mono">
        <span>Sumber: {DEPLOYMENT_SOURCE_META.infraRepo} ({DEPLOYMENT_SOURCE_META.infraTotalCommits} commit)</span>
        <span>&bull;</span>
        <span>{DEPLOYMENT_SOURCE_META.helmRepo} ({DEPLOYMENT_SOURCE_META.helmTotalCommits} commit)</span>
        <span>&bull;</span>
        <span>Digenerate: {new Date(DEPLOYMENT_GENERATED_AT).toLocaleString('id-ID')}</span>
        <span className="ml-auto shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
          Data Deployment Nyata
        </span>
      </div>

      {/* Framing wajib: bukan DC DIVTIK */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Catatan posisi:</strong> environment Development dan SIT berjalan di domain cloud
          penyedia (<code className="bg-amber-100 px-1 rounded">development-pure.cloud</code>), bukan di
          DC DIVTIK. Bukti pada halaman ini diposisikan sebagai realisasi <strong>D.2 (staging &amp; baseline
          konfigurasi)</strong> serta <em>pre-migration baseline</em> untuk D.1. Migrasi ke DC DIVTIK
          dijadwalkan pada Termin berikutnya dan masih memerlukan konfirmasi tertulis PPK (lihat Plan 1,
          "Hal yang Perlu Konfirmasi PPK Sebelum Submit").
        </p>
      </div>

      {/* Kartu per environment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {DEPLOYMENT_ENVIRONMENTS.map((env) => (
          <div
            key={env.id}
            className={`bg-white rounded-2xl border shadow-sm p-4 ${env.isRealDcDivtik ? 'border-rose-200' : 'border-emerald-200'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-900">{env.label}</h3>
              {env.isRealDcDivtik ? (
                <XCircle className="w-4 h-4 text-rose-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <span
              className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold mb-3 ${
                env.isRealDcDivtik ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {env.statusLabel}
            </span>
            <dl className="text-xs space-y-1.5">
              <Row label="Namespace" value={env.namespace} />
              <Row label="Host" value={env.host} />
              <Row label="Ingress Class" value={env.ingressClass} />
              <Row label="Strip Path" value={env.stripPath ? 'Ya' : '-'} />
              <Row label="TLS" value={env.hasTls ? 'Aktif' : 'Belum dikonfigurasi'} warn={!env.hasTls && !env.isRealDcDivtik} />
            </dl>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tabel komponen */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider">Komponen &amp; Image Tag Aktual</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">Komponen</th>
                  <th className="px-3 py-2 text-left">Env</th>
                  <th className="px-3 py-2 text-left">Image Tag</th>
                  <th className="px-3 py-2 text-left">Service</th>
                </tr>
              </thead>
              <tbody>
                {DEPLOYMENT_COMPONENTS.map((c, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-bold text-slate-700 whitespace-nowrap">{c.componentLabel}</td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${c.envId === 'dev' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {c.envId.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-slate-600">
                      {c.imageTag}
                      {c.imageTag === 'latest' && (
                        <span className="ml-1 text-amber-600" title="Tag 'latest' - belum ada bump CI otomatis">
                          <AlertTriangle className="w-3 h-3 inline" />
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-500">
                      {c.serviceType}:{c.servicePort}
                      {c.nodePort && ` (NodePort ${c.nodePort})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel Vault */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#0B2B5C]" />
            <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider">
              Manajemen Rahasia (Vault Secrets Operator)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                  <th className="px-3 py-2 text-left">Env / Komponen</th>
                  <th className="px-3 py-2 text-left">Mount / Path</th>
                  <th className="px-3 py-2 text-left">Refresh</th>
                  <th className="px-3 py-2 text-left">HMAC</th>
                </tr>
              </thead>
              <tbody>
                {VAULT_SECRET_BINDINGS.map((v, idx) => (
                  <tr key={idx} className="border-t border-slate-100">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold mr-1 ${v.envId === 'dev' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                        {v.envId.toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-700">{v.componentLabel}</span>
                    </td>
                    <td className="px-3 py-2 font-mono text-[10px] text-slate-600">
                      {v.mount}/{v.path}
                    </td>
                    <td className="px-3 py-2 text-slate-500">{v.refreshAfter}</td>
                    <td className="px-3 py-2">
                      {v.hmacSecretData ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-4 py-2.5 text-[10px] text-slate-400 border-t border-slate-100">
            Tidak ada nilai rahasia yang ditampilkan atau disimpan di aplikasi ini - hanya nama mount/path
            Vault dan nama Kubernetes Secret tujuan.
          </p>
        </div>
      </div>

      {/* Riwayat rilis (bukti kadens CI/CD) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5" />
              Riwayat Rilis per Environment - Bukti Kadens CI/CD
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {totalReleases} commit bump image tag otomatis oleh Jenkins
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="env" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Bar dataKey="Frontend" fill="#0B2B5C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Backend Core" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="IAM / Keycloak" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
          <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider mb-2">Distribusi Rilis per Komponen</h3>
          <AppPieChart data={releaseByComponent} height={220} />
        </div>
      </div>

      {/* Panel kesenjangan */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
        <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Kesenjangan Menuju DC DIVTIK
        </h3>
        <ul className="space-y-2">
          {DEPLOYMENT_GAPS.map((gap, idx) => (
            <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              {gap}
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3" />
          Rujukan lengkap: submit/termin-1/src/71-DOC-01-Lampiran-1-Konfigurasi-Environment-Development-dan-SIT.md
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; warn?: boolean }> = ({ label, value, warn }) => (
  <div className="flex items-center justify-between gap-2">
    <dt className="text-slate-400">{label}</dt>
    <dd className={`font-bold font-mono text-[10px] ${warn ? 'text-amber-600' : 'text-slate-700'}`}>{value || '-'}</dd>
  </div>
);
