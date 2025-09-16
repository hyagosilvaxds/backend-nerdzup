-- CreateEnum
CREATE TYPE "public"."InputType" AS ENUM ('TEXT', 'EMAIL', 'NUMBER', 'FILE', 'SELECT_2', 'SELECT_3', 'SELECT_4', 'SELECT_5', 'SELECT_6', 'TEXTAREA', 'PHONE', 'DATE');

-- CreateTable
CREATE TABLE "public"."lead_forms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "initialText" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowMultipleSubmissions" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_form_steps" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_form_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_form_inputs" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "inputKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "inputType" "public"."InputType" NOT NULL,
    "placeholder" TEXT,
    "options" TEXT[],
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "validationRegex" TEXT,
    "helpText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_form_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_submissions" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "email" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead_submission_responses" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "inputKey" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_submission_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_forms_name_key" ON "public"."lead_forms"("name");

-- CreateIndex
CREATE UNIQUE INDEX "lead_form_steps_formId_stepNumber_key" ON "public"."lead_form_steps"("formId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "lead_form_inputs_stepId_inputKey_key" ON "public"."lead_form_inputs"("stepId", "inputKey");

-- CreateIndex
CREATE UNIQUE INDEX "lead_submission_responses_submissionId_stepId_inputKey_key" ON "public"."lead_submission_responses"("submissionId", "stepId", "inputKey");

-- AddForeignKey
ALTER TABLE "public"."lead_form_steps" ADD CONSTRAINT "lead_form_steps_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."lead_forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_form_inputs" ADD CONSTRAINT "lead_form_inputs_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."lead_form_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_submissions" ADD CONSTRAINT "lead_submissions_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."lead_forms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lead_submission_responses" ADD CONSTRAINT "lead_submission_responses_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."lead_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
