# Faraidh — Seed Data & Gambaran Alur Pemakaian Web
_(Lanjutan dari `analisis-faraidh-database.md`)_

---

## BAGIAN 5 — GAMBARAN ALUR PEMAKAIAN WEB (UX Flow)

Ini gambaran konsep pemakaian (bukan kode UI, murni alur logika + data apa yang mengalir ke tabel mana), supaya jelas kenapa skemanya dibentuk begitu:

**Langkah 1 — User pilih ahli waris yang ditinggalkan**
Tampilkan 25 ahli waris (`ahli_waris`) sebagai checklist bergrup (Laki-laki / Perempuan), tiap yang dicentang bisa isi **jumlah orang** (default 1; untuk ahli waris yang secara syariat cuma mungkin 1 orang — Ibu, Ayah, Suami — kunci ke 1; untuk Istri/Anak/Saudara dst boleh >1).
→ Data ini yang nanti masuk ke `kasus_ahli_waris` (kasus_id, ahli_waris_id, jumlah_orang).

**Langkah 2 — User input harta peninggalan**
Input nominal total harta bersih (sudah dikurangi utang, wasiat, biaya pengurusan jenazah — bisa jadi field terpisah kalau mau ditambah nanti: `hutang`, `wasiat_maks_sepertiga`, dll).
→ Masuk ke tabel `kasus` (total_harta).

**Langkah 3 — Sistem validasi kombinasi**
Sebelum hitung, mesin cek logis dasar: minimal harus ada 1 ahli waris; kalau ada Anak/Ayah/Ibu/Suami/Istri (5 yang tak pernah gugur) otomatis lolos; tidak boleh pilih kombinasi mustahil (mis. Anak laki-laki DAN Cucu laki-laki dari jalur yang sama tanpa Anak — cukup validasi ringan, tidak perlu 100% ketat di versi awal).

**Langkah 4 — Mesin hitung jalan (algoritma di Bagian 6)**
Baca `hijab_hirman_rule` → tandai gugur. Baca `hijab_nuqshan_rule` → sesuaikan pecahan. Baca `furudh_rule` → tentukan siapa dapat pecahan apa. Baca `ashabah_rule` → alokasikan sisa. Cek `kasus_khusus` → override kalau match (gharrawain/musytarakah). Hitung `asal_masalah`, cek `'aul`/`radd`, ta'shih bila perlu.

**Langkah 5 — Tampilkan hasil**
Tabel hasil per ahli waris: nama, status (Furudh/Ashabah/Radd/Gugur), pecahan yang didapat, nominal rupiah. Bisa juga ditampilkan "asal masalah = 24" dsb sebagai catatan edukatif (khas kitab faraidh, biar user paham prosesnya bukan cuma angka akhir).
→ Semua tersimpan di `hasil_perhitungan`, terhubung ke `kasus_id` supaya user bisa buka riwayat kasusnya lagi nanti.

**Ringkas alur data:**
```
[Checklist ahli waris + jumlah]  →  kasus_ahli_waris
[Input total harta]              →  kasus
        ↓
   MESIN HITUNG (baca semua tabel referensi Bab 3)
        ↓
[Tabel hasil per ahli waris]     →  hasil_perhitungan
```

Jadi database dari Bagian 3 kemarin itu memang isinya **kaidah tetap** (tidak berubah-ubah, ini "kitab"-nya dalam bentuk data), sedangkan `kasus`, `kasus_ahli_waris`, `hasil_perhitungan` itu isinya **data transaksi** tiap kali user pakai web (ini yang berubah-ubah tiap orang pakai).

---

## BAGIAN 6 — SEED DATA SQL

### 6.1 `ahli_waris` (25 baris)

