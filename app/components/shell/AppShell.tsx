"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { Sidebar, NavCounts } from "./Sidebar";
import { BottomTabBar } from "./BottomTabBar";
import { CommandPalette } from "./CommandPalette";
import { writeLayoutPrefsClient } from "@/app/lib/preferences";
import Footer from "@/app/components/layout/Footer";
import { RightRail } from "./RightRail";
import type { RailBundle } from "@/app/lib/queries";

interface Props {
  children: ReactNode;
  counts: NavCounts;
  isAdmin: boolean;
  isSignedIn: boolean;
  initialCollapsed: boolean;
  density: "comfortable" | "compact";
  rail: RailBundle;
  hiddenWidgets: string[];
}

export function AppShell({ children, counts, isAdmin, isSignedIn, initialCollapsed, density, rail, hiddenWidgets }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); setPaletteOpen(true); return;
      }
      if (!isTyping && e.key === "/") { e.preventDefault(); setPaletteOpen(true); return; }
      if (!isTyping && e.key === "[") { e.preventDefault(); toggleCollapsed(); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setDrawerOpen(false); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);
  useEffect(() => { setCollapsed(initialCollapsed); }, [initialCollapsed]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      const next = !c;
      writeLayoutPrefsClient({ sidebarCollapsed: next, density });
      return next;
    });
  };

  return (
    <div className="app" data-density={density}>
      <TopBar onMenuToggle={() => setDrawerOpen(true)} onPaletteOpen={() => setPaletteOpen(true)} />
      <div className="app__body">
        <Sidebar
          counts={counts}
          isAdmin={isAdmin}
          isSignedIn={isSignedIn}
          collapsed={collapsed}
          drawerOpen={drawerOpen}
          onDrawerClose={() => setDrawerOpen(false)}
          onCollapseToggle={toggleCollapsed}
        />
        <main className="app__main">{children}<Footer /></main>
        <RightRail bundle={rail} hiddenWidgets={hiddenWidgets} />
      </div>
      <BottomTabBar />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onToggleSidebar={toggleCollapsed} isAdmin={isAdmin} />
    </div>
  );
}
