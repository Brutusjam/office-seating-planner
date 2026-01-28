/**
 * REQ: OFP-DND-002, OFP-DND-003, OFP-DATA-005
 * Server Actions für Slot-basierte Assignments.
 */
"use server";

import { prisma } from "@/lib/prisma";
import type { TimeSlot } from "@/lib/domain/types";
import { revalidatePath } from "next/cache";

interface AssignEmployeeToDeskInput {
  date: Date;
  deskId: number;
  employeeId: number;
  slot: TimeSlot;
}

export async function assignEmployeeToDesk(
  input: AssignEmployeeToDeskInput
): Promise<void> {
  const { date, deskId, employeeId, slot } = input;

  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Entferne bestehende Assignments für (date, slot, deskId) und (date, slot, employeeId)
  await prisma.assignment.deleteMany({
    where: {
      OR: [
        { date: day, slot, deskId },
        { date: day, slot, employeeId }
      ]
    }
  });

  await prisma.assignment.create({
    data: {
      date: day,
      slot,
      deskId,
      employeeId
    }
  });

  revalidatePath("/planner");
}

/** Präferenzen für einen bestimmten Tag (beide Halbtage) anwenden. */
export async function applyPreferencesForDate(dateISO: string): Promise<void> {
  if (!dateISO) return;

  const parsed = new Date(dateISO);
  if (Number.isNaN(parsed.getTime())) return;

  const day = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
  const weekday = day.getDay(); // 1=Mo,...,5=Fr

  if (weekday < 1 || weekday > 5) {
    // Wochenende: keine Präferenzen anwenden
    return;
  }

  const preferences = await prisma.preference.findMany({
    where: { weekday }
  });

  if (preferences.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const pref of preferences) {
      // Bestehende Zuordnungen für diesen Tag/Slot/Desk und Tag/Slot/Employee entfernen
      await tx.assignment.deleteMany({
        where: {
          date: day,
          slot: pref.slot,
          OR: [
            { deskId: pref.deskId },
            { employeeId: pref.employeeId }
          ]
        }
      });

      await tx.assignment.create({
        data: {
          date: day,
          slot: pref.slot,
          deskId: pref.deskId,
          employeeId: pref.employeeId
        }
      });
    }
  });

  revalidatePath("/planner");
}

