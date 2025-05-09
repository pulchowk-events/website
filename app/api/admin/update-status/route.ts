import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { email, makeAdmin } = await request.json();

  try {
    if (makeAdmin) {
      // Add to admins table
      const { error } = await supabase
        .from('admins')
        .insert([{ email }]);
        
      if (error) throw error;
    } else {
      // Remove from admins table
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('email', email);
        
      if (error) throw error;
    }
    
    return NextResponse.json(
      { success: true, message: `Admin privileges ${makeAdmin ? 'granted' : 'revoked'}` },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating admin status:', error);
    return NextResponse.json(
      { error: `Failed to ${makeAdmin ? 'add' : 'remove'} admin privileges` },
      { status: 500 }
    );
  }
}