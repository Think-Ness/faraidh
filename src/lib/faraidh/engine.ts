// ============================================================
// FARAIDH RULES ENGINE — Core Calculator
// Berdasarkan Kitab Ilmu Faraidh Kelas 3 KMI Gontor
//
// Urutan Eksekusi:
// Fase 0: Hitung Tirkah & Harta Bersih
// Fase 1: Filter Mawani' al-Irts (Halangan)
// Fase 2: Deteksi Kasus Khusus (Gharrawain, Musytarakah, Akdariyyah)
// Fase 3: Evaluasi Hijab Hirman (Gugur Total)
// Fase 4: Evaluasi Hijab Nuqshan (Berkurang Bagian)
// Fase 5: Penentuan Furudh & Ashabah
// Fase 6: Ta'shil (Asal Masalah)
// Fase 7: 'Aul / Radd
// Fase 8: Tashih al-Masail
// Fase 9: Kalkulasi Nominal Akhir
// ============================================================

import type {
  AhliWaris,
  FurudhRule,
  HijabHirmanRule,
  HijabNuqshanRule,
  AshabahRule,
  KasusKhusus,
  InputKasus,
  InputAhliWaris,
  HasilKalkulasi,
  HasilPerAhliWaris,
  LogEdukasi,
  StatusPenyelesaian,
} from './types'

import {
  gcd,
  lcmArray,
  hitungMahfudzat,
  pecahanKeSaham,
  hitungHartaBersih,
  hitungAsalMasalah,
  validasiWasiat,
  relasiMatematis,
} from './math-utils'

// ============================================================
// TIPE INTERNAL ENGINE
// ============================================================

interface AhliWarisAktif {
  kode: string
  nama_id: string
  nama_arab: string
  jenis_kelamin: 'L' | 'P'
  jumlah_orang: number
  aktif: boolean
  alasan_tidak_aktif?: string
  pecahan_aktif?: string
  saham_per_orang?: number
  saham_total?: number
  saham_asal?: number
  mahfudz?: number
  jenis_ashabah?: 'bin_nafsih' | 'bil_ghair' | 'maal_ghair'
}

// ============================================================
// RULES ENGINE CLASS
// ============================================================

export class FaraidhEngine {
  private ahli_waris_master: AhliWaris[]
  private furudh_rules: FurudhRule[]
  private hijab_hirman_rules: HijabHirmanRule[]
  private hijab_nuqshan_rules: HijabNuqshanRule[]
  private ashabah_rules: AshabahRule[]
  private kasus_khusus_list: KasusKhusus[]

  constructor(rules: {
    ahli_waris: AhliWaris[]
    furudh_rules: FurudhRule[]
    hijab_hirman_rules: HijabHirmanRule[]
    hijab_nuqshan_rules: HijabNuqshanRule[]
    ashabah_rules: AshabahRule[]
    kasus_khusus: KasusKhusus[]
  }) {
    this.ahli_waris_master = rules.ahli_waris
    this.furudh_rules = rules.furudh_rules
    this.hijab_hirman_rules = rules.hijab_hirman_rules
    this.hijab_nuqshan_rules = rules.hijab_nuqshan_rules
    this.ashabah_rules = rules.ashabah_rules
    this.kasus_khusus_list = rules.kasus_khusus
  }

