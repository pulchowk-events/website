import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get target amount from prize_pool
    const { data: prizePool, error: poolError } = await supabase
      .from('prize_pool')
      .select('target_amount')
      .single();

    if (poolError) {
      throw poolError;
    }

    // Calculate current amount from verified donations
    const { data: donations, error: donationsError } = await supabase
      .from('donations')
      .select('amount')
      .eq('verified', true);

    if (donationsError) {
      throw donationsError;
    }

    // Sum up verified donations
    const current_amount = donations.reduce((sum, donation) => sum + donation.amount, 0);

    // Get total verified donors count
    const { count: total_donors } = await supabase
      .from('donations')
      .select('*', { count: 'exact' })
      .eq('verified', true);

    return NextResponse.json({
      current_amount,
      target_amount: prizePool.target_amount,
      total_donors: total_donors || 0
    });

  } catch (error) {
    console.error('Error fetching prize pool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prize pool data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target_amount } = await request.json();

    // Validate input
    const numericTargetAmount = Number(target_amount);
    if (isNaN(numericTargetAmount) || numericTargetAmount <= 0) {
      return NextResponse.json({
        error: 'Target amount must be a positive number',
      }, { status: 400 });
    }

    // Update only target amount
    const { error } = await supabase
      .from('prize_pool')
      .update({
        target_amount: numericTargetAmount,
        last_updated: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Target amount updated successfully'
    });

  } catch (error) {
    console.error('Error updating target amount:', error);
    return NextResponse.json(
      { error: 'Failed to update target amount' },
      { status: 500 }
    );
  }
}