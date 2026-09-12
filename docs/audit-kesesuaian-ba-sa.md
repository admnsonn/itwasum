# Audit Kesesuaian `evidence/itwasum` terhadap `evidence/BA-SA`

> Dokumen ini dibuat sesuai bagian 7 rencana `align_itwasum_with_ba-sa_specs`. Lingkupnya
> adalah 4 modul BA-SA yang **tidak** ditulis ulang pada iterasi ini — **B.2 Temuan BPK**,
> **B.3 Temuan IRSUS**, **B.7 IKU Satker**, **B.11 Login & Otentikasi** — ditambah **Beranda**
> (Modul Overview, SF-001..SF-012). B.1, B.6, dan B.9 sudah ditangani lewat penulisan ulang
> `EProfileSatkerView`, `TimAuditorView`, dan `PengaturanSistemView` (lihat bagian 5 rencana),
> sehingga tidak diulas di sini.
>
> Metodologi: setiap Screen/Sub Feature (SF) pada FSD `evidence/BA-SA/Functional Specification
> Document (FSD)/` dan `evidence/BA-SA/Modul Overview Requirement BA_SA - Itwasum.docx`
> dipetakan terhadap blok kode yang ada di view existing. Status memakai 3 nilai:
>
> - ✅ **Sesuai** — komponen/behaviour FSD sudah punya representasi yang jelas di view.
> - 🟡 **Sebagian** — ada representasi tapi lebih sederhana dari FSD (data/validasi/exception
>   handling tidak selengkapnya, atau digabung dengan blok lain).
> - ⛔ **Gap** — belum ada representasi sama sekali di view; dicatat sebagai tindak lanjut,
>   **tidak** dikerjakan pada iterasi ini sesuai instruksi rencana bagian 7.
>
> Sejalan dengan instruksi rencana ("selaraskan hal murah saja"), penyelarasan yang benar-benar
> dilakukan pada iterasi ini hanya **penamaan tab/judul screen** (lihat bagian 6). Tidak ada
> pembangunan ulang layar/komponen baru untuk 4 modul + Beranda ini.

## 1. Beranda — Modul Overview (SF-001..SF-012)

Sumber: `evidence/BA-SA/Modul Overview Requirement BA_SA - Itwasum.docx`. Diimplementasikan
di `BerandaView.tsx` dan sub-komponennya (`ThreeAxesBar`, `ExecutiveIndicatorStrip`,
`CommandDirectoryPanel`, `AICriticalSatkerAlertCard`, `IndonesiaMap`, `TacticalAnalyticsDock`,
`ExecutiveBottomTicker`, `OverviewToolbar`, `DokumenGapsModal`, `KPICustomizerModal`).

