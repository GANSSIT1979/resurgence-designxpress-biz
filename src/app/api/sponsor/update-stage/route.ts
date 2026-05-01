import { prisma } from '@/lib/prisma';
import { sendAutomatedFollowUp } from '@/lib/automation/followups';

export async function POST(req: Request) {
  const { id, stage, triggerFollowUp } = await req.json();
  if (!id || !stage) return Response.json({ ok: false, error: 'Missing id or stage.' }, { status: 400 });

  try {
    const sponsorLeadDelegate = (prisma as any).sponsorLead;
    let updated: any = null;

    if (sponsorLeadDelegate?.update) {
      updated = await sponsorLeadDelegate.update({ where: { id }, data: { stage } });
    } else {
      const status = stage === 'ACTIVE' || stage === 'PAID' ? 'APPROVED' : stage === 'NEGOTIATING' ? 'UNDER_REVIEW' : 'SUBMITTED';
      updated = await (prisma as any).sponsorSubmission.update({ where: { id }, data: { status } });
    }

    if (triggerFollowUp) {
      await sendAutomatedFollowUp({
        companyName: updated.company || updated.companyName,
        customerName: updated.name || updated.contactName,
        customerEmail: updated.email,
        customerPhone: updated.phone,
        packageName: updated.packageName || updated.interestedPackage,
        amount: updated.amount || 0,
        currency: 'PHP',
        sponsorSubmissionId: id,
      });
    }

    return Response.json({ ok: true, data: updated });
  } catch (error) {
    return Response.json({ ok: false, error: 'Unable to update sponsor stage.' }, { status: 500 });
  }
}
