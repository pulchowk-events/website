// app/profile/[userId]/loading.tsx
export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto min-h-200 px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header skeleton */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-lg mb-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-32 h-32 rounded-full bg-muted flex-shrink-0" />
            <div className="flex flex-col gap-3 flex-1 w-full">
              <div className="h-8 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-10 bg-muted rounded w-32" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted/50 rounded-xl p-4">
                <div className="h-8 w-8 rounded-full bg-muted mx-auto mb-2" />
                <div className="h-6 bg-muted rounded w-12 mx-auto mb-1" />
                <div className="h-3 bg-muted rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="grid grid-cols-3 gap-2 bg-card border border-border rounded-xl p-2 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 sm:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
            <div className="h-5 w-24 bg-muted rounded-full mb-4" />
            <div className="h-6 bg-muted rounded w-3/4 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}