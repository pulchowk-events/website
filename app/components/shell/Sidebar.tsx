"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Briefcase, Box, MessageCircle, Bookmark, Heart, HelpCircle, LayoutGrid, MessageSquare, GraduationCap, PanelLeftClose, PanelLeftOpen, X, Github, FileText, Shield, Globe, Users } from "lucide-react";

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
  { href: "/clubs", label: "Clubs", icon: Users },
  { href: "/jobs", label: "Jobs", icon: Briefcase, countKey: "jobs_open" as const },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/product-hunt", label: "Product Hunt", icon: Box },
  { href: "/lounge", label: "Lounge", icon: MessageCircle },
];

const YOU = [
  { href: "/saved", label: "Saved", icon: Bookmark, countKey: "saved_count" as const },
];

const COMMUNITY = [
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "/help", label: "Help", icon: HelpCircle },
];

const ABOUT: { href: string; label: string; icon: any; external?: boolean }[] = [
  { href: "/terms", label: "Terms", icon: FileText },
  { href: "/privacy", label: "Privacy", icon: Shield },
  { href: "https://github.com/pulchowk-events", label: "GitHub", icon: Github, external: true },
  { href: "/landing", label: "Landing", icon: Globe },
];

interface SideRowProps {
  href: string;
  label: string;
  icon: any;
  active: boolean;
  onNavigate: () => void;
}

// Module-level component (react-hooks/static-components forbids defining it inside Sidebar).
function Row({ href, label, icon: Icon, active, onNavigate }: SideRowProps) {
  return (
    <Link href={href} className="side__row" aria-current={active ? "page" : undefined} onClick={onNavigate}>
      <Icon size={16} className="side__icon" />
      <span className="side__label">{label}</span>
    </Link>
  );
}

export function Sidebar({ counts, isAdmin, isSignedIn, collapsed, drawerOpen, onDrawerClose, onCollapseToggle }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(href + "/");

  const renderRow = (r: { href: string; label: string; icon: any }) => (
    <Row key={r.href} href={r.href} label={r.label} icon={r.icon} active={!!isActive(r.href)} onNavigate={onDrawerClose} />
  );

  const inner = (
    <>
      <div className="side__mobile-head">
        <span className="side__brand">Pulchowk Events</span>
        <button type="button" className="row-icon-btn" onClick={onDrawerClose} aria-label="Close"><X size={16} /></button>
      </div>

      <div className="side__scroll">
        <div className="side__group">
          <p className="side__group-label">Browse</p>
          {BROWSE.map((r) => renderRow(r))}
        </div>

        {isSignedIn && (
          <div className="side__group">
            <p className="side__group-label">You</p>
            {YOU.map((r) => renderRow(r))}
          </div>
        )}

        <div className="side__group">
          <p className="side__group-label">Community</p>
          {COMMUNITY.map((r) => renderRow(r))}
        </div>

        <div className="side__group">
          <p className="side__group-label">About</p>
          {ABOUT.map((r) => {
            const Icon = r.icon;
            return r.external ? (
              <a
                key={r.href}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="side__row"
                onClick={onDrawerClose}
              >
                <Icon size={16} className="side__icon" />
                <span className="side__label">{r.label}</span>
              </a>
            ) : (
              renderRow(r)
            );
          })}
        </div>

        {isAdmin && (
          <div className="side__group">
            <p className="side__group-label">Admin</p>
            {renderRow({ href: "/admin", label: "Dashboard", icon: LayoutGrid })}
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
