import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// ─── Konteks kaidah Faraidh untuk prompt ──────────────────────────────────

const FARAIDH_CONTEXT = `
Kamu adalah ahli Ilmu Faraidh (waris Islam) berdasarkan kurikulum Kitab Faraidh Kelas 3 KMI Pondok Modern Darussalam Gontor.

Data kaidah yang kamu tahu:
- 25 Ahli Waris: Suami, Istri (1-4 orang), Anak Lk, Anak Pr, Cucu Lk (dari anak lk), Cucu Pr (dari anak lk), Ayah, Ibu, Kakek Shahih, Nenek (dari ibu), Nenek (dari ayah), Saudara/ri Sekandung, Saudara/ri Seayah, Saudara/ri Seibu, Keponakan Lk (dari saudara lk kandung/seayah), Paman (kandung/seayah), Sepupu Lk Paman
- 6 Furudh Muqaddarah: 1/2 (النصف), 1/4 (الربع), 1/8 (الثمن), 2/3 (الثلثان), 1/3 (الثلث), 1/6 (السدس)
- 3 Jenis Ashabah: Bin-Nafsih (12 orang lk berurutan), Bil-Ghair (saudara lk+saudari, rasio 2:1), Maal-Ghair (saudari+anak pr)
- Hijab Hirman: 33 relasi penghalang (contoh: Anak Lk menghalangi Cucu Lk, Ayah, Kakek, semua saudara/ri)
- Masalah Khusus: Al-Gharrawain, Al-Musytarakah, Al-Akdariyyah
- Kasus Tashih al-Masail: KPK dari kepala (ru'us) ashabah jika pecahan tidak bulat
- Asal Masalah pokok: 2, 3, 4, 6, 8, 12, 24
- 'Aul: ketika saham melebihi asal masalah
- Radd: ketika sisa harta dikembalikan ke ashab al-furudh (kecuali suami/istri)
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
    furudh: 'Furudh Muqaddarah (6 jenis porsi pasti dalam Al-Quran)',
    hijab: 'Hijab Hirman (siapa menghalangi siapa) dan Hijab Nuqshan (penurunan porsi)',
    ashabah: 'Ashabah bin-Nafsih, Bil-Ghair, dan Maal-Ghair beserta urutan dan syaratnya',
    asal_masalah: "Asal Masalah Pokok, 'Aul, Radd, dan Tashih al-Masail",
    kasus_khusus: 'Masalah Khusus: Al-Gharrawain, Al-Musytarakah, dan Al-Akdariyyah',
    umum: 'Semua topik Ilmu Faraidh secara komprehensif',
  }[topik]

  const kesulitanDesc = {
    mudah: 'soal dasar, satu konsep, langsung, cocok untuk pemula',
    sedang: 'soal sedang, kombinasi 2-3 konsep, butuh pemahaman kaidah',
    sulit: 'soal kompleks, kombinasi banyak kaidah, mirip soal ujian semester',
  }[kesulitan]

  if (tipe === 'pilihan_ganda') {
    return `${FARAIDH_CONTEXT}

Buat ${jumlah} soal pilihan ganda tentang topik: ${topikDesc}
Tingkat kesulitan: ${kesulitanDesc}

WAJIB return HANYA JSON array, tidak ada teks lain. Format:
[
  {
    "pertanyaan": "Teks soal yang jelas dan edukatif",
    "pertanyaan_arab": "النص العربي للسؤال (opsional, jika relevan)",
    "konteks_kasus": {
      "ahli_waris": [{"kode": "suami", "jumlah_orang": 1}, {"kode": "anak_pr", "jumlah_orang": 2}],
      "harta": 120000000,
      "keterangan": "Keterangan singkat skenario (opsional)"
    },
    "opsi_jawaban": [
      {"label": "A", "teks": "Teks opsi A", "benar": false},
      {"label": "B", "teks": "Teks opsi B", "benar": true},
      {"label": "C", "teks": "Teks opsi C", "benar": false},
      {"label": "D", "teks": "Teks opsi D", "benar": false}
    ],
    "jawaban_benar": "B",
    "skor_maksimal": 10,
    "petunjuk": "Petunjuk pengerjaan atau rumus kaidah yang relevan"
  }
]

