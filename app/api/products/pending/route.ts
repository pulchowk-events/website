import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin status
    const adminCheck = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`
    );
    const { isAdmin } = await adminCheck.json();

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }

    // Fetch pending products
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false });

    if (productError) {
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Fetch usernames
    const userIds = [...new Set(products?.map(p => p.posted_by) || [])];
    let usernames: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, name')
        .in('id', userIds);

      if (!userError && users) {
        usernames = users.reduce((acc, user) => {
          acc[user.id] = user.name;
          return acc;
        }, {} as Record<string, string>);
      }
    }

    return NextResponse.json({
      products: products || [],
      usernames
    });

  } catch (error) {
    console.error('Admin products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}