"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { writeLayoutPrefsClient, type LayoutPrefs } from "@/app/lib/preferences";

interface Props {
  userId: string;
  email: string | null;
  initialPrefs: LayoutPrefs;
  initialHidden: string[];
}

const WIDGETS = [
  { key: "community", label: "Community (Join Discord)" },
  { key: "prizePool", label: "Prize pool" },
  { key: "topDonors", label: "Top donors" },
  { key: "trending", label: "Trending posts" },
  { key: "upcomingEvents", label: "Upcoming events" },
  { key: "recentSupporters", label: "Recent supporters" },
];

async function patchPrefs(body: any) {
  const res = await fetch("/api/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to save");
}

export function SettingsClient({ userId, email, initialPrefs, initialHidden }: Props) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<LayoutPrefs>(initialPrefs);
  const [hidden, setHidden] = useState<Set<string>>(new Set(initialHidden));
  const [saving, setSaving] = useState<string | null>(null);

  const save = async (key: string, nextPrefs: LayoutPrefs, nextHidden: Set<string>) => {
    setSaving(key);
    writeLayoutPrefsClient(nextPrefs);
    try {
      await patchPrefs({
        density: nextPrefs.density,
        sidebar_collapsed: nextPrefs.sidebarCollapsed,
        hidden_widgets: Array.from(nextHidden),
      });
      toast.success("Saved");
      router.refresh();
    } catch {
      toast.error("Could not save");
    } finally {
      setSaving(null);
    }
  };

  const setDensity = (density: LayoutPrefs["density"]) => {
    const next = { ...prefs, density };
    setPrefs(next);
    save("density", next, hidden);
  };

  const setCollapsed = (sidebarCollapsed: boolean) => {
    const next = { ...prefs, sidebarCollapsed };
    setPrefs(next);
    save("collapsed", next, hidden);
  };

  const toggleWidget = (key: string) => {
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setHidden(next);
    save("widgets", prefs, next);
  };

  return (
    <div className="settings">
      <section className="settings__section">
        <header className="settings__head">
          <h2 className="settings__title">Appearance</h2>
          <p className="settings__desc">How the site looks when you open it.</p>
        </header>

        <div className="settings__row">
          <div className="settings__row-label">
            <p className="settings__row-title">Density</p>
            <p className="settings__row-desc">Compact shows more per screen.</p>
          </div>
          <div className="seg">
            <button
              type="button"
              className={"seg__item" + (prefs.density === "comfortable" ? " seg__item--on" : "")}
              onClick={() => setDensity("comfortable")}
              disabled={saving === "density"}
            >
              Comfortable
            </button>
            <button
              type="button"
              className={"seg__item" + (prefs.density === "compact" ? " seg__item--on" : "")}
              onClick={() => setDensity("compact")}
              disabled={saving === "density"}
            >
              Compact
            </button>
          </div>
        </div>

        <div className="settings__row">
          <div className="settings__row-label">
            <p className="settings__row-title">Default sidebar</p>
            <p className="settings__row-desc">Start with the sidebar expanded or as a rail.</p>
          </div>
          <div className="seg">
            <button
              type="button"
              className={"seg__item" + (!prefs.sidebarCollapsed ? " seg__item--on" : "")}
              onClick={() => setCollapsed(false)}
              disabled={saving === "collapsed"}
            >
              Expanded
            </button>
            <button
              type="button"
              className={"seg__item" + (prefs.sidebarCollapsed ? " seg__item--on" : "")}
              onClick={() => setCollapsed(true)}
              disabled={saving === "collapsed"}
            >
              Collapsed
            </button>
          </div>
        </div>
      </section>

      <section className="settings__section">
        <header className="settings__head">
          <h2 className="settings__title">Right rail widgets</h2>
          <p className="settings__desc">Hide widgets you don&apos;t want to see.</p>
        </header>

        <div className="settings__checks">
          {WIDGETS.map((w) => (
            <label key={w.key} className="settings__check">
              <input
                type="checkbox"
                checked={!hidden.has(w.key)}
                onChange={() => toggleWidget(w.key)}
                disabled={saving === "widgets"}
              />
              <span>{w.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="settings__section">
        <header className="settings__head">
          <h2 className="settings__title">Account</h2>
          <p className="settings__desc">Your sign-in and profile.</p>
        </header>

        <div className="settings__row">
          <div className="settings__row-label">
            <p className="settings__row-title">Name and bio</p>
            <p className="settings__row-desc">Edit how you appear on the site.</p>
          </div>
          <Link href={"/profile/" + userId} className="btn btn--secondary btn--sm">
            Edit on profile
          </Link>
        </div>

        <div className="settings__row">
          <div className="settings__row-label">
            <p className="settings__row-title">Email</p>
            <p className="settings__row-desc">{email || "Not provided"}</p>
          </div>
        </div>

        <div className="settings__row">
          <div className="settings__row-label">
            <p className="settings__row-title">Sign out</p>
            <p className="settings__row-desc">Sign out of this device.</p>
          </div>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      </section>
    </div>
  );
}
