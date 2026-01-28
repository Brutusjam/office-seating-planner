/**
 * REQ: OFP-FUNC-001, OFP-TECH-004, OFP-TECH-005, OFP-TECH-006
 * Startseite: schreibgeschützte Tagesübersicht mit Desk-Ansicht.
 */
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getEmployeeHalfDayAvailabilityForDate } from "@/lib/domain/availability";

function parseDate(searchParams: URLSearchParams): Date {
  const raw = searchParams.get("date");
  if (!raw) return new Date();
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatWeekdayAndDate(d: Date): string {
  const weekdays = [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag"
  ];
  const weekday = weekdays[d.getDay()];
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${weekday}, ${day}.${month}.${year}`;
}

function addDays(date: Date, diff: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default async function HomePage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await (props.searchParams ?? Promise.resolve({}));
  const sp = new URLSearchParams(
    Object.entries(rawParams).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((vv) => [k, vv]) : [[k, v ?? ""]]
    )
  );

  const date = parseDate(sp);

  const prevDateISO = addDays(date, -1);
  const nextDateISO = addDays(date, 1);

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

  const availability = getEmployeeHalfDayAvailabilityForDate(date, employees);
  const availabilityByEmployee: Record<number, (typeof availability)[number]> =
    {};
  for (const a of availability) {
    availabilityByEmployee[a.employeeId] = a;
  }
  const employeesById: Record<number, (typeof employees)[number]> = {};
  for (const e of employees) {
    employeesById[e.id] = e;
  }

  const assignmentState: Record<string, number | null> = {};
  for (const desk of desks) {
    assignmentState[`${desk.id}_MORNING`] = null;
    assignmentState[`${desk.id}_AFTERNOON`] = null;
  }
  for (const a of assignments) {
    assignmentState[`${a.deskId}_${a.slot}`] = a.employeeId;
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-800">
            {formatWeekdayAndDate(date)}
          </h2>
          <p className="text-xs text-stone-500">
            Sitzplan – Vormittag &amp; Nachmittag (nur Ansicht, keine Änderungen).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/?date=${prevDateISO}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-base font-semibold text-stone-700 hover:bg-stone-50"
          >
            «
          </Link>
          <span className="text-sm text-stone-500">Tag wechseln</span>
          <Link
            href={`/?date=${nextDateISO}`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-base font-semibold text-stone-700 hover:bg-stone-50"
          >
            »
          </Link>
        </div>
      </div>

      <div className="aspect-[3/2] min-h-[520px] w-full rounded-xl border border-stone-200 bg-slate-50 p-4 shadow-sm">
        <div
          className="grid h-full w-full gap-1 rounded-lg bg-white/80"
          style={{
            gridTemplateColumns: "repeat(24, minmax(0, 1fr))",
            gridTemplateRows: "repeat(18, minmax(0, 1fr))",
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
            backgroundSize: "18px 18px"
          }}
        >
          {desks.map((desk) => {
            const morningKey = `${desk.id}_MORNING`;
            const afternoonKey = `${desk.id}_AFTERNOON`;
            const morningEmployeeId = assignmentState[morningKey];
            const afternoonEmployeeId = assignmentState[afternoonKey];
            const morningEmployee =
              morningEmployeeId != null
                ? employeesById[morningEmployeeId] ?? null
                : null;
            const afternoonEmployee =
              afternoonEmployeeId != null
                ? employeesById[afternoonEmployeeId] ?? null
                : null;
            const morningAvailability = morningEmployee
              ? availabilityByEmployee[morningEmployee.id]?.morning ?? null
              : null;
            const afternoonAvailability = afternoonEmployee
              ? availabilityByEmployee[afternoonEmployee.id]?.afternoon ?? null
              : null;

            return (
              <div
                key={desk.id}
                className="relative"
                style={{
                  gridColumn: `${desk.gridX} / span ${desk.gridW}`,
                  gridRow: `${desk.gridY} / span ${desk.gridH}`
                }}
              >
                <div className="flex h-full min-h-[80px] flex-col rounded-2xl">
                  <div className="flex flex-1 flex-col gap-1">
                    <div
                      className="flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-2 py-1.5 text-xs font-medium text-stone-700"
                      style={desk.titleColor ? { backgroundColor: desk.titleColor } : {}}
                    >
                      <div className="h-5 w-0.5 rounded-full bg-stone-400" />
                      <span className="truncate">{desk.label}</span>
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex flex-1 items-center justify-between rounded-2xl border border-stone-300 bg-stone-50 px-2.5 py-1.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-medium text-stone-600">
                            Vormittag
                          </span>
                          {morningEmployee ? (
                            <span className="text-xs text-stone-800">
                              {morningEmployee.name}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400">Leer</span>
                          )}
                        </div>
                        {morningEmployee && morningAvailability && (
                          <div className="ml-2 flex flex-col items-end gap-0.5">
                            <span
                              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                morningAvailability.status === "AVAILABLE"
                                  ? "bg-emerald-400"
                                  : "bg-rose-300"
                              }`}
                              title={morningAvailability.reason ?? undefined}
                            />
                            {morningAvailability.reason && (
                              <span className="max-w-[6rem] truncate text-[10px] text-stone-500">
                                {morningAvailability.reason}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 items-center justify-between rounded-2xl border border-stone-300 bg-stone-100 px-2.5 py-1.5 text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-medium text-stone-600">
                            Nachmittag
                          </span>
                          {afternoonEmployee ? (
                            <span className="text-xs text-stone-800">
                              {afternoonEmployee.name}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400">Leer</span>
                          )}
                        </div>
                        {afternoonEmployee && afternoonAvailability && (
                          <div className="ml-2 flex flex-col items-end gap-0.5">
                            <span
                              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                afternoonAvailability.status === "AVAILABLE"
                                  ? "bg-emerald-400"
                                  : "bg-rose-300"
                              }`}
                              title={afternoonAvailability.reason ?? undefined}
                            />
                            {afternoonAvailability.reason && (
                              <span className="max-w-[6rem] truncate text-[10px] text-stone-500">
                                {afternoonAvailability.reason}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 pt-1 text-center text-xs text-stone-500">
        <p>Änderungen am Sitzplan bitte im Planner-Dashboard vornehmen.</p>
        <Link
          href="/planner"
          className="inline-flex items-center rounded-full bg-yellow-300 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm hover:bg-yellow-400"
        >
          Zum Planner-Dashboard
        </Link>
      </div>
    </div>
  );
}

