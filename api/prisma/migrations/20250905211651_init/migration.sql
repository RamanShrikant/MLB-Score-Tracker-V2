-- CreateTable
CREATE TABLE "Game" (
    "gameId" TEXT NOT NULL PRIMARY KEY,
    "gameDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "homeId" INTEGER NOT NULL,
    "homeAbbr" TEXT NOT NULL,
    "homeName" TEXT NOT NULL,
    "homeRuns" INTEGER,
    "awayId" INTEGER NOT NULL,
    "awayAbbr" TEXT NOT NULL,
    "awayName" TEXT NOT NULL,
    "awayRuns" INTEGER,
    "updatedAt" DATETIME NOT NULL
);
