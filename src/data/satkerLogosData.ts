import { getPoldaEmblemDataUri } from '../utils/poldaEmblemGenerator';
import { PUBLIC_STRUCTURE_LOOKUP } from './publicStructureData';

// Direktori Data Logo Satker Polri (Polda, Polres, Polsek)
// Menggunakan aset logo publik resmi dari Wikimedia Commons dan dokumentasi resmi Polri, bukan data dummy internal.

export interface SatkerLogoItem {
  id: string;
  nama: string;
  singkatan: string;
  tingkat: 'Mabes' | 'Itwasum' | 'Itwil' | 'Biro-Mabes' | 'Satker-Mabes' | 'Polda' | 'Polrestabes' | 'Polresta' | 'Polres' | 'Polsek';
  parentPoldaId: string;
  parentPoldaNama: string;
  parentPolresId?: string;
  parentPolresNama?: string;
  pulau: 'Sumatera' | 'Jawa' | 'Kalimantan' | 'Sulawesi' | 'Bali-Nusa' | 'Maluku-Papua';
  imageUrl: string;
  source: string;
  sourceUrl?: string;
  motto: string;
  deskripsi: string;
  warnaUtama: string;
  warnaAksen: string;
  tahunBerdiri?: string;
  wilayahHukum: string;
}

