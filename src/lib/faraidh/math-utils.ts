// ============================================================
// MATH UTILITIES — Faraidh Engine
// Implementasi FPB, KPK, dan relasi matematis untuk Tashih
// ============================================================

/**
 * GCD (Greatest Common Divisor) / FPB
 * Menggunakan algoritma Euclidean
 */
export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

/**
 * LCM (Least Common Multiple) / KPK
 */
export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0
  return Math.abs(a * b) / gcd(a, b)
}

/**
 * KPK dari array angka
 */
export function lcmArray(arr: number[]): number {
  if (arr.length === 0) return 1
  return arr.reduce((acc, val) => lcm(acc, val), 1)
}

/**
 * Relasi matematis antara Saham dan Jumlah Kepala
 * untuk keperluan Tashih al-Masail
 *
 * Returns:
 * - 'tamatsul'  → Saham == Jumlah Kepala (sama persis)
 * - 'tadakhul'  → Salah satu faktor dari yang lain
 * - 'tawafuq'   → Ada FPB > 1 (bisa disederhanakan)
 * - 'tabayun'   → FPB = 1 (tidak ada hubungan)
 */
export type RelasiMatematis = 'tamatsul' | 'tadakhul' | 'tawafuq' | 'tabayun'

export function relasiMatematis(saham: number, kepala: number): RelasiMatematis {
  if (saham === kepala) return 'tamatsul'
  if (kepala % saham === 0 || saham % kepala === 0) return 'tadakhul'
  if (gcd(saham, kepala) > 1) return 'tawafuq'
  return 'tabayun'
}

/**
 * Hitung mahfudzat (nilai yang disimpan ke array untuk KPK akhir)
 * dari tiap kelompok ahli waris yang share-nya tidak habis dibagi
 */
export function hitungMahfudzat(saham: number, kepala: number): number {
  const relasi = relasiMatematis(saham, kepala)
  switch (relasi) {
    case 'tamatsul':
      return 1  // Tidak perlu penambahan, langsung 1
    case 'tadakhul':
      return Math.max(saham, kepala) / Math.min(saham, kepala)
    case 'tawafuq':
      return kepala / gcd(saham, kepala)
    case 'tabayun':
      return kepala
  }
}

/**
 * Parser pecahan string → angka
 */
export function pecahanKeDesimal(pecahan: string): number {
  if (pecahan.includes('/')) {
    const [p, q] = pecahan.split('/').map(Number)
    return p / q
  }
  return parseFloat(pecahan)
}

export function pecahanKeSaham(pecahan: string, asalMasalah: number): number {
  const [p, q] = pecahan.split('/').map(Number)
  return Math.round((p / q) * asalMasalah)
}

/**
 * Validasi: Wasiat tidak boleh > 1/3 dari (harta setelah tajhiz dan hutang)
 */
export function validasiWasiat(
  harta_kotor: number,
  tajhiz: number,
  hutang_terikat: number,
  hutang_biasa: number,
  wasiat: number
): { valid: boolean; maks_wasiat: number; pesan?: string } {
  const setelah_tajhiz_hutang = harta_kotor - tajhiz - hutang_terikat - hutang_biasa
  const maks_wasiat = setelah_tajhiz_hutang / 3
  if (wasiat > maks_wasiat) {
    return {
      valid: false,
      maks_wasiat,
      pesan: `Wasiat (${wasiat.toLocaleString('id-ID')}) melebihi 1/3 dari harta setelah Tajhiz & Hutang (${maks_wasiat.toLocaleString('id-ID')}). Wasiat otomatis dibatasi.`,
    }
  }
  return { valid: true, maks_wasiat }
}

/**
 * Hitung total harta bersih (yang diwariskan)
 */
export function hitungHartaBersih(
  harta_kotor: number,
  tajhiz: number,
  hutang_terikat: number,
  hutang_biasa: number,
  wasiat: number
): number {
  const setelah_tajhiz_hutang = harta_kotor - tajhiz - hutang_terikat - hutang_biasa
  const wasiat_efektif = Math.min(wasiat, setelah_tajhiz_hutang / 3)
  return Math.max(0, setelah_tajhiz_hutang - wasiat_efektif)
}

/**
 * Tentukan Asal Masalah berdasarkan kelompok pecahan
 * Kelompok 1 (K1): 1/2, 1/4, 1/8
 * Kelompok 2 (K2): 2/3, 1/3, 1/6
 */
export function hitungAsalMasalah(pecahan_list: string[]): number {
  const k1 = ['1/2', '1/4', '1/8']
  const k2 = ['2/3', '1/3', '1/6']

  const ada_k1 = pecahan_list.some(p => k1.includes(p))
  const ada_k2 = pecahan_list.some(p => k2.includes(p))

  const penyebut_k1 = pecahan_list
    .filter(p => k1.includes(p))
    .map(p => parseInt(p.split('/')[1]))
  const penyebut_k2 = pecahan_list
    .filter(p => k2.includes(p))
    .map(p => parseInt(p.split('/')[1]))

  const max_k1 = penyebut_k1.length > 0 ? Math.max(...penyebut_k1) : 0
  const max_k2 = penyebut_k2.length > 0 ? Math.max(...penyebut_k2) : 0

  if (!ada_k1 && !ada_k2) return 1  // murni ashabah
  if (ada_k1 && !ada_k2) return max_k1
  if (!ada_k1 && ada_k2) return max_k2

  // Gabungan K1 + K2
  if (max_k1 === 2) return 6   // 1/2 + K2
  if (max_k1 === 4) return 12  // 1/4 + K2
  if (max_k1 === 8) return 24  // 1/8 + K2
  return 6
}
