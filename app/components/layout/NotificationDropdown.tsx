'use client';

import { useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import useNotifications from '@/app/hooks/useNotifications';

export default function NotificationDropdown({ isMobile = false }: { isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    // Pre-flight: for lounge post notifications, verify the post still exists
    // before navigating. Otherwise we'd mark it read and land on a 404.
    if (notification.link?.startsWith('/lounge/')) {
      const postId = notification.link.split('/lounge/')[1]?.split(/[?#]/)[0];
      if (postId) {
        try {
          const res = await fetch(
            `/api/lounge/posts/exists?id=${encodeURIComponent(postId)}`
          );
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

  const containerClass = isMobile ? 'w-full' : 'relative';

  const dropdownClass = isMobile
    ? 'w-full border-0 shadow-none bg-transparent'
    : 'absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg overflow-hidden';

  return (
    <div className={containerClass}>
      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full hover:bg-accent transition-colors text-foreground"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {isMobile && (
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-base font-medium text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      )}

      <AnimatePresence>
        {(isOpen || isMobile) && (
          <motion.div
            initial={isMobile ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={isMobile ? { opacity: 1 } : { opacity: 0, y: 10 }}
            className={dropdownClass}
          >
            <div className={`${isMobile ? 'max-h-[70vh]' : 'max-h-96'} overflow-y-auto`}>
              {notifications.length > 0 ? (
                notifications.map((notification: any) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left hover:bg-accent flex items-start gap-3 border-b border-border last:border-0 transition-colors ${
                      !notification.is_read ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex-grow">
                      <p className="text-sm text-foreground">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at))} ago
                      </p>
                    </div>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No notifications
                </div>
              )}
            </div>

            {/* Mark all as read — shown whenever there are unread items */}
            {unreadCount > 0 && notifications.length > 0 && (
              <div className="p-2 border-t border-border">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  {isMarkingAll ? 'Marking…' : 'Mark all as read'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}