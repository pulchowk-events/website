import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';
import { isAdmin } from '@/app/lib/isAdmin';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const admin = await isAdmin(session.user.email);
  if (!admin) {
    return { error: NextResponse.json({ error: 'Admin privileges required' }, { status: 403 }) };
  }
  return { session };
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ donationId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { donationId } = await params;
    if (!donationId) {
      return NextResponse.json({ error: 'Invalid donation ID' }, { status: 400 });
    }

    const updates = await request.json();

    const { data: currentDonation, error: fetchError } = await supabase
      .from('donations')
      .select('amount, verified')
      .eq('id', donationId)
      .single();

    if (fetchError || !currentDonation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    if (typeof updates.amount !== 'number' || updates.amount < 0) {
      return NextResponse.json(
        {
          error: 'Invalid amount',
          fieldErrors: [
            {
              field: 'amount',
              message: 'Amount must be a positive number',
              received: updates.amount,
            },
          ],
        },
        { status: 400 }
      );
    }

    const { data: updatedDonation, error: updateError } = await supabase
      .from('donations')
      .update({
        name: updates.name,
        email: updates.email,
        amount: updates.amount,
        transaction_code: updates.transaction_code,
        show_on_leaderboard: updates.show_on_leaderboard,
        updated_at: new Date().toISOString(),
      })
      .eq('id', donationId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update donation: ' + updateError.message },
        { status: 500 }
      );
    }

    if (currentDonation.verified && currentDonation.amount !== updates.amount) {
      const amountDiff = updates.amount - currentDonation.amount;
      const { error: poolError } = await supabase.rpc('update_donation_metrics', {
        amount_change: amountDiff,
        donor_change: 0,
      });
      if (poolError) {
        console.error('Prize pool update error:', poolError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Donation updated successfully',
      donation: updatedDonation,
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json({ error: 'Failed to update donation' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ donationId: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { donationId } = await params;
    if (!donationId) {
      return NextResponse.json({ error: 'Invalid donation ID' }, { status: 400 });
    }

    const { data: currentDonation, error: fetchError } = await supabase
      .from('donations')
      .select('amount, verified')
      .eq('id', donationId)
      .single();

    if (fetchError || !currentDonation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from('donations')
      .delete()
      .eq('id', donationId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 });
    }

    if (currentDonation.verified) {
      const { error: poolError } = await supabase.rpc('update_donation_metrics', {
        amount_change: -currentDonation.amount,
        donor_change: -1,
      });
      if (poolError) {
        console.error('Prize pool update error:', poolError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Donation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json({ error: 'Failed to delete donation' }, { status: 500 });
  }
}
