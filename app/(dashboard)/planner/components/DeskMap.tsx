/**
 * REQ: OFP-FLOOR-001, OFP-FLOOR-002, OFP-FLOOR-003, OFP-FLOOR-004,
 *      OFP-UI-024, OFP-UI-025, OFP-DATA-004, OFP-DATA-005
 *
 * DeskMap: 12x12 CSS-Grid mit DeskSlotContainern für MORNING/AFTERNOON.
 */
import type { Desk, Employee } from "@prisma/client";
import type { EmployeeAvailability } from "@/lib/domain/availability";
import type { TimeSlot } from "@/lib/domain/types";
import { DeskSlotContainer } from "./DeskSlotContainer";

interface DeskMapProps {
  desks: Desk[];
  employees: Employee[];
  availabilityByEmployee: Record<number, EmployeeAvailability>;
  assignmentState: Record<string, number | null>; // `${deskId}_${slot}` -> employeeId
}

export function DeskMap(props: DeskMapProps) {
  const { desks, employees, availabilityByEmployee, assignmentState } = props;

  return (
    <div className="aspect-[4/3] w-full rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-1">
        {desks.map((desk) => (
          <div
            key={desk.id}
            className="relative"
            style={{
              gridColumn: `${desk.gridX} / span ${desk.gridW}`,
              gridRow: `${desk.gridY} / span ${desk.gridH}`
            }}
          >
            <DeskSlotContainer
              desk={desk}
              employees={employees}
              availabilityByEmployee={availabilityByEmployee}
              morningEmployeeId={assignmentState[`${desk.id}_MORNING`] ?? null}
              afternoonEmployeeId={assignmentState[`${desk.id}_AFTERNOON`] ?? null}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

