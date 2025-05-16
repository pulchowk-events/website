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

    const { error } = await supabase
      .from('events')
      .update({ verified: true })
      .eq('id', eventId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying event:', error);
    return NextResponse.json(
      { error: 'Failed to verify event' },
      { status: 500 }
    );
  }
}