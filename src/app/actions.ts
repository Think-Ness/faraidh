'use server'

import { FaraidhEngine } from '@/lib/faraidh/engine'
import type {
  InputKasus,
  HasilKalkulasi,
  AhliWaris,
  FurudhRule,
  HijabHirmanRule,
  HijabNuqshanRule,
  AshabahRule,
  KasusKhusus,
} from '@/lib/faraidh/types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const isSupabaseConfigured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your_supabase_project_url')

async function supabaseFetch<T>(table: string, orderCol?: string): Promise<T[]> {
  if (!isSupabaseConfigured) return []
  let url = `${SUPABASE_URL}/rest/v1/${table}?select=*`
  if (orderCol) url += `&order=${orderCol}`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    next: { revalidate: 300 }, // Cache 5 menit
  })
  if (!res.ok) return []
  return res.json()
}

async function supabaseInsert(table: string, data: Record<string, unknown> | Record<string, unknown>[]) {
  if (!isSupabaseConfigured) return null
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) return null
  const result = await res.json()
  return Array.isArray(result) ? result[0] : result
}

async function fetchRules() {
  const [
    ahli_waris,
    furudh_rules,
    hijab_hirman_rules,
    hijab_nuqshan_rules,
    ashabah_rules,
    kasus_khusus,
  ] = await Promise.all([
    supabaseFetch<AhliWaris>('ahli_waris', 'id'),
    supabaseFetch<FurudhRule>('furudh_rule'),
    supabaseFetch<HijabHirmanRule>('hijab_hirman_rule'),
    supabaseFetch<HijabNuqshanRule>('hijab_nuqshan_rule'),
    supabaseFetch<AshabahRule>('ashabah_rule', 'urutan_prioritas'),
    supabaseFetch<KasusKhusus>('kasus_khusus'),
  ])

  // Jika Supabase belum dikonfigurasi atau data kosong, fallback ke seed lokal
  if (!ahli_waris.length) {
    const { SEED_RULES } = await import('@/data/seed-rules')
    return SEED_RULES
  }

  return {
    ahli_waris,
    furudh_rules,
    hijab_hirman_rules,
    hijab_nuqshan_rules,
    ashabah_rules,
    kasus_khusus,
  }
}

export async function hitungFaraidh(input: InputKasus): Promise<{
  success: boolean
  data?: HasilKalkulasi
  kasus_id?: string
  error?: string
  mode?: 'supabase' | 'local'
}> {
  try {
    const rules = await fetchRules()
    const mode = isSupabaseConfigured && rules.ahli_waris.length > 0 ? 'supabase' : 'local'

    const engine = new FaraidhEngine(rules)
    const hasil = engine.hitung(input)

    // Simpan ke Supabase jika terkonfigurasi
    let kasus_id: string | undefined
    if (isSupabaseConfigured) {
      const kasusData = await supabaseInsert('kasus', {
        nama_pewaris: input.nama_pewaris || null,
        harta_kotor: input.harta_kotor,
        biaya_tajhiz: input.biaya_tajhiz,
        hutang_terikat: input.hutang_terikat,
        hutang_biasa: input.hutang_biasa,
        wasiat: input.wasiat,
        total_harta_bersih: hasil.total_harta_bersih,
        asal_masalah: hasil.asal_masalah,
        asal_masalah_tashih: hasil.asal_masalah_tashih,
        status_penyelesaian: hasil.status_penyelesaian,
        juz_sahm: hasil.juz_sahm,
      })

      if (kasusData?.id) {
        kasus_id = kasusData.id
        const ahli_warisMap = new Map(rules.ahli_waris.map((a: AhliWaris) => [a.kode, a]))

        await Promise.all([
          supabaseInsert('kasus_ahli_waris',
            input.ahli_waris_list.map(aw => ({
              kasus_id,
              ahli_waris_id: ahli_warisMap.get(aw.kode)?.id,
              jumlah_orang: aw.jumlah_orang,
              halangan_waris: aw.halangan,
            }))
          ),
          supabaseInsert('hasil_perhitungan',
            hasil.hasil.map(h => ({
              kasus_id,
              ahli_waris_id: ahli_warisMap.get(h.kode)?.id,
              jumlah_orang: h.jumlah_orang,
              status_hasil: h.status,
              pecahan: h.pecahan,
              saham_per_orang: h.saham_per_orang,
              saham_total_kelompok: h.saham_total_kelompok,
              nominal_per_orang: h.nominal_per_orang,
              nominal_total_kelompok: h.nominal_total_kelompok,
              keterangan: h.keterangan,
            }))
          ),
        ])
      }
    }

    return { success: true, data: hasil, kasus_id, mode }
  } catch (error) {
    console.error('Engine error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Terjadi kesalahan pada mesin perhitungan.',
    }
  }
}

export async function getAhliWarisMaster(): Promise<AhliWaris[]> {
  return supabaseFetch<AhliWaris>('ahli_waris', 'id')
}
