/**
 * REQ: OFP-UI-024, OFP-UI-025, OFP-DND-001, OFP-DND-003, OFP-DATA-005
 * Drop-Zone für einen einzelnen Slot (MORNING/AFTERNOON) eines Desks.
 */
"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Employee } from "@/generated/prisma/client";
import type { TimeSlot } from "@/lib/domain/types";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface DroppableDeskSlotProps {
  deskId: number;
  slot: TimeSlot;
  label: string;
  employee: Employee | null;
  onClearSlot?: (deskId: number, slot: TimeSlot) => void;
}

export function DroppableDeskSlot(props: DroppableDeskSlotProps) {
  const { deskId, slot, label, employee, onClearSlot } = props;

  const { isOver, setNodeRef } = useDroppable({
    id: `desk-${deskId}-${slot}`,
    data: { deskId, slot }
  });

  const bg = isOver
    ? "bg-yellow-50 border-yellow-300"
    : slot === "MORNING"
      ? "bg-stone-50"
      : "bg-stone-100";

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 items-center justify-between rounded-2xl border border-stone-300 px-2.5 py-1.5 text-xs ${bg}`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] font-medium text-stone-600">{label}</span>
        {employee ? (
          <span className="text-xs text-stone-800">
            {employee.name}
          </span>
        ) : (
          <span className="text-xs text-stone-400">Leer</span>
        )}
      </div>
      {employee && onClearSlot && (
        <button
          type="button"
          className="ml-2 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200 hover:text-stone-600"
          title="Zuteilung entfernen"
          onClick={(e) => {
            e.stopPropagation();
            onClearSlot(deskId, slot);
          }}
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

