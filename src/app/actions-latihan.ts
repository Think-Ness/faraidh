'use server'

import type {
  SoalBatch,
  SoalItem,
  SesiLatihan,
  JawabanSesi,
  SyubbakKunci,
  JawabanSyubbakSantri,
} from '@/lib/faraidh/types'
import { SEED_BATCHES_BUKU } from '@/data/seed-soal-buku'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// ─── Runtime Hybrid In-Memory Store ─────────────────────────────────────────
// Menjamin kestabilan create/update/delete soal, AI batch injection, dan session scoring
const runtimeState: {
  customBatches: SoalBatch[]
  customSoalMap: Record<string, SoalItem[]>
  sessionsMap: Record<string, { sesi: SesiLatihan; jawaban: JawabanSesi[] }>
} = {
  customBatches: [],
  customSoalMap: {},
  sessionsMap: {},
}

// Inisialisasi map soal dari seed jika belum ada
function ensureBatchSoalList(batchId: string): SoalItem[] {
  if (runtimeState.customSoalMap[batchId]) {
    return runtimeState.customSoalMap[batchId]
  }
  const seed = SEED_BATCHES_BUKU.find(s => s.id === batchId)
  if (seed) {
    runtimeState.customSoalMap[batchId] = JSON.parse(JSON.stringify(seed.soal_items))
    return runtimeState.customSoalMap[batchId]
  }
  runtimeState.customSoalMap[batchId] = []
  return runtimeState.customSoalMap[batchId]
}

// ─── Core Supabase Helpers ─────────────────────────────────────────────────

async function sbFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null
  try {
    const url = `${SUPABASE_URL}/rest/v1/${path}`
    const res = await fetch(url, {
      ...options,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(options?.headers || {}),
      },
    })
    if (!res.ok) {
      return null
    }
    if (res.status === 204) return null
    return res.json()
  } catch {
    return null
  }
}

// ─── BATCH SOAL Actions ────────────────────────────────────────────────────

export async function getBatchList(): Promise<(SoalBatch & {
  jumlah_soal: number
  jumlah_peserta: number
  top_skor: number
})[]> {
  const dbBatches = await sbFetch<SoalBatch[]>('soal_batch?select=*&order=created_at.desc', {
    next: { revalidate: 30 },
  })

  // Format seed batches
  const seedFormatted = SEED_BATCHES_BUKU.map(sb => {
    const currentSoal = ensureBatchSoalList(sb.id)
    const sessions = Object.values(runtimeState.sessionsMap)
      .map(s => s.sesi)
      .filter(s => s.batch_id === sb.id && s.is_selesai)
    const top_skor = sessions.length > 0
      ? Math.max(...sessions.map(s => Number(s.skor_persen || 0)))
      : 0
    return {
      id: sb.id,
      judul: sb.judul,
      deskripsi: sb.deskripsi,
      kelas_target: sb.kelas_target,
      is_active: sb.is_active,
      created_by: sb.created_by,
      created_at: sb.created_at,
      jumlah_soal: currentSoal.length,
      jumlah_peserta: sessions.length,
      top_skor,
    }
  })

  const customFormatted = runtimeState.customBatches.map(cb => {
    const currentSoal = ensureBatchSoalList(cb.id)
    const sessions = Object.values(runtimeState.sessionsMap)
      .map(s => s.sesi)
      .filter(s => s.batch_id === cb.id && s.is_selesai)
    const top_skor = sessions.length > 0
      ? Math.max(...sessions.map(s => Number(s.skor_persen || 0)))
      : 0
    return {
      ...cb,
      jumlah_soal: currentSoal.length,
      jumlah_peserta: sessions.length,
      top_skor,
    }
  })

  if (!dbBatches || dbBatches.length === 0) {
    const all = [...customFormatted, ...seedFormatted]
    const unique = new Map<string, typeof all[0]>()
    all.forEach(b => unique.set(b.id, b))
    return Array.from(unique.values())
  }

  // Fetch stats for DB batches
  const dbBatchesWithStats = await Promise.all(
    dbBatches.map(async (batch) => {
      const [soalRes, sesiRes] = await Promise.all([
        sbFetch<{ id: string }[]>(
          `soal_item?batch_id=eq.${batch.id}&select=id`,
          { next: { revalidate: 30 } }
        ),
        sbFetch<SesiLatihan[]>(
          `sesi_latihan?batch_id=eq.${batch.id}&is_selesai=eq.true&select=skor_persen&order=skor_persen.desc`,
          { next: { revalidate: 30 } }
        ),
      ])
      const localSoal = ensureBatchSoalList(batch.id)
      const jumlah_soal = Math.max(soalRes?.length || 0, localSoal.length)
      const sesiList = sesiRes || []
      const localSesi = Object.values(runtimeState.sessionsMap)
        .map(s => s.sesi)
        .filter(s => s.batch_id === batch.id && s.is_selesai)
      const totalSesi = [...sesiList, ...localSesi]
      const jumlah_peserta = totalSesi.length
      const top_skor = totalSesi.length > 0
        ? Math.max(...totalSesi.map((s) => Number(s.skor_persen || 0)))
        : 0

      return { ...batch, jumlah_soal, jumlah_peserta, top_skor }
    })
  )

  const existingIds = new Set(dbBatchesWithStats.map(b => b.id))
  const remainingCustom = customFormatted.filter(c => !existingIds.has(c.id))
  const remainingSeeds = seedFormatted.filter(s => !existingIds.has(s.id) && !remainingCustom.some(rc => rc.id === s.id))
  return [...dbBatchesWithStats, ...remainingCustom, ...remainingSeeds]
}

