import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import EventsClient from './EventsClient';


interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  form_link: string;
  image_url: string | null;
  created_at: string;
  category: 'software' | 'gaming' | 'hardware' | 'music' | 'sports' | 'extra';
}

export default async function EventsPage() {
  const supabase = createServerSupabaseClient();
  const session = await getServerSession(authOptions);
  
  // Get verified events only
// Update the events query to include author information
    const { data: events } = await supabase
      .from('events')
      .select(`
        *,
        users:created_by (
          id,
          name,
          image
        ),
        created_by
      `)
      .eq('verified', true)
      .order('event_date', { ascending: true });

  let isAdmin = false;

  if (session?.user?.email) {
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${session.user.email}`
      );
      const { isAdmin: adminStatus } = await response.json();
      isAdmin = adminStatus;
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  }

  const now = new Date();
  const upcomingEvents = events?.filter(event => new Date(event.event_date) >= now) || [];
  const pastEvents = events?.filter(event => new Date(event.event_date) < now) || [];

  return (
    <div className="max-w-7xl mx-auto pt-8 pb-12">
      <EventsClient
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        isAdmin={isAdmin}
      />
    </div>
  );
}