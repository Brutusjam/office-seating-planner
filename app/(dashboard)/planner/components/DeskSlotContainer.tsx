/**
 * REQ: OFP-UI-024, OFP-DATA-005
 * Container für einen physischen Desk mit zwei Slot-Zonen (MORNING/AFTERNOON)
 * und einer zusätzlichen Drop-Zone auf dem Header für Ganztags-Zuordnung.
 */
import { useDroppable } from "@dnd-kit/core";
import type { Desk, Employee } from "@/generated/prisma/client";
import type {
  EmployeeDayAvailability,
  HalfDayAvailability
} from "@/lib/domain/availability";
import { DroppableDeskSlot } from "./DroppableDeskSlot";

interface DeskSlotContainerProps {
  desk: Desk;
  employees: Employee[];
  availabilityByEmployee: Record<number, EmployeeDayAvailability>;
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
    morningEmployeeId !== null
      ? (employees.find((e) => e.id === morningEmployeeId) ?? null)
      : null;
  const afternoonEmployee =
    afternoonEmployeeId !== null
      ? (employees.find((e) => e.id === afternoonEmployeeId) ?? null)
      : null;

  const getAvailabilityFor = (
    employee: Employee | null,
    slot: "MORNING" | "AFTERNOON"
  ): HalfDayAvailability | null => {
    if (!employee) return null;
    const day = availabilityByEmployee[employee.id];
    if (!day) return null;
    return slot === "MORNING" ? day.morning : day.afternoon;
  };

  const morningAvailability = getAvailabilityFor(morningEmployee, "MORNING");
  const afternoonAvailability = getAvailabilityFor(
    afternoonEmployee,
    "AFTERNOON"
  );

  const { setNodeRef: setHeaderRef, isOver: isHeaderOver } = useDroppable({
    id: `desk-${desk.id}-HEADER`,
    data: { deskId: desk.id, header: true }
  });

  const headerStyle: React.CSSProperties = desk.titleColor
    ? { backgroundColor: desk.titleColor }
    : {};

  return (
    <div
      className={[
        "flex h-full min-h-[80px] flex-col rounded-2xl",
        isHeaderOver ? "ring-2 ring-yellow-200" : ""
      ].join(" ")}
    >
      <div className="flex flex-1 flex-col gap-1">
        <div
          ref={setHeaderRef}
          className="flex items-center gap-2 rounded-2xl border border-stone-300 px-2 py-1.5 text-xs font-medium text-stone-700 bg-white"
          style={headerStyle}
        >
          <div
            className="h-5 w-0.5 rounded-full bg-stone-400"
            style={
              desk.titleColor
                ? { backgroundColor: "rgba(0,0,0,0.12)" }
                : undefined
            }
          />
          <span className="truncate">{desk.label}</span>
        </div>
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