```sql
INSERT INTO ahli_waris (kode, nama_arab, nama_id, jenis_kelamin, kelompok, tidak_pernah_gugur, urutan_ashabah) VALUES
-- LAKI-LAKI
('anak_lk',              'الابن',              'Anak Laki-laki',                    'L', 'ashabah_bin_nafsih', TRUE,  1),
('cucu_lk',               'ابن الابن',           'Cucu Laki-laki (dari anak laki-laki)','L','ashabah_bin_nafsih', FALSE, 2),
('ayah',                  'الأب',               'Ayah',                              'L', 'furudh',             TRUE,  3),
('kakek',                 'الجد الصحيح',        'Kakek Shahih (jalur ayah)',          'L', 'furudh',             FALSE, 4),
('saudara_lk_kandung',    'الأخ الشقيق',        'Saudara Laki-laki Sekandung',        'L', 'ashabah_bin_nafsih', FALSE, 5),
('saudara_lk_seayah',     'الأخ لأب',           'Saudara Laki-laki Seayah',           'L', 'ashabah_bin_nafsih', FALSE, 6),
('saudara_lk_seibu',      'الأخ لأم',           'Saudara Laki-laki Seibu',            'L', 'furudh',             FALSE, NULL),
('keponakan_lk_kandung',  'ابن الأخ الشقيق',    'Anak Laki-laki Saudara Sekandung',   'L', 'ashabah_bin_nafsih', FALSE, 7),
('keponakan_lk_seayah',   'ابن الأخ لأب',       'Anak Laki-laki Saudara Seayah',      'L', 'ashabah_bin_nafsih', FALSE, 8),
('paman_kandung',         'العم الشقيق',        'Paman Sekandung (dari ayah)',        'L', 'ashabah_bin_nafsih', FALSE, 9),
('paman_seayah',          'العم لأب',           'Paman Seayah (dari ayah)',           'L', 'ashabah_bin_nafsih', FALSE, 10),
('sepupu_lk_paman_kandung','ابن العم الشقيق',   'Anak Laki-laki Paman Sekandung',     'L', 'ashabah_bin_nafsih', FALSE, 11),
('sepupu_lk_paman_seayah', 'ابن العم لأب',      'Anak Laki-laki Paman Seayah',        'L', 'ashabah_bin_nafsih', FALSE, 12),
('suami',                 'الزوج',              'Suami',                             'L', 'furudh',             TRUE,  NULL),
('mutiq',                 'المعتِق',            'Yang Memerdekakan Budak (laki-laki)','L', 'ashabah_bin_nafsih', FALSE, 13),
-- PEREMPUAN
('anak_pr',               'البنت',              'Anak Perempuan',                    'P', 'furudh',             TRUE,  NULL),
('cucu_pr',                'بنت الابن',          'Cucu Perempuan (dari anak laki-laki)','P','furudh',            FALSE, NULL),
('ibu',                    'الأم',               'Ibu',                               'P', 'furudh',             TRUE,  NULL),
('nenek_ibu',              'الجدة من الأم',      'Nenek dari Jalur Ibu',              'P', 'furudh',             FALSE, NULL),
('nenek_ayah',             'الجدة من الأب',      'Nenek dari Jalur Ayah',             'P', 'furudh',             FALSE, NULL),
('saudari_kandung',        'الأخت الشقيقة',      'Saudari Sekandung',                 'P', 'furudh',             FALSE, NULL),
('saudari_seayah',         'الأخت لأب',          'Saudari Seayah',                    'P', 'furudh',             FALSE, NULL),
('saudari_seibu',          'الأخت لأم',          'Saudari Seibu',                     'P', 'furudh',             FALSE, NULL),
('istri',                  'الزوجة',             'Istri',                             'P', 'furudh',             TRUE,  NULL),
('mutiqah',                'المعتِقة',           'Yang Memerdekakan Budak (perempuan)','P','ashabah_bin_nafsih', FALSE, NULL);
```

