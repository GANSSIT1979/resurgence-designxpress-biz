-- CreatorPayoutRequest database support.
-- Safe for existing PostgreSQL/Supabase databases.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CreatorPayoutRequestStatus') THEN
    CREATE TYPE "CreatorPayoutRequestStatus" AS ENUM (
      'PENDING',
      'APPROVED',
      'REJECTED',
      'PROCESSING',
      'PAID',
      'FAILED',
      'CANCELLED'
    );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "CreatorPayoutRequest" (
  "id" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "requestedAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "approvedAmount" DECIMAL(12,2),
  "currency" TEXT NOT NULL DEFAULT 'PHP',
  "status" "CreatorPayoutRequestStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT,
  "providerAccountId" TEXT,
  "providerTransferId" TEXT,
  "referenceNumber" TEXT,
  "notes" TEXT,
  "rejectionReason" TEXT,
  "metadata" JSONB,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "processingAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "failedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreatorPayoutRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CreatorPayoutRequest_creatorId_idx"
  ON "CreatorPayoutRequest" ("creatorId");

CREATE INDEX IF NOT EXISTS "CreatorPayoutRequest_status_idx"
  ON "CreatorPayoutRequest" ("status");

CREATE INDEX IF NOT EXISTS "CreatorPayoutRequest_requestedAt_idx"
  ON "CreatorPayoutRequest" ("requestedAt");

CREATE UNIQUE INDEX IF NOT EXISTS "CreatorPayoutRequest_providerTransferId_key"
  ON "CreatorPayoutRequest" ("providerTransferId")
  WHERE "providerTransferId" IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'CreatorPayoutRequestStatus'
      AND e.enumlabel = 'REQUESTED'
  ) THEN
    ALTER TYPE "CreatorPayoutRequestStatus" ADD VALUE 'REQUESTED' BEFORE 'PENDING';
  END IF;
END
$$;

ALTER TABLE "CreatorPayoutRequest"
  ALTER COLUMN "creatorId" DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'CreatorPayoutRequestStatus'
      AND e.enumlabel = 'UNDER_REVIEW'
  ) THEN
    ALTER TYPE "CreatorPayoutRequestStatus" ADD VALUE 'UNDER_REVIEW' AFTER 'REQUESTED';
  END IF;
END
$$;
