// app/admin/loading.tsx
export default function Loading() {
  return (
    <div className="flex bg-background text-foreground min-h-screen">
      {/* Sidebar skeleton — hidden on mobile, matches real admin layout */}
      <div className="hidden lg:flex w-64 flex-col bg-background border-r border-border flex-shrink-0">
        {/* Logo header (h-16, matches real one) */}
        <div className="p-4 border-b h-16 border-border flex items-center">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {[...Array(9)].map((_, i) => (
              <li key={i}>
                <div className="flex items-center px-3 py-2.5 rounded-lg">
                  <div className="w-[18px] h-[18px] bg-muted rounded mr-3 flex-shrink-0 animate-pulse" />
                  <div
                    className="h-3.5 bg-muted rounded animate-pulse"
                    style={{ width: `${55 + (i % 3) * 15}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header (h-16, matches real one) */}
        <header className="border-b h-16 border-border bg-background/60 backdrop-blur-lg">
          <div className="h-full flex items-center justify-between px-6">
            {/* Active tab label */}
            <div className="h-6 w-40 bg-muted rounded animate-pulse" />

            <div className="flex items-center space-x-4">
              {/* Theme toggle placeholder */}
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />

              {/* Profile block (matches real: border-l + p-4 + avatar + text) */}
              <div className="p-4 border-l border-border">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="ml-3 flex flex-col gap-1.5">
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-2.5 w-32 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* "Dashboard Overview" title */}
            <div className="h-7 w-56 bg-muted rounded animate-pulse" />

            {/* Stats grid — 6 cards, matches AdminStats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl p-4 animate-pulse"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon chip */}
                    <div className="w-9 h-9 rounded-lg bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-muted rounded" />
                      <div className="h-5 w-14 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Two cards — Recent Activity + Quick Actions */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activity card — list rows */}
              <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="space-y-1.5 mb-6">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-3.5 w-48 bg-muted rounded" />
                </div>

                <div className="space-y-3">
                  {[...Array(3)].map((_, rowIdx) => (
                    <div
                      key={rowIdx}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                    >
                      <div className="w-2 h-2 rounded-full bg-muted flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-3/4 bg-muted rounded" />
                        <div className="h-2.5 w-1/3 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions card — 2×2 grid of buttons */}
              <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
                <div className="space-y-1.5 mb-6">
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-3.5 w-48 bg-muted rounded" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-muted/30 border border-border space-y-2"
                    >
                      <div className="h-3.5 w-3/4 bg-muted rounded" />
                      <div className="h-2.5 w-1/2 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}