| SF | Judul FSD | Status | Blok di `evidence/itwasum` | Catatan |
| --- | --- | --- | --- | --- |
| SF-001 | Halaman Overview dan Breadcrumb | 🟡 Sebagian | `ThreeAxesBar` (poros Jenjang/Bidang/Tingkat Objek) sebagai pengganti wayfinding; `BerandaView` merender blok kondisional | Tidak ada komponen `Breadcrumb` eksplisit yang menunjukkan jalur "Nasional › Itwil III › Polda Riau › Polres Kampar" dan bisa diklik untuk kembali ke atas. Tidak ada "Pemilih Periode" & "Penanda Cakupan Halaman" (badge jumlah satker yang datanya masuk hitungan) di header. |
| SF-002 | Ringkasan AI | 🟡 Sebagian | `AICriticalSatkerAlertCard` ("Ringkasan Evaluasi Pengawasan Satker") | Narasi kondisi ada, tapi tidak ada Penanda Periode & Versi, tombol Perbarui Ringkasan, atau tombol Salin/Ekspor Ringkasan. Nada L1 (rekap objek audit binaan Itwil, bukan skor Itwil) belum divalidasi eksplisit di teks. |
| SF-003 | Baris KPI | ✅ Sesuai | `ExecutiveIndicatorStrip` | 6 KPI (Skor Risiko Komposit, Temuan belum ditindaklanjuti, Temuan BPK, Temuan IRSUS lewat SLA, Capaian IKU, Kelengkapan data SSOT) sudah direpresentasikan sebagai kartu; filter bidang tersedia. Selisih antar periode & tautan langsung ke modul asal per kartu belum lengkap. |
| SF-004 | Peta dan Pemilih Lapisan | 🟡 Sebagian | `IndonesiaMap` + `statusFilter`/`tingkatObjek` | Peta interaktif 34 Polda + drill-down Polres ada. "Enam Lapisan" resmi (SRK, Risiko di Atas Selera, Penyelesaian Perkara, Beban Kasus Menonjol, Status Pengawasan, Kelengkapan SSOT) belum satu-satu punya pemilih lapisan sendiri; saat ini bercampur dengan filter status & 3-poros. Daftar Pendamping Peta untuk satker Mabes tanpa koordinat sudah ada lewat `ALL_SATKER_MABES_MAP_DATA` di panel kiri. |
| SF-005 | Tabel Peringkat | 🟡 Sebagian | `CommandDirectoryPanel` (urut skor risiko) | Directory panel sudah terurut berdasar `skorRisiko`/`temuanTerbuka`, tapi disajikan sebagai daftar/kartu bukan tabel dengan tab "Satker Kewilayahan" vs "Satker Mabes" dan pemilih indikator pengurut yang dapat diganti pengguna. |
| SF-006 | Panel Peringatan Dini | 🟡 Sebagian | `CommandDirectoryPanel` (urgentItems), `AICriticalSatkerAlertCard` | Daftar atensi ada, tapi filter Jenis Peringatan / Bidang Manajemen / Itwil yang independen dari 3-poros utama belum ada sebagai panel terpisah. |
| SF-007 | Panel Kesiapan Data | 🟡 Sebagian | `DokumenGapsModal` | Diimplementasikan sebagai modal (dipanggil dari `ThreeAxesBar`/`OverviewToolbar`), bukan panel yang selalu terlihat di halaman utama. Konten persentase keterisian 5 domain & daftar satker tertinggal sudah ada di dalam modal. |
| SF-008 | Tanya Jawab Data (LLM) | ✅ Sesuai | `OverviewToolbar` → slide-over `ChatItwasumCopilotView` (E.5) | Sudah diimplementasikan penuh sebagai fitur "Tanya Jawab Data (SF-008)" yang terhubung ke Gemini; lihat juga komentar di `ChatItwasumCopilotView.tsx`. |
| SF-009 | Drill-down Antar Level | ✅ Sesuai | `ThreeAxesBar` (jenjang: Nasional/Itwil/Polda/Polres), klik peta & directory panel | Perpindahan level lewat peta dan directory panel sudah ada; kedalaman menyusut sesuai level. Validasi "Baris Polres tidak dapat diklik lagi" belum diverifikasi eksplisit tapi tidak ditemukan level lebih dalam yang dirender. |
| SF-010 | Banding Antar Periode | ✅ Sesuai | `OverviewToolbar` → modal Banding Antar Periode (SF-010) | Sudah diimplementasikan sebagai modal perbandingan periode ringkas. |
| SF-011 | Ekspor Laporan | 🟡 Sebagian | `OverviewToolbar` (`logEkspor` + tombol "Ekspor Laporan (SF-011)") | Aksi ekspor & audit trail sudah ada dan digerbangi `canExport`; belum ada Modal Pilihan Format (xlsx/pdf/dll) dengan Indikator Proses — saat ini langsung menandai selesai. |
| SF-012 | Master Penugasan Itwil ↔ Objek Audit | ⛔ Gap | *(tidak ada)* — data statis di `ITWIL_POLDA_MAPPING`/`ITWIL_METADATA` (`mabesSatkerData.ts`) | Belum ada halaman pengelolaan (khusus Super Admin) untuk menambah/memindahkan penugasan Itwil↔objek audit dengan riwayat masa berlaku. Pemetaan Itwil↔Polda saat ini hardcoded, tidak dapat diubah dari UI. |