export async function getBatchDetail(batchId: string): Promise<{
  batch: SoalBatch | null
  soalList: SoalItem[]
}> {
  // Check runtime list first
  const localSoal = ensureBatchSoalList(batchId)

  // Check custom batches
  const customBatch = runtimeState.customBatches.find(b => b.id === batchId)
  if (customBatch) {
    return { batch: customBatch, soalList: localSoal }
  }

  // Check seed batches
  const seedMatch = SEED_BATCHES_BUKU.find(s => s.id === batchId)
  if (seedMatch) {
    return {
      batch: seedMatch,
      soalList: localSoal,
    }
  }

  const [batch, soalList] = await Promise.all([
    sbFetch<SoalBatch[]>(`soal_batch?id=eq.${batchId}&select=*`),
    sbFetch<SoalItem[]>(`soal_item?batch_id=eq.${batchId}&select=*&order=urutan`),
  ])

  const fetchedBatch = batch?.[0] || null
  const fetchedSoal = (soalList && soalList.length > 0) ? soalList : localSoal

  return {
    batch: fetchedBatch,
    soalList: fetchedSoal,
  }
}

export async function createBatch(data: {
  judul: string
  deskripsi?: string
  kelas_target?: string
  is_active?: boolean
}): Promise<SoalBatch | null> {
  const newBatch: SoalBatch = {
    id: 'batch-' + Date.now(),
    judul: data.judul,
    deskripsi: data.deskripsi || '',
    kelas_target: data.kelas_target || '',
    is_active: data.is_active ?? true,
    created_by: 'admin',
    created_at: new Date().toISOString(),
  }

  runtimeState.customBatches.unshift(newBatch)
  runtimeState.customSoalMap[newBatch.id] = []

  // Sync with Supabase in background
  sbFetch<SoalBatch[]>('soal_batch', {
    method: 'POST',
    body: JSON.stringify({ ...data, is_active: data.is_active ?? true }),
  }).catch(() => {})

  return newBatch
}

