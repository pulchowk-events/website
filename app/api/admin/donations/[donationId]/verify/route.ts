import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';
import { isAdmin } from '@/app/lib/isAdmin';
import { insertNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ donationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - No session' }, { status: 401 });
    }

    const admin = await isAdmin(session.user.email);
    if (!admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    const { donationId } = await params;
    if (!donationId || !isValidUUID(donationId)) {
      return NextResponse.json({ error: 'Invalid donation ID format' }, { status: 400 });
    }

    const { verified } = await request.json();
    if (typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const { data: donation, error: fetchError } = await supabase
      .from('donations')
      .select('amount, verified, email')
      .eq('id', donationId)
      .single();

    if (fetchError) {
      console.error('Error fetching donation:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch donation: ' + fetchError.message },
        { status: 500 }
      );
    }
    if (!donation) {
      return NextResponse.json({ error: 'Donation not found' }, { status: 404 });
    }

    const { data: donorUser, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', donation.email)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user:', userError);
    }

    const { error: updateError } = await supabase
      .from('donations')
      .update({
        verified,
        verified_at: verified ? new Date().toISOString() : null,
        verified_by: verified ? session.user.id : null,
      })
      .eq('id', donationId);

    if (updateError) {
      console.error('Error updating donation:', updateError);
      return NextResponse.json(
        { error: 'Failed to update donation: ' + updateError.message },
        { status: 500 }
      );
    }

    if (verified !== donation.verified) {
      try {
        if (verified && donorUser) {
          await insertNotification(supabase, {
            user_id: donorUser.id,
            type: 'donation',
            title: 'Your donation of $' + donation.amount + ' has been verified!',
            link: '/donate',
            source_user_id: null,
          });
        }

        const { data: adminEmails } = await supabase.from('admins').select('email');
        const emails = (adminEmails || []).map((a) => a.email);

        const { data: adminUsers, error: adminError } = await supabase
          .from('users')
          .select('id, email, name')
          .in('email', emails);

        if (adminError) {
          console.error('Error fetching admin users:', adminError);
        } else if (adminUsers?.length) {
          for (const a of adminUsers) {
            if (!donorUser || a.id !== donorUser.id) {
              await insertNotification(supabase, {
                user_id: a.id,
                type: 'donation',
                title:
                  donation.email +
                  ' has ' +
                  (verified ? 'received a' : 'had their') +
                  ' $' +
                  donation.amount +
                  ' donation verification ' +
                  (verified ? '' : 'removed') +
                  ' by ' +
                  a.name,
                link: '/admin',
                source_user_id: donorUser?.id || null,
              });
            }
          }
        }
      } catch (notifyError) {
        console.error('Error sending notifications:', notifyError);
      }

      const prizeChange = verified ? donation.amount : -donation.amount;
      const donorChange = verified ? 1 : -1;

      const { error: poolError } = await supabase.rpc('update_donation_metrics', {
        amount_change: prizeChange,
        donor_change: donorChange,
      });

      if (poolError) {
        console.error('Error updating prize pool:', poolError);
      }
    }

    return NextResponse.json({
      success: true,
      message: verified
        ? 'Donation verified successfully'
        : 'Donation unverified successfully',
    });
  } catch (error) {
    console.error('Error updating donation status:', error);
    return NextResponse.json(
      {
        error:
          'Internal server error: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}
