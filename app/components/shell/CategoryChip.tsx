interface Props {
  category: string;
  size?: "sm" | "md";
}

const DOT_COLORS: Record<string, string> = {
  discussions: "var(--cat-discussions)",
  announcements: "var(--cat-announcements)",
  opportunities: "var(--cat-opportunities)",
  confessions: "var(--cat-confessions)",
  "tech-help": "var(--cat-tech-help)",
  showcases: "var(--cat-showcases)",
  software: "var(--cat-event-software)",
  hardware: "var(--cat-event-hardware)",
  gaming: "var(--cat-event-gaming)",
  music: "var(--cat-event-music)",
  sports: "var(--cat-event-sports)",
  extra: "var(--cat-event-extra)",
};

const LABELS: Record<string, string> = {
  discussions: "Discussions",
  announcements: "Announcements",
  opportunities: "Opportunities",
  confessions: "Confessions",
  "tech-help": "Tech help",
  showcases: "Showcases",
  software: "Software",
  hardware: "Hardware",
  gaming: "Gaming",
  music: "Music",
  sports: "Sports",
  extra: "Extra",
};

export function CategoryChip({ category, size = "sm" }: Props) {
  const key = category.toLowerCase().replace(/_/g, "-");
  const dot = DOT_COLORS[key] || "var(--text-3)";
  const label = LABELS[key] || category;
  return (
    <span className={"cat-chip cat-chip--" + size}>
      <span className="cat-chip__dot" style={{ background: dot }} aria-hidden="true" />
      {label}
    </span>
  );
}
