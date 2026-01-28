/**
 * REQ: OFP-FUNC-001, OFP-DATA-001, OFP-DATA-002, OFP-DATA-003,
 *      OFP-DATA-004, OFP-DATA-005, OFP-FLOOR-001, OFP-FLOOR-002,
 *      OFP-FLOOR-003, OFP-FLOOR-004
 *
 * Seed-Skript: legt 9 Mitarbeitende, WorkSchedules, Absences,
 * Desk-Zonen (A–D) und einige Beispiel-Assignments mit Halbtags-Slots an.
 */
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, TimeSlot } from "../generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Cleanup for idempotentes Seed
  await prisma.assignment.deleteMany();
  await prisma.preference?.deleteMany?.();
  await prisma.absence.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.desk.deleteMany();
  await prisma.employee.deleteMany();

  await prisma.employee.createMany({
    data: [
      { name: "Colette Müller", initials: "cm", avatarColor: "#F97316" },
      { name: "Petra Imgrüt", initials: "pi", avatarColor: "#22C55E" },
      { name: "Ursi Schmidt", initials: "us", avatarColor: "#6366F1" },
      { name: "Beat Schuler", initials: "bs", avatarColor: "#EC4899" },
      { name: "Monika Kempf", initials: "mk", avatarColor: "#14B8A6" },
      { name: "Daniel Ritter", initials: "dr", avatarColor: "#A855F7" },
      { name: "Gioia Gisler", initials: "gg", avatarColor: "#FBBF24" },
      { name: "Joana Büchi", initials: "jb", avatarColor: "#0EA5E9" },
      { name: "Liliane Schuler", initials: "ls", avatarColor: "#F97316" }
    ]
  });

  const allEmployees = await prisma.employee.findMany();

  // Standard-Wochenplan: alle Mo–Fr anwesend
  for (const emp of allEmployees) {
    await prisma.workSchedule.create({
      data: {
        employeeId: emp.id,
        mondayMorning: true,
        mondayAfternoon: true,
        tuesdayMorning: true,
        tuesdayAfternoon: true,
        wednesdayMorning: true,
        wednesdayAfternoon: true,
        thursdayMorning: true,
        thursdayAfternoon: true,
        fridayMorning: true,
        fridayAfternoon: true
      }
    });
  }

  // Beispiel-Abwesenheiten
  if (allEmployees[0]) {
    await prisma.absence.create({
      data: {
        employeeId: allEmployees[0].id,
        startDate: new Date("2026-02-03"),
        endDate: new Date("2026-02-05"),
        reason: "Ferien"
      }
    });
  }
  if (allEmployees[1]) {
    await prisma.absence.create({
      data: {
        employeeId: allEmployees[1].id,
        startDate: new Date("2026-02-04"),
        endDate: new Date("2026-02-04"),
        reason: "Krank"
      }
    });
  }

  // Desk-Zonen A–D im Grid mit optionaler Titel-Farbe
  await prisma.desk.createMany({
    data: [
      // Zone A: zwei übereinanderliegende grosse Tische
      { label: "EWK 1", gridX: 1, gridY: 1, gridW: 6, gridH: 2, rotation: 0, titleColor: "#FEF3C7" },
      { label: "EWK 2", gridX: 1, gridY: 7, gridW: 6, gridH: 2, rotation: 0, titleColor: "#FEF3C7" },
      // Zone B: grosse Steuern-Tische
      { label: "Steuern 1", gridX: 9, gridY: 1, gridW: 6, gridH: 2, rotation: 0, titleColor: "#DBEAFE" },
      { label: "Steuern 2", gridX: 9, gridY: 7, gridW: 6, gridH: 2, rotation: 0, titleColor: "#DBEAFE" },
      { label: "Steuern 3", gridX: 9, gridY: 13, gridW: 6, gridH: 2, rotation: 0, titleColor: "#DBEAFE" },
      // Zone C: Cluster (z.B. exIT)
      { label: "Büro exIT", gridX: 17, gridY: 1, gridW: 6, gridH: 2, rotation: 0, titleColor: "#DCFCE7" },
      // Zone D: breiter Meeting-Tisch unten rechts
      { label: "Information", gridX: 17, gridY: 13, gridW: 6, gridH: 2, rotation: 0, titleColor: "#FCE7F3" }
    ]
  });

  const allDesks = await prisma.desk.findMany();

  // Beispiel-Präferenzen: erste zwei Mitarbeitende bevorzugen bestimmte Pulte
  const dPref0 = allDesks[0];
  const dPref1 = allDesks[1];

  if (allEmployees[0] && dPref0) {
    await prisma.preference.create({
      data: {
        employeeId: allEmployees[0].id,
        deskId: dPref0.id,
        weekday: 1, // Montag
        slot: TimeSlot.MORNING
      }
    });
  }

  if (allEmployees[1] && dPref1) {
    await prisma.preference.create({
      data: {
        employeeId: allEmployees[1].id,
        deskId: dPref1.id,
        weekday: 1, // Montag
        slot: TimeSlot.AFTERNOON
      }
    });
  }

  // Beispiel-Assignments für ein Datum mit Morning/Afternoon
  const exampleDate = new Date("2026-02-02");
  const e0 = allEmployees[0];
  const e1 = allEmployees[1];
  const d0 = allDesks[0];
  const d1 = allDesks[1];

  if (e0 && d0) {
    await prisma.assignment.create({
      data: {
        date: exampleDate,
        slot: TimeSlot.MORNING,
        employeeId: e0.id,
        deskId: d0.id
      }
    });
  }

  if (e1 && d1) {
    await prisma.assignment.create({
      data: {
        date: exampleDate,
        slot: TimeSlot.AFTERNOON,
        employeeId: e1.id,
        deskId: d1.id
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

