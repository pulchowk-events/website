import { ImageResponse } from 'next/og';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';

export const alt = 'Product preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = createServerSupabaseClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('url', slug)
    .single();

  const name = product?.name || 'Product';
  const description = (product?.description || '').slice(0, 160);
  const imageUrl = product?.image_url;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#0a0a0a',
          padding: 72,
          gap: 48,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 700, color: '#4ade80' }}>
            Pulchowk Events · Product Hunt
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                fontSize: 68,
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.1,
                letterSpacing: -2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {name}
            </div>
            {description && (
              <div
                style={{
                  fontSize: 26,
                  color: '#a3a3a3',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {description}
              </div>
            )}
          </div>
          <div style={{ fontSize: 22, color: '#737373' }}>pulchowkevents.netlify.app</div>
        </div>

        {imageUrl && (
          <div
            style={{
              display: 'flex',
              width: 380,
              height: 380,
              alignSelf: 'center',
              borderRadius: 24,
              overflow: 'hidden',
              background: '#171717',
            }}
          >
            <img
              src={imageUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}