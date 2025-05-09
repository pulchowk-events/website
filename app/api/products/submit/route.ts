import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { authOptions } from '@/auth'
import { getServerSession } from 'next-auth/next'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  // Check if user is authenticated
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const url = formData.get('url') as string
  const imageFile = formData.get('image') as File | null

  // Basic validation
  if (!name || !description || !url) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Check if request is coming from admin route
  const headersList = await headers()
  const referer = headersList.get('referer')
  const isAdminRequest = referer?.includes('/admin') ?? false

  const supabase = createRouteHandlerClient({ cookies })

  try {
    let imageUrl: string | null = null

    // Handle image upload if present
    if (imageFile) {
      try {
        // Basic size validation
        const imageSizeMB = imageFile.size / (1024 * 1024)
        if (imageSizeMB > 1) {
          return NextResponse.json(
            { error: 'Image must be less than 1MB' },
            { status: 400 }
          )
        }

        // Generate unique filename
        const fileExtension = imageFile.name.split('.').pop()
        const fileName = `product-${Date.now()}.${fileExtension}`

        // Upload new image
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path)

        imageUrl = publicUrl.publicUrl

      } catch (uploadError) {
        console.error('Image upload failed:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        )
      }
    }

    // Insert product data
    const { error: insertError } = await supabase.from('products').insert({
      name,
      description,
      url,
      image_url: imageUrl,
      posted_by: session.user?.id,
      approved: isAdminRequest,
      votes: 0,
    })

    if (insertError) {
      console.error('Database insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to add product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true,
        data: {
          name,
          url,
          image_url: imageUrl,
          approved: isAdminRequest
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}