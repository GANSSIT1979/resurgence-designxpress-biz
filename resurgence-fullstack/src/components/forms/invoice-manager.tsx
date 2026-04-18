'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatCurrency } from '@/lib/cashier';

type InvoiceItem = {
  id: string;
  invoiceNumber: string;
  companyName: string;
  contactName: string | null;
  email: string | null;
  tier: string | null;
  description: string;
  amount: number;
  balanceAmount: number;
  status: string;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  sponsorId: string | null;
};

type SponsorOption = { id: string; name: string; tier: string };

const statusOptions = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'];

const initialState = {
  invoiceNumber: '',
  companyName: '',
  contactName: '',
  email: '',
  tier: '',
  description: '',
  amount: 15000,
  balanceAmount: 15000,
  status: 'ISSUED',
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: '',
  notes: '',
  sponsorId: '',
};

export function InvoiceManager({ initialItems, sponsors }: { initialItems: InvoiceItem[]; sponsors: SponsorOption[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) =>
      [item.invoiceNumber, item.companyName, item.tier ?? '', item.status].some((value) => value.toLowerCase().includes(query)),
    );
  }, [filter, items]);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: InvoiceItem) {
    setEditingId(item.id);
    setForm({
      invoiceNumber: item.invoiceNumber,
      companyName: item.companyName,
      contactName: item.contactName ?? '',
      email: item.email ?? '',
      tier: item.tier ?? '',
      description: item.description,
      amount: item.amount,
      balanceAmount: item.balanceAmount,
      status: item.status,
      issueDate: item.issueDate.slice(0, 10),
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '',
      notes: item.notes ?? '',
      sponsorId: item.sponsorId ?? '',
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/cashier/invoices/${editingId}` : '/api/cashier/invoices', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save invoice.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Invoice updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Invoice created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/cashier/invoices/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete invoice.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Invoice deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Invoice Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Invoice' : 'Create Invoice'}</h2>
        <p className="helper">Create sponsor billing records, set due dates, and monitor balances by package tier.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Invoice number (auto if blank)" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} />
          <input className="input" placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          <input className="input" placeholder="Contact person" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
          <input className="input" placeholder="Billing email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <select className="input" value={form.sponsorId} onChange={(e) => {
            const sponsor = sponsors.find((item) => item.id === e.target.value);
            setForm({
              ...form,
              sponsorId: e.target.value,
              companyName: sponsor?.name || form.companyName,
              tier: sponsor?.tier || form.tier,
            });
          }}>
            <option value="">Link sponsor record (optional)</option>
            {sponsors.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.tier}</option>)}
          </select>
          <input className="input" placeholder="Package tier" value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })} />
          <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input className="input" type="number" min={1} placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value), balanceAmount: editingId ? form.balanceAmount : Number(e.target.value) })} required />
          <input className="input" type="number" min={0} placeholder="Balance amount" value={form.balanceAmount} onChange={(e) => setForm({ ...form, balanceAmount: Number(e.target.value) })} required />
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statusOptions.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
          </select>
          <input className="input" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} required />
          <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <textarea className="textarea" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Invoice' : 'Create Invoice'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Invoice Register</div>
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button className="btn btn-secondary" type="button" onClick={() => exportInvoices(filteredItems)}>Export Visible CSV</button>
        </div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search invoice number, company, tier, or status" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.invoiceNumber}</strong>
                    <div className="helper">{item.companyName}</div>
                    <div className="helper">{item.tier || 'Custom billing'}</div>
                  </td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{formatCurrency(item.balanceAmount)}</td>
                  <td>{item.status.replaceAll('_', ' ')}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <Link className="button-link btn-secondary" href={`/cashier/invoices/${item.id}/print`} target="_blank">Print</Link>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? (
                <tr><td colSpan={5}><span className="helper">No invoices found.</span></td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function exportInvoices(items: InvoiceItem[]) {
  const rows = [
    ['Invoice Number', 'Company', 'Tier', 'Amount', 'Balance', 'Status', 'Issue Date', 'Due Date'],
    ...items.map((item) => [
      item.invoiceNumber,
      item.companyName,
      item.tier || '',
      String(item.amount),
      String(item.balanceAmount),
      item.status,
      item.issueDate,
      item.dueDate || '',
    ]),
  ];
  downloadCsv(rows, `resurgence-invoices-${new Date().toISOString().slice(0, 10)}.csv`);
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
