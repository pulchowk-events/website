import { ChevronDown } from "lucide-react";
import Markdown from "./Markdown";
import { parseDescription } from "@/app/lib/parseDescription";

interface Props {
  content: string | null | undefined;
  className?: string;
}

export default function StructuredDescription({ content, className = "" }: Props) {
  const sections = parseDescription(content);

  // No structure or too short — plain markdown, unchanged behavior
  if (!sections) {
    return (
      <div className={className}>
        <Markdown content={content || ""} />
      </div>
    );
  }

  // 2-3 sections: open with plain headers (no accordion chrome — reads faster)
  if (sections.length <= 3) {
    return (
      <div className={"sdesc " + className}>
        {sections.map((s, i) => (
          <section key={i} className="sdesc__section">
            {s.title && <h3 className="sdesc__title">{s.title}</h3>}
            {s.body && (
              <div className="sdesc__body">
                <Markdown content={s.body} />
              </div>
            )}
          </section>
        ))}
      </div>
    );
  }

  // 4+ sections: collapsible, first 2 open by default
  return (
    <div className={"sdesc sdesc--collapsible " + className}>
      {sections.map((s, i) => (
        <details key={i} className="sdesc__details" open={i < 2}>
          <summary className="sdesc__summary">
            <span className="sdesc__title">{s.title || "Details"}</span>
            <ChevronDown size={14} className="sdesc__chev" aria-hidden="true" />
          </summary>
          {s.body && (
            <div className="sdesc__body">
              <Markdown content={s.body} />
            </div>
          )}
        </details>
      ))}
    </div>
  );
}
