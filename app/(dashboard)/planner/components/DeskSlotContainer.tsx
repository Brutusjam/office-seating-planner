/**
 * REQ: OFP-UI-024, OFP-DATA-005
 * Container für einen physischen Desk mit zwei Slot-Zonen (MORNING/AFTERNOON).
 */
import type { Desk, Employee } from "@/generated/prisma/client";
import type { EmployeeAvailability } from "@/lib/domain/availability";
import { DroppableDeskSlot } from "./DroppableDeskSlot";

interface DeskSlotContainerProps {
  desk: Desk;
  employees: Employee[];
  availabilityByEmployee: Record<number, EmployeeAvailability>;
  morningEmployeeId: number | null;
  afternoonEmployeeId: number | null;
}

export function DeskSlotContainer(props: DeskSlotContainerProps) {
  const {
    desk,
    employees,
    availabilityByEmployee,
    morningEmployeeId,
    afternoonEmployeeId
  } = props;

  const morningEmployee =
    employees.find((e) => e.id === morningEmployeeId ?? undefined) ?? null;
  const afternoonEmployee =
    employees.find((e) => e.id === afternoonEmployeeId ?? undefined) ?? null;

  const morningAvailability =
    morningEmployee && availabilityByEmployee[morningEmployee.id];
  const afternoonAvailability =
    afternoonEmployee && availabilityByEmployee[afternoonEmployee.id];

  return (
    <div className="flex h-full flex-col rounded-xl border border-stone-200 bg-stone-50/80 shadow-sm">
      <div className="border-b border-stone-200 px-2 py-1 text-xs font-medium text-stone-600">
        {desk.label}
      </div>
      <div className="flex flex-1 flex-col">
        <DroppableDeskSlot
          deskId={desk.id}
          slot="MORNING"
          label="Vormittag"
          employee={morningEmployee}
          availability={morningAvailability ?? null}
        />
        <DroppableDeskSlot
          deskId={desk.id}
          slot="AFTERNOON"
          label="Nachmittag"
          employee={afternoonEmployee}
          availability={afternoonAvailability ?? null}
        />
      </div>
    </div>
  );
}

