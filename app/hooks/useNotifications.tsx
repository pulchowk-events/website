import useSWR from 'swr';

export default function useNotifications() {
  const fetcher = (url: string) => fetch(url).then(res => res.json());

  const { data, mutate, error } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 30000, // Poll every 30 seconds
  });

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n: any) => !n.is_read);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      mutate(); // Refresh the notifications
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return {
    notifications,
    unread,
    unreadCount: unread.length,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
    markAsRead,
  };
}