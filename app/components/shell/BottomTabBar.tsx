"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Briefcase, GraduationCap, Box } from "lucide-react";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/product-hunt", label: "Product Hunt", icon: Box },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname?.startsWith(href + "/");

  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map((t) => {
        const Icon = t.icon;
        return (
          <Link key={t.href} href={t.href} className="tab-bar__item" aria-current={active(t.href) ? "page" : undefined}>
            <Icon size={20} />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
