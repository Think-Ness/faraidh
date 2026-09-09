-- ============================================================
-- SISTEM FARAIDH — SCHEMA SUPABASE (PostgreSQL)
-- Berdasarkan Kitab Ilmu Faraidh Kelas 3 KMI Gontor
-- ============================================================
-- Jalankan file ini di Supabase SQL Editor secara berurutan.
-- ============================================================

-- Reset tabel jika sebelumnya sudah pernah dibuat sebagian (Clean Reset)
DROP TABLE IF EXISTS hasil_perhitungan, kasus_ahli_waris, kasus, radd_rule, aul_rule, asal_masalah_dasar, kasus_khusus, ashabah_rule, hijab_nuqshan_rule, hijab_hirman_rule, furudh_rule, ahli_waris CASCADE;

-- 1. MASTER AHLI WARIS (25 baris tetap)
CREATE TABLE IF NOT EXISTS ahli_waris (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(50) UNIQUE NOT NULL,
    nama_arab VARCHAR(120) NOT NULL,
    nama_id VARCHAR(120) NOT NULL,
    jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L','P')) NOT NULL,
    kelompok VARCHAR(50) NOT NULL,
    tidak_pernah_gugur BOOLEAN DEFAULT FALSE,
    urutan_ashabah INT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. ATURAN FURUDH (bagian pasti — Rules Engine)
CREATE TABLE IF NOT EXISTS furudh_rule (
    id SERIAL PRIMARY KEY,
    ahli_waris_id INT REFERENCES ahli_waris(id) ON DELETE CASCADE,
    pecahan VARCHAR(30) NOT NULL,     -- '1/2', '1/4', '1/8', '2/3', '1/3', '1/6', '1/3_gabungan'
    syarat_jumlah_min INT NULL,       -- jumlah minimum ahli waris ini agar aturan berlaku
    syarat_jumlah_max INT NULL,
    syarat_kondisi JSONB NOT NULL DEFAULT '{}',
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. ATURAN HIJAB HIRMAN (gugur total)
CREATE TABLE IF NOT EXISTS hijab_hirman_rule (
    id SERIAL PRIMARY KEY,
    penghalang_id INT REFERENCES ahli_waris(id) ON DELETE CASCADE,
    terhalang_id INT REFERENCES ahli_waris(id) ON DELETE CASCADE,
    syarat_kondisi JSONB DEFAULT '{}', -- syarat tambahan (misal: berlaku jika jumlah penghalang >= N)
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. ATURAN HIJAB NUQSHAN (berkurang bagian)
CREATE TABLE IF NOT EXISTS hijab_nuqshan_rule (
    id SERIAL PRIMARY KEY,
    penyebab_id INT REFERENCES ahli_waris(id) ON DELETE CASCADE,
    terdampak_id INT REFERENCES ahli_waris(id) ON DELETE CASCADE,
    pecahan_awal VARCHAR(30) NOT NULL,
    pecahan_baru VARCHAR(30) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. ATURAN ASHABAH
CREATE TABLE IF NOT EXISTS ashabah_rule (
    id SERIAL PRIMARY KEY,
    ahli_waris_id INT REFERENCES ahli_waris(id) ON DELETE CASCADE,
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('bin_nafsih','bil_ghair','maal_ghair')),
    pasangan_penarik_id INT NULL REFERENCES ahli_waris(id),
    rasio VARCHAR(10) NULL,           -- '2:1' untuk bil_ghair
    urutan_prioritas INT NULL,
    syarat_kondisi JSONB NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. KASUS KHUSUS (Override dari logika normal)
CREATE TABLE IF NOT EXISTS kasus_khusus (
    id SERIAL PRIMARY KEY,
    kode VARCHAR(40) UNIQUE NOT NULL,
    nama VARCHAR(120) NOT NULL,
    pemicu_kondisi JSONB NOT NULL,
    aturan_khusus TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. ASAL MASALAH DASAR
CREATE TABLE IF NOT EXISTS asal_masalah_dasar (
    id SERIAL PRIMARY KEY,
    nilai INT NOT NULL UNIQUE,
    kategori VARCHAR(20) NOT NULL,    -- 'shahihah' atau 'aailah'
    keterangan TEXT
);

-- 8. KEMUNGKINAN 'AUL
CREATE TABLE IF NOT EXISTS aul_rule (
    id SERIAL PRIMARY KEY,
    asal_masalah INT NOT NULL,
    nilai_aul_mungkin INT NOT NULL
);

-- 9. ATURAN RADD
CREATE TABLE IF NOT EXISTS radd_rule (
    id SERIAL PRIMARY KEY,
    ahli_waris_id INT UNIQUE REFERENCES ahli_waris(id) ON DELETE CASCADE,
    berhak_radd BOOLEAN NOT NULL DEFAULT TRUE,
    syarat_pengecualian JSONB NULL
);

-- ============================================================
-- TABEL TRANSAKSI (Input user tiap kali pakai web)
-- ============================================================

-- 10. KASUS (Satu sesi perhitungan)
CREATE TABLE IF NOT EXISTS kasus (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_pewaris VARCHAR(200),
    harta_kotor DECIMAL(20,2) NOT NULL DEFAULT 0,
    biaya_tajhiz DECIMAL(20,2) NOT NULL DEFAULT 0,
    hutang_terikat DECIMAL(20,2) NOT NULL DEFAULT 0,
    hutang_biasa DECIMAL(20,2) NOT NULL DEFAULT 0,
    wasiat DECIMAL(20,2) NOT NULL DEFAULT 0,
    total_harta_bersih DECIMAL(20,2) NOT NULL,
    asal_masalah INT NULL,
    asal_masalah_tashih INT NULL,
    status_penyelesaian VARCHAR(20) NULL,  -- 'adilah', 'aul', 'radd', 'tashih'
    juz_sahm INT NULL DEFAULT 1,
    dibuat_pada TIMESTAMP DEFAULT NOW()
);

-- 11. AHLI WARIS PER KASUS
CREATE TABLE IF NOT EXISTS kasus_ahli_waris (
    id SERIAL PRIMARY KEY,
    kasus_id UUID REFERENCES kasus(id) ON DELETE CASCADE,
    ahli_waris_id INT REFERENCES ahli_waris(id),
    jumlah_orang INT NOT NULL DEFAULT 1,
    halangan_waris VARCHAR(20) NOT NULL DEFAULT 'tidak_ada'
        CHECK (halangan_waris IN ('tidak_ada','budak','pembunuh','beda_agama')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 12. HASIL PERHITUNGAN PER AHLI WARIS
CREATE TABLE IF NOT EXISTS hasil_perhitungan (
    id SERIAL PRIMARY KEY,
    kasus_id UUID REFERENCES kasus(id) ON DELETE CASCADE,
    ahli_waris_id INT REFERENCES ahli_waris(id),
    jumlah_orang INT NOT NULL DEFAULT 1,
    status_hasil VARCHAR(30) NOT NULL,
        -- 'furudh', 'ashabah_bin_nafsih', 'ashabah_bil_ghair', 'ashabah_maal_ghair',
        -- 'radd', 'gugur_halangan', 'gugur_hijab', 'kasus_khusus'
    pecahan VARCHAR(30) NULL,
    saham_per_orang DECIMAL(15,4) NULL,
    saham_total_kelompok DECIMAL(15,4) NULL,
    nominal_per_orang DECIMAL(20,2) NULL,
    nominal_total_kelompok DECIMAL(20,2) NULL,
    keterangan TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Tabel referensi: publik baca, admin saja tulis
ALTER TABLE ahli_waris ENABLE ROW LEVEL SECURITY;
ALTER TABLE furudh_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE hijab_hirman_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE hijab_nuqshan_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE ashabah_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE kasus_khusus ENABLE ROW LEVEL SECURITY;
ALTER TABLE asal_masalah_dasar ENABLE ROW LEVEL SECURITY;
ALTER TABLE aul_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE radd_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE kasus ENABLE ROW LEVEL SECURITY;
ALTER TABLE kasus_ahli_waris ENABLE ROW LEVEL SECURITY;
ALTER TABLE hasil_perhitungan ENABLE ROW LEVEL SECURITY;

-- Policy: semua orang bisa baca tabel referensi
CREATE POLICY "public read ahli_waris" ON ahli_waris FOR SELECT USING (true);
CREATE POLICY "public read furudh_rule" ON furudh_rule FOR SELECT USING (true);
CREATE POLICY "public read hijab_hirman_rule" ON hijab_hirman_rule FOR SELECT USING (true);
CREATE POLICY "public read hijab_nuqshan_rule" ON hijab_nuqshan_rule FOR SELECT USING (true);
CREATE POLICY "public read ashabah_rule" ON ashabah_rule FOR SELECT USING (true);
CREATE POLICY "public read kasus_khusus" ON kasus_khusus FOR SELECT USING (true);
CREATE POLICY "public read asal_masalah_dasar" ON asal_masalah_dasar FOR SELECT USING (true);
CREATE POLICY "public read aul_rule" ON aul_rule FOR SELECT USING (true);
CREATE POLICY "public read radd_rule" ON radd_rule FOR SELECT USING (true);

-- Policy: kasus & hasil: insert & select bebas (publik kalkulator tanpa auth)
CREATE POLICY "public insert kasus" ON kasus FOR INSERT WITH CHECK (true);
CREATE POLICY "public select kasus" ON kasus FOR SELECT USING (true);
CREATE POLICY "public insert kasus_ahli_waris" ON kasus_ahli_waris FOR INSERT WITH CHECK (true);
CREATE POLICY "public select kasus_ahli_waris" ON kasus_ahli_waris FOR SELECT USING (true);
CREATE POLICY "public insert hasil_perhitungan" ON hasil_perhitungan FOR INSERT WITH CHECK (true);
CREATE POLICY "public select hasil_perhitungan" ON hasil_perhitungan FOR SELECT USING (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- AHLI WARIS (25)
INSERT INTO ahli_waris (kode, nama_arab, nama_id, jenis_kelamin, kelompok, tidak_pernah_gugur, urutan_ashabah) VALUES
('anak_lk',              'الابن',              'Anak Laki-laki',                       'L', 'ashabah_bin_nafsih', TRUE,  1),
('cucu_lk',              'ابن الابن',           'Cucu Laki-laki (dari anak laki-laki)', 'L', 'ashabah_bin_nafsih', FALSE, 2),
('ayah',                 'الأب',               'Ayah',                                 'L', 'furudh',             TRUE,  3),
('kakek',                'الجد الصحيح',        'Kakek Shahih (jalur ayah)',             'L', 'furudh',             FALSE, 4),
('saudara_lk_kandung',   'الأخ الشقيق',        'Saudara Laki-laki Sekandung',          'L', 'ashabah_bin_nafsih', FALSE, 5),
('saudara_lk_seayah',    'الأخ لأب',           'Saudara Laki-laki Seayah',             'L', 'ashabah_bin_nafsih', FALSE, 6),
('saudara_lk_seibu',     'الأخ لأم',           'Saudara Laki-laki Seibu',              'L', 'furudh',             FALSE, NULL),
('keponakan_lk_kandung', 'ابن الأخ الشقيق',    'Anak Laki-laki Saudara Sekandung',     'L', 'ashabah_bin_nafsih', FALSE, 7),
('keponakan_lk_seayah',  'ابن الأخ لأب',       'Anak Laki-laki Saudara Seayah',        'L', 'ashabah_bin_nafsih', FALSE, 8),
('paman_kandung',        'العم الشقيق',        'Paman Sekandung (dari ayah)',           'L', 'ashabah_bin_nafsih', FALSE, 9),
('paman_seayah',         'العم لأب',           'Paman Seayah (dari ayah)',              'L', 'ashabah_bin_nafsih', FALSE, 10),
('sepupu_lk_paman_kandung','ابن العم الشقيق',  'Anak Laki-laki Paman Sekandung',       'L', 'ashabah_bin_nafsih', FALSE, 11),
('sepupu_lk_paman_seayah','ابن العم لأب',      'Anak Laki-laki Paman Seayah',          'L', 'ashabah_bin_nafsih', FALSE, 12),
('suami',                'الزوج',              'Suami',                                'L', 'furudh',             TRUE,  NULL),
('mutiq',                'المعتِق',            'Yang Memerdekakan Budak (laki-laki)',   'L', 'ashabah_bin_nafsih', FALSE, 13),
('anak_pr',              'البنت',              'Anak Perempuan',                       'P', 'furudh',             TRUE,  NULL),
('cucu_pr',              'بنت الابن',          'Cucu Perempuan (dari anak laki-laki)', 'P', 'furudh',             FALSE, NULL),
('ibu',                  'الأم',               'Ibu',                                  'P', 'furudh',             TRUE,  NULL),
('nenek_ibu',            'الجدة من الأم',      'Nenek dari Jalur Ibu',                 'P', 'furudh',             FALSE, NULL),
('nenek_ayah',           'الجدة من الأب',      'Nenek dari Jalur Ayah',                'P', 'furudh',             FALSE, NULL),
('saudari_kandung',      'الأخت الشقيقة',      'Saudari Sekandung',                    'P', 'furudh',             FALSE, NULL),
('saudari_seayah',       'الأخت لأب',          'Saudari Seayah',                       'P', 'furudh',             FALSE, NULL),
('saudari_seibu',        'الأخت لأم',          'Saudari Seibu',                        'P', 'furudh',             FALSE, NULL),
('istri',                'الزوجة',             'Istri',                                'P', 'furudh',             TRUE,  NULL),
('mutiqah',              'المعتِقة',           'Yang Memerdekakan Budak (perempuan)',   'P', 'ashabah_bin_nafsih', FALSE, NULL)
ON CONFLICT (kode) DO NOTHING;

-- FURUDH RULE: 1/2
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_jumlah_max, syarat_kondisi, keterangan)
SELECT id, '1/2', 1, 1, '{"requires_absence_of":["anak_lk","anak_pr","cucu_lk","cucu_pr"]}', 'Suami dapat 1/2 jika istri tidak punya anak/cucu'
FROM ahli_waris WHERE kode='suami';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_jumlah_max, syarat_kondisi, keterangan)
SELECT id, '1/2', 1, 1, '{"requires_absence_of":["anak_lk"]}', 'Anak perempuan tunggal, tanpa saudara laki-laki'
FROM ahli_waris WHERE kode='anak_pr';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_jumlah_max, syarat_kondisi, keterangan)
SELECT id, '1/2', 1, 1, '{"requires_absence_of":["anak_lk","anak_pr","cucu_lk"]}', 'Cucu perempuan tunggal, tanpa mu-ashib & tanpa anak pewaris'
FROM ahli_waris WHERE kode='cucu_pr';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_jumlah_max, syarat_kondisi, keterangan)
SELECT id, '1/2', 1, 1, '{"requires_absence_of":["saudara_lk_kandung","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}', 'Saudari sekandung tunggal'
FROM ahli_waris WHERE kode='saudari_kandung';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_jumlah_max, syarat_kondisi, keterangan)
SELECT id, '1/2', 1, 1, '{"requires_absence_of":["saudara_lk_seayah","saudara_lk_kandung","saudari_kandung","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}', 'Saudari seayah tunggal'
FROM ahli_waris WHERE kode='saudari_seayah';

-- FURUDH RULE: 1/4
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/4', '{"requires_presence_of_any":["anak_lk","anak_pr","cucu_lk","cucu_pr"]}', 'Suami dapat 1/4 jika ada anak/cucu'
FROM ahli_waris WHERE kode='suami';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/4', '{"requires_absence_of":["anak_lk","anak_pr","cucu_lk","cucu_pr"]}', 'Istri dapat 1/4 jika suami tidak punya anak/cucu'
FROM ahli_waris WHERE kode='istri';

-- FURUDH RULE: 1/8
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/8', '{"requires_presence_of_any":["anak_lk","anak_pr","cucu_lk","cucu_pr"]}', 'Istri dapat 1/8 jika ada anak/cucu'
FROM ahli_waris WHERE kode='istri';

-- FURUDH RULE: 2/3
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_kondisi, keterangan)
SELECT id, '2/3', 2, '{"requires_absence_of":["anak_lk"]}', '2+ anak perempuan tanpa saudara laki-laki'
FROM ahli_waris WHERE kode='anak_pr';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_kondisi, keterangan)
SELECT id, '2/3', 2, '{"requires_absence_of":["anak_lk","anak_pr","cucu_lk"]}', '2+ cucu perempuan tanpa mu-ashib/anak'
FROM ahli_waris WHERE kode='cucu_pr';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_kondisi, keterangan)
SELECT id, '2/3', 2, '{"requires_absence_of":["saudara_lk_kandung","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}', '2+ saudari sekandung'
FROM ahli_waris WHERE kode='saudari_kandung';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_kondisi, keterangan)
SELECT id, '2/3', 2, '{"requires_absence_of":["saudara_lk_seayah","saudara_lk_kandung","saudari_kandung","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}', '2+ saudari seayah'
FROM ahli_waris WHERE kode='saudari_seayah';