## 2. B.2 Temuan BPK & B.3 Temuan IRSUS

Kedua modul berbagi satu view, `PengawasanTemuanView.tsx`, dengan tab `bpk` (B.2) dan `irsus`
(B.3) sebagai pemilih modul (bukan pemilih Screen di dalam modul). FSD masing-masing modul
membagi diri menjadi **5 Screen**: Beranda (Landing Page direktori Satker, SF-TI-014, dipakai
bersama oleh B.2 & B.3), Ringkasan (SF-TB/TI-001..005), Analisis (SF-TB/TI-006..008), Detail
(SF-TB/TI-009 dan SF-TB/TI-011..013), dan Tindak Lanjut (SF-TB/TI-009). Catatan: penomoran SF
pada FSD sumber memang tidak berurutan rapi (SF-TB-010 tidak muncul secara eksplisit di
dokumen), diikuti sebagaimana adanya.

| Screen FSD | SF | Status | Blok di `evidence/itwasum` | Catatan |
| --- | --- | --- | --- | --- |
| Beranda (Landing Page) | SF-TI-014 | ⛔ Gap | *(tidak ada)* | Tidak ada landing page direktori Satker khusus sebelum masuk ke Temuan BPK/IRSUS; pengguna langsung diarahkan ke tabel gabungan lewat menu `#/b2` / `#/b3`. |
| Ringkasan | SF-TB-001/SF-TI-001 Ringkasan AI | ⛔ Gap | *(tidak ada)* | Tidak ada narasi AI + AI Confidence + Waktu Analisis untuk BPK/IRSUS secara spesifik (beda dengan Beranda utama yang punya `AICriticalSatkerAlertCard`). |
| Ringkasan | SF-TB-002/SF-TI-002 Statistik Temuan | 🟡 Sebagian | Header banner "Mode Pengawas Tim"/"Mode Auditee" + kolom Status pada tabel | KPI Card terpisah (Total/Selesai/Dalam Proses/Belum Ditindaklanjuti/Lewat Target/Total Nilai) belum ada; datanya baru terlihat implisit lewat filter status & badge per baris. |
| Ringkasan | SF-TB-003/SF-TI-003 Rekomendasi (AI) Audit | 🟡 Sebagian | Kolom "Rekomendasi" di tabel + field `rekomendasi` pada modal | Rekomendasi ditampilkan per baris temuan, bukan sebagai kartu ringkasan prioritas terpisah dengan tingkat risiko & dampak. |
| Ringkasan | SF-TB-004/SF-TI-004 Dokumen Terkait | ⛔ Gap | *(tidak ada)* | Belum ada daftar dokumen referensi hasil pemeriksaan yang terpisah dari data temuan. |
| Ringkasan | SF-TB-005/SF-TI-005 Lihat Semua Rekomendasi | ⛔ Gap | *(tidak ada)* | FSD sendiri menandai ini placeholder ("Requirement detail menyusul") — konsisten belum diimplementasikan. |
| Analisis | SF-TB-006/SF-TI-006 Distribusi Temuan | ⛔ Gap | *(tidak ada)* | Belum ada bar/donut/pie chart distribusi per Satker, kategori, atau tingkat risiko untuk BPK/IRSUS. |
| Analisis | SF-TB-007 Analisis Akar Masalah / SF-TI-007 Analisis Root Cause | ⛔ Gap | *(tidak ada)* | Ini adalah salah satu gap besar yang disebut eksplisit pada rencana bagian 7 ("SF-TB-007 Analisis Akar Masalah") — FSD sumbernya sendiri untuk BPK masih placeholder detail, tapi versi IRSUS (SF-TI-007) sudah lengkap dan tetap belum diimplementasikan di sini. |
| Analisis | SF-TB-008/SF-TI-008 Similar Finding / Analisis Temuan Serupa | ⛔ Gap | *(tidak ada)* | Tidak ada mekanisme AI yang menandai status "Temuan Baru" vs "Temuan Berulang". Field ini juga tidak ada pada tipe data temuan saat ini. |
| Tindak Lanjut | SF-TB-009/SF-TI-009 Monitoring Satker | 🟡 Sebagian | Dropdown filter "Pilih Satker/Polda" pada tabel gabungan | Tidak ada tabel ringkas per-Satker dengan persentase penyelesaian terpisah dari daftar temuan individual; datanya baru bisa didapat dengan memfilter satu-per-satu Satker. |
| Detail | SF-TB-011/SF-TI-011 Daftar Temuan | ✅ Sesuai | Tabel utama `PengawasanTemuanView` (kolom Kode & Satker, Uraian, Kategori, Nilai Kerugian, Tenggat, Status & Aksi) | Pencarian (`searchQuery`) dan filter status sudah ada. Show Entries (5/10) & Pagination belum ada — tabel merender seluruh baris terfilter langsung dengan `max-h-[600px]` + scroll. |
| Detail | SF-TB-012/SF-TI-012 Lihat Semua Daftar Temuan | ⛔ Gap | *(tidak ada, karena tidak ada paginasi Show Entries di atasnya)* | Tidak relevan sebagai halaman terpisah karena tabel utama sudah menampilkan semua baris. |
| Detail | SF-TB-013/SF-TI-013 Detail Temuan | 🟡 Sebagian | Modal "Detail Tindak Lanjut Temuan" (klik baris tabel) | Uraian, Rekomendasi, upload bukti, dan 3 tombol ubah status ada. Timeline Progress kronologis, Riwayat Temuan Berulang, dan Dokumen Terkait per-temuan belum ada di modal. |
| Tindak Lanjut (aksi) | — | ✅ Sesuai | Tombol "🔴 Belum Sesuai / 🟡 Dalam Proses / 🟢 Selesai" pada modal | Perubahan status tindak lanjut sudah fungsional (in-memory), lengkap dengan toast konfirmasi. |

