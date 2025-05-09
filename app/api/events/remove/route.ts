import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('id')

  if (!eventId) {
    return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
  }

  // Create service role client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  try {
    // First delete the associated image if it exists
    const { data: eventData, error: fetchError } = await supabase
      .from('events')
      .select('image_url')
      .eq('id', eventId)
      .single()

    if (fetchError) throw fetchError

    if (eventData?.image_url) {
      const fileName = eventData.image_url.split('/').pop()
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('event-images')
          .remove([fileName])

        if (storageError) console.error('Failed to delete image:', storageError)
      }
    }

    // Then delete the event
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}