-- FURUDH RULE: 1/3
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/3', '{"requires_absence_of":["anak_lk","anak_pr","cucu_lk","cucu_pr"],"requires_saudara_max":1}', 'Ibu dapat 1/3 jika tidak ada anak/cucu & tidak ada 2+ saudara/i'
FROM ahli_waris WHERE kode='ibu';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_kondisi, keterangan)
SELECT id, '1/3_gabungan', 2, '{"gabung_dengan":"saudari_seibu","pembagian":"rata"}', '2+ saudara/i seibu berbagi rata 1/3'
FROM ahli_waris WHERE kode='saudara_lk_seibu';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_jumlah_min, syarat_kondisi, keterangan)
SELECT id, '1/3_gabungan', 2, '{"gabung_dengan":"saudara_lk_seibu","pembagian":"rata"}', '2+ saudara/i seibu berbagi rata 1/3'
FROM ahli_waris WHERE kode='saudari_seibu';

-- FURUDH RULE: 1/6
INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"requires_presence_of_any":["anak_lk","anak_pr","cucu_lk","cucu_pr"],"or_requires_saudara_min":2}', 'Ibu dapat 1/6 jika ada anak/cucu atau 2+ saudara/i'
FROM ahli_waris WHERE kode='ibu';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"requires_presence_of_any":["anak_lk","cucu_lk"]}', 'Ayah dapat 1/6 jika ada anak/cucu laki-laki'
FROM ahli_waris WHERE kode='ayah';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"requires_presence_of_any":["anak_lk","cucu_lk"],"requires_absence_of":["ayah"]}', 'Kakek dapat 1/6 jika ada anak/cucu laki-laki dan tidak ada ayah'
FROM ahli_waris WHERE kode='kakek';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"requires_absence_of":["ibu"]}', 'Nenek jalur ibu dapat 1/6 jika tidak ada ibu'
FROM ahli_waris WHERE kode='nenek_ibu';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"requires_absence_of":["ibu"]}', 'Nenek jalur ayah dapat 1/6 jika tidak ada ibu'
FROM ahli_waris WHERE kode='nenek_ayah';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"requires_presence_of_exact":{"anak_pr":1},"requires_absence_of":["anak_lk","cucu_lk"]}', 'Cucu perempuan pelengkap 2/3 jika ada 1 anak perempuan'
FROM ahli_waris WHERE kode='cucu_pr';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"requires_presence_of_exact":{"saudari_kandung":1},"requires_absence_of":["saudara_lk_seayah","ayah","kakek","anak_lk","anak_pr","cucu_lk","cucu_pr"]}', 'Saudari seayah pelengkap 2/3 jika ada 1 saudari sekandung'
FROM ahli_waris WHERE kode='saudari_seayah';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"syarat_jumlah_tunggal":true}', 'Saudara laki-laki seibu tunggal dapat 1/6'
FROM ahli_waris WHERE kode='saudara_lk_seibu';

