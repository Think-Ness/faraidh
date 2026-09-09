import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Kalkulator Faraidh — Ilmu Waris Islam (Kurikulum Gontor)'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          backgroundColor: '#f8fafc',
          backgroundImage: 'radial-gradient(circle at 50% 10%, #ecfdf5 0%, #f8fafc 70%)',
          fontFamily: 'sans-serif',
          color: '#0f172a',
          position: 'relative',
        }}
      >
        {/* Border Accent Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            background: 'linear-gradient(90deg, #059669 0%, #10b981 50%, #047857 100%)',
          }}
        />

        {/* Top Header Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                backgroundColor: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 16px rgba(5, 150, 105, 0.25)',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
                <path d="M7 21h10" />
                <path d="M12 3v18" />
                <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', color: '#0f172a' }}>
                  FARAIDH
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 20,
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  KMI GONTOR
                </span>
              </div>
              <span style={{ fontSize: 15, color: '#64748b', fontWeight: 600 }}>
                Kalkulator & Edukasi Ilmu Waris Islam
              </span>
            </div>
          </div>

          {/* Arabic Label */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#065f46' }}>
              علم الفرائض والمواريث
            </span>
          </div>
        </div>

        {/* Center Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 16,
            maxWidth: 960,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#047857',
              letterSpacing: '1px',
            }}
          >
            بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
          </div>

          <div
            style={{
              fontSize: 46,
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#0f172a',
              letterSpacing: '-1px',
            }}
          >
            Kalkulator Pembagian Waris Islam Langkah Demi Langkah
          </div>

          <div
            style={{
              fontSize: 20,
              color: '#475569',
              lineHeight: 1.4,
              maxWidth: 820,
            }}
          >
            Berdasarkan Kitab Faraidh Kelas 3 KMI Pondok Modern Darussalam Gontor secara transparan, akurat, dan syar'i.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 22px',
              borderRadius: 16,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              fontSize: 16,
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            <span style={{ color: '#059669', fontSize: 20 }}>✓</span>
            <span>25 Ahli Waris Lengkap</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 22px',
              borderRadius: 16,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              fontSize: 16,
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            <span style={{ color: '#059669', fontSize: 20 }}>✓</span>
            <span>9 Fase Kaidah Syar'i & Derivasi Log</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 22px',
              borderRadius: 16,
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              fontSize: 16,
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            <span style={{ color: '#059669', fontSize: 20 }}>✓</span>
            <span>Kasus Khusus: Gharrawain, Musytarakah, Akdariyyah</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
