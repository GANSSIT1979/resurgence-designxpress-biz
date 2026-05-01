import { NextResponse } from 'next/server';
import { createInvoice } from '@/lib/invoice/engine';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const invoice = createInvoice({
      items: body.items || [],
      discount: body.discount || 0,
      shipping: body.shipping || 0,
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('[invoice-api] error', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
