import { ImageResponse } from 'next/og';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';

export const alt = 'Event preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = createServerSupabaseClient();
  const { data: event } = await supabase
    .from('events')
    .select('title, event_date, location, image_url, category')
    .eq('id', id)
    .eq('verified', true)
    .single();

  const title = event?.title || 'Event';
  const date = event
    ? new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const location = event?.location || '';
  const imageUrl = event?.image_url;
  const category = event?.category || '';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          position: 'relative',
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.35,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(22,163,74,0.35) 0%, rgba(0,0,0,0.92) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 72,
            width: '100%',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#4ade80' }}>
              Pulchowk Events
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {category && (
              <div
                style={{
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  background: 'rgba(74,222,128,0.15)',
                  color: '#4ade80',
                  padding: '8px 22px',
                  borderRadius: 999,
                  fontSize: 20,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 3,
                }}
              >
                {category}
              </div>
            )}
            <div
              style={{
                fontSize: 76,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.05,
                letterSpacing: -2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 40,
                fontSize: 26,
                color: '#a3a3a3',
                flexWrap: 'wrap',
              }}
            >
              {date && <div>📅 {date}</div>}
              {location && <div>📍 {location}</div>}
            </div>
          </div>

          <div style={{ display: 'flex', fontSize: 22, color: '#737373' }}>
            pulchowkevents.netlify.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}