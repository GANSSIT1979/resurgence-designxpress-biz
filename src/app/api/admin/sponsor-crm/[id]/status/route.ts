import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { SponsorSubmissionStatus } from '@prisma/client';

const allowedStatuses: readonly SponsorSubmissionStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_REVISION',
  'APPROVED',
  'REJECTED',
  'CONVERTED_TO_ACTIVE_SPONSOR',
];

function isSponsorSubmissionStatus(status: string): status is SponsorSubmissionStatus {
  return allowedStatuses.includes(status as SponsorSubmissionStatus);
}

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';

  if (!isSponsorSubmissionStatus(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  if (!hasUsableDatabaseUrl()) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
  }

  try {
    await prisma.sponsorSubmission.update({
      where: { id },
      data: { status },
    });

    return NextResponse.redirect(new URL('/admin/sponsor-crm', req.url));
  } catch (error) {
    console.error('[admin-sponsor-crm] Failed to update sponsor status.', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
