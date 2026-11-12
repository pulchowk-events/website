"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { MarkdownEditor } from "./MarkdownEditor";
import { readDraft, clearDraft, useDraftAutosave } from "./useDraft";
import SignInModal from "@/app/components/signIn/SignInModal";
import { PostCategory, categoryDisplayMap, categoryIcons } from "@/types/posts";

interface Props {
  userId?: string;
}

export function LoungeComposer({ userId }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [expanded, setExpanded] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("discussions");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    if (sp.get("showAddPost") === "true") setExpanded(true);
  }, [sp]);

  useEffect(() => {
    if (!expanded || !userId) return;
    const d = readDraft(userId);
    if (d && (d.title || d.content)) {
      setTitle(d.title);
      setContent(d.content);
      setCategory((d.category as PostCategory) || "discussions");
      setRedirectUrl(d.redirect_url);
      setDraftRestored(true);
    }
  }, [expanded, userId]);

  useDraftAutosave(
    userId,
    { title, category, content, redirect_url: redirectUrl },
    expanded && (title.length > 0 || content.length > 0),
  );

  const collapse = () => {
    setExpanded(false);
    setMode("write");
    if (sp.get("showAddPost") === "true") {
      const next = new URLSearchParams(sp.toString());
      next.delete("showAddPost");
      router.replace(pathname + (next.toString() ? "?" + next.toString() : ""));
    }
  };

  const expand = () => {
    if (!session?.user?.id) {
      setSignInOpen(true);
      return;
    }
    setExpanded(true);
  };

  const submit = async () => {
    if (!userId) return;
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Post body is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/lounge/posts/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          redirect_url: redirectUrl.trim() || null,
          show_embed_image: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to post");
      }

      toast.success("Post created");
      clearDraft(userId);
      setTitle("");
      setContent("");
      setCategory("discussions");
      setRedirectUrl("");
      setExpanded(false);
      setMode("write");
      setDraftRestored(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape" && !submitting) {
      collapse();
    }
  };

  const discardDraft = () => {
    if (!userId) return;
    clearDraft(userId);
    setDraftRestored(false);
  };

  if (!expanded) {
    return (
      <>
        <button type="button" className="composer-stub" onClick={expand}>
          {session ? "Start a post…" : "Sign in to post"}
        </button>
        <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
      </>
    );
  }

  return (
    <>
      <form
        className="composer"
        onKeyDown={onKey}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {draftRestored && (
          <div className="composer__draft">
            <span>Restored from draft.</span>
            <button type="button" onClick={discardDraft}>Discard</button>
          </div>
        )}

        <div className="composer__head">
          <input
            type="text"
            className="composer__title-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 120))}
            maxLength={120}
            autoFocus
          />
          <button
            type="button"
            className="row-icon-btn"
            onClick={collapse}
            aria-label="Close composer"
            disabled={submitting}
          >
            <X size={16} />
          </button>
        </div>

        <div className="composer__cats">
          {(Object.entries(categoryDisplayMap) as [PostCategory, string][]).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={"chip" + (category === value ? " chip--on" : "")}
              onClick={() => setCategory(value)}
            >
              {categoryIcons[value]} {label}
            </button>
          ))}
        </div>

        <MarkdownEditor
          value={content}
          onChange={setContent}
          mode={mode}
          onModeChange={setMode}
          maxLength={10000}
        />

        <input
          type="url"
          className="composer__url"
          placeholder="Reference link (optional)"
          value={redirectUrl}
          onChange={(e) => setRedirectUrl(e.target.value)}
        />

        <div className="composer__foot">
          <span className="composer__hint">⌘ Enter to post · Esc to close</span>
          <div className="composer__foot-actions">
            <button type="button" className="btn btn--secondary btn--sm" onClick={collapse} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary btn--sm"
              disabled={submitting || !title.trim() || !content.trim()}
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </form>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
