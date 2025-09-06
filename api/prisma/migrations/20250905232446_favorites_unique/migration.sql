/*
  Warnings:

  - The primary key for the `FavoriteTeam` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `FavoriteTeam` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FavoriteTeam" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FavoriteTeam" ("createdAt", "teamId", "teamName") SELECT "createdAt", "teamId", "teamName" FROM "FavoriteTeam";
DROP TABLE "FavoriteTeam";
ALTER TABLE "new_FavoriteTeam" RENAME TO "FavoriteTeam";
CREATE UNIQUE INDEX "FavoriteTeam_teamId_key" ON "FavoriteTeam"("teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
