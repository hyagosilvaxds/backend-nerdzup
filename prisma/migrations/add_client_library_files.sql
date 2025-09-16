-- CreateEnum for ClientFileType
CREATE TYPE "ClientFileType" AS ENUM ('REFERENCE', 'BRAND_ASSET', 'DOCUMENT', 'OTHER');

-- CreateTable for ClientLibraryFile
CREATE TABLE "client_library_files" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" "ClientFileType" NOT NULL DEFAULT 'OTHER',
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_library_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "client_library_files" ADD CONSTRAINT "client_library_files_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey  
ALTER TABLE "client_library_files" ADD CONSTRAINT "client_library_files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;