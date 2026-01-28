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
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import type { Employee, Desk, Assignment, Absence, WorkSchedule } from "@/generated/prisma/client";
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

  const [activeId, setActiveId] = useState<string | number | null>(null);

  const availabilityByEmployee = useMemo(() => {
    const map: Record<number, EmployeeAvailability> = {};
    for (const a of availability) {
      map[a.employeeId] = a;
    }
    return map;
  }, [availability]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const employeeId = Number(active.id);
    const deskId = Number(over.data.current?.deskId);
    const slot = over.data.current?.slot as TimeSlot | undefined;
    if (!deskId || !slot) return;

    const dateObj = new Date(date);

    setAssignmentState((prev) => {
      const next: AssignmentState = { ...prev };
      next[makeKey(deskId, slot)] = employeeId;
      // Gleicher Mitarbeiter darf Vormittag und Nachmittag am selben Pult sitzen.
      // Nur denselben Slot auf anderen Pulten leeren.
      for (const [key, val] of Object.entries(next)) {
        if (val === employeeId && key !== makeKey(deskId, slot)) {
          const keySlot = key.split("_")[1];
          if (keySlot === slot) next[key] = null;
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
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="w-64 shrink-0">
          <EmployeeSidebar
            employees={employees}
            availabilityByEmployee={availabilityByEmployee}
          />
        </div>
        <div className="flex-1">
          <DeskMap
            desks={desks}
            employees={employees}
            availabilityByEmployee={availabilityByEmployee}
            assignmentState={assignmentState}
          />
        </div>
        <DragOverlay dropAnimation={null}>
          {activeId != null ? (() => {
            const emp = employees.find((e) => e.id === Number(activeId));
            const av = emp ? availabilityByEmployee[emp.id] : null;
            if (!emp) return null;
            const statusColor =
              av?.status === "AVAILABLE" ? "bg-emerald-400" : "bg-rose-300";
            return (
              <div
                className="flex cursor-grab items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-2 py-1 shadow-lg ring-2 ring-yellow-300"
                aria-hidden
              >
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                    style={{ backgroundColor: emp.avatarColor }}
                  >
                    {emp.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-stone-800">
                      {emp.name}
                    </span>
                    {av?.reason && (
                      <span className="text-[11px] text-stone-500">
                        {av.reason}
                      </span>
                    )}
                  </div>
                </div>
                {av && (
                  <span
                    className={`ml-2 h-2.5 w-2.5 rounded-full ${statusColor}`}
                    title={av.reason ?? undefined}
                  />
                )}
              </div>
            );
          })() : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

