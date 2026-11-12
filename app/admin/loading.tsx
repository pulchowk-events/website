export default function Loading() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-hidden="true">
        <header className="admin-sidebar__head">
          <span className="skeleton" style={{ width: 120, height: 16 }} />
        </header>
        <nav className="admin-sidebar__nav">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 36, marginBottom: 4, borderRadius: 8 }}
            />
          ))}
        </nav>
      </aside>

      <div className="admin-body">
        <header className="admin-header">
          <span className="skeleton" style={{ width: 140, height: 18 }} />
          <div className="admin-header__actions">
            <span className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }} />
            <span className="skeleton" style={{ width: 180, height: 28, borderRadius: 99 }} />
          </div>
        </header>

        <main className="admin-main">
          <div className="admin-content admin-panel-stack">
            <div className="admin-stats-skeleton">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton" style={{ height: 76, borderRadius: 10 }} />
              ))}
            </div>
            <div className="admin-two-col">
              <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
              <div className="skeleton" style={{ height: 260, borderRadius: 14 }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
