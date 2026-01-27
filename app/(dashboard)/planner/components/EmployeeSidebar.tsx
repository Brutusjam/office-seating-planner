/**
 * REQ: OFP-UI-021, OFP-UI-022, OFP-UI-023
 * Sidebar mit Mitarbeitendenliste, Verfügbarkeitsstatus und Drag-Quellen.
 */
"use client";

import type { Employee } from "@prisma/client";
import type { EmployeeAvailability } from "@/lib/domain/availability";
import { DraggableEmployee } from "./DraggableEmployee";

interface EmployeeSidebarProps {
  employees: Employee[];
  availabilityByEmployee: Record<number, EmployeeAvailability>;
}

export function EmployeeSidebar(props: EmployeeSidebarProps) {
  const { employees, availabilityByEmployee } = props;

  return (
    <div className="h-full rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-stone-800">
        Mitarbeitende
      </h3>
      <div className="space-y-1 overflow-y-auto pr-1 text-sm">
        {employees.map((emp) => (
          <DraggableEmployee
            key={emp.id}
            employee={emp}
            availability={availabilityByEmployee[emp.id] ?? null}
          />
        ))}
      </div>
    </div>
  );
}

