-- CreateTable
CREATE TABLE "public"."Game" (
    "gameId" TEXT NOT NULL,
    "gameDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "homeId" INTEGER NOT NULL,
    "homeAbbr" TEXT NOT NULL,
    "homeName" TEXT NOT NULL,
    "homeRuns" INTEGER,
    "awayId" INTEGER NOT NULL,
    "awayAbbr" TEXT NOT NULL,
    "awayName" TEXT NOT NULL,
    "awayRuns" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("gameId")
);

-- CreateTable
CREATE TABLE "public"."FavoriteTeam" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteTeam_teamId_key" ON "public"."FavoriteTeam"("teamId");
