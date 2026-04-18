import { CashierTransactionKind, InvoiceStatus, PaymentMethod } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { generateDocumentNumber, syncInvoiceBalance } from '@/lib/cashier-server';

export function serializeInvoice(item: any) {
  return {
    ...item,
    issueDate: item.issueDate.toISOString(),
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    createdAt: item.createdAt?.toISOString?.() ?? undefined,
    updatedAt: item.updatedAt?.toISOString?.() ?? undefined,
  };
}

export function serializeTransaction(item: any) {
  return {
    ...item,
    transactionDate: item.transactionDate.toISOString(),
    createdAt: item.createdAt?.toISOString?.() ?? undefined,
    updatedAt: item.updatedAt?.toISOString?.() ?? undefined,
  };
}

export function serializeReceipt(item: any) {
  return {
    ...item,
    issuedAt: item.issuedAt.toISOString(),
    createdAt: item.createdAt?.toISOString?.() ?? undefined,
    updatedAt: item.updatedAt?.toISOString?.() ?? undefined,
  };
}

export async function buildInvoicePayload(parsed: any) {
  const invoiceNumber = parsed.invoiceNumber?.trim() || (await generateDocumentNumber('INV'));
  return {
    invoiceNumber,
    companyName: parsed.companyName,
    contactName: parsed.contactName || null,
    email: parsed.email || null,
    tier: parsed.tier || null,
    description: parsed.description,
    amount: parsed.amount,
    balanceAmount: typeof parsed.balanceAmount === 'number' ? parsed.balanceAmount : parsed.amount,
    status: parsed.status as InvoiceStatus,
    issueDate: new Date(parsed.issueDate),
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
    notes: parsed.notes || null,
    sponsorId: parsed.sponsorId || null,
  };
}

export async function buildTransactionPayload(parsed: any) {
  const transactionNumber = parsed.transactionNumber?.trim() || (await generateDocumentNumber('TXN'));
  const invoice = parsed.invoiceId
    ? await prisma.invoice.findUnique({ where: { id: parsed.invoiceId } })
    : null;

  if (parsed.invoiceId && !invoice) {
    throw new Error('Linked invoice not found.');
  }

  return {
    transactionNumber,
    invoiceId: parsed.invoiceId || null,
    companyName: invoice?.companyName || parsed.companyName,
    description: parsed.description,
    amount: parsed.amount,
    kind: parsed.kind as CashierTransactionKind,
    paymentMethod: parsed.paymentMethod as PaymentMethod,
    referenceNumber: parsed.referenceNumber || null,
    transactionDate: new Date(parsed.transactionDate),
    notes: parsed.notes || null,
  };
}

export async function buildReceiptPayload(parsed: any) {
  const receiptNumber = parsed.receiptNumber?.trim() || (await generateDocumentNumber('OR'));
  const transaction = parsed.transactionId
    ? await prisma.cashierTransaction.findUnique({ where: { id: parsed.transactionId } })
    : null;
  const invoiceId = parsed.invoiceId || transaction?.invoiceId || null;
  const invoice = invoiceId ? await prisma.invoice.findUnique({ where: { id: invoiceId } }) : null;

  if (parsed.transactionId && !transaction) {
    throw new Error('Linked transaction not found.');
  }
  if (invoiceId && !invoice) {
    throw new Error('Linked invoice not found.');
  }
  if (transaction?.invoiceId && invoiceId && transaction.invoiceId !== invoiceId) {
    throw new Error('Receipt invoice does not match the linked transaction invoice.');
  }

  return {
    receiptNumber,
    invoiceId,
    transactionId: parsed.transactionId || null,
    companyName: invoice?.companyName || transaction?.companyName || parsed.companyName,
    receivedFrom: parsed.receivedFrom,
    amount: transaction?.amount || parsed.amount,
    paymentMethod: (transaction?.paymentMethod || parsed.paymentMethod) as PaymentMethod,
    issuedAt: new Date(parsed.issuedAt),
    notes: parsed.notes || null,
  };
}

export async function syncLinkedInvoice(invoiceId: string | null | undefined) {
  if (!invoiceId) return null;
  return syncInvoiceBalance(invoiceId);
}