INSERT INTO furudh_rule (ahli_waris_id, pecahan, syarat_kondisi, keterangan)
SELECT id, '1/6', '{"syarat_jumlah_tunggal":true}', 'Saudari seibu tunggal dapat 1/6'
FROM ahli_waris WHERE kode='saudari_seibu';

-- HIJAB HIRMAN RULE
INSERT INTO hijab_hirman_rule (penghalang_id, terhalang_id, keterangan)
SELECT p.id, t.id, k.ket
FROM (VALUES
  ('ibu','nenek_ibu','Ibu menghalangi Nenek jalur ibu'),
  ('ibu','nenek_ayah','Ibu menghalangi Nenek jalur ayah'),
  ('ayah','kakek','Ayah menghalangi Kakek'),
  ('ayah','saudara_lk_kandung','Ayah menghalangi Saudara sekandung'),
  ('ayah','saudari_kandung','Ayah menghalangi Saudari sekandung'),
  ('ayah','saudara_lk_seayah','Ayah menghalangi Saudara seayah'),
  ('ayah','saudari_seayah','Ayah menghalangi Saudari seayah'),
  ('ayah','saudara_lk_seibu','Ayah menghalangi Saudara seibu'),
  ('ayah','saudari_seibu','Ayah menghalangi Saudari seibu'),
  ('kakek','saudara_lk_seibu','Kakek menghalangi Saudara seibu (jika Ayah tidak ada)'),
  ('kakek','saudari_seibu','Kakek menghalangi Saudari seibu (jika Ayah tidak ada)'),
  ('anak_lk','cucu_lk','Anak laki-laki menghalangi Cucu laki-laki'),
  ('anak_lk','cucu_pr','Anak laki-laki menghalangi Cucu perempuan'),
  ('anak_lk','saudara_lk_kandung','Anak laki-laki menghalangi Saudara sekandung'),
  ('anak_lk','saudari_kandung','Anak laki-laki menghalangi Saudari sekandung'),
  ('anak_lk','saudara_lk_seayah','Anak laki-laki menghalangi Saudara seayah'),
  ('anak_lk','saudari_seayah','Anak laki-laki menghalangi Saudari seayah'),
  ('anak_lk','saudara_lk_seibu','Anak laki-laki menghalangi Saudara seibu'),
  ('anak_lk','saudari_seibu','Anak laki-laki menghalangi Saudari seibu'),
  ('anak_lk','keponakan_lk_kandung','Anak laki-laki menghalangi Keponakan'),
  ('anak_lk','keponakan_lk_seayah','Anak laki-laki menghalangi Keponakan seayah'),
  ('anak_lk','paman_kandung','Anak laki-laki menghalangi Paman'),
  ('anak_lk','paman_seayah','Anak laki-laki menghalangi Paman seayah'),
  ('anak_lk','sepupu_lk_paman_kandung','Anak laki-laki menghalangi Sepupu'),
  ('anak_lk','sepupu_lk_paman_seayah','Anak laki-laki menghalangi Sepupu seayah'),
  ('cucu_lk','saudara_lk_kandung','Cucu laki-laki menghalangi Saudara sekandung'),
  ('cucu_lk','saudari_kandung','Cucu laki-laki menghalangi Saudari sekandung'),
  ('cucu_lk','saudara_lk_seayah','Cucu laki-laki menghalangi Saudara seayah'),
  ('cucu_lk','saudari_seayah','Cucu laki-laki menghalangi Saudari seayah'),
  ('cucu_lk','saudara_lk_seibu','Cucu laki-laki menghalangi Saudara seibu'),
  ('cucu_lk','saudari_seibu','Cucu laki-laki menghalangi Saudari seibu'),
  ('anak_pr','saudara_lk_seibu','Anak perempuan menghalangi Saudara seibu'),
  ('anak_pr','saudari_seibu','Anak perempuan menghalangi Saudari seibu'),
  ('saudara_lk_kandung','saudara_lk_seayah','Saudara sekandung menghalangi Saudara seayah'),
  ('saudara_lk_kandung','saudari_seayah','Saudara sekandung menghalangi Saudari seayah'),
  ('saudara_lk_kandung','keponakan_lk_kandung','Saudara sekandung menghalangi Keponakan sekandung'),
  ('saudara_lk_kandung','keponakan_lk_seayah','Saudara sekandung menghalangi Keponakan seayah'),
  ('saudara_lk_kandung','paman_kandung','Saudara sekandung menghalangi Paman'),
  ('saudara_lk_kandung','paman_seayah','Saudara sekandung menghalangi Paman seayah'),
  ('saudara_lk_seayah','keponakan_lk_kandung','Saudara seayah menghalangi Keponakan sekandung'),
  ('saudara_lk_seayah','keponakan_lk_seayah','Saudara seayah menghalangi Keponakan seayah'),
  ('saudara_lk_seayah','paman_kandung','Saudara seayah menghalangi Paman'),
  ('saudara_lk_seayah','paman_seayah','Saudara seayah menghalangi Paman seayah'),
  ('keponakan_lk_kandung','keponakan_lk_seayah','Keponakan sekandung menghalangi Keponakan seayah'),
  ('keponakan_lk_kandung','paman_kandung','Keponakan sekandung menghalangi Paman'),
  ('keponakan_lk_kandung','paman_seayah','Keponakan sekandung menghalangi Paman seayah'),
  ('keponakan_lk_seayah','paman_kandung','Keponakan seayah menghalangi Paman'),
  ('keponakan_lk_seayah','paman_seayah','Keponakan seayah menghalangi Paman seayah'),
  ('paman_kandung','paman_seayah','Paman sekandung menghalangi Paman seayah'),
  ('paman_kandung','sepupu_lk_paman_kandung','Paman sekandung menghalangi Sepupu paman sekandung'),
  ('paman_kandung','sepupu_lk_paman_seayah','Paman sekandung menghalangi Sepupu paman seayah'),
  ('paman_seayah','sepupu_lk_paman_kandung','Paman seayah menghalangi Sepupu paman sekandung'),
  ('paman_seayah','sepupu_lk_paman_seayah','Paman seayah menghalangi Sepupu paman seayah'),
  ('sepupu_lk_paman_kandung','sepupu_lk_paman_seayah','Sepupu kandung menghalangi Sepupu seayah')
) AS k(penghalang, terhalang, ket)
JOIN ahli_waris p ON p.kode = k.penghalang
JOIN ahli_waris t ON t.kode = k.terhalang;