## 3. B.7 IKU Satker

FSD membagi B.7 menjadi 2 Screen: **Dashboard IKU Nasional** (SF-IKU-001/002/006/007) dan
**Dashboard Detail Wilayah** (SF-IKU-003/004/005/008/009/010). Diimplementasikan sebagai tab
`iku` pada `KinerjaSatkerView.tsx` (3 tab lain — `irsus`, `eprofil`, `rbs` — di luar lingkup
B.7, masing-masing lebih dekat ke B.3/B.1/B.13).

| Screen FSD | SF | Status | Blok di `evidence/itwasum` | Catatan |
| --- | --- | --- | --- | --- |
| Dashboard IKU Nasional | SF-IKU-001 Ringkasan AI | ⛔ Gap | *(tidak ada)* | Tidak ada filter Tahun/Periode + narasi AI + Highlight Analisis + Rekomendasi Pimpinan khusus IKU. |
| Dashboard IKU Nasional | SF-IKU-002 Statistik IKU | 🟡 Sebagian | Ringkasan "Rata-rata Nasional: 89,6%" + legenda warna | Hanya Overall IKU yang tersaji; SSI–Kamtibmas, SS1–Harkamtibmas, SS2–Gakkum Polri, Jumlah Warning, dan Jumlah Critical sebagai KPI Card terpisah belum ada. |
| Dashboard IKU Nasional | SF-IKU-006 Heatmap Kinerja Nasional | 🟡 Sebagian | `BarChart` 34 Polda (di tab **"Dashboard IKU Nasional"**, nama tab sudah diselaraskan pada iterasi ini) | Visualisasi bar chart per Polda dengan warna kategori (hijau/kuning/merah) sudah menyampaikan info yang sama dengan heatmap, tapi bentuknya bukan peta interaktif Indonesia dan tidak bisa diklik untuk membuka Dashboard Detail Polda (baru bisa filter per pulau). |
| Dashboard IKU Nasional | SF-IKU-007 Early Warning | 🟡 Sebagian | Panel kolaps "Analisis Lanjutan & Rekomendasi Pengawasan" | Tidak ada daftar Early Warning terstruktur (Status Target Tercapai/Warning/Critical) dengan Prioritas Monitoring dan filter Tahun/Periode; kontennya baru 2 kartu naratif statis. |
| Dashboard Detail Wilayah | SF-IKU-003 Rekomendasi AI & Sumber Data | ⛔ Gap | *(tidak ada)* | Belum ada rekomendasi strategis per-wilayah dengan Prioritas/Status Implementasi, atau tabel Sumber Data Analisis + Status Sinkronisasi. |
| Dashboard Detail Wilayah | SF-IKU-004 Pencapaian IKU (Target vs Realisasi per indikator) | ⛔ Gap | *(tidak ada)* | Belum ada breakdown per-indikator (hanya Overall IKU per Polda). |
| Dashboard Detail Wilayah | SF-IKU-005 Tren & Gap Analysis | ⛔ Gap | *(tidak ada)* | Belum ada tren antar periode atau daftar "IKU dengan Gap Terbesar" untuk satu wilayah. |
| Dashboard Detail Wilayah | SF-IKU-008 Ringkasan Kinerja Polda | ⛔ Gap | *(tidak ada)* | Belum ada halaman detail per-Polda (Capaian Keseluruhan, Target Periode, Realisasi Program, Status Kinerja, Jumlah IKU Tercapai/Belum). |
| Dashboard Detail Wilayah | SF-IKU-009 Analisis & Insight Kinerja (AI) | ⛔ Gap | *(tidak ada)* | Forecast, Deteksi Anomali, dan Early Warning berbasis AI per-Polda belum diimplementasikan. |
| Dashboard Detail Wilayah | SF-IKU-010 Monitoring IKU Polres | ⛔ Gap | *(tidak ada)* | Belum ada tabel Polres di bawah satu Polda dengan Ranking Capaian. |

