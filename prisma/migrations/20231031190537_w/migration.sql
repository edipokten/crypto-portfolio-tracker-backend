-- DropForeignKey
ALTER TABLE "StandardDeviation" DROP CONSTRAINT "StandardDeviation_priceId_fkey";

-- AddForeignKey
ALTER TABLE "StandardDeviation" ADD CONSTRAINT "StandardDeviation_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "PriceHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
