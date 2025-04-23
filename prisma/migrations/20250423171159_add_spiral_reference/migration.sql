-- CreateEnum
CREATE TYPE "RefType" AS ENUM ('STAGE', 'DILEMMA');

-- CreateTable
CREATE TABLE "SpiralReference" (
    "id" TEXT NOT NULL,
    "type" "RefType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "colorHex" TEXT,

    CONSTRAINT "SpiralReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpiralReference_code_key" ON "SpiralReference"("code");

-- CreateIndex
CREATE INDEX "SpiralReference_type_code_idx" ON "SpiralReference"("type", "code");