Kode ahli waris yang valid: anak_lk, anak_pr, cucu_lk, cucu_pr, ayah, ibu, kakek, nenek_ibu, nenek_ayah, saudara_lk_kandung, saudari_kandung, saudara_lk_seayah, saudari_seayah, saudara_lk_seibu, saudari_seibu, keponakan_lk_kandung, keponakan_lk_seayah, paman_kandung, paman_seayah, suami, istri

Harta dalam Rupiah (kelipatan juta). Pastikan jawaban matematis 100% benar.`
  }

  if (tipe === 'esay') {
    return `${FARAIDH_CONTEXT}

Buat ${jumlah} soal esay tentang topik: ${topikDesc}
Tingkat kesulitan: ${kesulitanDesc}

WAJIB return HANYA JSON array, tidak ada teks lain. Format:
[
  {
    "pertanyaan": "Teks soal esay yang membutuhkan penjelasan/perhitungan",
    "pertanyaan_arab": "النص العربي للسؤال (opsional)",
    "konteks_kasus": {
      "ahli_waris": [{"kode": "suami", "jumlah_orang": 1}],
      "harta": 120000000,
      "keterangan": "Keterangan skenario"
    },
    "jawaban_benar": "Kunci jawaban lengkap untuk diperiksa guru: langkah demi langkah termasuk saham, asal masalah, dan nominal",
    "skor_maksimal": 20,
    "petunjuk": "Petunjuk format jawaban yang diharapkan"
  }
]`
  }

  // isi_tabel
  return `${FARAIDH_CONTEXT}

Buat ${jumlah} soal isi tabel (jadwal syubbak) tentang topik: ${topikDesc}
Tingkat kesulitan: ${kesulitanDesc}

Santri harus mengisi kolom-kolom yang kosong (is_blank: true) dalam tabel.

WAJIB return HANYA JSON array, tidak ada teks lain. Format:
[
  {
    "pertanyaan": "Teks soal yang menjelaskan apa yang harus dilakukan santri",
    "konteks_kasus": {
      "ahli_waris": [{"kode": "suami", "jumlah_orang": 1}, {"kode": "anak_pr", "jumlah_orang": 2}],
      "harta": 120000000,
      "keterangan": "Skenario kasus"
    },
    "data_isi_tabel": {
      "judul_kolom": ["Ahli Waris", "Jiwa", "Porsi Syari", "Saham", "Nominal (Rp)"],
      "baris": [
        {
          "nama_waris": "Suami",
          "nama_arab": "الزوج",
          "kolom": [
            {"header": "Ahli Waris", "kode_kolom": "nama", "is_blank": false, "jawaban_benar": "Suami"},
            {"header": "Jiwa", "kode_kolom": "jiwa", "is_blank": false, "jawaban_benar": "1"},
            {"header": "Porsi Syari", "kode_kolom": "porsi", "is_blank": true, "jawaban_benar": "1/4"},
            {"header": "Saham", "kode_kolom": "saham", "is_blank": true, "jawaban_benar": "3"},
            {"header": "Nominal (Rp)", "kode_kolom": "nominal", "is_blank": true, "jawaban_benar": "30000000"}
          ]
        }
      ]
    },
    "skor_maksimal": 20,
    "petunjuk": "Isi kolom yang kosong berdasarkan kaidah Faraidh yang berlaku"
  }
]

Pastikan jawaban matematis benar. Asal masalah dan saham harus konsisten.`
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

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/) ||
                      rawText.match(/```\s*([\s\S]*?)\s*```/) ||
                      rawText.match(/(\[[\s\S]*\])/)

    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : rawText.trim()

    let soalList
    try {
      soalList = JSON.parse(jsonStr)
    } catch {
      // Try to find JSON array in text
      const start = rawText.indexOf('[')
      const end = rawText.lastIndexOf(']')
      if (start !== -1 && end !== -1) {
        soalList = JSON.parse(rawText.substring(start, end + 1))
      } else {
        throw new Error('Gagal parse JSON dari Gemini response')
      }
    }

    return NextResponse.json({ soalList, raw: rawText })
  } catch (error) {
    console.error('Generate soal error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
