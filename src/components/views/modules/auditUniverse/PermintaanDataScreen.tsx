/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 5.1 Permintaan Pengumpulan Data (SF-511 Daftar, SF-512 Buat/Ubah, SF-513 Detail) — mereplikasi
 * `permintaan-pengumpulan-data.html` menu Admin (Plan "Migrate 27092026 prototypes", todo
 * `b12-permintaan`). Admin/Pimpinan/Koordinator/Ketua Tim membuat & mengirim permintaan;
 * peran lain melihat saja.
 */
import React, { useMemo, useState } from 'react';
import { CalendarClock, Copy, Download, FileWarning, Files, Plus, Send, X } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  useAuditUniverseStore,
  getOrgById,
  getPermintaanById,
  reqStatusTurunan,
  satkerStatus,
  progress,
  getBerkas,
  isSelesai,
  createPermintaanDraft,
  updatePermintaanDraft,
  sendPermintaan,
  duplicatePermintaan,
  deletePermintaanDraft,
  closePermintaan,
  extendDeadline,
  sendReminder,
  formatIsoDate,
  formatDateTime,
  formatBytes,
  daysDiffFromToday,
  getDokById,
  BERKAS_STATUS_LABEL,
  LAINNYA_DOC_ID,
} from '../../../../data/auditUniverse';
import type { Permintaan, BerkasSatker } from '../../../../data/auditUniverse';
import { canManagePermintaan, displayNameForLog } from '../../../../data/auditUniverse/roleMapping';
import { OrgSasaranPicker, orgLabel } from '../../masterData/OrgSasaranPicker';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  FilterPanel,
  Input,
  Modal,
  Pagination,
  ProgressBar,
  Table,
  Textarea,
  Timeline,
  usePagination,
  type BadgeColor,
  type TableColumn,
} from '../../../ui';

interface PermintaanDataScreenProps {
  currentUser: CurrentUserProfile;
  detailPath?: string;
  onNavigateDetail: (reqId?: string) => void;
  /** 6.2 Permintaan Tambahan Audit dipisah dari 5.3 Permintaan Berkala pada nav B.12, tapi
   * memakai layar & data model yang sama (Plan "Align itwasum with Plane BA/SA", p1-b12-collection).
   * Permintaan "Tambahan Audit" hanya dibuat dari Kertas Kerja Audit Digital (B.15), jadi tombol
   * "Buat Permintaan" disembunyikan pada mode ini. */
  tipeFilter?: Permintaan['tipe'];
}

const STATUS_COLOR: Record<ReturnType<typeof reqStatusTurunan>, BadgeColor> = {
  Draft: 'warning',
  Dijadwalkan: 'info',
  Berjalan: 'success',
  Ditutup: 'neutral',
};

export const PermintaanDataScreen: React.FC<PermintaanDataScreenProps> = ({ currentUser, detailPath, onNavigateDetail, tipeFilter }) => {
  const reqId = detailPath;
  if (reqId) {
    return <PermintaanDetail reqId={reqId} currentUser={currentUser} onBack={() => onNavigateDetail(undefined)} />;
  }
  return <PermintaanList currentUser={currentUser} onOpenDetail={onNavigateDetail} tipeFilter={tipeFilter} />;
};

