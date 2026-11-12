"use client";

import { useRef } from "react";
import {
  Bold, Italic, Strikethrough, Code, Link2,
  List, ListOrdered, Quote,
} from "lucide-react";
import Markdown from "@/app/components/ui/Markdown";

interface Props {
  value: string;
  onChange: (v: string) => void;
  mode: "write" | "preview";
  onModeChange: (m: "write" | "preview") => void;
  maxLength?: number;
  minHeight?: number;
  placeholder?: string;
  hideTabs?: boolean;
}

const TOOLBAR = [
  { key: "bold", icon: Bold, prefix: "**", suffix: "**", label: "Bold (Ctrl+B)" },
  { key: "italic", icon: Italic, prefix: "_", suffix: "_", label: "Italic (Ctrl+I)" },
  { key: "strike", icon: Strikethrough, prefix: "~~", suffix: "~~", label: "Strikethrough" },
  { key: "code", icon: Code, prefix: "`", suffix: "`", label: "Code" },
];

export function MarkdownEditor({
  value, onChange, mode, onModeChange,
  maxLength = 10000, minHeight = 100, placeholder = "Write your post…",
  hideTabs = false,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const wrap = (prefix: string, suffix: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end) || "text";
    const next = value.slice(0, start) + prefix + sel + suffix + value.slice(end);
    onChange(next.slice(0, maxLength));
    requestAnimationFrame(() => {
      ta.selectionStart = start + prefix.length;
      ta.selectionEnd = start + prefix.length + sel.length;
      ta.focus();
    });
  };

  const prefixLine = (marker: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = value.lastIndexOf("\n", ta.selectionStart - 1) + 1;
    const next = value.slice(0, start) + marker + value.slice(start);
    onChange(next.slice(0, maxLength));
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = ta.selectionStart + marker.length;
      ta.focus();
    });
  };

  const insertLink = () => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end) || "link text";
    const next = value.slice(0, start) + "[" + sel + "](url)" + value.slice(end);
    onChange(next.slice(0, maxLength));
    requestAnimationFrame(() => {
      ta.selectionStart = start + sel.length + 3;
      ta.selectionEnd = start + sel.length + 6;
      ta.focus();
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "b") {
      e.preventDefault();
      wrap("**", "**");
    } else if ((e.metaKey || e.ctrlKey) && e.key === "i") {
      e.preventDefault();
      wrap("_", "_");
    } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      insertLink();
    }
  };

  return (
    <div className="md-edit">
      <div className="md-edit__bar">
        <div className="md-edit__tools">
          {TOOLBAR.map(({ key, icon: Icon, prefix, suffix, label }) => (
            <button
              key={key}
              type="button"
              className="md-edit__tool"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrap(prefix, suffix)}
              aria-label={label}
              title={label}
            >
              <Icon size={14} />
            </button>
          ))}
          <button
            type="button"
            className="md-edit__tool"
            onMouseDown={(e) => e.preventDefault()}
            onClick={insertLink}
            aria-label="Link"
            title="Link (Ctrl+K)"
          >
            <Link2 size={14} />
          </button>
          <span className="md-edit__sep" aria-hidden="true" />
          <button type="button" className="md-edit__tool" onMouseDown={(e) => e.preventDefault()} onClick={() => prefixLine("- ")} aria-label="Bullet list" title="Bullet list">
            <List size={14} />
          </button>
          <button type="button" className="md-edit__tool" onMouseDown={(e) => e.preventDefault()} onClick={() => prefixLine("1. ")} aria-label="Numbered list" title="Numbered list">
            <ListOrdered size={14} />
          </button>
          <button type="button" className="md-edit__tool" onMouseDown={(e) => e.preventDefault()} onClick={() => prefixLine("> ")} aria-label="Quote" title="Quote">
            <Quote size={14} />
          </button>
        </div>

        {!hideTabs && (
          <div className="md-edit__tabs">
            <button type="button" className={"md-edit__tab" + (mode === "write" ? " md-edit__tab--on" : "")} onClick={() => onModeChange("write")}>
              Write
            </button>
            <button type="button" className={"md-edit__tab" + (mode === "preview" ? " md-edit__tab--on" : "")} onClick={() => onModeChange("preview")}>
              Preview
            </button>
          </div>
        )}
      </div>

      {mode === "write" ? (
        <textarea
          ref={ref}
          className="md-edit__area"
          style={{ minHeight }}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          rows={6}
          maxLength={maxLength}
        />
      ) : (
        <div className="md-edit__preview" style={{ minHeight }}>
          {value.trim() ? (
            <Markdown content={value} />
          ) : (
            <p className="md-edit__empty">Nothing to preview.</p>
          )}
        </div>
      )}

      <div className="md-edit__foot">
        <span className="md-edit__count">
          {value.length.toLocaleString("en-US")} / {maxLength.toLocaleString("en-US")}
        </span>
      </div>
    </div>
  );
}
