/**
 * REQ: OFP-TECH-001, OFP-TECH-002, OFP-UI-001
 * RootLayout der Next.js App-Router Anwendung.
 */
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Office Seating Planner",
  description: "Planung von Büroplätzen mit Halbtags-Slots"
};

export default function RootLayout(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <html lang="de">
      <body className="bg-stone-50 text-stone-700">
        <main className="min-h-screen flex flex-col">
          <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
              <h1 className="text-lg font-semibold tracking-tight text-stone-800">
                Office Seating Planner
              </h1>
              <span className="text-xs text-stone-500">
                {/* REQ: OFP-SEC-001 – keine Auth, nur interner Gebrauch */}
                Internal tool – no login required
              </span>
            </div>
          </header>
          <div className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}

