'use client'

import Link from 'next/link'
import {
  BookOpen,
  Calculator,
  Scale,
  Layers,
  ShieldAlert,
  Users,
  Clock,
  Trophy,
  ChevronRight,
  GraduationCap,
  Star,
  ArrowRight,
  Sparkles,
  BookMarked,
} from 'lucide-react'

const KONSEP_UTAMA = [
  {
    no: '١',
    judul: 'Tirkah',
    arab: 'التركة',
    warna: 'emerald',
    ringkasan: 'Harta peninggalan bersih setelah dikurangi biaya tajhiz jenazah, hutang, dan wasiat (maks 1/3 harta).',
    dalil: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ',
    sumber: 'QS. An-Nisa\': 11',
  },
  {
    no: '٢',
    judul: 'Furudh Muqaddarah',
    arab: 'الفروض المقدرة',
    warna: 'blue',
    ringkasan: '6 porsi pasti yang telah ditetapkan Al-Quran: 1/2, 1/4, 1/8, 2/3, 1/3, dan 1/6.',
    dalil: 'فَرِيضَةً مِنَ اللَّهِ',
    sumber: 'QS. An-Nisa\': 11–12',
  },
  {
    no: '٣',
    judul: 'Ashabah',
    arab: 'العصبة',
    warna: 'indigo',
    ringkasan: 'Penerima sisa harta. Terbagi: Bin-Nafsih (12 laki-laki), Bil-Ghair (2:1), dan Maal-Ghair (bersama anak pr).',
    dalil: 'اجْعَلُوا الْأَخَوَاتِ مَعَ الْبَنَاتِ عَصَبَةً',
    sumber: 'HR. Ibnu Mas\'ud',
  },
  {
    no: '٤',
    judul: 'Hijab Hirman',
    arab: 'الحجب الحرمان',
    warna: 'rose',
    ringkasan: 'Sistem terhalang total dari warisan. 33 relasi penghalang-terhalang yang saling mempengaruhi urutan waris.',
    dalil: 'الْجَدَّةُ تَسْقُطُ بِالْأُمِّ',
    sumber: 'Kaidah Fuqaha',
  },
  {
    no: '٥',
    judul: 'Asal Masalah',
    arab: 'أصل المسألة',
    warna: 'amber',
    ringkasan: 'Bilangan pokok (2, 3, 4, 6, 8, 12, 24) sebagai penyebut untuk menyamakan semua pecahan porsi waris.',
    dalil: '\'Aul, Radd & Tashih al-Masail',
    sumber: 'Kaidah Hisab',
  },
  {
    no: '٦',
    judul: 'Masalah Khusus',
    arab: 'المسائل الخاصة',
    warna: 'purple',
    ringkasan: '3 masalah istimewa: Al-Gharrawain (ibu 1/3 sisa), Al-Musytarakah (sekutu), dan Al-Akdariyyah (kakek & saudari).',
    dalil: 'الْمُشَرَّكَةُ وَالْأَكْدَرِيَّةُ',
    sumber: 'Ijma\' Fuqaha',
  },
]

const WARNAMAP: Record<string, { bg: string; border: string; text: string; badge: string; no: string }> = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800',
    no: 'bg-emerald-600 text-white',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
    no: 'bg-blue-600 text-white',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-900',
    badge: 'bg-indigo-100 text-indigo-800',
    no: 'bg-indigo-600 text-white',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-900',
    badge: 'bg-rose-100 text-rose-800',
    no: 'bg-rose-600 text-white',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    badge: 'bg-amber-100 text-amber-800',
    no: 'bg-amber-500 text-white',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    badge: 'bg-purple-100 text-purple-800',
    no: 'bg-purple-600 text-white',
  },
}

