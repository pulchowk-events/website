import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';
import { z } from 'zod';


export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
  
  try {
    const data = await request.json()
    const { name, email, amount, transactionCode, message, showOnLeaderboard } = data

    // Validate required fields
    if (!name || !email || !amount || !transactionCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert donation
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        name,
        email,
        amount,
        transaction_code: transactionCode,
        message: message || null,
        show_on_leaderboard: showOnLeaderboard
      })
      .select()
      .single()

    if (donationError) {
      throw donationError
    }

    // Update prize pool
    const { error: poolError } = await supabase.rpc('update_prize_pool', {
      donation_amount: amount
    })

    if (poolError) {
      throw poolError
    }

    return NextResponse.json(donation, { status: 200 })

  } catch (error) {
    console.error('Donation error:', error)
    return NextResponse.json(
      { error: 'Failed to process donation' },
      { status: 500 }
    )
  }
}



// GET: Fetch all donations with pagination
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin status using the same pattern as pending products
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Get total count
    const { count } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true });

    // Get paginated donations
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);


    if (error) throw error;

    return NextResponse.json({
      donations,
      total: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
    });

  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}