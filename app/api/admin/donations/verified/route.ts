import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

interface PrizePool {
  current_amount: number;
  target_amount: number;
  total_donors: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Fetch verified donations data
    const { data: verifiedDonations, error } = await supabase
      .from('donations')
      .select('*')
      .eq('verified', true)

    const  { count } = await supabase
      .from('donations')
      .select('*', { count: 'exact' })
      .eq('verified', true);


    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch prize pool data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      donations: verifiedDonations,
      total_donors: count,
    });
    

  } catch (error) {
    console.error('Error fetching prize pool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prize pool data' },
      { status: 500 }
    );
  }
}