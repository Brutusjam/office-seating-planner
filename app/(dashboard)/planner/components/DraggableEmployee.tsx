/**
 * REQ: OFP-UI-021, OFP-UI-022, OFP-UI-023, OFP-UI-030
 * Darstellt einen Mitarbeitenden als (ggf.) draggable Tile mit Statusdot
 * und Gear-Icon für Einstellungen.
 */
"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type {
  Absence,
  Desk,
  Employee,
  Preference,
  WorkSchedule
} from "@/generated/prisma/client";
import type { EmployeeDayAvailability } from "@/lib/domain/availability";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { EmployeeSettingsDialog } from "./EmployeeSettingsDialog";

interface DraggableEmployeeProps {
  employee: Employee & {
    workSchedule?: WorkSchedule | null;
    absences?: Absence[];
    preferences?: Preference[];
  };
  availability: EmployeeDayAvailability | null;
  isMorningAssigned?: boolean;
  isAfternoonAssigned?: boolean;
  desks: Desk[];
}

export function DraggableEmployee(props: DraggableEmployeeProps) {
  const { employee, availability, isMorningAssigned, isAfternoonAssigned, desks } = props;

  const [open, setOpen] = useState(false);

  const isAvailable =
    !!availability &&
    (availability.morning.status === "AVAILABLE" ||
      availability.afternoon.status === "AVAILABLE");

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: employee.id,
      // Kein disabled - alle Mitarbeiter sind draggable (auch für Ausnahme-Zuweisungen)
      data: { isAvailable }
    });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0 : undefined }}
      className={[
        "flex items-center justify-between rounded-xl border px-2 py-1",
        "border-stone-200 bg-stone-50 cursor-grab",
        !isAvailable ? "opacity-60" : "",
        isDragging ? "ring-2 ring-yellow-300 shadow-lg" : ""
      ].join(" ")}
      title={!isAvailable ? "Ausnahme-Zuweisung möglich" : undefined}
      suppressHydrationWarning
      {...listeners}
      {...attributes}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: employee.avatarColor }}
        >
          {employee.initials}
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-stone-800">
            {employee.name}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {availability && (
          <div className="flex items-center gap-1">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                availability.morning.status === "AVAILABLE"
                  ? "bg-emerald-400"
                  : "bg-rose-300"
              } ${
                availability.morning.status === "AVAILABLE" && isMorningAssigned === false
                  ? "ring-2 ring-red-400 ring-offset-1 ring-offset-stone-50"
                  : ""
              }`}
              title={availability.morning.reason ?? undefined}
            />
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                availability.afternoon.status === "AVAILABLE"
                  ? "bg-emerald-400"
                  : "bg-rose-300"
              } ${
                availability.afternoon.status === "AVAILABLE" && isAfternoonAssigned === false
                  ? "ring-2 ring-red-400 ring-offset-1 ring-offset-stone-50"
                  : ""
              }`}
              title={availability.afternoon.reason ?? undefined}
            />
          </div>
        )}
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-700"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setOpen(true)}
        >
          <Cog6ToothIcon className="h-4 w-4" />
        </button>
      </div>
      <EmployeeSettingsDialog
        employee={employee}
        workSchedule={employee.workSchedule ?? null}
        absences={employee.absences ?? []}
        preferences={employee.preferences ?? []}
        desks={desks}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}

