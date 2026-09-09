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

    const kodeAktif = () => [...aktifMap.values()].filter(a => a.aktif).map(a => a.kode)

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
        // Pengecekan khusus: Saudari kandung menghalangi saudari seayah hanya jika sudah punya 2/3
        if (penghalang.kode === 'saudari_kandung' && terhalang.kode === 'saudari_seayah') {
          const jmlSkandung = aktifMap.get('saudari_kandung')?.jumlah_orang || 0
          const adaSaudaraSeayah = aktifMap.get('saudara_lk_seayah')?.aktif
          if (jmlSkandung < 3 || adaSaudaraSeayah) continue
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

    let asal_masalah = pecahan_list.length > 0 ? hitungAsalMasalah(pecahan_list) : 1

    // Hitung saham per ahli waris
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
      penjelasan: `Asal Masalah (penyebut pokok): ${asal_masalah}. Ini adalah KPK dari semua penyebut pecahan yang berlaku.`,
      detail: [
        `Pecahan aktif: ${pecahan_list.join(', ') || '— (murni Ashabah)'}`,
        `Asal Masalah = ${asal_masalah}`,
      ],
    })

    // ─── FASE 7: 'AUL / RADD ──────────────────────────────────
    let total_saham = 0
    for (const [, aw] of aktifMap) {
      if (!aw.aktif || !aw.saham_total) continue
      total_saham += aw.saham_total
    }

    const ada_ashabah = [...aktifMap.values()].some(
      a => a.aktif && (a.pecahan_aktif === 'sisa' || a.pecahan_aktif === 'sisa_2:1' || a.pecahan_aktif === '1/6+sisa')
    )

    let status_penyelesaian: StatusPenyelesaian = 'adilah'
    let sisa_saham = asal_masalah - total_saham

    if (kasusKhususAktif) {
      status_penyelesaian = 'kasus_khusus'
    } else if (total_saham > asal_masalah) {
      // 'AUL
      const asal_lama = asal_masalah
      asal_masalah = total_saham
      status_penyelesaian = 'aul'
      sisa_saham = 0
      log.push({
        fase: 7,
        judul: "'Aul — Saham Membengkak",
        judul_arab: "العَوْل",
        penjelasan: `Total saham (${total_saham}) melebihi Asal Masalah (${asal_lama}). Asal Masalah dinaikkan ke ${asal_masalah} ('Aul). Semua ahli waris menerima bagian yang dikecilkan secara proporsional.`,
      })
    } else if (sisa_saham > 0 && !ada_ashabah) {
      // RADD
      status_penyelesaian = 'radd'
      // Yang berhak radd (semua kecuali suami/istri)
      const berhak_radd = [...aktifMap.values()].filter(
        a => a.aktif && a.saham_total && a.kode !== 'suami' && a.kode !== 'istri'
      )
      const total_saham_radd = berhak_radd.reduce((s, a) => s + (a.saham_total || 0), 0)
      const asal_radd = total_saham_radd

      // Kalau ada suami/istri: mereka tidak dapat radd, asal masalah = total_saham_radd
      // Kalau tidak ada suami/istri: asal masalah = total_saham_radd
      asal_masalah = asal_radd > 0 ? asal_radd : asal_masalah

      log.push({
        fase: 7,
        judul: 'Radd — Sisa Saham Dikembalikan',
        judul_arab: 'الرَّد',
        penjelasan: `Masih ada sisa ${sisa_saham} saham dan tidak ada Ashabah. Sisa dikembalikan (Radd) ke ahli waris yang berhak secara proporsional. Asal Masalah disesuaikan ke ${asal_masalah}.`,
        detail: berhak_radd.map(a => `${a.nama_id}: Mendapat Radd proporsional dari saham ${a.saham_total}`),
      })
    } else {
      log.push({
        fase: 7,
        judul: status_penyelesaian === 'kasus_khusus' ? 'Kasus Khusus — Lihat Log Fase 2' : "'Adilah — Perhitungan Normal",
        judul_arab: status_penyelesaian === 'kasus_khusus' ? '' : "المسألة العادلة",
        penjelasan:
          ada_ashabah
            ? `Sisa ${sisa_saham} saham diberikan ke Ashabah. Perhitungan 'Adilah (normal).`
            : `Total saham tepat sama dengan Asal Masalah (${asal_masalah}). Perhitungan sempurna.`,
      })
    }

    // Hitung saham Ashabah
    const ashabah_aktif = [...aktifMap.values()].filter(
      a => a.aktif && (a.pecahan_aktif === 'sisa' || a.pecahan_aktif === 'sisa_2:1' || a.pecahan_aktif === '1/6+sisa')
    )

    for (const aw of ashabah_aktif) {
      if (aw.pecahan_aktif === '1/6+sisa') {
        const saham_1_6 = pecahanKeSaham('1/6', asal_masalah)
        const saham_sisa_ini = sisa_saham > 0 ? sisa_saham : 0
        aw.saham_total = saham_1_6 + saham_sisa_ini
        sisa_saham = 0
      }
    }

    if (ashabah_aktif.some(a => a.pecahan_aktif === 'sisa' || a.pecahan_aktif === 'sisa_2:1')) {
      // Hitung total "kepala" ashabah (2:1 ratio)
      let total_kepala_ashabah = 0
      for (const aw of ashabah_aktif) {
        if (aw.pecahan_aktif === 'sisa') {
          total_kepala_ashabah += aw.jumlah_orang
        } else if (aw.pecahan_aktif === 'sisa_2:1') {
          total_kepala_ashabah += aw.jumlah_orang  // +1 per kepala, akan dihitung 1:1 dengan penarik
        }
      }

      const saham_per_unit = sisa_saham / total_kepala_ashabah
      for (const aw of ashabah_aktif) {
        if (aw.pecahan_aktif === 'sisa' && !aw.saham_total) {
          aw.saham_total = saham_per_unit * aw.jumlah_orang
        } else if (aw.pecahan_aktif === 'sisa_2:1') {
          aw.saham_total = saham_per_unit * aw.jumlah_orang  // Bil ghair: 1 per kepala (penarik sudah 2)
        }
      }
    }

    // ─── FASE 8: TASHIH AL-MASAIL ─────────────────────────────
    let asal_masalah_tashih = asal_masalah
    let juz_sahm = 1
    const mahfudzat: number[] = []

    for (const [, aw] of aktifMap) {
      if (!aw.aktif || !aw.saham_total || aw.jumlah_orang <= 1) continue
      const saham = Math.round(aw.saham_total)
      const kepala = aw.jumlah_orang
      if (saham % kepala !== 0) {
        const m = hitungMahfudzat(saham, kepala)
        if (m > 1) mahfudzat.push(m)
      }
    }

    if (mahfudzat.length > 0) {
      juz_sahm = lcmArray(mahfudzat)
      asal_masalah_tashih = asal_masalah * juz_sahm
      status_penyelesaian = status_penyelesaian === 'adilah' ? 'tashih' : status_penyelesaian

      // Kalikan semua saham
      for (const [, aw] of aktifMap) {
        if (!aw.aktif || !aw.saham_total) continue
        aw.saham_total = aw.saham_total * juz_sahm
      }

      log.push({
        fase: 8,
        judul: "Tashih al-Masail — Penyelesaian Inkisâr (Pecahan Tidak Habis Bagi)",
        judul_arab: "تصحيح المسألة",
        penjelasan: `Ditemukan inkisâr (saham tidak habis dibagi kepala pewaris). Mahfudzat = [${mahfudzat.join(', ')}]. Juz' as-Sahm (Pengali) = ${juz_sahm}. Asal Masalah Tashih = ${asal_masalah} × ${juz_sahm} = ${asal_masalah_tashih}.`,
        detail: mahfudzat.map((m, i) => `Mahfudzat ${i + 1}: ${m}`),
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

    for (const [, aw] of aktifMap) {
      if (!aw.aktif) {
        hasil.push({
          kode: aw.kode,
          nama_id: aw.nama_id,
          nama_arab: aw.nama_arab,
          jenis_kelamin: aw.jenis_kelamin,
          jumlah_orang: aw.jumlah_orang,
          status: aw.alasan_tidak_aktif?.includes('Terhalang') ? 'gugur_hijab' : 'gugur_halangan',
          keterangan: aw.alasan_tidak_aktif,
          alasan_gugur: aw.alasan_tidak_aktif,
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

      hasil.push({
        kode: aw.kode,
        nama_id: aw.nama_id,
        nama_arab: aw.nama_arab,
        jenis_kelamin: aw.jenis_kelamin,
        jumlah_orang: aw.jumlah_orang,
        status: statusHasil,
        pecahan: aw.pecahan_aktif,
        saham_per_orang: Math.round(saham_per_orang * 100) / 100,
        saham_total_kelompok: Math.round(saham_total * 100) / 100,
        nominal_per_orang: Math.round(nominal_per_orang),
        nominal_total_kelompok: Math.round(nominal_total),
        keterangan: aw.alasan_tidak_aktif,
      })
    }

    log.push({
      fase: 9,
      judul: 'Kalkulasi Nominal Akhir',
      judul_arab: 'حساب نصيب كل وارث',
      penjelasan: `Harta Bersih Rp${harta_bersih.toLocaleString('id-ID')} dibagi berdasarkan Asal Masalah Tashih = ${asal_masalah_tashih}. Setiap saham bernilai Rp${Math.round(harta_bersih / asal_masalah_tashih).toLocaleString('id-ID')}.`,
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
      asal_masalah,
      asal_masalah_tashih,
      juz_sahm,
      status_penyelesaian,
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
