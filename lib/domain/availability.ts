/**
 * REQ: OFP-BACK-001, OFP-BACK-002, OFP-BACK-003, OFP-DATA-001,
 *      OFP-DATA-002, OFP-DATA-003
 *
 * Verfügbarkeitslogik auf Basis von Absences und WorkSchedule.
 */
import type { Absence, Employee, WorkSchedule } from "@prisma/client";

export type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE";

export interface EmployeeWithRelations extends Employee {
  workSchedule: WorkSchedule | null;
  absences: Absence[];
}

export interface EmployeeAvailability {
  employeeId: number;
  status: AvailabilityStatus;
  reason: string | null;
}

export function getEmployeeAvailabilityForDate(
  date: Date,
  employees: EmployeeWithRelations[]
): EmployeeAvailability[] {
  const targetDate = startOfDay(date);

  return employees.map((emp) => {
    // 1) Absence-Check (OFP-BACK-001)
    const absence = emp.absences.find((a) =>
      isWithinRange(targetDate, a.startDate, a.endDate)
    );

    if (absence) {
      return {
        employeeId: emp.id,
        status: "UNAVAILABLE",
        reason: absence.reason
      };
    }

    const schedule = emp.workSchedule;
    if (!schedule) {
      return {
        employeeId: emp.id,
        status: "AVAILABLE",
        reason: null
      };
    }

    // 2) Weekly Schedule Check (OFP-BACK-002)
    const weekday = targetDate.getDay(); // 0=So,1=Mo,...6=Sa
    const { flag, note } = getScheduleFlagAndNote(schedule, weekday);

    if (!flag) {
      return {
        employeeId: emp.id,
        status: "UNAVAILABLE",
        reason: note ?? null
      };
    }

    // 3) Default Availability (OFP-BACK-003)
    return {
      employeeId: emp.id,
      status: "AVAILABLE",
      reason: null
    };
  });
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isWithinRange(date: Date, start: Date, end: Date): boolean {
  const d = startOfDay(date).getTime();
  const s = startOfDay(start).getTime();
  const e = startOfDay(end).getTime();
  return d >= s && d <= e;
}

function getScheduleFlagAndNote(
  schedule: WorkSchedule,
  weekday: number
): { flag: boolean; note?: string | null } {
  switch (weekday) {
    case 1:
      return { flag: schedule.monday, note: schedule.mondayNote };
    case 2:
      return { flag: schedule.tuesday, note: schedule.tuesdayNote };
    case 3:
      return { flag: schedule.wednesday, note: schedule.wednesdayNote };
    case 4:
      return { flag: schedule.thursday, note: schedule.thursdayNote };
    case 5:
      return { flag: schedule.friday, note: schedule.fridayNote };
    default:
      // Wochenende: standardmässig nicht verfügbar
      return { flag: false, note: "Wochenende" };
  }
}

