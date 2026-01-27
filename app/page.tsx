/**
 * REQ: OFP-FUNC-001, OFP-TECH-004, OFP-TECH-005, OFP-TECH-006
 * Startseite mit einem einfachen Link zum Planner-Dashboard und
 * Demo-Verwendung von Radix, Icons und dnd-kit (nur Platzhalter).
 */
import Link from "next/link";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
        <InformationCircleIcon className="h-5 w-5 text-yellow-500" />
        <div>
          <p className="text-sm font-medium text-stone-800">
            Office Seating Planner – Wochenplanung mit Halbtags-Slots
          </p>
          <p className="text-xs text-stone-500">
            {/* REQ: OFP-UI-001, OFP-UI-010 */}
            Leichtes, freundliches UI mit Fokus auf Übersichtlichkeit.
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-base font-semibold text-stone-800">
          Planner öffnen
        </h2>
        <p className="mb-4 text-sm text-stone-600">
          Plane Sitzplätze für 9 Mitarbeitende in zwei Räumen mit Vormittag-
          und Nachmittagsslots.
        </p>
        <Link
          href="/planner"
          className="inline-flex items-center rounded-full bg-yellow-300 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm hover:bg-yellow-400"
        >
          Zum Planner-Dashboard
        </Link>
      </div>
    </div>
  );
}

