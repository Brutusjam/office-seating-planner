/**
 * REQ: OFP-FUNC-001, OFP-DATA-001, OFP-DATA-002, OFP-DATA-003,
 *      OFP-DATA-004, OFP-DATA-005, OFP-FLOOR-001, OFP-FLOOR-002,
 *      OFP-FLOOR-003, OFP-FLOOR-004
 *
 * Seed-Skript: legt 9 Mitarbeitende, WorkSchedules, Absences,
 * Desk-Zonen (A–D) und einige Beispiel-Assignments mit Halbtags-Slots an.
 */
import { PrismaClient, TimeSlot } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Cleanup for idempotentes Seed
  await prisma.assignment.deleteMany();
  await prisma.absence.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.desk.deleteMany();
  await prisma.employee.deleteMany();

  const employees = await prisma.employee.createMany({
    data: [
      { name: "Anna Keller", initials: "AK", avatarColor: "#F97316" },
      { name: "Ben Meier", initials: "BM", avatarColor: "#22C55E" },
      { name: "Clara Vogel", initials: "CV", avatarColor: "#6366F1" },
      { name: "David Steiner", initials: "DS", avatarColor: "#EC4899" },
      { name: "Eva Roth", initials: "ER", avatarColor: "#14B8A6" },
      { name: "Felix Hartmann", initials: "FH", avatarColor: "#A855F7" },
      { name: "Gina Wolf", initials: "GW", avatarColor: "#FBBF24" },
      { name: "Hugo Blum", initials: "HB", avatarColor: "#0EA5E9" },
      { name: "Ida König", initials: "IK", avatarColor: "#F97316" }
    ]
  });

  const allEmployees = await prisma.employee.findMany();

  // Standard-Wochenplan: alle Mo–Fr anwesend
  for (const emp of allEmployees) {
    await prisma.workSchedule.create({
      data: {
        employeeId: emp.id,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true
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

  // Desk-Zonen A–D im 12x12 Grid
  const desks = await prisma.desk.createMany({
    data: [
      // Zone A: zwei übereinanderliegende grosse Tische
      { label: "A1", gridX: 1, gridY: 1, gridW: 4, gridH: 2, rotation: 0 },
      { label: "A2", gridX: 1, gridY: 3, gridW: 4, gridH: 2, rotation: 0 },
      // Zone B: grosser Tisch unterhalb Zone A
      { label: "B1", gridX: 1, gridY: 7, gridW: 4, gridH: 2, rotation: 0 },
      // Zone C: Cluster (vertikal + zwei horizontale)
      { label: "C1", gridX: 8, gridY: 1, gridW: 2, gridH: 4, rotation: 90 },
      { label: "C2", gridX: 10, gridY: 1, gridW: 3, gridH: 2, rotation: 0 },
      { label: "C3", gridX: 10, gridY: 3, gridW: 3, gridH: 2, rotation: 0 },
      // Zone D: breiter Meeting-Tisch unten rechts
      { label: "D1", gridX: 8, gridY: 8, gridW: 5, gridH: 3, rotation: 0 }
    ]
  });

  const allDesks = await prisma.desk.findMany();

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

