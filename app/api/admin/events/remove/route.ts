import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: Request) {
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

    const { eventId } = await request.json();

    // Get event details first
    const { data: event, error: fetchError } = await supabase
      .from('events')
      .select('image_url')
      .eq('id', eventId)
      .single();

    if (fetchError) throw fetchError;

    // Delete image if exists
    if (event?.image_url) {
      const fileName = event.image_url.split('/event-images/')[1];
      if (fileName) {
        await supabase.storage
          .from('event-images')
          .remove([fileName]);
      }
    }

    // Delete event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing event:', error);
    return NextResponse.json(
      { error: 'Failed to remove event' },
      { status: 500 }
    );
  }
}