/*
  Warnings:

  - You are about to drop the column `priceId` on the `StandardDeviation` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "StandardDeviation" DROP CONSTRAINT "StandardDeviation_priceId_fkey";

-- DropIndex
DROP INDEX "StandardDeviation_priceId_key";

-- AlterTable
ALTER TABLE "StandardDeviation" DROP COLUMN "priceId";
