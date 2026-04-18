'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatCurrency, paymentMethodOptions } from '@/lib/cashier';

type ReceiptItem = {
  id: string;
  receiptNumber: string;
  invoiceId: string | null;
  transactionId: string | null;
  companyName: string;
  receivedFrom: string;
  amount: number;
  paymentMethod: string;
  issuedAt: string;
  notes: string | null;
};

type InvoiceOption = { id: string; invoiceNumber: string; companyName: string; balanceAmount: number };
type TransactionOption = { id: string; transactionNumber: string; companyName: string; amount: number; paymentMethod: string };

const initialState = {
  receiptNumber: '',
  invoiceId: '',
  transactionId: '',
  companyName: '',
  receivedFrom: '',
  amount: 0,
  paymentMethod: 'BANK_TRANSFER',
  issuedAt: new Date().toISOString().slice(0, 10),
  notes: '',
};

export function ReceiptManager({ initialItems, invoices, transactions }: { initialItems: ReceiptItem[]; invoices: InvoiceOption[]; transactions: TransactionOption[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.receiptNumber, item.companyName, item.receivedFrom, item.paymentMethod].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: ReceiptItem) {
    setEditingId(item.id);
    setForm({
      receiptNumber: item.receiptNumber,
      invoiceId: item.invoiceId ?? '',
      transactionId: item.transactionId ?? '',
      companyName: item.companyName,
      receivedFrom: item.receivedFrom,
      amount: item.amount,
      paymentMethod: item.paymentMethod,
      issuedAt: item.issuedAt.slice(0, 10),
      notes: item.notes ?? '',
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/cashier/receipts/${editingId}` : '/api/cashier/receipts', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save receipt.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Receipt updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Receipt created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/cashier/receipts/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete receipt.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Receipt deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Official Receipt Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Receipt' : 'Create Receipt'}</h2>
        <p className="helper">Generate receipt entries linked to invoice and transaction history for sponsor collections.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Receipt number (auto if blank)" value={form.receiptNumber} onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })} />
          <select className="input" value={form.invoiceId} onChange={(e) => {
            const invoice = invoices.find((item) => item.id === e.target.value);
            setForm({
              ...form,
              invoiceId: e.target.value,
              companyName: invoice?.companyName || form.companyName,
            });
          }}>
            <option value="">Link invoice (optional)</option>
            {invoices.map((item) => <option key={item.id} value={item.id}>{item.invoiceNumber} — {item.companyName}</option>)}
          </select>
          <select className="input" value={form.transactionId} onChange={(e) => {
            const transaction = transactions.find((item) => item.id === e.target.value);
            setForm({
              ...form,
              transactionId: e.target.value,
              companyName: transaction?.companyName || form.companyName,
              amount: transaction?.amount || form.amount,
              paymentMethod: transaction?.paymentMethod || form.paymentMethod,
            });
          }}>
            <option value="">Link transaction (optional)</option>
            {transactions.map((item) => <option key={item.id} value={item.id}>{item.transactionNumber} — {item.companyName} — {formatCurrency(item.amount)}</option>)}
          </select>
          <input className="input" placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          <input className="input" placeholder="Received from" value={form.receivedFrom} onChange={(e) => setForm({ ...form, receivedFrom: e.target.value })} required />
          <input className="input" type="number" min={1} placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
          <select className="input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            {paymentMethodOptions.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
          <input className="input" type="date" value={form.issuedAt} onChange={(e) => setForm({ ...form, issuedAt: e.target.value })} required />
          <textarea className="textarea" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Receipt' : 'Create Receipt'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Receipt Register</div>
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button className="btn btn-secondary" type="button" onClick={() => exportReceipts(filteredItems)}>Export Visible CSV</button>
        </div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search receipt no., company, received from, or method" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.receiptNumber}</strong>
                    <div className="helper">{item.companyName}</div>
                    <div className="helper">{item.receivedFrom}</div>
                  </td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{item.paymentMethod.replaceAll('_', ' ')}</td>
                  <td>{item.issuedAt.slice(0, 10)}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <Link className="button-link btn-secondary" href={`/cashier/receipts/${item.id}/print`} target="_blank">Print</Link>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? (
                <tr><td colSpan={5}><span className="helper">No receipts generated yet.</span></td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function exportReceipts(items: ReceiptItem[]) {
  const rows = [
    ['Receipt Number', 'Company', 'Received From', 'Amount', 'Payment Method', 'Issued At'],
    ...items.map((item) => [
      item.receiptNumber,
      item.companyName,
      item.receivedFrom,
      String(item.amount),
      item.paymentMethod,
      item.issuedAt,
    ]),
  ];
  downloadCsv(rows, `resurgence-receipts-${new Date().toISOString().slice(0, 10)}.csv`);
}

function downloadCsv(rows: string[][], filename: string) {
  const content = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}
