"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Calendar, Briefcase, Box, MessageCircle, Bookmark, Heart, HelpCircle, Plus, PanelLeft, FileText, GraduationCap } from "lucide-react";

interface Result {
  type: "post" | "event" | "job" | "project";
  id: string;
  title: string;
  meta?: string;
  href: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onToggleSidebar: () => void;
}

const PAGES = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/product-hunt", label: "Projects", icon: Box },
  { href: "/lounge", label: "Lounge", icon: MessageCircle },
  { href: "/scholarships", label: "Scholarships", icon: GraduationCap },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/donate", label: "Donate", icon: Heart },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function CommandPalette({ open, onClose, onToggleSidebar }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) { setQ(""); setResults([]); setActive(0); setTimeout(() => inputRef.current?.focus(), 0); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length === 0) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/search?q=" + encodeURIComponent(q.trim()) + "&limit=3");
        if (!res.ok) return;
        const data = await res.json();
        setResults(data.results || []);
      } finally { setLoading(false); }
    }, 150);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, open]);

  const actions = [
    { label: "Create post", action: () => { onClose(); router.push(session ? "/lounge/new" : "/lounge"); }, icon: Plus },
    { label: "Create event", action: () => { onClose(); router.push("/events/new"); }, icon: Plus },
    { label: "Submit project", action: () => { onClose(); router.push(session ? "/product-hunt?showAddProduct=true" : "/product-hunt"); }, icon: Plus },
    { label: "Toggle sidebar", action: () => { onClose(); onToggleSidebar(); }, icon: PanelLeft },
  ];

  const filteredPages = PAGES.filter((p) => !q || p.label.toLowerCase().includes(q.toLowerCase()));

  const trimmedQ = q.trim();
  const showSearchAll = trimmedQ.length > 0;

  const combined = [
    ...filteredPages.map((p) => ({ kind: "page" as const, label: p.label, icon: p.icon, onClick: () => { onClose(); router.push(p.href); } })),
    ...actions.filter((a) => !q || a.label.toLowerCase().includes(q.toLowerCase())).map((a) => ({ kind: "action" as const, label: a.label, icon: a.icon, onClick: a.action })),
    ...results.map((r) => ({ kind: "result" as const, label: r.title, meta: r.meta, onClick: () => { onClose(); router.push(r.href); } })),
    ...(showSearchAll ? [{ kind: "search" as const, label: "See all results for \"" + trimmedQ + "\"", meta: undefined, onClick: () => { onClose(); router.push("/search?q=" + encodeURIComponent(trimmedQ)); } }] : []),
  ];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, combined.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); combined[active]?.onClick(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, active, combined, onClose]);

  if (!open) return null;

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette__input"
          placeholder="Search or type a command…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
        />
        <div className="palette__results">
          {combined.length === 0 && q && !loading && <p className="palette__empty">No matches.</p>}
          {combined.map((item, i) => {
            const Icon = "icon" in item ? item.icon : FileText;
            return (
              <button
                key={i}
                type="button"
                className={
                  "palette__row" +
                  (i === active ? " palette__row--active" : "") +
                  (item.kind === "search" ? " palette__row--search" : "")
                }
                onMouseEnter={() => setActive(i)}
                onClick={item.onClick}
              >
                <Icon size={14} />
                <span className="palette__row-label">{item.label}</span>
                {"meta" in item && item.meta && <span className="palette__row-meta">{item.meta}</span>}
                <span className="palette__row-kind">
                  {item.kind === "search" ? "↵" : item.kind}
                </span>
              </button>
            );
          })}
        </div>
        <div className="palette__footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
