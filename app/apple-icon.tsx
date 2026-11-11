import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: 'linear-gradient(135deg, #023314 0%, #012B12 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#C8A96E',
          borderRadius: '40px',
          border: '6px solid #C8A96E',
          fontWeight: 800,
          fontFamily: 'serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        G
      </div>
    ),
    { ...size }
  );
}