-- CreateTable
CREATE TABLE "Dream" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "mood" INTEGER NOT NULL,
    "tags" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Dream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "dreamId" TEXT NOT NULL,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dream_userId_idx" ON "Dream"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_dreamId_key" ON "Analysis"("dreamId");

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_dreamId_fkey" FOREIGN KEY ("dreamId") REFERENCES "Dream"("id") ON DELETE CASCADE ON UPDATE CASCADE;
