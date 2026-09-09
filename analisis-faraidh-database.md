# Analisis Kitab "علم الفرائض" (Ilmu Faraidh Kelas 3 KMI Gontor)
## & Rancangan Skema Database

---

## BAGIAN 1 — RINGKASAN STRUKTUR KITAB

| Pelajaran | Isi |
|---|---|
| 1 | Definisi ilmu faraidh, objek kajian, dalil |
| 2 | Definisi waris (irts), rukun waris (3), syarat waris (3), sebab waris (3: nasab, nikah, wala'), penghalang waris (3: budak, bunuh, beda agama) |
| 3 | Ahli waris laki-laki (15) & perempuan (10), yang tak pernah gugur (5 laki2 + 5 perempuan), macam waris (furudh vs ashabah) |
| 4 | Furudh muqaddarah (6 macam pecahan), sebab masing‑masing furudh (ahli waris pemilik tiap pecahan) |
| 5 | Ashabah — definisi, sebab (nasab & wala'), pembagian: bin-nafsih, bil-ghair, ma'al-ghair |
| 6 | Hijab — hijab hirman (gugur total) vs hijab nuqshan (berkurang bagian) |
| 7 | Tabel rangkuman furudh muqaddarah per ahli waris + Jadwal (2) hijab hirman & Jadwal (3) hijab nuqshan |
| 8 | Asal masalah (KPK/penyebut pokok) — kategori shahihah (tidak 'aul: 2,3,4,8) & kategori 'aailah (bisa 'aul: 6,12,24) |
| 9 | 'Aul — definisi, syarat, angka-angka 'aul yang mungkin (6→7,8,9,10 / 12→13,15,17 / 24→27) |
| 10 | Radd — definisi, syarat (3), siapa yang berhak radd (8 golongan), kasus radd tunggal vs radd campuran (4 kondisi hitung ulang asal masalah) |
| 11 | Kasus-kasus khusus (musytarakah / himariyah, gharrawain / 'umariyyatain, dan variasi jaddah+ikhwah) |
| Tambahan | Ta'shih al-masail (penyesuaian pecahan bila bagian ahli waris tak habis dibagi rata — tawafuq/tabayun/tamatsul/tadakhul) |

---

## BAGIAN 2 — QOIDAH & KONDISI (diekstrak menyeluruh)

### 2.1 Master Ahli Waris (25 jenis tetap)

**Laki-laki (15):**
1. Anak laki-laki (الابن)
2. Cucu laki-laki dari anak laki-laki, dst ke bawah (ابن الابن وإن نزل)
3. Ayah (الأب)
4. Kakek shahih ke atas, dari jalur ayah (الجد الصحيح وإن علا)
5. Saudara laki-laki sekandung (الأخ الشقيق)
6. Saudara laki-laki seayah (الأخ لأب)
7. Saudara laki-laki seibu (الأخ لأم)
8. Anak laki-laki dari saudara sekandung (ابن الأخ الشقيق)
9. Anak laki-laki dari saudara seayah (ابن الأخ لأب)
10. Paman sekandung (العم الشقيق)
11. Paman seayah (العم لأب)
12. Anak laki-laki paman sekandung (ابن العم الشقيق)
13. Anak laki-laki paman seayah (ابن العم لأب)
14. Suami (الزوج)
15. Yang memerdekakan budak, laki-laki (المعتِق)

**Perempuan (10):**
1. Anak perempuan (البنت)
2. Cucu perempuan dari anak laki-laki (بنت الابن)
3. Ibu (الأم)
4. Nenek dari jalur ibu (الجدة من جهة الأم)
5. Nenek dari jalur ayah (الجدة من جهة الأب)
6. Saudara perempuan sekandung (الأخت الشقيقة)
7. Saudara perempuan seayah (الأخت لأب)
8. Saudara perempuan seibu (الأخت لأم)
9. Istri (الزوجة)
10. Yang memerdekakan budak, perempuan (المعتِقة)

**5 ahli waris yang TIDAK PERNAH gugur sama sekali** (selalu dapat bagian dalam kondisi apa pun): Suami, Istri, Ayah, Ibu, Anak (laki2/perempuan) — ini kaidah penting untuk validasi logika hijab.

---

### 2.2 Furudh Muqaddarah (6 pecahan tetap) — Jadwal (1)

| Pecahan | Ahli Waris & Syarat |
|---|---|
| **1/2** | Suami (jika istri tidak punya anak/cucu); Anak perempuan tunggal (tanpa saudara laki2); Cucu perempuan tunggal (tanpa mu'ashib & tanpa anak pewaris); Saudari sekandung tunggal (tanpa saudara laki2, tanpa ayah/anak); Saudari seayah tunggal (dgn syarat serupa) |
| **1/4** | Suami (jika istri **punya** anak/cucu); Istri/istri-istri (jika suami **tidak punya** anak/cucu) |
| **1/8** | Istri/istri-istri (jika suami **punya** anak/cucu) |
| **2/3** | 2 anak perempuan atau lebih (tanpa saudara laki2); 2 cucu perempuan atau lebih (tanpa mu'ashib/anak); 2 saudari sekandung atau lebih; 2 saudari seayah atau lebih (tanpa saudara sekandung) |
| **1/3** | Ibu (jika pewaris tak punya anak/cucu & tak punya 2+ saudara/i); 2 atau lebih saudara/i seibu (dibagi rata laki2=perempuan) |
| **1/6** | Ibu (jika ada anak/cucu, atau ada 2+ saudara/i); Ayah (jika ada anak laki2/cucu laki2); Kakek (posisi seperti ayah, jika ada ayah maka kakek terhalang); Nenek (satu/lebih, jika tak ada ibu); Cucu perempuan (jika bersama 1 anak perempuan, sbg pelengkap 2/3); Saudari seayah (jika bersama 1 saudari sekandung, pelengkap 2/3); 1 saudara/i seibu |

> **Catatan penting untuk logika sistem:** hampir semua furudh di atas **kondisional** terhadap kombinasi ahli waris lain yang hadir — ini sebabnya database **tidak bisa** menyimpan "1 ahli waris = 1 bagian tetap", tapi harus menyimpan **aturan bersyarat** (lihat Bagian 3).

---

### 2.3 Ashabah (sisa harta) — 3 jenis

**A. Ashabah bin-Nafsih** (dgn sendirinya) — urutan prioritas (12 tingkat, versi kitab ini):
1. Anak laki-laki
2. Cucu laki-laki dst ke bawah
3. Ayah
4. Kakek shahih ke atas
5. Saudara laki-laki sekandung
6. Saudara laki-laki seayah
7. Anak laki-laki saudara sekandung
8. Anak laki-laki saudara seayah
9. Paman sekandung
10. Paman seayah
11. Anak laki-laki paman sekandung
12. Anak laki-laki paman seayah
(lalu: yang memerdekakan budak)

**B. Ashabah bil-Ghair** (jadi ashabah krn dibantu/ditarik oleh laki2 sederajat, 2:1):
- Anak perempuan + Anak laki-laki
- Cucu perempuan + Cucu laki-laki
- Saudari sekandung + Saudara sekandung
- Saudari seayah + Saudara seayah

**C. Ashabah ma'al-Ghair** (jadi ashabah krn bersama ahli waris furudh lain, bukan krn ditarik laki2 sederajat):
- Saudari sekandung/seayah (1 atau lebih) **bersama** anak perempuan/cucu perempuan (tanpa ada mu'ashib laki2 & tanpa saudara laki2 sekandung/seayah)

---

### 2.4 Hijab Hirman (gugur total) — Jadwal (2)

| Yang Menghalangi | Yang Terhalang (gugur total) |
|---|---|
| Ibu | Semua Nenek (jalur ibu maupun ayah) |
| Ayah | Kakek, Saudara/i sekandung, seayah, seibu |
| Anak laki-laki (dan cucu laki2 ke bawah) | Semua cucu (laki2/perempuan), semua saudara/i seibu |
| 2 anak perempuan / 2 cucu perempuan | Cucu perempuan yg lebih rendah derajat (kecuali ada mu'ashib laki2 sederajat/lebih rendah) |
| Ayah, kakek, anak laki2, cucu laki2 | Saudara/i seayah/sekandung (jika lengkap 3 saudari sekandung → hijab saudari seayah, kecuali ada mu'ashib laki2 seayah) |

*(Detail lengkap ada di tabel kitab hlm. Jadwal(2), sudah tercakup semua di atas.)*

### 2.5 Hijab Nuqshan (berkurang bagian, bukan gugur) — Jadwal (3)

| Sebab | Ahli Waris yg Terpengaruh | Perubahan |
|---|---|---|
| Ada anak/cucu | Suami | 1/2 → 1/4 |
| Ada anak/cucu | Istri | 1/4 → 1/8 |
| Ada anak/cucu, ATAU 2+ saudara/i | Ibu | 1/3 → 1/6 |
| Ada anak perempuan (1 orang) | Cucu perempuan | jadi 1/6 (pelengkap 2/3), bisa gugur jika ada 2+ anak perempuan tanpa mu'ashib |
| Ada 1 saudari sekandung | Saudari seayah | jadi 1/6 (pelengkap 2/3), berubah jadi ashabah jika ada saudara laki2 seayah |
| Sesama anak laki2/perempuan (anak menarik cucu) | — | mengurangi bagian ashabah pihak lain |

---

### 2.6 Asal Masalah (Penyebut Pokok / KPK)

**Kategori tidak 'aul (شحيحة):** asal dasar = **2, 3, 4, 8** (utk kombinasi 1/2&sisa, 1/3, 1/4&sisa, 1/8&sisa)

**Kategori bisa 'aul (عائلة):** asal dasar = **6, 12, 24**

**Aturan menggabungkan 2+ pecahan berbeda (4 kondisi hubungan angka penyebut):**
1. **Tamatsul** (sama persis) → asal = angka itu sendiri
2. **Tadakhul** (satu adalah kelipatan yg lain) → asal = angka yang lebih besar
3. **Tawafuq** (ada FPB > 1) → asal = (angka1 ÷ FPB) × angka2
4. **Tabayun** (tidak ada faktor sekutu selain 1) → asal = angka1 × angka2

---

### 2.7 'Aul (penyebut membesar krn total furudh > asal masalah)

| Asal Masalah | Bisa 'Aul menjadi |
|---|---|
| 6 | 7, 8, 9, 10 |
| 12 | 13, 15, 17 |
| 24 | 27 |

*(Asal 2, 3, 4, 8 TIDAK PERNAH 'aul.)*

---

### 2.8 Radd (sisa dikembalikan ke ashabul furudh)

**Syarat radd (3):**
1. Ada sisa harta setelah furudh dibagi
2. Tidak ada ashabah sama sekali
3. Tidak terjadi 'aul

**Yang berhak radd (8, semua ashabul furudh KECUALI suami/istri):**
Anak perempuan, cucu perempuan, ayah, kakek, ibu, nenek, saudara/i seibu, saudari sekandung/seayah.

**Aturan khusus suami-istri:** tidak ikut menerima radd, KECUALI jika tidak ada kerabat (dzawil arham) lain — dalam kasus itu semua sisa kembali ke suami/istri.

**4 kondisi perhitungan radd:**
1. Ahli waris radd 1 orang → asal = jumlah kepala/penyebut furudhnya, radd otomatis menutup sisa
2. Ahli waris radd berbeda-beda furudh-nya → asal = jumlah pembilang setelah disamakan penyebut
3. Ada suami/istri + ahli waris radd → suami/istri ambil bagian awal, sisa untuk radd dgn asal baru
4. Kombinasi suami/istri + radd berbeda furudh → digabung dgn kaidah tawafuq/tabayun

---

### 2.9 Ta'shih al-Masail (penyesuaian bila bagian tak habis dibagi rata antar ahli waris sejenis)

Berlaku 4 kaidah matematis (tamatsul, tadakhul, tawafuq, tabayun — sama seperti 2.6) untuk mencari **juz' as-sahm** (angka pengali) supaya bagian tiap ahli waris (per kepala) bisa dibagi bulat/rata.

---

### 2.10 Kasus-Kasus Khusus (Pelajaran 11)

1. **Kasus "Aul yg tampak seperti radd"** — kombinasi suami/istri + ibu/ayah (perlu penyesuaian pengali khusus)
2. **Al-Gharrawain / Al-'Umariyyatain** — pewaris meninggalkan suami+ibu+ayah, atau istri+ibu+ayah → ibu dapat **1/3 dari SISA** (bukan 1/3 dari total), bukan aturan 1/3 biasa
3. **Al-Musytarakah (Himariyah)** — suami + ibu + 2 saudara/i seibu + saudara/i sekandung → saudara/i sekandung ikut berbagi 1/3 bersama saudara/i seibu (musytarakah dlm bagian 1/3), meski secara asal saudara sekandung laki2 harusnya ashabah

---

## BAGIAN 3 — RANCANGAN SKEMA DATABASE

### 3.1 Prinsip Desain (penting dibaca dulu)

Ilmu faraidh **bukan** tabel lookup statis "ahli waris X = bagian Y", karena bagian setiap ahli waris **bergantung kombinasi** ahli waris lain yang hadir (hijab, jumlah, gender, ada/tiadanya far'/ushul). Jumlah kombinasi bisa ratusan/ribuan — kalau dihardcode semua ke tabel kasus, tidak scalable.

**Rekomendasi arsitektur:**
- Database menyimpan **data referensi statis** (master ahli waris, furudh, hijab, ashabah, asal masalah, 'aul, radd) — ini yang kamu tanyakan, dan itu di bawah.
- Logika **mesin hitung** (rules engine) faraidh (menentukan siapa gugur, siapa dapat furudh berapa, siapa ashabah, hitung asal masalah, 'aul/radd) ditulis sebagai **algoritma di aplikasi** (PHP/JS/Python), yang **membaca** tabel referensi ini sebagai sumber kebenaran, bukan menyimpan hasil per kombinasi.
- Tabel `kasus` & `kasus_ahli_waris` menyimpan **input** dari user (studi kasus/soal), dan `hasil_perhitungan` menyimpan **output** hasil mesin hitung — bukan aturan.

Ini sama seperti kitab: kitab tidak menulis semua kombinasi, tapi menulis **kaidah** (furudh + hijab + ashabah + asal + 'aul + radd) yang lalu diterapkan manual ke tiap soal. Database kita meniru struktur itu.

### 3.2 ERD (deskriptif)

```
ahli_waris (master 25 jenis)
   │
   ├──< furudh_rule (aturan bagian tetap per ahli waris + syarat)
   ├──< hijab_hirman_rule (siapa menghalangi siapa, total)
   ├──< hijab_nuqshan_rule (siapa mengurangi bagian siapa)
   └──< ashabah_rule (urutan & jenis ashabah)

asal_masalah_kombinasi (tabel bantu kombinasi furudh → asal masalah)
aul_rule (asal_masalah → nilai 'aul)
radd_rule (syarat & daftar ahli waris berhak radd)
kasus_khusus (gharrawain, musytarakah, dll — deskriptif + rumus)

kasus (soal/studi kasus user)
   └──< kasus_ahli_waris (ahli waris yg hadir + jumlah org, utk 1 kasus)
        └──1 hasil_perhitungan (per ahli waris: status, jenis bagian, pecahan, nominal)
```

### 3.3 DDL (SQL — kompatibel MySQL/XAMPP; untuk Supabase/Postgres tinggal ganti `INT AUTO_INCREMENT`→`SERIAL`/`BIGINT GENERATED ALWAYS AS IDENTITY`, `ENUM`→`CHECK` atau text)

```sql
-- ================================
-- 1. MASTER AHLI WARIS (25 jenis tetap)
-- ================================
CREATE TABLE ahli_waris (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    kode            VARCHAR(20) UNIQUE NOT NULL,      -- 'anak_lk', 'ayah', 'suami', dst
    nama_arab       VARCHAR(100) NOT NULL,
    nama_id         VARCHAR(100) NOT NULL,
    jenis_kelamin   ENUM('L','P') NOT NULL,
    kelompok        ENUM('furudh','ashabah_bin_nafsih','ashabah_bil_ghair','ashabah_maal_ghair') NOT NULL,
    tidak_pernah_gugur BOOLEAN DEFAULT FALSE,          -- 5 ahli waris yg selalu dapat bagian
    urutan_ashabah  INT NULL,                          -- 1-12, hanya utk ashabah bin-nafsih
    keterangan      TEXT
);

-- ================================
-- 2. FURUDH MUQADDARAH + SYARAT (bagian tetap, kondisional)
-- ================================
CREATE TABLE furudh_rule (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    ahli_waris_id       INT NOT NULL REFERENCES ahli_waris(id),
    pecahan             ENUM('1/2','1/4','1/8','2/3','1/3','1/6') NOT NULL,
    syarat_jumlah_min   INT NULL,           -- mis. 'min 2 orang' utk 2/3
    syarat_jumlah_max   INT NULL,           -- mis. 'tunggal' utk 1/2 (max 1)
    syarat_kondisi      JSON NOT NULL,      -- lihat contoh di bawah
    prioritas           INT DEFAULT 0,      -- urutan pengecekan bila ada beberapa rule
    keterangan          TEXT
);

-- Contoh isi syarat_kondisi (JSON) utk baris "Ibu = 1/6":
-- {
--   "requires_absence_of": [],
--   "requires_presence_of_any": ["anak_lk","anak_pr","cucu_lk","cucu_pr","2_atau_lebih_saudara"]
-- }
-- Contoh utk "Suami = 1/2":
-- { "requires_absence_of": ["anak_lk","anak_pr","cucu_lk","cucu_pr"] }

-- ================================
-- 3. HIJAB HIRMAN (gugur total)
-- ================================
CREATE TABLE hijab_hirman_rule (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    penghalang_id       INT NOT NULL REFERENCES ahli_waris(id),
    terhalang_id        INT NOT NULL REFERENCES ahli_waris(id),
    syarat_tambahan     JSON NULL,     -- mis. "kecuali ada mu'ashib laki2 seayah"
    keterangan          TEXT
);

-- ================================
-- 4. HIJAB NUQSHAN (berkurang bagian, bukan gugur)
-- ================================
CREATE TABLE hijab_nuqshan_rule (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    penyebab_id         INT NOT NULL REFERENCES ahli_waris(id),   -- ahli waris yg keberadaannya jadi sebab
    terdampak_id        INT NOT NULL REFERENCES ahli_waris(id),
    pecahan_awal        VARCHAR(10) NOT NULL,   -- '1/2'
    pecahan_baru        VARCHAR(10) NOT NULL,   -- '1/4'
    syarat_kondisi      JSON NULL,
    keterangan          TEXT
);

-- ================================
-- 5. ASHABAH RULES
-- ================================
CREATE TABLE ashabah_rule (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ahli_waris_id   INT NOT NULL REFERENCES ahli_waris(id),
    jenis           ENUM('bin_nafsih','bil_ghair','maal_ghair') NOT NULL,
    pasangan_penarik_id INT NULL REFERENCES ahli_waris(id),  -- utk bil_ghair/maal_ghair
    rasio           VARCHAR(10) NULL,      -- '2:1' utk bil_ghair
    urutan_prioritas INT NULL,             -- 1-12 utk bin_nafsih
    syarat_kondisi  JSON NULL,
    keterangan      TEXT
);

-- ================================
-- 6. ASAL MASALAH — kaidah kombinasi (referensi statis, bukan hasil hitung)
-- ================================
CREATE TABLE asal_masalah_dasar (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nilai       INT NOT NULL,             -- 2,3,4,6,8,12,24
    kategori    ENUM('shahihah','aailah') NOT NULL,  -- tidak bisa 'aul vs bisa 'aul
    keterangan  TEXT
);

CREATE TABLE kaidah_gabung_pecahan (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    hubungan        ENUM('tamatsul','tadakhul','tawafuq','tabayun') NOT NULL,
    rumus           VARCHAR(100) NOT NULL,   -- deskripsi rumus, mesin hitung yg eksekusi
    keterangan      TEXT
);

-- ================================
-- 7. 'AUL
-- ================================
CREATE TABLE aul_rule (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    asal_masalah        INT NOT NULL,        -- 6, 12, 24
    nilai_aul_mungkin   INT NOT NULL         -- 7,8,9,10 / 13,15,17 / 27
);

-- ================================
-- 8. RADD
-- ================================
CREATE TABLE radd_rule (
    id                      INT AUTO_INCREMENT PRIMARY KEY,
    ahli_waris_id           INT NOT NULL REFERENCES ahli_waris(id),
    berhak_radd             BOOLEAN DEFAULT TRUE,   -- suami/istri = FALSE (kecuali kondisi khusus)
    syarat_pengecualian     JSON NULL,   -- suami/istri berhak radd jika tidak ada dzawil arham lain
    keterangan              TEXT
);

-- ================================
-- 9. KASUS KHUSUS (deskriptif, dipakai mesin hitung sbg exception handler)
-- ================================
CREATE TABLE kasus_khusus (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    kode            VARCHAR(30) UNIQUE NOT NULL,   -- 'gharrawain', 'musytarakah'
    nama            VARCHAR(100) NOT NULL,
    pemicu_kondisi  JSON NOT NULL,     -- kombinasi ahli waris yg memicu kasus ini
    aturan_khusus   TEXT NOT NULL,     -- penjelasan rumus pengganti
    keterangan      TEXT
);

-- ================================
-- 10. KASUS / STUDI SOAL (input & output — dipakai fitur "hitung waris" di web nanti)
-- ================================
CREATE TABLE kasus (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    judul           VARCHAR(150),
    total_harta     DECIMAL(18,2) NOT NULL,
    mata_uang       VARCHAR(10) DEFAULT 'IDR',
    dibuat_pada     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kasus_ahli_waris (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    kasus_id        INT NOT NULL REFERENCES kasus(id),
    ahli_waris_id   INT NOT NULL REFERENCES ahli_waris(id),
    jumlah_orang    INT NOT NULL DEFAULT 1
);

CREATE TABLE hasil_perhitungan (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    kasus_id            INT NOT NULL REFERENCES kasus(id),
    ahli_waris_id       INT NOT NULL REFERENCES ahli_waris(id),
    status              ENUM('furudh','ashabah','gugur','radd') NOT NULL,
    pecahan_diperoleh   VARCHAR(15) NULL,      -- '1/6', '5/24', dst (setelah asal/'aul)
    asal_masalah        INT NULL,
    nilai_aul           INT NULL,
    nominal_per_orang   DECIMAL(18,2) NULL,
    nominal_total_kelompok DECIMAL(18,2) NULL,
    catatan             TEXT
);
```

### 3.4 Catatan implementasi mesin hitung (algoritma, di luar DB)

Urutan proses standar yang perlu diikuti kode aplikasi kamu (mengikuti urutan bab kitab):
1. Validasi ahli waris masuk (rukun & syarat waris terpenuhi)
2. Terapkan `hijab_hirman_rule` → tandai siapa gugur total
3. Terapkan `hijab_nuqshan_rule` → sesuaikan pecahan yg berkurang
4. Cek `furudh_rule` utk sisa ahli waris → tentukan siapa dapat furudh & pecahan berapa
5. Cek `ashabah_rule` → sisa harta (jika ada) untuk ashabah sesuai urutan prioritas
6. Cek `kasus_khusus` (gharrawain, musytarakah) — override langkah 4/5 bila kondisi cocok
7. Hitung `asal_masalah` dari kombinasi pecahan (pakai `kaidah_gabung_pecahan`)
8. Cek kemungkinan `'aul` (total pembilang > asal) → sesuaikan dgn `aul_rule`
9. Jika ada sisa & tidak ada ashabah & tidak 'aul → proses `radd_rule`
10. Ta'shih al-masail bila bagian per-kepala tak habis dibagi rata
11. Kalikan tiap pecahan akhir dgn `total_harta` di tabel `kasus` → simpan ke `hasil_perhitungan`

---

## BAGIAN 4 — LANGKAH SELANJUTNYA (usulan)

1. Isi seed data `ahli_waris` (25 baris) — bisa saya buatkan seed SQL lengkap
2. Isi seed data `furudh_rule`, `hijab_hirman_rule`, `hijab_nuqshan_rule`, `ashabah_rule` per baris (cukup banyak, ~60-80 baris gabungan) — bisa saya kerjakan bertahap per tabel
3. Tulis algoritma mesin hitung (pseudocode → PHP/JS) berdasarkan urutan di 3.4
4. Uji dengan soal-soal latihan yg ada di kitab (banyak contoh soal siap pakai utk testing/unit test)

Kabari saya kalau mau lanjut ke seed data SQL-nya dulu atau langsung ke pseudocode mesin hitungnya.
