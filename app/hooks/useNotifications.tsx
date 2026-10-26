import useSWR from 'swr';
import { useEffect } from 'react';

export default function useNotifications() {
  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  };

  const { data, error, mutate } = useSWR('/api/notifications', fetcher, {
    refreshInterval: 15000,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    shouldRetryOnError: true,
    retry: 3,
  });

  useEffect(() => {
    const onFocus = () => {
      mutate();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [mutate]);

  const notifications = data?.notifications ?? [];
  const unread = notifications.filter((n: any) => !n.is_read);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
      mutate();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      mutate();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
    markAllAsRead,
  };
}