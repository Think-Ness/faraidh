// ============================================================
// TYPE DEFINITIONS — Sistem Faraidh
// ============================================================

export interface AhliWaris {
  id: number
  kode: string
  nama_arab: string
  nama_id: string
  jenis_kelamin: 'L' | 'P'
  kelompok: string
  tidak_pernah_gugur: boolean
  urutan_ashabah: number | null
  keterangan?: string
}

export interface FurudhRule {
  id: number
  ahli_waris_id: number
  pecahan: string
  syarat_jumlah_min?: number | null
  syarat_jumlah_max?: number | null
  syarat_kondisi: Record<string, unknown>
  keterangan?: string
}

export interface HijabHirmanRule {
  id: number
  penghalang_id: number
  terhalang_id: number
  syarat_kondisi?: Record<string, unknown>
  keterangan?: string
}

export interface HijabNuqshanRule {
  id: number
  penyebab_id: number
  terdampak_id: number
  pecahan_awal: string
  pecahan_baru: string
  keterangan?: string
}

export interface AshabahRule {
  id: number
  ahli_waris_id: number
  jenis: 'bin_nafsih' | 'bil_ghair' | 'maal_ghair'
  pasangan_penarik_id?: number | null
  rasio?: string | null
  urutan_prioritas?: number | null
  syarat_kondisi?: Record<string, unknown> | null
}

export interface KasusKhusus {
  id: number
  kode: string
  nama: string
  pemicu_kondisi: Record<string, unknown>
  aturan_khusus: string
}

// ============================================================
// INPUT USER
// ============================================================

export type HalanganWaris = 'tidak_ada' | 'budak' | 'pembunuh' | 'beda_agama'

export interface InputAhliWaris {
  kode: string
  jumlah_orang: number
  halangan: HalanganWaris
}

export interface InputKasus {
  nama_pewaris?: string
  harta_kotor: number
  biaya_tajhiz: number
  hutang_terikat: number
  hutang_biasa: number
  wasiat: number
  ahli_waris_list: InputAhliWaris[]
}

// ============================================================
// OUTPUT / HASIL
// ============================================================

export type StatusHasil =
  | 'furudh'
  | 'ashabah_bin_nafsih'
  | 'ashabah_bil_ghair'
  | 'ashabah_maal_ghair'
  | 'radd'
  | 'gugur_halangan'
  | 'gugur_hijab'
  | 'kasus_khusus'

export interface HasilPerAhliWaris {
  kode: string
  nama_id: string
  nama_arab: string
  jenis_kelamin: 'L' | 'P'
  jumlah_orang: number
  status: StatusHasil
  pecahan?: string
  saham_per_orang?: number
  saham_total_kelompok?: number
  nominal_per_orang?: number
  nominal_total_kelompok?: number
  keterangan?: string
  alasan_gugur?: string
}

export type StatusPenyelesaian = 'adilah' | 'aul' | 'radd' | 'tashih' | 'kasus_khusus'

export interface LogEdukasi {
  fase: number
  judul: string
  judul_arab?: string
  penjelasan: string
  detail?: string[]
}

export interface HasilKalkulasi {
  // Tirkah
  harta_kotor: number
  biaya_tajhiz: number
  hutang_terikat: number
  hutang_biasa: number
  wasiat: number
  total_harta_bersih: number

  // Kasus Khusus (jika ada)
  kasus_khusus_aktif?: string

  // Asal Masalah
  asal_masalah: number
  asal_masalah_tashih: number
  juz_sahm: number
  status_penyelesaian: StatusPenyelesaian

  // Hasil per ahli waris
  hasil: HasilPerAhliWaris[]

  // Log edukasi langkah demi langkah
  log_edukasi: LogEdukasi[]
}

// ============================================================
// PECAHAN HELPER
// ============================================================

export interface Pecahan {
  pembilang: number
  penyebut: number
}

export const parsePecahan = (str: string): Pecahan => {
  const parts = str.split('/')
  return { pembilang: parseInt(parts[0]), penyebut: parseInt(parts[1]) }
}

export const formatRupiah = (angka: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka)
}

export const formatAngka = (angka: number): string => {
  return new Intl.NumberFormat('id-ID').format(angka)
}
