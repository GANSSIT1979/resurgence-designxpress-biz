-- RESURGENCE System UI + DB Hardening Patch
-- Safe additive migration for multi-event sponsor workflows.
-- Review actual model/table names in prisma/schema.prisma before production deploy.

-- Event core table. Create only if it does not already exist.
CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "eyebrow" TEXT,
  "summary" TEXT,
  "market" TEXT,
  "organizer" TEXT,
  "scheduleLabel" TEXT DEFAULT 'Coming Soon',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");

CREATE TABLE IF NOT EXISTS "EventScheduleItem" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "date" TIMESTAMP(3),
  "time" TEXT,
  "venue" TEXT,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EventScheduleItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EventScheduleItem_eventId_idx" ON "EventScheduleItem"("eventId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'EventScheduleItem_eventId_fkey'
  ) THEN
    ALTER TABLE "EventScheduleItem"
    ADD CONSTRAINT "EventScheduleItem_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Seed canonical DAYO event if absent.
INSERT INTO "Event" ("id", "slug", "title", "eyebrow", "summary", "market", "organizer", "scheduleLabel", "isActive", "sortOrder")
VALUES (
  'dayo-series-ofw-all-star',
  'dayo-series-ofw-all-star',
  'DAYO Series OFW All-Star 2026',
  'AMMOS 2014 Hong Kong Presents',
  'Comprehensive sponsorship and team presentation for one court, one dream, and one champion.',
  'Hong Kong & Macau',
  'AMMOS 2014 Hong Kong',
  'Coming Soon',
  true,
  1
)
ON CONFLICT ("slug") DO NOTHING;

-- Add nullable eventId columns to existing sponsor workflow tables if present.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorSubmission') THEN
    ALTER TABLE "SponsorSubmission" ADD COLUMN IF NOT EXISTS "eventId" TEXT;
    CREATE INDEX IF NOT EXISTS "SponsorSubmission_eventId_idx" ON "SponsorSubmission"("eventId");
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorProposal') THEN
    ALTER TABLE "SponsorProposal" ADD COLUMN IF NOT EXISTS "eventId" TEXT;
    CREATE INDEX IF NOT EXISTS "SponsorProposal_eventId_idx" ON "SponsorProposal"("eventId");
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorPayment') THEN
    ALTER TABLE "SponsorPayment" ADD COLUMN IF NOT EXISTS "eventId" TEXT;
    CREATE INDEX IF NOT EXISTS "SponsorPayment_eventId_idx" ON "SponsorPayment"("eventId");
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorPipelineStage') THEN
    ALTER TABLE "SponsorPipelineStage" ADD COLUMN IF NOT EXISTS "eventId" TEXT;
    CREATE INDEX IF NOT EXISTS "SponsorPipelineStage_eventId_idx" ON "SponsorPipelineStage"("eventId");
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorPipelineActivity') THEN
    ALTER TABLE "SponsorPipelineActivity" ADD COLUMN IF NOT EXISTS "eventId" TEXT;
    CREATE INDEX IF NOT EXISTS "SponsorPipelineActivity_eventId_idx" ON "SponsorPipelineActivity"("eventId");
  END IF;
END $$;

-- Foreign keys for nullable eventId columns. Each block is guarded for tables that exist.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorSubmission')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'SponsorSubmission_eventId_fkey') THEN
    ALTER TABLE "SponsorSubmission" ADD CONSTRAINT "SponsorSubmission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorProposal')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'SponsorProposal_eventId_fkey') THEN
    ALTER TABLE "SponsorProposal" ADD CONSTRAINT "SponsorProposal_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorPayment')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'SponsorPayment_eventId_fkey') THEN
    ALTER TABLE "SponsorPayment" ADD CONSTRAINT "SponsorPayment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorPipelineStage')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'SponsorPipelineStage_eventId_fkey') THEN
    ALTER TABLE "SponsorPipelineStage" ADD CONSTRAINT "SponsorPipelineStage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'SponsorPipelineActivity')
     AND NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'SponsorPipelineActivity_eventId_fkey') THEN
    ALTER TABLE "SponsorPipelineActivity" ADD CONSTRAINT "SponsorPipelineActivity_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
