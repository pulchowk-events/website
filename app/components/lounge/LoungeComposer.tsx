"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { MarkdownEditor } from "@/app/components/ui/MarkdownEditor";
import { PostPreview } from "./PostPreview";
import { readDraft, clearDraft, useDraftAutosave } from "./useDraft";
import SignInModal from "@/app/components/signIn/SignInModal";
import { PostCategory, categoryDisplayMap, categoryIcons } from "@/types/posts";

interface Props {
  userId?: string;
  postId?: string;
  initialValues?: {
    title: string;
    content: string;
    category: PostCategory;
    redirect_url: string;
    created_at: string;
  };
  onSaved?: () => void;
  onCancel?: () => void;
  fullPage?: boolean;
}

export function LoungeComposer({ userId, postId, initialValues, onSaved, onCancel, fullPage }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const isEdit = !!postId;
  const [expanded, setExpanded] = useState(isEdit || !!fullPage);
  const [signInOpen, setSignInOpen] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  const [title, setTitle] = useState(initialValues?.title || "");
  const [content, setContent] = useState(initialValues?.content || "");
  const [category, setCategory] = useState<PostCategory>(initialValues?.category || "discussions");
  const [redirectUrl, setRedirectUrl] = useState(initialValues?.redirect_url || "");

  useEffect(() => {
    if (isEdit || !expanded || !userId) return;
    const d = readDraft(userId);
    if (d && (d.title || d.content)) {
      setTitle(d.title);
      setContent(d.content);
      setCategory((d.category as PostCategory) || "discussions");
      setRedirectUrl(d.redirect_url);
      setDraftRestored(true);
    }
  }, [expanded, userId, isEdit]);

  useDraftAutosave(
    userId,
    { title, category, content, redirect_url: redirectUrl },
    !isEdit && expanded && (title.length > 0 || content.length > 0),
  );

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCategory("discussions");
    setRedirectUrl("");
    setMode("write");
    setDraftRestored(false);
  };

  const collapse = () => {
    if (onCancel) { onCancel(); return; }
    setExpanded(false);
    setMode("write");
    if (fullPage) { router.push("/lounge"); return; }
    if (pathname === "/lounge") {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get("showAddPost") === "true") {
        sp.delete("showAddPost");
        router.replace("/lounge" + (sp.toString() ? "?" + sp.toString() : ""));
      }
    }
  };

  const expand = () => {
    if (!session?.user?.id) { setSignInOpen(true); return; }
    setExpanded(true);
  };

  const submit = async () => {
    if (!userId) return;
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!content.trim()) { toast.error("Post body is required"); return; }

    setSubmitting(true);
    try {
      const url = isEdit
        ? "/api/lounge/posts/" + postId
        : "/api/lounge/posts/submit";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
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
        throw new Error(data.error || "Failed to save post");
      }

      if (isEdit) {
        toast.success("Post updated");
      } else {
        toast.success("Post created");
        if (userId) clearDraft(userId);
        resetForm();
      }

      if (onSaved) onSaved();
      else if (isEdit) router.refresh();
      else if (fullPage) router.push("/lounge");
      else { setExpanded(false); setMode("write"); router.refresh(); }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save post");
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

  const canSubmit = title.trim() && content.trim() && !submitting;

  return (
    <>
      <form
        className="composer"
        onKeyDown={onKey}
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        {draftRestored && (
          <div className="composer__draft">
            <span>Restored from draft.</span>
            <button type="button" onClick={discardDraft}>Discard</button>
          </div>
        )}

        <div className="composer__head">
          <div className="seg">
            <button
              type="button"
              className={"seg__item" + (mode === "write" ? " seg__item--on" : "")}
              onClick={() => setMode("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={"seg__item" + (mode === "preview" ? " seg__item--on" : "")}
              onClick={() => setMode("preview")}
            >
              Preview
            </button>
          </div>
          <button
            type="button"
            className="row-icon-btn"
            onClick={collapse}
            aria-label={isEdit ? "Cancel edit" : "Close composer"}
            disabled={submitting}
            style={{ marginLeft: "auto" }}
          >
            <X size={16} />
          </button>
        </div>

        {mode === "write" ? (
          <>
            <input
              type="text"
              className="composer__title-input"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 120))}
              maxLength={120}
              autoFocus={!isEdit}
            />

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
              mode="write"
              onModeChange={() => {}}
              hideTabs
              maxLength={10000}
              minHeight={180}
              placeholder="Write your post… Markdown supported."
            />

            <input
              type="url"
              className="composer__url"
              placeholder="Reference link (optional)"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
            />
          </>
        ) : (
          <PostPreview
            title={title}
            content={content}
            category={category}
            redirectUrl={redirectUrl}
            createdAt={initialValues?.created_at}
          />
        )}

        <div className="composer__foot">
          <span className="composer__hint">⌘ Enter to save · Esc to cancel</span>
          <div className="composer__foot-actions">
            <button type="button" className="btn btn--secondary btn--sm" onClick={collapse} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary btn--sm"
              disabled={!canSubmit}
            >
              {submitting
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Post"}
            </button>
          </div>
        </div>
      </form>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