-- HIJAB NUQSHAN RULE
INSERT INTO hijab_nuqshan_rule (penyebab_id, terdampak_id, pecahan_awal, pecahan_baru, keterangan)
SELECT p.id, t.id, k.pa, k.pb, k.ket
FROM (VALUES
  ('anak_lk','suami','1/2','1/4','Ada anak/cucu → suami turun jadi 1/4'),
  ('anak_pr','suami','1/2','1/4','Ada anak perempuan → suami turun jadi 1/4'),
  ('cucu_lk','suami','1/2','1/4','Ada cucu laki-laki → suami turun jadi 1/4'),
  ('cucu_pr','suami','1/2','1/4','Ada cucu perempuan → suami turun jadi 1/4'),
  ('anak_lk','istri','1/4','1/8','Ada anak/cucu → istri turun jadi 1/8'),
  ('anak_pr','istri','1/4','1/8','Ada anak perempuan → istri turun jadi 1/8'),
  ('cucu_lk','istri','1/4','1/8','Ada cucu laki-laki → istri turun jadi 1/8'),
  ('cucu_pr','istri','1/4','1/8','Ada cucu perempuan → istri turun jadi 1/8'),
  ('anak_lk','ibu','1/3','1/6','Ada anak/cucu → ibu turun jadi 1/6'),
  ('anak_pr','ibu','1/3','1/6','Ada anak perempuan → ibu turun jadi 1/6'),
  ('cucu_lk','ibu','1/3','1/6','Ada cucu → ibu turun jadi 1/6'),
  ('cucu_pr','ibu','1/3','1/6','Ada cucu perempuan → ibu turun jadi 1/6')
) AS k(penyebab, terdampak, pa, pb, ket)
JOIN ahli_waris p ON p.kode = k.penyebab
JOIN ahli_waris t ON t.kode = k.terdampak;

