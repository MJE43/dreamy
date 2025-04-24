/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `SpiralProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SpiralProfile_userId_key" ON "SpiralProfile"("userId");
