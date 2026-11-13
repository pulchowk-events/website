"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { writeLayoutPrefsClient, type LayoutPrefs } from "@/app/lib/preferences";
import DeleteAccountDialog from "./DeleteAccountDialog";

interface Props {
  userId: string;
  email: string | null;
  initialPrefs: LayoutPrefs;
  initialHidden: string[];
  initialProfilePrivate: boolean;
}

const WIDGET_GROUPS: Array<{
  group: string;
  hint: string;
  items: Array<{ key: string; label: string }>;
}> = [
  {
    group: "Everywhere",
    hint: "Shown on every page of the site.",
    items: [{ key: "prizePool", label: "Prize pool" }],
  },
  {
    group: "Browse pages",
    hint: "Shown on Home, Events, Jobs, Product Hunt, and Lounge — where each widget has data.",
    items: [
      { key: "topProjects", label: "Top products" },
      { key: "upcomingEvents", label: "Upcoming events" },
      { key: "newJobs", label: "New jobs" },
      { key: "trending", label: "Trending posts" },
    ],
  },
  {
    group: "Donate page",
    hint: "Only shown on /donate.",
    items: [
      { key: "topDonors", label: "Top donors" },
      { key: "recentSupporters", label: "Recent supporters" },
    ],
  },
];

async function patchPrefs(body: any) {
  const res = await fetch("/api/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to save");
}

export function SettingsClient({ userId, email, initialPrefs, initialHidden, initialProfilePrivate }: Props) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<LayoutPrefs>(initialPrefs);
  const [hidden, setHidden] = useState<Set<string>>(new Set(initialHidden));
  const [saving, setSaving] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [profilePrivate, setProfilePrivate] = useState(initialProfilePrivate);

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

  const savePrivacy = async (next: boolean) => {
    setSaving("privacy");
    setProfilePrivate(next);
    try {
      await patchPrefs({ profile_private: next });
      toast.success(next ? "Profile is now private" : "Profile is now public");
      router.refresh();
    } catch {
      setProfilePrivate(!next);
      toast.error("Could not save");
    } finally {
      setSaving(null);
    }
  };

  // local alias so the name doesn't collide with the prop
  const [profilePrivateState, setProfilePrivate_state] = useState(initialProfilePrivate);

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

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {WIDGET_GROUPS.map((g) => (
            <div key={g.group}>
              <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-1)", marginBottom: 2 }}>
                {g.group}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>
                {g.hint}
              </p>
              <div className="settings__checks">
                {g.items.map((w) => (
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
            </div>
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
            <p className="settings__row-title">Private profile</p>
            <p className="settings__row-desc">
              When enabled, your profile page shows only your name, avatar, and join date. Your individual posts, comments, and products stay visible in their original places — this only hides the aggregated activity view.
            </p>
          </div>
          <label className="settings__toggle">
            <input
              type="checkbox"
              checked={profilePrivate}
              onChange={(e) => savePrivacy(e.target.checked)}
              disabled={saving === "privacy"}
            />
            <span className="settings__toggle-track" aria-hidden="true" />
          </label>
        </div>

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

      <section className="settings__section settings__section--danger">
        <header className="settings__head">
          <h2 className="settings__title" style={{ color: "var(--danger)" }}>Danger zone</h2>
          <p className="settings__desc">Permanently delete your account and all content you have posted.</p>
        </header>

        <div className="settings__row">
          <div className="settings__row-label">
            <p className="settings__row-title">Delete account</p>
            <p className="settings__row-desc">
              Removes your account, posts, comments, events, projects, votes, and saves. Donations are anonymised. Not reversible.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setDeleteOpen(true)}
            style={{ color: "var(--danger)", borderColor: "rgba(255,92,92,0.35)" }}
          >
            Delete account
          </button>
        </div>
      </section>

      <DeleteAccountDialog open={deleteOpen} email={email} onClose={() => setDeleteOpen(false)} />
    </div>
  );
}