**Perubahan yang sudah diterapkan** (bagian 6, "hal murah"): label tab `iku` diganti dari
"Pencapaian IKU Satker" menjadi **"Dashboard IKU Nasional"**, dan judul kartu chart diganti
menjadi **"Dashboard IKU Nasional — Perbandingan Capaian Indikator Kinerja Utama (IKU)"** agar
konsisten dengan penamaan Screen FSD. Karena belum ada Screen "Dashboard Detail Wilayah" yang
terpisah di kode, tab baru untuk itu **tidak** dibuat pada iterasi ini (lihat gap SF-IKU-003
s.d. SF-IKU-010 di atas) — hanya didokumentasikan sebagai tindak lanjut.

## 4. B.11 Login & Otentikasi

FSD membagi B.11 menjadi 4 Feature: **Login**, **Verifikasi 2FA**, **Lupa Kata Sandi**, dan
**Pengelolaan Sesi Pengguna** (sesi berjalan di seluruh aplikasi, bukan satu halaman). Saat ini
hanya `LoginView.tsx` yang ada; tidak ada halaman OTP, reset password, atau mekanisme sesi
eksplisit (aplikasi adalah mock SPA tanpa backend sungguhan).

| Feature FSD | SF | Status | Blok di `evidence/itwasum` | Catatan |
| --- | --- | --- | --- | --- |
| Login | SF-LA-001 Form Input Kredensial | 🟡 Sebagian | Form `LoginView` (dropdown Tingkat Akses → Yurisdiksi Wilayah → Peran, lalu email/password) | Show/Hide Password ada. FSD hanya mensyaratkan Username/Email + Password; implementasi menambah 3 dropdown demo (Tingkat/Wilayah/Peran) yang tidak ada di FSD — ini pola khusus mock untuk memilih 1 dari 8 peran demo, disengaja untuk kebutuhan demo peran, bukan gap. |
| Login | SF-LA-002 Validasi Kredensial Pengguna | 🟡 Sebagian | `handleLoginSubmit` mencocokkan email/password ke `PredefinedAccountConfig` | Validasi ada tapi sederhana (string match ke akun demo), tanpa pesan generik "Username/Email atau password tidak valid" yang seragam untuk kedua kasus gagal (pesannya saat ini dibedakan per kasus, sedikit lebih informatif dari FSD, bukan gap fungsional). |
| Login | SF-LA-003 Validasi Status Aktivasi Akun Internal | ⛔ Gap | *(tidak ada)* | Tidak ada status akun Aktif/Nonaktif/Dikunci yang memengaruhi proses login (semua akun demo dianggap aktif). |
| Login | SF-LA-004 Remember Me | 🟡 Sebagian | Checkbox "Ingat perangkat ini" (`rememberMe` state) | Checkbox ada dan disimpan sebagai state lokal, tapi tidak benar-benar menyimpan preferensi ke storage dengan masa berlaku 30 hari (tidak ada efek nyata setelah submit). |
| Login | Percobaan gagal 5x → kunci 30 menit | ⛔ Gap | *(tidak ada)* | Tidak ada penghitung percobaan gagal maupun penguncian akun sementara. |
| Verifikasi 2FA | SF-OTP-001 Pengiriman OTP | ⛔ Gap | *(tidak ada)* | Login langsung berhasil (`onLoginSuccess`) tanpa tahap OTP. |
| Verifikasi 2FA | SF-OTP-002 Verifikasi OTP | ⛔ Gap | *(tidak ada)* | Tidak ada halaman/field input OTP, countdown, atau tautan "Kembali ke Login". |
| Verifikasi 2FA | SF-OTP-003 OTP Resend Limitation | ⛔ Gap | *(tidak ada)* | Tidak relevan tanpa SF-OTP-001/002. |
| Lupa Kata Sandi | SF-LP-001 Permintaan Reset Kata Sandi | ⛔ Gap | *(tidak ada)* | Tidak ada tautan/halaman "Lupa Kata Sandi" pada `LoginView`. |
| Lupa Kata Sandi | SF-LP-002 Verifikasi OTP (reset) | ⛔ Gap | *(tidak ada)* | — |
| Lupa Kata Sandi | SF-LA-003 (dupl.) Pembuatan Kata Sandi Baru | ⛔ Gap | *(tidak ada)* | — |
| Pengelolaan Sesi | SF-PS-001 Session Timeout (24 jam / sliding session) | ⛔ Gap | *(tidak ada)* | SPA mock menyimpan sesi di state React (`currentUser` di `App.tsx`) tanpa batas waktu; sesi baru hilang saat browser di-refresh/tutup. |
| Pengelolaan Sesi | SF-PS-002 Single Active Session | ⛔ Gap | *(tidak ada — memerlukan backend nyata)* | Disebut eksplisit sebagai gap besar pada rencana bagian 7 ("SF-PS-002 sesi tunggal"). Tidak dapat diwujudkan bermakna pada mock tanpa server sesungguhnya untuk menyimpan Session Registry lintas tab/perangkat — dicatat sebagai tindak lanjut arsitektural, bukan tugas UI. |
| Pengelolaan Sesi | SF-PS-003 Session Timeout Redirection | ⛔ Gap | *(tidak ada)* | — |
| Pengelolaan Sesi | SF-PS-004 Logout | ✅ Sesuai | Tombol ganti akun / keluar di `App.tsx` (`onSwitchAccount`) mengembalikan pengguna ke `LoginView` | Fungsi dasar logout (kembali ke halaman Login) sudah ada, walau tanpa `Audit Logger` khusus event logout maupun penghapusan token sesi (karena tidak ada token sungguhan). |
| Pengelolaan Sesi | SF-PS-005 Notifikasi Status Login | ⛔ Gap | *(tidak ada)* | Tidak ada notifikasi terpisah untuk login berhasil / logout berhasil / sesi berakhir. |

