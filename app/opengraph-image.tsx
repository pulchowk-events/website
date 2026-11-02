import { ImageResponse } from 'next/og';

export const alt = 'Pulchowk Events';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #14532d 100%)',
          padding: '80px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 32,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', fontSize: 42, color: '#4ade80', fontWeight: 600 }}>
            पुल्चोक
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 96,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: -3,
              lineHeight: 1.05,
            }}
          >
            Pulchowk Events
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: '#a3a3a3', lineHeight: 1.3 }}>
            Campus events, student projects, and community — from Pulchowk, for Nepal.
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 80,
            display: 'flex',
            fontSize: 24,
            color: '#4ade80',
            fontWeight: 500,
          }}
        >
          pulchowkevents.netlify.app
        </div>
      </div>
    ),
    { ...size }
  );
}