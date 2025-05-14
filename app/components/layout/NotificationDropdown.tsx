'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import useNotifications from '@/app/hooks/useNotifications';

export default function NotificationDropdown({ isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    router.push(notification.link);
    setIsOpen(false);
  };

  // If used in mobile context from navbar, we don't need to handle the dropdown ourselves
  // as the parent component (Navbar) will handle it
  const containerClass = isMobile 
    ? "w-full" 
    : "relative";
  
  const dropdownClass = isMobile
    ? "w-full border-0 shadow-none bg-transparent"
    : "absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden";

  return (
    <div className={containerClass}>
      {/* Only render the button if not in mobile view */}
      {!isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Show mobile header when in mobile mode */}
      {isMobile && (
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-base font-medium text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
      )}

      <AnimatePresence>
        {/* In mobile mode, always show the notifications */}
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
                    className={`w-full p-4 text-left hover:bg-zinc-800 flex items-start gap-3 border-b border-zinc-800 last:border-0 transition-colors ${
                      !notification.is_read ? 'bg-zinc-800/50' : ''
                    }`}
                  >
                    <div className="flex-grow">
                      <p className="text-sm text-white">{notification.title}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at))} ago
                      </p>
                    </div>
                    {!notification.is_read && (
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-zinc-400 text-sm">
                  No notifications
                </div>
              )}
            </div>
            
            {/* Add "Mark all as read" button in mobile view if there are unread notifications */}
            {isMobile && unreadCount > 0 && notifications.length > 0 && (
              <div className="p-2 border-t border-zinc-800">
                <button 
                  onClick={() => {
                    // Mark all notifications as read
                    notifications.forEach((notification: any) => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                    });
                  }}
                  className="w-full py-2 text-sm text-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}