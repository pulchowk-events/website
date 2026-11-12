import Layout from '@/app/components/layout/Layout';

export default function Loading() {
  return (
    <Layout>
      <div className="w">
        <div className="page-header">
          <div className="page-header__body">
            <div className="skeleton" style={{ height: 11, width: 60, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 48, width: 420, marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 16, width: 360 }} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 32 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div className="skeleton" style={{ height: 20, width: 160, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 13, width: 220 }} />
            </div>
            <div className="tabs">
              <div className="skeleton" style={{ height: 36, width: 100, borderRadius: 99 }} />
              <div className="skeleton" style={{ height: 36, width: 70, borderRadius: 99 }} />
            </div>
          </div>

          <div className="tabs" style={{ marginBottom: 24 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: 36, width: 90, borderRadius: 99 }} />
            ))}
          </div>

          <div className="events-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 380, borderRadius: 14 }} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
