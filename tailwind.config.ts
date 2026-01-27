/**
 * REQ: OFP-TECH-003, OFP-UI-010, OFP-UI-011, OFP-UI-012, OFP-UI-013, OFP-UI-014
 * Tailwind-Konfiguration mit Fokus auf stone-, yellow- und rose-Farben.
 */
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Nutzung der bestehenden Tailwind-Paletten: stone, yellow, rose
      },
      borderRadius: {
        "xl": "0.75rem"
      }
    }
  },
  plugins: []
};

export default config;

