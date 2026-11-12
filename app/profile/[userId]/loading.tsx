import Layout from '@/app/components/layout/Layout';

export default function Loading() {
  return (
    <Layout>
      <div className="w">
        <div className="profile">
          <div className="profile__header">
            <div className="profile__identity">
              <div
                className="skeleton"
                style={{ width: 112, height: 112, borderRadius: '50%', flexShrink: 0 }}
              />
              <div className="profile__info" style={{ gap: 10 }}>
                <div className="skeleton" style={{ height: 28, width: 180 }} />
                <div className="skeleton" style={{ height: 14, width: 200 }} />
                <div
                  className="skeleton"
                  style={{ height: 32, width: 120, borderRadius: 99, marginTop: 8 }}
                />
              </div>
            </div>
            <dl className="profile__stats">
              {[0, 1, 2].map((i) => (
                <div key={i} className="profile__stat">
                  <div
                    className="skeleton"
                    style={{ width: 14, height: 14, borderRadius: '50%' }}
                  />
                  <div className="skeleton" style={{ height: 22, width: 40, marginTop: 4 }} />
                  <div className="skeleton" style={{ height: 10, width: 48, marginTop: 4 }} />
                </div>
              ))}
            </dl>
          </div>

          <div className="profile__tablist">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 40, borderRadius: 8 }}
              />
            ))}
          </div>

          <div className="lounge-grid">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 220 }} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
