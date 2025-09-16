/*
  Warnings:

  - You are about to drop the column `address` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `company` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `clients` table. All the data in the column will be lost.
  - Added the required column `fullName` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personType` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `clients` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `state` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `zipCode` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taxDocument` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."PersonType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "public"."CompanySize" AS ENUM ('MICRO', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "public"."clients" DROP COLUMN "address",
DROP COLUMN "company",
DROP COLUMN "name",
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companySize" "public"."CompanySize",
ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'Brasil',
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "personType" "public"."PersonType" NOT NULL,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "tradeName" TEXT,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "zipCode" SET NOT NULL,
ALTER COLUMN "taxDocument" SET NOT NULL;
