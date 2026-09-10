import { NextRequest, NextResponse } from 'next/server'
import { FaraidhEngine } from '@/lib/faraidh/engine'
import { SEED_RULES } from '@/data/seed-rules'
import type { SoalItem, SyubbakKunci, TipeSoal } from '@/lib/faraidh/types'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// ─── Konteks kaidah Faraidh untuk prompt ──────────────────────────────────

const FARAIDH_CONTEXT = `
Kamu adalah Dewan Penguji dan Ahli Fikih Faraidh (Ilmu Waris Islam) berdasarkan Kurikulum Resmi Kitab Faraidh Kelas 3 KMI Pondok Modern Darussalam Gontor.

Kaidah Fiqh & Faraidh:
1. 25 Golongan Ahli Waris:
   - Laki-laki (15): Suami, Anak Lk, Cucu Lk (anak lk), Ayah, Kakek (jalur ayah), Saudara Kandung, Saudara Seayah, Saudara Seibu, Keponakan Kandung (anak sdr lk kandung), Keponakan Seayah, Paman Kandung, Paman Seayah, Sepupu Kandung, Sepupu Seayah, Mu'tiq.
   - Perempuan (10): Istri, Anak Pr, Cucu Pr (anak lk), Ibu, Nenek Jalur Ibu, Nenek Jalur Ayah, Saudari Kandung, Saudari Seayah, Saudari Seibu, Mu'tiqah.
2. 6 Furudh Muqaddarah:
   - 1/2 (النصف), 1/4 (الربع), 1/8 (الثمن), 2/3 (الثلثان), 1/3 (الثلث), 1/6 (السدس).
3. 3 Kategori Ashabah:
   - Ashabah bin-Nafsih (12 pria pewaris sisa secara berurutan: jihat bunuwwah, ubuwwah, ukhuwwah, umumah).
   - Ashabah bil-Ghair (Anak Pr bersama Anak Lk, Cucu Pr bersama Cucu Lk, Saudari Kandung bersama Sdr Kandung, Saudari Seayah bersama Sdr Seayah, rasio 2:1).
   - Ashabah ma'al-Ghair (Saudari Kandung/Seayah bersama Anak Pr atau Cucu Pr).
4. Kaidah Hijab:
   - Hijab Hirman (gugur total): Contoh Anak Lk menggugurkan cucu, saudara/i, keponakan, paman. Ayah menggugurkan kakek & saudara/i. Ibu menggugurkan semua nenek. 2+ anak perempuan menggugurkan cucu perempuan (kecuali ada cucu laki-laki).
   - Hijab Nuqshan (penurunan porsi): Misal Suami 1/2 ➔ 1/4 karena ada anak/cucu; Istri 1/4 ➔ 1/8 karena ada anak/cucu; Ibu 1/3 ➔ 1/6 karena ada anak/cucu atau 2+ saudara/i.
5. Asal Masalah & Hisab:
   - Asal Masalah pokok: 2, 3, 4, 6, 8, 12, 24.
   - 'Aul: Saham melebihi Asal Masalah (6 ➔ 7,8,9,10; 12 ➔ 13,15,17; 24 ➔ 27).
   - Radd: Saham kurang dari Asal Masalah tanpa ashabah (dikembalikan ke ashabul furudh selain suami/istri).
   - Tashih: Perkalian Asal Masalah jika saham kelompok pecah/inkisar.
`

type TopikSoal = 'furudh' | 'hijab' | 'ashabah' | 'asal_masalah' | 'kasus_khusus' | 'umum'
type TipeSoalGenerasi = 'pilihan_ganda' | 'esay' | 'isi_tabel'
type KesulitanSoal = 'mudah' | 'sedang' | 'sulit'

