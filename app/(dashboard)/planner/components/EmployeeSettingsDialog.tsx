/**
 * REQ: OFP-UI-030, OFP-UI-031, OFP-UI-032, OFP-UI-033,
 *      OFP-DATA-002, OFP-DATA-003
 * Dialog für Wochenplan- und Abwesenheitsverwaltung eines Mitarbeitenden.
 */
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import type { Absence, Employee, WorkSchedule } from "@prisma/client";
import { upsertWorkSchedule, createAbsence, deleteAbsence } from "../settings-actions";

interface EmployeeSettingsDialogProps {
  employee: Employee;
  workSchedule: WorkSchedule | null;
  absences: Absence[];
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function EmployeeSettingsDialog(props: EmployeeSettingsDialogProps) {
  const { employee, workSchedule, absences, open, onOpenChange } = props;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
          <Dialog.Title className="mb-1 text-sm font-semibold text-stone-800">
            Einstellungen – {employee.name}
          </Dialog.Title>
          <Dialog.Description className="mb-3 text-xs text-stone-500">
            Wochenplan und Abwesenheiten verwalten.
          </Dialog.Description>

          <Tabs.Root defaultValue="schedule" className="flex flex-col gap-3">
            <Tabs.List className="inline-flex gap-1 rounded-full bg-stone-100 p-1 text-xs">
              <Tabs.Trigger
                value="schedule"
                className="rounded-full px-3 py-1 data-[state=active]:bg-yellow-200 data-[state=active]:text-stone-800"
              >
                Wochenplan
              </Tabs.Trigger>
              <Tabs.Trigger
                value="absences"
                className="rounded-full px-3 py-1 data-[state=active]:bg-yellow-200 data-[state=active]:text-stone-800"
              >
                Abwesenheiten
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="schedule" className="space-y-2 text-xs">
              <form action={upsertWorkSchedule} className="space-y-2">
                <input type="hidden" name="employeeId" value={employee.id} />
                {renderDayRow("Montag", "monday", "mondayNote", workSchedule)}
                {renderDayRow("Dienstag", "tuesday", "tuesdayNote", workSchedule)}
                {renderDayRow("Mittwoch", "wednesday", "wednesdayNote", workSchedule)}
                {renderDayRow("Donnerstag", "thursday", "thursdayNote", workSchedule)}
                {renderDayRow("Freitag", "friday", "fridayNote", workSchedule)}
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center rounded-full bg-yellow-300 px-3 py-1 text-xs font-medium text-stone-800 hover:bg-yellow-400"
                >
                  Speichern
                </button>
              </form>
            </Tabs.Content>

            <Tabs.Content value="absences" className="space-y-3 text-xs">
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {absences.length === 0 && (
                  <p className="text-stone-500 text-xs">Keine Abwesenheiten erfasst.</p>
                )}
                {absences.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-2 py-1"
                  >
                    <div>
                      <div className="text-[11px] text-stone-700">
                        {a.startDate.toISOString().slice(0, 10)} –{" "}
                        {a.endDate.toISOString().slice(0, 10)}
                      </div>
                      <div className="text-[11px] text-stone-500">{a.reason}</div>
                    </div>
                    <form
                      action={async () => {
                        "use server";
                        await deleteAbsence(a.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-full px-2 py-0.5 text-[11px] text-rose-500 hover:bg-rose-50"
                      >
                        Löschen
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              <form action={createAbsence} className="space-y-2 rounded-lg border border-stone-200 bg-stone-50 p-2">
                <input type="hidden" name="employeeId" value={employee.id} />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-0.5 block text-[11px] text-stone-600">
                      Von
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      className="w-full rounded-md border border-stone-200 px-2 py-1 text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-0.5 block text-[11px] text-stone-600">
                      Bis
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      className="w-full rounded-md border border-stone-200 px-2 py-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-0.5 block text-[11px] text-stone-600">
                    Grund
                  </label>
                  <input
                    type="text"
                    name="reason"
                    className="w-full rounded-md border border-stone-200 px-2 py-1 text-xs"
                    placeholder="z.B. Ferien, Krank..."
                  />
                </div>
                <button
                  type="submit"
                  className="mt-1 inline-flex items-center rounded-full bg-yellow-300 px-3 py-1 text-xs font-medium text-stone-800 hover:bg-yellow-400"
                >
                  Abwesenheit hinzufügen
                </button>
              </form>
            </Tabs.Content>
          </Tabs.Root>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-600"
            >
              Schliessen
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function renderDayRow(
  label: string,
  field: string,
  noteField: string,
  ws: WorkSchedule | null
) {
  const checked = ws ? (ws as any)[field] : true;
  const note = ws ? ((ws as any)[noteField] as string | null) : null;

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          name={field}
          defaultChecked={checked}
          className="h-3.5 w-3.5 rounded border-stone-300 text-yellow-400"
        />
        <span className="text-xs text-stone-700">{label}</span>
      </label>
      <input
        type="text"
        name={noteField}
        defaultValue={note ?? ""}
        placeholder="Grund (falls nicht anwesend)"
        className="flex-1 rounded-md border border-stone-200 px-2 py-0.5 text-xs"
      />
    </div>
  );
}

