'use client';

import { useMemo, useState } from 'react';
import { formatCurrency, paymentMethodOptions, transactionKindOptions } from '@/lib/cashier';

type TransactionItem = {
  id: string;
  transactionNumber: string;
  invoiceId: string | null;
  companyName: string;
  description: string;
  amount: number;
  kind: string;
  paymentMethod: string;
  referenceNumber: string | null;
  transactionDate: string;
  notes: string | null;
};

type InvoiceOption = {
  id: string;
  invoiceNumber: string;
  companyName: string;
  balanceAmount: number;
  status: string;
};

const initialState = {
  transactionNumber: '',
  invoiceId: '',
  companyName: '',
  description: '',
  amount: 0,
  kind: 'COLLECTION',
  paymentMethod: 'BANK_TRANSFER',
  referenceNumber: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  notes: '',
};

export function TransactionManager({ initialItems, invoices }: { initialItems: TransactionItem[]; invoices: InvoiceOption[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.transactionNumber, item.companyName, item.kind, item.paymentMethod].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: TransactionItem) {
    setEditingId(item.id);
    setForm({
      transactionNumber: item.transactionNumber,
      invoiceId: item.invoiceId ?? '',
      companyName: item.companyName,
      description: item.description,
      amount: item.amount,
      kind: item.kind,
      paymentMethod: item.paymentMethod,
      referenceNumber: item.referenceNumber ?? '',
      transactionDate: item.transactionDate.slice(0, 10),
      notes: item.notes ?? '',
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/cashier/transactions/${editingId}` : '/api/cashier/transactions', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save transaction.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Transaction updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Transaction recorded.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/cashier/transactions/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete transaction.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Transaction deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Collections Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Transaction' : 'Record Transaction'}</h2>
        <p className="helper">Record sponsor collections, refunds, and adjustments. Linked invoice balances update automatically.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Transaction number (auto if blank)" value={form.transactionNumber} onChange={(e) => setForm({ ...form, transactionNumber: e.target.value })} />
          <select className="input" value={form.invoiceId} onChange={(e) => {
            const invoice = invoices.find((item) => item.id === e.target.value);
            setForm({
              ...form,
              invoiceId: e.target.value,
              companyName: invoice?.companyName || form.companyName,
              amount: invoice && !editingId ? invoice.balanceAmount : form.amount,
              description: invoice ? `Payment against ${invoice.invoiceNumber}` : form.description,
            });
          }}>
            <option value="">Link invoice (optional)</option>
            {invoices.map((item) => <option key={item.id} value={item.id}>{item.invoiceNumber} — {item.companyName} — Balance {formatCurrency(item.balanceAmount)}</option>)}
          </select>
          <input className="input" placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
          <textarea className="textarea" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input className="input" type="number" min={1} placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} required />
          <select className="input" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
            {transactionKindOptions.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
          <select className="input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            {paymentMethodOptions.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
          </select>
          <input className="input" placeholder="Reference number" value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} />
          <input className="input" type="date" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} required />
          <textarea className="textarea" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Transaction' : 'Record Transaction'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Transaction Ledger</div>
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <button className="btn btn-secondary" type="button" onClick={() => exportTransactions(filteredItems)}>Export Visible CSV</button>
        </div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search transaction no., company, kind, or payment method" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction</th>
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
                    <strong>{item.transactionNumber}</strong>
                    <div className="helper">{item.companyName}</div>
                    <div className="helper">{item.kind.replaceAll('_', ' ')}</div>
                  </td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{item.paymentMethod.replaceAll('_', ' ')}</td>
                  <td>{item.transactionDate.slice(0, 10)}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? (
                <tr><td colSpan={5}><span className="helper">No transactions recorded.</span></td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function exportTransactions(items: TransactionItem[]) {
  const rows = [
    ['Transaction Number', 'Company', 'Description', 'Amount', 'Kind', 'Payment Method', 'Transaction Date'],
    ...items.map((item) => [
      item.transactionNumber,
      item.companyName,
      item.description,
      String(item.amount),
      item.kind,
      item.paymentMethod,
      item.transactionDate,
    ]),
  ];
  downloadCsv(rows, `resurgence-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
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
