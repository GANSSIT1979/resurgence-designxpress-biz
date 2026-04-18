'use client';

import { useMemo, useState } from 'react';

type StaffTaskItem = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  completedAt: string | null;
  inquiryId: string | null;
  sponsorSubmissionId: string | null;
  inquiry?: { id: string; name: string; organization: string | null; inquiryType: string } | null;
  sponsorSubmission?: { id: string; companyName: string; interestedPackage: string } | null;
};

type Option = { id: string; label: string };

const initialState = {
  title: '',
  description: '',
  priority: 'NORMAL',
  status: 'TODO',
  dueDate: '',
  inquiryId: '',
  sponsorSubmissionId: '',
};

export function StaffTaskManager({
  initialItems,
  inquiryOptions,
  submissionOptions,
}: {
  initialItems: StaffTaskItem[];
  inquiryOptions: Option[];
  submissionOptions: Option[];
}) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.title, item.priority, item.status, item.inquiry?.name ?? '', item.sponsorSubmission?.companyName ?? '']
      .some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: StaffTaskItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description || '',
      priority: item.priority,
      status: item.status,
      dueDate: item.dueDate ? item.dueDate.slice(0, 10) : '',
      inquiryId: item.inquiryId || '',
      sponsorSubmissionId: item.sponsorSubmissionId || '',
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/staff/tasks/${editingId}` : '/api/staff/tasks', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save task.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Task updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Task created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/staff/tasks/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete task.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Task deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Task Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Task' : 'Create Task'}</h2>
        <p className="helper">Track internal follow-ups, sponsor coordination work, and inquiry-linked tasks from one workspace.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="textarea" placeholder="Task description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <select className="input" value={form.inquiryId} onChange={(e) => setForm({ ...form, inquiryId: e.target.value })}>
            <option value="">Link inquiry (optional)</option>
            {inquiryOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <select className="input" value={form.sponsorSubmissionId} onChange={(e) => setForm({ ...form, sponsorSubmissionId: e.target.value })}>
            <option value="">Link sponsor application (optional)</option>
            {submissionOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Task' : 'Create Task'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Task Register</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search task, priority, status, inquiry, or sponsor" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="helper">{item.priority.replaceAll('_', ' ')}</div>
                    {item.inquiry ? <div className="helper">Inquiry: {item.inquiry.name}</div> : null}
                    {item.sponsorSubmission ? <div className="helper">Sponsor: {item.sponsorSubmission.companyName}</div> : null}
                  </td>
                  <td>{item.status.replaceAll('_', ' ')}</td>
                  <td>{item.dueDate ? item.dueDate.slice(0, 10) : '—'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No tasks found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
