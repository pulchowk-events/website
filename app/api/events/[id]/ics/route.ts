import { NextResponse } from "next/server";
import { getEventById } from "@/app/lib/queries";

export const dynamic = "force-dynamic";

function icsDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeIcs(s: string): string {
  return s.replace(/[\\\\,;]/g, function(m) { return "\\\\" + m; }).replace(/\\n/g, "\\\\n");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const dtStart = icsDate(event.event_date);
  const dtEnd = icsDate(
    new Date(new Date(event.event_date).getTime() + 2 * 60 * 60 * 1000).toISOString(),
  );

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pulchowk Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + event.id + "@pulchowkevents",
    "DTSTAMP:" + icsDate(new Date().toISOString()),
    "DTSTART:" + dtStart,
    "DTEND:" + dtEnd,
    "SUMMARY:" + escapeIcs(event.title),
    "DESCRIPTION:" + escapeIcs((event.description || "").slice(0, 1000)),
    event.location ? "LOCATION:" + escapeIcs(event.location) : "",
    event.form_link ? "URL:" + escapeIcs(event.form_link) : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  const body = lines.join("\r\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": "attachment; filename=" + id + ".ics",
    },
  });
}
