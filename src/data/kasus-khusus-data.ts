// ============================================================
// ENSIKLOPEDIA KASUS KHUSUS FARAIDH (المسائل الملقبة الخاصة)
// Maklumat Sejarah, Asal-Usul, 'Illat Syar'i, Atsar Sahabat & Studi Santri
// Referensi: Kitab Faraidh KMI Gontor, Matan Rahabiyyah, Al-Fiqh Al-Islami wa Adillatuh
// ============================================================

export interface KasusKhususMaklumat {
  kode: string
  nama_latin: string
  nama_arab: string
  nama_populer: string[]
  ahli_waris_terlibat: string
  tokoh_sahabat: string
  asal_usul_sejarah: string
  illat_hukum: string
  kaidah_penyelesaian: string[]
  atsar_arab: string
  atsar_arti: string
  atsar_sumber: string
  hikmah_edukasi: string
  badge_color: 'amber' | 'purple' | 'indigo' | 'emerald' | 'blue' | 'rose'
}

export const ENSIKLOPEDIA_KASUS_KHUSUS: Record<string, KasusKhususMaklumat> = {
  gharrawain: {
    kode: 'gharrawain',
    nama_latin: 'Al-Gharrawain (Al-\'Umariyyatain)',
    nama_arab: 'المسألة الغَرَّاء / العُمَرِيَّتَان',
    nama_populer: [
      'Al-Gharrawain (الغروان - Dua Bintang Kejora yang Terang)',
      'Al-\'Umariyyatain (العمريتان - Dua Keputusan Khalifah Umar)',
      'Kasus Pasangan & Kedua Orang Tua'
    ],
    ahli_waris_terlibat: 'Suami/Istri + Ibu Kandung + Ayah Kandung (tanpa keturunan dan tanpa 2+ saudara).',
    tokoh_sahabat: 'Sayyidina Umar bin Khattab ra, disepakati oleh Utsman bin Affan, Ali bin Abi Thalib, Zaid bin Tsabit, dan Abdullah bin Mas\'ud ra.',
    asal_usul_sejarah:
      'Kasus ini pertama kali terjadi di masa kekhalifahan Umar bin Khattab ra. Jika Ibu diberikan 1/3 secara mutlak dari seluruh harta warisan berdasarkan zahir ayat QS. An-Nisa: 11, maka pada kasus bersama Suami: Suami mendapat 1/2 (3 saham dari AM 6), Ibu mendapat 1/3 (2 saham), dan Ayah sebagai Ashabah hanya tersisa 1 saham. Hal ini menyebabkan porsi Ibu menjadi dua kali lipat lebih banyak daripada porsi Ayah pada derajat kekerabatan yang setara, padahal prinsip dasar faraidh adalah bagian laki-laki berlipat dua dari perempuan.',
    illat_hukum:
      'Untuk menjaga kaidah "Li adz-dzakari mitslu hazhzhil untsayain" (bagian laki-laki dua kali lipat perempuan) di antara kedua orang tua pada generasi yang sama. Oleh karena itu, Ibu tidak mengambil 1/3 dari total tirkah, melainkan 1/3 dari SISA harta (Tsulutsul Baqi) setelah bagian pasangan (Suami/Istri) diselesaikan.',
    kaidah_penyelesaian: [
      '1. Selesaikan terlebih dahulu porsi pasangan (Suami 1/2 = 3 saham, atau Istri 1/4 = 1 saham).',
      '2. Ibu mengambil 1/3 dari Sisa Harta (Tsulutsul Baqi) = 1 saham.',
      '3. Ayah mengambil seluruh sisa setelah pasangan dan ibu = 2 saham (tepat 2 kali lipat porsi Ibu).',
      '4. Asal Masalah: Jika bersama Suami = AM 6; Jika bersama Istri = AM 4.'
    ],
    atsar_arab: 'قَضَى عُمَرُ وَعُثْمَانُ وَزَيْدُ بْنُ ثَابِتٍ رَضِيَ اللَّهُ عَنْهُمْ لِلأُمِّ بِثُلُثِ مَا بَقِيَ بَعْدَ فَرْضِ الزَّوْجِ أَوِ الزَّوْجَةِ',
    atsar_arti:
      'Umar, Utsman, dan Zaid bin Tsabit radhiyallahu \'anhum menetapkan bagi Ibu sepertiga dari sisa harta setelah dikeluarkan bagian suami atau istri.',
    atsar_sumber: 'HR. Al-Baihaqi & Ibnu Abi Syaibah / Fiqh Mawaris KMI Gontor Hal. 42',
    hikmah_edukasi:
      'Dinamakan Al-Gharrawain karena kemasyhuran dan kejelian ijtihad para sahabat yang bersinar terang laksana bintang kejora (Al-Ghurrah) di langit.',
    badge_color: 'amber'
  },

  musytarakah: {
    kode: 'musytarakah',
    nama_latin: 'Al-Musytarakah (Al-Himariyyah / Al-Hajariyyah)',
    nama_arab: 'المسألة المُشْتَرَكَة / الحِمَارِيَّة / الحَجَرِيَّة / اليَمِّيَّة',
    nama_populer: [
      'Al-Musytarakah (المشتركة - Saudara Kandung Diserikatkan)',
      'Al-Himariyyah (الحمارية - Argumen Keledai)',
      'Al-Hajariyyah (الحجرية - Argumen Batu Karang)',
      'Al-Yammiyyah (اليمية - Argumen Lautan)'
    ],
    ahli_waris_terlibat: 'Suami + Ibu/Nenek + 2+ Saudara/i Seibu + Saudara Laki-laki Sekandung (bersama/tanpa Saudari Kandung).',
    tokoh_sahabat: 'Umar bin Khattab ra & Zaid bin Tsabit ra.',
    asal_usul_sejarah:
      'Awalnya Khalifah Umar bin Khattab ra memfatwakan bahwa saudara sekandung tidak mendapatkan apa-apa karena mereka berstatus Ashabah dan seluruh 6 saham telah habis dibagi kepada Ashabul Furudh (Suami 1/2=3, Ibu 1/6=1, Saudara Seibu 1/3=2; total 6 saham habis). Salah seorang saudara sekandung lalu mengajukan diplomasi balaghah yang cerdas kepada Umar: "Wahai Amirul Mukminin, anggaplah ayah kami seekor keledai (Himar) atau batu yang dilempar ke laut, bukankah kami dan saudara seibu sama-sama dilahirkan dari rahim satu IBU yang sama?". Mendengar hujjah ini, Umar ra mengoreksi keputusannya dan menyatukan saudara kandung ke dalam porsi 1/3 saudara seibu.',
    illat_hukum:
      'Kekerabatan jalur Ayah pada saudara kandung tidak boleh menjadi penghalang atau bumerang yang justru menggugurkan hak mereka dari jalur Ibu, sementara saudara yang hanya seibu murni justru mendapat warisan. Keduanya berserikat dalam 1/3 dan dibagi RATA 1:1 tanpa kelipatan 2:1.',
    kaidah_penyelesaian: [
      '1. Asal Masalah pokok adalah 6: Suami = 3 saham (1/2), Ibu = 1 saham (1/6).',
      '2. Porsi 1/3 (2 saham) dibagikan bersama (diserikatkan) kepada Saudara Seibu dan Saudara Kandung.',
      '3. Seluruh saudara (kandung maupun seibu, laki-laki maupun perempuan) membagi porsi 1/3 tersebut sama rata (1:1 per jiwa).',
      '4. Dilakukan Tashih Masalah jika jumlah kepala tidak habis membagi 2 saham.'
    ],
    atsar_arab: 'هَبْ أَنَّ أَبَانَا كَانَ حِمَارًا أَوْ حَجَرًا مُلْقًى فِي الْيَمِّ، أَلَيْسَتْ أُمُّنَا وَاحِدَةً؟ فَشَرَّكَ عُمَرُ بَيْنَهُمْ فِي الثُّلُثِ',
    atsar_arti:
      'Anggaplah ayah kami seekor keledai atau batu yang dicampakkan ke laut, bukankah ibu kami satu? Maka Umar menyatukan mereka semua dalam sepertiga bagian.',
    atsar_sumber: 'Sunan Al-Baihaqi Al-Kubra (No. 12285) / Fiqh Mawaris KMI Gontor Hal. 44',
    hikmah_edukasi:
      'Menunjukkan keagungan prinsip keadilan Islam dan keterbukaan Khalifah Umar ra dalam menerima logika hukum yang lebih adil demi kemaslahatan umat.',
    badge_color: 'indigo'
  },

  akdariyyah: {
    kode: 'akdariyyah',
    nama_latin: 'Al-Akdariyyah (Al-Gharra\')',
    nama_arab: 'المسألة الأَكْدَرِيَّة / الغَرَّاء',
    nama_populer: [
      'Al-Akdariyyah (الأكدرية - Dinisbatkan ke Bani Akdar)',
      'Al-Mukaddarah (المكدرة - Kasus yang Mengeruhkan Kaidah Kakek)'
    ],
    ahli_waris_terlibat: 'Suami + Ibu + Kakek Shahih + 1 Saudari Perempuan Kandung/Seayah.',
    tokoh_sahabat: 'Zaid bin Tsabit ra (disepakati mayoritas ulama faraidh madzhab Syafi\'i).',
    asal_usul_sejarah:
      'Dinisbatkan kepada seorang penanya wanita dari kabilah Bani Akdar. Kasus ini dinamakan Al-Akdariyyah karena "mengeruhkan" (kaddarat) kaidah umum Zaid bin Tsabit: (1) Kakek biasanya tidak pernah membuat saudari mendapat fardh lalu ditarik ashabah lagi, dan (2) Saudari biasanya tidak pernah mendapat fardh bersama Kakek kecuali di kasus ini.',
    illat_hukum:
      'Jika Saudari digugurkan, ia terzalimi karena ada sisa fardh; jika diberi fardh penuh tanpa dikaitkan ke Kakek, Kakek akan dirugikan. Maka fardh Saudari (1/2 = 3) dan fardh Kakek (1/6 = 1) digabungkan (3+1=4), kemudian Asal Masalah 6 mengalami \'Aul menjadi 9, lalu ditashih dengan mengalikan 3 (3 x 9 = 27) agar 4 saham tadi bisa dibagi 2:1 antara Kakek (8 saham) dan Saudari (4 saham).',
    kaidah_penyelesaian: [
      '1. Porsi awal dari AM 6: Suami (1/2 = 3), Ibu (1/3 = 2), Kakek (1/6 = 1), Saudari (1/2 = 3).',
      '2. Total saham = 3 + 2 + 1 + 3 = 9. Terjadi \'Aul dari Asal Masalah 6 menjadi 9.',
      '3. Saham Kakek (1) dan Saudari (3) digabung menjadi 4 saham, lalu dibagi dengan perbandingan 2:1 (jumlah kepala = 3).',
      '4. Dilakukan Tashih: AM 9 × 3 = 27 saham.',
      '5. Pembagian akhir: Suami = 9 saham, Ibu = 6 saham, Kakek = 8 saham, Saudari = 4 saham.'
    ],
    atsar_arab: 'قَضَى زَيْدُ بْنُ ثَابِتٍ فِي زَوْجٍ وَأُمٍّ وَأُخْتٍ وَجَدٍّ: لِلزَّوْجِ النِّصْفُ، وَلِلأُمِّ الثُّلُثُ، وَلِلْجَدِّ السُّدُسُ، وَلِلأُخْتِ النِّصْفُ، ثُمَّ جَمَعَ سِهَامَ الْجَدِّ وَالأُخْتِ فَقَسَمَهَا بَيْنَهُمَا لِلذَّكَرِ مِثْلُ حَظِّ الأُنْثَيَيْنِ',
    atsar_arti:
      'Zaid bin Tsabit memutuskan untuk suami 1/2, ibu 1/3, kakek 1/6, dan saudari 1/2, lalu menggabungkan saham kakek dan saudari serta membaginya secara 2:1 untuk laki-laki dibanding perempuan.',
    atsar_sumber: 'Sunan Ad-Darimi & Al-Mughni Ibnu Qudamah / Kitab Faraidh KMI Hal. 46',
    hikmah_edukasi:
      'Satu-satunya kasus dalam bab Kakek Bersama Saudara di mana fardh saudari diberikan lalu ditarik kembali menjadi ashabah bil-ghair bersama kakek melalui tahapan Aul dan Tashih 27.',
    badge_color: 'purple'
  }
}