const PermintaanList: React.FC<{ currentUser: CurrentUserProfile; onOpenDetail: (id: string) => void; tipeFilter?: Permintaan['tipe'] }> = ({ currentUser, onOpenDetail, tipeFilter }) => {
  const state = useAuditUniverseStore();
  const canManage = canManagePermintaan(currentUser) && tipeFilter !== 'Tambahan Audit';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; req?: Permintaan } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Permintaan | null>(null);

  const filtered = useMemo(() => {
    return state.permintaan.filter((r) => {
      if (tipeFilter && r.tipe !== tipeFilter) return false;
      if (statusFilter && reqStatusTurunan(r) !== statusFilter) return false;
      if (search && !r.judul.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [state.permintaan, statusFilter, search, tipeFilter]);

  const { page, pageSize, setPage, setPageSize, pageItems } = usePagination(filtered, 10);

  const columns: TableColumn<Permintaan>[] = [
    {
      key: 'judul',
      header: tipeFilter === 'Tambahan Audit' ? 'Kode & Judul' : 'Kode & Jenis',
      render: (r) => (
        <div>
          <button onClick={() => onOpenDetail(r.id)} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left block">
            {r.judul}
          </button>
          <span className="text-[11px] text-slate-400 font-mono">{r.id}</span>
        </div>
      ),
    },
    { key: 'jadwal', header: 'Jadwal', render: (r) => <span className="text-xs">{formatIsoDate(r.mulai)} – {formatIsoDate(r.selesai)}</span> },
    { key: 'sasaran', header: 'Target Satker', render: (r) => `${r.sasaran.length} Satker/unit` },
    {
      key: 'progres',
      header: 'Selesai / Terbit / Draf',
      render: (r) => {
        const p = progress(r);
        return <ProgressBar value={p.total ? Math.round((p.done / p.total) * 100) : 0} showValue label={`${p.done}/${p.total} selesai`} />;
      },
    },
    { key: 'status', header: 'Status', render: (r) => <Badge color={STATUS_COLOR[reqStatusTurunan(r)]}>{reqStatusTurunan(r)}</Badge> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button onClick={() => onOpenDetail(r.id)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Detail</button>
          {canManage && r.status === 'Draft' && (
            <>
              <button onClick={() => setFormModal({ mode: 'edit', req: r })} className="text-xs font-bold text-slate-500 hover:underline">Ubah</button>
              <button onClick={() => setDeleteTarget(r)} className="text-xs font-bold text-rose-500 hover:underline">Hapus</button>
            </>
          )}
          {canManage && (
            <button onClick={() => duplicatePermintaan(r.id, displayNameForLog(currentUser))} className="text-slate-400 hover:text-slate-600" title="Duplikat">
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <FilterPanel
        search={{ value: search, onChange: setSearch, placeholder: 'Cari judul permintaan...' }}
        fields={[
          {
            type: 'select', key: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, placeholder: 'Semua Status',
            options: ['Draft', 'Dijadwalkan', 'Berjalan', 'Ditutup'].map((s) => ({ value: s, label: s })),
          },
        ]}
        headerActions={
          canManage ? (
            <Button onClick={() => setFormModal({ mode: 'create' })}>
              <Plus className="w-4 h-4" /> Buat Penugasan Audit
            </Button>
          ) : undefined
        }
      />
      {filtered.length === 0 ? (
        <EmptyState title="Belum ada permintaan yang cocok" icon={<FileWarning className="w-6 h-6 text-slate-300" />} />
      ) : (
        <Card>
          <Table columns={columns} data={pageItems} rowKey={(r) => r.id} />
          <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="permintaan" />
        </Card>
      )}

      {formModal && (
        <PermintaanFormModal
          mode={formModal.mode}
          req={formModal.req}
          currentUser={currentUser}
          onClose={() => setFormModal(null)}
        />
      )}

      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title={`Hapus permintaan "${deleteTarget.judul}"?`}
          description="Permintaan berstatus Draft dapat dihapus permanen. Tindakan ini tidak dapat dibatalkan."
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button
                variant="danger"
                onClick={() => {
                  deletePermintaanDraft(deleteTarget.id);
                  setDeleteTarget(null);
                }}
              >
                Hapus
              </Button>
            </>
          }
        >
          <p className="text-xs text-slate-500">Sasaran: {deleteTarget.sasaran.length} Satker/unit.</p>
        </Modal>
      )}
    </div>
  );
};

const PermintaanFormModal: React.FC<{ mode: 'create' | 'edit'; req?: Permintaan; currentUser: CurrentUserProfile; onClose: () => void }> = ({ mode, req, currentUser, onClose }) => {
  const state = useAuditUniverseStore();
  const [judul, setJudul] = useState(req?.judul ?? '');
  const [jpId, setJpId] = useState(req?.jpId ?? state.jenisPengawasan.find((j) => j.dipakai)?.id ?? state.jenisPengawasan[0]?.id ?? '');
  const [periodeLabel, setPeriodeLabel] = useState(req?.periodeLabel ?? 'Semester I');
  const [tahunAnggaran, setTahunAnggaran] = useState(req?.tahunAnggaran ?? String(new Date().getFullYear()));
  const [mulai, setMulai] = useState(req?.mulai ?? new Date().toISOString().slice(0, 10));
  const [selesai, setSelesai] = useState(req?.selesai ?? new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [pesan, setPesan] = useState(req?.pesan ?? '');
  const [sasaran, setSasaran] = useState<string[]>(req?.sasaran ?? []);
  const [error, setError] = useState('');

  const oleh = displayNameForLog(currentUser);

  const buildInput = () => ({
    judul: judul.trim(),
    tipe: 'Berkala' as const,
    jpId,
    tahunAnggaran,
    periodeLabel,
    mulai,
    selesai,
    pesan,
    sasaran,
  });

  const handleSaveDraft = () => {
    if (!judul.trim()) return setError('Judul permintaan wajib diisi.');
    if (sasaran.length === 0) return setError('Pilih minimal satu Satker/unit sasaran.');
    if (mode === 'create') createPermintaanDraft(buildInput(), oleh);
    else if (req) updatePermintaanDraft(req.id, buildInput(), oleh);
    onClose();
  };

  const handleSaveAndSend = () => {
    if (!judul.trim()) return setError('Judul permintaan wajib diisi.');
    if (sasaran.length === 0) return setError('Pilih minimal satu Satker/unit sasaran.');
    const created = mode === 'create' ? createPermintaanDraft(buildInput(), oleh) : (updatePermintaanDraft(req!.id, buildInput(), oleh), req!);
    sendPermintaan(created.id, oleh);
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={mode === 'create' ? 'Buat Penugasan Audit' : `Ubah Penugasan (Draft) — ${req?.judul}`}
      widthClassName="max-w-3xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="secondary" onClick={handleSaveDraft}>Simpan Draf</Button>
          <Button onClick={handleSaveAndSend}>
            <Send className="w-3.5 h-3.5" /> Kirim ke Satker
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{error}</div>}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Judul Permintaan</label>
          <Input value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Mis. Wasrik Rutin Tahap II TA 2026 – Polda Riau & jajaran" />
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenis Pengawasan</label>
            <select
              value={jpId}
              onChange={(e) => setJpId(e.target.value)}
              className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] bg-white px-3 text-sm"
            >
              {state.jenisPengawasan.filter((j) => j.aktif).map((j) => (
                <option key={j.id} value={j.id}>{j.induk ? '— ' : ''}{j.nama}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Tahun Anggaran</label>
            <Input value={tahunAnggaran} onChange={(e) => setTahunAnggaran(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Periode</label>
            <select
              value={periodeLabel}
              onChange={(e) => setPeriodeLabel(e.target.value)}
              className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] bg-white px-3 text-sm"
            >
              {['Tahunan', 'Semester I', 'Semester II', 'Triwulan I', 'Triwulan II', 'Triwulan III', 'Triwulan IV'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Mulai Pengumpulan</label>
            <Input type="date" value={mulai} onChange={(e) => setMulai(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Tenggat Pengumpulan</label>
            <Input type="date" value={selesai} onChange={(e) => setSelesai(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Pesan untuk Satker</label>
          <Textarea rows={3} value={pesan} onChange={(e) => setPesan(e.target.value)} placeholder="Mohon unggah dokumen pendukung..." />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Satker/Unit Sasaran</label>
          <OrgSasaranPicker selected={sasaran} onChange={setSasaran} />
        </div>
      </div>
    </Modal>
  );
};

const PermintaanDetail: React.FC<{ reqId: string; currentUser: CurrentUserProfile; onBack: () => void }> = ({ reqId, currentUser, onBack }) => {
  useAuditUniverseStore(); // subscribe for re-render on mutation
  const req = getPermintaanById(reqId);
  const canManage = canManagePermintaan(currentUser);
  const [extendModal, setExtendModal] = useState(false);
  const [newDeadline, setNewDeadline] = useState(req?.selesai ?? '');
  const [berkasOrgId, setBerkasOrgId] = useState<string | null>(null);
  const oleh = displayNameForLog(currentUser);

  if (!req) {
    return <EmptyState title="Permintaan tidak ditemukan" action={<Button variant="outline" onClick={onBack}>Kembali ke Daftar</Button>} />;
  }

  const statusTurunan = reqStatusTurunan(req);
  const semuaSelesai = req.sasaran.every((o) => isSelesai(req.id, o));

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-xs font-bold text-[var(--sd-primary)] hover:underline flex items-center gap-1">
        <X className="w-3.5 h-3.5" /> Tutup Detail — Kembali ke Daftar
      </button>

      <Card className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge color={STATUS_COLOR[statusTurunan]}>{statusTurunan}</Badge>
              {req.tipe === 'Tambahan Audit' && <Badge color="violet">Tambahan Audit</Badge>}
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-1.5">{req.judul}</h3>
            <p className="text-xs text-slate-500 mt-1">{req.periodeLabel} TA {req.tahunAnggaran} · Mulai {formatIsoDate(req.mulai)} · Tenggat {formatIsoDate(req.selesai)}</p>
            {req.penugasan && <p className="text-[11px] text-slate-400 mt-1">Penugasan: {req.penugasan.nomor} — diminta oleh {req.penugasan.peminta}</p>}
          </div>
          {canManage && (
            <div className="flex items-center gap-2 flex-wrap">
              {req.status === 'Terkirim' && (
                <Button size="sm" variant="outline" onClick={() => setExtendModal(true)}>
                  <CalendarClock className="w-3.5 h-3.5" /> Perpanjang Tenggat
                </Button>
              )}
              {req.status === 'Terkirim' && (
                <Button size="sm" variant="outline" onClick={() => sendReminder(req.id, oleh)}>
                  <Send className="w-3.5 h-3.5" /> Kirim Pengingat
                </Button>
              )}
              {req.status === 'Terkirim' && semuaSelesai && (
                <Button size="sm" onClick={() => closePermintaan(req.id, oleh)}>Tutup Permintaan</Button>
              )}
            </div>
          )}
        </div>
        {req.pesan && <p className="text-xs text-slate-600 whitespace-pre-line border-t border-slate-100 pt-3">{req.pesan}</p>}
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 space-y-2">
          <div className="text-xs font-bold text-slate-700 mb-2">Progres per Satker/Unit ({req.sasaran.length})</div>
          <div className="space-y-1.5">
            {req.sasaran.map((orgId) => {
              const org = getOrgById(orgId);
              const st = satkerStatus(req, orgId);
              const files = getBerkas(req.id, orgId);
              return (
                <div key={orgId} className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-100 p-2.5">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800">{org?.sing ?? orgId}</div>
                    <div className="text-[11px] text-slate-400">{files.length} berkas · {files.filter((f) => f.status !== 'draft').length} terkirim</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={st.stage === 'Selesai' ? 'success' : st.terlambat ? 'danger' : st.perluPerbaikan ? 'warning' : st.stage === 'Belum Mulai' ? 'neutral' : 'info'}>
                      {st.label}
                    </Badge>
                    {files.some((f) => f.status !== 'draft') && (
                      <button onClick={() => setBerkasOrgId(orgId)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">
                        Lihat Berkas
                      </button>
                    )}
                    {canManage && req.status === 'Terkirim' && (
                      <button onClick={() => sendReminder(req.id, oleh, orgId)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">
                        Ingatkan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <div className="text-xs font-bold text-slate-700 mb-2">Log Aktivitas</div>
          <Timeline
            items={[...req.log].reverse().map((l) => ({
              id: l.id,
              title: l.aksi,
              description: l.oleh,
              timestamp: formatDateTime(l.waktu),
              tone: l.aksi.toLowerCase().includes('mengembalikan') ? 'warning' : l.aksi.toLowerCase().includes('menutup') ? 'default' : 'success',
            }))}
          />
        </Card>
      </div>

      {extendModal && (
        <Modal
          isOpen
          onClose={() => setExtendModal(false)}
          title="Perpanjang Tenggat Permintaan"
          footer={
            <>
              <Button variant="outline" onClick={() => setExtendModal(false)}>Batal</Button>
              <Button
                onClick={() => {
                  extendDeadline(req.id, newDeadline, oleh);
                  setExtendModal(false);
                }}
              >
                Simpan
              </Button>
            </>
          }
        >
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Tenggat Baru</label>
          <Input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} />
          {daysDiffFromToday(newDeadline) < 0 && <p className="text-[11px] text-amber-600 mt-1.5 font-semibold">Tanggal ini sudah lewat hari ini.</p>}
        </Modal>
      )}

      {berkasOrgId && (
        <BerkasDariSatkerModal reqId={req.id} orgId={berkasOrgId} onClose={() => setBerkasOrgId(null)} />
      )}
    </div>
  );
};

const BERKAS_BADGE_COLOR: Record<BerkasSatker['status'], BadgeColor> = { draft: 'neutral', wait: 'info', ok: 'success', fix: 'warning' };

/** SF-513 "Berkas dari {Satker}" — daftar berkas terkirim + Unduh/Unduh Semua (simulasi). */
const BerkasDariSatkerModal: React.FC<{ reqId: string; orgId: string; onClose: () => void }> = ({ reqId, orgId, onClose }) => {
  useAuditUniverseStore();
  const org = getOrgById(orgId);
  const files = getBerkas(reqId, orgId).filter((f) => f.status !== 'draft');
  const [toast, setToast] = useState('');

  const simulateDownload = (label: string) => {
    setToast(label);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Berkas dari ${org?.sing ?? orgId}`}
      widthClassName="max-w-2xl"
      footer={
        <>
          {files.length > 0 && (
            <Button variant="outline" onClick={() => simulateDownload(`Mengunduh semua ${files.length} berkas ${org?.sing ?? orgId} sebagai .zip (simulasi)...`)}>
              <Files className="w-3.5 h-3.5" /> Unduh Semua
            </Button>
          )}
          <Button onClick={onClose}>Tutup</Button>
        </>
      }
    >
      <div className="space-y-3">
        {toast && <div className="p-2.5 rounded-[8px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">{toast}</div>}
        {files.length === 0 ? (
          <EmptyState title="Belum ada berkas terkirim dari Satker ini" />
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li key={f.id} className="rounded-[10px] border border-slate-100 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{f.nama}</div>
                    <div className="text-[11px] text-slate-400">{f.dokId === LAINNYA_DOC_ID ? 'Lainnya' : getDokById(f.dokId)?.nama ?? f.dokId} · {formatBytes(f.sizeBytes)} · {formatIsoDate(f.tgl)}</div>
                    {f.verifikatorOleh && <div className="text-[11px] text-slate-400 mt-0.5">Diverifikasi oleh {f.verifikatorOleh}{f.tglVerifikasi ? ` · ${formatIsoDate(f.tglVerifikasi)}` : ''}</div>}
                    {f.status === 'fix' && f.catatan && <div className="text-[11px] text-amber-700 mt-1">Catatan: {f.catatan}</div>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge color={BERKAS_BADGE_COLOR[f.status]}>{BERKAS_STATUS_LABEL[f.status]}</Badge>
                    <button onClick={() => simulateDownload(`Mengunduh ${f.nama} (simulasi)...`)} className="text-slate-400 hover:text-slate-600" title="Unduh">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export const orgLabelUtil = orgLabel;
