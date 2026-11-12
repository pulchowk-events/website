import { formatDateShort, daysUntilNPT } from "@/app/lib/formatDate";

type Status = "parsed" | "estimated-year-only" | "rolling" | "unknown";

interface Props {
  status: Status;
  display: string | null;
  parsed: string | null;
}

export function DeadlinePill({ status, display, parsed }: Props) {
  if (status === "unknown") return null;

  if (status === "rolling") {
    return <span className="sch-pill sch-pill--rolling">Rolling</span>;
  }

  if (status === "estimated-year-only") {
    return <span className="sch-pill sch-pill--year">{display ? "For Year: " + display : "Year TBD"}</span>;
  }

  if (!parsed) {
    return display ? <span className="sch-pill sch-pill--mute">{display}</span> : null;
  }

  const days = daysUntilNPT(parsed);
  if (days < 0) return <span className="sch-pill sch-pill--mute">Closed</span>;
  if (days === 0) return <span className="sch-pill sch-pill--urgent">Closes today</span>;
  if (days < 14) return <span className="sch-pill sch-pill--urgent">Closes in {days} days</span>;
  if (days <= 60) return <span className="sch-pill sch-pill--warn">Closes {formatDateShort(parsed)}</span>;
  return <span className="sch-pill sch-pill--mute">Closes {formatDateShort(parsed)}</span>;
}
