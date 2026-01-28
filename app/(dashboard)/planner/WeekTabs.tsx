/**
 * REQ: OFP-UI-020, OFP-UI-011
 * Wochentags-Tabs (Mo–Fr) mit Hervorhebung des aktiven Tages.
 */
import Link from "next/link";
import type { TimeSlot } from "@/lib/domain/types";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr"] as const;

/** Parst "yyyy-mm-dd" als lokales Datum (keine UTC-Verschiebung). */
function parseLocalDate(dateISO: string): Date {
  const [y, m, d] = dateISO.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=So,1=Mo,...6=Sa
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Formatiert Datum als "yyyy-mm-dd" in lokaler Zeit (nicht toISOString/UTC). */
function toLocalISO(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

const slotParam = (slot: TimeSlot) =>
  slot === "AFTERNOON" ? "AFTERNOON" : "MORNING";

export function WeekTabs(props: { dateISO: string; slot: TimeSlot }) {
  const { dateISO, slot } = props;
  const current = parseLocalDate(dateISO);
  const monday = startOfWeek(current);
  const prevMonday = new Date(monday);
  prevMonday.setDate(monday.getDate() - 7);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const prevMondayISO = toLocalISO(prevMonday);
  const nextMondayISO = toLocalISO(nextMonday);

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-stone-100 p-1 text-sm">
      <Link
        href={`/planner?date=${prevMondayISO}&slot=${slotParam(slot)}`}
        className="px-2 py-1 rounded-full text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
        aria-label="Vorherige Woche"
      >
        &#171;&#171;
      </Link>
      {WEEKDAY_LABELS.map((label, idx) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + idx);
        const iso = toLocalISO(d);
        const isActive = iso === dateISO;

        return (
          <Link
            key={label}
            href={`/planner?date=${iso}&slot=${slotParam(slot)}`}
            className={[
              "px-3 py-1 rounded-full transition-colors",
              isActive
                ? "bg-yellow-200 text-stone-800"
                : "text-stone-500 hover:text-stone-700"
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href={`/planner?date=${nextMondayISO}&slot=${slotParam(slot)}`}
        className="px-2 py-1 rounded-full text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-700"
        aria-label="Nächste Woche"
      >
        &#187;&#187;
      </Link>
    </div>
  );
}

