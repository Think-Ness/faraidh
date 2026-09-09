'use server'

import { FaraidhEngine } from '@/lib/faraidh/engine'
import { SEED_RULES } from '@/data/seed-rules'
import type {
  AhliWaris,
  FurudhRule,
  HijabHirmanRule,
  HijabNuqshanRule,
  AshabahRule,
  KasusKhusus,
  HasilKalkulasi,
  InputKasus
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
  try {
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function getAdminData() {
  // Try fetching live from Supabase if configured
  let ahliWaris = await supabaseFetch<AhliWaris>('ahli_waris', 'id')
  let furudhRules = await supabaseFetch<FurudhRule>('furudh_rule', 'id')
  let hijabHirmanRules = await supabaseFetch<HijabHirmanRule>('hijab_hirman_rule', 'id')
  let hijabNuqshanRules = await supabaseFetch<HijabNuqshanRule>('hijab_nuqshan_rule', 'id')
  let ashabahRules = await supabaseFetch<AshabahRule>('ashabah_rule', 'urutan_prioritas')
  let kasusKhusus = await supabaseFetch<KasusKhusus>('kasus_khusus', 'id')
  
  // Fetch recent cases audit log
  let recentKasus: any[] = []
  if (isSupabaseConfigured) {
    try {
      recentKasus = await supabaseFetch<any>('kasus', 'dibuat_pada.desc')
    } catch {
      recentKasus = []
    }
  }

  const isLiveDB = isSupabaseConfigured && ahliWaris.length > 0

  if (!isLiveDB) {
    ahliWaris = SEED_RULES.ahli_waris
    furudhRules = SEED_RULES.furudh_rules
    hijabHirmanRules = SEED_RULES.hijab_hirman_rules
    hijabNuqshanRules = SEED_RULES.hijab_nuqshan_rules
    ashabahRules = SEED_RULES.ashabah_rules
    kasusKhusus = SEED_RULES.kasus_khusus
  }

  return {
    isLiveDB,
    supabaseUrl: isSupabaseConfigured ? SUPABASE_URL : null,
    stats: {
      totalAhliWaris: ahliWaris.length,
      totalFurudh: furudhRules.length,
      totalHijabHirman: hijabHirmanRules.length,
      totalHijabNuqshan: hijabNuqshanRules.length,
      totalAshabah: ashabahRules.length,
      totalKasusKhusus: kasusKhusus.length,
      totalSimulasiRecorded: recentKasus.length,
    },
    ahliWaris,
    furudhRules,
    hijabHirmanRules,
    hijabNuqshanRules,
    ashabahRules,
    kasusKhusus,
    recentKasus: recentKasus.slice(0, 20),
  }
}

export async function testAdminCalculation(input: InputKasus): Promise<{
  success: boolean
  data?: HasilKalkulasi
  error?: string
}> {
  try {
    const rules = SEED_RULES
    const engine = new FaraidhEngine(rules)
    const hasil = engine.hitung(input)
    return { success: true, data: hasil }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Kalkulasi gagal',
    }
  }
}
