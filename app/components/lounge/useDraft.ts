"use client";

import { useEffect } from "react";

export interface DraftShape {
  title: string;
  category: string;
  content: string;
  redirect_url: string;
}

const KEY = (userId: string) => "lounge-draft-" + userId;

export function useDraftAutosave(
  userId: string | undefined,
  data: DraftShape,
  enabled: boolean,
) {
  const { title, category, content, redirect_url } = data;
  useEffect(() => {
    if (!userId || !enabled) return;
    const id = setTimeout(() => {
      try {
        localStorage.setItem(
          KEY(userId),
          JSON.stringify({ title, category, content, redirect_url }),
        );
      } catch {}
    }, 2000);
    return () => clearTimeout(id);
  }, [userId, enabled, title, category, content, redirect_url]);
}

export function readDraft(userId: string | undefined): DraftShape | null {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(KEY(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed.title && !parsed.content) return null;
    return {
      title: parsed.title || "",
      category: parsed.category || "discussions",
      content: parsed.content || "",
      redirect_url: parsed.redirect_url || "",
    };
  } catch {
    return null;
  }
}

export function clearDraft(userId: string | undefined) {
  if (!userId) return;
  try {
    localStorage.removeItem(KEY(userId));
  } catch {}
}
