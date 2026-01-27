/**
 * REQ: OFP-UI-024, OFP-UI-025, OFP-DND-001, OFP-DND-003, OFP-DATA-005
 * Drop-Zone für einen einzelnen Slot (MORNING/AFTERNOON) eines Desks.
 */
"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Employee } from "@prisma/client";
import type { TimeSlot } from "@/lib/domain/types";
import type { EmployeeAvailability } from "@/lib/domain/availability";

interface DroppableDeskSlotProps {
  deskId: number;
  slot: TimeSlot;
  label: string;
  employee: Employee | null;
  availability: EmployeeAvailability | null;
}

export function DroppableDeskSlot(props: DroppableDeskSlotProps) {
  const { deskId, slot, label, employee, availability } = props;

  const { isOver, setNodeRef } = useDroppable({
    id: `desk-${deskId}-${slot}`,
    data: { deskId, slot }
  });

  const bg = isOver ? "bg-yellow-50 border-yellow-300" : "bg-white";

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 items-center justify-between border-t border-stone-200 px-2 py-1 text-xs ${bg}`}
    >
      <div className="flex flex-col">
        <span className="text-[11px] font-medium text-stone-600">{label}</span>
        {employee ? (
          <span className="text-xs text-stone-800">
            {employee.initials} – {employee.name}
          </span>
        ) : (
          <span className="text-xs text-stone-400">Leer</span>
        )}
      </div>
      {employee && availability && (
        <span
          className={`ml-2 inline-flex h-2.5 w-2.5 rounded-full ${
            availability.status === "AVAILABLE"
              ? "bg-emerald-400"
              : "bg-rose-300"
          }`}
          title={availability.reason ?? undefined}
        />
      )}
    </div>
  );
}

