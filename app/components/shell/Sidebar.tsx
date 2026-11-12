"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Briefcase, Box, MessageCircle, Bookmark, Heart, HelpCircle, LayoutGrid, MessageSquare, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";

export interface NavCounts {
  events_upcoming: number;
  jobs_open: number;
  saved_count: number;
}

interface Props {
  counts: NavCounts;
  isAdmin: boolean;
  isSignedIn: boolean;
  collapsed: boolean;
  drawerOpen: boolean;
  onDrawerClose: () => void;
  onCollapseToggle: () => void;
}

const BROWSE = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Calendar, countKey: "events_upcoming" as const },
  { href: "/jobs", label: "Jobs", icon: Briefcase, countKey: "jobs_open" as const },
  { href: "/product-hunt", label: "Projects", icon: Box },
  { href: "/lounge", label: "Lounge", icon: MessageCircle },
];

const YOU = [
  { href: "/saved", label: "Saved", icon: Bookmark, countKey: "saved_count" as const },
];

const COMMUNITY = [
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function Sidebar({ counts, isAdmin, isSignedIn, collapsed, drawerOpen, onDrawerClose, onCollapseToggle }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(href + "/");

  const Row = ({ href, label, icon: Icon, countKey }: { href: string; label: string; icon: any; countKey?: keyof NavCounts }) => {
    const count = countKey ? counts[countKey] : 0;
    return (
      <Link href={href} className="side__row" aria-current={isActive(href) ? "page" : undefined} onClick={onDrawerClose}>
        <Icon size={16} className="side__icon" />
        <span className="side__label">{label}</span>
      </Link>
    );
  };

  const inner = (
    <>
      <div className="side__mobile-head">
        <span className="side__brand">Pulchowk Events</span>
        <button type="button" className="row-icon-btn" onClick={onDrawerClose} aria-label="Close"><X size={16} /></button>
      </div>

      <div className="side__scroll">
        <div className="side__group">
          <p className="side__group-label">Browse</p>
          {BROWSE.map((r) => <Row key={r.href} {...r} />)}
        </div>

        {isSignedIn && (
          <div className="side__group">
            <p className="side__group-label">You</p>
            {YOU.map((r) => <Row key={r.href} {...r} />)}
          </div>
        )}

        <div className="side__group">
          <p className="side__group-label">Community</p>
          {COMMUNITY.map((r) => <Row key={r.href} {...r} />)}
        </div>

        {isAdmin && (
          <div className="side__group">
            <p className="side__group-label">Admin</p>
            <Row href="/admin" label="Dashboard" icon={LayoutGrid} />
          </div>
        )}
      </div>

      <div className="side__footer">
        <a href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener noreferrer" className="side__discord">
          <MessageSquare size={14} />
          <span>Join Discord</span>
        </a>
        <button type="button" className="side__collapse" onClick={onCollapseToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          <span>{collapsed ? "Expand" : "Collapse"}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {drawerOpen && <div className="side__scrim" onClick={onDrawerClose} aria-hidden="true" />}
      <aside
        className={"side" + (collapsed ? " side--collapsed" : "") + (drawerOpen ? " side--open" : "")}
        aria-label="Primary navigation"
      >
        {inner}
      </aside>
    </>
  );
}
