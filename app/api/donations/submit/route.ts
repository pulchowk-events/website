import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'
import { supabase } from '@/app/lib/supabase'


export async function POST(request: Request) {
  try {
    // Get session using next-auth
    const session = await getServerSession(authOptions)
    
    const { name, email, amount, transactionCode, message, showOnLeaderboard } = await request.json()

    // Validate required fields
    if (!name || !email || !amount || !transactionCode) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: {
          name: !name ? 'Name is required' : null,
          email: !email ? 'Email is required' : null,
          amount: !amount ? 'Amount is required' : null,
          transactionCode: !transactionCode ? 'Transaction code is required' : null
        }
      }, { status: 400 })
    }

    // Validate amount is a positive number
    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({
        error: 'Invalid amount',
        details: 'Amount must be greater than 0'
      }, { status: 400 })
    }

    // Get avatar URL from session if user is logged in
    let avatar_url = null
    let user_id = null

    if (session?.user) {
      avatar_url = session.user.image || null
      user_id = session.user.id || null
    }

    // Insert donation with avatar_url and user_id
    const { data: donation, error: donationError } = await supabase
      .from('donations')
      .insert({
        name,
        email,
        amount: numericAmount,
        transaction_code: transactionCode,
        message: message || null,
        show_on_leaderboard: showOnLeaderboard || false,
        verified: false,
        avatar_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (donationError) {
      console.error('Donation insert error:', donationError)
      return NextResponse.json({
        error: 'Failed to process donation',
        details: donationError.message
      }, { status: 500 })
    }



    return NextResponse.json({
      success: true,
      message: 'Donation submitted successfully',
      donation
    })

  } catch (error) {
    console.error('Donation processing error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}