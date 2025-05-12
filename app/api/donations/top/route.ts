import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '5')

    const { data: topDonators, error } = await supabase
      .from('donations')
      .select('id, name, amount, avatar_url')
      .eq('verified', true) // Only show verified donations
      .eq('show_on_leaderboard', true)
      .order('amount', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      donators: topDonators || []
    })

  } catch (error) {
    // Error handling...
  }
}

export async function HEAD(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit')
  
  return new Response(null, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      'X-Total-Count': limit || '5'
    },
  })
}