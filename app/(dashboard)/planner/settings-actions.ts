/**
 * REQ: OFP-UI-032, OFP-UI-033, OFP-DATA-002, OFP-DATA-003
 * Server Actions für WorkSchedule-, Absence- und Präferenz-Verwaltung.
 */
"use server";

import { TimeSlot } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertWorkSchedule(formData: FormData) {
  const employeeId = Number(formData.get("employeeId"));
  if (!employeeId) return;

  const data = {
    mondayMorning: formData.get("mondayMorning") === "on",
    mondayAfternoon: formData.get("mondayAfternoon") === "on",
    mondayNote: (formData.get("mondayNote") as string) || null,
    tuesdayMorning: formData.get("tuesdayMorning") === "on",
    tuesdayAfternoon: formData.get("tuesdayAfternoon") === "on",
    tuesdayNote: (formData.get("tuesdayNote") as string) || null,
    wednesdayMorning: formData.get("wednesdayMorning") === "on",
    wednesdayAfternoon: formData.get("wednesdayAfternoon") === "on",
    wednesdayNote: (formData.get("wednesdayNote") as string) || null,
    thursdayMorning: formData.get("thursdayMorning") === "on",
    thursdayAfternoon: formData.get("thursdayAfternoon") === "on",
    thursdayNote: (formData.get("thursdayNote") as string) || null,
    fridayMorning: formData.get("fridayMorning") === "on",
    fridayAfternoon: formData.get("fridayAfternoon") === "on",
    fridayNote: (formData.get("fridayNote") as string) || null
  };

  await prisma.workSchedule.upsert({
    where: { employeeId },
    update: data,
    create: { employeeId, ...data }
  });

  revalidatePath("/planner");
}

export async function createAbsence(formData: FormData) {
  const employeeId = Number(formData.get("employeeId"));
  const start = formData.get("startDate") as string;
  const end = formData.get("endDate") as string;
  const reason = (formData.get("reason") as string) || "";

  if (!employeeId || !start || !end || !reason) return;

  await prisma.absence.create({
    data: {
      employeeId,
      startDate: new Date(start),
      endDate: new Date(end),
      reason
    }
  });

  revalidatePath("/planner");
}

export async function deleteAbsence(absenceId: number) {
  if (!absenceId) return;
  await prisma.absence.delete({ where: { id: absenceId } });
  revalidatePath("/planner");
}

/** Server Action für Form: liest absenceId aus FormData und ruft deleteAbsence auf. */
export async function deleteAbsenceForm(formData: FormData) {
  const absenceId = Number(formData.get("absenceId"));
  await deleteAbsence(absenceId);
}

/** Präferenzen (Desk pro Wochentag/Halbtag) für einen Mitarbeitenden speichern. */
export async function upsertPreferencesForEmployee(formData: FormData) {
  const employeeId = Number(formData.get("employeeId"));
  if (!employeeId) return;

  const weekdays = [1, 2, 3, 4, 5]; // Mo–Fr
  const slots: TimeSlot[] = [TimeSlot.MORNING, TimeSlot.AFTERNOON];

  const updates: { weekday: number; slot: TimeSlot; deskId: number | null }[] =
    [];

  for (const weekday of weekdays) {
    for (const slot of slots) {
      const fieldName = `pref_${weekday}_${slot}`;
      const raw = formData.get(fieldName) as string | null;
      if (raw == null) continue;

      const trimmed = raw.trim();
      if (trimmed === "") {
        // explizit "Keine Präferenz" gewählt → löschen
        updates.push({ weekday, slot, deskId: null });
        continue;
      }

      const deskId = Number(trimmed);
      if (!Number.isFinite(deskId) || deskId <= 0) continue;

      updates.push({ weekday, slot, deskId });
    }
  }

  if (updates.length === 0) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const { weekday, slot, deskId } of updates) {
      if (deskId == null) {
        await tx.preference.deleteMany({
          where: { employeeId, weekday, slot }
        });
      } else {
        await tx.preference.upsert({
          where: {
            employeeId_weekday_slot: { employeeId, weekday, slot }
          },
          update: { deskId },
          create: { employeeId, weekday, slot, deskId }
        });
      }
    }
  });

  revalidatePath("/planner");
}

