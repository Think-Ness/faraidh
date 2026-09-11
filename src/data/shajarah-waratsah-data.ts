// ============================================================
// DATA SHAJARATUL WARATSAH (شجرة الورثة) — Hal. 15 Kitab Faraidh KMI Gontor
// Struktur silsilah pohon ahli waris, porsi, hijab hirman, dalil & maklumat edukasi
// ============================================================

export type KategoriNode =
  | 'focal'
  | 'pasangan'
  | 'usul'
  | 'furu'
  | 'hawasyi_ikhwah'
  | 'hawasyi_amam'
  | 'wala'

export type GenderType = 'L' | 'P'

export interface SyaratPorsi {
  porsi: string // '1/2', '1/4', '1/8', '2/3', '1/3', '1/6', 'Ashabah', '1/3 Sisa'
  syarat: string
  penjelasan?: string
}

export interface WaritsNode {
  id: string
  kode: string
  emoji: string
  nama_arab: string
  nama_latin: string
  nama_id: string
  kategori: KategoriNode
  kategori_label: string
  badge_color: 'amber' | 'yellow' | 'blue' | 'indigo' | 'emerald' | 'purple' | 'rose' | 'slate' | 'sky' | 'teal'
  jenis_kelamin: GenderType
  tidak_pernah_gugur: boolean
  status_waris_utama: string
  porsi_ringkas: string[]
  daftar_porsi: string[]
  syarat_porsi: SyaratPorsi[]
  ashabah_info?: {
    jenis: 'bin_nafsih' | 'bil_ghair' | 'maal_ghair'
    label: string
    penjelasan: string
  }
  parents_label?: string
  spouse_label?: string
  dihijab_oleh: string[]
  menghijab_siapa: string[]
  dalil_arab: string
  dalil_arti: string
  dalil_sumber: string
  maklumat_edukasi: string
  // Posisi pada grid visual kanvas (x, y)
  canvas_pos: {
    x: number
    y: number
  }
}

export interface ConnectionEdge {
  id: string
  from: string
  to: string
  type: 'parent' | 'marriage' | 'child' | 'collateral'
  label?: string
}

