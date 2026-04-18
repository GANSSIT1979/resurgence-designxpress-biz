"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { FormEvent } from "react";

const showDemoAccess = process.env.NODE_ENV !== "production";

const demoAccounts = [
  { role: "Admin", area: "System control", email: "admin@resurgence.local", password: "Admin123!" },
  { role: "Cashier", area: "Finance desk", email: "cashier@resurgence.local", password: "Cashier123!" },
  { role: "Sponsor", area: "Sponsor portal", email: "sponsor@resurgence.local", password: "Sponsor123!" },
  { role: "Staff", area: "Operations desk", email: "staff@resurgence.local", password: "Staff123!" },
  { role: "Partner", area: "Partner workspace", email: "partner@resurgence.local", password: "Partner123!" },
  { role: "Creator", area: "Creator dashboard", email: "jake.anilao@resurgence.local", password: "Jake@2026Resurgence!" },
] as const;

const roleDestinations = [
  { role: "Admin", href: "/admin", description: "Users, CMS, sponsors, shop, reports, and settings" },
  { role: "Cashier", href: "/cashier", description: "Invoices, receipts, transactions, and finance reports" },
  { role: "Sponsor", href: "/sponsor/dashboard", description: "Applications, deliverables, billing, and profile records" },
  { role: "Staff", href: "/staff", description: "Inquiries, tasks, schedules, and announcements" },
  { role: "Partner", href: "/partner", description: "Campaigns, referrals, agreements, and partner profile" },
  { role: "Creator", href: "/creator/dashboard", description: "Profile completeness, social reach, content, and public creator links" },
] as const;

type DemoAccount = (typeof demoAccounts)[number];

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageShell />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawNext = searchParams.get("next") || "";
  const nextTarget = rawNext.startsWith("/") ? rawNext : "";
  const defaultDemo = demoAccounts[0];

  const [email, setEmail] = useState(showDemoAccess ? defaultDemo.email : "");
  const [password, setPassword] = useState(showDemoAccess ? defaultDemo.password : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          next: nextTarget || undefined,
        }),
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : null;

      if (!res.ok || !json?.ok) {
        setError(json?.error || "Unable to login.");
        return;
      }

      router.replace(json.redirectTo || "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LoginPageShell
      email={email}
      error={error}
      loading={loading}
      nextTarget={nextTarget}
      onSubmit={submit}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
    />
  );
}

type LoginPageShellProps = {
  email?: string;
  error?: string;
  loading?: boolean;
  nextTarget?: string;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  password?: string;
  setEmail?: (value: string) => void;
  setPassword?: (value: string) => void;
};

function LoginPageShell({
  email = "",
  error = "",
  loading = false,
  nextTarget = "",
  onSubmit,
  password = "",
  setEmail,
  setPassword,
}: LoginPageShellProps = {}) {
  const [showPassword, setShowPassword] = useState(false);
  const canEdit = Boolean(onSubmit && setEmail && setPassword);
  const canUseDemoAccounts = showDemoAccess && canEdit;

  function useDemoAccount(account: DemoAccount) {
    setEmail?.(account.email);
    setPassword?.(account.password);
  }

  return (
    <div className="login-page-shell">
      <div className="container">
        <div className="login-grid">
          <section className="login-brand-panel" aria-labelledby="login-title">
            <div className="login-brand-content">
              <div className="login-brand-topline">
                <div className="login-brand-mark">
                  <img src="/assets/resurgence-logo.jpg" alt="RESURGENCE logo" />
                </div>
                <div>
                  <div className="brand-name">RESURGENCE</div>
                  <div className="brand-subtitle">Powered by DesignXpress</div>
                </div>
              </div>

              <div>
                <div className="badge">Secure Platform Access</div>
                <h1 id="login-title" className="login-title">
                  One gateway for sponsorship, commerce, and operations.
                </h1>
                <p className="login-copy">
                  Sign in with your assigned account to open the right dashboard for your role. The platform will route admin, cashier, sponsor, staff, partner, and creator users automatically after authentication.
                </p>
              </div>
            </div>

            <div className="login-metric-row" aria-label="Access highlights">
              <div className="login-metric-card">
                <strong>6</strong>
                <span>Role workspaces</span>
              </div>
              <div className="login-metric-card">
                <strong>7d</strong>
                <span>Secure session</span>
              </div>
              <div className="login-metric-card">
                <strong>RBAC</strong>
                <span>Protected access</span>
              </div>
            </div>

            <div className="login-route-card">
              <div className="section-kicker">Assigned Dashboards</div>
              <div className="login-role-list">
                {roleDestinations.map((item) => (
                  <div className="login-role-row" key={item.role}>
                    <div>
                      <strong>{item.role}</strong>
                      <p>{item.description}</p>
                    </div>
                    <code>{item.href}</code>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="login-card" aria-label="Login form">
            <div className="login-card-header">
              <div className="section-kicker">Log-in</div>
              <h2>Open your workspace</h2>
              <p>
                Use the credentials issued by the platform administrator. Your account role controls which tools and records become available after sign-in.
              </p>
            </div>

            <div className="login-redirect-note">
              <strong>Destination</strong>
              <span>{nextTarget || "Your assigned dashboard after login"}</span>
            </div>

            <form className="login-form" onSubmit={onSubmit}>
              <div className="login-field">
                <label className="label" htmlFor="email">Email address</label>
                <input
                  className="input"
                  id="email"
                  type="email"
                  autoComplete="email"
                  readOnly={!setEmail}
                  value={email}
                  onChange={(e) => setEmail?.(e.target.value)}
                  required
                />
              </div>

              <div className="login-field">
                <label className="label" htmlFor="password">Password</label>
                <div className="login-password-wrap">
                  <input
                    className="input"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    readOnly={!setPassword}
                    value={password}
                    onChange={(e) => setPassword?.(e.target.value)}
                    required
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {error ? <div className="notice error">{error}</div> : null}

              <button className="btn login-submit" type="submit" disabled={!onSubmit || loading}>
                {loading ? "Signing in..." : "Log-in securely"}
              </button>
            </form>

            {canUseDemoAccounts ? (
              <div className="login-demo-card">
                <div>
                  <div className="section-kicker">Development Demo Access</div>
                  <p className="helper">
                    Quick-fill seeded local credentials. Production builds hide this helper automatically.
                  </p>
                </div>
                <div className="login-demo-grid">
                  {demoAccounts.map((account) => (
                    <button
                      className="login-demo-button"
                      key={account.email}
                      type="button"
                      onClick={() => useDemoAccount(account)}
                    >
                      <strong>{account.role}</strong>
                      <span>{account.area}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="login-demo-card login-demo-card-muted">
                <div className="section-kicker">Access Help</div>
                <p className="helper">
                  If you do not have credentials yet, contact the platform administrator or partnership support team.
                </p>
              </div>
            )}

            <div className="login-support-row">
              <Link href="/" className="button-link btn-secondary">
                Back to homepage
              </Link>
              <Link href="/contact" className="button-link btn-secondary">
                Contact support
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
