import { SupabaseClient } from '@supabase/supabase-js';
// confusion


type NotificationType = 'product_vote' | 'product_comment' | 'post_comment' | 'donation'| 'broadcast';

interface NotificationData {
  user_id: string;
  type: NotificationType;
  title: string;
  link: string;
  source_user_id?: string | null;
}

export async function insertNotification(
  supabase: SupabaseClient,
  data: NotificationData
) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.user_id,
      type: data.type,
      title: data.title,
      link: data.link,
      is_read: false,
      source_user_id: data.source_user_id || null,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('[Notification] Insert error:', error);
    throw error;
  }
}

// Helper to delete old notifications
export async function cleanupOldNotifications(supabase: SupabaseClient) {
  const now = new Date();
  
  // Delete read notifications older than 24 hours
  const readCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Delete unread notifications older than 10 days
  const unreadCutoff = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('notifications')
    .delete()
    .or(`and(is_read.eq.true,created_at.lt.${readCutoff.toISOString()}),created_at.lt.${unreadCutoff.toISOString()}`);

  if (error) {
    console.error('[Notification] Cleanup error:', error);
  }
}