'use server'

import { supabase } from '@/app/lib/supabase'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/auth'

export async function toggleVote(productId: number, voteType: 'upvote' | 'downvote') {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: 'Unauthorized' }

    const userId = session.user.id

    // Check latest vote by user for this product
    const { data: existingVote, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = "No rows found" — ignore this one
      console.error('Error fetching vote:', error)
      return { error: 'Failed to fetch vote' }
    }

    if (existingVote && existingVote.type === voteType) {
      await supabase.from('votes').delete().eq('id', existingVote.id)
      return { message: 'Vote removed' }
    }

    if (existingVote) {
      await supabase
        .from('votes')
        .update({ type: voteType, created_at: new Date().toISOString() })
        .eq('id', existingVote.id)
      return { message: 'Vote updated' }
    }

    await supabase.from('votes').insert({
      user_id: userId,
      product_id: productId,
      type: voteType,
    })

    return { message: 'Vote added' }
  } catch (err: any) {
    console.error('toggleVote error:', err)
    return { error: 'Internal Server Error' }
  }
}
