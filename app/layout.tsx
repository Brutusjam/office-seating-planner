/**
 * REQ: OFP-TECH-001, OFP-TECH-002, OFP-UI-001
 * RootLayout der Next.js App-Router Anwendung.
 */
import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import altdorfLogo from "../Logo_Gemeinde Altdorf.jpg";
import teamTetrisLogo from "../Logo Team Tetris.png";

export const metadata = {
  title: "TeamTetris",
  description: "Planung von Büroplätzen mit Halbtags-Slots"
};

export default function RootLayout(props: { children: ReactNode }) {
  const { children } = props;

  return (
    <html lang="de">
      <body className="bg-stone-50 text-stone-700">
        <main className="min-h-screen flex flex-col">
          <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link
                href="/"
                className="flex items-center gap-3 text-lg font-semibold tracking-tight text-stone-800 hover:text-stone-900"
              >
                <Image
                  src={teamTetrisLogo}
                  alt="TeamTetris Logo"
                  className="h-20 w-auto"
                  priority
                />
                <span>TeamTetris</span>
              </Link>
              <div className="flex items-center">
                {/* REQ: OFP-SEC-001 – keine Auth, nur interner Gebrauch */}
                <Image
                  src={altdorfLogo}
                  alt="Gemeinde Altdorf"
                  className="h-8 w-auto"
                  priority
                />
              </div>
            </div>
          </header>
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </div>
          <footer className="border-t border-stone-200 bg-white/80">
            <div className="mx-auto max-w-6xl px-4 py-3">
              <p className="text-xs text-stone-400 text-center">
                Gemeinde Altdorf UR - Digitales &amp; Prozesse - Beat Schuler
              </p>
            </div>
          </footer>
        </main>
      </body>
    </html>
  );
}