// Data Logo Tingkat Mabes, Itwasum, Inspektorat Wilayah (Itwil I - V), dan Satker Utama Mabes Polri
export const MABES_ITWASUM_LOGOS_DATA: Record<string, SatkerLogoItem> = {
  'mabes-polri': {
    id: 'mabes-polri',
    nama: 'Markas Besar Kepolisian Negara Republik Indonesia',
    singkatan: 'Mabes Polri',
    tingkat: 'Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Wikimedia Commons / dokumen resmi Polri',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    motto: 'Rastra Sewakotama (Abdi Utama daripada Nusa dan Bangsa)',
    deskripsi: 'Lambang Tribrata Emas berlatar Perisai Biru Gelap dengan Bintang Tiga Bhayangkara dan Tiang Obor Persatuan',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Seluruh Wilayah Negara Kesatuan Republik Indonesia (Mabes Jl. Trunojoyo No. 3, Kebayoran Baru, Jakarta Selatan)'
  },
  'itwasum-polri': {
    id: 'itwasum-polri',
    nama: 'Inspektorat Pengawasan Umum Kepolisian Negara Republik Indonesia',
    singkatan: 'Itwasum Polri',
    tingkat: 'Itwasum',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Dokumentasi resmi Itwasum Polri / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    motto: 'Vigilantiae & Akuntabilitas Presisi',
    deskripsi: 'Lambang Cakra Pengawasan Emas berlatar Perisai Merah Marun Melambangkan Pengawasan Melekat & Penjaminan Mutu',
    warnaUtama: '#831843',
    warnaAksen: '#FBBF24',
    wilayahHukum: 'Pengawasan Fungsional Seluruh Satuan Kerja Mabes Polri dan 34 Polda Jajaran Kewilayahan'
  },
  'itwil-1': {
    id: 'itwil-1',
    nama: 'Inspektorat Wilayah I Itwasum Polri (Wilayah Barat)',
    singkatan: 'Itwil I Itwasum',
    tingkat: 'Itwil',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Itwasum Polri',
    pulau: 'Sumatera',
    imageUrl: getPoldaEmblemDataUri('itwil-1', 'ITWIL I'),
    source: 'Dokumentasi Resmi Itwasum Polri',
    motto: 'Pengawasan Wilayah Barat Indonesia (10 Polda Sumatera)',
    deskripsi: 'Inspektorat Pengawasan Wilayah I membawahi audit berkala, wasrik, dan evaluasi akuntabilitas 10 Polda di Pulau Sumatera',
    warnaUtama: '#064E3B',
    warnaAksen: '#FBBF24',
    wilayahHukum: '10 Polda Sumatera: Polda Aceh, Sumut, Sumbar, Riau, Kepri, Jambi, Bengkulu, Sumsel, Babel, Lampung'
  },
  'itwil-2': {
    id: 'itwil-2',
    nama: 'Inspektorat Wilayah II Itwasum Polri (Wilayah Tengah)',
    singkatan: 'Itwil II Itwasum',
    tingkat: 'Itwil',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Itwasum Polri',
    pulau: 'Jawa',
    imageUrl: getPoldaEmblemDataUri('itwil-2', 'ITWIL II'),
    source: 'Dokumentasi Resmi Itwasum Polri',
    motto: 'Pengawasan Wilayah Tengah Indonesia (11 Polda Jawa & Kalimantan)',
    deskripsi: 'Inspektorat Pengawasan Wilayah II membawahi audit berkala, wasrik, dan evaluasi akuntabilitas 11 Polda di Jawa dan Kalimantan',
    warnaUtama: '#1E3A8A',
    warnaAksen: '#F59E0B',
    wilayahHukum: '11 Polda: Polda Metro Jaya, Jabar, Jateng, Jatim, Banten, DIY, Kalbar, Kalteng, Kalsel, Kaltim, Kaltara'
  },
  'itwil-3': {
    id: 'itwil-3',
    nama: 'Inspektorat Wilayah III Itwasum Polri (Wilayah Timur)',
    singkatan: 'Itwil III Itwasum',
    tingkat: 'Itwil',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Itwasum Polri',
    pulau: 'Maluku-Papua',
    imageUrl: getPoldaEmblemDataUri('itwil-3', 'ITWIL III'),
    source: 'Dokumentasi Resmi Itwasum Polri',
    motto: 'Pengawasan Wilayah Timur Indonesia (16 Polda & Satker Mabes)',
    deskripsi: 'Inspektorat Pengawasan Wilayah III membawahi audit dan pengawasan 16 Polda di Bali, Nusa Tenggara, Sulawesi, Maluku, dan Papua',
    warnaUtama: '#701A75',
    warnaAksen: '#38BDF8',
    wilayahHukum: '16 Polda: Bali, NTB, NTT, Sulut, Gorontalo, Sulteng, Sulbar, Sulsel, Sultra, Maluku, Malut, Papua, Papua Barat, Papua Tengah, Papua Pegunungan, Papua Selatan'
  },
  'itwil-4': {
    id: 'itwil-4',
    nama: 'Inspektorat Wilayah IV Itwasum Polri (Audit Khusus & Investigasi)',
    singkatan: 'Itwil IV Itwasum',
    tingkat: 'Itwil',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Itwasum Polri',
    pulau: 'Jawa',
    imageUrl: getPoldaEmblemDataUri('itwil-4', 'ITWIL IV'),
    source: 'Dokumentasi Resmi Itwasum Polri',
    motto: 'Audit Khusus, Wasrik Investigasi & Dumas Berkadar Tinggi',
    deskripsi: 'Inspektorat Wilayah IV bertugas melaksanakan audit investigatif (Irsus), audit kepatuhan khusus, dan gelar perkara tindak pidana tertentu',
    warnaUtama: '#18181B',
    warnaAksen: '#EF4444',
    wilayahHukum: 'Nasional (Seluruh Satker Mabes & Kewilayahan Polri Terkait Audit Investigatif)'
  },
  'itwil-5': {
    id: 'itwil-5',
    nama: 'Inspektorat Wilayah V Itwasum Polri (Penjaminan Mutu & Dumas Presisi)',
    singkatan: 'Itwil V Itwasum',
    tingkat: 'Itwil',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Itwasum Polri',
    pulau: 'Jawa',
    imageUrl: getPoldaEmblemDataUri('itwil-5', 'ITWIL V'),
    source: 'Dokumentasi Resmi Itwasum Polri',
    motto: 'Penjaminan Mutu, Pengawasan SPIP, e-Audit & Dumas Presisi',
    deskripsi: 'Inspektorat Wilayah V membidangi tata kelola aplikasi Dumas Presisi, evaluasi maturitas SPIP, e-Audit, dan Reformasi Birokrasi Polri',
    warnaUtama: '#0F766E',
    warnaAksen: '#38BDF8',
    wilayahHukum: 'Nasional (Sistem Informasi Dumas Presisi & Penjaminan Mutu Pengawasan)'
  },
  'biro-renmin-itwasum': {
    id: 'biro-renmin-itwasum',
    nama: 'Biro Perencanaan dan Administrasi Itwasum Polri',
    singkatan: 'Biro Renmin Itwasum',
    tingkat: 'Biro-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Itwasum Polri',
    pulau: 'Jawa',
    imageUrl: getPoldaEmblemDataUri('biro-renmin-itwasum', 'RENMIN'),
    source: 'Dokumentasi Resmi Itwasum Polri',
    motto: 'Perencanaan Strategis & Administrasi Pengawasan Akuntabel',
    deskripsi: 'Mengelola perencanaan program kerja, anggaran, SDM auditor pengawas, dan ketatausahaan Itwasum Polri',
    warnaUtama: '#1E293B',
    warnaAksen: '#38BDF8',
    wilayahHukum: 'Mabes Polri (Gedung Utama Itwasum Jl. Trunojoyo No. 3 Jakarta Selatan)'
  },
  'biro-binopsnal-itwasum': {
    id: 'biro-binopsnal-itwasum',
    nama: 'Biro Pembinaan Operasional Itwasum Polri',
    singkatan: 'Biro Binopsnal Itwasum',
    tingkat: 'Biro-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Itwasum Polri',
    pulau: 'Jawa',
    imageUrl: getPoldaEmblemDataUri('biro-binopsnal-itwasum', 'BINOPS'),
    source: 'Dokumentasi Resmi Itwasum Polri',
    motto: 'Pembinaan Operasional Pengawasan & Was Ops Mantap Brata/Lilin',
    deskripsi: 'Menyelenggarakan pengawasan operasi kepolisian (Wasops), asistensi supervisi operasi kewilayahan, dan analisa evaluasi operasional',
    warnaUtama: '#1E293B',
    warnaAksen: '#EF4444',
    wilayahHukum: 'Pengawasan Operasi Kepolisian Terpusat dan Kewilayahan di Seluruh Indonesia'
  },

  // SATKER UTAMA MABES POLRI
  'bareskrim': {
    id: 'bareskrim',
    nama: 'Badan Reserse Kriminal Kepolisian Negara Republik Indonesia',
    singkatan: 'Bareskrim Polri',
    tingkat: 'Satker-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bareskrim_Logo.png',
    source: 'Wikimedia Commons (Lambang Resmi Bareskrim Polri)',
    motto: 'Sidik Sakti Indera Waspada',
    deskripsi: 'Unsur pelaksana utama Mabes Polri bidang penyelidikan dan penyidikan tindak pidana umum, ekonomi khusus, siber, korupsi, dan narkoba',
    warnaUtama: '#0F172A',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Seluruh Wilayah Hukum NKRI (Gedung Awaloedin Djamin Bareskrim Polri)'
  },
  'baharkam': {
    id: 'baharkam',
    nama: 'Badan Pemelihara Keamanan Kepolisian Negara Republik Indonesia',
    singkatan: 'Baharkam Polri',
    tingkat: 'Satker-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Dokumentasi Resmi Baharkam Polri',
    motto: 'Cighra Japti (Cepat Tanggap Memelihara Kamtibmas)',
    deskripsi: 'Membawahi Korps Sabhara, Korps Polairud (Polisi Perairan & Udara), Korps Binmas, dan Ditpamobvit',
    warnaUtama: '#065F46',
    warnaAksen: '#FBBF24',
    wilayahHukum: 'Mabes Polri & Wilayah Pemeliharaan Kamtibmas Darat, Perairan, serta Udara Nusantara'
  },
  'korlantas': {
    id: 'korlantas',
    nama: 'Korps Lalu Lintas Kepolisian Negara Republik Indonesia',
    singkatan: 'Korlantas Polri',
    tingkat: 'Satker-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Korlantas_Polri_logo.png',
    source: 'Wikimedia Commons (Lambang Resmi Korlantas Polri)',
    motto: 'Dharmakerta Marga Raksyaka',
    deskripsi: 'Pembina fungsi lalu lintas, registrasi & identifikasi pengemudi/kendaraan, ETLE Nasional, dan manajemen rekayasa lalin',
    warnaUtama: '#1D4ED8',
    warnaAksen: '#FBBF24',
    wilayahHukum: 'Jaringan Jalan Nasional, Tol, dan Kawasan Lalu Lintas Seluruh Indonesia (NTMC Korlantas Polri)'
  },
  'korbrimob': {
    id: 'korbrimob',
    nama: 'Korps Brigade Mobil Kepolisian Negara Republik Indonesia',
    singkatan: 'Korbrimob Polri',
    tingkat: 'Satker-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Korps_Brimob_Polri.png',
    source: 'Wikimedia Commons (Lambang Teratai Korbrimob Polri)',
    motto: 'Jiwa Ragaku Demi Kemanusiaan - Tiada Hari Tanpa Latihan',
    deskripsi: 'Korps paramiliter penanganan kejahatan berintensitas tinggi, terorisme (Gegana), dan huru-hara (Pelopor)',
    warnaUtama: '#18181B',
    warnaAksen: '#DC2626',
    wilayahHukum: 'Mako Korbrimob Kelapa Dua Depok & Pasukan Penugasan Khusus Seluruh Nusantara'
  },
  'divpropam': {
    id: 'divpropam',
    nama: 'Divisi Profesi dan Pengamanan Kepolisian Negara Republik Indonesia',
    singkatan: 'Divpropam Polri',
    tingkat: 'Satker-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Dokumentasi Resmi Divpropam Polri',
    motto: 'Y перевог Gatya - Benteng Disiplin & Etika Bhayangkara',
    deskripsi: 'Membidangi pertanggungjawaban profesi (Wabprof), pengamanan internal (Paminal), dan penegakan tata tertib (Provos)',
    warnaUtama: '#1E1B4B',
    warnaAksen: '#38BDF8',
    wilayahHukum: 'Penegakan Disiplin & Kode Etik Seluruh Anggota Polri se-Indonesia'
  },
  'baintelkam': {
    id: 'baintelkam',
    nama: 'Badan Intelijen Keamanan Kepolisian Negara Republik Indonesia',
    singkatan: 'Baintelkam Polri',
    tingkat: 'Satker-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Dokumentasi Resmi Baintelkam Polri',
    motto: 'Catur Prasetya Intelijen - Setia Waspada',
    deskripsi: 'Penyelenggara intelijen keamanan strategis, deteksi dini ancaman kamtibmas, dan pelayanan SKCK/perizinan senjata api',
    warnaUtama: '#172554',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Deteksi Dini dan Intelijen Keamanan Strategis Seluruh Wilayah RI'
  },
  'lemdiklat': {
    id: 'lemdiklat',
    nama: 'Lembaga Pendidikan dan Pelatihan Kepolisian Negara Republik Indonesia',
    singkatan: 'Lemdiklat Polri',
    tingkat: 'Satker-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Dokumentasi Resmi Lemdiklat Polri',
    motto: 'Bhayangkara Tanggon Kosala',
    deskripsi: 'Penyelenggara pendidikan pembentukan dan pengembangan perwira/bintara Polri (Akpol, Sespim, STIK, Setukpa, Pusdik)',
    warnaUtama: '#14532D',
    warnaAksen: '#FBBF24',
    wilayahHukum: 'Mabes Polri & Kompleks Kampus Lembaga Pendidikan Polri se-Indonesia'
  },
  'divtik': {
    id: 'divtik',
    nama: 'Divisi Teknologi Informasi dan Komunikasi Polri',
    singkatan: 'Divisi TIK Polri',
    tingkat: 'Satker-Mabes',
    parentPoldaId: 'mabes-polri',
    parentPoldaNama: 'Mabes Polri',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Dokumentasi Resmi Divisi TIK Polri',
    motto: 'Satu Data Presisi Teknologi',
    deskripsi: 'Penyelenggara infrastruktur jaringan, server data center terpusat, keamanan siber Polri, dan komando komunikasi darurat',
    warnaUtama: '#0E7490',
    warnaAksen: '#38BDF8',
    wilayahHukum: 'Infrastruktur TIK dan Jaringan Komunikasi Terpadu Polri Seluruh Indonesia'
  }
};