// ─── DAFTAR SIMPUL LENGKAP (HALAMAN 15 KITAB FARAIDH) ─────────────
export const SHAJARAH_WARATSAH_NODES: WaritsNode[] = [
  // ─── LEVEL 1: KAKEK, NENEK & PAMAN (Y: 80) ───
  {
    id: 'nenek_ibu',
    kode: 'nenek_ibu',
    emoji: '👵',
    nama_arab: 'الجَدَّة الصَّحِيحَة (أُمّ الأُمّ)',
    nama_latin: 'Al-Jaddah ash-Shahihah',
    nama_id: 'Nenek (dari Ibu)',
    kategori: 'usul',
    kategori_label: 'Leluhur (Ummul Umm)',
    badge_color: 'purple',
    jenis_kelamin: 'P',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabul Furudh',
    porsi_ringkas: ['1/6'],
    daftar_porsi: ['1/6 (Fardh)'],
    parents_label: 'Leluhur Jalur Ibu',
    syarat_porsi: [
      {
        porsi: '1/6',
        syarat: 'Jika tidak ada Ibu kandung.',
        penjelasan: 'Jika bersama Nenek dari Ayah, mereka berdua berbagi rata 1/6.'
      }
    ],
    dihijab_oleh: ['ibu'],
    menghijab_siapa: [],
    dalil_arab: 'قَضَى رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ لِلْجَدَّةِ بِالسُّدُسِ إِذَا لَمْ يَكُنْ دُونَهَا أُمٌّ',
    dalil_arti: 'Rasulullah SAW menetapkan bagian bagi nenek sebesar 1/6 jika tidak ada ibu di bawahnya.',
    dalil_sumber: 'HR. Abu Dawud & An-Nasa\'i',
    maklumat_edukasi: 'Nenek dari Ibu hanya terhalang oleh Ibu kandung. Tidak terhalang oleh Ayah.',
    canvas_pos: { x: 60, y: 60 }
  },
  {
    id: 'nenek_ayah',
    kode: 'nenek_ayah',
    emoji: '👵',
    nama_arab: 'الجَدَّة (أُمّ الأَب)',
    nama_latin: 'Al-Jaddah (Ummul Ab)',
    nama_id: 'Nenek (dari Ayah)',
    kategori: 'usul',
    kategori_label: 'Leluhur (Ummul Ab)',
    badge_color: 'purple',
    jenis_kelamin: 'P',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabul Furudh',
    porsi_ringkas: ['1/6'],
    daftar_porsi: ['1/6 (Fardh)'],
    parents_label: 'Leluhur Jalur Ayah',
    syarat_porsi: [
      {
        porsi: '1/6',
        syarat: 'Jika tidak ada Ibu kandung dan tidak ada Ayah.',
        penjelasan: 'Mendapat 1/6 sendiri atau dibagi berdua bersama nenek dari ibu.'
      }
    ],
    dihijab_oleh: ['ibu', 'ayah'],
    menghijab_siapa: [],
    dalil_arab: 'أَنَّ الصِّدِّيقَ رَضِيَ اللَّهُ عَنْهُ أَعْطَى الْجَدَّةَ السُّدُسَ مَعَ عَدَمِ الْأُمِّ',
    dalil_arti: 'Abu Bakar Ash-Shiddiq ra memberikan kepada nenek 1/6 ketika tidak ada ibu.',
    dalil_sumber: 'Atsar Sahabat / Kitab Faraidh KMI',
    maklumat_edukasi: 'Nenek dari Ayah memiliki 2 pihak penghalang: terhalang oleh IBU dan terhalang oleh AYAH.',
    canvas_pos: { x: 380, y: 60 }
  },
  {
    id: 'kakek',
    kode: 'kakek',
    emoji: '👴',
    nama_arab: 'الجَدّ الصَّحِيح (أَب الأَب)',
    nama_latin: 'Al-Jadd ash-Shahih',
    nama_id: 'Kakek Shahih (Ayah dari Ayah)',
    kategori: 'usul',
    kategori_label: 'Leluhur (Abul Ab)',
    badge_color: 'blue',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Pengganti Posisi Ayah',
    porsi_ringkas: ['1/6', 'Ashabah', '1/6 + Ashabah'],
    daftar_porsi: ['1/6 (Fardh)', 'Ashabah (Sisa)', '1/6 + Sisa'],
    parents_label: 'Leluhur Jalur Ayah',
    syarat_porsi: [
      {
        porsi: '1/6',
        syarat: 'Jika tidak ada ayah dan ada anak/cucu laki-laki.',
        penjelasan: 'Sama seperti kondisi ayah.'
      },
      {
        porsi: 'Ashabah',
        syarat: 'Jika tidak ada ayah dan tidak ada keturunan.',
        penjelasan: 'Mengambil seluruh sisa harta.'
      },
      {
        porsi: '1/6 + Ashabah',
        syarat: 'Jika tidak ada ayah dan hanya ada anak/cucu perempuan.',
        penjelasan: '1/6 fardh + sisa ashabah.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Menggantikan kedudukan ayah saat ayah tidak ada.'
    },
    dihijab_oleh: ['ayah'],
    menghijab_siapa: ['keponakan_lk_kandung', 'keponakan_lk_seayah', 'paman_kandung', 'paman_seayah', 'sepupu_lk_paman_kandung', 'sepupu_lk_paman_seayah', 'saudara_lk_seibu', 'saudari_seibu'],
    dalil_arab: 'أَنَّ النَّبِيَّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ أَعْطَى الْجَدَّ السُّدُسَ',
    dalil_arti: 'Sesungguhnya Nabi SAW memberikan kepada kakek seperenam harta warisan.',
    dalil_sumber: 'HR. Abu Dawud & Tirmidzi',
    maklumat_edukasi: 'Kakek Shahih adalah kakek yang nasabnya tidak diselingi wanita. Terhalang total jika ada Ayah.',
    canvas_pos: { x: 680, y: 60 }
  },
  {
    id: 'paman_kandung',
    kode: 'paman_kandung',
    emoji: '🧔',
    nama_arab: 'العَمّ الشَّقِيق',
    nama_latin: 'Al-\'Amm ash-Syaqiq',
    nama_id: 'Paman Sekandung (Saudara Ayah)',
    kategori: 'hawasyi_amam',
    kategori_label: 'Paman (Hawasyi)',
    badge_color: 'emerald',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 9)',
    porsi_ringkas: ['Ashabah (Sisa)'],
    daftar_porsi: ['Ashabah (Sisa)'],
    parents_label: 'Kakek & Nenek Ayah',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada keturunan laki-laki, ayah, kakek, saudara laki-laki, dan keponakan.',
        penjelasan: 'Mengambil seluruh sisa harta.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Urutan prioritas 9.'
    },
    dihijab_oleh: ['anak_lk', 'cucu_lk', 'ayah', 'kakek', 'saudara_lk_kandung', 'saudara_lk_seayah', 'keponakan_lk_kandung', 'keponakan_lk_seayah', 'saudari_kandung (Ashabah Ma\'al Ghair)'],
    menghijab_siapa: ['paman_seayah', 'sepupu_lk_paman_kandung', 'sepupu_lk_paman_seayah'],
    dalil_arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    dalil_arti: 'Berikanlah bagian-bagian warisan kepada yang berhak, dan apa yang tersisa adalah untuk laki-laki yang paling dekat nasabnya.',
    dalil_sumber: 'HR. Bukhari & Muslim',
    maklumat_edukasi: 'Paman sekandung adalah saudara kandung dari ayah. Lebih kuat dari paman seayah.',
    canvas_pos: { x: 2160, y: 300 }
  },
  {
    id: 'paman_seayah',
    kode: 'paman_seayah',
    emoji: '🧔',
    nama_arab: 'العَمّ لِأَب',
    nama_latin: 'Al-\'Amm li Ab',
    nama_id: 'Paman Seayah (Saudara Ayah)',
    kategori: 'hawasyi_amam',
    kategori_label: 'Paman (Hawasyi)',
    badge_color: 'emerald',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 10)',
    porsi_ringkas: ['Ashabah (Sisa)'],
    daftar_porsi: ['Ashabah (Sisa)'],
    parents_label: 'Kakek Shahih',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada paman sekandung dan ahli waris tingkat atasnya.',
        penjelasan: 'Mengambil sisa harta.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Urutan 10.'
    },
    dihijab_oleh: ['anak_lk', 'cucu_lk', 'ayah', 'kakek', 'saudara_lk_kandung', 'saudara_lk_seayah', 'keponakan_lk_kandung', 'keponakan_lk_seayah', 'paman_kandung', 'saudari_kandung (Ashabah Ma\'al Ghair)'],
    menghijab_siapa: ['sepupu_lk_paman_kandung', 'sepupu_lk_paman_seayah'],
    dalil_arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    dalil_arti: 'HR. Bukhari & Muslim',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Gugur jika ada paman sekandung.',
    canvas_pos: { x: 2440, y: 300 }
  },

  // ─── LEVEL 2: ORANG TUA, SEPUPU & SAUDARA SEAYAH (Y: 300) ───
  {
    id: 'ibu',
    kode: 'ibu',
    emoji: '🧕',
    nama_arab: 'الأُمّ',
    nama_latin: 'Al-Umm',
    nama_id: 'Ibu Kandung',
    kategori: 'usul',
    kategori_label: 'Ibu Kandung',
    badge_color: 'blue',
    jenis_kelamin: 'P',
    tidak_pernah_gugur: true,
    status_waris_utama: 'Ashabul Furudh Utama',
    porsi_ringkas: ['1/3', '1/6', '1/3 Sisa'],
    daftar_porsi: ['1/3 (Fardh)', '1/6 (Fardh)', '1/3 Sisa (Gharrawain)'],
    parents_label: 'Nenek dari Ibu',
    syarat_porsi: [
      {
        porsi: '1/3',
        syarat: 'Tidak ada anak/cucu dan tidak ada 2+ saudara/i.',
        penjelasan: 'QS. An-Nisa\': 11'
      },
      {
        porsi: '1/6',
        syarat: 'Ada anak/cucu ATAU ada 2 orang atau lebih saudara/i.',
        penjelasan: 'QS. An-Nisa\': 11'
      },
      {
        porsi: '1/3 Sisa',
        syarat: 'Kasus Gharrawain (bersama Suami/Istri dan Ayah saja).',
        penjelasan: 'Ibu mengambil 1/3 sisa setelah bagian pasangan.'
      }
    ],
    dihijab_oleh: [],
    menghijab_siapa: ['nenek_ibu', 'nenek_ayah'],
    dalil_arab: 'فَإِنْ لَمْ يَكُنْ لَهُ وَلَدٌ وَوَرِثَهُ أَبَوَاهُ فَلِأُمِّهِ الثُّلُثُ فَإِنْ كَانَ لَهُ إِخْوَةٌ فَلِأُمِّهِ السُّدُسُ',
    dalil_arti: 'Jika dia tidak mempunyai anak dan dia diwarisi oleh kedua orang tuanya, maka ibunya mendapat sepertiga. Jika dia mempunyai saudara-saudara, ibunya mendapat seperenam.',
    dalil_sumber: 'QS. An-Nisa\': 11',
    maklumat_edukasi: 'Ibu tidak pernah gugur. Keberadaan ibu menghalangi SEMUA nenek shahih.',
    canvas_pos: { x: 230, y: 300 }
  },
  {
    id: 'ayah',
    kode: 'ayah',
    emoji: '👨',
    nama_arab: 'الأَب',
    nama_latin: 'Al-Ab',
    nama_id: 'Ayah Kandung',
    kategori: 'usul',
    kategori_label: 'Ayah Kandung',
    badge_color: 'blue',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: true,
    status_waris_utama: 'Furudh & Ashabah',
    porsi_ringkas: ['1/6', 'Ashabah', '1/6 + Ashabah'],
    daftar_porsi: ['1/6 (Fardh)', 'Ashabah (Sisa)', '1/6 + Sisa'],
    parents_label: 'Kakek & Nenek Ayah',
    syarat_porsi: [
      {
        porsi: '1/6',
        syarat: 'Ada anak laki-laki atau cucu laki-laki.',
        penjelasan: 'Mendapat fardh murni 1/6.'
      },
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada anak/cucu sama sekali.',
        penjelasan: 'Mengambil seluruh sisa harta.'
      },
      {
        porsi: '1/6 + Ashabah',
        syarat: 'Ada anak/cucu perempuan dan TIDAK ada anak/cucu laki-laki.',
        penjelasan: '1/6 fardh + sisa ashabah.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Jihat Ubuwwah.'
    },
    dihijab_oleh: [],
    menghijab_siapa: ['kakek', 'nenek_ayah', 'saudara_lk_kandung', 'saudari_kandung', 'saudara_lk_seayah', 'saudari_seayah', 'saudara_lk_seibu', 'saudari_seibu', 'keponakan_lk_kandung', 'keponakan_lk_seayah', 'paman_kandung', 'paman_seayah', 'sepupu_lk_paman_kandung', 'sepupu_lk_paman_seayah'],
    dalil_arab: 'وَلِأَبَوَيْهِ لِكُلِّ وَاحِدٍ مِنْهُمَا السُّدُسُ مِمَّا تَرَكَ إِنْ كَانَ لَهُ وَلَدٌ',
    dalil_arti: 'Dan untuk kedua orang tua, masing-masing mendapat seperenam dari harta peninggalan jika dia (yang meninggal) mempunyai anak.',
    dalil_sumber: 'QS. An-Nisa\': 11',
    maklumat_edukasi: 'Ayah adalah penghalang jalur usul terkuat. Menggugurkan kakek, nenek jalur ayah, seluruh saudara, paman, dan keponakan.',
    canvas_pos: { x: 530, y: 300 }
  },
  {
    id: 'sepupu_lk_paman_kandung',
    kode: 'sepupu_lk_paman_kandung',
    emoji: '🧑',
    nama_arab: 'ابْن العَمّ الشَّقِيق',
    nama_latin: 'Ibnul \'Amm ash-Syaqiq',
    nama_id: 'Anak Laki Paman Sekandung',
    kategori: 'hawasyi_amam',
    kategori_label: 'Sepupu (Hawasyi)',
    badge_color: 'emerald',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 11)',
    porsi_ringkas: ['Ashabah (Sisa)'],
    daftar_porsi: ['Ashabah (Sisa)'],
    parents_label: 'Paman Sekandung',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada paman seayah dan semua ahli waris yang lebih tinggi prioritasnya.',
        penjelasan: 'Mengambil sisa harta.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Urutan 11.'
    },
    dihijab_oleh: ['paman_seayah', 'paman_kandung', 'ayah', 'kakek', 'anak_lk', 'cucu_lk', 'saudara_lk_kandung', 'saudara_lk_seayah', 'keponakan_lk_kandung', 'keponakan_lk_seayah'],
    menghijab_siapa: ['sepupu_lk_paman_seayah'],
    dalil_arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    dalil_arti: 'HR. Bukhari',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Hanya anak laki-laki paman yang mewarisi. Sepupu perempuan termasuk Dzawil Arham.',
    canvas_pos: { x: 2160, y: 580 }
  },
  {
    id: 'sepupu_lk_paman_seayah',
    kode: 'sepupu_lk_paman_seayah',
    emoji: '🧑',
    nama_arab: 'ابْن العَمّ لِأَب',
    nama_latin: 'Ibnul \'Amm li Ab',
    nama_id: 'Anak Laki Paman Seayah',
    kategori: 'hawasyi_amam',
    kategori_label: 'Sepupu (Hawasyi)',
    badge_color: 'emerald',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 12)',
    porsi_ringkas: ['Ashabah (Sisa)'],
    daftar_porsi: ['Ashabah (Sisa)'],
    parents_label: 'Paman Seayah',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada sepupu laki paman sekandung dan ahli waris di atasnya.',
        penjelasan: 'Urutan ashabah nasab terakhir.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Urutan 12: Ahli waris nasab paling akhir.'
    },
    dihijab_oleh: ['sepupu_lk_paman_kandung', 'paman_seayah', 'paman_kandung', 'ayah', 'kakek', 'anak_lk', 'cucu_lk', 'saudara_lk_kandung', 'saudara_lk_seayah', 'keponakan_lk_kandung', 'keponakan_lk_seayah'],
    menghijab_siapa: [],
    dalil_arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    dalil_arti: 'HR. Bukhari',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Merupakan urutan ashabah nasab nomor 12 di Kitab Faraidh KMI Gontor.',
    canvas_pos: { x: 2440, y: 580 }
  },
  {
    id: 'saudara_lk_seayah',
    kode: 'saudara_lk_seayah',
    emoji: '🧑',
    nama_arab: 'الأَخ لِأَب',
    nama_latin: 'Al-Akh li Ab',
    nama_id: 'Saudara Laki Seayah',
    kategori: 'hawasyi_ikhwah',
    kategori_label: 'Saudara Seayah',
    badge_color: 'indigo',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 6)',
    porsi_ringkas: ['Ashabah (Sisa)'],
    daftar_porsi: ['Ashabah (Sisa)'],
    parents_label: 'Ayah Kandung',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada anak/cucu laki-laki, ayah, dan saudara kandung.',
        penjelasan: 'Mengambil sisa harta.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Urutan 6.'
    },
    dihijab_oleh: ['anak_lk', 'cucu_lk', 'ayah', 'saudara_lk_kandung', 'saudari_kandung (Ashabah Ma\'al Ghair)'],
    menghijab_siapa: ['keponakan_lk_kandung', 'keponakan_lk_seayah', 'paman_kandung', 'paman_seayah'],
    dalil_arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    dalil_arti: 'HR. Bukhari & Muslim',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Saudara seayah terhijab oleh saudara sekandung.',
    canvas_pos: { x: 1600, y: 580 }
  },
  {
    id: 'saudari_seayah',
    kode: 'saudari_seayah',
    emoji: '👩',
    nama_arab: 'الأُخْت لِأَب',
    nama_latin: 'Al-Ukht li Ab',
    nama_id: 'Saudari Perempuan Seayah',
    kategori: 'hawasyi_ikhwah',
    kategori_label: 'Saudari Seayah',
    badge_color: 'indigo',
    jenis_kelamin: 'P',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Furudh / Pelengkap 2/3',
    porsi_ringkas: ['1/2', '2/3', '1/6 (Pelengkap 2/3)', 'Ashabah'],
    daftar_porsi: ['1/2 (Tunggal)', '2/3 (2+ Orang)', '1/6 (Pelengkap 2/3)', 'Ashabah Bil/Ma\'al'],
    parents_label: 'Ayah Kandung',
    syarat_porsi: [
      {
        porsi: '1/2',
        syarat: '1 orang tanpa saudari kandung, saudara seayah, anak/cucu, ayah.',
        penjelasan: 'QS. An-Nisa\': 176'
      },
      {
        porsi: '2/3',
        syarat: '2 orang atau lebih tanpa saudari kandung, saudara seayah, anak/cucu, ayah.',
        penjelasan: 'QS. An-Nisa\': 176'
      },
      {
        porsi: '1/6',
        syarat: 'Bersama 1 saudari kandung (pelengkap 2/3).',
        penjelasan: 'Hadits Nabi SAW.'
      }
    ],
    dihijab_oleh: ['anak_lk', 'cucu_lk', 'ayah', 'saudara_lk_kandung', '2+ saudari kandung', 'saudari_kandung (Ashabah Ma\'al Ghair)'],
    menghijab_siapa: ['keponakan_lk_kandung', 'paman_kandung'],
    dalil_arab: 'قَضَى النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ لِأُخْتِ الْأَبِ بِالسُّدُسِ تَكْمِلَةَ الثُّلُثَيْنِ',
    dalil_arti: 'Nabi SAW menetapkan untuk saudari seayah bagian 1/6 sebagai penyempurna dua pertiga.',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Gugur jika ada 2 saudari kandung, kecuali jika ditarik oleh saudara seayah.',
    canvas_pos: { x: 1880, y: 580 }
  },

  // ─── LEVEL 3: PEWARIS, PASANGAN, SAUDARA KANDUNG & SAUDARA SEIBU (Y: 540) ───
  {
    id: 'saudara_seibu',
    kode: 'saudara_lk_seibu',
    emoji: '👥',
    nama_arab: 'الإِخْوَة لِأُمّ',
    nama_latin: 'Al-Ikhwah li Umm',
    nama_id: 'Saudara / Saudari Seibu',
    kategori: 'hawasyi_ikhwah',
    kategori_label: 'Saudara Seibu',
    badge_color: 'indigo',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabul Furudh (Bagi Rata 1:1)',
    porsi_ringkas: ['1/6 (Tunggal)', '1/3 (Jamak Berserikat)'],
    daftar_porsi: ['1/6 (Tunggal)', '1/3 (Rata 1:1)'],
    parents_label: 'Ibu Kandung',
    syarat_porsi: [
      {
        porsi: '1/6',
        syarat: '1 orang tunggal dalam keadaan kalalah (tanpa usul laki & furu\').',
        penjelasan: 'QS. An-Nisa\': 12'
      },
      {
        porsi: '1/3',
        syarat: '2 orang atau lebih (laki-laki dan perempuan berbagi RATA 1:1).',
        penjelasan: 'QS. An-Nisa\': 12 — Syuraka\' fit-Tsuluts.'
      }
    ],
    dihijab_oleh: ['anak_lk', 'anak_pr', 'cucu_lk', 'cucu_pr', 'ayah', 'kakek'],
    menghijab_siapa: [],
    dalil_arab: 'وَإِنْ كَانَ رَجُلٌ يُورَثُ كَلَالَةً أَوِ امْرَأَةٌ وَلَهُ أَخٌ أَوْ أُخْتٌ فَلِكُلِّ وَاحِدٍ مِنْهُمَا السُّدُسُ فَإِنْ كَانُوا أَكْثَرَ مِنْ ذَلِكَ فَهُمْ شُرَكَاءُ فِي الثُّلُثِ',
    dalil_arti: 'Jika seseorang meninggal dalam keadaan kalalah dan mempunyai saudara/i seibu, maka bagian masing-masing adalah 1/6. Jika lebih dari seorang, mereka bersama-sama dalam bagian 1/3.',
    dalil_sumber: 'QS. An-Nisa\': 12',
    maklumat_edukasi: 'Satu-satunya ahli waris di mana laki-laki dan perempuan mendapat porsi sama persis tanpa kelipatan 2:1.',
    canvas_pos: { x: 60, y: 580 }
  },
  {
    id: 'mayyit',
    kode: 'mayyit',
    emoji: '👤',
    nama_arab: 'المَيِّت',
    nama_latin: 'Al-Mayyit',
    nama_id: 'Pewaris (Jenazah)',
    kategori: 'focal',
    kategori_label: 'Tokoh Utama (POV)',
    badge_color: 'amber',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: true,
    status_waris_utama: 'Pusat Silsilah (Muwarrits)',
    porsi_ringkas: ['Pemilik Tirkah'],
    daftar_porsi: ['Pemilik Harta Bersih'],
    parents_label: 'Ayah & Ibu Kandung',
    spouse_label: 'Pasangan Sahih',
    syarat_porsi: [
      {
        porsi: 'Tirkah',
        syarat: 'Meninggal dunia secara hakiki atau hukum (putusan hakim).',
        penjelasan: 'Harta bersih dibagikan setelah dikurangi tajhiz, hutang, dan wasiat.'
      }
    ],
    dihijab_oleh: [],
    menghijab_siapa: [],
    dalil_arab: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ',
    dalil_arti: 'Allah mensyariatkan bagimu tentang (pembagian warisan untuk) anak-anakmu: bagian seorang anak laki-laki sama dengan bagian dua anak perempuan.',
    dalil_sumber: 'QS. An-Nisa\': 11',
    maklumat_edukasi: 'Pewaris adalah titik pusat penentuan hubungan nasab semua ahli waris.',
    canvas_pos: { x: 380, y: 580 }
  },
  {
    id: 'pasangan',
    kode: 'istri',
    emoji: '👰',
    nama_arab: 'الزَّوْجَة / الزَّوْج',
    nama_latin: 'Az-Zaujah / Az-Zauj',
    nama_id: 'Pasangan (Istri / Suami)',
    kategori: 'pasangan',
    kategori_label: 'Istri / Pasangan',
    badge_color: 'yellow',
    jenis_kelamin: 'P',
    tidak_pernah_gugur: true,
    status_waris_utama: 'Ashabul Furudh Sababiyah',
    porsi_ringkas: ['1/4', '1/8 (Istri)', '1/2', '1/4 (Suami)'],
    daftar_porsi: ['1/4 (Tanpa Anak)', '1/8 (Ada Anak)'],
    spouse_label: 'Al-Mayyit (Pewaris)',
    syarat_porsi: [
      {
        porsi: '1/4 (Istri)',
        syarat: 'Jika pewaris TIDAK memiliki keturunan (anak / cucu).',
        penjelasan: 'QS. An-Nisa\': 12'
      },
      {
        porsi: '1/8 (Istri)',
        syarat: 'Jika pewaris MEMILIKI keturunan (anak / cucu).',
        penjelasan: 'QS. An-Nisa\': 12'
      },
      {
        porsi: '1/2 (Suami)',
        syarat: 'Jika istri meninggal tanpa keturunan.',
        penjelasan: 'QS. An-Nisa\': 12'
      },
      {
        porsi: '1/4 (Suami)',
        syarat: 'Jika istri meninggal dan memiliki keturunan.',
        penjelasan: 'QS. An-Nisa\': 12'
      }
    ],
    dihijab_oleh: [],
    menghijab_siapa: [],
    dalil_arab: 'وَلَهُنَّ الرُّبُعُ مِمَّا تَرَكْتُمْ إِنْ لَمْ يَكُنْ لَكُمْ وَلَدٌ فَإِنْ كَانَ لَكُمْ وَلَدٌ فَلَهُنَّ الثُّمُنُ',
    dalil_arti: 'Para istri memperoleh seperempat harta jika kamu tidak mempunyai anak. Jika kamu mempunyai anak, maka para istri memperoleh seperdelapan.',
    dalil_sumber: 'QS. An-Nisa\': 12',
    maklumat_edukasi: 'Pasangan terikat melalui nikah sahih. Termasuk 6 golongan yang TIDAK PERNAH gugur.',
    canvas_pos: { x: 680, y: 580 }
  },
  {
    id: 'saudara_lk_kandung',
    kode: 'saudara_lk_kandung',
    emoji: '🧑',
    nama_arab: 'الأَخ الشَّقِيق',
    nama_latin: 'Al-Akh ash-Syaqiq',
    nama_id: 'Saudara Laki Sekandung',
    kategori: 'hawasyi_ikhwah',
    kategori_label: 'Saudara Kandung',
    badge_color: 'sky',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 5)',
    porsi_ringkas: ['Ashabah (Sisa)', 'Menarik Saudari (2:1)'],
    daftar_porsi: ['Ashabah (Sisa)', 'Menarik Saudari (2:1)'],
    parents_label: 'Ayah & Ibu Kandung',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada anak laki-laki, cucu laki-laki, dan ayah.',
        penjelasan: 'Mengambil seluruh sisa harta.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih (Prioritas 5)',
      penjelasan: 'Kekuatan nasab seayah & seibu.'
    },
    dihijab_oleh: ['anak_lk', 'cucu_lk', 'ayah'],
    menghijab_siapa: ['saudara_lk_seayah', 'saudari_seayah', 'keponakan_lk_kandung', 'keponakan_lk_seayah', 'paman_kandung', 'paman_seayah', 'sepupu_lk_paman_kandung', 'sepupu_lk_paman_seayah'],
    dalil_arab: 'وَهُوَ يَرِثُهَا إِنْ لَمْ يَكُنْ لَهَا وَلَدٌ',
    dalil_arti: 'Dan dia (saudara laki-laki) mewarisi seluruh harta saudara perempuannya jika dia tidak mempunyai anak.',
    dalil_sumber: 'QS. An-Nisa\': 176',
    maklumat_edukasi: 'Saudara sekandung menghalangi seluruh saudara seayah dan paman.',
    canvas_pos: { x: 1040, y: 580 }
  },
  {
    id: 'saudari_kandung',
    kode: 'saudari_kandung',
    emoji: '👩',
    nama_arab: 'الأُخْت الشَّقِيقَة',
    nama_latin: 'Al-Ukht ash-Syaqiqah',
    nama_id: 'Saudari Perempuan Sekandung',
    kategori: 'hawasyi_ikhwah',
    kategori_label: 'Saudari Kandung',
    badge_color: 'sky',
    jenis_kelamin: 'P',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Furudh / Ashabah Bil/Ma\'al Ghair',
    porsi_ringkas: ['1/2', '2/3', 'Ashabah Bil-Ghair', 'Ashabah Ma\'al-Ghair'],
    daftar_porsi: ['1/2 (Tunggal)', '2/3 (2+ Orang)', 'Ashabah Bil/Ma\'al'],
    parents_label: 'Ayah & Ibu Kandung',
    syarat_porsi: [
      {
        porsi: '1/2',
        syarat: '1 orang tunggal, tidak ada anak/cucu, ayah, kakek, dan saudara sekandung.',
        penjelasan: 'QS. An-Nisa\': 176'
      },
      {
        porsi: '2/3',
        syarat: '2 orang atau lebih tanpa anak/cucu, ayah, kakek, dan saudara sekandung.',
        penjelasan: 'QS. An-Nisa\': 176'
      },
      {
        porsi: 'Ashabah Bil-Ghair',
        syarat: 'Bersama saudara laki-laki sekandung (2:1).',
        penjelasan: 'QS. An-Nisa\': 176'
      },
      {
        porsi: 'Ashabah Ma\'al-Ghair',
        syarat: 'Bersama anak perempuan atau cucu perempuan.',
        penjelasan: 'Kaidah: "Jadikanlah para saudari bersama anak perempuan sebagai ashabah".'
      }
    ],
    dihijab_oleh: ['anak_lk', 'cucu_lk', 'ayah'],
    menghijab_siapa: ['saudari_seayah (saat 2+ atau saat jadi ashabah ma\'al ghair)', 'saudara_lk_seayah (saat ashabah ma\'al ghair)', 'keponakan_lk_kandung', 'paman_kandung'],
    dalil_arab: 'إِنِ امْرُؤٌ هَلَكَ لَيْسَ لَهُ وَلَدٌ وَلَهُ أُخْتٌ فَلَهَا نِصْفُ مَا تَرَكَ',
    dalil_arti: 'Jika seseorang meninggal dunia tanpa anak tetapi mempunyai seorang saudara perempuan, maka bagiannya adalah seperdua harta.',
    dalil_sumber: 'QS. An-Nisa\': 176',
    maklumat_edukasi: 'Saudari kandung bersama anak perempuan berubah menjadi Ashabah Ma\'al Ghair dan menghalangi saudara seayah & paman.',
    canvas_pos: { x: 1320, y: 580 }
  },

  // ─── LEVEL 4: FURU' 1 & KEPONAKAN KANDUNG (Y: 780) ───
  {
    id: 'anak_lk',
    kode: 'anak_lk',
    emoji: '👦',
    nama_arab: 'الاِبْن',
    nama_latin: 'Al-Ibn',
    nama_id: 'Anak Laki-laki Kandung',
    kategori: 'furu',
    kategori_label: 'Anak ke-1 (Laki-laki)',
    badge_color: 'emerald',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: true,
    status_waris_utama: 'Ashabah Bin-Nafsih Terkuat (No. 1)',
    porsi_ringkas: ['Ashabah Murni (Sisa)', 'Menarik Anak Pr (2:1)'],
    daftar_porsi: ['Ashabah No. 1 (Sisa)', 'Menarik Anak Pr (2:1)'],
    parents_label: 'Al-Mayyit & Pasangan',
    syarat_porsi: [
      {
        porsi: 'Ashabah Bin-Nafsih',
        syarat: 'Sendiri / jamak tanpa anak perempuan.',
        penjelasan: 'Mengambil seluruh sisa harta.'
      },
      {
        porsi: 'Ashabah Bil-Ghair',
        syarat: 'Bersama anak perempuan (rasio 2:1).',
        penjelasan: 'QS. An-Nisa\': 11'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih No. 1',
      penjelasan: 'Ashabah terkuat dalam Islam.'
    },
    dihijab_oleh: [],
    menghijab_siapa: ['cucu_lk', 'cucu_pr', 'saudara_lk_kandung', 'saudari_kandung', 'saudara_lk_seayah', 'saudari_seayah', 'saudara_lk_seibu', 'saudari_seibu', 'keponakan_lk_kandung', 'keponakan_lk_seayah', 'paman_kandung', 'paman_seayah', 'sepupu_lk_paman_kandung', 'sepupu_lk_paman_seayah'],
    dalil_arab: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنْثَيَيْنِ',
    dalil_arti: 'Allah mensyariatkan bagimu tentang pembagian warisan anak-anakmu: bagian seorang anak laki-laki sama dengan dua anak perempuan.',
    dalil_sumber: 'QS. An-Nisa\': 11',
    maklumat_edukasi: 'Anak laki-laki tidak pernah gugur. Menghalangi cucu, seluruh saudara, paman, dan keponakan.',
    canvas_pos: { x: 380, y: 840 }
  },
  {
    id: 'anak_pr',
    kode: 'anak_pr',
    emoji: '👧',
    nama_arab: 'البِنْت',
    nama_latin: 'Al-Bint',
    nama_id: 'Anak Perempuan Kandung',
    kategori: 'furu',
    kategori_label: 'Anak ke-2 (Perempuan)',
    badge_color: 'emerald',
    jenis_kelamin: 'P',
    tidak_pernah_gugur: true,
    status_waris_utama: 'Ashabul Furudh / Ashabah Bil-Ghair',
    porsi_ringkas: ['1/2 (Tunggal)', '2/3 (2+ Orang)', 'Ashabah Bil-Ghair'],
    daftar_porsi: ['1/2 (Tunggal)', '2/3 (2+ Orang)', 'Ashabah (Bil-Ghair 2:1)'],
    parents_label: 'Al-Mayyit & Pasangan',
    syarat_porsi: [
      {
        porsi: '1/2',
        syarat: '1 orang tunggal dan TIDAK ada anak laki-laki.',
        penjelasan: 'QS. An-Nisa\': 11'
      },
      {
        porsi: '2/3',
        syarat: '2 orang atau lebih dan TIDAK ada anak laki-laki.',
        penjelasan: 'QS. An-Nisa\': 11'
      },
      {
        porsi: 'Ashabah Bil-Ghair',
        syarat: 'Ada anak laki-laki (rasio 2:1).',
        penjelasan: 'QS. An-Nisa\': 11'
      }
    ],
    dihijab_oleh: [],
    menghijab_siapa: ['saudara_lk_seibu', 'saudari_seibu', 'cucu_pr (jika 2+ anak perempuan tanpa cucu laki-laki)'],
    dalil_arab: 'فَإِنْ كُنَّ نِسَاءً فَوْقَ اثْنَتَيْنِ فَلَهُنَّ ثُلُثَا مَا تَرَكَ وَإِنْ كَانَتْ وَاحِدَةً فَلَهَا النِّصْفُ',
    dalil_arti: 'Jika anak itu semuanya perempuan lebih dari dua, bagi mereka 2/3 harta; jika seorang saja, ia memperoleh separuh harta.',
    dalil_sumber: 'QS. An-Nisa\': 11',
    maklumat_edukasi: 'Anak perempuan tidak pernah gugur.',
    canvas_pos: { x: 680, y: 840 }
  },
  {
    id: 'keponakan_lk_kandung',
    kode: 'keponakan_lk_kandung',
    emoji: '👦',
    nama_arab: 'ابْن الأَخ الشَّقِيق',
    nama_latin: 'Ibnul Akh ash-Syaqiq',
    nama_id: 'Anak Laki Saudara Kandung',
    kategori: 'hawasyi_ikhwah',
    kategori_label: 'Keponakan Kandung',
    badge_color: 'teal',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 7)',
    porsi_ringkas: ['Ashabah (Sisa)'],
    daftar_porsi: ['Ashabah (Sisa)'],
    parents_label: 'Saudara Laki Sekandung',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada saudara seayah dan ahli waris di atasnya.',
        penjelasan: 'Mengambil sisa harta.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Urutan 7.'
    },
    dihijab_oleh: ['anak_lk', 'cucu_lk', 'ayah', 'kakek', 'saudara_lk_kandung', 'saudara_lk_seayah', 'saudari_kandung (Ashabah Ma\'al Ghair)'],
    menghijab_siapa: ['keponakan_lk_seayah', 'paman_kandung', 'paman_seayah', 'sepupu_lk_paman_kandung', 'sepupu_lk_paman_seayah'],
    dalil_arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    dalil_arti: 'HR. Bukhari',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Hanya anak laki-laki dari saudara laki-laki yang menjadi ahli waris.',
    canvas_pos: { x: 1040, y: 840 }
  },

  // ─── LEVEL 5: FURU' 2 & KEPONAKAN SEAYAH (Y: 1020) ───
  {
    id: 'cucu_lk',
    kode: 'cucu_lk',
    emoji: '🧒',
    nama_arab: 'ابْن الاِبْن',
    nama_latin: 'Ibnul Ibn',
    nama_id: 'Cucu Laki-laki',
    kategori: 'furu',
    kategori_label: 'Cucu (dari Anak Laki-laki)',
    badge_color: 'sky',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 2)',
    porsi_ringkas: ['Ashabah (Sisa)', 'Menarik Cucu Pr (2:1)'],
    daftar_porsi: ['Ashabah (Sisa)', 'Menarik Cucu Pr (2:1)'],
    parents_label: 'Anak Laki-laki Kandung',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada anak laki-laki kandung.',
        penjelasan: 'Menggantikan kedudukan anak laki-laki.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Urutan 2.'
    },
    dihijab_oleh: ['anak_lk'],
    menghijab_siapa: ['saudara_lk_kandung', 'saudari_kandung', 'saudara_lk_seayah', 'saudari_seayah', 'saudara_lk_seibu', 'saudari_seibu', 'keponakan_lk_kandung', 'paman_kandung'],
    dalil_arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهُوَ لِأَوْلَى رَجُلٍ ذَكَرٍ',
    dalil_arti: 'HR. Bukhari',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Dinamakan "Al-Qarib al-Mubarak" bagi cucu perempuan ketika terancam gugur oleh 2 anak perempuan.',
    canvas_pos: { x: 240, y: 1100 }
  },
  {
    id: 'cucu_pr',
    kode: 'cucu_pr',
    emoji: '👧',
    nama_arab: 'بِنْت الاِبْن',
    nama_latin: 'Bintul Ibn',
    nama_id: 'Cucu Perempuan',
    kategori: 'furu',
    kategori_label: 'Cucu (dari Anak Laki-laki)',
    badge_color: 'sky',
    jenis_kelamin: 'P',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Furudh / Pelengkap 2/3 / Ashabah',
    porsi_ringkas: ['1/2', '2/3', '1/6 (Pelengkap 2/3)', 'Ashabah'],
    daftar_porsi: ['1/2 (Tunggal)', '2/3 (2+ Orang)', '1/6 (Pelengkap 2/3)', 'Ashabah (2:1)'],
    parents_label: 'Anak Laki-laki Kandung',
    syarat_porsi: [
      {
        porsi: '1/2',
        syarat: '1 orang tanpa anak laki-laki, anak perempuan, dan cucu laki-laki.',
        penjelasan: 'QS. An-Nisa\': 11'
      },
      {
        porsi: '2/3',
        syarat: '2 orang atau lebih tanpa anak laki/pr dan cucu laki-laki.',
        penjelasan: 'QS. An-Nisa\': 11'
      },
      {
        porsi: '1/6',
        syarat: 'Bersama 1 anak perempuan tunggal (pelengkap 2/3).',
        penjelasan: 'HR. Bukhari'
      },
      {
        porsi: 'Ashabah Bil-Ghair',
        syarat: 'Bersama cucu laki-laki (rasio 2:1).',
        penjelasan: 'HR. Bukhari'
      }
    ],
    dihijab_oleh: ['anak_lk', 'cucu_lk (lebih dekat)', '2+ anak perempuan (kecuali ada cucu laki-laki penolong)'],
    menghijab_siapa: ['saudara_lk_seibu', 'saudari_seibu'],
    dalil_arab: 'قَضَى النَّبِيُّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ لِلابْنَةِ النِّصْفَ، وَلابْنَةِ الابْنِ السُّدُسَ تَكْمِلَةَ الثُّلُثَيْنِ',
    dalil_arti: 'Nabi SAW menetapkan bagi anak perempuan separuh, dan bagi cucu perempuan seperenam sebagai penyempurna dua pertiga.',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Hanya cucu dari anak laki-laki yang menjadi ahli waris.',
    canvas_pos: { x: 520, y: 1100 }
  },
  {
    id: 'keponakan_lk_seayah',
    kode: 'keponakan_lk_seayah',
    emoji: '👦',
    nama_arab: 'ابْن الأَخ لِأَب',
    nama_latin: 'Ibnul Akh li Ab',
    nama_id: 'Anak Laki Saudara Seayah',
    kategori: 'hawasyi_ikhwah',
    kategori_label: 'Keponakan Seayah',
    badge_color: 'teal',
    jenis_kelamin: 'L',
    tidak_pernah_gugur: false,
    status_waris_utama: 'Ashabah Bin-Nafsih (Prioritas 8)',
    porsi_ringkas: ['Ashabah (Sisa)'],
    daftar_porsi: ['Ashabah (Sisa)'],
    parents_label: 'Saudara Laki Seayah',
    syarat_porsi: [
      {
        porsi: 'Ashabah',
        syarat: 'Tidak ada keponakan sekandung dan ahli waris tingkat atasnya.',
        penjelasan: 'Urutan 8 ashabah bin-nafsih.'
      }
    ],
    ashabah_info: {
      jenis: 'bin_nafsih',
      label: 'Ashabah Bin-Nafsih',
      penjelasan: 'Urutan 8.'
    },
    dihijab_oleh: ['keponakan_lk_kandung', 'saudara_lk_seayah', 'saudara_lk_kandung', 'ayah', 'kakek', 'anak_lk', 'cucu_lk'],
    menghijab_siapa: ['paman_kandung', 'paman_seayah', 'sepupu_lk_paman_kandung', 'sepupu_lk_paman_seayah'],
    dalil_arab: 'أَلْحِقُوا الْفَرَائِضَ بِأَهْلِهَا فَمَا بَقِيَ فَهو لِأَوْلَى رَجُلٍ ذَكَرٍ',
    dalil_arti: 'HR. Bukhari',
    dalil_sumber: 'HR. Bukhari',
    maklumat_edukasi: 'Gugur jika ada keponakan laki-laki sekandung.',
    canvas_pos: { x: 1600, y: 840 }
  }
]