-- ASHABAH RULE (bin_nafsih)
INSERT INTO ashabah_rule (ahli_waris_id, jenis, urutan_prioritas)
SELECT id, 'bin_nafsih', urutan_ashabah FROM ahli_waris WHERE urutan_ashabah IS NOT NULL;

-- ASHABAH RULE (bil_ghair)
INSERT INTO ashabah_rule (ahli_waris_id, jenis, pasangan_penarik_id, rasio)
SELECT d.id, 'bil_ghair', p.id, '2:1'
FROM (VALUES
  ('anak_pr','anak_lk'),
  ('cucu_pr','cucu_lk'),
  ('saudari_kandung','saudara_lk_kandung'),
  ('saudari_seayah','saudara_lk_seayah')
) AS k(diri, penarik)
JOIN ahli_waris d ON d.kode = k.diri
JOIN ahli_waris p ON p.kode = k.penarik;

-- ASHABAH RULE (maal_ghair)
INSERT INTO ashabah_rule (ahli_waris_id, jenis, syarat_kondisi)
SELECT id, 'maal_ghair', '{"requires_presence_of_any":["anak_pr","cucu_pr"],"requires_absence_of":["saudara_lk_kandung","anak_lk","cucu_lk"]}'
FROM ahli_waris WHERE kode='saudari_kandung';