> Catatan: kolom `kelompok` di atas adalah klasifikasi **primer/default**. Beberapa ahli waris punya **peran ganda** (mis. Ayah/Kakek bisa furudh 1/6 ATAU furudh+ashabah, Anak Perempuan bisa furudh ATAU ashabah bil-ghair, Saudari bisa furudh/bil-ghair/ma'al-ghair) — peran ganda ini direpresentasikan lewat baris tambahan di `furudh_rule` dan `ashabah_rule` yang merujuk `ahli_waris_id` yang sama, bukan lewat kolom `kelompok`.

### 6.2 `furudh_rule`

```sql
-- 1/2
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_jumlah_max, syarat_kondisi, keterangan) VALUES
((SELECT id FROM ahli_waris WHERE kode='suami'), '1/2', 1, 1,
  '{"requires_absence_of":["anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  'Suami dapat 1/2 jika istri tidak punya anak/cucu'),
((SELECT id FROM ahli_waris WHERE kode='anak_pr'), '1/2', 1, 1,
  '{"requires_absence_of":["anak_lk"]}',
  'Anak perempuan tunggal, tanpa saudara laki-laki'),
((SELECT id FROM ahli_waris WHERE kode='cucu_pr'), '1/2', 1, 1,
  '{"requires_absence_of":["anak_lk","anak_pr_2_atau_lebih","cucu_lk_sederajat_atau_lebih_rendah"]}',
  'Cucu perempuan tunggal, tanpa mu-ashib & tanpa anak pewaris'),
((SELECT id FROM ahli_waris WHERE kode='saudari_kandung'), '1/2', 1, 1,
  '{"requires_absence_of":["saudara_lk_kandung","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  'Saudari sekandung tunggal, tanpa saudara laki-laki, tanpa far dan ashl waris'),
((SELECT id FROM ahli_waris WHERE kode='saudari_seayah'), '1/2', 1, 1,
  '{"requires_absence_of":["saudara_lk_seayah","saudara_lk_kandung","saudari_kandung","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  'Saudari seayah tunggal, dengan syarat serupa saudari sekandung');

-- 1/4
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan) VALUES
((SELECT id FROM ahli_waris WHERE kode='suami'), '1/4',
  '{"requires_presence_of_any":["anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  'Suami dapat 1/4 jika istri punya anak/cucu'),
((SELECT id FROM ahli_waris WHERE kode='istri'), '1/4',
  '{"requires_absence_of":["anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  'Istri/istri-istri dapat 1/4 jika suami tidak punya anak/cucu');

-- 1/8
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan) VALUES
((SELECT id FROM ahli_waris WHERE kode='istri'), '1/8',
  '{"requires_presence_of_any":["anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  'Istri/istri-istri dapat 1/8 jika suami punya anak/cucu');

-- 2/3
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_kondisi, keterangan) VALUES
((SELECT id FROM ahli_waris WHERE kode='anak_pr'), '2/3', 2,
  '{"requires_absence_of":["anak_lk"]}',
  '2 atau lebih anak perempuan, tanpa saudara laki-laki'),
((SELECT id FROM ahli_waris WHERE kode='cucu_pr'), '2/3', 2,
  '{"requires_absence_of":["anak_lk","anak_pr_2_atau_lebih","cucu_lk_sederajat_atau_lebih_rendah"]}',
  '2 atau lebih cucu perempuan, tanpa mu-ashib/anak'),
((SELECT id FROM ahli_waris WHERE kode='saudari_kandung'), '2/3', 2,
  '{"requires_absence_of":["saudara_lk_kandung","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  '2 atau lebih saudari sekandung'),
((SELECT id FROM ahli_waris WHERE kode='saudari_seayah'), '2/3', 2,
  '{"requires_absence_of":["saudara_lk_seayah","saudara_lk_kandung","saudari_kandung","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  '2 atau lebih saudari seayah, tanpa saudari sekandung');

-- 1/3
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan) VALUES
((SELECT id FROM ahli_waris WHERE kode='ibu'), '1/3',
  '{"requires_absence_of":["anak_lk","anak_pr","cucu_lk","cucu_pr","saudara_2_atau_lebih_gabungan"]}',
  'Ibu dapat 1/3 jika pewaris tak punya anak/cucu & tak punya 2+ saudara/i'),
((SELECT id FROM ahli_waris WHERE kode='saudara_lk_seibu'), '1/3_gabungan',
  '{"syarat_jumlah_gabungan_min":2,"digabung_dengan":"saudari_seibu","pembagian":"laki2_sama_dengan_perempuan"}',
  '2+ saudara/i seibu (gabungan lk+pr) berbagi rata 1/3'),
((SELECT id FROM ahli_waris WHERE kode='saudari_seibu'), '1/3_gabungan',
  '{"syarat_jumlah_gabungan_min":2,"digabung_dengan":"saudara_lk_seibu","pembagian":"laki2_sama_dengan_perempuan"}',
  '2+ saudara/i seibu (gabungan lk+pr) berbagi rata 1/3');

-- 1/6
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan) VALUES
((SELECT id FROM ahli_waris WHERE kode='ibu'), '1/6',
  '{"requires_presence_of_any":["anak_lk","anak_pr","cucu_lk","cucu_pr","saudara_2_atau_lebih_gabungan"]}',
  'Ibu dapat 1/6 jika ada anak/cucu, atau 2+ saudara/i'),
((SELECT id FROM ahli_waris WHERE kode='ayah'), '1/6',
  '{"requires_presence_of_any":["anak_lk","cucu_lk"]}',
  'Ayah dapat 1/6 (murni furudh) jika ada far waris laki-laki; jika hanya anak perempuan, Ayah dapat 1/6 + sisa (lihat ashabah_rule)'),
((SELECT id FROM ahli_waris WHERE kode='kakek'), '1/6',
  '{"requires_presence_of_any":["anak_lk","cucu_lk"], "requires_absence_of":["ayah"]}',
  'Kakek posisi seperti Ayah, hanya berlaku jika Ayah tidak ada'),
((SELECT id FROM ahli_waris WHERE kode='nenek_ibu'), '1/6',
  '{"requires_absence_of":["ibu"]}',
  'Nenek (satu/lebih, dibagi rata sesama nenek) jika tidak ada Ibu'),
((SELECT id FROM ahli_waris WHERE kode='nenek_ayah'), '1/6',
  '{"requires_absence_of":["ibu"]}',
  'Nenek jalur ayah, sama seperti nenek jalur ibu, dibagi rata jika keduanya ada'),
((SELECT id FROM ahli_waris WHERE kode='cucu_pr'), '1/6',
  '{"requires_presence_of_exact":{"anak_pr":1}, "requires_absence_of":["anak_lk","cucu_lk_sederajat_atau_lebih_rendah"]}',
  'Cucu perempuan pelengkap 2/3 jika ada tepat 1 anak perempuan'),
((SELECT id FROM ahli_waris WHERE kode='saudari_seayah'), '1/6',
  '{"requires_presence_of_exact":{"saudari_kandung":1}, "requires_absence_of":["saudara_lk_seayah","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
  'Saudari seayah pelengkap 2/3 jika ada tepat 1 saudari sekandung'),
((SELECT id FROM ahli_waris WHERE kode='saudara_lk_seibu'), '1/6',
  '{"syarat_jumlah_tunggal":true, "digabung_dengan":"saudari_seibu_jika_ada"}',
  '1 saudara seibu (sendiri) dapat 1/6'),
((SELECT id FROM ahli_waris WHERE kode='saudari_seibu'), '1/6',
  '{"syarat_jumlah_tunggal":true, "digabung_dengan":"saudara_lk_seibu_jika_ada"}',
  '1 saudari seibu (sendiri) dapat 1/6');
```

### 6.3 `hijab_hirman_rule`

```sql
INSERT INTO hijab_hirman_rule (penghalang_id, terhalang_id, keterangan) VALUES
-- Ibu menghalangi semua Nenek
((SELECT id FROM ahli_waris WHERE kode='ibu'), (SELECT id FROM ahli_waris WHERE kode='nenek_ibu'), 'Ibu menghalangi Nenek jalur ibu'),
((SELECT id FROM ahli_waris WHERE kode='ibu'), (SELECT id FROM ahli_waris WHERE kode='nenek_ayah'), 'Ibu menghalangi Nenek jalur ayah'),

-- Ayah menghalangi Kakek & semua Saudara/i
((SELECT id FROM ahli_waris WHERE kode='ayah'), (SELECT id FROM ahli_waris WHERE kode='kakek'), 'Ayah menghalangi Kakek'),
((SELECT id FROM ahli_waris WHERE kode='ayah'), (SELECT id FROM ahli_waris WHERE kode='saudara_lk_kandung'), NULL),
((SELECT id FROM ahli_waris WHERE kode='ayah'), (SELECT id FROM ahli_waris WHERE kode='saudari_kandung'), NULL),
((SELECT id FROM ahli_waris WHERE kode='ayah'), (SELECT id FROM ahli_waris WHERE kode='saudara_lk_seayah'), NULL),
((SELECT id FROM ahli_waris WHERE kode='ayah'), (SELECT id FROM ahli_waris WHERE kode='saudari_seayah'), NULL),
((SELECT id FROM ahli_waris WHERE kode='ayah'), (SELECT id FROM ahli_waris WHERE kode='saudara_lk_seibu'), NULL),
((SELECT id FROM ahli_waris WHERE kode='ayah'), (SELECT id FROM ahli_waris WHERE kode='saudari_seibu'), NULL),

-- Kakek menghalangi saudara/i seibu (posisi seperti Ayah, hanya berlaku jika Ayah tak ada)
((SELECT id FROM ahli_waris WHERE kode='kakek'), (SELECT id FROM ahli_waris WHERE kode='saudara_lk_seibu'), 'Berlaku jika Ayah tidak ada'),
((SELECT id FROM ahli_waris WHERE kode='kakek'), (SELECT id FROM ahli_waris WHERE kode='saudari_seibu'), 'Berlaku jika Ayah tidak ada'),

-- Anak laki-laki & Cucu laki-laki menghalangi semua Cucu (di bawahnya) & semua saudara/i seibu
((SELECT id FROM ahli_waris WHERE kode='anak_lk'), (SELECT id FROM ahli_waris WHERE kode='cucu_lk'), NULL),
((SELECT id FROM ahli_waris WHERE kode='anak_lk'), (SELECT id FROM ahli_waris WHERE kode='cucu_pr'), 'Kecuali jika ada mu-ashib sederajat (jarang, ditangani terpisah)'),
((SELECT id FROM ahli_waris WHERE kode='anak_lk'), (SELECT id FROM ahli_waris WHERE kode='saudara_lk_seibu'), NULL),
((SELECT id FROM ahli_waris WHERE kode='anak_lk'), (SELECT id FROM ahli_waris WHERE kode='saudari_seibu'), NULL),
((SELECT id FROM ahli_waris WHERE kode='anak_pr'), (SELECT id FROM ahli_waris WHERE kode='saudara_lk_seibu'), 'Anak (walau perempuan) tetap menghalangi saudara/i seibu'),
((SELECT id FROM ahli_waris WHERE kode='anak_pr'), (SELECT id FROM ahli_waris WHERE kode='saudari_seibu'), NULL),

-- 2 anak perempuan (atau lebih) menghalangi Cucu perempuan yang sederajat/lebih rendah (kecuali ada mu-ashib)
((SELECT id FROM ahli_waris WHERE kode='anak_pr'), (SELECT id FROM ahli_waris WHERE kode='cucu_pr'), 'Berlaku jika anak_pr berjumlah 2+ DAN tidak ada mu-ashib (cucu laki-laki sederajat/lebih rendah)'),

-- Saudari sekandung (3 lengkap, dapat 2/3) menghalangi Saudari seayah, kecuali ada saudara laki-laki seayah
((SELECT id FROM ahli_waris WHERE kode='saudari_kandung'), (SELECT id FROM ahli_waris WHERE kode='saudari_seayah'), 'Berlaku jika saudari_kandung 3+ (sudah dapat 2/3 penuh) DAN tidak ada saudara_lk_seayah');
```

### 6.4 `hijab_nuqshan_rule`

```sql
INSERT INTO hijab_nuqshan_rule (penyebab_id, terdampak_id, pecahan_awal, pecahan_baru, keterangan) VALUES
((SELECT id FROM ahli_waris WHERE kode='anak_lk'), (SELECT id FROM ahli_waris WHERE kode='suami'), '1/2', '1/4', 'Ada anak/cucu → suami turun jadi 1/4'),
((SELECT id FROM ahli_waris WHERE kode='anak_pr'), (SELECT id FROM ahli_waris WHERE kode='suami'), '1/2', '1/4', 'sama, via anak perempuan'),
((SELECT id FROM ahli_waris WHERE kode='anak_lk'), (SELECT id FROM ahli_waris WHERE kode='istri'), '1/4', '1/8', 'Ada anak/cucu → istri turun jadi 1/8'),
((SELECT id FROM ahli_waris WHERE kode='anak_pr'), (SELECT id FROM ahli_waris WHERE kode='istri'), '1/4', '1/8', 'sama, via anak perempuan'),
((SELECT id FROM ahli_waris WHERE kode='anak_lk'), (SELECT id FROM ahli_waris WHERE kode='ibu'), '1/3', '1/6', 'Ada anak/cucu → ibu turun jadi 1/6'),
((SELECT id FROM ahli_waris WHERE kode='saudara_lk_kandung'), (SELECT id FROM ahli_waris WHERE kode='ibu'), '1/3', '1/6', 'Ada 2+ saudara/i → ibu turun jadi 1/6 (berlaku utk semua jenis saudara, syarat_kondisi jumlah gabungan >=2)');
```

### 6.5 `ashabah_rule`

```sql
-- bin_nafsih (urutan sudah di kolom ahli_waris.urutan_ashabah, di sini cukup deklarasi jenis)
INSERT INTO ashabah_rule (ahli_waris_id, jenis, urutan_prioritas) 
SELECT id, 'bin_nafsih', urutan_ashabah FROM ahli_waris WHERE urutan_ashabah IS NOT NULL;

-- bil_ghair (ditarik laki-laki sederajat, rasio 2:1)
INSERT INTO ashabah_rule (ahli_waris_id, jenis, pasangan_penarik_id, rasio) VALUES
((SELECT id FROM ahli_waris WHERE kode='anak_pr'), 'bil_ghair', (SELECT id FROM ahli_waris WHERE kode='anak_lk'), '2:1'),
((SELECT id FROM ahli_waris WHERE kode='cucu_pr'), 'bil_ghair', (SELECT id FROM ahli_waris WHERE kode='cucu_lk'), '2:1'),
((SELECT id FROM ahli_waris WHERE kode='saudari_kandung'), 'bil_ghair', (SELECT id FROM ahli_waris WHERE kode='saudara_lk_kandung'), '2:1'),
((SELECT id FROM ahli_waris WHERE kode='saudari_seayah'), 'bil_ghair', (SELECT id FROM ahli_waris WHERE kode='saudara_lk_seayah'), '2:1');

-- maal_ghair (jadi ashabah krn bersama furudh lain, bukan ditarik laki-laki sederajat)
INSERT INTO ashabah_rule (ahli_waris_id, jenis, syarat_kondisi) VALUES
((SELECT id FROM ahli_waris WHERE kode='saudari_kandung'), 'maal_ghair',
  '{"requires_presence_of_any":["anak_pr","cucu_pr"], "requires_absence_of":["saudara_lk_kandung","saudara_lk_seayah","anak_lk","cucu_lk"]}'),
((SELECT id FROM ahli_waris WHERE kode='saudari_seayah'), 'maal_ghair',
  '{"requires_presence_of_any":["anak_pr","cucu_pr"], "requires_absence_of":["saudara_lk_kandung","saudara_lk_seayah","saudari_kandung","anak_lk","cucu_lk"]}');
```

### 6.6 `asal_masalah_dasar` & `aul_rule`

```sql
INSERT INTO asal_masalah_dasar (nilai, kategori, keterangan) VALUES
(2, 'shahihah', 'Basis 1/2'),
(3, 'shahihah', 'Basis 1/3 & 2/3'),
(4, 'shahihah', 'Basis 1/4'),
(8, 'shahihah', 'Basis 1/8'),
(6, 'aailah', 'Basis gabungan 1/2,1/3,1/6 dll — bisa aul'),
(12, 'aailah', 'Basis gabungan 1/4 dengan 1/3 atau 1/6 — bisa aul'),
(24, 'aailah', 'Basis gabungan 1/8 dengan 1/3 atau 1/6 — bisa aul');

INSERT INTO aul_rule (asal_masalah, nilai_aul_mungkin) VALUES
(6,7),(6,8),(6,9),(6,10),
(12,13),(12,15),(12,17),
(24,27);
```

### 6.7 `radd_rule`

```sql
INSERT INTO radd_rule (ahli_waris_id, berhak_radd, syarat_pengecualian) 
SELECT id, TRUE, NULL FROM ahli_waris 
WHERE kode IN ('anak_pr','cucu_pr','ayah','kakek','ibu','nenek_ibu','nenek_ayah',
                'saudara_lk_seibu','saudari_seibu','saudari_kandung','saudari_seayah');

INSERT INTO radd_rule (ahli_waris_id, berhak_radd, syarat_pengecualian) VALUES
((SELECT id FROM ahli_waris WHERE kode='suami'), FALSE, 
  '{"pengecualian":"berhak radd jika tidak ada dzawil arham/ahli waris lain sama sekali"}'),
((SELECT id FROM ahli_waris WHERE kode='istri'), FALSE, 
  '{"pengecualian":"berhak radd jika tidak ada dzawil arham/ahli waris lain sama sekali"}');
```

### 6.8 `kasus_khusus`

```sql
INSERT INTO kasus_khusus (kode, nama, pemicu_kondisi, aturan_khusus) VALUES
('gharrawain', 'Al-Gharrawain / Al-Umariyyatain',
  '{"harus_ada":["ibu","ayah"], "harus_ada_salah_satu":["suami","istri"], "tidak_ada":["anak_lk","anak_pr","cucu_lk","cucu_pr","saudara_2_atau_lebih_gabungan"]}',
  'Ibu tidak dapat 1/3 dari total, tapi 1/3 dari SISA setelah bagian suami/istri diambil. Ayah ambil ashabah (sisa akhir).'),
('musytarakah', 'Al-Musytarakah / Al-Himariyah',
  '{"harus_ada":["suami","ibu","saudara_lk_kandung_atau_saudari_kandung"], "syarat_jumlah_gabungan_seibu_min":2}',
  'Saudara/i sekandung ikut berbagi rata dalam porsi 1/3 bersama saudara/i seibu, meski secara asal saudara sekandung laki-laki semestinya ashabah.');
```

---

## BAGIAN 7 — CONTOH QUERY MEMBACA ATURAN (untuk mesin hitung)

```sql
-- Ambil semua kemungkinan furudh untuk 1 ahli waris tertentu
SELECT * FROM furudh_rule WHERE ahli_waris_id = (SELECT id FROM ahli_waris WHERE kode='ibu');

-- Cek siapa saja yang dihalangi total oleh Ayah
SELECT aw.nama_id AS terhalang
FROM hijab_hirman_rule h
JOIN ahli_waris aw ON aw.id = h.terhalang_id
WHERE h.penghalang_id = (SELECT id FROM ahli_waris WHERE kode='ayah');

-- Ambil urutan ashabah bin-nafsih (dipakai saat >1 ashabah hadir, yang urutan terkecil menang)
SELECT aw.nama_id, ar.urutan_prioritas
FROM ashabah_rule ar
JOIN ahli_waris aw ON aw.id = ar.ahli_waris_id
WHERE ar.jenis = 'bin_nafsih'
ORDER BY ar.urutan_prioritas ASC;
```

---

## Selanjutnya

Berikutnya tinggal 2 hal untuk versi awal (MVP) siap dipakai:
1. **Pseudocode/algoritma mesin hitung** — saya bisa tulis versi PHP atau JavaScript langsung (tinggal pilih), mengikuti urutan Bagian 3.4 & membaca tabel-tabel di atas.
2. **Kumpulan soal contoh dari kitab** (Bagian latihan tiap pelajaran) sebagai *test case* — supaya begitu mesin hitung jadi, tinggal dicocokkan hasilnya dengan kunci jawaban di kitab.

Mau saya lanjut ke pseudocode/algoritma dulu (bahasa apa — PHP karena rencana XAMPP, atau JS/Node kalau condong ke Supabase)?
