/**
 * REQ: OFP-UI-030, OFP-UI-031, OFP-UI-032, OFP-UI-033,
 *      OFP-DATA-002, OFP-DATA-003
 * Dialog für Wochenplan- und Abwesenheitsverwaltung eines Mitarbeitenden.
 */
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import type {
  Absence,
  Desk,
  Employee,
  Preference,
  WorkSchedule
} from "@/generated/prisma/client";
import {
  upsertWorkSchedule,
  createAbsence,
  deleteAbsenceForm,
  upsertPreferencesForEmployee
} from "../settings-actions";

interface EmployeeSettingsDialogProps {
  employee: Employee;
  workSchedule: WorkSchedule | null;
  absences: Absence[];
  preferences: Preference[];
  desks: Desk[];
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function EmployeeSettingsDialog(props: EmployeeSettingsDialogProps) {
  const {
    employee,
    workSchedule,
    absences,
    preferences,
    desks,
    open,
    onOpenChange
  } = props;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-200 bg-white p-4 shadow-lg">
          <Dialog.Title className="mb-1 text-sm font-semibold text-stone-800">
            Einstellungen – {employee.name}
          </Dialog.Title>
          <Dialog.Description className="mb-3 text-xs text-stone-500">
            Wochenplan, Abwesenheiten und Sitzplatz-Präferenzen verwalten.
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
              <Tabs.Trigger
                value="preferences"
                className="rounded-full px-3 py-1 data-[state=active]:bg-yellow-200 data-[state=active]:text-stone-800"
              >
                Präferenzen
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="schedule" className="space-y-2 text-xs">
              <form action={upsertWorkSchedule} className="space-y-2">
                <input type="hidden" name="employeeId" value={employee.id} />
                {renderHalfDayRow(
                  "Montag",
                  "mondayMorning",
                  "mondayAfternoon",
                  "mondayNote",
                  workSchedule
                )}
                {renderHalfDayRow(
                  "Dienstag",
                  "tuesdayMorning",
                  "tuesdayAfternoon",
                  "tuesdayNote",
                  workSchedule
                )}
                {renderHalfDayRow(
                  "Mittwoch",
                  "wednesdayMorning",
                  "wednesdayAfternoon",
                  "wednesdayNote",
                  workSchedule
                )}
                {renderHalfDayRow(
                  "Donnerstag",
                  "thursdayMorning",
                  "thursdayAfternoon",
                  "thursdayNote",
                  workSchedule
                )}
                {renderHalfDayRow(
                  "Freitag",
                  "fridayMorning",
                  "fridayAfternoon",
                  "fridayNote",
                  workSchedule
                )}
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
                    <form action={deleteAbsenceForm}>
                      <input type="hidden" name="absenceId" value={a.id} />
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

            <Tabs.Content value="preferences" className="space-y-2 text-xs">
              <form
                action={upsertPreferencesForEmployee}
                className="space-y-2"
              >
                <input type="hidden" name="employeeId" value={employee.id} />
                {renderPreferenceRow("Montag", 1, preferences, desks)}
                {renderPreferenceRow("Dienstag", 2, preferences, desks)}
                {renderPreferenceRow("Mittwoch", 3, preferences, desks)}
                {renderPreferenceRow("Donnerstag", 4, preferences, desks)}
                {renderPreferenceRow("Freitag", 5, preferences, desks)}
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center rounded-full bg-yellow-300 px-3 py-1 text-xs font-medium text-stone-800 hover:bg-yellow-400"
                >
                  Präferenzen speichern
                </button>
              </form>
            </Tabs.Content>
          </Tabs.Root>

          <button
            type="button"
            className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-600"
            onClick={() => onOpenChange(false)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            Schliessen
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function renderHalfDayRow(
  label: string,
  morningField: string,
  afternoonField: string,
  noteField: string,
  ws: WorkSchedule | null
) {
  const morningChecked = ws ? (ws as any)[morningField] : true;
  const afternoonChecked = ws ? (ws as any)[afternoonField] : true;
  const note = ws ? ((ws as any)[noteField] as string | null) : null;

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-stone-200 bg-stone-50/60 px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-700">{label}</span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              name={morningField}
              defaultChecked={morningChecked}
              className="h-3.5 w-3.5 rounded border-stone-300 text-yellow-400"
            />
            <span className="text-[11px] text-stone-700">Vormittag</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              name={afternoonField}
              defaultChecked={afternoonChecked}
              className="h-3.5 w-3.5 rounded border-stone-300 text-yellow-400"
            />
            <span className="text-[11px] text-stone-700">Nachmittag</span>
          </label>
        </div>
      </div>
      <input
        type="text"
        name={noteField}
        defaultValue={note ?? ""}
        placeholder="Grund (falls teilweise/gar nicht anwesend)"
        className="mt-1 w-full rounded-md border border-stone-200 px-2 py-0.5 text-[11px]"
      />
    </div>
  );
}

function renderPreferenceRow(
  label: string,
  weekday: number,
  preferences: Preference[],
  desks: Desk[]
) {
  const morningPref = preferences.find(
    (p) => p.weekday === weekday && p.slot === "MORNING"
  );
  const afternoonPref = preferences.find(
    (p) => p.weekday === weekday && p.slot === "AFTERNOON"
  );

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-stone-200 bg-stone-50/60 px-2 py-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-700">{label}</span>
      </div>
      <div className="mt-1 grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-stone-700">Vormittag</span>
          <select
            name={`pref_${weekday}_MORNING`}
            defaultValue={morningPref ? String(morningPref.deskId) : ""}
            className="w-full rounded-md border border-stone-200 px-2 py-1 text-[11px]"
          >
            <option value="">Keine Präferenz</option>
            {desks.map((desk) => (
              <option key={desk.id} value={desk.id}>
                {desk.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-stone-700">Nachmittag</span>
          <select
            name={`pref_${weekday}_AFTERNOON`}
            defaultValue={afternoonPref ? String(afternoonPref.deskId) : ""}
            className="w-full rounded-md border border-stone-200 px-2 py-1 text-[11px]"
          >
            <option value="">Keine Präferenz</option>
            {desks.map((desk) => (
              <option key={desk.id} value={desk.id}>
                {desk.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}