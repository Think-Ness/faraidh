// ============================================================
// SEED RULES LOKAL — Fallback jika Supabase belum dikonfigurasi
// Data ini IDENTIK dengan isi database Supabase setelah schema.sql dijalankan
// ============================================================

import type {
  AhliWaris,
  FurudhRule,
  HijabHirmanRule,
  HijabNuqshanRule,
  AshabahRule,
  KasusKhusus,
} from '@/lib/faraidh/types'

// ─── AHLI WARIS ───────────────────────────────────────────
export const AHLI_WARIS: AhliWaris[] = [
  { id: 1,  kode: 'anak_lk',              nama_arab: 'الابن',              nama_id: 'Anak Laki-laki',                       jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: true,  urutan_ashabah: 1 },
  { id: 2,  kode: 'cucu_lk',              nama_arab: 'ابن الابن',           nama_id: 'Cucu Laki-laki (dari anak laki-laki)', jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 2 },
  { id: 3,  kode: 'ayah',                 nama_arab: 'الأب',               nama_id: 'Ayah',                                 jenis_kelamin: 'L', kelompok: 'furudh',             tidak_pernah_gugur: true,  urutan_ashabah: 3 },
  { id: 4,  kode: 'kakek',                nama_arab: 'الجد الصحيح',        nama_id: 'Kakek Shahih (jalur ayah)',             jenis_kelamin: 'L', kelompok: 'furudh',             tidak_pernah_gugur: false, urutan_ashabah: 4 },
  { id: 5,  kode: 'saudara_lk_kandung',   nama_arab: 'الأخ الشقيق',        nama_id: 'Saudara Laki-laki Sekandung',          jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 5 },
  { id: 6,  kode: 'saudara_lk_seayah',    nama_arab: 'الأخ لأب',           nama_id: 'Saudara Laki-laki Seayah',             jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 6 },
  { id: 7,  kode: 'saudara_lk_seibu',     nama_arab: 'الأخ لأم',           nama_id: 'Saudara Laki-laki Seibu',              jenis_kelamin: 'L', kelompok: 'furudh',             tidak_pernah_gugur: false, urutan_ashabah: null },
  { id: 8,  kode: 'keponakan_lk_kandung', nama_arab: 'ابن الأخ الشقيق',    nama_id: 'Anak Laki-laki Saudara Sekandung',     jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 7 },
  { id: 9,  kode: 'keponakan_lk_seayah',  nama_arab: 'ابن الأخ لأب',       nama_id: 'Anak Laki-laki Saudara Seayah',        jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 8 },
  { id: 10, kode: 'paman_kandung',         nama_arab: 'العم الشقيق',        nama_id: 'Paman Sekandung (dari ayah)',           jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 9 },
  { id: 11, kode: 'paman_seayah',          nama_arab: 'العم لأب',           nama_id: 'Paman Seayah (dari ayah)',              jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 10 },
  { id: 12, kode: 'sepupu_lk_paman_kandung', nama_arab: 'ابن العم الشقيق',  nama_id: 'Anak Laki-laki Paman Sekandung',       jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 11 },
  { id: 13, kode: 'sepupu_lk_paman_seayah',  nama_arab: 'ابن العم لأب',     nama_id: 'Anak Laki-laki Paman Seayah',          jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 12 },
  { id: 14, kode: 'suami',                 nama_arab: 'الزوج',              nama_id: 'Suami',                                jenis_kelamin: 'L', kelompok: 'furudh',             tidak_pernah_gugur: true,  urutan_ashabah: null },
  { id: 15, kode: 'mutiq',                 nama_arab: 'المعتِق',            nama_id: 'Yang Memerdekakan Budak (laki-laki)',   jenis_kelamin: 'L', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: 13 },
  { id: 16, kode: 'anak_pr',              nama_arab: 'البنت',              nama_id: 'Anak Perempuan',                       jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: true,  urutan_ashabah: null },
  { id: 17, kode: 'cucu_pr',              nama_arab: 'بنت الابن',          nama_id: 'Cucu Perempuan (dari anak laki-laki)', jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: false, urutan_ashabah: null },
  { id: 18, kode: 'ibu',                  nama_arab: 'الأم',               nama_id: 'Ibu',                                  jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: true,  urutan_ashabah: null },
  { id: 19, kode: 'nenek_ibu',            nama_arab: 'الجدة من الأم',      nama_id: 'Nenek dari Jalur Ibu',                 jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: false, urutan_ashabah: null },
  { id: 20, kode: 'nenek_ayah',           nama_arab: 'الجدة من الأب',      nama_id: 'Nenek dari Jalur Ayah',                jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: false, urutan_ashabah: null },
  { id: 21, kode: 'saudari_kandung',      nama_arab: 'الأخت الشقيقة',      nama_id: 'Saudari Sekandung',                    jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: false, urutan_ashabah: null },
  { id: 22, kode: 'saudari_seayah',       nama_arab: 'الأخت لأب',          nama_id: 'Saudari Seayah',                       jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: false, urutan_ashabah: null },
  { id: 23, kode: 'saudari_seibu',        nama_arab: 'الأخت لأم',          nama_id: 'Saudari Seibu',                        jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: false, urutan_ashabah: null },
  { id: 24, kode: 'istri',                nama_arab: 'الزوجة',             nama_id: 'Istri',                                jenis_kelamin: 'P', kelompok: 'furudh',             tidak_pernah_gugur: true,  urutan_ashabah: null },
  { id: 25, kode: 'mutiqah',              nama_arab: 'المعتِقة',           nama_id: 'Yang Memerdekakan Budak (perempuan)',   jenis_kelamin: 'P', kelompok: 'ashabah_bin_nafsih', tidak_pernah_gugur: false, urutan_ashabah: null },
]

