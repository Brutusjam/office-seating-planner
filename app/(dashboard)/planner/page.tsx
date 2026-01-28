/**
 * REQ: OFP-FUNC-001, OFP-DATA-001, OFP-DATA-002, OFP-DATA-003,
 *      OFP-DATA-004, OFP-DATA-005, OFP-BACK-001, OFP-BACK-002,
 *      OFP-BACK-003
 *
 * Server-Route für das Planner-Dashboard:
 * - lädt Employees mit WorkSchedule & Absences
 * - lädt Desks & Assignments für ausgewähltes Datum + Slot
 */
import { prisma } from "@/lib/prisma";
import { getEmployeeHalfDayAvailabilityForDate } from "@/lib/domain/availability";
import type { TimeSlot } from "@/lib/domain/types";
import { PlannerClient } from "./planner-client";
import { WeekTabs } from "./WeekTabs";

function parseDate(searchParams: URLSearchParams): Date {
  const raw = searchParams.get("date");
  if (!raw) return new Date();
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function parseSlot(searchParams: URLSearchParams): TimeSlot {
  const raw = searchParams.get("slot");
  if (raw === "AFTERNOON") return "AFTERNOON";
  return "MORNING";
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];

const WEEKDAY_NAMES = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag"
];

function formatLongDateLabel(d: Date, withYear: boolean): string {
  const weekday = WEEKDAY_NAMES[d.getDay()];
  const day = String(d.getDate()).padStart(2, "0");
  const month = MONTH_NAMES[d.getMonth()];
  const base = `${weekday}, ${day}. ${month}`;
  return withYear ? `${base} ${d.getFullYear()}` : base;
}

export default async function PlannerPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await (props.searchParams ?? Promise.resolve({}));
  const sp = new URLSearchParams(
    Object.entries(rawParams).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((vv) => [k, vv]) : [[k, v ?? ""]]
    )
  );

  const date = parseDate(sp);
  const slot = parseSlot(sp);

  const [employees, desks, assignments] = await Promise.all([
    prisma.employee.findMany({
      include: {
        workSchedule: true,
        absences: true,
        preferences: true
      }
    }),
    prisma.desk.findMany(),
    prisma.assignment.findMany({
      where: {
        date: {
          equals: new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          )
        }
      }
    })
  ]);

  const dateISO = date.toISOString().slice(0, 10);
  const monday = startOfWeek(date);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const availability = getEmployeeHalfDayAvailabilityForDate(date, employees);

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-stone-800">
              Woche vom {formatLongDateLabel(monday, false)} bis{" "}
              {formatLongDateLabel(friday, true)}
            </h2>
            <p className="text-xs text-stone-500">
              {/* REQ: OFP-UI-020 */}
              Wähle den Wochentag, Slots werden pro Pult als Vormittag/Nachmittag dargestellt.
            </p>
          </div>
          <div className="mt-1 inline-flex flex-wrap items-center gap-3 rounded-lg bg-stone-50 px-2.5 py-1.5 text-[11px] text-stone-600">
            <span className="font-medium text-stone-700">Legende:</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              verfügbar / im Büro
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
              abwesend / nicht im Büro
            </span>
          </div>
        </div>
        <WeekTabs dateISO={dateISO} slot={slot} />
      </div>
      <PlannerClient
        date={dateISO}
        slot={slot}
        employees={employees}
        desks={desks}
        assignments={assignments}
        availability={availability}
      />
    </div>
  );
}