  hitung(input: InputKasus): HasilKalkulasi {
    const log: LogEdukasi[] = []

    // ─── FASE 0: HITUNG TIRKAH ───────────────────────────────
    const validasiW = validasiWasiat(
      input.harta_kotor,
      input.biaya_tajhiz,
      input.hutang_terikat,
      input.hutang_biasa,
      input.wasiat
    )
    const wasiat_efektif = validasiW.valid
      ? input.wasiat
      : Math.min(input.wasiat, validasiW.maks_wasiat)

    const harta_bersih = hitungHartaBersih(
      input.harta_kotor,
      input.biaya_tajhiz,
      input.hutang_terikat,
      input.hutang_biasa,
      wasiat_efektif
    )

    log.push({
      fase: 0,
      judul: 'Penghitungan Tirkah (Harta Peninggalan)',
      judul_arab: 'حساب التركة',
      penjelasan: `Harta Kotor Rp${input.harta_kotor.toLocaleString('id-ID')} dikurangi biaya Tajhiz, Hutang, dan Wasiat.`,
      detail: [
        `Harta Kotor: Rp${input.harta_kotor.toLocaleString('id-ID')}`,
        `(-) Biaya Tajhiz: Rp${input.biaya_tajhiz.toLocaleString('id-ID')}`,
        `(-) Hutang Terikat (Zakat/Gadai): Rp${input.hutang_terikat.toLocaleString('id-ID')}`,
        `(-) Hutang Biasa: Rp${input.hutang_biasa.toLocaleString('id-ID')}`,
        `(-) Wasiat (maks 1/3): Rp${wasiat_efektif.toLocaleString('id-ID')}`,
        `= Harta Bersih yang Diwariskan: Rp${harta_bersih.toLocaleString('id-ID')}`,
        ...(validasiW.valid ? [] : [`⚠️ Wasiat disesuaikan ke batas 1/3: Rp${wasiat_efektif.toLocaleString('id-ID')}`]),
      ],
    })

    // Buat peta kode → master data
    const masterMap = new Map(this.ahli_waris_master.map(a => [a.kode, a]))

    // Bangun daftar aktif dari input
    const aktifMap = new Map<string, AhliWarisAktif>()
    for (const inp of input.ahli_waris_list) {
      const master = masterMap.get(inp.kode)
      if (!master) continue
      aktifMap.set(inp.kode, {
        kode: inp.kode,
        nama_id: master.nama_id,
        nama_arab: master.nama_arab,
        jenis_kelamin: master.jenis_kelamin,
        jumlah_orang: inp.jumlah_orang,
        aktif: true,
      })
    }

    const kodeAktif = () => Array.from(aktifMap.values()).filter(a => a.aktif).map(a => a.kode)

    // ─── FASE 1: MAWANI' AL-IRTS ─────────────────────────────
    const gugurHalangan: string[] = []
    for (const inp of input.ahli_waris_list) {
      if (inp.halangan !== 'tidak_ada') {
        const aw = aktifMap.get(inp.kode)
        if (aw) {
          aw.aktif = false
          const labelHalangan: Record<string, string> = {
            budak: 'berstatus budak (رقيق)',
            pembunuh: 'membunuh pewaris (قاتل)',
            beda_agama: 'beda agama / murtad (كافر)',
          }
          aw.alasan_tidak_aktif = `Gugur karena ${labelHalangan[inp.halangan] || inp.halangan}`
          gugurHalangan.push(`${aw.nama_id}: ${aw.alasan_tidak_aktif}`)
        }
      }
    }

    log.push({
      fase: 1,
      judul: "Penyaringan Mawani' al-Irts (Penghalang Waris)",
      judul_arab: "موانع الإرث",
      penjelasan:
        gugurHalangan.length > 0
          ? `${gugurHalangan.length} ahli waris gugur karena penghalang syar'i.`
          : "Tidak ada ahli waris yang terhalang oleh sebab hukum (halangan waris).",
      detail: gugurHalangan.length > 0 ? gugurHalangan : ['Semua ahli waris bebas dari halangan.'],
    })

    // ─── FASE 2: DETEKSI KASUS KHUSUS ────────────────────────
    let kasusKhususAktif: string | undefined
    const kodeSaatIni = () => kodeAktif()

    for (const kk of this.kasus_khusus_list) {
      if (this.cocokKasusKhusus(kk, kodeSaatIni(), aktifMap)) {
        kasusKhususAktif = kk.kode
        log.push({
          fase: 2,
          judul: `Kasus Khusus Terdeteksi: ${kk.nama}`,
          judul_arab: kk.kode === 'gharrawain' ? 'الغراوين' : kk.kode === 'musytarakah' ? 'المشتركة' : 'الأكدرية',
          penjelasan: kk.aturan_khusus,
        })
        break
      }
    }

    if (!kasusKhususAktif) {
      log.push({
        fase: 2,
        judul: 'Pemeriksaan Kasus Khusus',
        judul_arab: 'المسائل الخاصة',
        penjelasan: 'Tidak ada kasus khusus (Gharrawain, Musytarakah, Akdariyyah) yang terpenuhi. Perhitungan berlanjut ke jalur normal.',
      })
    }

    // ─── FASE 3: HIJAB HIRMAN ─────────────────────────────────
    const gugurHijab: string[] = []
    for (const rule of this.hijab_hirman_rules) {
      const penghalang = this.ahli_waris_master.find(a => a.id === rule.penghalang_id)
      const terhalang = this.ahli_waris_master.find(a => a.id === rule.terhalang_id)
      if (!penghalang || !terhalang) continue

      const penghalangAktif = aktifMap.get(penghalang.kode)
      const terhalangAktif = aktifMap.get(terhalang.kode)

      if (
        penghalangAktif?.aktif &&
        terhalangAktif?.aktif
      ) {
        // Pengecekan khusus: Anak perempuan menghalangi cucu perempuan HANYA jika anak_pr >= 2
        if (penghalang.kode === 'anak_pr' && terhalang.kode === 'cucu_pr') {
          if ((penghalangAktif.jumlah_orang || 1) < 2) continue
        }
        // Pengecekan khusus: 2 atau lebih Saudari Kandung (2/3) menghalangi Saudari Seayah jika tanpa Saudara Lk Seayah
        if (penghalang.kode === 'saudari_kandung' && terhalang.kode === 'saudari_seayah') {
          const jmlSkandung = aktifMap.get('saudari_kandung')?.jumlah_orang || 0
          const adaSaudaraSeayah = aktifMap.get('saudara_lk_seayah')?.aktif
          if (jmlSkandung < 2 || adaSaudaraSeayah) continue
        }

        terhalangAktif.aktif = false
        terhalangAktif.alasan_tidak_aktif = `Terhalang (hijab hirman) oleh ${penghalang.nama_id}`
        gugurHijab.push(`${terhalang.nama_id} → terhalang oleh ${penghalang.nama_id}`)
      }
    }

    log.push({
      fase: 3,
      judul: 'Evaluasi Hijab Hirman (Gugur Total)',
      judul_arab: 'الحجب حجب حرمان',
      penjelasan:
        gugurHijab.length > 0
          ? `${gugurHijab.length} ahli waris gugur total karena terhalang ahli waris lain.`
          : 'Tidak ada ahli waris yang gugur karena Hijab Hirman.',
      detail: gugurHijab.length > 0 ? gugurHijab : ['Tidak ada gugur Hijab Hirman.'],
    })

    // ─── FASE 4: HIJAB NUQSHAN ────────────────────────────────
    // Map: kode terdampak → pecahan yang diubah
    const nuqshanMap = new Map<string, string>()
    for (const rule of this.hijab_nuqshan_rules) {
      const penyebab = this.ahli_waris_master.find(a => a.id === rule.penyebab_id)
      const terdampak = this.ahli_waris_master.find(a => a.id === rule.terdampak_id)
      if (!penyebab || !terdampak) continue
      if (aktifMap.get(penyebab.kode)?.aktif && aktifMap.get(terdampak.kode)?.aktif) {
        nuqshanMap.set(terdampak.kode, rule.pecahan_baru)
      }
    }

    const nuqshanDetail: string[] = []
    nuqshanMap.forEach((pecahan_baru, kode) => {
      const aw = aktifMap.get(kode)
      if (aw) nuqshanDetail.push(`${aw.nama_id}: Bagiannya berkurang menjadi ${pecahan_baru}`)
    })

    log.push({
      fase: 4,
      judul: 'Evaluasi Hijab Nuqshan (Berkurang Bagian)',
      judul_arab: 'الحجب حجب نقصان',
      penjelasan:
        nuqshanDetail.length > 0
          ? `${nuqshanDetail.length} ahli waris bagiannya berkurang (bukan gugur total).`
          : 'Tidak ada ahli waris yang berkurang bagiannya.',
      detail: nuqshanDetail.length > 0 ? nuqshanDetail : ['Tidak ada Hijab Nuqshan.'],
    })

    // ─── FASE 5: PENENTUAN FURUDH & ASHABAH ──────────────────
    const ashabahBinNafsihKandidats: Array<{ kode: string; urutan: number }> = []

    // Jika ada kasus khusus, gunakan alokasi override
    if (kasusKhususAktif) {
      this.alokasikanKasusKhusus(kasusKhususAktif, aktifMap, kodeAktif)
    } else {
      // 5a. Tentukan Ashabul Furudh
      for (const [kode, aw] of aktifMap) {
        if (!aw.aktif) continue
        const master = masterMap.get(kode)!
        const jumlah = aw.jumlah_orang

        // Cek hijab nuqshan override
        const pecahan_nuqshan = nuqshanMap.get(kode)

        // Cari furudh rule yang cocok
        const pecahan = pecahan_nuqshan || this.cariPecahanFurudh(kode, jumlah, kodeAktif(), aktifMap)
        if (pecahan && !pecahan.includes('ashabah')) {
          aw.pecahan_aktif = pecahan
        }
      }

      // 5b. Tentukan Ashabah
      // Cari ashabah bin_nafsih yang paling prioritas
      let ashabah_bin_nafsih_terpilih: string | null = null

      // Kumpulkan semua kandidat ashabah bin nafsih yang aktif
      for (const rule of this.ashabah_rules) {
        if (rule.jenis !== 'bin_nafsih') continue
        const aw_master = this.ahli_waris_master.find(a => a.id === rule.ahli_waris_id)
        if (!aw_master) continue
        const aw = aktifMap.get(aw_master.kode)
        if (aw?.aktif && !aw.pecahan_aktif) {
          ashabahBinNafsihKandidats.push({ kode: aw_master.kode, urutan: rule.urutan_prioritas || 99 })
        }
      }

      if (ashabahBinNafsihKandidats.length > 0) {
        ashabahBinNafsihKandidats.sort((a, b) => a.urutan - b.urutan)
        ashabah_bin_nafsih_terpilih = ashabahBinNafsihKandidats[0].kode
      }

      // Set jenis ashabah
      if (ashabah_bin_nafsih_terpilih) {
        const awTerpilih = aktifMap.get(ashabah_bin_nafsih_terpilih)
        if (awTerpilih) {
          awTerpilih.jenis_ashabah = 'bin_nafsih'
          awTerpilih.pecahan_aktif = 'sisa'
        }

        // Bil ghair: perempuan sederajat yang ditarik oleh ashabah bin nafsih ini
        for (const rule of this.ashabah_rules) {
          if (rule.jenis !== 'bil_ghair') continue
          if (rule.pasangan_penarik_id === null || rule.pasangan_penarik_id === undefined) continue
          const penarik = this.ahli_waris_master.find(a => a.id === rule.pasangan_penarik_id)
          if (penarik?.kode !== ashabah_bin_nafsih_terpilih) continue
          const aw_diri = this.ahli_waris_master.find(a => a.id === rule.ahli_waris_id)
          if (!aw_diri) continue
          const aw = aktifMap.get(aw_diri.kode)
          if (aw?.aktif && !aw.pecahan_aktif) {
            aw.jenis_ashabah = 'bil_ghair'
            aw.pecahan_aktif = 'sisa_2:1'  // Ditandai untuk pembagian 2:1 dengan penariknya
          }
        }
      }

      // Maal ghair: saudari kandung/seayah yang jadi ashabah karena bersama anak perempuan
      for (const rule of this.ashabah_rules) {
        if (rule.jenis !== 'maal_ghair') continue
        const aw_master = this.ahli_waris_master.find(a => a.id === rule.ahli_waris_id)
        if (!aw_master) continue
        const aw = aktifMap.get(aw_master.kode)
        if (!aw?.aktif || aw.pecahan_aktif) continue

        const kondisi = rule.syarat_kondisi as Record<string, unknown> | null
        if (kondisi && this.cekKondisi(kondisi, kodeAktif(), aktifMap)) {
          aw.jenis_ashabah = 'maal_ghair'
          aw.pecahan_aktif = 'sisa'
        }
      }

      // Kaidah Fiqh: Saudari Kandung yang berstatus Ashabah Ma'al Ghair bertindak seperti Saudara Laki-laki Kandung
      // Sehingga MENGHIJAB: Saudara Lk Seayah, Saudari Seayah, Keponakan, dan Paman
      const skandungMaalGhair = aktifMap.get('saudari_kandung')
      if (skandungMaalGhair?.aktif && skandungMaalGhair.jenis_ashabah === 'maal_ghair') {
        const terhijabOlehMaalGhair = [
          'saudara_lk_seayah',
          'saudari_seayah',
          'anak_saudara_lk_kandung',
          'anak_saudara_lk_seayah',
          'paman_kandung',
          'paman_seayah',
          'anak_paman_kandung',
          'anak_paman_seayah'
        ]
        for (const kodeTerhijab of terhijabOlehMaalGhair) {
          const awT = aktifMap.get(kodeTerhijab)
          if (awT?.aktif) {
            awT.aktif = false
            awT.alasan_tidak_aktif = 'Terhalang (hijab hirman) oleh Saudari Sekandung (Ashabah ma\'al-Ghair berkedudukan seperti Saudara Laki-laki Kandung)'
            awT.pecahan_aktif = undefined
            awT.saham_total = 0
            gugurHijab.push(`${awT.nama_id} → terhalang oleh Saudari Sekandung (Ashabah ma'al-Ghair)`)
          }
        }
      }

      // Begitu juga Saudari Seayah jika menjadi Ashabah Ma'al Ghair (tanpa saudari kandung)
      const sseayahMaalGhair = aktifMap.get('saudari_seayah')
      if (sseayahMaalGhair?.aktif && sseayahMaalGhair.jenis_ashabah === 'maal_ghair') {
        const terhijabOlehMaalGhairSeayah = [
          'anak_saudara_lk_kandung',
          'anak_saudara_lk_seayah',
          'paman_kandung',
          'paman_seayah',
          'anak_paman_kandung',
          'anak_paman_seayah'
        ]
        for (const kodeTerhijab of terhijabOlehMaalGhairSeayah) {
          const awT = aktifMap.get(kodeTerhijab)
          if (awT?.aktif) {
            awT.aktif = false
            awT.alasan_tidak_aktif = 'Terhalang (hijab hirman) oleh Saudari Seayah (Ashabah ma\'al-Ghair berkedudukan seperti Saudara Laki-laki Seayah)'
            awT.pecahan_aktif = undefined
            awT.saham_total = 0
            gugurHijab.push(`${awT.nama_id} → terhalang oleh Saudari Seayah (Ashabah ma'al-Ghair)`)
          }
        }
      }

      // Ayah bisa furudh 1/6 + sisa jika ada anak perempuan tanpa anak laki-laki
      const ayahAw = aktifMap.get('ayah')
      if (ayahAw?.aktif) {
        const adaAnakPr = aktifMap.get('anak_pr')?.aktif
        const adaAnakLk = aktifMap.get('anak_lk')?.aktif
        const adaCucuLk = aktifMap.get('cucu_lk')?.aktif
        if (adaAnakPr && !adaAnakLk && !adaCucuLk) {
          ayahAw.pecahan_aktif = '1/6+sisa'
          ayahAw.jenis_ashabah = 'bin_nafsih'
        }
      }

      // Kakek: sama seperti ayah jika tidak ada ayah
      const kakekAw = aktifMap.get('kakek')
      if (kakekAw?.aktif && !aktifMap.get('ayah')?.aktif) {
        const adaAnakPr = aktifMap.get('anak_pr')?.aktif
        const adaAnakLk = aktifMap.get('anak_lk')?.aktif
        const adaCucuLk = aktifMap.get('cucu_lk')?.aktif
        if (adaAnakPr && !adaAnakLk && !adaCucuLk) {
          kakekAw.pecahan_aktif = '1/6+sisa'
          kakekAw.jenis_ashabah = 'bin_nafsih'
        }
      }
    }

    // Log Fase 5
    const detailFase5: string[] = []
    for (const [, aw] of aktifMap) {
      if (!aw.aktif) continue
      let status = ''
      if (aw.pecahan_aktif === 'sisa') status = `Ashabah (${aw.jenis_ashabah?.replace('_', ' ')})`
      else if (aw.pecahan_aktif === 'sisa_2:1') status = `Ashabah bil-Ghair (berbagi 2:1 dengan mu-ashib)`
      else if (aw.pecahan_aktif === '1/6+sisa') status = `Furudh 1/6 + Ashabah (sisa setelah furudh)`
      else if (aw.pecahan_aktif) status = `Furudh ${aw.pecahan_aktif}`
      else status = '⚠️ Tidak ada bagian (tidak termasuk ashabah maupun furudh)'
      detailFase5.push(`${aw.nama_id} (×${aw.jumlah_orang}): ${status}`)
    }

    log.push({
      fase: 5,
      judul: 'Penentuan Bagian: Ashabul Furudh & Ashabah',
      judul_arab: 'تحديد الأنصباء',
      penjelasan: 'Setiap ahli waris yang aktif ditentukan jenis bagiannya (Furudh Muqaddarah atau Ashabah).',
      detail: detailFase5,
    })

    // ─── FASE 6: TA'SHIL (ASAL MASALAH) ──────────────────────
    const ashabah_aktif = Array.from(aktifMap.values()).filter(
      a => a.aktif && (a.pecahan_aktif === 'sisa' || a.pecahan_aktif === 'sisa_2:1' || a.pecahan_aktif === '1/6+sisa')
    )
    const isBilGhairActive = ashabah_aktif.some(a => a.pecahan_aktif === 'sisa_2:1')

    const getRuusPerJiwa = (aw: AhliWarisAktif): number => {
      if (isBilGhairActive) {
        if (['anak_lk', 'cucu_lk', 'saudara_lk_kandung', 'saudara_lk_seayah'].includes(aw.kode)) {
          return 2
        }
        if (['anak_pr', 'cucu_pr', 'saudari_kandung', 'saudari_seayah'].includes(aw.kode)) {
          return 1
        }
      }
      return 1
    }

    let total_ruus_ashabah = 0
    for (const aw of ashabah_aktif) {
      if (aw.pecahan_aktif !== '1/6+sisa') {
        total_ruus_ashabah += aw.jumlah_orang * getRuusPerJiwa(aw)
      }
    }

    // Kumpulkan semua pecahan yang berlaku
    const pecahan_list: string[] = []
    for (const [, aw] of aktifMap) {
      if (!aw.aktif || !aw.pecahan_aktif) continue
      if (aw.pecahan_aktif === 'sisa' || aw.pecahan_aktif === 'sisa_2:1') continue
      if (aw.pecahan_aktif === '1/6+sisa') {
        pecahan_list.push('1/6')
        continue
      }
      if (aw.pecahan_aktif === '1/3_gabungan') {
        pecahan_list.push('1/3')
        continue
      }
      pecahan_list.push(aw.pecahan_aktif)
    }

    let asal_masalah = pecahan_list.length > 0 
      ? hitungAsalMasalah(pecahan_list) 
      : (total_ruus_ashabah > 0 ? total_ruus_ashabah : 1)

    // Hitung saham per ahli waris furudh
    for (const [, aw] of aktifMap) {
      if (!aw.aktif) continue
      if (!aw.pecahan_aktif || aw.pecahan_aktif === 'sisa' || aw.pecahan_aktif === 'sisa_2:1') continue
      const p = aw.pecahan_aktif === '1/3_gabungan' ? '1/3' :
                aw.pecahan_aktif === '1/6+sisa' ? '1/6' :
                aw.pecahan_aktif
      aw.saham_total = pecahanKeSaham(p, asal_masalah)
    }

    log.push({
      fase: 6,
      judul: "Ta'shil — Pencarian Asal Masalah (KPK Penyebut)",
      judul_arab: "التأصيل — إيجاد أصل المسألة",
      penjelasan: `Asal Masalah (penyebut pokok): ${asal_masalah}. ${pecahan_list.length > 0 ? 'Ini adalah KPK dari semua penyebut pecahan yang berlaku.' : 'Ditetapkan dari total ru\'us (kepala) Ashabah.'}`,
      detail: [
        `Pecahan aktif: ${pecahan_list.join(', ') || '— (murni Ashabah)'}`,
        `Asal Masalah = ${asal_masalah}`,
      ],
    })

    const asal_masalah_pokok = asal_masalah
    let asal_masalah_aul: number | undefined = undefined
    let asal_masalah_radd: number | undefined = undefined
    let penjelasan_perpindahan = ''

    // ─── FASE 7: 'AUL / RADD ──────────────────────────────────
    let total_saham = 0
    for (const [, aw] of aktifMap) {
      if (!aw.aktif || !aw.saham_total) continue
      total_saham += aw.saham_total
    }

    const ada_ashabah = ashabah_aktif.length > 0

    let status_penyelesaian: StatusPenyelesaian = 'adilah'
    let sisa_saham = asal_masalah - total_saham

    if (kasusKhususAktif) {
      status_penyelesaian = 'kasus_khusus'
      penjelasan_perpindahan = 'Penyelesaian mengacu pada kaidah Masalah Khusus (Al-Gharrawain / Al-Musytarakah / Al-Akdariyyah).'
    } else if (total_saham > asal_masalah) {
      // 'AUL
      const asal_lama = asal_masalah
      asal_masalah_aul = total_saham
      asal_masalah = total_saham
      status_penyelesaian = 'aul'
      sisa_saham = 0
      penjelasan_perpindahan = `Asal Masalah ${asal_lama} mengalami 'Aul (عالت) membengkak menjadi ${asal_masalah} karena total saham (${total_saham}) melebihi Asal Masalah.`
      log.push({
        fase: 7,
        judul: "'Aul — Saham Membengkak",
        judul_arab: "العَوْل",
        penjelasan: `Total saham (${total_saham}) melebihi Asal Masalah (${asal_lama}). Asal Masalah dinaikkan ke ${asal_masalah} ('Aul). Semua ahli waris menerima bagian yang dikecilkan secara proporsional.`,
      })
    } else if (sisa_saham > 0 && !ada_ashabah) {
      // RADD
      status_penyelesaian = 'radd'
      const berhak_radd = Array.from(aktifMap.values()).filter(
        a => a.aktif && a.saham_total && a.kode !== 'suami' && a.kode !== 'istri'
      )
      const total_saham_radd = berhak_radd.reduce((s, a) => s + (a.saham_total || 0), 0)
      const asal_radd = total_saham_radd
      asal_masalah_radd = asal_radd > 0 ? asal_radd : asal_masalah
      asal_masalah = asal_masalah_radd
      penjelasan_perpindahan = `Asal Masalah ${asal_masalah_pokok} mengalami Radd (ردت) disesuaikan menjadi ${asal_masalah} karena ada sisa ${sisa_saham} saham dan tidak ada penerima Ashabah.`

      log.push({
        fase: 7,
        judul: 'Radd — Sisa Saham Dikembalikan',
        judul_arab: 'الرَّد',
        penjelasan: `Masih ada sisa ${sisa_saham} saham dan tidak ada Ashabah. Sisa dikembalikan (Radd) ke ahli waris yang berhak secara proporsional. Asal Masalah disesuaikan ke ${asal_masalah}.`,
        detail: berhak_radd.map(a => `${a.nama_id}: Mendapat Radd proporsional dari saham ${a.saham_total}`),
      })
    } else {
      penjelasan_perpindahan = `Asal Masalah ${asal_masalah_pokok} bersifat 'Adilah (مسألة عادلة). Jumlah saham tepat sama dengan Asal Masalah.`
      log.push({
        fase: 7,
        judul: "'Adilah — Perhitungan Normal",
        judul_arab: "المسألة العادلة",
        penjelasan:
          ada_ashabah
            ? `Sisa ${sisa_saham} saham diberikan ke Ashabah. Perhitungan 'Adilah (normal).`
            : `Total saham tepat sama dengan Asal Masalah (${asal_masalah}). Perhitungan sempurna.`,
      })
    }

    // Hitung saham Ashabah awal (sebelum Tashih)
    for (const aw of ashabah_aktif) {
      if (aw.pecahan_aktif === '1/6+sisa') {
        const saham_1_6 = pecahanKeSaham('1/6', asal_masalah)
        const saham_sisa_ini = sisa_saham > 0 ? sisa_saham : 0
        aw.saham_total = saham_1_6 + saham_sisa_ini
        sisa_saham = 0
      }
    }

    if (total_ruus_ashabah > 0 && sisa_saham > 0) {
      for (const aw of ashabah_aktif) {
        if (aw.pecahan_aktif === 'sisa' || aw.pecahan_aktif === 'sisa_2:1') {
          const ruusAw = aw.jumlah_orang * getRuusPerJiwa(aw)
          aw.saham_total = (sisa_saham * ruusAw) / total_ruus_ashabah
        }
      }
    }

    // Simpan saham asal sebelum Tashih
    for (const [, aw] of aktifMap) {
      if (aw.aktif && aw.saham_total !== undefined) {
        aw.saham_asal = Math.round(aw.saham_total * 100) / 100
      }
    }

    // ─── FASE 8: TASHIH AL-MASAIL ─────────────────────────────
    let asal_masalah_tashih = asal_masalah
    let juz_sahm = 1
    const mahfudzat: number[] = []
    const mahfudzat_detail: import('./types').MahfudzDetail[] = []

    // 1. Cek inkisar pada kelompok Ashabul Furudh
    for (const [, aw] of aktifMap) {
      if (!aw.aktif || !aw.saham_total || aw.jumlah_orang <= 1) continue
      if (aw.pecahan_aktif === 'sisa' || aw.pecahan_aktif === 'sisa_2:1') continue
      const saham = Math.round(aw.saham_total)
      const kepala = aw.jumlah_orang
      if (saham % kepala !== 0) {
        const rel = gcd(saham, kepala) > 1 ? 'muwafaqah' : 'mubayanah'
        const rel_arab = rel === 'muwafaqah' ? 'توافق' : 'تباين'
        const m = hitungMahfudzat(saham, kepala)
        if (m > 1) {
          mahfudzat.push(m)
          mahfudzat_detail.push({
            kode: aw.kode,
            nama_id: aw.nama_id,
            nama_arab: aw.nama_arab,
            saham_asal: saham,
            kepala,
            relasi: rel,
            relasi_arab: rel_arab,
            mahfudz: m,
          })
          aw.mahfudz = m
        }
      }
    }

    // 2. Cek inkisar pada kelompok Ashabah
    if (total_ruus_ashabah > 0 && sisa_saham > 0) {
      if (isBilGhairActive) {
        // Gabungan 2:1 (anak laki + anak perempuan, cucu, saudara)
        const sahamAshabah = sisa_saham
        const kepalaAshabah = total_ruus_ashabah
        if (sahamAshabah % kepalaAshabah !== 0) {
          const rel = gcd(sahamAshabah, kepalaAshabah) > 1 ? 'muwafaqah' : 'mubayanah'
          const rel_arab = rel === 'muwafaqah' ? 'توافق' : 'تباين'
          const m = hitungMahfudzat(sahamAshabah, kepalaAshabah)
          if (m > 1) {
            mahfudzat.push(m)
            mahfudzat_detail.push({
              kode: 'ashabah_bil_ghair',
              nama_id: 'Ashabah bil-Ghair (Rasio 2:1)',
              nama_arab: 'عصبة بالغير (٢:١)',
              saham_asal: sahamAshabah,
              kepala: kepalaAshabah,
              relasi: rel,
              relasi_arab: rel_arab,
              mahfudz: m,
            })
            for (const aw of ashabah_aktif) {
              aw.mahfudz = m
            }
          }
        }
      } else {
        // Murni Ashabah (misal: 2+ anak laki-laki, 3 paman)
        for (const aw of ashabah_aktif) {
          if (aw.jumlah_orang > 1) {
            const saham = sisa_saham
            const kepala = aw.jumlah_orang
            if (saham % kepala !== 0) {
              const rel = gcd(saham, kepala) > 1 ? 'muwafaqah' : 'mubayanah'
              const rel_arab = rel === 'muwafaqah' ? 'توافق' : 'تباين'
              const m = hitungMahfudzat(saham, kepala)
              if (m > 1) {
                mahfudzat.push(m)
                mahfudzat_detail.push({
                  kode: aw.kode,
                  nama_id: aw.nama_id,
                  nama_arab: aw.nama_arab,
                  saham_asal: saham,
                  kepala,
                  relasi: rel,
                  relasi_arab: rel_arab,
                  mahfudz: m,
                })
                aw.mahfudz = m
              }
            }
          }
        }
      }
    }

    // 3. Kasus Khusus Tashih (Akdariyyah & Musytarakah)
    if (kasusKhususAktif === 'akdariyyah') {
      // Kakek (1) + Saudari (3) = 4 saham digabung, ru'us = 3 (Kakek 2, Saudari 1). 4 % 3 !== 0 -> m = 3
      mahfudzat.push(3)
      mahfudzat_detail.push({
        kode: 'akdariyyah_gabungan',
        nama_id: 'Gabungan Kakek & Saudari (Al-Akdariyyah 2:1)',
        nama_arab: 'مجموع الجد والأخت (٢:١)',
        saham_asal: 4,
        kepala: 3,
        relasi: 'mubayanah',
        relasi_arab: 'تباين',
        mahfudz: 3,
      })
    } else if (kasusKhususAktif === 'musytarakah') {
      const seibu_lk = aktifMap.get('saudara_lk_seibu')
      const seibu_pr = aktifMap.get('saudari_seibu')
      const saudaraSkandung = aktifMap.get('saudara_lk_kandung')
      const total_sekutu = (seibu_lk?.jumlah_orang || 0) + (seibu_pr?.jumlah_orang || 0) + (saudaraSkandung?.jumlah_orang || 0)
      if (total_sekutu > 0 && 2 % total_sekutu !== 0) {
        const rel = gcd(2, total_sekutu) > 1 ? 'muwafaqah' : 'mubayanah'
        const m = hitungMahfudzat(2, total_sekutu)
        if (m > 1) {
          mahfudzat.push(m)
          mahfudzat_detail.push({
            kode: 'musytarakah_sekutu',
            nama_id: 'Sekutu 1/3 (Saudara Seibu & Kandung)',
            nama_arab: 'المشتركة في الثلث',
            saham_asal: 2,
            kepala: total_sekutu,
            relasi: rel,
            relasi_arab: rel === 'muwafaqah' ? 'توافق' : 'تباين',
            mahfudz: m,
          })
        }
      }
    }

    if (mahfudzat.length > 0) {
      juz_sahm = lcmArray(mahfudzat)
      asal_masalah_tashih = asal_masalah * juz_sahm
      status_penyelesaian = status_penyelesaian === 'adilah' ? 'tashih' : status_penyelesaian

      // Distribusi saham akhir setelah Tashih
      if (kasusKhususAktif === 'akdariyyah') {
        const suami = aktifMap.get('suami')
        const ibu = aktifMap.get('ibu')
        const kakek = aktifMap.get('kakek')
        const saudari = aktifMap.get('saudari_kandung')
        if (suami?.aktif) suami.saham_total = 3 * juz_sahm
        if (ibu?.aktif) ibu.saham_total = 2 * juz_sahm
        const combined = 4 * juz_sahm
        if (kakek?.aktif) kakek.saham_total = Math.round((combined * 2) / 3)
        if (saudari?.aktif) saudari.saham_total = Math.round((combined * 1) / 3)
      } else if (kasusKhususAktif === 'musytarakah') {
        const suami = aktifMap.get('suami')
        const ibu = aktifMap.get('ibu')
        if (suami?.aktif) suami.saham_total = 3 * juz_sahm
        if (ibu?.aktif) ibu.saham_total = 1 * juz_sahm
        const seibu_lk = aktifMap.get('saudara_lk_seibu')
        const seibu_pr = aktifMap.get('saudari_seibu')
        const saudaraSkandung = aktifMap.get('saudara_lk_kandung')
        const total_sekutu = (seibu_lk?.jumlah_orang || 0) + (seibu_pr?.jumlah_orang || 0) + (saudaraSkandung?.jumlah_orang || 0)
        const total_saham_sekutu = 2 * juz_sahm
        if (seibu_lk?.aktif) seibu_lk.saham_total = Math.round((total_saham_sekutu * seibu_lk.jumlah_orang) / total_sekutu)
        if (seibu_pr?.aktif) seibu_pr.saham_total = Math.round((total_saham_sekutu * seibu_pr.jumlah_orang) / total_sekutu)
        if (saudaraSkandung?.aktif) saudaraSkandung.saham_total = Math.round((total_saham_sekutu * saudaraSkandung.jumlah_orang) / total_sekutu)
      } else {
        // Kalikan semua Furudh dengan juz_sahm
        for (const [, aw] of aktifMap) {
          if (!aw.aktif || !aw.pecahan_aktif) continue
          if (aw.pecahan_aktif !== 'sisa' && aw.pecahan_aktif !== 'sisa_2:1' && aw.pecahan_aktif !== '1/6+sisa') {
            aw.saham_total = Math.round((aw.saham_asal || 0) * juz_sahm)
          }
        }

        // Alokasikan Ashabah setelah Tashih
        const sisa_tashih = sisa_saham * juz_sahm
        if (total_ruus_ashabah > 0 && sisa_tashih > 0) {
          for (const aw of ashabah_aktif) {
            if (aw.pecahan_aktif === 'sisa' || aw.pecahan_aktif === 'sisa_2:1') {
              const ruusAw = aw.jumlah_orang * getRuusPerJiwa(aw)
              aw.saham_total = Math.round((sisa_tashih * ruusAw) / total_ruus_ashabah)
            }
          }
        }
      }

      penjelasan_perpindahan += `\nDilakukan Tashih Mas'alah karena inkisâr pada ${mahfudzat_detail.length} kelompok. Juz' as-Sahm = ${juz_sahm}. Asal Masalah Tashih = ${asal_masalah} × ${juz_sahm} = ${asal_masalah_tashih}.`

      log.push({
        fase: 8,
        judul: "Tashih al-Masail — Penyelesaian Inkisâr (Pecahan Tidak Habis Bagi)",
        judul_arab: "تصحيح المسألة",
        penjelasan: `Ditemukan inkisâr pada ${mahfudzat_detail.length} kelompok ahli waris. Mahfudzat = [${mahfudzat.join(', ')}]. Juz' as-Sahm (Pengali) = ${juz_sahm}. Asal Masalah Tashih = ${asal_masalah} × ${juz_sahm} = ${asal_masalah_tashih}.`,
        detail: mahfudzat_detail.map(md => `${md.nama_id} (Saham ${md.saham_asal}, ${md.kepala} Kepala/Ru'us): Relasi ${md.relasi} (${md.relasi_arab}) → Mahfudz = ${md.mahfudz}`),
      })
    } else {
      log.push({
        fase: 8,
        judul: 'Tashih al-Masail — Tidak Diperlukan',
        judul_arab: 'تصحيح المسألة',
        penjelasan: 'Tidak ada inkisâr. Semua saham habis dibagi kepala ahli waris. Asal Masalah tidak perlu disesuaikan.',
      })
    }

    // ─── FASE 9: KALKULASI NOMINAL AKHIR ─────────────────────
    const hasil: HasilPerAhliWaris[] = []
    const nilai_satu_saham = asal_masalah_tashih > 0 ? harta_bersih / asal_masalah_tashih : 0

    const pecahanArabMap: Record<string, string> = {
      '1/2': 'النصف (١/٢)',
      '1/4': 'الربع (١/٤)',
      '1/8': 'الثمن (١/٨)',
      '2/3': 'الثلثان (٢/٣)',
      '1/3': 'الثلث (١/٣)',
      '1/6': 'السدس (١/٦)',
      'sisa': 'عصبة (ع)',
      'sisa_2:1': 'عصبة بالغير (ع)',
      '1/6+sisa': 'السدس + عصبة (١/٦ + ع)',
      '1/3_gabungan': 'الثلث مشترك (١/٣)',
    }

    const generateAlasanSyarat = (aw: AhliWarisAktif, listKode: string[]): string => {
      const hasAnakLk = listKode.includes('anak_lk')
      const hasAnakPr = listKode.includes('anak_pr')
      const hasCucuLk = listKode.includes('cucu_lk')
      const hasCucuPr = listKode.includes('cucu_pr')
      const hasFaru = hasAnakLk || hasAnakPr || hasCucuLk || hasCucuPr

      if (aw.kode === 'suami') {
        return hasFaru ? 'Mendapat 1/4 karena ada keturunan (anak/cucu) pewaris.' : 'Mendapat 1/2 karena tidak ada keturunan (anak/cucu) pewaris.'
      }
      if (aw.kode === 'istri') {
        return hasFaru ? `Mendapat 1/8${aw.jumlah_orang > 1 ? ' (dibagi rata)' : ''} karena ada keturunan pewaris.` : `Mendapat 1/4${aw.jumlah_orang > 1 ? ' (dibagi rata)' : ''} karena tidak ada keturunan pewaris.`
      }
      if (aw.kode === 'anak_lk') {
        return 'Ashabah bin-nafsih (mengambil seluruh sisa harta setelah ashabul furudh).'
      }
      if (aw.kode === 'anak_pr') {
        if (hasAnakLk) return 'Ashabah bil-ghair bersama anak laki-laki dengan rasio 2:1.'
        if (aw.jumlah_orang > 1) return 'Mendapat 2/3 karena berjumlah 2 orang atau lebih tanpa anak laki-laki.'
        return 'Mendapat 1/2 karena hanya 1 orang (tunggal) tanpa anak laki-laki.'
      }
      if (aw.kode === 'ayah') {
        if (hasAnakLk || hasCucuLk) return 'Mendapat 1/6 pasti karena ada keturunan laki-laki.'
        if (hasAnakPr || hasCucuPr) return 'Mendapat 1/6 + Sisa karena ada keturunan perempuan.'
        return 'Ashabah bin-nafsih (mengambil seluruh sisa harta karena tidak ada keturunan).'
      }
      if (aw.kode === 'ibu') {
        if (kasusKhususAktif?.includes('gharrawain')) return 'Mendapat 1/3 dari Sisa (Al-Gharrawain) bersama suami/istri dan ayah.'
        const ikhwahCount = (aktifMap.get('saudara_lk_kandung')?.jumlah_orang || 0) +
                            (aktifMap.get('saudari_kandung')?.jumlah_orang || 0) +
                            (aktifMap.get('saudara_lk_seayah')?.jumlah_orang || 0) +
                            (aktifMap.get('saudari_seayah')?.jumlah_orang || 0) +
                            (aktifMap.get('saudara_lk_seibu')?.jumlah_orang || 0) +
                            (aktifMap.get('saudari_seibu')?.jumlah_orang || 0)
        if (hasFaru || ikhwahCount >= 2) return 'Mendapat 1/6 karena ada keturunan atau terdapat 2 orang/lebih saudara.'
        return 'Mendapat 1/3 karena tidak ada keturunan dan tidak ada 2 orang/lebih saudara.'
      }
      if (aw.kode === 'cucu_lk') {
        return 'Ashabah bin-nafsih menggantikan kedudukan anak laki-laki.'
      }
      if (aw.kode === 'cucu_pr') {
        if (hasCucuLk) return 'Ashabah bil-ghair bersama cucu laki-laki (2:1).'
        if (hasAnakPr && !hasAnakLk) return 'Mendapat 1/6 sebagai pelengkap 2/3 (takmilah ats-tsulutsain) bersama 1 anak perempuan.'
        if (aw.jumlah_orang > 1) return 'Mendapat 2/3 karena 2+ orang tanpa anak kandung dan tanpa cucu laki-laki.'
        return 'Mendapat 1/2 karena tunggal tanpa anak kandung dan tanpa cucu laki-laki.'
      }
      if (aw.kode === 'saudara_lk_kandung') {
        return 'Ashabah bin-nafsih setelah garis keturunan dan ayah.'
      }
      if (aw.kode === 'saudari_kandung') {
        if (listKode.includes('saudara_lk_kandung')) return 'Ashabah bil-ghair bersama saudara laki-laki sekandung (2:1).'
        if (hasAnakPr || hasCucuPr) return 'Ashabah ma\'al-ghair (menjadi ashabah bersama anak/cucu perempuan).'
        if (aw.jumlah_orang > 1) return 'Mendapat 2/3 karena 2+ orang tanpa anak, ayah, atau saudara kandung laki-laki.'
        return 'Mendapat 1/2 karena tunggal tanpa anak, ayah, atau saudara kandung laki-laki.'
      }
      if (aw.kode === 'saudara_lk_seibu' || aw.kode === 'saudari_seibu') {
        if (aw.jumlah_orang > 1 || (aktifMap.get('saudara_lk_seibu')?.jumlah_orang || 0) + (aktifMap.get('saudari_seibu')?.jumlah_orang || 0) > 1) {
          return 'Mendapat 1/3 dibagi rata secara setara (tanpa membedakan gender) tanpa keturunan & ayah.'
        }
        return 'Mendapat 1/6 karena 1 orang tunggal tanpa keturunan dan tanpa ayah/kakek.'
      }
      return aw.jenis_ashabah ? 'Menerima sisa harta berdasarkan kaidah Ashabah.' : 'Menerima bagian pasti Furudh Muqaddarah.'
    }

    for (const [, aw] of aktifMap) {
      if (!aw.aktif) {
        const isHijab = aw.alasan_tidak_aktif?.includes('Terhalang')
        hasil.push({
          kode: aw.kode,
          nama_id: aw.nama_id,
          nama_arab: aw.nama_arab,
          jenis_kelamin: aw.jenis_kelamin,
          jumlah_orang: aw.jumlah_orang,
          status: isHijab ? 'gugur_hijab' : 'gugur_halangan',
          keterangan: aw.alasan_tidak_aktif,
          alasan_gugur: aw.alasan_tidak_aktif,
          pecahan: 'mahjub',
          pecahan_arab: 'م (محجوب)',
          saham_asal: 0,
          saham_tashih: 0,
          saham_total_kelompok: 0,
          saham_per_orang: 0,
          nominal_per_orang: 0,
          nominal_total_kelompok: 0,
        })
        continue
      }

      const saham_total = aw.saham_total || 0
      const saham_per_orang = aw.jumlah_orang > 0 ? saham_total / aw.jumlah_orang : saham_total
      const nominal_total = (saham_total / asal_masalah_tashih) * harta_bersih
      const nominal_per_orang = aw.jumlah_orang > 0 ? nominal_total / aw.jumlah_orang : nominal_total

      let statusHasil: HasilPerAhliWaris['status'] = 'furudh'
      if (aw.jenis_ashabah === 'bin_nafsih') statusHasil = 'ashabah_bin_nafsih'
      else if (aw.jenis_ashabah === 'bil_ghair') statusHasil = 'ashabah_bil_ghair'
      else if (aw.jenis_ashabah === 'maal_ghair') statusHasil = 'ashabah_maal_ghair'
      else if (kasusKhususAktif) statusHasil = 'kasus_khusus'

      const rumusNominal = aw.jumlah_orang > 1
        ? `Rp ${Math.round(nominal_total).toLocaleString('id-ID')} ÷ ${aw.jumlah_orang} Jiwa = Rp ${Math.round(nominal_per_orang).toLocaleString('id-ID')}`
        : `Rp ${Math.round(nominal_per_orang).toLocaleString('id-ID')}`

      hasil.push({
        kode: aw.kode,
        nama_id: aw.nama_id,
        nama_arab: aw.nama_arab,
        jenis_kelamin: aw.jenis_kelamin,
        jumlah_orang: aw.jumlah_orang,
        status: statusHasil,
        pecahan: aw.pecahan_aktif,
        pecahan_arab: aw.pecahan_aktif ? (pecahanArabMap[aw.pecahan_aktif] || aw.pecahan_aktif) : '—',
        alasan_syarat: generateAlasanSyarat(aw, kodeAktif()),
        saham_asal: aw.saham_asal !== undefined ? Math.round(aw.saham_asal * 100) / 100 : (aw.saham_total ? Math.round((aw.saham_total / juz_sahm) * 100) / 100 : 0),
        mahfudz: aw.mahfudz,
        saham_tashih: Math.round(saham_total),
        saham_per_orang: Math.round(saham_per_orang * 100) / 100,
        saham_total_kelompok: Math.round(saham_total * 100) / 100,
        nominal_per_orang: Math.round(nominal_per_orang),
        nominal_total_kelompok: Math.round(nominal_total),
        rumus_nominal_per_orang: rumusNominal,
        keterangan: aw.alasan_tidak_aktif,
      })
    }

    log.push({
      fase: 9,
      judul: 'Kalkulasi Nominal Akhir',
      judul_arab: 'حساب نصيب كل وارث',
      penjelasan: `Harta Bersih Rp${harta_bersih.toLocaleString('id-ID')} dibagi berdasarkan Asal Masalah Tashih = ${asal_masalah_tashih}. Setiap 1 saham bernilai Rp${Math.round(nilai_satu_saham).toLocaleString('id-ID')}.`,
      detail: hasil
        .filter(h => !['gugur_hijab', 'gugur_halangan'].includes(h.status))
        .map(h => `${h.nama_id} (×${h.jumlah_orang}): ${h.saham_total_kelompok} saham = Rp${h.nominal_total_kelompok?.toLocaleString('id-ID')}`),
    })

    return {
      harta_kotor: input.harta_kotor,
      biaya_tajhiz: input.biaya_tajhiz,
      hutang_terikat: input.hutang_terikat,
      hutang_biasa: input.hutang_biasa,
      wasiat: wasiat_efektif,
      total_harta_bersih: harta_bersih,
      kasus_khusus_aktif: kasusKhususAktif,
      asal_masalah_pokok,
      asal_masalah,
      asal_masalah_aul,
      asal_masalah_radd,
      asal_masalah_tashih,
      juz_sahm,
      nilai_satu_saham: Math.round(nilai_satu_saham),
      status_penyelesaian,
      mahfudzat_detail: mahfudzat_detail.length > 0 ? mahfudzat_detail : undefined,
      penjelasan_perpindahan,
      hasil,
      log_edukasi: log,
    }
  }