export async function updateBatch(
  id: string,
  data: Partial<{ judul: string; deskripsi: string; kelas_target: string; is_active: boolean }>
): Promise<SoalBatch | null> {
  // Update in runtime
  const idx = runtimeState.customBatches.findIndex(b => b.id === id)
  if (idx !== -1) {
    runtimeState.customBatches[idx] = { ...runtimeState.customBatches[idx], ...data }
  }
  const seedMatch = SEED_BATCHES_BUKU.find(b => b.id === id)
  if (seedMatch) {
    Object.assign(seedMatch, data)
  }

  // Sync with DB
  sbFetch<SoalBatch[]>(`soal_batch?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }).catch(() => {})

  const updated = runtimeState.customBatches[idx] || seedMatch || null
  return updated as SoalBatch | null
}

export async function deleteBatch(id: string): Promise<boolean> {
  runtimeState.customBatches = runtimeState.customBatches.filter(b => b.id !== id)
  delete runtimeState.customSoalMap[id]

  sbFetch(`soal_batch?id=eq.${id}`, { method: 'DELETE' }).catch(() => {})
  return true
}

// ─── SOAL ITEM Actions ─────────────────────────────────────────────────────

export async function createSoal(
  data: Omit<SoalItem, 'id' | 'created_at'>
): Promise<SoalItem | null> {
  const list = ensureBatchSoalList(data.batch_id)
  const newSoal: SoalItem = {
    id: 'soal-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    created_at: new Date().toISOString(),
    ...data,
  }
  list.push(newSoal)

  // Sync to Supabase
  sbFetch<SoalItem[]>('soal_item', {
    method: 'POST',
    body: JSON.stringify(data),
  }).catch(() => {})

  return newSoal
}

export async function updateSoal(
  id: string,
  data: Partial<Omit<SoalItem, 'id' | 'created_at'>>
): Promise<SoalItem | null> {
  let found: SoalItem | null = null

  for (const batchId of Object.keys(runtimeState.customSoalMap)) {
    const list = runtimeState.customSoalMap[batchId]
    const idx = list.findIndex(s => s.id === id)
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data }
      found = list[idx]
      break
    }
  }

  // Sync to Supabase
  sbFetch<SoalItem[]>(`soal_item?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }).catch(() => {})

  return found
}

export async function deleteSoal(id: string): Promise<boolean> {
  for (const batchId of Object.keys(runtimeState.customSoalMap)) {
    runtimeState.customSoalMap[batchId] = runtimeState.customSoalMap[batchId].filter(s => s.id !== id)
  }

  sbFetch(`soal_item?id=eq.${id}`, { method: 'DELETE' }).catch(() => {})
  return true
}

// ─── SESI LATIHAN Actions ──────────────────────────────────────────────────

export async function mulaiSesi(data: {
  batch_id: string
  nama_santri: string
  kelas: string
}): Promise<SesiLatihan | null> {
  const newSesi: SesiLatihan = {
    id: 'sesi-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    batch_id: data.batch_id,
    nama_santri: data.nama_santri,
    kelas: data.kelas,
    mulai_pada: new Date().toISOString(),
    is_selesai: false,
    skor_total: 0,
  }

  runtimeState.sessionsMap[newSesi.id] = {
    sesi: newSesi,
    jawaban: [],
  }

  // Sync to Supabase if available
  sbFetch<SesiLatihan[]>('sesi_latihan', {
    method: 'POST',
    body: JSON.stringify({ ...data, is_selesai: false, skor_total: 0 }),
  }).catch(() => {})

  return newSesi
}

