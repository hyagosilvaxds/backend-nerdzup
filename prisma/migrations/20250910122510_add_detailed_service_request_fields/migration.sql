/*
  Warnings:

  - Added the required column `projectName` to the `service_requests` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `service_requests` required. This step will fail if there are existing NULL values in that column.

*/

-- Update existing records with default values first
UPDATE "public"."service_requests" SET "description" = 'Legacy service request' WHERE "description" IS NULL;

-- AlterTable
ALTER TABLE "public"."service_requests" ADD COLUMN     "brandGuidelines" TEXT,
ADD COLUMN     "desiredDeadline" TIMESTAMP(3),
ADD COLUMN     "documentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "observations" TEXT,
ADD COLUMN     "preferredColors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "projectName" TEXT DEFAULT 'Legacy Project',
ADD COLUMN     "projectObjectives" TEXT,
ADD COLUMN     "references" TEXT,
ADD COLUMN     "targetAudience" TEXT,
ADD COLUMN     "technicalRequirements" TEXT,
ALTER COLUMN "description" SET NOT NULL;

-- Remove default from projectName after adding it to existing records
ALTER TABLE "public"."service_requests" ALTER COLUMN "projectName" DROP DEFAULT;
