"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { MarkdownEditor } from "@/app/components/ui/MarkdownEditor";
import { ImageDropZone } from "@/app/components/ui/ImageDropZone";
import { ProductPreview } from "./ProductPreview";
import SignInModal from "@/app/components/signIn/SignInModal";

interface Props {
  userId?: string;
  productId?: number;
  initialValues?: {
    name: string;
    description: string;
    url: string;
    image_url: string | null;
    redirect_url: string | null;
    created_at: string;
    maker_name?: string | null;
  };
  onSaved?: () => void;
  onCancel?: () => void;
  fullPage?: boolean;
}

export function ProductComposer({ userId, productId, initialValues, onSaved, onCancel, fullPage }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const isEdit = productId !== undefined;
  const [expanded, setExpanded] = useState(isEdit || !!fullPage);
  const [signInOpen, setSignInOpen] = useState(false);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(initialValues?.name || "");
  const [description, setDescription] = useState(initialValues?.description || "");
  const [url, setUrl] = useState(initialValues?.url || "");
  const [redirectUrl, setRedirectUrl] = useState(initialValues?.redirect_url || "");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    if (!image) { setImagePreview(null); return; }
    const u = URL.createObjectURL(image);
    setImagePreview(u);
    return () => URL.revokeObjectURL(u);
  }, [image]);

  const validateUrl = (v: string) => (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v) ? "" : "Slug must use lowercase letters and hyphens only.");
  const validateRedirect = (v: string) => {
    if (!v) return "";
    try { new URL(v); return ""; } catch { return "Enter a valid URL (including http:// or https://)"; }
  };

  const collapse = () => {
    if (onCancel) { onCancel(); return; }
    if (fullPage) { router.push("/product-hunt"); return; }
    setExpanded(false);
    setMode("write");
  };

  const expand = () => {
    if (!session?.user?.id) { setSignInOpen(true); return; }
    setExpanded(true);
  };

  const submit = async () => {
    if (!userId) return;
    if (!name.trim()) { toast.error("Project name is required"); return; }
    if (!description.trim()) { toast.error("Description is required"); return; }
    const urlErr = validateUrl(url);
    if (urlErr) { setUrlError(urlErr); return; }
    const redirectErr = validateRedirect(redirectUrl);
    if (redirectErr) { toast.error(redirectErr); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("description", description.trim());
      fd.append("url", url.trim());
      fd.append("redirect_url", redirectUrl.trim());
      if (image) fd.append("image", image);

      const fetchUrl = isEdit ? "/api/products/" + productId : "/api/products/submit";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(fetchUrl, { method, body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save project");

      if (isEdit) toast.success("Project updated");
      else toast.success(data.message || "Project submitted for review");

      // Clear local file so subsequent edits start fresh
      setImage(null);
      if (onSaved) onSaved();
      else if (isEdit) router.refresh();
      else if (fullPage) router.push("/product-hunt");
      else {
        setName(""); setDescription(""); setUrl(""); setRedirectUrl(""); setImage(null); setUrlError("");
        setExpanded(false); setMode("write");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); submit(); }
    if (e.key === "Escape" && !submitting) collapse();
  };

  if (!expanded) {
    return (
      <>
        <button type="button" className="composer-stub" onClick={expand}>
          {session ? "Submit a project…" : "Sign in to submit a project"}
        </button>
        <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
      </>
    );
  }

  const canSubmit = name.trim() && description.trim() && url.trim() && !submitting;

  return (
    <>
      <form className="composer" onKeyDown={onKey} onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className="composer__head">
          <div className="seg">
            <button type="button" className={"seg__item" + (mode === "write" ? " seg__item--on" : "")} onClick={() => setMode("write")}>Write</button>
            <button type="button" className={"seg__item" + (mode === "preview" ? " seg__item--on" : "")} onClick={() => setMode("preview")}>Preview</button>
          </div>
          <button type="button" className="row-icon-btn" onClick={collapse} aria-label={isEdit ? "Cancel edit" : "Close"} disabled={submitting} style={{ marginLeft: "auto" }}>
            <X size={16} />
          </button>
        </div>

        {mode === "write" ? (
          <>
            <div className="field">
              <label htmlFor="pc-name" className="field__label">Name <span className="field__label-req">*</span></label>
              <input id="pc-name" type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your project name" required disabled={submitting} autoFocus={!isEdit} />
            </div>

            <div className="field">
              <span className="field__label">Description <span className="field__label-req">*</span></span>
              <MarkdownEditor value={description} onChange={setDescription} mode="write" onModeChange={() => {}} hideTabs maxLength={4000} minHeight={120} placeholder="What does it do, and who is it for? Markdown supported." />
            </div>

            <div className="field">
              <label htmlFor="pc-url" className="field__label">URL slug <span className="field__label-req">*</span></label>
              <input id="pc-url" type="text" className="input" value={url} onChange={(e) => { setUrl(e.target.value); if (urlError) setUrlError(""); }} placeholder="my-project-name" required disabled={submitting} aria-invalid={!!urlError} />
              {urlError ? (
                <p className="field__error">{urlError}</p>
              ) : (
                <div className="slug-bar">
                  <span className="slug-bar__prefix">pulchowkevents.com/product-hunt/</span>
                  <span className="slug-bar__value">{url || "your-slug"}</span>
                </div>
              )}
            </div>

            <div className="field">
              <label htmlFor="pc-redirect" className="field__label">Live URL <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></label>
              <input id="pc-redirect" type="url" className="input" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://your-project.com" disabled={submitting} />
            </div>

            <div className="field">
              <label htmlFor="pc-image" className="field__label">Image <span style={{ color: "var(--text-3)", fontWeight: 400 }}>(optional)</span></label>
              <ImageDropZone
                id="pc-image"
                file={image}
                existingUrl={initialValues?.image_url}
                onChange={setImage}
                disabled={submitting}
                maxBytes={90 * 1024}
              />
            </div>
          </>
        ) : (
          <ProductPreview
            name={name}
            description={description}
            imagePreviewUrl={imagePreview}
            imageUrl={initialValues?.image_url}
            createdAt={initialValues?.created_at}
            makerName={initialValues?.maker_name}
          />
        )}

        <div className="composer__foot">
          <span className="composer__hint">⌘ Enter to save · Esc to cancel</span>
          <div className="composer__foot-actions">
            <button type="button" className="btn btn--secondary btn--sm" onClick={collapse} disabled={submitting}>Cancel</button>
            <button type="submit" className="btn btn--primary btn--sm" disabled={!canSubmit}>
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Submit project"}
            </button>
          </div>
        </div>
      </form>
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
