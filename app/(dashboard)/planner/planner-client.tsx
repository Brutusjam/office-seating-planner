/**
 * REQ: OFP-FUNC-001, OFP-DATA-004, OFP-DATA-005,
 *      OFP-DND-001, OFP-DND-002, OFP-DND-003
 *
 * Client-seitiger Planner:
 * - DndContext
 * - Zustand für Assignments pro (deskId, slot)
 * - Übergabe an DeskMap & EmployeeSidebar.
 */
"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import type { Employee, Desk, Assignment, Absence, WorkSchedule } from "@prisma/client";
import type { TimeSlot } from "@/lib/domain/types";
import type { EmployeeAvailability } from "@/lib/domain/availability";
import { DeskMap } from "./components/DeskMap";
import { EmployeeSidebar } from "./components/EmployeeSidebar";
import { assignEmployeeToDesk } from "./actions";

type EmployeeWithRelations = Employee & {
  workSchedule: WorkSchedule | null;
  absences: Absence[];
};

export interface PlannerClientProps {
  date: string; // YYYY-MM-DD
  slot: TimeSlot;
  employees: EmployeeWithRelations[];
  desks: Desk[];
  assignments: Assignment[];
  availability: EmployeeAvailability[];
}

type AssignmentState = Record<string, number | null>; // key: `${deskId}_${slot}`, value: employeeId

function makeKey(deskId: number, slot: TimeSlot): string {
  return `${deskId}_${slot}`;
}

export function PlannerClient(props: PlannerClientProps) {
  const { date, employees, desks, assignments, availability } = props;

  const initialState: AssignmentState = useMemo(() => {
    const state: AssignmentState = {};
    for (const desk of desks) {
      state[makeKey(desk.id, "MORNING")] = null;
      state[makeKey(desk.id, "AFTERNOON")] = null;
    }
    for (const a of assignments) {
      state[makeKey(a.deskId, a.slot as TimeSlot)] = a.employeeId;
    }
    return state;
  }, [desks, assignments]);

  const [assignmentState, setAssignmentState] = useState<AssignmentState>(
    initialState
  );

  const availabilityByEmployee = useMemo(() => {
    const map: Record<number, EmployeeAvailability> = {};
    for (const a of availability) {
      map[a.employeeId] = a;
    }
    return map;
  }, [availability]);

  function handleDragStart(_event: DragStartEvent) {
    // Platzhalter für spätere Effekte, z.B. Hervorheben möglicher Ziele.
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const employeeId = Number(active.id);
    const deskId = Number(over.data.current?.deskId);
    const slot = over.data.current?.slot as TimeSlot | undefined;
    if (!deskId || !slot) return;

    const dateObj = new Date(date);

    setAssignmentState((prev) => {
      const next: AssignmentState = { ...prev };
      // Entferne bestehenden Eintrag für (deskId, slot)
      next[makeKey(deskId, slot)] = employeeId;
      // Stelle sicher, dass derselbe Employee nicht im gleichen Slot an anderem Desk sitzt
      for (const [key, val] of Object.entries(next)) {
        if (val === employeeId && key !== makeKey(deskId, slot)) {
          next[key] = null;
        }
      }
      return next;
    });

    // Server Action für Persistenz (optimistic UI, OFP-DND-002, OFP-DND-003)
    await assignEmployeeToDesk({
      date: dateObj,
      deskId,
      employeeId,
      slot
    });
  }

  return (
    <div className="flex gap-4">
      <div className="w-64 shrink-0">
        <EmployeeSidebar
          employees={employees}
          availabilityByEmployee={availabilityByEmployee}
        />
      </div>
      <div className="flex-1">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <DeskMap
            desks={desks}
            employees={employees}
            availabilityByEmployee={availabilityByEmployee}
            assignmentState={assignmentState}
          />
        </DndContext>
      </div>
    </div>
  );
}

