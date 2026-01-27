## Traceability – Office Seating Planner

Diese Datei verknüpft die wichtigsten Requirements aus `office_seating_planner.sdoc`
mit den implementierenden Modulen/Funktionen. Kommentare im Code referenzieren
die gleichen OFP-UIDs (`// REQ: ...`).

| Requirement UID | Kurzbeschreibung | Wichtige Dateien/Funktionen |
|-----------------|------------------|------------------------------|
| OFP-TECH-001, OFP-TECH-002 | Next.js 15, TypeScript strict | `next.config.mjs`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx` |
| OFP-TECH-003, OFP-UI-010..014 | Tailwind, warmes UI-Design | `tailwind.config.ts`, `app/globals.css`, Layout-Klassen in `app/layout.tsx`, `DeskMap.tsx`, `DroppableDeskSlot.tsx` |
| OFP-TECH-004, OFP-UI-030..033 | Radix Dialog & Tabs, Settings | `EmployeeSettingsDialog.tsx`, `settings-actions.ts` |
| OFP-TECH-005 | Icons | `app/page.tsx`, `DraggableEmployee.tsx` |
| OFP-TECH-006, OFP-DND-001 | dnd-kit DnD | `planner-client.tsx`, `DraggableEmployee.tsx`, `DroppableDeskSlot.tsx` |
| OFP-TECH-007, OFP-DATA-001..005 | SQLite/Prisma Datenmodell | `prisma/schema.prisma`, `lib/prisma.ts` |
| OFP-FLOOR-001..004 | Grid, Zonen A–D, Desk-Position/Rotation | `prisma/seed.ts` (Desk-Zonen), `DeskMap.tsx`, `DeskSlotContainer.tsx` |
| OFP-FUNC-001 | Planung & Visualisierung von Sitzplätzen | `app/(dashboard)/planner/page.tsx`, `planner-client.tsx`, `DeskMap.tsx` |
| OFP-DATA-005, OFP-DND-003 | Assignment mit Slots, Uniqueness | `prisma/schema.prisma` (enum `TimeSlot`, `Assignment.slot`, `@@unique`), `planner/actions.ts` (`assignEmployeeToDesk`), `planner-client.tsx`, `DroppableDeskSlot.tsx` |
| OFP-BACK-001..003 | Verfügbarkeitslogik | `lib/domain/availability.ts`, Nutzung in `planner/page.tsx` & `planner-client.tsx` |
| OFP-UI-020 | Weekday-Tabs | `WeekTabs.tsx`, Einbindung in `planner/page.tsx` |
| OFP-UI-021..023 | Employee Sidebar, Status, Nicht-Draggability | `EmployeeSidebar.tsx`, `DraggableEmployee.tsx` |
| OFP-UI-024..025 | Desk-Rendering, Hover/Drop-Feedback | `DeskMap.tsx`, `DeskSlotContainer.tsx`, `DroppableDeskSlot.tsx` |
| OFP-UI-030..033 | Employee Settings Dialog (Schedule/Absences) | `EmployeeSettingsDialog.tsx`, `settings-actions.ts`, Aufruf aus `DraggableEmployee.tsx` |
| OFP-DND-002 | Optimistic Updates | `planner-client.tsx` (lokaler Zustand + Server Action) |
| OFP-TECH-008, OFP-DEP-001..002 | Docker + Fly.io, persistente DB | `Dockerfile`, `fly.toml` (Volume `/data`, `DATABASE_URL`) |

