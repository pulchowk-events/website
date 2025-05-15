import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import { createServerSupabaseClient } from '../lib/supabase-server';
import Layout from '@/app/components/layout/Layout';
import AdminDashboard from '@/app/components/admin/AdminDashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
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
    return redirect('/');
  }

  // Fetch stats
  const { data: productsData } = await supabase
    .from('products')
    .select('approved');

  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true });

  const { data: donations } = await supabase
    .from('donations')
    .select('amount')
    .eq('verified', true);

  const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;

  const dashboardStats = {
    totalProducts: productsData?.length || 0,
    approvedProducts: productsData?.filter(p => p.approved).length || 0,
    pendingProducts: productsData?.filter(p => !p.approved).length || 0,
    totalUsers: totalUsers || 0,
    totalEvents: totalEvents || 0,
    totalDonations: totalDonations
  };

  return (

      <AdminDashboard session={session} dashboardStats={dashboardStats} />

  );
}