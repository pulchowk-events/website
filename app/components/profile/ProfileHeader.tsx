"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit } from "lucide-react";
import { EditProfileDialog } from "./EditProfileDialog";

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

function joinedLabel(iso: string | null): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "Asia/Kathmandu" });
  } catch {
    return null;
  }
}

export function ProfileHeader({ user, stats, isOwnProfile }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const joined = joinedLabel(user.created_at);

  return (
    <>
      <header className="prof-head">
        <div className="prof-head__identity">
          <span className="prof-head__avatar">
            <Image
              src={user.image || "/default-avatar.png"}
              alt={user.name || "Profile"}
              width={64}
              height={64}
              className="prof-head__avatar-img"
            />
          </span>
          <div className="prof-head__text">
            <h1 className="prof-head__name">{user.name || "Anonymous"}</h1>
            {joined && <p className="prof-head__joined">Joined {joined}</p>}
            {user.bio && <p className="prof-head__bio">{user.bio}</p>}
          </div>
        </div>

        <div className="prof-head__side">
          <dl className="prof-head__stats">
            <div><dd>{stats.posts}</dd><dt>Posts</dt></div>
            <div><dd>{stats.comments}</dd><dt>Comments</dt></div>
            <div><dd>{stats.products}</dd><dt>Projects</dt></div>
          </dl>
          {isOwnProfile && (
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => setEditOpen(true)}
            >
              <Edit size={12} style={{ marginRight: 6 }} />
              Edit profile
            </button>
          )}
        </div>
      </header>

      <EditProfileDialog
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        initialName={user.name || ""}
        initialBio={user.bio}
      />
    </>
  );
}
