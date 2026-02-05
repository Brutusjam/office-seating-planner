-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN "guestName" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL,
    "isJoker" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Employee" ("avatarColor", "id", "initials", "name") SELECT "avatarColor", "id", "initials", "name" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
