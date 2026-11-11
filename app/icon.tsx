import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: '#012B12',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#C8A96E',
          borderRadius: '50%',
          border: '2px solid #C8A96E',
          fontWeight: 800,
          fontFamily: 'serif',
        }}
      >
        G
      </div>
    ),
    { ...size }
  );
}