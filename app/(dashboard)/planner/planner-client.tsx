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

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent
} from "@dnd-kit/core";
import type {
  Employee,
  Desk,
  Assignment,
  Absence,
  Preference,
  WorkSchedule
} from "@/generated/prisma/client";
import type { TimeSlot } from "@/lib/domain/types";
import type {
  EmployeeDayAvailability,
  HalfDayAvailability
} from "@/lib/domain/availability";
import { useRouter } from "next/navigation";
import { DeskMap } from "./components/DeskMap";
import { EmployeeSidebar } from "./components/EmployeeSidebar";
import { assignEmployeeToDesk } from "./actions";
import { applyPreferencesForDate } from "./actions";

type EmployeeWithRelations = Employee & {
  workSchedule: WorkSchedule | null;
  absences: Absence[];
  preferences: Preference[];
};

export interface PlannerClientProps {
  date: string; // YYYY-MM-DD
  slot: TimeSlot;
  employees: EmployeeWithRelations[];
  desks: Desk[];
  assignments: Assignment[];
  availability: EmployeeDayAvailability[];
}

type AssignmentState = Record<string, number | null>; // key: `${deskId}_${slot}`, value: employeeId

function makeKey(deskId: number, slot: TimeSlot): string {
  return `${deskId}_${slot}`;
}

export function PlannerClient(props: PlannerClientProps) {
  const { date, slot: currentSlot, employees, desks, assignments, availability } =
    props;
  const router = useRouter();
  const [isApplyingPreferences, startApplyingPreferences] = useTransition();

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

  // Wenn sich Desks oder Assignments (z.B. durch Tageswechsel) ändern,
  // lokalen Zustand mit den neuen Server-Daten synchronisieren.
  useEffect(() => {
    setAssignmentState(initialState);
  }, [initialState]);

  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [highlightFreeDesks, setHighlightFreeDesks] = useState(false);

  const availabilityByEmployee = useMemo(() => {
    const map: Record<number, EmployeeDayAvailability> = {};
    for (const a of availability) {
      map[a.employeeId] = a;
    }
    return map;
  }, [availability]);

  function handleApplyPreferences() {
    startApplyingPreferences(async () => {
      await applyPreferencesForDate(date);
      router.refresh();
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const employeeId = Number(active.id);
    const overData = over.data.current as
      | { deskId?: number; slot?: TimeSlot; header?: boolean }
      | undefined;

    const deskId = Number(overData?.deskId);
    const slot = overData?.slot as TimeSlot | undefined;
    const isHeader = overData?.header === true;

    if (!deskId) return;

    const dateObj = new Date(date);

    if (isHeader) {
      const slots: TimeSlot[] = ["MORNING", "AFTERNOON"];

      setAssignmentState((prev) => {
        const next: AssignmentState = { ...prev };

        for (const s of slots) {
          next[makeKey(deskId, s)] = employeeId;
          for (const [key, val] of Object.entries(next)) {
            if (val === employeeId && key !== makeKey(deskId, s)) {
              const keySlot = key.split("_")[1] as TimeSlot;
              if (keySlot === s) next[key] = null;
            }
          }
        }

        return next;
      });

      for (const s of slots) {
        // Server Action für Persistenz (optimistic UI, OFP-DND-002, OFP-DND-003)
        // Ganztags-Zuordnung: beide Slots (MORNING/AFTERNOON) am gleichen Desk.
        // eslint-disable-next-line no-await-in-loop
        await assignEmployeeToDesk({
          date: dateObj,
          deskId,
          employeeId,
          slot: s
        });
      }
      return;
    }

    if (!slot) return;

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
    <div className="flex gap-4 overflow-hidden">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="w-64 shrink-0">
          <EmployeeSidebar
            employees={showOnlyAvailable ? employees.filter((emp) => {
              const av = availabilityByEmployee[emp.id];
              if (!av) return true;
              const slotAvailability: HalfDayAvailability | null =
                currentSlot === "MORNING" ? av.morning : av.afternoon;
              return slotAvailability?.status !== "UNAVAILABLE";
            }) : employees}
            availabilityByEmployee={availabilityByEmployee}
            desks={desks}
            onApplyPreferences={handleApplyPreferences}
            applyingPreferences={isApplyingPreferences}
          />
        </div>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              />
              <span>Nur verfügbare Mitarbeitende</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                checked={highlightFreeDesks}
                onChange={(e) => setHighlightFreeDesks(e.target.checked)}
              />
              <span>Freie Pulte hervorheben</span>
            </label>
          </div>
          <div className="h-full w-full overflow-auto">
            <div className="inline-block origin-top-left">
              <DeskMap
                desks={desks}
                employees={employees}
                availabilityByEmployee={availabilityByEmployee}
                assignmentState={assignmentState}
                highlightFreeDesks={highlightFreeDesks}
              />
            </div>
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {activeId != null ? (() => {
            const emp = employees.find((e) => e.id === Number(activeId));
            const avDay = emp ? availabilityByEmployee[emp.id] : null;
            if (!emp) return null;
            const avForSlot: HalfDayAvailability | null = avDay
              ? currentSlot === "MORNING"
                ? avDay.morning
                : avDay.afternoon
              : null;
            const statusColor =
              avForSlot?.status === "AVAILABLE"
                ? "bg-emerald-400"
                : "bg-rose-300";
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
                    {avForSlot?.reason && (
                      <span className="text-[11px] text-stone-500">
                        {avForSlot.reason}
                      </span>
                    )}
                  </div>
                </div>
                {avForSlot && (
                  <span
                    className={`ml-2 h-2.5 w-2.5 rounded-full ${statusColor}`}
                    title={avForSlot.reason ?? undefined}
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

