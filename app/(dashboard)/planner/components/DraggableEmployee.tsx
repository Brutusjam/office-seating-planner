/**
 * REQ: OFP-UI-021, OFP-UI-022, OFP-UI-023, OFP-UI-030
 * Darstellt einen Mitarbeitenden als (ggf.) draggable Tile mit Statusdot
 * und Gear-Icon für Einstellungen.
 */
"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Absence, Employee, WorkSchedule } from "@/generated/prisma/client";
import type { EmployeeAvailability } from "@/lib/domain/availability";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { EmployeeSettingsDialog } from "./EmployeeSettingsDialog";

interface DraggableEmployeeProps {
  employee: Employee & { workSchedule?: WorkSchedule | null; absences?: Absence[] };
  availability: EmployeeAvailability | null;
}

export function DraggableEmployee(props: DraggableEmployeeProps) {
  const { employee, availability } = props;

  const [open, setOpen] = useState(false);

  const isAvailable = availability?.status !== "UNAVAILABLE";

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: employee.id,
      disabled: !isAvailable
    });

  const style: React.CSSProperties = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
      }
    : {};

  const statusColor =
    availability?.status === "AVAILABLE" ? "bg-emerald-400" : "bg-rose-300";

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, opacity: isDragging ? 0 : undefined }}
      className={[
        "flex items-center justify-between rounded-xl border px-2 py-1",
        "border-stone-200 bg-stone-50",
        isAvailable ? "cursor-grab" : "opacity-50 cursor-not-allowed",
        isDragging ? "ring-2 ring-yellow-300 shadow-lg" : ""
      ].join(" ")}
      suppressHydrationWarning
      {...(isAvailable ? { ...listeners, ...attributes } : {})}
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
          {availability?.reason && (
            <span className="text-[11px] text-stone-500">
              {availability.reason}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {availability && (
          <span
            className={`h-2.5 w-2.5 rounded-full ${statusColor}`}
            title={availability.reason ?? undefined}
          />
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
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  );
}

