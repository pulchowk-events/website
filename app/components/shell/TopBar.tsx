"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search, Plus, ChevronDown, User, Bookmark, Settings, LogOut, HelpCircle } from "lucide-react";
import NotificationDropdown from "@/app/components/layout/NotificationDropdown";
import SignInModal from "@/app/components/signIn/SignInModal";
import { Avatar } from "@/app/components/ui/Avatar";

interface Props {
  onMenuToggle: () => void;
  onPaletteOpen: () => void;
}

export function TopBar({ onMenuToggle, onPaletteOpen }: Props) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
      if (createRef.current && !createRef.current.contains(e.target as Node)) setCreateOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setAvatarOpen(false); setCreateOpen(false); }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => { setAvatarOpen(false); setCreateOpen(false); }, [pathname]);

  return (
    <>
      <header className="topbar">
        <button type="button" className="topbar__toggle" onClick={onMenuToggle} aria-label="Toggle sidebar">
          <Menu size={16} />
        </button>

        <Link href="/" className="topbar__logo">
          Pulchowk Events
        </Link>

        <button
          type="button"
          className="topbar__icon-btn topbar__search-mobile"
          onClick={onPaletteOpen}
          aria-label="Search"
          title="Search"
        >
          <Search size={16} />
        </button>

        <div className="topbar__actions">
          {session ? (
            <>
              <div className="topbar__create" ref={createRef}>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => setCreateOpen((v) => !v)}>
                  Create
                  <ChevronDown size={12} style={{ marginLeft: 6 }} />
                </button>
                {createOpen && (
                  <div className="menu menu--right">
                    <Link href="/lounge/new" className="menu__item" onClick={() => setCreateOpen(false)}>Post</Link>
                    <Link href="/events/new" className="menu__item" onClick={() => setCreateOpen(false)}>Event</Link>
                    <Link href="/product-hunt/new" className="menu__item" onClick={() => setCreateOpen(false)}>Project</Link>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="topbar__icon-btn topbar__search-desktop"
                onClick={onPaletteOpen}
                aria-label="Search"
                title="Search"
              >
                <Search size={16} />
              </button>
              <NotificationDropdown />
              <div className="topbar__avatar-wrap" ref={avatarRef}>
                <button type="button" className="topbar__avatar" onClick={() => setAvatarOpen((v) => !v)} aria-label="Account">
                  <Avatar
                    src={session.user.image}
                    name={session.user.name}
                    size={28}
                    className="topbar__avatar-img"
                  />
                </button>
                {avatarOpen && (
                  <div className="menu menu--right" style={{ minWidth: 200 }}>
                    <div className="menu__head">
                      <p className="menu__head-name">{session.user.name || "Anonymous"}</p>
                      <p className="menu__head-email">{session.user.email}</p>
                    </div>
                    <Link href={"/profile/" + session.user.id} className="menu__item" onClick={() => setAvatarOpen(false)}>
                      <User size={14} /> Profile
                    </Link>
                    <Link href="/saved" className="menu__item" onClick={() => setAvatarOpen(false)}>
                      <Bookmark size={14} /> Saved
                    </Link>
                    <Link href="/settings" className="menu__item" onClick={() => setAvatarOpen(false)}>
                      <Settings size={14} /> Settings
                    </Link>
                    <Link href="/help" className="menu__item" onClick={() => setAvatarOpen(false)}>
                      <HelpCircle size={14} /> Help
                    </Link>
                    <button
                      type="button"
                      className="menu__item"
                      onClick={() => { setAvatarOpen(false); signOut(); }}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className="topbar__icon-btn topbar__search-desktop"
                onClick={onPaletteOpen}
                aria-label="Search"
                title="Search"
              >
                <Search size={16} />
              </button>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => setSignInOpen(true)}>Sign in</button>
              <a href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener noreferrer" className="btn btn--secondary btn--sm">Join Discord</a>
            </>
          )}
        </div>
      </header>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