## 5. Penyelarasan "hal murah" yang sudah diterapkan

Sesuai instruksi rencana bagian 7, hanya perubahan nama tab/judul screen berikut yang
diterapkan langsung pada kode (tanpa membangun layar baru):

1. `KinerjaSatkerView.tsx` — tab `iku`: label diganti dari **"Pencapaian IKU Satker"** menjadi
   **"Dashboard IKU Nasional"**; judul kartu chart utama diganti menjadi **"Dashboard IKU
   Nasional — Perbandingan Capaian Indikator Kinerja Utama (IKU)"**, mengikuti nama Screen
   FSD B.7.
2. `PengawasanTemuanView.tsx` — ditambahkan label screen kecil **"Layar: Detail Temuan &
   Tindak Lanjut"** di atas filter bar (untuk tab `bpk`/`irsus`/`polri`) agar pengguna dan
   auditor kode paham layar ini adalah implementasi gabungan SF-TB/TI-011 (Daftar Temuan) dan
   SF-TB/TI-009 (Monitoring/Tindak Lanjut) — bukan penggantian nama tab modul BPK/IRSUS itu
   sendiri, karena tab tersebut memang berfungsi sebagai pemilih modul B.2 vs B.3, bukan
   pemilih Screen "Ringkasan/Analisis/Detail/Tindak Lanjut" di dalam satu modul (Screen-Screen
   itu belum ada secara terpisah di kode — lihat gap di bagian 2).

