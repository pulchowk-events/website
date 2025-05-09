// app/api/checkAdmin/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase'; // Update this path if necessary

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    const { data } = await supabase
      .from('admins')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    return NextResponse.json({ isAdmin: !!data });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
