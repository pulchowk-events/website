import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

const EVERYONE_TRIGGER_ID = "e0f8d3b7-5d2a-4c91-9e4a-f23c4b79d2e8-trigger";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin status
    const { data: adminData } = await supabase
      .from('admins')
      .select('email')
      .eq('email', session.user.email)
      .single();

    if (!adminData) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { user_id, title, link, type } = await request.json();

    // If this is the trigger notification
    if (user_id === EVERYONE_TRIGGER_ID) {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id');

      if (usersError) throw usersError;

      // Batch insert notifications for all users
      const notifications = users.map(user => ({
        user_id: user.id,
        type,
        title,
        link: link || '/',
        source_user_id: session.user.id,
        is_broadcast: true,
        created_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) throw insertError;

      return NextResponse.json({
        success: true,
        message: `Notification broadcast to ${users.length} users`
      });
    }

    return NextResponse.json({ error: 'Invalid broadcast attempt' }, { status: 400 });

  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast notification' },
      { status: 500 }
    );
  }
}