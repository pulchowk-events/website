// server component

import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import ProductHuntClient from './ProductHuntClient';

export const dynamic = 'force-dynamic';

export default async function ProductHuntPage() {
  const session = await getServerSession(authOptions);

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  return (
    <Layout>
      <ProductHuntClient
        products={products || []}
        userId={session?.user?.id}
      />
    </Layout>
  );
}