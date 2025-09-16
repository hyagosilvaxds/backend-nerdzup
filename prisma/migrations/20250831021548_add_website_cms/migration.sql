-- CreateTable
CREATE TABLE "public"."website_config" (
    "id" TEXT NOT NULL,
    "logoUrl" TEXT,
    "whatsapp" TEXT,
    "clientsCounter" TEXT,
    "counterText" TEXT,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroDescription" TEXT,
    "processTitle" TEXT,
    "processButtonText" TEXT,
    "processButtonLink" TEXT,
    "videoTitle" TEXT,
    "videoButtonText" TEXT,
    "videoButtonLink" TEXT,
    "videoUrl" TEXT,
    "videoPosterUrl" TEXT,
    "faqTitle" TEXT,
    "footerText" TEXT,
    "footerCopyright" TEXT,
    "instagramLink" TEXT,
    "twitterLink" TEXT,
    "facebookLink" TEXT,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "website_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."service_cards" (
    "id" TEXT NOT NULL,
    "websiteConfigId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."process_steps" (
    "id" TEXT NOT NULL,
    "websiteConfigId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "process_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."success_cases" (
    "id" TEXT NOT NULL,
    "websiteConfigId" TEXT NOT NULL,
    "personName" TEXT NOT NULL,
    "personRole" TEXT NOT NULL,
    "personPhotoUrl" TEXT NOT NULL,
    "caseImageUrl" TEXT NOT NULL,
    "caseText" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "success_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."client_logos" (
    "id" TEXT NOT NULL,
    "websiteConfigId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_logos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."faq_items" (
    "id" TEXT NOT NULL,
    "websiteConfigId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."website_config" ADD CONSTRAINT "website_config_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."service_cards" ADD CONSTRAINT "service_cards_websiteConfigId_fkey" FOREIGN KEY ("websiteConfigId") REFERENCES "public"."website_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_steps" ADD CONSTRAINT "process_steps_websiteConfigId_fkey" FOREIGN KEY ("websiteConfigId") REFERENCES "public"."website_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."success_cases" ADD CONSTRAINT "success_cases_websiteConfigId_fkey" FOREIGN KEY ("websiteConfigId") REFERENCES "public"."website_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_logos" ADD CONSTRAINT "client_logos_websiteConfigId_fkey" FOREIGN KEY ("websiteConfigId") REFERENCES "public"."website_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."faq_items" ADD CONSTRAINT "faq_items_websiteConfigId_fkey" FOREIGN KEY ("websiteConfigId") REFERENCES "public"."website_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;
