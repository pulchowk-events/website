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
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    // Check admin status
    const adminCheck = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`
    );
    
    if (!adminCheck.ok) {
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    const { isAdmin } = await adminCheck.json();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { verified } = await request.json();
    if (typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    // In your PUT route handler
    const donationId = params.donationId;

    // Add validation for UUID format if needed
    if (!donationId || !isValidUUID(donationId)) {
      return NextResponse.json({ error: 'Invalid donation ID format' }, { status: 400 });
    }

    // Helper function to check UUID format
    function isValidUUID(uuid: string) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
    }

    if (!donationId) {
      return NextResponse.json({ error: 'Donation ID is required' }, { status: 400 });
    }

    // Get current donation data
    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('amount, verified')
      .eq('id', donationId)
      .single();

    if (fetchError) {
      console.error('Error fetching donation:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch donation: ' + fetchError.message }, { status: 500 });
    }

    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    // Update donation verification fields
    const { error: updateError } = await supabase
      .from('donations')
      .update({
        verified,
        verified_at: verified ? new Date().toISOString() : null,
        verified_by: verified ? session.user.id : null
      })
      .eq('id', donationId);


    if (updateError) {
      console.error('Error updating donation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update donation: ' + updateError.message }, 
        { status: 500 }
      );
    }

    // Only adjust prize pool if verification status has changed
    if (verified !== donation.verified) {
      const prizeChange = verified ? donation.amount : -donation.amount;
      const donorChange = verified ? 1 : -1;

      // Update prize pool and donor count in a transaction
      const { error: poolError } = await supabase.rpc('update_donation_metrics', {
        amount_change: prizeChange,
        donor_change: donorChange
      });

      if (poolError) {
        console.error('Error updating prize pool:', poolError);
        // Don't fail the whole request, just log the error
        // The prize pool can be corrected manually if needed
      }
    }

    return NextResponse.json({
      success: true,
      message: verified
        ? 'Donation verified successfully'
        : 'Donation unverified successfully'
    });

  } catch (error) {
    console.error('Error updating donation status:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}