// Maklumat Khusus untuk Penyesuaian 'Aul dan Radd
export interface PenyesuaianMaklumat {
  jenis: 'aul' | 'radd'
  nama_latin: string
  nama_arab: string
  latar_belakang: string
  tokoh_pencetus: string
  kaidah_syari: string
  atsar_dalil: string
}

export const ENSIKLOPEDIA_PENYESUAIAN: Record<'aul' | 'radd', PenyesuaianMaklumat> = {
  aul: {
    jenis: 'aul',
    nama_latin: 'Al-\'Aul (العَوْل - Peningkatan Asal Masalah)',
    nama_arab: 'العَوْلُ فِي الفَرَائِض',
    latar_belakang:
      'Kasus \'Aul pertama kali muncul di zaman Khalifah Umar bin Khattab ra ketika seorang wanita wafat meninggalkan Suami (1/2 = 3) dan 2 Saudari Kandung (2/3 = 4). Total saham adalah 7 dari Asal Masalah 6. Jika Suami diberi 3 penuh, Saudari kurang; jika Saudari diberi 4 penuh, Suami kurang. Umar ra bermusyawarah dengan para sahabat, lalu Abbas bin Abdul Muthalib ra dan Zaid bin Tsabit ra mengusulkan metode \'Aul (seperti pembagian pailit dalam hutang).',
    tokoh_pencetus: 'Sayyidina Umar bin Khattab ra atas usulan Sayyidina Al-Abbas bin Abdul Muthalib ra & Zaid bin Tsabit ra.',
    kaidah_syari:
      'Setiap ahli waris Ashabul Furudh menanggung pengurangan porsi secara proporsional dan adil dengan menaikkan angka pembagi (Asal Masalah) sesuai jumlah total saham yang ada.',
    atsar_dalil:
      'أَوَّلُ مَنْ أَعَالَ الْفَرَائِضَ عُمَرُ بْنُ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ لَمَّا كَثُرَتِ الْفُرُوضُ وَتَزَاحَمَتْ (HR. Al-Hakim & Al-Baihaqi)'
  },

  radd: {
    jenis: 'radd',
    nama_latin: 'Ar-Radd (الرَّدّ - Pengembalian Sisa Harta)',
    nama_arab: 'الرَّدُّ عَلَى ذَوِي الفُرُوض',
    latar_belakang:
      'Ar-Radd adalah kebalikan dari \'Aul. Terjadi apabila harta warisan masih tersisa setelah dibagikan kepada seluruh Ashabul Furudh dan tidak ada ahli waris Ashabah nasab yang berhak mengambil sisa. Sahabat Ali bin Abi Thalib dan Abdullah bin Mas\'ud ra memfatwakan sisa tersebut dikembalikan kepada Ashabul Furudh bernasab sesuai rasio saham masing-masing.',
    tokoh_pencetus: 'Sayyidina Ali bin Abi Thalib ra & Abdullah bin Mas\'ud ra (Madzhab Jumhur Ulama).',
    kaidah_syari:
      'Sisa harta dikembalikan kepada seluruh Ashabul Furudh bernasab secara proporsional. Pasangan (Suami/Istri) tidak mendapatkan tambahan Radd menurut pendapat jumhur karena hubungan mereka adalah sababiyah pernikahan yang telah selesai.',
    atsar_dalil:
      'يُرَدُّ الْفَاضِلُ عَلَى ذَوِي السِّهَامِ بِقَدْرِ سِهَامِهِمْ إِلَّا الزَّوْجَيْنِ (Kaidah Fiqh Mawaris Jumhur Sahabat)'
  }
}
