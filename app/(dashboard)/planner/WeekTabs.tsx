/**
 * REQ: OFP-UI-020, OFP-UI-011
 * Wochentags-Tabs (Mo–Fr) mit Hervorhebung des aktiven Tages.
 */
import Link from "next/link";
import type { TimeSlot } from "@/lib/domain/types";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr"] as const;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=So,1=Mo,...6=Sa
  const diff = (day === 0 ? -6 : 1 - day); // auf Montag zurück
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function WeekTabs(props: { dateISO: string; slot: TimeSlot }) {
  const { dateISO, slot } = props;
  const current = new Date(dateISO);
  const monday = startOfWeek(current);

  return (
    <div className="inline-flex rounded-full bg-stone-100 p-1 text-sm">
      {WEEKDAY_LABELS.map((label, idx) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + idx);
        const iso = d.toISOString().slice(0, 10);
        const isActive = iso === dateISO;

        return (
          <Link
            key={label}
            href={`/planner?date=${iso}&slot=${slot === "AFTERNOON" ? "AFTERNOON" : "MORNING"}`}
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
    </div>
  );
}

