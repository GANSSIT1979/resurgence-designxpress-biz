import { NextResponse } from 'next/server';
import { calculatePayPalInvoice } from '@/lib/invoice/paypal-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = calculatePayPalInvoice(body.items || [], {
      discount: body.discount || 0,
      shipping: body.shipping || 0,
      otherAmount: body.otherAmount || 0,
      tax: body.tax || 0,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[paypal-invoice-preview]', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
