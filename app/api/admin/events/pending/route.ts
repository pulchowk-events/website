import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin status
    const adminCheck = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`
    );
    const { isAdmin } = await adminCheck.json();

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Fetch pending events with user details
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    // Fetch usernames for event creators
    const userIds = [...new Set(events?.map(event => event.created_by) || [])];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds);

    if (usersError) throw usersError;

    // Create username lookup object
    const usernames = (users || []).reduce((acc, user) => ({
      ...acc,
      [user.id]: user.name
    }), {});

    return NextResponse.json({ events, usernames });
  } catch (error) {
    console.error('Error fetching pending events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending events' },
      { status: 500 }
    );
  }
}