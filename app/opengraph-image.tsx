import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'G3NE5IS holdingová společnost — Prémiové podnikové dluhopisy';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #012B12 0%, #063819 50%, #0d4a24 100%)',
          padding: '60px 80px',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Top gold bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '8px',
            display: 'flex',
            background: 'linear-gradient(90deg, #C8A96E 0%, #DFC090 50%, #C8A96E 100%)',
          }}
        />

        {/* Top Header Lockup */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, letterSpacing: '-1px' }}>
              <span>G3NE</span>
              <span style={{ color: '#C8A96E' }}>5</span>
              <span>IS</span>
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 14,
                letterSpacing: '3px',
                color: '#C8A96E',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              <span>holdingová společnost s.r.o.</span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(200, 169, 110, 0.12)',
              border: '1.5px solid #C8A96E',
              borderRadius: '30px',
              padding: '10px 24px',
              fontSize: 18,
              fontWeight: 700,
              color: '#DFC090',
            }}
          >
            <span>IČO: 23136201 · Krajský soud v Ostravě</span>
          </div>
        </div>

        {/* Central Hero text */}
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: '960px',
              color: '#ffffff',
            }}
          >
            <span>Prémiové podnikové dluhopisy&nbsp;</span>
            <span style={{ color: '#DFC090' }}>4,5 % – 7,0 % p.a.</span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 23,
              color: '#d0dfd6',
              marginTop: 18,
              maxWidth: '900px',
              lineHeight: 1.4,
            }}
          >
            <span>Kapitál podložený reálnými hmotnými aktivy: lesní půda, agropodnikání a developerské projekty.</span>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(200, 169, 110, 0.4)',
              borderRadius: '16px',
              padding: '14px 22px',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            <span>🌲 Vlastní lesní půda v Beskydech</span>
          </div>
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(200, 169, 110, 0.4)',
              borderRadius: '16px',
              padding: '14px 22px',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            <span>👑 VIP emise od 1 mil. Kč</span>
          </div>
          <div
            style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(200, 169, 110, 0.4)',
              borderRadius: '16px',
              padding: '14px 22px',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            <span>🛡️ Garance hmotným majetkem</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}