function buildPrompt(
  topik: TopikSoal,
  tipe: TipeSoalGenerasi,
  kesulitan: KesulitanSoal,
  jumlah: number
): string {
  const topikDesc = {
    furudh: 'Furudh Muqaddarah (6 porsi syar\'i dalam Al-Quran beserta syarat-syaratnya)',
    hijab: 'Hijab Hirman (pengguguran total) dan Hijab Nuqshan (penurunan porsi)',
    ashabah: 'Ashabah bin-Nafsih, Bil-Ghair (2:1), dan Ma\'al-Ghair (saudari bersama anak/cucu pr)',
    asal_masalah: "Asal Masalah Pokok, Masalah 'Aul, Radd, dan Tashih (inkisar)",
    kasus_khusus: 'Masalah Khusus: Al-Gharrawain (Al-Umariyyatain), Al-Musytarakah, Al-Akdariyyah',
    umum: 'Kombinasi Fiqh Faraidh & Kasus Pembagian Waris Nyata (Komprehensif)',
  }[topik]

  const kesulitanDesc = {
    mudah: 'soal dasar/fundamental, menguji pemahaman kaidah langsung',
    sedang: 'soal studi kasus standar ujian semester KMI Gontor',
    sulit: 'soal kompleks kombinasi banyak ahli waris, hijab, dan pembagian hisab',
  }[kesulitan]

  if (tipe === 'pilihan_ganda') {
    return `${FARAIDH_CONTEXT}

Buat ${jumlah} soal pilihan ganda bermutu tinggi tentang topik: ${topikDesc}
Tingkat kesulitan: ${kesulitanDesc}

Ketentuan:
1. Pertanyaan jelas, aplikatif, dan mendidik. Boleh menyertakan istilah/teks bahasa Arab.
2. Sediakan 4 opsi jawaban (A, B, C, D) yang realistis.
3. Tepat 1 opsi bernilai benar (benar: true) dan 3 lainnya bernilai salah (benar: false).
4. Berikan "jawaban_benar" (A/B/C/D) dan "petunjuk" berupa penjelasan dalil/kaidah fikihnya.

WAJIB return HANYA JSON array tanpa markdown/teks pembuka. Format:
[
  {
    "pertanyaan": "Teks soal dalam bahasa Indonesia yang lengkap dan jelas",
    "pertanyaan_arab": "النص العربي للسؤال (opsional)",
    "opsi_jawaban": [
      {"label": "A", "teks": "Pilihan A", "benar": false},
      {"label": "B", "teks": "Pilihan B", "benar": true},
      {"label": "C", "teks": "Pilihan C", "benar": false},
      {"label": "D", "teks": "Pilihan D", "benar": false}
    ],
    "jawaban_benar": "B",
    "skor_maksimal": 10,
    "petunjuk": "Kaidah fikih: ..."
  }
]`
  }

  if (tipe === 'esay') {
    return `${FARAIDH_CONTEXT}

Buat ${jumlah} soal esay analisis kasus faraidh tentang topik: ${topikDesc}
Tingkat kesulitan: ${kesulitanDesc}

Ketentuan:
1. Pertanyaan memuat kasus kematian seseorang dengan daftar ahli waris dan nominal tirkah (opsional).
2. Kunci jawaban ("jawaban_benar") HARUS LENGKAP memuat rincian langkah demi langkah:
   - Porsi tiap ahli waris (furudh / ashabah / mahjub)
   - Penentuan Asal Masalah pokok & akhir ('Aul / Tashih jika ada)
   - Saham masing-masing
   - Pembagian nominal tirkah (jika ada)
3. Petunjuk pengerjaan.

WAJIB return HANYA JSON array tanpa teks lain. Format:
[
  {
    "pertanyaan": "Kasus kematian: Seseorang meninggal dunia dan meninggalkan...",
    "pertanyaan_arab": "توفي شخص وترك...",
    "konteks_kasus": {
      "ahli_waris": [{"kode": "suami", "jumlah_orang": 1}, {"kode": "anak_pr", "jumlah_orang": 2}],
      "harta": 120000000
    },
    "jawaban_benar": "1. Suami mendapat 1/4... 2. 2 Anak Perempuan mendapat 2/3... Asal Masalah 12... Saham Suami = 3, Saham Anak Pr = 8...",
    "skor_maksimal": 20,
    "petunjuk": "Tentukan porsi furudh, asal masalah, saham, dan nominal tiap ahli waris."
  }
]`
  }

  // Tipe: isi_tabel (Jadwal Syubbak)
  return `${FARAIDH_CONTEXT}

Buat ${jumlah} soal tabel Jadwal Syubbak (جدول الشباك) tentang topik: ${topikDesc}
Tingkat kesulitan: ${kesulitanDesc}

Ketentuan:
1. Soal berupa redaksi kasus kematian seseorang dengan komposisi ahli waris yang bervariasi dari 25 golongan ahli waris.
2. Cantumkan array "ahli_waris" dalam "konteks_kasus" dengan kode yang valid.
   Kode valid: suami, istri, anak_lk, anak_pr, cucu_lk, cucu_pr, ayah, ibu, kakek, nenek_ibu, nenek_ayah, saudara_lk_kandung, saudari_kandung, saudara_lk_seayah, saudari_seayah, saudara_lk_seibu, saudari_seibu, keponakan_lk_kandung, keponakan_lk_seayah, paman_kandung, paman_seayah, sepupu_lk_paman_kandung, sepupu_lk_paman_seayah.
3. Cantumkan nominal "harta" (kelipatan juta, misal 120000000, 240000000, 360000000) atau 0 jika tanpa nominal.

WAJIB return HANYA JSON array tanpa teks lain. Format:
[
  {
    "pertanyaan": "Seseorang meninggal dunia dan meninggalkan ahli waris: 1 Istri, 2 Anak Perempuan, dan Ibu. Harta tirkah bersih sebesar Rp 240.000.000. Selesaikan pembagian waris dalam Jadwal Syubbak!",
    "pertanyaan_arab": "توفي شخص وترك: زوجة، وبنتين، وأما. والتركة ٢٤٠،٠٠٠،٠٠٠ روبية. استخرج الفروض وأصل المسألة والسهام في جدول الشباك!",
    "konteks_kasus": {
      "ahli_waris": [
        {"kode": "istri", "jumlah_orang": 1},
        {"kode": "anak_pr", "jumlah_orang": 2},
        {"kode": "ibu", "jumlah_orang": 1}
      ],
      "harta": 240000000
    },
    "skor_maksimal": 20,
    "petunjuk": "Tentukan porsi masing-masing, tentukan asal masalah pokok, lalu hitung saham dan nominal bagian tiap ahli waris."
  }
]`
}

