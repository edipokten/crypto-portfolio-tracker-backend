/*
  Warnings:

  - You are about to drop the `bookmarks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "bookmarks" DROP CONSTRAINT "bookmarks_userId_fkey";

-- DropTable
DROP TABLE "bookmarks";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "Cryptocurrency" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Cryptocurrency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cryptoId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "priceInEur" TEXT NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandardDeviation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "priceId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL,
    "mean" DOUBLE PRECISION NOT NULL,
    "m2" DOUBLE PRECISION NOT NULL,
    "standardDeviation" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StandardDeviation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cryptocurrency_name_key" ON "Cryptocurrency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StandardDeviation_priceId_key" ON "StandardDeviation"("priceId");

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "PriceHistory_cryptoId_fkey" FOREIGN KEY ("cryptoId") REFERENCES "Cryptocurrency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandardDeviation" ADD CONSTRAINT "StandardDeviation_priceId_fkey" FOREIGN KEY ("priceId") REFERENCES "PriceHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
