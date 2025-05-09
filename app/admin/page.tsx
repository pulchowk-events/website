import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import { createServerSupabaseClient } from '../lib/supabase-server';
import Layout from '@/app/components/layout/Layout';
import AdminDashboard from '@/app/components/admin/AdminDashboard';

export default async function AdminPage() {
  // Get session server-side
  const session = await getServerSession(authOptions);

  // Redirect if not authenticated
  if (!session?.user?.email) {
    return redirect('/');
  }

  const supabase = createServerSupabaseClient();

  // Check admin status
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('email')
    .eq('email', session.user.email)
    .single();

  if (adminError || !adminData) {
    console.error('Admin check error:', adminError);
    return redirect('/');
  }

  // Fetch stats for the dashboard
  const { data: productsData, error: productsError } = await supabase
    .from('products')
    .select('approved');

  const { count: totalUsers, error: userCountError } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true });
    
  // Fetch events count
  const { count: totalEvents, error: eventsCountError } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true });

  if (productsError || userCountError || eventsCountError) {
    console.error('Error fetching stats:', productsError, userCountError, eventsCountError);
    return redirect('/');
  }

  const dashboardStats = {
    totalProducts: productsData?.length || 0,
    approvedProducts: productsData?.filter((p: any) => p.approved).length || 0,
    pendingProducts: productsData?.filter((p: any) => !p.approved).length || 0,
    totalUsers: totalUsers || 0,
    totalEvents: totalEvents || 0,
  };

  return (
    <Layout>
      <AdminDashboard session={session} dashboardStats={dashboardStats} />
    </Layout>
  );
}