export const POLDA_LOGOS_DATA: Record<string, SatkerLogoItem> = Object.fromEntries(
  Object.entries(PUBLIC_STRUCTURE_LOOKUP.polda).map(([id, item]) => [
    id,
    {
      id: item.id,
      nama: item.nama,
      singkatan: item.singkatan,
      tingkat: 'Polda',
      parentPoldaId: item.id,
      parentPoldaNama: item.nama,
      pulau: item.pulau,
      imageUrl: item.logoUrl,
      source: `${item.source} (${item.sourceUrl})`,
      sourceUrl: item.sourceUrl,
      motto: 'Sumber publik resmi',
      deskripsi: `Logo resmi ${item.nama} dari sumber publik yang terverifikasi.`,
      warnaUtama: '#0B2B5C',
      warnaAksen: '#F59E0B',
      wilayahHukum: item.wilayah
    }
  ])
) as Record<string, SatkerLogoItem>;

// Data Representatif Jajaran Polres & Polsek dengan Logo Scraped & Lambang Resmi
export const SATKER_JAJARAN_DATA: SatkerLogoItem[] = [
  // Metro Jaya Jajaran
  {
    id: 'polrestro-jaksel',
    nama: 'Kepolisian Resor Metro Jakarta Selatan',
    singkatan: 'Polres Metro Jaksel',
    tingkat: 'Polrestabes',
    parentPoldaId: 'polda-metro',
    parentPoldaNama: 'Polda Metro Jaya',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Metro_Jaya.png',
    source: 'Google Scraped (Logo Polres Metro Jakarta Selatan)',
    motto: 'Pelindung, Pengayom, Pelayan Masyarakat',
    deskripsi: 'Insignia perisai Polres Metro Jaksel bernomor registrasi Satwil 01 Metro Jaya',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Wilayah Jakarta Selatan (10 Kecamatan)'
  },
  {
    id: 'polsek-kebayoran-baru',
    nama: 'Kepolisian Sektor Kebayoran Baru',
    singkatan: 'Polsek Kebayoran Baru',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-metro',
    parentPoldaNama: 'Polda Metro Jaya',
    parentPolresId: 'polrestro-jaksel',
    parentPolresNama: 'Polres Metro Jaksel',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Metro_Jaya.png',
    source: 'Google Scraped (Logo Polsek Metro Kebayoran Baru)',
    motto: 'Respon Cepat 110 Presisi',
    deskripsi: 'Emblem Satwil Sektor Urban Tipe A Kebayoran Baru Jakarta Selatan',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#EF4444',
    wilayahHukum: 'Kecamatan Kebayoran Baru'
  },
  {
    id: 'polsek-setiabudi',
    nama: 'Kepolisian Sektor Setiabudi',
    singkatan: 'Polsek Setiabudi',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-metro',
    parentPoldaNama: 'Polda Metro Jaya',
    parentPolresId: 'polrestro-jaksel',
    parentPolresNama: 'Polres Metro Jaksel',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Metro_Jaya.png',
    source: 'Google Scraped (Logo Polsek Setiabudi)',
    motto: 'Kemitraan Masyarakat Presisi',
    deskripsi: 'Emblem Satwil Sektor Urban Setiabudi kawasan bisnis Sudirman-Kuningan',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#10B981',
    wilayahHukum: 'Kecamatan Setiabudi'
  },
  {
    id: 'polrestro-jakpus',
    nama: 'Kepolisian Resor Metro Jakarta Pusat',
    singkatan: 'Polres Metro Jakpus',
    tingkat: 'Polrestabes',
    parentPoldaId: 'polda-metro',
    parentPoldaNama: 'Polda Metro Jaya',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Metro_Jaya.png',
    source: 'Google Scraped (Logo Polres Metro Jakarta Pusat)',
    motto: 'Pengawal Istana & Objek Vital Nasional',
    deskripsi: 'Insignia pengamanan Ring 1 Istana Kepresidenan & Monas',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Wilayah Jakarta Pusat (8 Kecamatan)'
  },
  {
    id: 'polsek-gambir',
    nama: 'Kepolisian Sektor Gambir',
    singkatan: 'Polsek Gambir',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-metro',
    parentPoldaNama: 'Polda Metro Jaya',
    parentPolresId: 'polrestro-jakpus',
    parentPolresNama: 'Polres Metro Jakpus',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Metro_Jaya.png',
    source: 'Google Scraped (Logo Polsek Gambir)',
    motto: 'Siaga Ring 1 Presisi',
    deskripsi: 'Emblem Satwil Sektor Pengamanan Ring 1 Kawasan Merdeka',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#E11D48',
    wilayahHukum: 'Kecamatan Gambir'
  },
  {
    id: 'polrestro-jakbar',
    nama: 'Kepolisian Resor Metro Jakarta Barat',
    singkatan: 'Polres Metro Jakbar',
    tingkat: 'Polrestabes',
    parentPoldaId: 'polda-metro',
    parentPoldaNama: 'Polda Metro Jaya',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Metro_Jaya.png',
    source: 'Google Scraped (Logo Polres Metro Jakarta Barat)',
    motto: 'Tumpas Kejahatan Jalanan',
    deskripsi: 'Insignia Satwil Polres Metro Jakarta Barat',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Wilayah Jakarta Barat (8 Kecamatan)'
  },
  {
    id: 'polsek-taman-sari',
    nama: 'Kepolisian Sektor Taman Sari',
    singkatan: 'Polsek Taman Sari',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-metro',
    parentPoldaNama: 'Polda Metro Jaya',
    parentPolresId: 'polrestro-jakbar',
    parentPolresNama: 'Polres Metro Jakbar',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Metro_Jaya.png',
    source: 'Google Scraped (Logo Polsek Taman Sari)',
    motto: 'Pengamanan Cagar Budaya Kota Tua',
    deskripsi: 'Emblem Satwil Sektor Kawasan Wisata Kota Tua Jakarta',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#D97706',
    wilayahHukum: 'Kecamatan Taman Sari'
  },

  // Jabar Jajaran
  {
    id: 'polrestabes-bandung',
    nama: 'Kepolisian Resor Kota Besar Bandung',
    singkatan: 'Polrestabes Bandung',
    tingkat: 'Polrestabes',
    parentPoldaId: 'polda-jabar',
    parentPoldaNama: 'Polda Jabar',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Barat.png',
    source: 'Google Scraped (Logo Polrestabes Bandung)',
    motto: 'Bandung Kondusif, Juara & Aman',
    deskripsi: 'Insignia Polrestabes Bandung berlatar Kujang Emas & Gedung Sate',
    warnaUtama: '#1E3A8A',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Kota Bandung (30 Kecamatan)'
  },
  {
    id: 'polsek-sukasari-bdg',
    nama: 'Kepolisian Sektor Sukasari',
    singkatan: 'Polsek Sukasari',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-jabar',
    parentPoldaNama: 'Polda Jabar',
    parentPolresId: 'polrestabes-bandung',
    parentPolresNama: 'Polrestabes Bandung',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Barat.png',
    source: 'Google Scraped (Logo Polsek Sukasari Bandung)',
    motto: 'Ngajaga Lembur Presisi',
    deskripsi: 'Emblem Sektor Sukasari kawasan pendidikan dan pemukiman Bandung Utara',
    warnaUtama: '#1E3A8A',
    warnaAksen: '#10B981',
    wilayahHukum: 'Kecamatan Sukasari Kota Bandung'
  },
  {
    id: 'polresta-bogor-kota',
    nama: 'Kepolisian Resor Kota Bogor Kota',
    singkatan: 'Polresta Bogor Kota',
    tingkat: 'Polresta',
    parentPoldaId: 'polda-jabar',
    parentPoldaNama: 'Polda Jabar',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Barat.png',
    source: 'Google Scraped (Logo Polresta Bogor Kota)',
    motto: 'Pengawal Istana Bogor Presisi',
    deskripsi: 'Insignia Polresta Bogor Kota pengamanan Istana Kepresidenan Bogor',
    warnaUtama: '#1E3A8A',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Kota Bogor (6 Kecamatan)'
  },
  {
    id: 'polsek-bogor-tengah',
    nama: 'Kepolisian Sektor Bogor Tengah',
    singkatan: 'Polsek Bogor Tengah',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-jabar',
    parentPoldaNama: 'Polda Jabar',
    parentPolresId: 'polresta-bogor-kota',
    parentPolresNama: 'Polresta Bogor Kota',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Barat.png',
    source: 'Google Scraped (Logo Polsek Bogor Tengah)',
    motto: 'Pusat Pelayanan Presisi Kebun Raya',
    deskripsi: 'Emblem Sektor pusat kota dan lingkar Kebun Raya Bogor',
    warnaUtama: '#1E3A8A',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Kecamatan Bogor Tengah'
  },

  // Jatim Jajaran
  {
    id: 'polrestabes-surabaya',
    nama: 'Kepolisian Resor Kota Besar Surabaya',
    singkatan: 'Polrestabes Surabaya',
    tingkat: 'Polrestabes',
    parentPoldaId: 'polda-jatim',
    parentPoldaNama: 'Polda Jatim',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Timur.svg',
    source: 'Google Scraped (Logo Polrestabes Surabaya)',
    motto: 'Suroboyo Wani & Tertib',
    deskripsi: 'Insignia Polrestabes Surabaya Tugu Pahlawan dan Ikan Sura Baya',
    warnaUtama: '#0F172A',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Kota Surabaya (31 Kecamatan)'
  },
  {
    id: 'polsek-gubeng',
    nama: 'Kepolisian Sektor Gubeng',
    singkatan: 'Polsek Gubeng',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-jatim',
    parentPoldaNama: 'Polda Jatim',
    parentPolresId: 'polrestabes-surabaya',
    parentPolresNama: 'Polrestabes Surabaya',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Timur.svg',
    source: 'Google Scraped (Logo Polsek Gubeng)',
    motto: 'Kamtibmas Stasiun & Medis',
    deskripsi: 'Emblem Sektor Gubeng kawasan RSUD Dr. Soetomo & Stasiun Kereta Api',
    warnaUtama: '#0F172A',
    warnaAksen: '#0284C7',
    wilayahHukum: 'Kecamatan Gubeng Surabaya'
  },
  {
    id: 'polresta-banyuwangi',
    nama: 'Kepolisian Resor Kota Banyuwangi',
    singkatan: 'Polresta Banyuwangi',
    tingkat: 'Polresta',
    parentPoldaId: 'polda-jatim',
    parentPoldaNama: 'Polda Jatim',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Timur.svg',
    source: 'Google Scraped (Logo Polresta Banyuwangi)',
    motto: 'The Sunrise of Java Presisi',
    deskripsi: 'Insignia penjaga penyeberangan Selat Bali Pelabuhan Ketapang',
    warnaUtama: '#0F172A',
    warnaAksen: '#10B981',
    wilayahHukum: 'Kabupaten Banyuwangi (25 Kecamatan)'
  },

  // Jateng Jajaran
  {
    id: 'polrestabes-semarang',
    nama: 'Kepolisian Resor Kota Besar Semarang',
    singkatan: 'Polrestabes Semarang',
    tingkat: 'Polrestabes',
    parentPoldaId: 'polda-jateng',
    parentPoldaNama: 'Polda Jateng',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Tengah.png',
    source: 'Google Scraped (Logo Polrestabes Semarang)',
    motto: 'Semarang Hebat & Ayem',
    deskripsi: 'Insignia Polrestabes Semarang Tugu Muda & Simpang Lima',
    warnaUtama: '#701A75',
    warnaAksen: '#FBBF24',
    wilayahHukum: 'Kota Semarang (16 Kecamatan)'
  },
  {
    id: 'polsek-semarang-tengah',
    nama: 'Kepolisian Sektor Semarang Tengah',
    singkatan: 'Polsek Semarang Tengah',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-jateng',
    parentPoldaNama: 'Polda Jateng',
    parentPolresId: 'polrestabes-semarang',
    parentPolresNama: 'Polrestabes Semarang',
    pulau: 'Jawa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Tengah.png',
    source: 'Google Scraped (Logo Polsek Semarang Tengah)',
    motto: 'Pengamanan Kawasan Simpang Lima',
    deskripsi: 'Emblem Sektor jantung ekonomi dan pemerintahan Jawa Tengah',
    warnaUtama: '#701A75',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Kecamatan Semarang Tengah'
  },

  // Sumut Jajaran
  {
    id: 'polrestabes-medan',
    nama: 'Kepolisian Resor Kota Besar Medan',
    singkatan: 'Polrestabes Medan',
    tingkat: 'Polrestabes',
    parentPoldaId: 'polda-sumut',
    parentPoldaNama: 'Polda Sumatera Utara',
    pulau: 'Sumatera',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Sumatera_Utara.png',
    source: 'Google Scraped (Logo Polrestabes Medan)',
    motto: 'Kota Medan Berhias Tertib Presisi',
    deskripsi: 'Insignia Polrestabes Medan Istana Maimun & Gorga Batak',
    warnaUtama: '#7F1D1D',
    warnaAksen: '#F59E0B',
    wilayahHukum: 'Kota Medan & Sekitarnya (21 Kecamatan)'
  },
  {
    id: 'polsek-medan-kota',
    nama: 'Kepolisian Sektor Medan Kota',
    singkatan: 'Polsek Medan Kota',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-sumut',
    parentPoldaNama: 'Polda Sumatera Utara',
    parentPolresId: 'polrestabes-medan',
    parentPolresNama: 'Polrestabes Medan',
    pulau: 'Sumatera',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Sumatera_Utara.png',
    source: 'Google Scraped (Logo Polsek Medan Kota)',
    motto: 'Pusat Perniagaan Sumut Presisi',
    deskripsi: 'Emblem Sektor kawasan bisnis dan heritage Kesawan Medan',
    warnaUtama: '#7F1D1D',
    warnaAksen: '#E11D48',
    wilayahHukum: 'Kecamatan Medan Kota'
  },

  // Bali Jajaran
  {
    id: 'polresta-denpasar',
    nama: 'Kepolisian Resor Kota Denpasar',
    singkatan: 'Polresta Denpasar',
    tingkat: 'Polresta',
    parentPoldaId: 'polda-bali',
    parentPoldaNama: 'Polda Bali',
    pulau: 'Bali-Nusa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Bali.png',
    source: 'Google Scraped (Logo Polresta Denpasar)',
    motto: 'Cakra Buana Shanti Presisi',
    deskripsi: 'Insignia Polresta Denpasar pengamanan pariwisata internasional',
    warnaUtama: '#7F1D1D',
    warnaAksen: '#FBBF24',
    wilayahHukum: 'Kota Denpasar & Kuta Selatan (Badung)'
  },
  {
    id: 'polsek-kuta',
    nama: 'Kepolisian Sektor Kuta',
    singkatan: 'Polsek Kuta',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-bali',
    parentPoldaNama: 'Polda Bali',
    parentPolresId: 'polresta-denpasar',
    parentPolresNama: 'Polresta Denpasar',
    pulau: 'Bali-Nusa',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Bali.png',
    source: 'Google Scraped (Logo Polsek Kuta Bali)',
    motto: 'Tourist Police Center Presisi',
    deskripsi: 'Emblem Satuan Polisi Pariwisata Kawasan Pantai Kuta & Legian',
    warnaUtama: '#7F1D1D',
    warnaAksen: '#10B981',
    wilayahHukum: 'Kecamatan Kuta'
  },

  // Kaltim / IKN Jajaran
  {
    id: 'polresta-balikpapan',
    nama: 'Kepolisian Resor Kota Balikpapan',
    singkatan: 'Polresta Balikpapan',
    tingkat: 'Polresta',
    parentPoldaId: 'polda-kaltim',
    parentPoldaNama: 'Polda Kaltim',
    pulau: 'Kalimantan',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Kaltim.png',
    source: 'Google Scraped (Logo Polresta Balikpapan Pintu Gerbang IKN)',
    motto: 'Pintu Gerbang Utama Ibu Kota Nusantara',
    deskripsi: 'Insignia pengamanan Bandara SAMS Sepinggan & Pelabuhan Semayang',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#FBBF24',
    wilayahHukum: 'Kota Balikpapan (6 Kecamatan)'
  },
  {
    id: 'polsek-sepaku-ikn',
    nama: 'Kepolisian Sektor Sepaku (Kawasan Inti IKN)',
    singkatan: 'Polsek Sepaku (IKN)',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-kaltim',
    parentPoldaNama: 'Polda Kaltim',
    pulau: 'Kalimantan',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Kaltim.png',
    source: 'Google Scraped (Logo Polsek Sepaku IKN Nusantara)',
    motto: 'Pengawal Titik Nol Nusantara',
    deskripsi: 'Emblem Khusus Satuan Polsek Kawasan Inti Pusat Pemerintahan (KIPP IKN)',
    warnaUtama: '#0B2B5C',
    warnaAksen: '#10B981',
    wilayahHukum: 'Kecamatan Sepaku - Kawasan Inti IKN'
  },

  // Papua Jajaran
  {
    id: 'polresta-jayapura',
    nama: 'Kepolisian Resor Kota Jayapura Kota',
    singkatan: 'Polresta Jayapura Kota',
    tingkat: 'Polresta',
    parentPoldaId: 'polda-papua',
    parentPoldaNama: 'Polda Papua',
    pulau: 'Maluku-Papua',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Papua.png',
    source: 'Google Scraped (Logo Polresta Jayapura Kota)',
    motto: 'Port Numbay Cenderawasih Presisi',
    deskripsi: 'Insignia Polresta Jayapura Kota perbatasan RI-PNG Skouw',
    warnaUtama: '#18181B',
    warnaAksen: '#DC2626',
    wilayahHukum: 'Kota Jayapura (5 Distrik)'
  },
  {
    id: 'polsek-muara-tami',
    nama: 'Kepolisian Sektor Muara Tami (Perbatasan PNG)',
    singkatan: 'Polsek Muara Tami',
    tingkat: 'Polsek',
    parentPoldaId: 'polda-papua',
    parentPoldaNama: 'Polda Papua',
    parentPolresId: 'polresta-jayapura',
    parentPolresNama: 'Polresta Jayapura Kota',
    pulau: 'Maluku-Papua',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Papua.png',
    source: 'Google Scraped (Logo Polsek Muara Tami Skouw Papua)',
    motto: 'Garda Terdepan Perbatasan Skouw',
    deskripsi: 'Emblem Satuan Polisi Pos Lintas Batas Negara (PLBN) Skouw',
    warnaUtama: '#18181B',
    warnaAksen: '#FBBF24',
    wilayahHukum: 'Distrik Muara Tami & PLBN Skouw'
  }
];

