import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { email } = await request.json();

  try {
    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .maybeSingle();
      
    if (userError) throw userError;
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }
    
    // Check if already an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .maybeSingle();
      
    if (adminError) throw adminError;
    
    if (adminData) {
      return NextResponse.json(
        { error: 'This user is already an admin' },
        { status: 400 }
      );
    }
    
    // Add to admins table
    const { error } = await supabase
      .from('admins')
      .insert([{ email }]);
      
    if (error) throw error;
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Admin privileges granted',
        user: { ...userData, isAdmin: true }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error adding new admin:', error);
    return NextResponse.json(
      { error: 'Failed to add admin privileges' },
      { status: 500 }
    );
  }
}