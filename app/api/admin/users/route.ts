import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerSupabaseClient();

  try {
    // Fetch all admins first
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('email');
    
    if (adminError) throw adminError;
    
    // Get the email addresses of all admins
    const adminEmails = admins?.map(admin => admin.email) || [];
    
    // Fetch users with admin status
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .order('name');
      
    if (userError) throw userError;
    
    // Combine the data
    const usersWithAdminStatus = userData?.map(user => ({
      ...user,
      isAdmin: adminEmails.includes(user.email)
    })) || [];
    
    return NextResponse.json({ users: usersWithAdminStatus }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}