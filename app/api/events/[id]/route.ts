import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { getServerSession } from 'next-auth/next';
import { isAdmin } from '@/app/lib/isAdmin';
import { revalidateTag } from "next/cache";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Event ID parameter is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('created_by, image_url')
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const admin = await isAdmin(session.user.email);
    if (!admin && event.created_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this event' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const eventDate = formData.get('eventDate') as string;
    const formLink = formData.get('formLink') as string;
    const category = formData.get('category') as string;
    const imageFile = formData.get('image') as File | null;

    if (!title || !description || !eventDate || !formLink || !category) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    let imageUrl = event.image_url;
    if (imageFile) {
      try {
        const imageSizeMB = imageFile.size / (1024 * 1024);
        if (imageSizeMB > 1) {
          return NextResponse.json({ error: 'Image must be less than 1MB' }, { status: 400 });
        }
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = 'event-' + id + '-' + Date.now() + '.' + fileExtension;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('event-images')
          .getPublicUrl(uploadData.path);

        if (event.image_url) {
          const oldFileName = event.image_url.split('/event-images/')[1];
          if (oldFileName) {
            await supabase.storage.from('event-images').remove([oldFileName]);
          }
        }

        imageUrl = publicUrl.publicUrl;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
      }
    }

    const { error: updateError } = await supabase
      .from('events')
      .update({
        title,
        description,
        event_date: eventDate,
        form_link: formLink,
        category,
        image_url: imageUrl,
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    revalidateTag("events", "max");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
