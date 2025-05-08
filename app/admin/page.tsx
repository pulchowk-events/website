import Layout from '@/app/components/layout/Layout';
import AdminProductForm from '@/app/components/AdminProductForm';
import AdminUserForm from '@/app/components/AdminUserForm';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import { supabase } from '../lib/supabase';

export default async function AdminPage() {
  try {
    // Get session server-side
    const session = await getServerSession(authOptions);

    // Redirect if not authenticated
    if (!session?.user?.email) {
      return redirect('/');
    }

    // Check admin status using try-catch
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('email')
        .eq('email', session.user.email)
        .single();

      if (error || !data) {
        console.error('Admin check error:', error);
        return redirect('/');
      }

      return (
        <Layout>
          <div className="max-w-6xl mx-auto py-12 px-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>

            <div className="grid gap-8">
              <AdminProductForm />
              <AdminUserForm />
            </div>
          </div>
        </Layout>
      );
    } catch (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return redirect('/');
    }
  } catch (error) {
    console.error('Admin page error:', error);
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-12 px-6">
          <h1 className="text-3xl font-bold text-red-500">Error loading admin panel</h1>
          <p className="mt-4 text-gray-400">Please try again later.</p>
        </div>
      </Layout>
    );
  }
}