"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();

  const nextTarget = useMemo(() => {
    const raw = searchParams.get("next");
    return raw && raw.startsWith("/") ? raw : "";
  }, [searchParams]);

  const [email, setEmail] = useState("sponsor@resurgence.local");
  const [password, setPassword] = useState("Sponsor123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

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

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error || "Unable to login.");
        setLoading(false);
        return;
      }

      window.location.assign(json.redirectTo || "/");
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="container" style={{ display: "grid", placeItems: "center" }}>
        <div className="card" style={{ width: "min(100%, 480px)" }}>
          <div className="eyebrow">Secure Access</div>
          <h1 style={{ marginTop: 0 }}>Login</h1>
          <p className="muted">
            Sign in to open your assigned RESURGENCE dashboard.
          </p>

          <form className="form-card" onSubmit={submit}>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error ? <div className="error-text">{error}</div> : null}

            <button className="button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="site-section-stack" style={{ marginTop: 16 }}>
            <div className="muted">
              Demo users are seeded. See the README for credentials.
            </div>
            <div className="muted">
              After login you will continue to: <code>{nextTarget || "/dashboard by role"}</code>
            </div>
            <div className="inline-actions">
              <Link href="/" className="button button-secondary button-small">
                Back to homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
