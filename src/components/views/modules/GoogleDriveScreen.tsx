/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.8 Management Google Drive (Plan "Align itwasum with Plane BA/SA", todo p6-b8b9). 3 state
 * halaman: S1 Google belum terhubung (tombol ke B.9), S2 terhubung tapi belum ada root folder,
 * S3 daftar root. Menambah root memvalidasi tautan, men-scan, dan menampilkan pratinjau sebelum
 * disimpan; root duplikat diblokir. Setiap root punya aksi rescan & folder explorer drawer;
 * folder yang hilang saat rescan ditandai nonaktif (bukan dihapus).
 */
import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, FolderOpen, HardDrive, Link as LinkIcon, RefreshCw, XCircle } from 'lucide-react';
import { useGoogleAuthState } from '../../../data/integrations/googleAuth';
import {
  useGoogleDriveState,
  getRootsForSatker,
  addDriveRoot,
  rescanDriveRoot,
  deactivateDriveRoot,
  reactivateDriveRoot,
  validateDriveUrl,
  scanDriveFolder,
  type DriveRoot,
} from '../../../data/integrations/googleDrive';
import { Badge, Button, Card, EmptyState, Input, Modal, Typography } from '../../ui';

export const GoogleDriveScreen: React.FC<{ satkerId: string; satkerNama: string }> = ({ satkerId, satkerNama }) => {
  const auth = useGoogleAuthState();
  useGoogleDriveState();
  const [addOpen, setAddOpen] = useState(false);
  const [explorerRoot, setExplorerRoot] = useState<DriveRoot | null>(null);
  const roots = getRootsForSatker(satkerId);

  // S1 — Google belum terhubung.
  if (auth.status !== 'connected') {
    return (
      <Card>
        <EmptyState
          title="Google Belum Terhubung"
          description="Hubungkan akun Google Itwasum pada B.9 Pengaturan Sistem > Pengaturan Parameter > Google Authentication sebelum mengelola root folder Google Drive."
          icon={<HardDrive className="w-8 h-8 text-slate-300" />}
          action={
            <Button variant="outline" onClick={() => { window.location.hash = '#/b9/kontrol-akses'; }}>
              Buka Pengaturan Google Authentication
            </Button>
          }
        />
      </Card>
    );
  }

  // S2 — terhubung, belum ada root.
  if (roots.length === 0) {
    return (
      <Card className="space-y-3">
        <EmptyState
          title="Belum Ada Root Folder Terhubung"
          description={`Tambahkan tautan folder Google Drive sebagai sumber bukti dukung KKLEAD SPIP untuk ${satkerNama}.`}
          icon={<FolderOpen className="w-8 h-8 text-slate-300" />}
          action={<Button onClick={() => setAddOpen(true)}><LinkIcon className="w-4 h-4" />Tambah Root Folder</Button>}
        />
        {addOpen && <AddRootModal satkerId={satkerId} onClose={() => setAddOpen(false)} />}
      </Card>
    );
  }

  // S3 — daftar root.
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Root Folder Terhubung — {satkerNama}</Typography>
        <Button size="sm" onClick={() => setAddOpen(true)}><LinkIcon className="w-3.5 h-3.5" />Tambah Root</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {roots.map((r) => (
          <Card key={r.id} className={!r.aktif ? 'opacity-60' : ''}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5"><FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />{r.folderName}</div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">{r.folderUrl}</div>
                <div className="text-[11px] text-slate-400 mt-1">Scan terakhir: {new Date(r.lastScanAt).toLocaleString('id-ID')}</div>
              </div>
              <Badge color={r.aktif ? 'success' : 'neutral'}>{r.aktif ? 'Aktif' : 'Nonaktif'}</Badge>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">{r.folders.filter((f) => f.aktif).length} dari {r.folders.length} sub-folder aktif</div>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => rescanDriveRoot(r.id)}><RefreshCw className="w-3.5 h-3.5" />Rescan</Button>
              <Button size="sm" variant="outline" onClick={() => setExplorerRoot(r)}><FolderOpen className="w-3.5 h-3.5" />Jelajahi Folder</Button>
              {r.aktif ? (
                <button onClick={() => deactivateDriveRoot(r.id)} className="text-[11px] font-bold text-rose-500 hover:underline ml-auto">Nonaktifkan</button>
              ) : (
                <button onClick={() => reactivateDriveRoot(r.id)} className="text-[11px] font-bold text-emerald-600 hover:underline ml-auto">Aktifkan</button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {addOpen && <AddRootModal satkerId={satkerId} onClose={() => setAddOpen(false)} />}
      {explorerRoot && <FolderExplorerDrawer root={explorerRoot} onClose={() => setExplorerRoot(null)} />}
    </div>
  );
};

const AddRootModal: React.FC<{ satkerId: string; onClose: () => void }> = ({ satkerId, onClose }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<ReturnType<typeof scanDriveFolder> | null>(null);
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    const valid = validateDriveUrl(url);
    if (!valid.ok) return setError(valid.reason ?? 'Tautan tidak valid.');
    setError('');
    setScanning(true);
    setTimeout(() => {
      setPreview(scanDriveFolder(url));
      setScanning(false);
    }, 700);
  };

  const handleSave = () => {
    const result = addDriveRoot(satkerId, url);
    if (!result.ok) return setError(result.reason ?? 'Gagal menyimpan root folder.');
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Tambah Root Folder Google Drive"
      widthClassName="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          {preview ? <Button onClick={handleSave}>Simpan Root Folder</Button> : <Button onClick={handleScan} disabled={scanning}>{scanning ? 'Memindai...' : 'Validasi & Pindai'}</Button>}
        </>
      }
    >
      <div className="space-y-3">
        {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-start gap-2"><XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{error}</div>}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Tautan Folder Google Drive</label>
          <Input value={url} onChange={(e) => { setUrl(e.target.value); setPreview(null); }} placeholder="https://drive.google.com/drive/folders/1AbCdEfGhIjKlmn" />
        </div>
        {preview && (
          <div className="p-3 rounded-[10px] bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 mb-2"><CheckCircle2 className="w-3.5 h-3.5" />Pratinjau: {preview.folderName}</div>
            <ul className="space-y-1">
              {preview.folders.map((f) => (
                <li key={f.id} className="text-[11px] text-emerald-900 flex items-center justify-between">
                  <span>{f.nama}</span>
                  <span className="font-mono text-emerald-600">{f.fileCount} berkas</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
};

const FolderExplorerDrawer: React.FC<{ root: DriveRoot; onClose: () => void }> = ({ root, onClose }) => (
  <Modal isOpen onClose={onClose} title={`Jelajahi Folder — ${root.folderName}`} widthClassName="max-w-lg" footer={<Button onClick={onClose}>Tutup</Button>}>
    <ul className="space-y-1.5">
      {root.folders.map((f) => (
        <li key={f.id} className={`flex items-center justify-between gap-2 p-2.5 rounded-[10px] border ${f.aktif ? 'border-slate-100 bg-slate-50' : 'border-rose-100 bg-rose-50'}`}>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-800 truncate">{f.nama}</div>
            <div className="text-[11px] text-slate-400 truncate">{f.path}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-400">{f.fileCount} berkas</span>
            {!f.aktif && <Badge color="danger"><AlertTriangle className="w-3 h-3 mr-1 inline" />Hilang</Badge>}
          </div>
        </li>
      ))}
    </ul>
  </Modal>
);