export async function submitSesi(
  sesiId: string,
  jawabanList: {
    soal_id: string
    jawaban_santri: string
    opsi_benar?: string
    jawaban_benar_kunci?: string
    tipe: 'pilihan_ganda' | 'esay' | 'isi_tabel'
    skor_maksimal: number
    syubbak_kunci?: SyubbakKunci
    jawaban_syubbak_santri?: JawabanSyubbakSantri
    jawaban_tabel_santri?: Record<string, string>
    jawaban_tabel_kunci?: Record<string, string>
  }[],
  durasi_detik: number
): Promise<{
  sesi: SesiLatihan
  jawaban: JawabanSesi[]
  skor_total: number
  skor_persen: number
  detail: { soal_id: string; is_benar: boolean; skor_dapat: number }[]
}> {
  // Score tiap jawaban
  const scored = jawabanList.map((j) => {
    let is_benar = false
    let skor_dapat = 0

    if (j.tipe === 'pilihan_ganda') {
      is_benar = j.jawaban_santri.toUpperCase() === (j.opsi_benar || '').toUpperCase()
      skor_dapat = is_benar ? j.skor_maksimal : 0
    } else if (j.tipe === 'esay') {
      is_benar = j.jawaban_santri.trim().length > 5
      skor_dapat = is_benar ? Math.round(j.skor_maksimal * 0.8) : 0
    } else if (j.tipe === 'isi_tabel') {
      if (j.syubbak_kunci && j.jawaban_syubbak_santri) {
        const kunci = j.syubbak_kunci
        const santri = j.jawaban_syubbak_santri

        let totalItems = 1 + kunci.baris.length * 2
        let correctCount = 0

        // Asal Pokok
        if (String(santri.asal_masalah_pokok || '').trim() === String(kunci.asal_masalah_pokok)) {
          correctCount++
        }

        // Asal Akhir ('Aul / Tashih)
        const isAulOrTashih = kunci.asal_masalah_akhir && kunci.asal_masalah_akhir !== kunci.asal_masalah_pokok
        if (isAulOrTashih) {
          totalItems++
          if (String(santri.asal_masalah_akhir || '').trim() === String(kunci.asal_masalah_akhir)) {
            correctCount++
          }
        }

        // Baris Ahli Waris
        kunci.baris.forEach((b) => {
          const sRow = santri.baris?.find((r) => r.kode === b.kode)
          if (sRow) {
            const porsiMatch =
              sRow.porsi.trim().toLowerCase() === b.porsi_benar.trim().toLowerCase() ||
              (b.porsi_benar === 'ع' && (sRow.porsi === 'sisa' || sRow.porsi === 'ashabah' || sRow.porsi === 'ع')) ||
              (b.porsi_benar === '1/3_sisa' && (sRow.porsi === '1/3_sisa' || sRow.porsi.includes('sisa'))) ||
              ((b.porsi_benar === 'mahjub' || b.porsi_benar === 'م' || b.is_hijab) && (sRow.porsi === 'mahjub' || sRow.porsi === 'م' || sRow.porsi === 'terhalang'))
            if (porsiMatch) correctCount++

            if (String(sRow.saham || '').trim() === String(b.saham_benar)) {
              correctCount++
            }

            // Check nominal if estate is specified
            if (kunci.total_harta && b.nominal_benar !== undefined) {
              totalItems++
              const numSantri = Number(String(sRow.nominal || '').replace(/[^0-9]/g, ''))
              if (Math.abs(numSantri - (b.nominal_benar || 0)) <= 1000) {
                correctCount++
              }
            }
          }
        })

        skor_dapat = Math.round((correctCount / totalItems) * j.skor_maksimal)
        is_benar = correctCount === totalItems
      } else if (j.jawaban_tabel_santri && j.jawaban_tabel_kunci) {
        const kunci = j.jawaban_tabel_kunci
        const santri = j.jawaban_tabel_santri
        const totalKolom = Object.keys(kunci).length
        if (totalKolom > 0) {
          const benarCount = Object.entries(kunci).filter(
            ([k, v]) => santri[k]?.trim().toLowerCase() === v?.trim().toLowerCase()
          ).length
          skor_dapat = Math.round((benarCount / totalKolom) * j.skor_maksimal)
          is_benar = benarCount === totalKolom
        }
      }
    }
    return { soal_id: j.soal_id, is_benar, skor_dapat, jawaban_santri: j.jawaban_santri }
  })

  const skor_total = scored.reduce((sum, s) => sum + s.skor_dapat, 0)
  const skor_maks_total = jawabanList.reduce((sum, j) => sum + j.skor_maksimal, 0)
  const skor_persen = skor_maks_total > 0
    ? parseFloat(((skor_total / skor_maks_total) * 100).toFixed(2))
    : 0

  const selesai_pada = new Date().toISOString()

  // Retrieve or create session in memory
  let sesi = runtimeState.sessionsMap[sesiId]?.sesi
  if (!sesi) {
    sesi = {
      id: sesiId,
      batch_id: '',
      nama_santri: 'Santri',
      kelas: '-',
      mulai_pada: new Date(Date.now() - durasi_detik * 1000).toISOString(),
      is_selesai: true,
      selesai_pada,
      durasi_detik,
      skor_total,
      skor_persen,
    }
  } else {
    sesi.is_selesai = true
    sesi.selesai_pada = selesai_pada
    sesi.durasi_detik = durasi_detik
    sesi.skor_total = skor_total
    sesi.skor_persen = skor_persen
  }

  const jawabanRows: JawabanSesi[] = scored.map((s, idx) => ({
    id: 'jawaban-' + Date.now() + '-' + idx,
    sesi_id: sesiId,
    soal_id: s.soal_id,
    jawaban_santri: s.jawaban_santri,
    is_benar: s.is_benar,
    skor_dapat: s.skor_dapat,
    waktu_jawab: new Date().toISOString(),
  }))

  runtimeState.sessionsMap[sesiId] = {
    sesi,
    jawaban: jawabanRows,
  }

  // Update DB in background
  sbFetch(`sesi_latihan?id=eq.${sesiId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      is_selesai: true,
      selesai_pada,
      durasi_detik,
      skor_total,
      skor_persen,
    }),
  }).catch(() => {})

  sbFetch<JawabanSesi[]>('jawaban_sesi', {
    method: 'POST',
    body: JSON.stringify(jawabanRows),
  }).catch(() => {})

  return {
    sesi,
    jawaban: jawabanRows,
    skor_total,
    skor_persen,
    detail: scored,
  }
}

export async function getLeaderboard(batchId: string): Promise<SesiLatihan[]> {
  const localList = Object.values(runtimeState.sessionsMap)
    .map(s => s.sesi)
    .filter(s => s.batch_id === batchId && s.is_selesai)

  const dbResult = await sbFetch<SesiLatihan[]>(
    `sesi_latihan?batch_id=eq.${batchId}&is_selesai=eq.true&select=*&order=skor_persen.desc,durasi_detik.asc&limit=20`,
    { next: { revalidate: 15 } }
  )

  const combined = [...(dbResult || []), ...localList]
  const uniqueMap = new Map<string, SesiLatihan>()
  combined.forEach(s => uniqueMap.set(s.id, s))

  return Array.from(uniqueMap.values()).sort((a, b) => {
    if (b.skor_persen !== a.skor_persen) {
      return (b.skor_persen || 0) - (a.skor_persen || 0)
    }
    return (a.durasi_detik || 0) - (b.durasi_detik || 0)
  })
}

export async function getSesiDetail(sesiId: string): Promise<{
  sesi: SesiLatihan | null
  jawaban: JawabanSesi[]
}> {
  if (runtimeState.sessionsMap[sesiId]) {
    return runtimeState.sessionsMap[sesiId]
  }

  const [sesi, jawaban] = await Promise.all([
    sbFetch<SesiLatihan[]>(`sesi_latihan?id=eq.${sesiId}&select=*`),
    sbFetch<JawabanSesi[]>(`jawaban_sesi?sesi_id=eq.${sesiId}&select=*&order=id`),
  ])
  return { sesi: sesi?.[0] || null, jawaban: jawaban || [] }
}

export async function getAllBatches(): Promise<SoalBatch[]> {
  const dbResult = await sbFetch<SoalBatch[]>('soal_batch?select=*&order=created_at.desc')
  const seedBatches = SEED_BATCHES_BUKU.map(sb => ({
    id: sb.id,
    judul: sb.judul,
    deskripsi: sb.deskripsi,
    kelas_target: sb.kelas_target,
    is_active: sb.is_active,
    created_by: sb.created_by,
    created_at: sb.created_at,
  }))

  const all = [...(dbResult || []), ...runtimeState.customBatches, ...seedBatches]
  const uniqueMap = new Map<string, SoalBatch>()
  all.forEach(b => uniqueMap.set(b.id, b))
  return Array.from(uniqueMap.values())
}

export async function getBatchSoalItems(batchId: string): Promise<SoalItem[]> {
  return ensureBatchSoalList(batchId)
}