const ID = (kode: string) => AHLI_WARIS.find(a => a.kode === kode)!.id

// ─── FURUDH RULES ─────────────────────────────────────────
export const FURUDH_RULES: FurudhRule[] = [
  // 1/2
  { id: 1, ahli_waris_id: ID('suami'), pecahan: '1/2', syarat_jumlah_min: 1, syarat_jumlah_max: 1, syarat_kondisi: { requires_absence_of: ['anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: 'Suami 1/2 jika tanpa anak/cucu' },
  { id: 2, ahli_waris_id: ID('anak_pr'), pecahan: '1/2', syarat_jumlah_min: 1, syarat_jumlah_max: 1, syarat_kondisi: { requires_absence_of: ['anak_lk'] }, keterangan: 'Anak perempuan tunggal' },
  { id: 3, ahli_waris_id: ID('cucu_pr'), pecahan: '1/2', syarat_jumlah_min: 1, syarat_jumlah_max: 1, syarat_kondisi: { requires_absence_of: ['anak_lk','anak_pr','cucu_lk'] }, keterangan: 'Cucu perempuan tunggal' },
  { id: 4, ahli_waris_id: ID('saudari_kandung'), pecahan: '1/2', syarat_jumlah_min: 1, syarat_jumlah_max: 1, syarat_kondisi: { requires_absence_of: ['saudara_lk_kandung','ayah','kakek','anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: 'Saudari kandung tunggal' },
  { id: 5, ahli_waris_id: ID('saudari_seayah'), pecahan: '1/2', syarat_jumlah_min: 1, syarat_jumlah_max: 1, syarat_kondisi: { requires_absence_of: ['saudara_lk_seayah','saudara_lk_kandung','saudari_kandung','ayah','kakek','anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: 'Saudari seayah tunggal' },
  // 1/4
  { id: 6, ahli_waris_id: ID('suami'), pecahan: '1/4', syarat_kondisi: { requires_presence_of_any: ['anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: 'Suami 1/4 jika ada anak/cucu' },
  { id: 7, ahli_waris_id: ID('istri'), pecahan: '1/4', syarat_kondisi: { requires_absence_of: ['anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: 'Istri 1/4 tanpa anak/cucu' },
  // 1/8
  { id: 8, ahli_waris_id: ID('istri'), pecahan: '1/8', syarat_kondisi: { requires_presence_of_any: ['anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: 'Istri 1/8 jika ada anak/cucu' },
  // 2/3
  { id: 9,  ahli_waris_id: ID('anak_pr'), pecahan: '2/3', syarat_jumlah_min: 2, syarat_kondisi: { requires_absence_of: ['anak_lk'] }, keterangan: '2+ anak perempuan' },
  { id: 10, ahli_waris_id: ID('cucu_pr'), pecahan: '2/3', syarat_jumlah_min: 2, syarat_kondisi: { requires_absence_of: ['anak_lk','anak_pr','cucu_lk'] }, keterangan: '2+ cucu perempuan' },
  { id: 11, ahli_waris_id: ID('saudari_kandung'), pecahan: '2/3', syarat_jumlah_min: 2, syarat_kondisi: { requires_absence_of: ['saudara_lk_kandung','ayah','kakek','anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: '2+ saudari kandung' },
  { id: 12, ahli_waris_id: ID('saudari_seayah'), pecahan: '2/3', syarat_jumlah_min: 2, syarat_kondisi: { requires_absence_of: ['saudara_lk_seayah','saudara_lk_kandung','saudari_kandung','ayah','kakek','anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: '2+ saudari seayah' },
  // 1/3
  { id: 13, ahli_waris_id: ID('ibu'), pecahan: '1/3', syarat_kondisi: { requires_absence_of: ['anak_lk','anak_pr','cucu_lk','cucu_pr'], requires_saudara_max: 1 }, keterangan: 'Ibu 1/3 tanpa anak/cucu & < 2 saudara/i' },
  { id: 14, ahli_waris_id: ID('saudara_lk_seibu'), pecahan: '1/3_gabungan', syarat_jumlah_min: 2, syarat_kondisi: { gabung_dengan: 'saudari_seibu', pembagian: 'rata' }, keterangan: '2+ saudara/i seibu berbagi 1/3' },
  { id: 15, ahli_waris_id: ID('saudari_seibu'), pecahan: '1/3_gabungan', syarat_jumlah_min: 2, syarat_kondisi: { gabung_dengan: 'saudara_lk_seibu', pembagian: 'rata' }, keterangan: '2+ saudara/i seibu berbagi 1/3' },
  // 1/6
  { id: 16, ahli_waris_id: ID('ibu'), pecahan: '1/6', syarat_kondisi: { requires_presence_of_any: ['anak_lk','anak_pr','cucu_lk','cucu_pr'], or_requires_saudara_min: 2 }, keterangan: 'Ibu 1/6 jika ada anak/cucu atau 2+ saudara/i' },
  { id: 17, ahli_waris_id: ID('ayah'), pecahan: '1/6', syarat_kondisi: { requires_presence_of_any: ['anak_lk','cucu_lk'] }, keterangan: 'Ayah 1/6 jika ada anak/cucu laki-laki' },
  { id: 18, ahli_waris_id: ID('kakek'), pecahan: '1/6', syarat_kondisi: { requires_presence_of_any: ['anak_lk','cucu_lk'], requires_absence_of: ['ayah'] }, keterangan: 'Kakek 1/6 jika tidak ada ayah' },
  { id: 19, ahli_waris_id: ID('nenek_ibu'), pecahan: '1/6', syarat_kondisi: { requires_absence_of: ['ibu'] }, keterangan: 'Nenek jalur ibu 1/6' },
  { id: 20, ahli_waris_id: ID('nenek_ayah'), pecahan: '1/6', syarat_kondisi: { requires_absence_of: ['ibu'] }, keterangan: 'Nenek jalur ayah 1/6' },
  { id: 21, ahli_waris_id: ID('cucu_pr'), pecahan: '1/6', syarat_kondisi: { requires_presence_of_exact: { anak_pr: 1 }, requires_absence_of: ['anak_lk','cucu_lk'] }, keterangan: 'Cucu perempuan pelengkap 2/3' },
  { id: 22, ahli_waris_id: ID('saudari_seayah'), pecahan: '1/6', syarat_kondisi: { requires_presence_of_exact: { saudari_kandung: 1 }, requires_absence_of: ['saudara_lk_seayah','ayah','kakek','anak_lk','anak_pr','cucu_lk','cucu_pr'] }, keterangan: 'Saudari seayah pelengkap 2/3' },
  { id: 23, ahli_waris_id: ID('saudara_lk_seibu'), pecahan: '1/6', syarat_kondisi: { syarat_jumlah_tunggal: true }, keterangan: 'Saudara seibu tunggal 1/6' },
  { id: 24, ahli_waris_id: ID('saudari_seibu'), pecahan: '1/6', syarat_kondisi: { syarat_jumlah_tunggal: true }, keterangan: 'Saudari seibu tunggal 1/6' },
]

// ─── HIJAB HIRMAN RULES ────────────────────────────────────
const hh = (p: string, t: string, ket?: string): HijabHirmanRule => ({
  id: 0, penghalang_id: ID(p), terhalang_id: ID(t), keterangan: ket
})

export const HIJAB_HIRMAN_RULES: HijabHirmanRule[] = [
  hh('ibu','nenek_ibu','Ibu → Nenek ibu'),
  hh('ibu','nenek_ayah','Ibu → Nenek ayah'),
  hh('ayah','kakek'), hh('ayah','saudara_lk_kandung'), hh('ayah','saudari_kandung'),
  hh('ayah','saudara_lk_seayah'), hh('ayah','saudari_seayah'),
  hh('ayah','saudara_lk_seibu'), hh('ayah','saudari_seibu'),
  hh('kakek','saudara_lk_seibu'), hh('kakek','saudari_seibu'),
  hh('anak_lk','cucu_lk'), hh('anak_lk','cucu_pr'),
  hh('anak_lk','saudara_lk_kandung'), hh('anak_lk','saudari_kandung'),
  hh('anak_lk','saudara_lk_seayah'), hh('anak_lk','saudari_seayah'),
  hh('anak_lk','saudara_lk_seibu'), hh('anak_lk','saudari_seibu'),
  hh('anak_lk','keponakan_lk_kandung'), hh('anak_lk','keponakan_lk_seayah'),
  hh('anak_lk','paman_kandung'), hh('anak_lk','paman_seayah'),
  hh('anak_lk','sepupu_lk_paman_kandung'), hh('anak_lk','sepupu_lk_paman_seayah'),
  hh('cucu_lk','saudara_lk_kandung'), hh('cucu_lk','saudari_kandung'),
  hh('cucu_lk','saudara_lk_seayah'), hh('cucu_lk','saudari_seayah'),
  hh('cucu_lk','saudara_lk_seibu'), hh('cucu_lk','saudari_seibu'),
  hh('anak_pr','saudara_lk_seibu'), hh('anak_pr','saudari_seibu'), hh('anak_pr','cucu_pr'),
  hh('saudara_lk_kandung','saudara_lk_seayah'), hh('saudara_lk_kandung','saudari_seayah'),
  hh('saudara_lk_kandung','keponakan_lk_kandung'), hh('saudara_lk_kandung','keponakan_lk_seayah'),
  hh('saudara_lk_kandung','paman_kandung'), hh('saudara_lk_kandung','paman_seayah'),
  hh('saudara_lk_seayah','keponakan_lk_kandung'), hh('saudara_lk_seayah','keponakan_lk_seayah'),
  hh('saudara_lk_seayah','paman_kandung'), hh('saudara_lk_seayah','paman_seayah'),
  hh('keponakan_lk_kandung','keponakan_lk_seayah'),
  hh('keponakan_lk_kandung','paman_kandung'), hh('keponakan_lk_kandung','paman_seayah'),
  hh('keponakan_lk_seayah','paman_kandung'), hh('keponakan_lk_seayah','paman_seayah'),
  hh('paman_kandung','paman_seayah'),
  hh('paman_kandung','sepupu_lk_paman_kandung'), hh('paman_kandung','sepupu_lk_paman_seayah'),
  hh('paman_seayah','sepupu_lk_paman_kandung'), hh('paman_seayah','sepupu_lk_paman_seayah'),
  hh('sepupu_lk_paman_kandung','sepupu_lk_paman_seayah'),
].map((r, i) => ({ ...r, id: i + 1 }))

// ─── HIJAB NUQSHAN RULES ──────────────────────────────────
export const HIJAB_NUQSHAN_RULES: HijabNuqshanRule[] = [
  { id: 1, penyebab_id: ID('anak_lk'), terdampak_id: ID('suami'), pecahan_awal: '1/2', pecahan_baru: '1/4', keterangan: 'Ada anak laki-laki → suami turun' },
  { id: 2, penyebab_id: ID('anak_pr'), terdampak_id: ID('suami'), pecahan_awal: '1/2', pecahan_baru: '1/4', keterangan: 'Ada anak perempuan → suami turun' },
  { id: 3, penyebab_id: ID('cucu_lk'), terdampak_id: ID('suami'), pecahan_awal: '1/2', pecahan_baru: '1/4', keterangan: 'Ada cucu laki-laki → suami turun' },
  { id: 4, penyebab_id: ID('cucu_pr'), terdampak_id: ID('suami'), pecahan_awal: '1/2', pecahan_baru: '1/4', keterangan: 'Ada cucu perempuan → suami turun' },
  { id: 5, penyebab_id: ID('anak_lk'), terdampak_id: ID('istri'), pecahan_awal: '1/4', pecahan_baru: '1/8', keterangan: 'Ada anak laki-laki → istri turun' },
  { id: 6, penyebab_id: ID('anak_pr'), terdampak_id: ID('istri'), pecahan_awal: '1/4', pecahan_baru: '1/8', keterangan: 'Ada anak perempuan → istri turun' },
  { id: 7, penyebab_id: ID('cucu_lk'), terdampak_id: ID('istri'), pecahan_awal: '1/4', pecahan_baru: '1/8', keterangan: 'Ada cucu laki-laki → istri turun' },
  { id: 8, penyebab_id: ID('cucu_pr'), terdampak_id: ID('istri'), pecahan_awal: '1/4', pecahan_baru: '1/8', keterangan: 'Ada cucu perempuan → istri turun' },
  { id: 9,  penyebab_id: ID('anak_lk'), terdampak_id: ID('ibu'), pecahan_awal: '1/3', pecahan_baru: '1/6', keterangan: 'Ada anak → ibu turun' },
  { id: 10, penyebab_id: ID('anak_pr'), terdampak_id: ID('ibu'), pecahan_awal: '1/3', pecahan_baru: '1/6', keterangan: 'Ada anak perempuan → ibu turun' },
  { id: 11, penyebab_id: ID('cucu_lk'), terdampak_id: ID('ibu'), pecahan_awal: '1/3', pecahan_baru: '1/6', keterangan: 'Ada cucu → ibu turun' },
  { id: 12, penyebab_id: ID('cucu_pr'), terdampak_id: ID('ibu'), pecahan_awal: '1/3', pecahan_baru: '1/6', keterangan: 'Ada cucu perempuan → ibu turun' },
]

// ─── ASHABAH RULES ────────────────────────────────────────
export const ASHABAH_RULES: AshabahRule[] = [
  // bin_nafsih
  { id: 1, ahli_waris_id: ID('anak_lk'), jenis: 'bin_nafsih', urutan_prioritas: 1 },
  { id: 2, ahli_waris_id: ID('cucu_lk'), jenis: 'bin_nafsih', urutan_prioritas: 2 },
  { id: 3, ahli_waris_id: ID('ayah'), jenis: 'bin_nafsih', urutan_prioritas: 3 },
  { id: 4, ahli_waris_id: ID('kakek'), jenis: 'bin_nafsih', urutan_prioritas: 4 },
  { id: 5, ahli_waris_id: ID('saudara_lk_kandung'), jenis: 'bin_nafsih', urutan_prioritas: 5 },
  { id: 6, ahli_waris_id: ID('saudara_lk_seayah'), jenis: 'bin_nafsih', urutan_prioritas: 6 },
  { id: 7, ahli_waris_id: ID('keponakan_lk_kandung'), jenis: 'bin_nafsih', urutan_prioritas: 7 },
  { id: 8, ahli_waris_id: ID('keponakan_lk_seayah'), jenis: 'bin_nafsih', urutan_prioritas: 8 },
  { id: 9, ahli_waris_id: ID('paman_kandung'), jenis: 'bin_nafsih', urutan_prioritas: 9 },
  { id: 10, ahli_waris_id: ID('paman_seayah'), jenis: 'bin_nafsih', urutan_prioritas: 10 },
  { id: 11, ahli_waris_id: ID('sepupu_lk_paman_kandung'), jenis: 'bin_nafsih', urutan_prioritas: 11 },
  { id: 12, ahli_waris_id: ID('sepupu_lk_paman_seayah'), jenis: 'bin_nafsih', urutan_prioritas: 12 },
  { id: 13, ahli_waris_id: ID('mutiq'), jenis: 'bin_nafsih', urutan_prioritas: 13 },
  // bil_ghair
  { id: 14, ahli_waris_id: ID('anak_pr'), jenis: 'bil_ghair', pasangan_penarik_id: ID('anak_lk'), rasio: '2:1' },
  { id: 15, ahli_waris_id: ID('cucu_pr'), jenis: 'bil_ghair', pasangan_penarik_id: ID('cucu_lk'), rasio: '2:1' },
  { id: 16, ahli_waris_id: ID('saudari_kandung'), jenis: 'bil_ghair', pasangan_penarik_id: ID('saudara_lk_kandung'), rasio: '2:1' },
  { id: 17, ahli_waris_id: ID('saudari_seayah'), jenis: 'bil_ghair', pasangan_penarik_id: ID('saudara_lk_seayah'), rasio: '2:1' },
  // maal_ghair
  { id: 18, ahli_waris_id: ID('saudari_kandung'), jenis: 'maal_ghair', syarat_kondisi: { requires_presence_of_any: ['anak_pr','cucu_pr'], requires_absence_of: ['saudara_lk_kandung','anak_lk','cucu_lk'] } },
  { id: 19, ahli_waris_id: ID('saudari_seayah'), jenis: 'maal_ghair', syarat_kondisi: { requires_presence_of_any: ['anak_pr','cucu_pr'], requires_absence_of: ['saudara_lk_seayah','saudara_lk_kandung','saudari_kandung','anak_lk','cucu_lk'] } },
]

// ─── KASUS KHUSUS ─────────────────────────────────────────
export const KASUS_KHUSUS: KasusKhusus[] = [
  {
    id: 1,
    kode: 'gharrawain',
    nama: 'Al-Gharrawain (Al-Umariyyatain)',
    pemicu_kondisi: {},
    aturan_khusus: 'Ibu mendapat 1/3 dari SISA (bukan dari total). Suami/Istri ambil bagiannya lebih dulu, baru Ibu dapat 1/3 dari sisa itu. Ayah mengambil ashabah (sisa akhir).',
  },
  {
    id: 2,
    kode: 'musytarakah',
    nama: 'Al-Musytarakah (Al-Himariyah)',
    pemicu_kondisi: {},
    aturan_khusus: 'Saudara/i sekandung ikut berbagi rata dalam porsi 1/3 bersama saudara/i seibu.',
  },
  {
    id: 3,
    kode: 'akdariyyah',
    nama: 'Al-Akdariyyah',
    pemicu_kondisi: {},
    aturan_khusus: "Suami 1/2, Ibu 1/3, Kakek 1/6, Saudari Kandung 1/2. Total → 'Aul ke 9. Porsi Kakek+Saudari digabung dibagi 2:1.",
  },
]

// ─── EXPORT BUNDLE ────────────────────────────────────────
export const SEED_RULES = {
  ahli_waris: AHLI_WARIS,
  furudh_rules: FURUDH_RULES,
  hijab_hirman_rules: HIJAB_HIRMAN_RULES,
  hijab_nuqshan_rules: HIJAB_NUQSHAN_RULES,
  ashabah_rules: ASHABAH_RULES,
  kasus_khusus: KASUS_KHUSUS,
}
