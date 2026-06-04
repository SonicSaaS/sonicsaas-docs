import { ImageResponse } from 'next/og';

// Default social-share card for the docs site (1200x630). Generated at build
// time so we don't have to author/commit a binary PNG. Next wires the resulting
// image into og:image / twitter:image for every route that doesn't override it.
export const dynamic = 'force-static';
export const alt = 'SonicSaaS Documentation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: '#f97316',
            }}
          />
          <div style={{ fontSize: 56, fontWeight: 700, color: '#fafafa' }}>
            SonicSaaS
          </div>
        </div>
        <div style={{ fontSize: 44, color: '#fafafa', marginTop: 40 }}>
          Documentation
        </div>
        <div style={{ fontSize: 28, color: '#a3a3a3', marginTop: 16 }}>
          Secure fleet management for MSPs
        </div>
      </div>
    ),
    { ...size },
  );
}
