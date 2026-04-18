"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type LinkedEntity = {
  id: string;
  name: string;
};

type UserItem = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  sponsorId?: string | null;
  partnerId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  sponsor?: LinkedEntity | null;
  partner?: LinkedEntity | null;
};

type OptionItem = {
  id: string;
  name: string;
};

type FormState = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  status: string;
  sponsorId: string;
  partnerId: string;
};

const EMPTY_FORM: FormState = {
  id: "",
  name: "",
  email: "",
  password: "",
  role: "STAFF",
  status: "ACTIVE",
  sponsorId: "",
  partnerId: "",
};

async function readJson(res: Response) {
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [sponsors, setSponsors] = useState<OptionItem[]>([]);
  const [partners, setPartners] = useState<OptionItem[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [activeId, setActiveId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function loadAll(preferredId?: string) {
    setLoading(true);
    setError("");

    try {
      const [usersRes, sponsorsRes, partnersRes] = await Promise.all([
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/sponsors", { cache: "no-store" }),
        fetch("/api/admin/partners", { cache: "no-store" }),
      ]);

      const [usersJson, sponsorsJson, partnersJson] = await Promise.all([
        readJson(usersRes),
        readJson(sponsorsRes),
        readJson(partnersRes),
      ]);

      if (!usersRes.ok) {
        throw new Error(usersJson?.error || "Unable to load users.");
      }

      const userItems = Array.isArray(usersJson?.items) ? usersJson.items : [];
      const sponsorItems = Array.isArray(sponsorsJson?.items) ? sponsorsJson.items : [];
      const partnerItems = Array.isArray(partnersJson?.items) ? partnersJson.items : [];

      setUsers(userItems);
      setSponsors(
        sponsorItems.map((item: any) => ({
          id: String(item.id),
          name: String(item.name || "Unnamed Sponsor"),
        })),
      );
      setPartners(
        partnerItems.map((item: any) => ({
          id: String(item.id),
          name: String(item.name || "Unnamed Partner"),
        })),
      );

      const targetId =
        preferredId ||
        activeId ||
        userItems[0]?.id ||
        "";

      if (targetId) {
        const found = userItems.find((item: UserItem) => item.id === targetId);
        if (found) {
          selectUser(found);
        } else {
          createNew();
        }
      } else {
        createNew();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load user data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function createNew() {
    setActiveId("");
    setForm(EMPTY_FORM);
    setDone("");
    setError("");
  }

  function selectUser(user: UserItem) {
    setActiveId(user.id);
    setForm({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "STAFF",
      status: user.status || "ACTIVE",
      sponsorId: user.sponsorId || "",
      partnerId: user.partnerId || "",
    });
    setDone("");
    setError("");
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveUser() {
    setSaving(true);
    setError("");
    setDone("");

    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        sponsorId: form.sponsorId || null,
        partnerId: form.partnerId || null,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      const isEdit = Boolean(form.id);
      const endpoint = isEdit ? `/api/admin/users/${form.id}` : "/api/admin/users";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await readJson(res);

      if (!res.ok) {
        throw new Error(json?.error || "Unable to save user.");
      }

      const savedId = json?.item?.id || form.id;
      setDone(isEdit ? "User updated successfully." : "User created successfully.");
      await loadAll(savedId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save user.");
    } finally {
      setSaving(false);
    }
  }

  async function removeUser() {
    if (!form.id) return;

    const confirmed = window.confirm("Delete this user account?");
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setDone("");

    try {
      const res = await fetch(`/api/admin/users/${form.id}`, {
        method: "DELETE",
      });

      const json = await readJson(res);

      if (!res.ok) {
        throw new Error(json?.error || "Unable to delete user.");
      }

      setDone("User deleted successfully.");
      createNew();
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete user.");
    } finally {
      setDeleting(false);
    }
  }

  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter((item) => item.role === "SYSTEM_ADMIN").length,
      creators: users.filter((item) => item.role === "CREATOR").length,
      active: users.filter((item) => item.status === "ACTIVE").length,
    };
  }, [users]);

  return (
    <div className="page-shell">
      <div className="container">
        <section className="dashboard-surface" style={{ marginBottom: 20 }}>
          <div className="eyebrow">Admin Users</div>
          <h1 className="dashboard-section-title">Inline user creation and role management</h1>
          <p className="dashboard-section-subtitle">
            Create, edit, save, and delete user accounts inline through the admin APIs
            without relying on server-action-only form submits.
          </p>

          <div className="inline-actions">
            <Link href="/admin" className="button button-secondary button-small">
              Back to Dashboard
            </Link>
            <button type="button" className="button button-small" onClick={createNew}>
              New User
            </button>
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={() => void loadAll(form.id || undefined)}
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="grid-4" style={{ marginBottom: 20 }}>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{stats.total}</div>
            <div className="dashboard-stat-label">Total Users</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{stats.admins}</div>
            <div className="dashboard-stat-label">Admins</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{stats.creators}</div>
            <div className="dashboard-stat-label">Creators</div>
          </div>
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-value">{stats.active}</div>
            <div className="dashboard-stat-label">Active Users</div>
          </div>
        </section>

        <div className="grid-2">
          <section className="form-section-card">
            <div className="form-section-head">
              <div className="eyebrow">Accounts</div>
              <h2 className="form-section-title">Existing users</h2>
              <p className="form-section-subtitle">
                Select a user account and update it inline using the admin user APIs.
              </p>
            </div>

            {loading ? (
              <div className="empty-state">Loading users...</div>
            ) : users.length ? (
              <div className="list-stack">
                {users.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectUser(user)}
                    className="list-item"
                    style={{
                      padding: "16px 18px",
                      alignItems: "center",
                      width: "100%",
                      textAlign: "left",
                      background: activeId === user.id ? "rgba(255,255,255,0.06)" : "transparent",
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", marginBottom: 6 }}>
                        {user.name || "Unnamed User"}
                      </strong>
                      <div className="muted">{user.email}</div>
                      <div className="muted">
                        {user.role} • {user.status}
                        {user.sponsor ? ` • Sponsor: ${user.sponsor.name}` : ""}
                        {user.partner ? ` • Partner: ${user.partner.name}` : ""}
                      </div>
                    </div>
                    <span className="button button-secondary button-small">
                      {activeId === user.id ? "Selected" : "Edit"}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-state">No user accounts found yet.</div>
            )}
          </section>

          <section className="form-section-card">
            <div className="form-section-head">
              <div className="eyebrow">Editor</div>
              <h2 className="form-section-title">
                {form.id ? "Edit user account" : "Create user account"}
              </h2>
              <p className="form-section-subtitle">
                This editor is API-driven and saves changes inline without page redirects.
              </p>
            </div>

            {done ? <div className="success-text">{done}</div> : null}
            {error ? <div className="field-error">{error}</div> : null}

            <div className="crud-form">
              <div className="form-grid">
                <div className="field-shell">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                  />
                </div>

                <div className="field-shell">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>

                <div className="field-shell">
                  <label htmlFor="password">
                    {form.id ? "New Password (optional)" : "Password"}
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                  />
                </div>

                <div className="field-shell">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={form.role}
                    onChange={(e) => updateField("role", e.target.value)}
                  >
                    <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
                    <option value="CASHIER">CASHIER</option>
                    <option value="SPONSOR">SPONSOR</option>
                    <option value="STAFF">STAFF</option>
                    <option value="PARTNER">PARTNER</option>
                    <option value="CREATOR">CREATOR</option>
                  </select>
                </div>

                <div className="field-shell">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>

                <div className="field-shell">
                  <label htmlFor="sponsorId">Linked Sponsor</label>
                  <select
                    id="sponsorId"
                    value={form.sponsorId}
                    onChange={(e) => updateField("sponsorId", e.target.value)}
                  >
                    <option value="">None</option>
                    {sponsors.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-shell">
                  <label htmlFor="partnerId">Linked Partner</label>
                  <select
                    id="partnerId"
                    value={form.partnerId}
                    onChange={(e) => updateField("partnerId", e.target.value)}
                  >
                    <option value="">None</option>
                    {partners.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions-bar form-actions-between">
                <div className="muted">
                  Email-based login, bcrypt hashing, and role-based dashboard routing.
                </div>

                <div className="inline-actions">
                  {form.id ? (
                    <button
                      type="button"
                      className="button button-secondary"
                      onClick={() => void removeUser()}
                      disabled={deleting || saving}
                    >
                      {deleting ? "Deleting..." : "Delete User"}
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="button"
                    onClick={() => void saveUser()}
                    disabled={saving || deleting}
                  >
                    {saving ? "Saving..." : form.id ? "Save User" : "Create User"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
