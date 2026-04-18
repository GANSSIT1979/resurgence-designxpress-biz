'use client';

import { useMemo, useState } from 'react';

type Role = 'SYSTEM_ADMIN' | 'CASHIER' | 'SPONSOR' | 'STAFF' | 'PARTNER' | 'CREATOR';

type UserItem = {
  id: string;
  email: string;
  displayName: string;
  title: string | null;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
};

type PermissionMatrixRow = {
  area: string;
  label: string;
  roles: Record<Role, boolean>;
};

const emptyForm = {
  email: '',
  password: '',
  displayName: '',
  title: '',
  role: 'STAFF' as Role,
  isActive: true,
};

const roles: Role[] = ['SYSTEM_ADMIN', 'CASHIER', 'SPONSOR', 'STAFF', 'PARTNER', 'CREATOR'];

export function UserManager({
  initialUsers,
  permissionMatrix,
}: {
  initialUsers: UserItem[];
  permissionMatrix: PermissionMatrixRow[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((item) =>
      [item.displayName, item.email, item.role, item.title || ''].join(' ').toLowerCase().includes(q),
    );
  }, [search, users]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function hydrateForm(item: UserItem) {
    setEditingId(item.id);
    setForm({
      email: item.email,
      password: '',
      displayName: item.displayName,
      title: item.title || '',
      role: item.role,
      isActive: item.isActive,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/admin/users/${editingId}` : '/api/admin/users', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save user.');
      return;
    }

    if (editingId) {
      setUsers((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('User updated successfully.');
    } else {
      setUsers((current) => [data.item, ...current]);
      setNotice('User created successfully.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete user.');
      return;
    }

    setUsers((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('User deleted successfully.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Users and Roles</div>
        <h2 style={{ marginTop: 0 }}>Create or update system accounts</h2>
        <p className="helper">Add new users, change assigned roles, reset passwords, and disable access from one admin module. Passwords are stored as secure hashes.</p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Display name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} required />
          <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input
            className="input"
            placeholder={editingId ? 'New password (leave blank to keep current)' : 'Password'}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingId}
          />
          <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            User is active
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Save User' : 'Add New User'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Access Directory</div>
        <div className="btn-row" style={{ marginBottom: 12 }}>
          <input className="input" placeholder="Search by name, email, or role" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.displayName}</strong>
                    <div className="helper">{user.email}</div>
                    <div className="helper">{user.title || '—'}</div>
                  </td>
                  <td>{user.role}</td>
                  <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(user)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(user.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" style={{ gridColumn: '1 / -1' }}>
        <div className="section-kicker">Permission Matrix</div>
        <p className="helper">Role permissions are enforced per route and API instead of using broad dashboard prefixes only.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Area</th>
                {roles.map((role) => <th key={role}>{role.replace('SYSTEM_', '')}</th>)}
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((item) => (
                <tr key={`${item.area}-${item.label}`}>
                  <td>{item.label}</td>
                  <td>{item.area}</td>
                  {roles.map((role) => <td key={`${item.label}-${role}`}>{item.roles[role] ? 'Yes' : 'No'}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