const DASAR_HUKUM = [
  {
    sumber: 'Al-Quran',
    arab: 'القرآن الكريم',
    isi: 'QS. An-Nisa\': 11–12, 176',
    desc: 'Ayat-ayat yang secara eksplisit menyebutkan porsi waris setiap ahli waris.',
  },
  {
    sumber: 'Hadis Nabi',
    arab: 'السنة النبوية',
    isi: 'HR. Bukhari & Muslim',
    desc: '"Bagikanlah harta warisan kepada ahlinya (ashab al-furudh), dan sisanya untuk laki-laki yang paling dekat."',
  },
  {
    sumber: 'Ijma\' Ulama',
    arab: 'إجماع العلماء',
    isi: 'Konsensus Fuqaha',
    desc: 'Ulama sepakat wajib mempelajari dan mengamalkan ilmu faraidh karena termasuk separuh ilmu.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* ═══ NAVBAR ═══════════════════════════════════════════════════ */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">FARAIDH</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">KMI GONTOR</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-none hidden sm:block">Sistem Kalkulator &amp; Edukasi Waris Islam</p>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <Link
              href="/latihan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Latihan Soal</span>
            </Link>
            <Link
              href="/kalkulator"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Kalkulator</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══ HERO SECTION ════════════════════════════════════════════ */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-40 translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          {/* Basmalah */}
          <p className="text-arabic text-2xl sm:text-3xl text-emerald-800 font-bold mb-6 tracking-wider leading-loose">
            بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-bold mb-5">
            <GraduationCap className="w-3.5 h-3.5" />
            Berdasarkan Kitab Faraidh Kelas 3 KMI Pondok Modern Darussalam Gontor
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Pelajari &amp; Praktikkan<br />
            <span className="text-emerald-700">Ilmu Faraidh</span> Secara Digital
          </h1>
          <p className="text-arabic text-xl sm:text-2xl text-slate-600 font-bold mb-5 leading-loose">
            علم الفرائض — علم الميراث الإسلامي
          </p>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Platform edukasi waris Islam berbasis Rules Engine yang menjalankan 9 fase kaidah syar&apos;i secara otomatis:
            dari pembersihan tirkah hingga pembagian nominal harta kepada 25 golongan ahli waris.
          </p>

          {/* Stats Row */}
          <div className="inline-flex flex-wrap items-center justify-center gap-6 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-600 mb-10 shadow-sm">
            {[
              { icon: Users, val: '25', label: 'Golongan Ahli Waris' },
              { icon: Scale, val: '6', label: 'Furudh Muqaddarah' },
              { icon: ShieldAlert, val: '33', label: 'Relasi Hijab Hirman' },
              { icon: Star, val: '3', label: 'Masalah Khusus' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <s.icon className="w-4 h-4 text-emerald-600" />
                <span><strong className="text-slate-900 text-base">{s.val}</strong> {s.label}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kalkulator"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <Calculator className="w-5 h-5" />
              Buka Kalkulator Faraidh
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/latihan"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-emerald-300 font-bold text-sm sm:text-base shadow-sm transition-all duration-200 group"
            >
              <Trophy className="w-5 h-5 text-amber-600" />
              Mulai Latihan Soal
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ APA ITU FARAIDH? ════════════════════════════════════════ */}
      <section className="py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2 block">Tentang Ilmu Ini</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Apa itu Ilmu Faraidh?</h2>
            <p className="text-arabic text-xl text-emerald-800 font-bold mb-3">ما هو علم الفرائض؟</p>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Ilmu Faraidh (علم الفرائض) adalah ilmu yang membahas tata cara pembagian harta warisan 
              menurut syariat Islam, meliputi siapa yang berhak menerima, berapa porsi masing-masing, 
              dan kondisi-kondisi yang mempengaruhi hak waris.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {DASAR_HUKUM.map(d => (
              <div key={d.sumber} className="card p-5 hover:border-emerald-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{d.sumber}</h3>
                    <p className="text-arabic text-base text-emerald-800 font-bold">{d.arab}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 whitespace-nowrap">
                    {d.isi}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{d.desc}&rdquo;</p>
              </div>
            ))}
          </div>

          {/* Penting Quote */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 sm:p-8 text-center">
            <p className="text-arabic text-xl sm:text-2xl font-bold leading-loose mb-2">
              تَعَلَّمُوا الْفَرَائِضَ وَعَلِّمُوهَا فَإِنَّهَا نِصْفُ الْعِلْمِ
            </p>
            <p className="text-sm text-emerald-200 font-medium">
              &ldquo;Pelajarilah ilmu faraidh dan ajarkanlah ia, karena sesungguhnya ia adalah separuh ilmu.&rdquo;
            </p>
            <p className="text-xs text-slate-400 mt-1">HR. Ibnu Majah &amp; Ad-Daraquthni</p>
          </div>
        </div>
      </section>

      {/* ═══ 6 KONSEP UTAMA ═════════════════════════════════════════ */}
      <section className="py-14 sm:py-16 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2 block">Materi Utama</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">6 Pilar Kaidah Faraidh</h2>
            <p className="text-arabic text-xl text-emerald-800 font-bold mb-3">أركان علم الميراث الستة</p>
            <p className="text-sm text-slate-600 max-w-2xl mx-auto">
              Berdasarkan kurikulum Kitab Ilmu Faraidh yang diajarkan di Kelas 3 KMI Gontor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KONSEP_UTAMA.map(k => {
              const c = WARNAMAP[k.warna]
              return (
                <div
                  key={k.judul}
                  className={`rounded-2xl border p-5 ${c.bg} ${c.border} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0 ${c.no} text-arabic`}>
                      {k.no}
                    </span>
                    <div>
                      <h3 className={`font-extrabold text-sm ${c.text}`}>{k.judul}</h3>
                      <p className={`text-arabic text-base font-bold ${c.text} opacity-80`}>{k.arab}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed mb-3">{k.ringkasan}</p>
                  <div className={`rounded-xl px-3 py-2 ${c.badge} border ${c.border}`}>
                    <p className="text-arabic text-sm font-bold leading-relaxed">{k.dalil}</p>
                    <p className="text-[10px] mt-0.5 font-semibold opacity-70">{k.sumber}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ FITUR PLATFORM ═════════════════════════════════════════ */}
      <section className="py-14 sm:py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 mb-2 block">Platform</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Mulai dari Mana?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Kalkulator */}
            <div className="card p-6 sm:p-7 border-2 border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white mb-4 shadow-sm group-hover:bg-emerald-700 transition-colors">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-1">Kalkulator Faraidh</h3>
              <p className="text-arabic text-base text-emerald-800 font-bold mb-3">حاسبة الفرائض الشرعية</p>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Input data pewaris dan ahli waris, dapatkan hasil pembagian lengkap dengan 9 fase kaidah, 
                preview format buku, dan log edukasi langkah demi langkah.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                {['25 Ahli Waris + Mawani\'', 'Hijab Hirman Otomatis', "Kasus 'Aul, Radd & Tashih", 'Preview Jadwal Syubbak'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/kalkulator"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
              >
                Buka Kalkulator
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Latihan Soal */}
            <div className="card p-6 sm:p-7 border-2 border-amber-200 bg-amber-50/30 hover:border-amber-400 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white mb-4 shadow-sm group-hover:bg-amber-600 transition-colors">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-slate-900 mb-1">Latihan Soal Interaktif</h3>
              <p className="text-arabic text-base text-amber-800 font-bold mb-3">التمارين والاختبارات التفاعلية</p>
              <p className="text-sm text-slate-600 leading-relaxed mb-5">
                Kerjakan soal-soal yang disiapkan oleh ustadz dalam mode ujian yang sesungguhnya. 
                Dengan timer, auto-penilaian, dan papan skor tertinggi.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 mb-6">
                {['Pilihan Ganda, Esay & Isi Tabel', 'Timer Pengerjaan', 'Auto-Penilaian Instan', 'Leaderboard Top 10'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/latihan"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all"
              >
                Lihat Soal &amp; Mulai Latihan
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Extra Features Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { icon: BookOpen, title: 'Ensiklopedia Kaidah', desc: 'Referensi lengkap Furudh, Ashabah & Kasus Khusus', color: 'text-blue-600' },
              { icon: Clock, title: 'Timer Ujian', desc: 'Pantau durasi pengerjaan soal real-time', color: 'text-indigo-600' },
              { icon: Sparkles, title: 'AI Generator Soal', desc: 'Soal dibuat oleh Gemini AI (untuk asatidz)', color: 'text-purple-600' },
              { icon: BookMarked, title: 'Format Buku Gontor', desc: 'Output dalam format Jadwal Syubbak klasik', color: 'text-emerald-600' },
            ].map(f => (
              <div key={f.title} className="card p-4 text-center hover:border-slate-300 transition-colors">
                <f.icon className={`w-6 h-6 mx-auto mb-2 ${f.color}`} />
                <h4 className="font-bold text-xs text-slate-900 mb-1">{f.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════= */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Scale className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-slate-900">FARAIDH</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">KMI GONTOR</span>
          </div>
          <p className="text-xs text-slate-600 font-medium mb-1">
            Sistem Edukasi Faraidh — Berdasarkan Kitab{' '}
            <span className="text-arabic text-base text-emerald-800 font-bold">علم الفرائض</span>{' '}
            Kelas 3 KMI Pondok Modern Darussalam Gontor
          </p>
          <p className="text-[11px] text-slate-400">
            Rules Engine berbasis Supabase · 9 Fase Kaidah Syar&apos;i · AI Powered (Gemini)
          </p>
        </div>
      </footer>
    </div>
  )
}
