/*
  Warnings:

  - The primary key for the `FavoriteTeam` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `FavoriteTeam` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FavoriteTeam" (
    "teamId" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FavoriteTeam" ("createdAt", "teamId", "teamName") SELECT "createdAt", "teamId", "teamName" FROM "FavoriteTeam";
DROP TABLE "FavoriteTeam";
ALTER TABLE "new_FavoriteTeam" RENAME TO "FavoriteTeam";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
