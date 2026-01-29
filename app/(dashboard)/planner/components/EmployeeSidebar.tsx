/**
 * REQ: OFP-UI-021, OFP-UI-022, OFP-UI-023
 * Sidebar mit Mitarbeitendenliste, Verfügbarkeitsstatus und Drag-Quellen.
 */
"use client";

import type { Desk, Employee } from "@/generated/prisma/client";
import type { EmployeeDayAvailability } from "@/lib/domain/availability";
import { DraggableEmployee } from "./DraggableEmployee";

interface AssignedSlots {
  morning: boolean;
  afternoon: boolean;
}

interface EmployeeSidebarProps {
  employees: Employee[];
  availabilityByEmployee: Record<number, EmployeeDayAvailability>;
  assignedSlotsByEmployee: Record<number, AssignedSlots>;
  desks: Desk[];
  onApplyPreferences?: () => void;
  applyingPreferences?: boolean;
}

export function EmployeeSidebar(props: EmployeeSidebarProps) {
  const {
    employees,
    availabilityByEmployee,
    assignedSlotsByEmployee,
    desks,
    onApplyPreferences,
    applyingPreferences
  } = props;

  return (
    <div className="h-full rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">
        Mitarbeitende
      </h3>
      <div className="space-y-1 overflow-x-hidden overflow-y-auto pr-1 text-sm">
        {employees.map((emp) => (
          <DraggableEmployee
            key={emp.id}
            employee={emp}
            availability={availabilityByEmployee[emp.id] ?? null}
            isMorningAssigned={assignedSlotsByEmployee[emp.id]?.morning}
            isAfternoonAssigned={assignedSlotsByEmployee[emp.id]?.afternoon}
            desks={desks}
          />
        ))}
      </div>
      {onApplyPreferences && (
        <button
          type="button"
          className="mt-3 w-full rounded-full bg-yellow-300 px-3 py-1.5 text-xs font-medium text-stone-800 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500"
          onClick={onApplyPreferences}
          disabled={applyingPreferences}
        >
          {applyingPreferences ? "Präferenzen werden eingetragen..." : "Präferenzen eintragen"}
        </button>
      )}
    </div>
  );
}

