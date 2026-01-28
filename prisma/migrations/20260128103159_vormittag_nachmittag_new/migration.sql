/*
  Warnings:

  - You are about to drop the column `friday` on the `WorkSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `monday` on the `WorkSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `thursday` on the `WorkSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `tuesday` on the `WorkSchedule` table. All the data in the column will be lost.
  - You are about to drop the column `wednesday` on the `WorkSchedule` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "mondayMorning" BOOLEAN NOT NULL DEFAULT true,
    "mondayAfternoon" BOOLEAN NOT NULL DEFAULT true,
    "mondayNote" TEXT,
    "tuesdayMorning" BOOLEAN NOT NULL DEFAULT true,
    "tuesdayAfternoon" BOOLEAN NOT NULL DEFAULT true,
    "tuesdayNote" TEXT,
    "wednesdayMorning" BOOLEAN NOT NULL DEFAULT true,
    "wednesdayAfternoon" BOOLEAN NOT NULL DEFAULT true,
    "wednesdayNote" TEXT,
    "thursdayMorning" BOOLEAN NOT NULL DEFAULT true,
    "thursdayAfternoon" BOOLEAN NOT NULL DEFAULT true,
    "thursdayNote" TEXT,
    "fridayMorning" BOOLEAN NOT NULL DEFAULT true,
    "fridayAfternoon" BOOLEAN NOT NULL DEFAULT true,
    "fridayNote" TEXT,
    CONSTRAINT "WorkSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorkSchedule" ("employeeId", "fridayNote", "id", "mondayNote", "thursdayNote", "tuesdayNote", "wednesdayNote") SELECT "employeeId", "fridayNote", "id", "mondayNote", "thursdayNote", "tuesdayNote", "wednesdayNote" FROM "WorkSchedule";
DROP TABLE "WorkSchedule";
ALTER TABLE "new_WorkSchedule" RENAME TO "WorkSchedule";
CREATE UNIQUE INDEX "WorkSchedule_employeeId_key" ON "WorkSchedule"("employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
