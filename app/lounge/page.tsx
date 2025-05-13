import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import LoungeClient from './LoungeClient';

export const dynamic = 'force-dynamic';

export default async function LoungePage() {
  const session = await getServerSession(authOptions);
  
  // Fetch initial posts
  const { data: posts } = await supabase
    .from('lounge_posts')
    .select(`
      *,
      users:author_id (
        name,
        image
      )
    `)
    .order('created_at', { ascending: false })
    .limit(6);
  
  return (
    <Layout>
      <div id="portal-root"></div>
      <div className='max-w-7xl mx-auto dotted-border-vertical border-x'>
        <div className="px-8 py-8  min-h-200">
          <LoungeClient 
            initialPosts={posts || []} 
            userId={session?.user?.id} 
          />
        </div>
      </div>
    </Layout>
  );
}