import { createClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const eventDate = formData.get('eventDate') as string
  const formLink = formData.get('formLink') as string
  const category = formData.get('category') as string;
  const imageFile = formData.get('image') as File | null

  if (!title || !description || !eventDate || !formLink) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  
  // Validate category
  const validCategories = ['software', 'gaming', 'hardware', 'sports', 'music', 'extra'];
  if (!validCategories.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  // Create service role client directly
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false
      }
    }
  )

  const headersList = await headers()
  const referer = headersList.get('referer')
  const isAdminRequest = referer?.includes('/admin') ?? false

  try {
    let imageUrl: string | null = null

    if (imageFile) {
      const imageSizeMB = imageFile.size / (1024 * 1024)
      if (imageSizeMB > 1) {
        return NextResponse.json({ error: 'Image must be less than 1MB' }, { status: 400 })
      }

      const fileExtension = imageFile.name.split('.').pop()
      const fileName = `event-${Date.now()}.${fileExtension}`

      // Upload with service role client
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: imageFile.type,
        })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        throw uploadError
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('event-images')
        .getPublicUrl(uploadData.path)

      imageUrl = publicUrl.publicUrl
    }

    // Insert with service role client
    const { data, error: insertError } = await supabase
      .from('events')
      .insert({
        title,
        description,
        event_date: eventDate,
        form_link: formLink,
        image_url: imageUrl,
        created_by: session.user.id,
        category,
        verified: false,
      })
      .select()

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw insertError
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...data[0],
          approved: isAdminRequest,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}