  // ─── HELPER: Cari pecahan furudh yang cocok ───────────────
  private cariPecahanFurudh(
    kode: string,
    jumlah: number,
    kodeAktif: string[],
    aktifMap: Map<string, AhliWarisAktif>
  ): string | null {
    const master = this.ahli_waris_master.find(a => a.kode === kode)
    if (!master) return null

    const rules = this.furudh_rules.filter(r => r.ahli_waris_id === master.id)

    for (const rule of rules) {
      // Cek syarat jumlah
      if (rule.syarat_jumlah_min && jumlah < rule.syarat_jumlah_min) continue
      if (rule.syarat_jumlah_max && jumlah > rule.syarat_jumlah_max) continue

      // Cek kondisi
      if (!this.cekKondisi(rule.syarat_kondisi, kodeAktif, aktifMap)) continue

      // Cek syarat tunggal untuk saudara seibu
      const cond = rule.syarat_kondisi as Record<string, unknown>
      if (cond.syarat_jumlah_tunggal && jumlah !== 1) continue

      return rule.pecahan
    }

    return null
  }

  // ─── HELPER: Cek kondisi JSONB ────────────────────────────
  private cekKondisi(
    kondisi: Record<string, unknown>,
    kodeAktif: string[],
    aktifMap: Map<string, AhliWarisAktif>
  ): boolean {
    // requires_absence_of
    const absOf = kondisi.requires_absence_of as string[] | undefined
    if (absOf) {
      for (const k of absOf) {
        if (k === 'saudara_2_atau_lebih_gabungan' || k === 'saudara_min2') {
          // Cek jumlah gabungan saudara/i (semua jenis)
          const total_saudara = this.hitungTotalSaudara(aktifMap)
          if (total_saudara >= 2) return false
        } else if (kodeAktif.includes(k)) {
          return false
        }
      }
    }

    // requires_presence_of_any
    const presAny = kondisi.requires_presence_of_any as string[] | undefined
    if (presAny) {
      let ada = false
      for (const k of presAny) {
        if (k === 'saudara_2_atau_lebih_gabungan') {
          if (this.hitungTotalSaudara(aktifMap) >= 2) { ada = true; break }
        } else if (kodeAktif.includes(k)) {
          ada = true; break
        }
      }
      if (!ada) return false
    }

    // or_requires_saudara_min
    const saudaraMin = kondisi.or_requires_saudara_min as number | undefined
    if (saudaraMin && this.hitungTotalSaudara(aktifMap) < saudaraMin) {
      // Ini bersifat OR dengan requires_presence_of_any — kalau sudah ada anak/cucu, kondisi or ini tidak relevan
      // Tangani di logika furudh_rule ibu secara khusus
    }

    // requires_saudara_max: ibu dapat 1/3 hanya jika saudara < 2
    const saudaraMax = kondisi.requires_saudara_max as number | undefined
    if (saudaraMax !== undefined && this.hitungTotalSaudara(aktifMap) > saudaraMax) return false

    return true
  }

