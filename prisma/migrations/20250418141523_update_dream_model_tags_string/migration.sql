/*
  Warnings:

  - You are about to drop the column `title` on the `Dream` table. All the data in the column will be lost.
  - Added the required column `mood` to the `Dream` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tags` to the `Dream` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dream" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "mood" INTEGER NOT NULL,
    "tags" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Dream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Dream" ("createdAt", "description", "id", "updatedAt", "userId") SELECT "createdAt", "description", "id", "updatedAt", "userId" FROM "Dream";
DROP TABLE "Dream";
ALTER TABLE "new_Dream" RENAME TO "Dream";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
