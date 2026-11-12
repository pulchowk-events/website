"use client";

import { useState } from "react";
import { User, MessageSquare, Package, Bookmark } from "lucide-react";
import { ProfileHeader } from "./ProfileHeader";
import UserPosts from "./UserPosts";
import UserComments from "./UserComments";
import UserProducts from "./UserProducts";
import UserSaved from "./UserSaved";

interface Props {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    bio: string | null;
    created_at: string | null;
  };
  stats: { posts: number; comments: number; products: number };
  isOwnProfile: boolean;
}

type Tab = "posts" | "comments" | "projects" | "saved";

export default function ProfileContent({ user, stats, isOwnProfile }: Props) {
  const [tab, setTab] = useState<Tab>("posts");

  const tabs: { value: Tab; label: string; icon: any; show: boolean }[] = [
    { value: "posts", label: "Posts", icon: User, show: true },
    { value: "comments", label: "Comments", icon: MessageSquare, show: true },
    { value: "projects", label: "Projects", icon: Package, show: true },
    { value: "saved", label: "Saved", icon: Bookmark, show: isOwnProfile },
  ];

  const visibleTabs = tabs.filter((t) => t.show);

  return (
    <div className="profile">
      <ProfileHeader user={user} stats={stats} isOwnProfile={isOwnProfile} />

      <nav className="profile-tabs" role="tablist" aria-label="Profile content">
        {visibleTabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              className={"profile-tab" + (tab === t.value ? " profile-tab--on" : "")}
              onClick={() => setTab(t.value)}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="profile-panel" role="tabpanel">
        {tab === "posts" && <UserPosts userId={user.id} isOwner={isOwnProfile} />}
        {tab === "comments" && <UserComments userId={user.id} />}
        {tab === "projects" && <UserProducts userId={user.id} isOwner={isOwnProfile} />}
        {tab === "saved" && isOwnProfile && <UserSaved userId={user.id} />}
      </div>
    </div>
  );
}
