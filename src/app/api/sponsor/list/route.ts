import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sponsorLeadDelegate = (prisma as any).sponsorLead;
    if (sponsorLeadDelegate?.findMany) {
      const leads = await sponsorLeadDelegate.findMany({ orderBy: { updatedAt: 'desc' }, take: 250 });
      return Response.json({ ok: true, data: leads });
    }

    const submissionDelegate = (prisma as any).sponsorSubmission;
    const submissions = submissionDelegate?.findMany
      ? await submissionDelegate.findMany({ orderBy: { updatedAt: 'desc' }, take: 250 })
      : [];

    return Response.json({
      ok: true,
      data: submissions.map((item: any) => ({
        id: item.id,
        name: item.contactName || item.companyName || 'Sponsor',
        email: item.email,
        company: item.companyName,
        amount: 0,
        stage: item.status === 'APPROVED' ? 'ACTIVE' : item.status === 'UNDER_REVIEW' ? 'NEGOTIATING' : 'LEAD',
        status: item.status,
      })),
    });
  } catch (error) {
    return Response.json({ ok: false, error: 'Unable to load sponsor leads.' }, { status: 500 });
  }
}
