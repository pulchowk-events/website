"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

interface Props {
  title: string;
  action?: { href: string; label: string };
  collapsible?: boolean;
  children: ReactNode;
}

const STORAGE_PREFIX = "rail-collapsed:";

export function RailWidget({ title, action, collapsible = true, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_PREFIX + title);
      if (v === "1") setCollapsed(true);
    } catch {}
  }, [title]);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_PREFIX + title, next ? "1" : "0"); } catch {}
      return next;
    });
  };

  return (
    <section className={"rail-w" + (collapsed ? " rail-w--collapsed" : "")}>
      <header className="rail-w__head">
        {collapsible ? (
          <button
            type="button"
            className="rail-w__head-btn"
            onClick={toggle}
            aria-expanded={!collapsed}
          >
            <span className="rail-w__title">{title}</span>
            <ChevronDown size={12} className={"rail-w__chevron" + (collapsed ? " rail-w__chevron--closed" : "")} />
          </button>
        ) : (
          <h2 className="rail-w__title">{title}</h2>
        )}
        {action && !collapsed && (
          <Link href={action.href} className="rail-w__action">{action.label}</Link>
        )}
      </header>
      {!collapsed && <div className="rail-w__body">{children}</div>}
    </section>
  );
}
