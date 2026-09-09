# PRODUCT REQUIREMENTS DOCUMENT (PRD)
**Proyek:** Sistem Perhitungan Faraidh Berbasis Web (Berdasarkan Kurikulum Gontor)
**Dokumen Utama Untuk:** Handover ke Tim Pengembang (Antigravity)

---

## 1. RINGKASAN EKSEKUTIF
Aplikasi web ini dirancang untuk memecahkan kasus pembagian waris Islam (Faraidh) dengan tingkat akurasi tinggi, merujuk langsung pada kitab "علم الفرائض" (Ilmu Faraidh Kelas 3 KMI Gontor). 
**Tujuan Utama:** Bukan sekadar kalkulator instan yang hanya mengeluarkan nominal akhir, tetapi bertindak sebagai "Mesin Edukasi" yang mampu menjabarkan langkah demi langkah (Step-by-Step) penyelesaian kaidah faraidh (mulai dari pemotongan harta, hijab, penentuan furudh, pencarian asal masalah, 'aul/radd, hingga tashih).

### **Pesan Penting untuk Tim Pengembang (Developer):**
Aplikasi ini menggunakan arsitektur **Rules Engine (Mesin Aturan)**. Logika penentuan bagian warisan **TIDAK BOLEH** di-hardcode di dalam kodingan aplikasi. Aplikasi (Frontend/Backend) hanya bertugas membaca kaidah referensi berbentuk JSON dari Database (Supabase), mengeksekusi perhitungan matematikanya, dan merendernya. Ini bertujuan agar pengaturan kaidah (jika ada penyesuaian) dapat dilakukan sepenuhnya melalui halaman Dasbor Super Admin.

---

## 2. PANDUAN UI/UX & DESAIN STRUKTUR VISUAL
Desain harus mengacu pada profesionalitas, kejernihan informasi, dan kemudahan akses.
1. **Strictly Mobile-First:** Mayoritas pengguna akan mengakses melalui layar *smartphone*. Pastikan navigasi form input (ahli waris) mudah di-tap, dan tabel hasil perhitungan bisa di-scroll secara horizontal tanpa merusak layout.
2. **Anti "AI Slop" & Emoticon:** 
   - **DILARANG** menggunakan ilustrasi vektor hasil generate AI murahan yang tidak relevan.
   - **DILARANG** menggunakan Emoji (😀, 💰, dll) sebagai icon. Gunakan library icon SVG profesional dan minimalis (seperti Lucide, Heroicons, atau Phosphor Icons).
3. **Tipografi & Kontras:** Gunakan font Sans-Serif yang bersih (misal: Inter atau Roboto) dengan tipografi yang tegas untuk membedakan antara Judul Langkah, Kaidah, dan Nominal Angka.
4. **Alur Bersih (Clean Flow):** Format wizard/multi-step sangat disarankan saat pengguna memasukkan data Tirkah (Harta) dan mencentang Ahli Waris.

---

## 3. TUMPUKAN TEKNOLOGI (TECH STACK)
* **Framework:** Next.js (App Router) - Untuk mengakomodasi rendering logika yang berat di sisi server (SSR/Server Actions).
* **Database & Auth:** Supabase (PostgreSQL) - Menggunakan fitur JSON/JSONB query dan Row Level Security (RLS) untuk memproteksi halaman Super Admin.
* **Styling:** Tailwind CSS - Untuk eksekusi UI yang presisi dan responsif.
* **Deployment:** Vercel - Standar industri untuk Next.js.

---

## 4. ALUR PENGGUNA (USER FLOW) & FITUR

### A. View Publik (Front-End)
1. **Halaman Muqaddimah:**
   - Menampilkan teks penjelasan/edukasi tentang ilmu Faraidh (statis, ditarik dari DB/CMS).
2. **Step 1: Input Tirkah (Harta Peninggalan):**
   - Input Harta Kotor.
   - Input Pengurang (Tajhiz/Biaya Jenazah, Hutang Terikat/Zakat/Gadai, Hutang Bebas, Wasiat).
   - *Validasi:* Wasiat tidak boleh > 1/3 dari (Harta Kotor - Tajhiz - Hutang).
   - Otomatis menghitung **Harta Bersih (yang diwariskan)**.
3. **Step 2: Input Ahli Waris:**
   - Checkbox 25 ahli waris (Kategori Laki-laki & Perempuan).
   - Input jumlah/kuantitas untuk ahli waris yang bisa > 1 orang (istri, anak, saudara).
   - **Status Halangan (Mawani' al-Irts):** Setiap ahli waris yang dipilih memiliki opsi dropdown halangan (Tidak Ada, Budak, Pembunuh, Beda Agama/Murtad). Jika ada halangan, visual dicoret dan di-bypass dari perhitungan utama.
4. **Step 3: Layar Eksekusi & Penjelasan (Hasil):**
   - **Log 1:** Menampilkan ahli waris yang terhalang total (Hijab Hirman) beserta alasannya.
   - **Log 2:** Menampilkan bagian pasti (Furudh) dan Ashabah (sisa) untuk yang berhak.
   - **Log 3:** Menjabarkan Ta'shil (pencarian Asal Masalah / KPK).
   - **Log 4:** Penjelasan jika terjadi 'Aul (saham membengkak) atau Radd (saham sisa kembali).
   - **Log 5:** Penjelasan Tashih (koreksi pecahan inkisâr dengan pendekatan Matematis: Tawafuq, Tabayun, dll).
   - **Final:** Tabel Nama, Siham (Saham Akhir), dan Nominal Uang/Aset per orang.

### B. View Super Admin (Back-Office)
1. **Autentikasi:** Login khusus pengelola (menggunakan Supabase Auth).
2. **Setup Ahli Waris:** CRUD data master 25 ahli waris.
3. **Setup Logika Aturan (Rules Engine JSON):**
   - UI untuk mengelola tabel aturan `furudh_rule`, `hijab_hirman_rule`, `ashabah_rule`.
   - Mengubah form input di web menjadi string JSON untuk di-simpan di Database.
4. **Setup Kasus Khusus:**
   - Menyimpan logika "Override" (Gharrawain, Musytarakah, Akdariyyah).

---

## 5. SKEMA DATABASE UTAMA (SQL / PostgreSQL)
Skema di bawah ini adalah fondasi penyimpanan logika dan pencatatan transaksi kasus.

```sql
-- 1. MASTER AHLI WARIS
CREATE TABLE ahli_waris (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(20) UNIQUE NOT NULL,
    nama_arab VARCHAR(100) NOT NULL,
    nama_id VARCHAR(100) NOT NULL,
    jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L','P')),
    kelompok VARCHAR(30) NOT NULL,
    tidak_pernah_gugur BOOLEAN DEFAULT FALSE,
    urutan_ashabah INT NULL,
    keterangan TEXT
);

-- 2. TABEL ATURAN (RULES ENGINE)
-- Diisi via Panel Admin untuk mendikte logika perhitungan
CREATE TABLE furudh_rule (
    id SERIAL PRIMARY KEY,
    ahli_waris_id INT REFERENCES ahli_waris(id),
    pecahan VARCHAR(5) NOT NULL, -- '1/2', '1/4', dll
    syarat_jumlah_min INT NULL,
    syarat_jumlah_max INT NULL,
    syarat_kondisi JSONB NOT NULL, -- Contoh: {"requires_absence_of":["anak_lk"]}
    keterangan TEXT
);

CREATE TABLE hijab_hirman_rule (
    id SERIAL PRIMARY KEY,
    penghalang_id INT REFERENCES ahli_waris(id),
    terhalang_id INT REFERENCES ahli_waris(id),
    keterangan TEXT
);

CREATE TABLE ashabah_rule (
    id SERIAL PRIMARY KEY,
    ahli_waris_id INT REFERENCES ahli_waris(id),
    jenis VARCHAR(20) NOT NULL, -- 'bin_nafsih', 'bil_ghair', 'maal_ghair'
    pasangan_penarik_id INT NULL REFERENCES ahli_waris(id),
    rasio VARCHAR(10) NULL,
    urutan_prioritas INT NULL,
    syarat_kondisi JSONB NULL
);

CREATE TABLE kasus_khusus (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(30) UNIQUE NOT NULL,
    nama VARCHAR(100) NOT NULL,
    pemicu_kondisi JSONB NOT NULL,
    aturan_khusus TEXT NOT NULL
);

-- 3. TABEL TRANSAKSI KASUS (Input User dari Web)
CREATE TABLE kasus (
    id SERIAL PRIMARY KEY,
    nama_pewaris VARCHAR(150),
    harta_kotor DECIMAL(18,2) NOT NULL,
    biaya_tajhiz DECIMAL(18,2) DEFAULT 0,
    hutang_terikat DECIMAL(18,2) DEFAULT 0,
    hutang_biasa DECIMAL(18,2) DEFAULT 0,
    wasiat DECIMAL(18,2) DEFAULT 0,
    total_harta_bersih DECIMAL(18,2) NOT NULL,
    dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kasus_ahli_waris (
    id SERIAL PRIMARY KEY,
    kasus_id INT REFERENCES kasus(id),
    ahli_waris_id INT REFERENCES ahli_waris(id),
    jumlah_orang INT DEFAULT 1,
    halangan_waris VARCHAR(20) DEFAULT 'tidak_ada' 
    -- value: 'tidak_ada', 'budak', 'pembunuh', 'beda_agama'
);
```

---

## 6. DATA MASTER & KASUS KHUSUS (SEED DATA)
Tim *Backend* wajib menginisiasi (seeding) database Supabase dengan data paten berikut:
1. **25 Ahli Waris Dasar:** 15 Laki-laki, 10 Perempuan (Merujuk pada tabel hasil analisis sebelumnya).
2. **Mawani' al-Irts:** Ahli waris berstatus 'budak', 'pembunuh', atau 'beda_agama' otomatis gugur haknya sebelum sistem mengeksekusi perhitungan.
3. **Kasus Khusus (Bypass Kaidah Normal):**
   - **Gharrawain:** Suami/Istri + Ibu + Ayah. (Ibu mendapat 1/3 dari SISA harta, bukan 1/3 harta total).
   - **Musytarakah:** Suami + Ibu + Saudara seibu (min 2) + Saudara kandung. (Saudara kandung bergabung membagi rata 1/3 porsi saudara seibu).
   - **Akdariyyah:** Suami + Ibu + Kakek + Saudari Kandung. (Suami 1/2, Ibu 1/3, Kakek 1/6, Saudari Kandung 1/2. Asal masalah di-'Aul ke 9. Porsi Kakek & Saudari kandung digabung lalu dibagi rasio 2:1).

---

## 7. ALGORITMA "MESIN HITUNG" (LOGIKA KODE BACKEND)
Tim *Backend/Fullstack* wajib menerapkan algoritma matematis berikut (disarankan menggunakan blok `switch` atau struktur Modular di dalam *Server Actions* Next.js).

### Langkah A: Ta'shil (Pencarian Asal Masalah / Penyebut Pokok / KPK)
Bagi pecahan ke dalam 2 kelompok:
* Kelompok 1 (K1): 1/2, 1/4, 1/8
* Kelompok 2 (K2): 2/3, 1/3, 1/6

**Logika Penentuan:**
```javascript
let asal_masalah = 0;
// Jika murni ashabah:
if (hanya_laki_laki) { asal_masalah = total_orang; }
else if (campuran) { asal_masalah = (jml_laki * 2) + (jml_perempuan * 1); }
// Jika ada ashabul furudh:
else if (ada_K1 && !ada_K2) { asal_masalah = penyebut_terbesar_di_K1; } // e.g. 4
else if (!ada_K1 && ada_K2) { asal_masalah = penyebut_terbesar_di_K2; } // e.g. 6
else if (ada_K1 && ada_K2) {
    if (k1_terbesar === '1/2') asal_masalah = 6;
    if (k1_terbesar === '1/4') asal_masalah = 12;
    if (k1_terbesar === '1/8') asal_masalah = 24;
}
```

### Langkah B: Evaluasi 'Aul dan Radd
* **'Aul:** Jika total pembilang (saham) *LEBIH BESAR* dari `asal_masalah`. Maka `asal_masalah` lama dibuang, diganti dengan nilai total saham yang baru.
* **Radd:** Jika total pembilang *LEBIH KECIL* dari `asal_masalah` DAN *tidak ada ashabah*. Sisa dibagikan proporsional ke ahli waris (kecuali suami/istri).

### Langkah C: Tashih al-Masail (Penyelesaian Inkisâr / Pecahan)
Digunakan jika jumlah saham tidak habis dibagi rata (modulo `!== 0`) dengan jumlah orang (kepala) pada satu kelompok pewaris.
1. Cari relasi matematis antara Saham dan Jumlah Kepala:
   - **Tawafuq:** Ada faktor persekutuan (bisa dibagi angka yang sama). Hitung nilai FPB (Greatest Common Divisor). Ambil `Jumlah_Kepala / FPB`. Simpan ke array `mahfudzat`.
   - **Tabayun:** Tidak ada persekutuan sama sekali. Langsung simpan `Jumlah_Kepala` ke array `mahfudzat`.
2. Hitung **Juz' as-Sahm** (Pengali Final):
   - Jika `mahfudzat` hanya 1 isi: `Juz_Sahm = mahfudzat[0]`.
   - Jika `mahfudzat` lebih dari 1: Hitung Kelipatan Persekutuan Terkecil (LCM/KPK) dari seluruh angka di array tersebut. Hasilnya menjadi `Juz_Sahm`.
3. **Eksekusi Akhir:** `Asal_Masalah_Final = Asal_Masalah * Juz_Sahm`. Seluruh saham ahli waris dikalikan dengan `Juz_Sahm` agar bulat.
4. Nominal uang: `(Saham_Individu / Asal_Masalah_Final) * total_harta_bersih`.

---
*Dokumen ini wajib diserahkan berserta file PDF asli (Faroid Kelas 3 2017.pdf) sebagai sumber kebenaran tertinggi (Source of Truth) saat Fase Testing/QA.*
