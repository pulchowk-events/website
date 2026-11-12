"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCheck, MessageCircle, AtSign, Heart, Megaphone, CornerDownRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import useNotifications from "@/app/hooks/useNotifications";

type Tab = "all" | "mentions" | "system";

interface Props {
  isMobile?: boolean;
}

function iconForType(type: string) {
  const t = (type || "").toLowerCase();
  if (t === "comment") return MessageCircle;
  if (t === "reply") return CornerDownRight;
  if (t === "mention") return AtSign;
  if (t === "donation") return Heart;
  if (t === "broadcast") return Megaphone;
  return Bell;
}

function isSystem(n: any): boolean {
  if (n.is_broadcast) return true;
  const t = (n.type || "").toLowerCase();
  return t === "broadcast" || t === "donation" || t === "system";
}

function isMention(n: any): boolean {
  return (n.type || "").toLowerCase() === "mention";
}

export default function NotificationDropdown({ isMobile = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("all");
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
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, isMobile]);

  const filtered = useMemo(() => {
    if (tab === "mentions") return notifications.filter(isMention);
    if (tab === "system") return notifications.filter(isSystem);
    return notifications;
  }, [notifications, tab]);

  const handleClick = async (n: any) => {
    if (n.link?.startsWith("/lounge/")) {
      const postId = n.link.split("/lounge/")[1]?.split(/[?#]/)[0];
      if (postId) {
        try {
          const res = await fetch("/api/lounge/posts/exists?id=" + encodeURIComponent(postId));
          if (res.ok) {
            const { exists } = await res.json();
            if (!exists) {
              toast.error("This post has been removed", {
                description: "The author may have deleted it. The notification has been marked as read.",
              });
              await markAsRead(n.id);
              setIsOpen(false);
              return;
            }
          }
        } catch {}
      }
    }

    await markAsRead(n.id);
    router.push(n.link);
    setIsOpen(false);
  };

  const handleMarkAll = async () => {
    if (isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await markAllAsRead();
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className={isMobile ? "notif notif--mobile" : "notif"} ref={rootRef}>
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
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      )}

      {(isOpen || isMobile) && (
        <div className={isMobile ? "notif__panel notif__panel--mobile" : "notif__panel"}>
          <header className="notif__head">
            <h3 className="notif__title">Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={isMarkingAll}
                className="notif__mark-all"
              >
                <CheckCheck size={12} />
                {isMarkingAll ? "Marking…" : "Mark all read"}
              </button>
            )}
          </header>

          <div className="notif__tabs" role="tablist">
            {(["all", "mentions", "system"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={"notif__tab" + (tab === t ? " notif__tab--on" : "")}
                onClick={() => setTab(t)}
              >
                {t === "all" ? "All" : t === "mentions" ? "Mentions" : "System"}
              </button>
            ))}
          </div>

          <div className="notif__list">
            {filtered.length === 0 ? (
              <p className="notif__empty">
                {tab === "mentions"
                  ? "No mentions yet."
                  : tab === "system"
                    ? "No system notifications."
                    : "You’re all caught up."}
              </p>
            ) : (
              filtered.map((n: any) => {
                const Icon = iconForType(n.type);
                const source = n.source_user;
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleClick(n)}
                    className={"notif__item" + (n.is_read ? "" : " notif__item--unread")}
                  >
                    <span className="notif__dot" aria-hidden="true" />
                    <span className="notif__icon">
                      {source?.image ? (
                        <Image
                          src={source.image}
                          alt=""
                          width={24}
                          height={24}
                          className="notif__avatar-img"
                        />
                      ) : (
                        <Icon size={14} />
                      )}
                    </span>
                    <span className="notif__content">
                      <span className="notif__text">{n.title}</span>
                      <span className="notif__time" suppressHydrationWarning>
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
