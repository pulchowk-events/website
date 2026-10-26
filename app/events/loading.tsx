// app/events/loading.tsx
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row lg:gap-6">
          {/* Left sidebar skeleton */}
          <div className="hidden lg:block lg:w-1/5 flex-shrink-0">
            <div className="bg-card border border-border rounded-xl p-5 shadow-lg animate-pulse">
              <div className="h-6 bg-muted rounded w-2/3 mb-6" />
              <div className="h-16 bg-muted rounded mb-4" />
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-4/5" />
            </div>
          </div>

          {/* Main content skeleton */}
          <div className="w-full lg:mx-auto">
            <div className="bg-card border border-border rounded-xl shadow-lg p-4 sm:p-5 mb-5">
              <div className="flex items-center justify-between mb-6">
                <div className="h-7 w-32 bg-muted rounded animate-pulse" />
                <div className="h-9 w-24 bg-muted rounded-full animate-pulse" />
              </div>

              <div className="grid grid-cols-3 md:grid-cols-7 gap-2 mb-6">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="h-9 bg-muted rounded-full animate-pulse" />
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl overflow-hidden animate-pulse">
                    <div className="h-52 bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar skeleton */}
          <div className="hidden lg:block lg:w-1/5 flex-shrink-0 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-lg animate-pulse">
                <div className="h-6 bg-muted rounded w-2/3 mb-4" />
                <div className="space-y-3">
                  <div className="h-14 bg-muted rounded" />
                  <div className="h-14 bg-muted rounded" />
                  <div className="h-14 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}