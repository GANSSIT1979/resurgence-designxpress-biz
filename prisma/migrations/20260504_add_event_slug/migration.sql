-- Add eventSlug support for multi-event sponsorship CRM.
ALTER TABLE "SponsorSubmission"
ADD COLUMN IF NOT EXISTS "eventSlug" TEXT NOT NULL DEFAULT 'dayo-series-ofw-all-star';

CREATE INDEX IF NOT EXISTS "SponsorSubmission_eventSlug_status_createdAt_idx"
ON "SponsorSubmission"("eventSlug", "status", "createdAt");