INSERT INTO ashabah_rule (ahli_waris_id, jenis, syarat_kondisi)
SELECT id, 'maal_ghair', '{"requires_presence_of_any":["anak_pr","cucu_pr"],"requires_absence_of":["saudara_lk_seayah","saudara_lk_kandung","saudari_kandung","anak_lk","cucu_lk"]}'
FROM ahli_waris WHERE kode='saudari_seayah';

-- ASAL MASALAH DASAR
INSERT INTO asal_masalah_dasar (nilai, kategori, keterangan) VALUES
(2,  'shahihah', 'Basis 1/2'),
(3,  'shahihah', 'Basis 1/3 & 2/3'),
(4,  'shahihah', 'Basis 1/4'),
(8,  'shahihah', 'Basis 1/8'),
(6,  'aailah',   'Basis gabungan 1/2, 1/3, 1/6 — bisa aul'),
(12, 'aailah',   'Basis gabungan 1/4 dengan 1/3 atau 1/6 — bisa aul'),
(24, 'aailah',   'Basis gabungan 1/8 dengan 1/3 atau 1/6 — bisa aul')
ON CONFLICT (nilai) DO NOTHING;

-- AUL RULE
INSERT INTO aul_rule (asal_masalah, nilai_aul_mungkin) VALUES
(6,7),(6,8),(6,9),(6,10),
(12,13),(12,15),(12,17),
(24,27);

