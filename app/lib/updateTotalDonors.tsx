import { supabase } from './supabase';

export async function updateTotalDonors() {
  try {
    // Get count of verified donations
    const { count } = await supabase
      .from('donations')
      .select('*', { count: 'exact' })
      .eq('verified', true);

    // Update prize pool with accurate count
    const { error } = await supabase
      .from('prize_pool')
      .update({ 
        total_donors: count || 0,
        last_updated: new Date().toISOString()
      })
      .eq('id', '5cf13ac0-cfb6-456c-bffe-38e104692db0');

    if (error) throw error;
    return count || 0;

  } catch (error) {
    console.error('Error updating total donors:', error);
    throw error;
  }
}