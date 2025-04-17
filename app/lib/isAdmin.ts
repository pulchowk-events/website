import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function isAdmin(email: string | null | undefined) {
  if (!email) return false;

  const supabase = createServerComponentClient({ cookies });

  const { data } = await supabase
    .from('admins')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  return !!data;
}
