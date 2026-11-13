"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  id?: string;
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (v: string) => void;
  disabled?: boolean;
}

interface Parts { y: number; m: number; d: number; h: number; min: number }

function pad(n: number): string { return n < 10 ? "0" + n : String(n); }

function parse(value: string): Parts | null {
  if (!value) return null;
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  return { y: +m[1], m: +m[2], d: +m[3], h: +m[4], min: +m[5] };
}

function nowParts(): Parts {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate(), h: n.getHours(), min: n.getMinutes() };
}

function fmt(value: string): string {
  const p = parse(value);
  if (!p) return "";
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d, p.h, p.min));
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC",
  }).format(dt);
}

function daysInMonth(y: number, m: number): number { return new Date(y, m, 0).getDate(); }
function firstWeekday(y: number, m: number): number { return new Date(y, m - 1, 1).getDay(); }

export function DatePicker({ id, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = parse(value) || nowParts();
  const [viewYear, setViewYear] = useState(initial.y);
  const [viewMonth, setViewMonth] = useState(initial.m);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const current = parse(value);
  const today = new Date();
  const isToday = (d: number) =>
    viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1 && d === today.getDate();
  const isSelected = (d: number) =>
    !!current && current.y === viewYear && current.m === viewMonth && current.d === d;

  const pickDay = (d: number) => {
    const h = current?.h ?? 12;
    const min = current?.min ?? 0;
    onChange(`${viewYear}-${pad(viewMonth)}-${pad(d)}T${pad(h)}:${pad(min)}`);
  };
  const setHour = (h: number) => {
    if (!current) return;
    onChange(`${current.y}-${pad(current.m)}-${pad(current.d)}T${pad(h)}:${pad(current.min)}`);
  };
  const setMinute = (m: number) => {
    if (!current) return;
    onChange(`${current.y}-${pad(current.m)}-${pad(current.d)}T${pad(current.h)}:${pad(m)}`);
  };

  const prevMonth = () => viewMonth === 1 ? (setViewMonth(12), setViewYear(viewYear - 1)) : setViewMonth(viewMonth - 1);
  const nextMonth = () => viewMonth === 12 ? (setViewMonth(1), setViewYear(viewYear + 1)) : setViewMonth(viewMonth + 1);

  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
    .format(new Date(Date.UTC(viewYear, viewMonth - 1, 1)));

  const dim = daysInMonth(viewYear, viewMonth);
  const first = firstWeekday(viewYear, viewMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let i = 1; i <= dim; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const hour = current?.h ?? 12;
  const minute = current?.min ?? 0;

  return (
    <div className="dp" ref={ref}>
      <div className="dp__field">
        <button
          type="button"
          id={id}
          className="dp__trigger"
          onClick={() => !disabled && setOpen((v) => !v)}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <CalendarIcon size={14} className="dp__icon" />
          <span className={value ? "" : "dp__placeholder"}>
            {value ? fmt(value) : "Pick date and time"}
          </span>
        </button>
        {value && !disabled && (
          <button type="button" className="dp__clear" aria-label="Clear" onClick={() => onChange("")}>
            <X size={12} />
          </button>
        )}
      </div>

      {open && (
        <>
          <div className="dp__scrim" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="dp__pop" role="dialog" aria-label="Pick date and time">
            <div className="dp__head">
              <button type="button" className="row-icon-btn" onClick={prevMonth} aria-label="Previous month"><ChevronLeft size={14} /></button>
              <span className="dp__month">{monthName}</span>
              <button type="button" className="row-icon-btn" onClick={nextMonth} aria-label="Next month"><ChevronRight size={14} /></button>
            </div>
            <div className="dp__weekdays">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <span key={d} className="dp__wd">{d}</span>)}
            </div>
            <div className="dp__grid">
              {cells.map((d, i) => d === null ? (
                <span key={i} className="dp__cell dp__cell--empty" />
              ) : (
                <button
                  key={i}
                  type="button"
                  className={"dp__cell" + (isToday(d) ? " dp__cell--today" : "") + (isSelected(d) ? " dp__cell--on" : "")}
                  onClick={() => pickDay(d)}
                >{d}</button>
              ))}
            </div>
            <div className="dp__time">
              <label className="dp__time-field">
                <span>Hour</span>
                <select value={hour} onChange={(e) => setHour(+e.target.value)} disabled={!current}>
                  {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{pad(i)}</option>)}
                </select>
              </label>
              <label className="dp__time-field">
                <span>Min</span>
                <select value={minute} onChange={(e) => setMinute(+e.target.value)} disabled={!current}>
                  {Array.from({ length: 60 }, (_, i) => <option key={i} value={i}>{pad(i)}</option>)}
                </select>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