-- RADD RULE
INSERT INTO radd_rule (ahli_waris_id, berhak_radd)
SELECT id, TRUE FROM ahli_waris
WHERE kode IN ('anak_pr','cucu_pr','ayah','kakek','ibu','nenek_ibu','nenek_ayah',
               'saudara_lk_seibu','saudari_seibu','saudari_kandung','saudari_seayah')
ON CONFLICT (ahli_waris_id) DO NOTHING;

INSERT INTO radd_rule (ahli_waris_id, berhak_radd, syarat_pengecualian)
SELECT id, FALSE, '{"pengecualian":"berhak radd hanya jika tidak ada ahli waris lain"}'
FROM ahli_waris WHERE kode='suami'
ON CONFLICT (ahli_waris_id) DO NOTHING;

INSERT INTO radd_rule (ahli_waris_id, berhak_radd, syarat_pengecualian)
SELECT id, FALSE, '{"pengecualian":"berhak radd hanya jika tidak ada ahli waris lain"}'
FROM ahli_waris WHERE kode='istri'
ON CONFLICT (ahli_waris_id) DO NOTHING;

-- KASUS KHUSUS
INSERT INTO kasus_khusus (kode, nama, pemicu_kondisi, aturan_khusus) VALUES
('gharrawain', 'Al-Gharrawain (Al-Umariyyatain)',
 '{"harus_ada":["ibu","ayah"],"harus_ada_salah_satu":["suami","istri"],"tidak_ada":["anak_lk","anak_pr","cucu_lk","cucu_pr","saudara_min2"]}',
 'Ibu mendapat 1/3 dari SISA (bukan dari total). Suami/Istri ambil bagiannya lebih dulu, baru Ibu dapat 1/3 dari sisa itu. Ayah mengambil ashabah (sisa akhir).'),
('musytarakah', 'Al-Musytarakah (Al-Himariyah)',
 '{"harus_ada":["suami","ibu"],"harus_ada_min2_seibu":true,"harus_ada":["saudara_lk_kandung"]}',
 'Saudara/i sekandung ikut berbagi rata dalam porsi 1/3 bersama saudara/i seibu. Suami 1/2, Ibu 1/6, sisanya (1/3) dibagi rata antara saudara/i seibu DAN saudara/i sekandung.'),
('akdariyyah', 'Al-Akdariyyah',
 '{"harus_ada":["suami","ibu","kakek","saudari_kandung"],"tidak_ada":["ayah","anak_lk","anak_pr","cucu_lk","cucu_pr"]}',
 'Kasus khusus Kakek & Saudari: Suami 1/2, Ibu 1/3, Kakek 1/6, Saudari Kandung 1/2. Total = 9/6 → Aul ke 9. Porsi Kakek (1/6 = 1 dari 9 saham) + Saudari Kandung (1/2 = 3 dari 9 saham) = 4 saham. Dibagi rasio 2:1 → Kakek 8/27 (tidak 1/6), Saudari 4/27 (tidak 1/2).')
ON CONFLICT (kode) DO NOTHING;
