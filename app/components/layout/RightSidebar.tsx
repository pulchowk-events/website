import Link from 'next/link';
import TopDonators from '@/app/components/donate/TopDonators';
import { getSidebarData, getRecentJobs } from '@/app/lib/queries';

type SidebarItem = 'events' | 'jobs' | 'products' | 'donors';

export default async function RightSidebar({ exclude = [] }: { exclude?: SidebarItem[] }) {
  const show = (key: SidebarItem) => !exclude.includes(key);
  const showJobs = show('jobs');

  const [sidebar, recentJobs] = await Promise.all([
    getSidebarData(),
    showJobs ? getRecentJobs(3) : Promise.resolve([]),
  ]);

  return (
    <div className="hidden lg:block lg:w-1/5 space-y-4 flex-shrink-0">
      <div className="sticky top-24 space-y-4">
        {show('events') && sidebar.upcomingEvents.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Events</h2>
              <Link href="/events" className="text-green-600 dark:text-green-400 text-sm hover:underline">See All</Link>
            </div>
            <div className="space-y-3">
              {sidebar.upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1 text-foreground">{event.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {showJobs && recentJobs.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Jobs</h2>
              <Link href="/jobs" className="text-green-600 dark:text-green-400 text-sm hover:underline">See All</Link>
            </div>
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                >
                  <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {job.image_url ? (
                      <img src={job.image_url} alt={job.company} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-600">
                        <span className="text-white text-sm font-bold">{job.company.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1 text-foreground">{job.title}</p>
                    <p className="text-muted-foreground text-xs line-clamp-1">{job.company}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {show('products') && sidebar.products.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Recent Projects</h2>
              <Link href="/product-hunt" className="text-green-600 dark:text-green-400 text-sm hover:underline">See All</Link>
            </div>
            <div className="space-y-3">
              {sidebar.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product-hunt/${product.url}`}
                  className="flex items-center gap-3 p-3 bg-muted/30 hover:bg-accent transition-colors rounded-lg"
                >
                  <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-600">
                        <span className="text-white text-sm font-bold">{product.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-1 text-foreground">{product.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {show('donors') && sidebar.donors.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">Top Donors</h2>
              <Link href="/donate" className="text-green-600 dark:text-green-400 text-sm hover:underline">Donate</Link>
            </div>
            <TopDonators donators={sidebar.donors} />
          </div>
        )}
      </div>
    </div>
  );
}