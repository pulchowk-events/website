'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import useNotifications from '@/app/hooks/useNotifications';

export default function NotificationDropdown({ isMobile = false }: { isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || isMobile) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, isMobile]);

  const handleNotificationClick = async (notification: any) => {
    if (notification.link?.startsWith('/lounge/')) {
      const postId = notification.link.split('/lounge/')[1]?.split(/[?#]/)[0];
      if (postId) {
        try {
          const res = await fetch('/api/lounge/posts/exists?id=' + encodeURIComponent(postId));
          if (res.ok) {
            const { exists } = await res.json();
            if (!exists) {
              toast.error('This post has been removed', {
                description:
                  'The author may have deleted it. The notification has been marked as read.',
              });
              await markAsRead(notification.id);
              setIsOpen(false);
              return;
            }
          }
        } catch {
          // Network error — fall through and let navigation try anyway
        }
      }
    }

    await markAsRead(notification.id);
    router.push(notification.link);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className={isMobile ? 'notif notif--mobile' : 'notif'} ref={rootRef}>
      {!isMobile && (
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="notif__btn"
          aria-label="Notifications"
          aria-expanded={isOpen}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="notif__badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {isMobile && (
        <header className="notif__mobile-head">
          <h3 className="notif__mobile-title">Notifications</h3>
          {unreadCount > 0 && (
            <span className="notif__badge notif__badge--inline">
              {unreadCount} new
            </span>
          )}
        </header>
      )}

      {(isOpen || isMobile) && (
        <div className={isMobile ? 'notif__panel notif__panel--mobile' : 'notif__panel'}>
          <div className="notif__list">
            {notifications.length > 0 ? (
              notifications.map((notification: any) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={
                    'notif__item' +
                    (notification.is_read ? '' : ' notif__item--unread')
                  }
                >
                  <div className="notif__item-body">
                    <p className="notif__item-title">{notification.title}</p>
                    <p className="notif__item-time" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(notification.created_at))} ago
                    </p>
                  </div>
                  {!notification.is_read && <span className="notif__dot" aria-hidden="true" />}
                </button>
              ))
            ) : (
              <p className="notif__empty">No notifications.</p>
            )}
          </div>

          {unreadCount > 0 && notifications.length > 0 && (
            <div className="notif__foot">
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="notif__mark"
              >
                <CheckCheck size={14} />
                {isMarkingAll ? 'Marking…' : 'Mark all as read'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