// ─── API Route Handler ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API key tidak dikonfigurasi' }, { status: 500 })
  }

  try {
    const { topik, tipe, kesulitan, jumlah = 3 } = await req.json()
    const prompt = buildPrompt(topik, tipe, kesulitan, Math.min(jumlah, 10))

    // Call Gemini API
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    )

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini API error:', errText)
      return NextResponse.json(
        { error: `Gemini API gagal: ${geminiRes.status}` },
        { status: 502 }
      )
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extract JSON from response
    const jsonMatch =
      rawText.match(/```json\s*([\s\S]*?)\s*```/) ||
      rawText.match(/```\s*([\s\S]*?)\s*```/) ||
      rawText.match(/(\[[\s\S]*\])/)

    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText.trim()

    let parsedList: any[]
    try {
      parsedList = JSON.parse(jsonStr)
    } catch {
      const start = rawText.indexOf('[')
      const end = rawText.lastIndexOf(']')
      if (start !== -1 && end !== -1) {
        parsedList = JSON.parse(rawText.substring(start, end + 1))
      } else {
        throw new Error('Gagal memproses struktur JSON dari Gemini AI')
      }
    }

    // ─── Post-Process & Enrich Questions with FaraidhEngine ───────────────
    const engine = new FaraidhEngine(SEED_RULES)

    const enrichedSoalList = parsedList.map((item, idx) => {
      const itemTipe: TipeSoal = item.tipe || tipe || 'pilihan_ganda'
      
      // Default structure
      const processed: Partial<SoalItem> = {
        urutan: idx + 1,
        tipe: itemTipe,
        pertanyaan: item.pertanyaan || 'Pertanyaan Faraidh',
        pertanyaan_arab: item.pertanyaan_arab || undefined,
        skor_maksimal: item.skor_maksimal || (itemTipe === 'pilihan_ganda' ? 10 : 20),
        petunjuk: item.petunjuk || undefined,
      }

      // If Pilihan Ganda: Validate & Ensure correct options
      if (itemTipe === 'pilihan_ganda') {
        let opsi = item.opsi_jawaban || []
        if (!Array.isArray(opsi) || opsi.length < 2) {
          opsi = [
            { label: 'A', teks: 'Opsi A', benar: item.jawaban_benar === 'A' },
            { label: 'B', teks: 'Opsi B', benar: item.jawaban_benar === 'B' || item.jawaban_benar === undefined },
            { label: 'C', teks: 'Opsi C', benar: item.jawaban_benar === 'C' },
            { label: 'D', teks: 'Opsi D', benar: item.jawaban_benar === 'D' },
          ]
        }

        // Ensure exactly one correct answer
        const hasBenar = opsi.some((o: any) => o.benar)
        if (!hasBenar && item.jawaban_benar) {
          const matchLabel = String(item.jawaban_benar).trim().toUpperCase()
          opsi = opsi.map((o: any) => ({ ...o, benar: o.label.toUpperCase() === matchLabel }))
        }
        if (!opsi.some((o: any) => o.benar)) {
          opsi[0].benar = true
        }

        const correctOpt = opsi.find((o: any) => o.benar)
        processed.opsi_jawaban = opsi
        processed.jawaban_benar = correctOpt ? correctOpt.label : 'A'
      }

      // If Esay: Ensure clear model answer
      if (itemTipe === 'esay') {
        processed.jawaban_benar = item.jawaban_benar || 'Kunci jawaban esay.'
      }

      // If Isi Tabel (Jadwal Syubbak): Build authentic SyubbakKunci via Engine
      if (itemTipe === 'isi_tabel') {
        let warisList: { kode: string; count: number }[] = []

        if (item.konteks_kasus?.ahli_waris && Array.isArray(item.konteks_kasus.ahli_waris)) {
          warisList = item.konteks_kasus.ahli_waris.map((w: any) => ({
            kode: w.kode,
            count: Number(w.jumlah_orang || w.count || 1),
          }))
        } else if (item.data_isi_tabel?.syubbak?.baris) {
          warisList = item.data_isi_tabel.syubbak.baris.map((b: any) => ({
            kode: b.kode,
            count: Number(b.jumlah_orang || 1),
          }))
        }

        // Fallback default case if AI didn't provide heirs list
        if (warisList.length === 0) {
          warisList = [
            { kode: 'istri', count: 1 },
            { kode: 'anak_pr', count: 2 },
            { kode: 'ibu', count: 1 },
          ]
        }

        const tirkahHarta = Number(item.konteks_kasus?.harta || item.data_isi_tabel?.syubbak?.total_harta || 0)

        // Calculate verified mathematical & syar'i solution with FaraidhEngine
        try {
          const calcRes = engine.hitung({
            nama_pewaris: 'Soal Ujian AI',
            harta_kotor: tirkahHarta > 0 ? tirkahHarta : 120000000,
            biaya_tajhiz: 0,
            hutang_terikat: 0,
            hutang_biasa: 0,
            wasiat: 0,
            ahli_waris_list: warisList.map(w => ({
              kode: w.kode,
              jumlah_orang: w.count,
              halangan: 'tidak_ada',
            })),
          })

          const isAulOrTashih =
            calcRes.asal_masalah_tashih !== calcRes.asal_masalah_pokok ||
            Boolean(calcRes.asal_masalah_aul)

          const finalAsal =
            calcRes.asal_masalah_tashih !== calcRes.asal_masalah_pokok
              ? calcRes.asal_masalah_tashih
              : (calcRes.asal_masalah_aul || calcRes.asal_masalah_pokok)

          const syubbak: SyubbakKunci = {
            total_harta: tirkahHarta > 0 ? tirkahHarta : undefined,
            asal_masalah_pokok: calcRes.asal_masalah_pokok,
            asal_masalah_akhir: isAulOrTashih ? finalAsal : undefined,
            status_penyelesaian: calcRes.status_penyelesaian,
            simbol_status:
              calcRes.status_penyelesaian === 'aul'
                ? 'ع'
                : calcRes.status_penyelesaian === 'radd'
                ? 'رد'
                : undefined,
            baris: calcRes.hasil.map(h => {
              const isHijab = h.status === 'gugur_hijab' || h.status === 'gugur_halangan'
              return {
                kode: h.kode,
                nama_id: h.nama_id,
                nama_arab: h.nama_arab,
                jumlah_orang: h.jumlah_orang,
                porsi_benar: isHijab ? 'mahjub' : (h.pecahan || 'ع'),
                porsi_arab: isHijab ? 'م' : (h.pecahan_arab || 'ع'),
                saham_benar: isHijab ? 0 : (h.saham_tashih ?? h.saham_asal ?? 0),
                nominal_benar: (tirkahHarta > 0 && !isHijab) ? (h.nominal_total_kelompok ?? 0) : undefined,
                is_hijab: isHijab,
              }
            }),
          }

          processed.konteks_kasus = {
            ahli_waris: warisList.map(w => ({ kode: w.kode, jumlah_orang: w.count })),
            harta: tirkahHarta,
          }
          processed.data_isi_tabel = { syubbak }
          processed.jawaban_benar =
            `Asal Masalah: ${calcRes.asal_masalah_pokok}${isAulOrTashih ? ' ➔ ' + finalAsal : ''}. ` +
            calcRes.hasil
              .map(h => `${h.nama_id}: ${h.status === 'gugur_hijab' ? 'Mahjub (م)' : h.pecahan + ' (Saham: ' + (h.saham_tashih ?? h.saham_asal ?? 0) + ')'}`)
              .join(', ')
        } catch (calcErr) {
          console.error('Engine calculation for AI question failed:', calcErr)
        }
      }

      return processed
    })

    return NextResponse.json({ soalList: enrichedSoalList, raw: rawText })
  } catch (error) {
    console.error('Generate soal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan saat generate soal' },
      { status: 500 }
    )
  }
}
