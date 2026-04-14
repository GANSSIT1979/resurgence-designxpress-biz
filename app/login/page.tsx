import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDashboardPath(user.role));
  }

  const params = await searchParams;
  const next = params.next || "";
  const error = params.error === "invalid" ? "Invalid email or password." : "";
  const action = next ? `/api/auth/login?next=${encodeURIComponent(next)}` : "/api/auth/login";

  return (
    <div className="page-shell">
      <div className="container" style={{ maxWidth: 560 }}>
        <div className="card">
          <div className="eyebrow">Secure Access</div>
          <h1>Login</h1>
          <p className="muted" style={{ marginTop: 8 }}>
            Sign in to open your assigned RESURGENCE dashboard.
          </p>

          {error ? (
            <div
              style={{
                marginTop: 16,
                marginBottom: 8,
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(220, 38, 38, 0.15)",
                color: "#fecaca"
              }}
            >
              {error}
            </div>
          ) : null}

          <form className="form-card" method="post" action={action}>
            <input name="email" type="email" placeholder="Email" autoComplete="email" required />
            <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
            <button className="button" type="submit">
              Login
            </button>
          </form>

          <div className="muted" style={{ marginTop: 16 }}>
            Demo users are seeded. See the README for the demo credentials.
          </div>

          {next ? (
            <div className="muted" style={{ marginTop: 8 }}>
              After login you will continue to: <code>{next}</code>
            </div>
          ) : null}

          <div style={{ marginTop: 18 }}>
            <Link href="/" className="button button-secondary">
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
