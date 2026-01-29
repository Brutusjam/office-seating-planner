/**
 * REQ: OFP-FLOOR-001, OFP-FLOOR-002, OFP-FLOOR-003, OFP-FLOOR-004,
 *      OFP-UI-024, OFP-UI-025, OFP-DATA-004, OFP-DATA-005
 *
 * DeskMap: 12x12 CSS-Grid mit DeskSlotContainern für MORNING/AFTERNOON.
 */
import type { Desk, Employee } from "@/generated/prisma/client";
import type { TimeSlot } from "@/lib/domain/types";
import { DeskSlotContainer } from "./DeskSlotContainer";

const FLOOR_COLS = 24;
const FLOOR_ROWS = 18;

interface DeskMapProps {
  desks: Desk[];
  employees: Employee[];
  assignmentState: Record<string, number | null>; // `${deskId}_${slot}` -> employeeId
  highlightFreeDesks?: boolean;
  onClearSlot: (deskId: number, slot: TimeSlot) => void;
}

export function DeskMap(props: DeskMapProps) {
  const {
    desks,
    employees,
    assignmentState,
    highlightFreeDesks,
    onClearSlot
  } = props;

  return (
    <div className="aspect-[3/2] min-h-[520px] w-full rounded-xl border border-stone-200 bg-slate-50 p-4 shadow-sm">
      <div
        className="grid h-full w-full gap-1 rounded-lg bg-white/80"
        style={{
          gridTemplateColumns: `repeat(${FLOOR_COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${FLOOR_ROWS}, minmax(0, 1fr))`,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)",
          backgroundSize: "18px 18px"
        }}
      >
        {desks.map((desk) => {
          const morningKey = `${desk.id}_MORNING`;
          const afternoonKey = `${desk.id}_AFTERNOON`;
          const isFree =
            (assignmentState[morningKey] ?? null) === null &&
            (assignmentState[afternoonKey] ?? null) === null;

          return (
            <div
              key={desk.id}
              className={[
                "relative",
                highlightFreeDesks && isFree
                  ? "ring-2 ring-emerald-300/70 ring-offset-1 ring-offset-white"
                  : ""
              ]
                .filter(Boolean)
                .join(" ")}
              style={{
                gridColumn: `${desk.gridX} / span ${desk.gridW}`,
                gridRow: `${desk.gridY} / span ${desk.gridH}`
              }}
            >
              <DeskSlotContainer
                desk={desk}
                employees={employees}
                morningEmployeeId={assignmentState[morningKey] ?? null}
                afternoonEmployeeId={assignmentState[afternoonKey] ?? null}
                onClearSlot={onClearSlot}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

