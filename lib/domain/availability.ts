/**
 * REQ: OFP-BACK-001, OFP-BACK-002, OFP-BACK-003, OFP-DATA-001,
 *      OFP-DATA-002, OFP-DATA-003
 *
 * Verfügbarkeitslogik auf Basis von Absences und WorkSchedule.
 */
import type { Absence, Employee, WorkSchedule } from "@/generated/prisma/client";

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

export interface HalfDayAvailability {
  slot: "MORNING" | "AFTERNOON";
  status: AvailabilityStatus;
  reason: string | null;
}

export interface EmployeeDayAvailability {
  employeeId: number;
  morning: HalfDayAvailability;
  afternoon: HalfDayAvailability;
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

export function getEmployeeHalfDayAvailabilityForDate(
  date: Date,
  employees: EmployeeWithRelations[]
): EmployeeDayAvailability[] {
  const targetDate = startOfDay(date);

  return employees.map((emp) => {
    const base: EmployeeDayAvailability = {
      employeeId: emp.id,
      morning: {
        slot: "MORNING",
        status: "AVAILABLE",
        reason: null
      },
      afternoon: {
        slot: "AFTERNOON",
        status: "AVAILABLE",
        reason: null
      }
    };

    // 1) Absence-Check (OFP-BACK-001): gilt für beide Halbtage
    const absence = emp.absences.find((a) =>
      isWithinRange(targetDate, a.startDate, a.endDate)
    );

    if (absence) {
      return {
        ...base,
        morning: {
          ...base.morning,
          status: "UNAVAILABLE",
          reason: absence.reason
        },
        afternoon: {
          ...base.afternoon,
          status: "UNAVAILABLE",
          reason: absence.reason
        }
      };
    }

    const schedule = emp.workSchedule;
    if (!schedule) {
      // Kein Wochenplan hinterlegt → beide Halbtage verfügbar
      return base;
    }

    const weekday = targetDate.getDay(); // 0=So,1=Mo,...6=Sa
    const {
      morningFlag,
      afternoonFlag,
      note
    } = getHalfDayFlagsAndNote(schedule, weekday);

    const morningUnavailable = !morningFlag;
    const afternoonUnavailable = !afternoonFlag;

    const reason = note ?? null;

    return {
      employeeId: emp.id,
      morning: {
        slot: "MORNING",
        status: morningUnavailable ? "UNAVAILABLE" : "AVAILABLE",
        reason: morningUnavailable ? reason : null
      },
      afternoon: {
        slot: "AFTERNOON",
        status: afternoonUnavailable ? "UNAVAILABLE" : "AVAILABLE",
        reason: afternoonUnavailable ? reason : null
      }
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
  // Mitarbeiter arbeitet, wenn Vormittag ODER Nachmittag aktiv ist
  switch (weekday) {
    case 1:
      return {
        flag: schedule.mondayMorning || schedule.mondayAfternoon,
        note: schedule.mondayNote
      };
    case 2:
      return {
        flag: schedule.tuesdayMorning || schedule.tuesdayAfternoon,
        note: schedule.tuesdayNote
      };
    case 3:
      return {
        flag: schedule.wednesdayMorning || schedule.wednesdayAfternoon,
        note: schedule.wednesdayNote
      };
    case 4:
      return {
        flag: schedule.thursdayMorning || schedule.thursdayAfternoon,
        note: schedule.thursdayNote
      };
    case 5:
      return {
        flag: schedule.fridayMorning || schedule.fridayAfternoon,
        note: schedule.fridayNote
      };
    default:
      // Wochenende: standardmässig nicht verfügbar
      return { flag: false, note: "Wochenende" };
  }
}

function getHalfDayFlagsAndNote(
  schedule: WorkSchedule,
  weekday: number
): {
  morningFlag: boolean;
  afternoonFlag: boolean;
  note?: string | null;
} {
  switch (weekday) {
    case 1:
      return {
        morningFlag: schedule.mondayMorning,
        afternoonFlag: schedule.mondayAfternoon,
        note: schedule.mondayNote
      };
    case 2:
      return {
        morningFlag: schedule.tuesdayMorning,
        afternoonFlag: schedule.tuesdayAfternoon,
        note: schedule.tuesdayNote
      };
    case 3:
      return {
        morningFlag: schedule.wednesdayMorning,
        afternoonFlag: schedule.wednesdayAfternoon,
        note: schedule.wednesdayNote
      };
    case 4:
      return {
        morningFlag: schedule.thursdayMorning,
        afternoonFlag: schedule.thursdayAfternoon,
        note: schedule.thursdayNote
      };
    case 5:
      return {
        morningFlag: schedule.fridayMorning,
        afternoonFlag: schedule.fridayAfternoon,
        note: schedule.fridayNote
      };
    default:
      return {
        morningFlag: false,
        afternoonFlag: false,
        note: "Wochenende"
      };
  }
}