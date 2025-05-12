import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get session and verify admin
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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

    
    const { 
      name, 
      email, 
      amount, 
      transaction_code, 
      message, 
      show_on_leaderboard,
      use_admin_avatar // Add this new field
    } = await request.json();

    // Validate required fields
    if (!name || !email || !amount || !transaction_code) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          amount: !amount ? 'Amount is required' : null,
          transaction_code: !transaction_code ? 'Transaction code is required' : null
        }
      }, { status: 400 });
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({
        error: 'Invalid amount',
        details: 'Amount must be greater than 0'
      }, { status: 400 });
    }

    
    // Check if a user with the email exists and get their avatar
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('avatar_url, id')
      .eq('email', email)
      .single();


    const avatar_url = use_admin_avatar ? session.user.image : null;



    // Insert donation with verification
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        name,
        email,
        amount: numericAmount,
        transaction_code,
        message: message || null,
        show_on_leaderboard: show_on_leaderboard || false,
        verified: true,
        verified_at: new Date().toISOString(),
        verified_by: session.user.id,
        avatar_url, // Use the conditional avatar_url
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (donationError) {
      console.error('Donation insert error:', donationError);
      return NextResponse.json({
        error: 'Failed to process donation',
        details: donationError.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Donation added and verified successfully',
      donation
    });

  } catch (error) {
    console.error('Donation processing error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}