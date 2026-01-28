/**
 * REQ: OFP-UI-032, OFP-UI-033, OFP-DATA-002, OFP-DATA-003
 * Server Actions für WorkSchedule- und Absence-Verwaltung.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertWorkSchedule(formData: FormData) {
  const employeeId = Number(formData.get("employeeId"));
  if (!employeeId) return;

  const data = {
    monday: formData.get("monday") === "on",
    mondayNote: (formData.get("mondayNote") as string) || null,
    tuesday: formData.get("tuesday") === "on",
    tuesdayNote: (formData.get("tuesdayNote") as string) || null,
    wednesday: formData.get("wednesday") === "on",
    wednesdayNote: (formData.get("wednesdayNote") as string) || null,
    thursday: formData.get("thursday") === "on",
    thursdayNote: (formData.get("thursdayNote") as string) || null,
    friday: formData.get("friday") === "on",
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

