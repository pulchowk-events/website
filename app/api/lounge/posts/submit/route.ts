import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get session and verify user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to submit a post' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Request body:', requestBody); // Debug log
    } catch (e) {
      console.error('JSON parse error:', e);
      return NextResponse.json(
        { error: 'Invalid request body - must be valid JSON' },
        { status: 400 }
      );
    }

    const { title, content, category, redirect_url } = requestBody;

    // Debug log
    console.log('Parsed values:', {
      title,
      content,
      category,
      redirect_url,
      author_id: session.user.id
    });

    // Validate required fields
    if (!title || !content || !category) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: {
          title: !title ? 'Title is required' : null,
          content: !content ? 'Content is required' : null,
          category: !category ? 'Category is required' : null,
        }
      }, { status: 400 });
    }

    // Create post object
    const postData = {
      title: title.trim(),
      content: content.trim(),
      category,
      author_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      redirect_url: redirect_url ? redirect_url.trim() : null,
    };

    // Debug log
    console.log('Inserting post data:', postData);

    // Insert post with error handling
    const { data: post, error: supabaseError } = await supabase
      .from('lounge_posts')
      .insert(postData)
      .select()
      .single();

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      
      // Handle specific Supabase errors
      if (supabaseError.code === '23505') {
        return NextResponse.json({
          error: 'Duplicate post',
          details: 'A similar post already exists'
        }, { status: 409 });
      }

      // Handle foreign key violation
      if (supabaseError.code === '23503') {
        return NextResponse.json({
          error: 'Invalid author',
          details: 'Author not found in database'
        }, { status: 400 });
      }

      return NextResponse.json({
        error: 'Database error',
        details: supabaseError.message
      }, { status: 500 });
    }

    // Debug log
    console.log('Post created successfully:', post);

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Detailed error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}

// Helper function for URL validation
function isValidUrl(string: string) {
  if (!string) return true; // Allow empty/null values
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}