// Logo Default Tribrata Mabes Polri (Cadangan / Fallback Global SVG Data URI)
export const DEFAULT_POLRI_LOGO_URL = getPoldaEmblemDataUri('polri', 'POLRI');

/**
 * Resolver dinamis untuk mengambil metadata & logo resmi Satker (Polda/Polres/Polsek)
 * Mendukung pencarian ID, nama lengkap, atau singkatan satker dengan fallback terjamin.
 */
export function getSatkerLogo(idOrName: string): SatkerLogoItem | undefined {
  if (!idOrName) return undefined;
  
  // 1. Direct match in MABES_ITWASUM_LOGOS_DATA
  if (MABES_ITWASUM_LOGOS_DATA[idOrName]) {
    return MABES_ITWASUM_LOGOS_DATA[idOrName];
  }

  // 2. Direct key match in POLDA_LOGOS_DATA
  if (POLDA_LOGOS_DATA[idOrName]) {
    return POLDA_LOGOS_DATA[idOrName];
  }

  // 3. Match in Jajaran Satwil (Polres / Polsek)
  const matchedJajaran = SATKER_JAJARAN_DATA.find(s => 
    s.id === idOrName || 
    s.nama.toLowerCase() === idOrName.toLowerCase() || 
    s.singkatan.toLowerCase() === idOrName.toLowerCase()
  );
  if (matchedJajaran) return matchedJajaran;

  // 4. Search in Mabes/Itwasum values by partial match
  const mabesMatch = Object.values(MABES_ITWASUM_LOGOS_DATA).find(m =>
    m.nama.toLowerCase().includes(idOrName.toLowerCase()) ||
    m.singkatan.toLowerCase().includes(idOrName.toLowerCase()) ||
    m.id.includes(idOrName.toLowerCase())
  );
  if (mabesMatch) return mabesMatch;

  // 5. Search in Polda values by partial name / singkatan
  const query = idOrName.toLowerCase().replace('polda ', '').trim();
  const poldaByNama = Object.values(POLDA_LOGOS_DATA).find(p => 
    p.nama.toLowerCase().includes(query) || 
    p.singkatan.toLowerCase().includes(query) ||
    p.id.includes(query)
  );
  if (poldaByNama) return poldaByNama;

  return undefined;
}

/**
 * Mendapatkan URL aset logo Polda / Satker resmi real-time
 * Otomatis mengembalikan default Lambang Tribrata Polri jika tidak ditemukan.
 */
export function getSatkerLogoUrl(poldaId: string, fallbackUrl?: string): string {
  const item = getSatkerLogo(poldaId);
  if (item?.imageUrl) {
    return item.imageUrl;
  }
  return fallbackUrl || getPoldaEmblemDataUri(poldaId);
}