  private hitungTotalSaudara(aktifMap: Map<string, AhliWarisAktif>): number {
    let total = 0
    const kode_saudara = [
      'saudara_lk_kandung', 'saudari_kandung',
      'saudara_lk_seayah', 'saudari_seayah',
      'saudara_lk_seibu', 'saudari_seibu',
    ]
    for (const k of kode_saudara) {
      const aw = aktifMap.get(k)
      if (aw?.aktif) total += aw.jumlah_orang
    }
    return total
  }

  // ─── HELPER: Deteksi kasus khusus ────────────────────────
  private cocokKasusKhusus(
    kk: KasusKhusus,
    kodeAktif: string[],
    aktifMap: Map<string, AhliWarisAktif>
  ): boolean {
    const p = kk.pemicu_kondisi as Record<string, unknown>

    if (kk.kode === 'gharrawain') {
      return (
        kodeAktif.includes('ibu') &&
        kodeAktif.includes('ayah') &&
        (kodeAktif.includes('suami') || kodeAktif.includes('istri')) &&
        !kodeAktif.includes('anak_lk') &&
        !kodeAktif.includes('anak_pr') &&
        !kodeAktif.includes('cucu_lk') &&
        !kodeAktif.includes('cucu_pr') &&
        this.hitungTotalSaudara(aktifMap) < 2
      )
    }

    if (kk.kode === 'musytarakah') {
      const adaSaudaraSkandung = kodeAktif.includes('saudara_lk_kandung')
      const adaSaudaraSeibu = (aktifMap.get('saudara_lk_seibu')?.jumlah_orang || 0) +
                              (aktifMap.get('saudari_seibu')?.jumlah_orang || 0) >= 2
      return (
        kodeAktif.includes('suami') &&
        kodeAktif.includes('ibu') &&
        adaSaudaraSkandung &&
        adaSaudaraSeibu &&
        !kodeAktif.includes('anak_lk') &&
        !kodeAktif.includes('anak_pr') &&
        !kodeAktif.includes('cucu_lk') &&
        !kodeAktif.includes('cucu_pr') &&
        !kodeAktif.includes('ayah')
      )
    }

    if (kk.kode === 'akdariyyah') {
      return (
        kodeAktif.includes('suami') &&
        kodeAktif.includes('ibu') &&
        kodeAktif.includes('kakek') &&
        kodeAktif.includes('saudari_kandung') &&
        !kodeAktif.includes('ayah') &&
        !kodeAktif.includes('anak_lk') &&
        !kodeAktif.includes('anak_pr') &&
        !kodeAktif.includes('cucu_lk') &&
        !kodeAktif.includes('cucu_pr')
      )
    }

    return false
  }

