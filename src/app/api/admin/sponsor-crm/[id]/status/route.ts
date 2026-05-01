import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  if (!status) {
    return NextResponse.json({ error: 'Missing status' }, { status: 400 });
  }

  try {
    await prisma.sponsorSubmission.update({
      where: { id: params.id },
      data: {
        status: status as any,
      },
    });

    return NextResponse.redirect(new URL('/admin/sponsor-crm', req.url));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
