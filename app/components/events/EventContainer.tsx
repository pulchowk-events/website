// app/events/page.tsx
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import Layout from '@/app/components/layout/Layout';
import EventCard from '@/app/components/events/EventCard';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export default async function EventsPage() {
  const supabase = createServerSupabaseClient();
  
  // Fetch all events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true });

  // Get user session
  const session = await getServerSession(authOptions);
  let isAdmin = false;

  // Check admin status if user is logged in
  if (session?.user?.email) {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${session.user.email}`);
      const { isAdmin: adminStatus } = await response.json();
      isAdmin = adminStatus;
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  // Group events by upcoming and past
  const now = new Date();
  const upcomingEvents = events?.filter(event => new Date(event.event_date) >= now) || [];
  const pastEvents = events?.filter(event => new Date(event.event_date) < now) || [];

  return (
<>

          <div className="max-w-6xl mx-auto py-16 px-6">
            {upcomingEvents.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {pastEvents.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Past Events</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      isPast={true} 
                      isAdmin={isAdmin}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
      

  </>
  );
}