  // ─── HELPER: Alokasi Kasus Khusus ────────────────────────
  private alokasikanKasusKhusus(
    kode: string,
    aktifMap: Map<string, AhliWarisAktif>,
    _kodeAktif: () => string[]
  ) {
    if (kode === 'gharrawain') {
      const suami = aktifMap.get('suami')
      const istri = aktifMap.get('istri')
      const ibu = aktifMap.get('ibu')
      const ayah = aktifMap.get('ayah')

      const bagian_suami = suami?.aktif ? 1/2 : 0
      const bagian_istri = istri?.aktif ? 1/4 : 0
      const bagian_pasangan = bagian_suami || bagian_istri
      const sisa_setelah_pasangan = 1 - bagian_pasangan
      const bagian_ibu = sisa_setelah_pasangan / 3

      if (suami?.aktif) { suami.pecahan_aktif = '1/2'; suami.saham_total = 3 }
      if (istri?.aktif) { istri.pecahan_aktif = '1/4'; istri.saham_total = Math.round(1/4 * 12) }
      if (ibu?.aktif) { ibu.pecahan_aktif = '1/3 dari sisa'; }
      if (ayah?.aktif) { ayah.pecahan_aktif = 'sisa'; ayah.jenis_ashabah = 'bin_nafsih' }

    } else if (kode === 'musytarakah') {
      const suami = aktifMap.get('suami')
      const ibu = aktifMap.get('ibu')
      const saudaraSkandung = aktifMap.get('saudara_lk_kandung')

      if (suami?.aktif) suami.pecahan_aktif = '1/2'
      if (ibu?.aktif) ibu.pecahan_aktif = '1/6'
      // Saudara seibu + saudara kandung berbagi rata 1/3
      const seibu_lk = aktifMap.get('saudara_lk_seibu')
      const seibu_pr = aktifMap.get('saudari_seibu')
      if (seibu_lk?.aktif) seibu_lk.pecahan_aktif = '1/3_gabungan'
      if (seibu_pr?.aktif) seibu_pr.pecahan_aktif = '1/3_gabungan'
      if (saudaraSkandung?.aktif) saudaraSkandung.pecahan_aktif = '1/3_gabungan'

    } else if (kode === 'akdariyyah') {
      const suami = aktifMap.get('suami')
      const ibu = aktifMap.get('ibu')
      const kakek = aktifMap.get('kakek')
      const saudariKandung = aktifMap.get('saudari_kandung')

      // Suami 1/2, Ibu 1/3, Kakek 1/6, Saudari 1/2 → 'Aul ke 9
      // Lalu Kakek+Saudari gabung dibagi 2:1
      if (suami?.aktif) suami.pecahan_aktif = '1/2'
      if (ibu?.aktif) ibu.pecahan_aktif = '1/3'
      if (kakek?.aktif) kakek.pecahan_aktif = '1/6'
      if (saudariKandung?.aktif) saudariKandung.pecahan_aktif = '1/2'
      // Asal masalah = 9 (di-aul dari 6 → 1+3+1+3 = 8... ditangani di ta'shil)
    }
  }
}
