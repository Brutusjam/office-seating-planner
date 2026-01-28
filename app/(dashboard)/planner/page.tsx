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
import { getEmployeeAvailabilityForDate } from "@/lib/domain/availability";
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

function formatDDMM(d: Date): string {
  return [d.getDate(), d.getMonth() + 1]
    .map((n) => String(n).padStart(2, "0"))
    .join(".");
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
        absences: true
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

  const availability = getEmployeeAvailabilityForDate(date, employees);

  const dateISO = date.toISOString().slice(0, 10);
  const monday = startOfWeek(date);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-stone-800">
            Woche vom {formatDDMM(monday)} (Mo) bis {formatDDMM(friday)} (Fr)
          </h2>
          <p className="text-xs text-stone-500">
            {/* REQ: OFP-UI-020 */}
            Wähle den Wochentag, Slots werden pro Pult als Vormittag/Nachmittag dargestellt.
          </p>
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

