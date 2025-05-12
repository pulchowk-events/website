import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { donationId: string } }
) {
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

    const donationId = params.donationId;
    const updates = await request.json();

    // Get current donation data
    const { data: currentDonation, error: fetchError } = await supabase
      .from('donations')
      .select('amount, verified')
      .eq('id', donationId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Validate updates
    if (typeof updates.amount !== 'number' || updates.amount < 0) {
      return NextResponse.json({
        error: 'Invalid amount',
        fieldErrors: [{
          field: 'amount',
          message: 'Amount must be a positive number',
          received: updates.amount
        }]
      }, { status: 400 });
    }



    // Update donation
    const { data: updatedDonation, error: updateError } = await supabase
      .from('donations')
      .update({
        name: updates.name,
        email: updates.email,
        amount: updates.amount,
        transaction_code: updates.transaction_code,
        show_on_leaderboard: updates.show_on_leaderboard,
        updated_at: new Date().toISOString()
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

    // If amount changed and donation is verified, update prize pool
    if (currentDonation.verified && currentDonation.amount !== updates.amount) {
      const amountDiff = updates.amount - currentDonation.amount;
      const { error: poolError } = await supabase.rpc('update_donation_metrics', {
        amount_change: amountDiff,
        donor_change: 0 // Amount change only, not adding/removing donor
      });

      if (poolError) {
        console.error('Prize pool update error:', poolError);
        // Log error but don't fail the request
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Donation updated successfully',
      donation: updatedDonation,
    });

  } catch (error) {
    console.error('Error updating donation:', error);
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { donationId: string } }
) {
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

    const donationId = params.donationId;

    // Get current donation data
    const { data: currentDonation, error: fetchError } = await supabase
      .from('donations')
      .select('amount, verified')
      .eq('id', donationId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Delete donation
    const { error: deleteError } = await supabase
      .from('donations')
      .delete()
      .eq('id', donationId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete donation' },
        { status: 500 }
      );
    }

    // If donation was verified, update prize pool
    if (currentDonation.verified) {
      const { error: poolError } = await supabase.rpc('update_donation_metrics', {
        amount_change: -currentDonation.amount,
        donor_change: -1 // Removing a donor
      });

      if (poolError) {
        console.error('Prize pool update error:', poolError);
        // Log error but don't fail the request
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Donation deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting donation:', error);
    return NextResponse.json(
      { error: 'Failed to delete donation' },
      { status: 500 }
    );
  }
}