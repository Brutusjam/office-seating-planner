-- CreateTable
CREATE TABLE "Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "avatarColor" TEXT NOT NULL,
    "preferences" TEXT
);

-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "monday" BOOLEAN NOT NULL DEFAULT true,
    "mondayNote" TEXT,
    "tuesday" BOOLEAN NOT NULL DEFAULT true,
    "tuesdayNote" TEXT,
    "wednesday" BOOLEAN NOT NULL DEFAULT true,
    "wednesdayNote" TEXT,
    "thursday" BOOLEAN NOT NULL DEFAULT true,
    "thursdayNote" TEXT,
    "friday" BOOLEAN NOT NULL DEFAULT true,
    "fridayNote" TEXT,
    CONSTRAINT "WorkSchedule_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Absence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "reason" TEXT NOT NULL,
    CONSTRAINT "Absence_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Desk" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "gridX" INTEGER NOT NULL,
    "gridY" INTEGER NOT NULL,
    "gridW" INTEGER NOT NULL,
    "gridH" INTEGER NOT NULL,
    "rotation" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "slot" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "deskId" INTEGER NOT NULL,
    CONSTRAINT "Assignment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Assignment_deskId_fkey" FOREIGN KEY ("deskId") REFERENCES "Desk" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkSchedule_employeeId_key" ON "WorkSchedule"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_date_slot_employeeId_key" ON "Assignment"("date", "slot", "employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_date_slot_deskId_key" ON "Assignment"("date", "slot", "deskId");
