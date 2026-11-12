"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Calendar, Heart, Package, UserPlus, Bell, Flag,
  Menu, X,
} from "lucide-react";

interface Props {
  children: React.ReactNode;
  session: { name?: string | null; email?: string | null; image?: string | null } | null;
}

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/events", label: "Pending events", icon: Calendar },
  { href: "/admin/donations", label: "Donations", icon: Heart },
  { href: "/admin/products", label: "Pending products", icon: Package },
  { href: "/admin/admins", label: "Manage admins", icon: UserPlus },
  { href: "/admin/broadcast", label: "Broadcast", icon: Bell },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export function AdminShell({ children, session }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const active = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(href + "/");

  return (
    <div className="admin-shell">
      {open && (
        <div className="admin-scrim" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <aside className={"admin-sidebar" + (open ? " admin-sidebar--open" : "")} aria-label="Admin navigation">
        <header className="admin-sidebar__head">
          <Link href="/admin" className="admin-sidebar__logo">Pulchowk Events</Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="admin-sidebar__close"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </header>

        <nav className="admin-sidebar__nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            const on = active(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="admin-nav-btn"
                aria-current={on ? "page" : undefined}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar__foot">
          <Link href="/" className="admin-sidebar__exit">← Back to site</Link>
        </div>
      </aside>

      <div className="admin-body">
        <header className="admin-header">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="admin-header__hamburger"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
          <h1 className="admin-header__title">
            {NAV.find((n) => active(n.href, n.exact))?.label || "Admin"}
          </h1>
          <div className="admin-header__actions">
            <div className="admin-user">
              <span className="admin-user__avatar">
                {session?.image ? (
                  <Image
                    src={session.image}
                    alt={session.name || "Admin"}
                    width={28}
                    height={28}
                    className="admin-user__avatar-img"
                  />
                ) : (
                  <span className="admin-user__initial">
                    {session?.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                )}
              </span>
              <div className="admin-user__meta">
                <span className="admin-user__name">{session?.name || "Admin"}</span>
                <span className="admin-user__email">{session?.email || ""}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="admin-main">
          <div className="admin-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