// ─── RELASI GARIS KONEKTOR CANVAS (ORTHOGONAL EDGES) ───────────────
export interface MarriageUnion {
  id: string
  spouse1: string
  spouse2: string
  children: string[]
  label?: string
}

export const SHAJARAH_UNIONS: MarriageUnion[] = [
  {
    id: 'union_kakek_nenek_ayah',
    spouse1: 'nenek_ayah',
    spouse2: 'kakek',
    children: ['ayah', 'paman_kandung'],
    label: 'Pernikahan Kakek & Nenek Ayah'
  },
  {
    id: 'union_ayah_ibu',
    spouse1: 'ibu',
    spouse2: 'ayah',
    children: ['mayyit', 'saudara_lk_kandung', 'saudari_kandung'],
    label: 'Pernikahan Ayah & Ibu Kandung'
  },
  {
    id: 'union_mayyit_pasangan',
    spouse1: 'mayyit',
    spouse2: 'pasangan',
    children: ['anak_lk', 'anak_pr'],
    label: 'Pernikahan Sahih (Sabab Mewarisi)'
  }
]

// ─── RELASI GARIS KONEKTOR CANVAS (ORTHOGONAL EDGES) ───────────────
export const SHAJARAH_CONNECTIONS: ConnectionEdge[] = [
  // 1. Pernikahan (Marriage Bridges)
  { id: 'edge_nenek_ayah_kakek', from: 'nenek_ayah', to: 'kakek', type: 'marriage', label: 'Pernikahan Kakek-Nenek' },
  { id: 'edge_ibu_ayah', from: 'ibu', to: 'ayah', type: 'marriage', label: 'Pernikahan Orang Tua' },
  { id: 'edge_mayyit_pasangan', from: 'mayyit', to: 'pasangan', type: 'marriage', label: 'Akad Nikah Pewaris' },

  // 2. Jalur Ibu Kandung
  { id: 'edge_nenek_ibu_ibu', from: 'nenek_ibu', to: 'ibu', type: 'child', label: 'Nasab Ibu' },
  { id: 'edge_ibu_saudara_seibu', from: 'ibu', to: 'saudara_seibu', type: 'child', label: 'Anak dari Ibu' },

  // 3. Jalur Ayah Sendiri (Saudara Seayah)
  { id: 'edge_ayah_saudara_seayah', from: 'ayah', to: 'saudara_lk_seayah', type: 'collateral', label: 'Saudara Seayah' },
  { id: 'edge_ayah_saudari_seayah', from: 'ayah', to: 'saudari_seayah', type: 'collateral', label: 'Saudari Seayah' },

  // 4. Jalur Kakek Sendiri (Paman Seayah)
  { id: 'edge_kakek_paman_seayah', from: 'kakek', to: 'paman_seayah', type: 'collateral', label: 'Paman Seayah' },

  // 5. Keturunan Anak Lk (Cucu)
  { id: 'edge_anak_lk_cucu_lk', from: 'anak_lk', to: 'cucu_lk', type: 'child', label: 'Cucu Laki-laki' },
  { id: 'edge_anak_lk_cucu_pr', from: 'anak_lk', to: 'cucu_pr', type: 'child', label: 'Cucu Perempuan' },

  // 6. Keturunan Saudara Lk (Keponakan)
  { id: 'edge_saudara_keponakan_kandung', from: 'saudara_lk_kandung', to: 'keponakan_lk_kandung', type: 'child', label: 'Anak Saudara Kandung' },
  { id: 'edge_saudara_keponakan_seayah', from: 'saudara_lk_seayah', to: 'keponakan_lk_seayah', type: 'child', label: 'Anak Saudara Seayah' },

  // 7. Keturunan Paman (Sepupu)
  { id: 'edge_paman_sepupu_kandung', from: 'paman_kandung', to: 'sepupu_lk_paman_kandung', type: 'child', label: 'Anak Paman Kandung' },
  { id: 'edge_paman_sepupu_seayah', from: 'paman_seayah', to: 'sepupu_lk_paman_seayah', type: 'child', label: 'Anak Paman Seayah' }
]

// ─── 6 GOLONGAN YANG TIDAK PERNAH GUGUR ───────────────────────────
export const ENAM_GOLONGAN_ABADI = [
  'mayyit',
  'pasangan',
  'ayah',
  'ibu',
  'anak_lk',
  'anak_pr'
]
