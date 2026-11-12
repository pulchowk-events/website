import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { authOptions } from '@/auth';
import { createServerSupabaseClient } from '../lib/supabase-server';
import { isAdmin } from '@/app/lib/isAdmin';
import AdminDashboard from '@/app/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) notFound();

  const admin = await isAdmin(session.user.email);
  if (!admin) notFound();

  const supabase = createServerSupabaseClient();

  const [
    { count: totalProducts },
    { count: approvedProducts },
    { count: totalUsers },
    { count: totalEvents },
    { data: donations },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('donations').select('amount').eq('verified', true),
  ]);

  const totalDonations = donations?.reduce((sum, d) => sum + d.amount, 0) || 0;

  const dashboardStats = {
    totalProducts: totalProducts || 0,
    approvedProducts: approvedProducts || 0,
    pendingProducts: (totalProducts || 0) - (approvedProducts || 0),
    totalUsers: totalUsers || 0,
    totalEvents: totalEvents || 0,
    totalDonations,
  };

  return <AdminDashboard session={session} dashboardStats={dashboardStats} />;
}
