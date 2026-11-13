"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { resizeImageFile } from "@/app/lib/resizeImage";

interface Props {
  id?: string;
  file: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
  maxBytes?: number;
}

export function ImageDropZone({ id, file, existingUrl, onChange, disabled, accept = "image/*", maxBytes }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [resizing, setResizing] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const show = preview || existingUrl || null;

  const acceptFile = async (incoming: File | null | undefined) => {
    if (!incoming || !incoming.type.startsWith("image/")) return;
    setResizing(true);
    try {
      const resized = await resizeImageFile(incoming, { maxBytes });
      onChange(resized);
    } catch (err) {
      console.error("[ImageDropZone] resize failed:", err);
      // still pass the original through — server may accept it if size is OK
      onChange(incoming);
    } finally {
      setResizing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (disabled || resizing) return;
    acceptFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="idz">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="idz__input"
        onChange={(e) => acceptFile(e.target.files?.[0])}
        disabled={disabled}
      />
      {show ? (
        <div className="idz__preview">
          <img src={show} alt="Preview" className="idz__thumb" />
          <div className="idz__preview-body">
            <p className="idz__filename">
              {resizing ? (
                <><Loader2 size={11} className="idz__spin" /> Resizing…</>
              ) : (
                file ? file.name : "Current image"
              )}
            </p>
            <div className="idz__preview-actions">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => inputRef.current?.click()} disabled={disabled || resizing}>Replace</button>
              {file && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => onChange(null)} disabled={disabled || resizing}>Remove</button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={"idz__drop" + (drag ? " idz__drop--over" : "")}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          disabled={disabled}
        >
          {resizing ? <Loader2 size={20} className="idz__spin" /> : <UploadCloud size={20} />}
          <span className="idz__drop-title">{resizing ? "Resizing…" : "Drop an image here"}</span>
          <span className="idz__drop-hint">or click to browse &middot; PNG, JPG, WebP</span>
        </button>
      )}
    </div>
  );
}