B.2/B.3 **tidak** diberi tab baru bernama "Ringkasan"/"Analisis"/"Detail"/"Tindak Lanjut"
karena konten Screen-Screen tersebut (Ringkasan AI, Statistik, Distribusi, Root Cause, dll.)
memang belum ada di kode; menambahkan tab kosong akan menyesatkan, bukan menyederhanakan.
Gap ini didaftarkan pada bagian 6 untuk dikerjakan pada iterasi berikutnya jika diprioritaskan.

## 6. Daftar tindak lanjut (gap besar, tidak dikerjakan pada iterasi ini)

Diurutkan kasar dari yang paling berdampak ke paling kecil:

1. **B.2/B.3 — Screen Ringkasan & Analisis** (SF-TB/TI-001..008): Ringkasan AI, Statistik
   Temuan (6 KPI Card), Rekomendasi AI, Dokumen Terkait, Distribusi Temuan (chart per
   Satker/kategori/risiko), **Analisis Akar Masalah / Root Cause** (disebut eksplisit di
   rencana), dan Analisis Temuan Serupa (status Temuan Baru vs Berulang) — belum ada sama
   sekali; saat ini B.2/B.3 hanya berupa satu tabel Detail Temuan + modal.
2. **B.7 — Dashboard Detail Wilayah** (SF-IKU-003/004/005/008/009/010): halaman detail per
   Polda (Ringkasan Kinerja Polda, Analisis & Insight AI, Monitoring IKU Polres, Gap Analysis)
   belum ada; saat ini hanya ada satu bar chart nasional datar.
3. **B.11 — Verifikasi 2FA, Lupa Kata Sandi, dan pembatasan percobaan login**: seluruh alur
   OTP dan reset password belum ada; `LoginView` langsung berhasil setelah submit form.
4. **B.11 — SF-PS-002 Single Active Session**: memerlukan backend/Session Registry
   sungguhan; tidak dapat diwujudkan bermakna di SPA mock tanpa server (disebut eksplisit di
   rencana sebagai contoh gap yang boleh dilewati).
5. **Beranda SF-012 — Master Penugasan Itwil ↔ Objek Audit**: halaman admin (Super Admin) untuk
   mengelola penugasan Itwil ke objek audit dengan riwayat masa berlaku; saat ini pemetaan
   statis di `mabesSatkerData.ts`.
6. **Beranda SF-001 — Breadcrumb & Pemilih Periode eksplisit**: `ThreeAxesBar` sudah menutupi
   sebagian besar kebutuhan navigasi, tapi tidak ada komponen breadcrumb yang dapat diklik atau
   pemilih periode global di header.
7. **Beranda SF-004 — Enam Lapisan Peta terpisah** dan **SF-005 Tabel Peringkat dengan tab
   Kewilayahan/Mabes + pemilih indikator**: implementasi saat ini menyatukan beberapa konsep ke
   dalam filter 3-poros dan directory panel; belum satu-satu sesuai FSD.
8. **Beranda SF-007 — Panel Kesiapan Data sebagai panel permanen** (bukan modal) dan
   **SF-011 — Modal Pilihan Format Ekspor** (xlsx/pdf) dengan indikator proses.
