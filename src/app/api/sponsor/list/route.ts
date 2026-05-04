import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sponsorLeadDelegate = (prisma as any).sponsorLead;

    if (sponsorLeadDelegate?.findMany) {
      const leads = await sponsorLeadDelegate.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 250,
      });

      return Response.json({
        ok: true,
        data: leads.map((item: any) => ({
          id: item.id,
          name: item.name || item.contactName || item.company || 'Sponsor',
          email: item.email || null,
          company: item.company || item.companyName || null,
          amount: Number(item.amount || 0),
          stage: item.stage || 'LEAD',
          status: item.status || item.stage || 'LEAD',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
      });
    }

    const submissionDelegate = (prisma as any).sponsorSubmission;

    const submissions = submissionDelegate?.findMany
      ? await submissionDelegate.findMany({
          orderBy: { updatedAt: 'desc' },
          take: 250,
        })
      : [];

    return Response.json({
      ok: true,
      data: submissions.map((item: any) => {
        const status = item.status || 'SUBMITTED';

        return {
          id: item.id,
          name: item.contactName || item.companyName || 'Sponsor',
          email: item.email || item.contactEmail || null,
          company: item.companyName || null,
          amount: Number(item.amount || item.packageAmount || item.sponsorAmount || 0),
          stage: mapSubmissionStatusToCrmStage(status),
          status,
          packageName: item.interestedPackage || item.packageName || null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      }),
    });
  } catch (error) {
    console.error('[sponsor-list] failed', error);

    return Response.json(
      {
        ok: false,
        error: 'Unable to load sponsor leads.',
      },
      { status: 500 },
    );
  }
}

function mapSubmissionStatusToCrmStage(status: string) {
  switch (status) {
    case 'UNDER_REVIEW':
      return 'CONTACTED';
    case 'NEEDS_REVISION':
      return 'NEGOTIATING';
    case 'APPROVED':
      return 'PAID';
    case 'CONVERTED_TO_ACTIVE_SPONSOR':
      return 'ACTIVE';
    case 'REJECTED':
      return 'REJECTED';
    case 'SUBMITTED':
    default:
      return 'LEAD';
  }
}