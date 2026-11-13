"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface Props {
  id?: string;
  file: File | null;
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
}

export function ImageDropZone({ id, file, existingUrl, onChange, disabled, accept = "image/*" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const show = preview || existingUrl || null;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onChange(f);
  };

  return (
    <div className="idz">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="idz__input"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        disabled={disabled}
      />
      {show ? (
        <div className="idz__preview">
          <img src={show} alt="Preview" className="idz__thumb" />
          <div className="idz__preview-body">
            <p className="idz__filename">{file ? file.name : "Current image"}</p>
            <div className="idz__preview-actions">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => inputRef.current?.click()} disabled={disabled}>Replace</button>
              {file && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => onChange(null)} disabled={disabled}>Remove</button>
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
          <UploadCloud size={20} />
          <span className="idz__drop-title">Drop an image here</span>
          <span className="idz__drop-hint">or click to browse &middot; PNG, JPG, WebP</span>
        </button>
      )}
    </div>
  );
}
