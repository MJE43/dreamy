-- AlterTable
ALTER TABLE "SpiralProfile" ADD COLUMN     "includeDreams" BOOLEAN,
ADD COLUMN     "rawAnswers" JSONB,
ALTER COLUMN "stageBlend" DROP NOT NULL;
