"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { publicSignupRoleCards } from "@/lib/signup-roles";
import type { PublicSignupRole } from "@/lib/signup-roles";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

const showDemoAccess = process.env.NODE_ENV !== "production";
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

const demoAccounts = [
  { role: "Admin", area: "System control", email: "admin@resurgence.local" },
  { role: "Cashier", area: "Finance desk", email: "cashier@resurgence.local" },
  { role: "Sponsor", area: "Sponsor portal", email: "sponsor@resurgence.local" },
  { role: "Staff", area: "Operations desk", email: "staff@resurgence.local" },
  { role: "Partner", area: "Partner workspace", email: "partner@resurgence.local" },
  { role: "Creator", area: "Creator dashboard", email: "jake.anilao@resurgence.local" },
] as const;

const accessHighlights = [
  "Free membership registration",
  "Gmail or mobile signup",
  "Role-based dashboards",
  "Sports community access",
] as const;

type DemoAccount = (typeof demoAccounts)[number];
type AuthMode = "login" | "signup";
type SignupMethod = "google" | "mobile";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginGatewayShell />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next") || "";
  const nextTarget = rawNext.startsWith("/") ? rawNext : "";

  return <LoginGatewayShell nextTarget={nextTarget} onRedirect={(href) => {
    router.replace(href);
    router.refresh();
  }} />;
}

function LoginGatewayShell({
  nextTarget = "",
  onRedirect,
}: {
  nextTarget?: string;
  onRedirect?: (href: string) => void;
}) {
  const defaultDemo = demoAccounts[0];
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<AuthMode>("login");
  const [signupMethod, setSignupMethod] = useState<SignupMethod>("google");
  const [selectedRole, setSelectedRole] = useState<PublicSignupRole>("MEMBER");
  const [identifier, setIdentifier] = useState(showDemoAccess ? defaultDemo.email : "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mobilePassword, setMobilePassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ title: string; message: string; redirectTo: string } | null>(null);

  const canEdit = Boolean(onRedirect);
  const canUseDemoAccounts = showDemoAccess && canEdit;
  const activeRole = publicSignupRoleCards.find((item) => item.role === selectedRole) || publicSignupRoleCards[0];

  useEffect(() => {
    const shouldRenderGoogleButton = mode === "login" || signupMethod === "google";
    if (!shouldRenderGoogleButton || !googleClientId || !googleButtonRef.current) return;

    let cancelled = false;

    function renderGoogleButton() {
      if (cancelled || !window.google || !googleButtonRef.current) return;
      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) {
            setError("Google did not return a credential. Please try again.");
            return;
          }
          await continueWithGoogle(response.credential, mode === "login" ? "login" : "signup");
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: 340,
      });
    }

    if (window.google) {
      renderGoogleButton();
      return () => {
        cancelled = true;
      };
    }

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener("load", renderGoogleButton, { once: true });
      return () => {
        cancelled = true;
        existing.removeEventListener("load", renderGoogleButton);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderGoogleButton, { once: true });
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      script.removeEventListener("load", renderGoogleButton);
    };
  }, [mode, signupMethod, selectedRole, termsAccepted, referralCode]);

  function useDemoAccount(account: DemoAccount) {
    setIdentifier(account.email);
  }

  function showSuccess(title: string, message: string, redirectTo: string) {
    setSuccess({ title, message, redirectTo });
    window.setTimeout(() => onRedirect?.(redirectTo), 1200);
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          password,
          next: nextTarget || undefined,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error || "Unable to login.");
        return;
      }

      onRedirect?.(json.redirectTo || nextTarget || "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  }

  async function continueWithGoogle(credential: string, intent: "login" | "signup") {
    if (intent === "signup" && !termsAccepted) {
      setError("Please accept the terms and privacy notice before continuing.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential,
          intent,
          ...(intent === "signup"
            ? {
                role: selectedRole,
                referralCode,
                termsAccepted,
              }
            : {}),
        }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error || (intent === "login" ? "Unable to sign in with Google." : "Unable to continue with Google."));
        return;
      }

      if (intent === "login") {
        onRedirect?.(json.redirectTo || nextTarget || "/");
        return;
      }

      showSuccess("Account ready", `Welcome to Resurgence as ${activeRole.title}. Redirecting now.`, json.redirectTo || "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : intent === "login" ? "Unable to sign in with Google." : "Unable to continue with Google.");
    } finally {
      setLoading(false);
    }
  }

  async function requestMobileOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setDemoOtp("");

    try {
      const res = await fetch("/api/auth/mobile/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          displayName,
          password: mobilePassword,
          role: selectedRole,
          referralCode,
          termsAccepted,
        }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error || "Unable to send OTP.");
        return;
      }

      setOtpSent(true);
      setDemoOtp(json.demoCode || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyMobileOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/mobile/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          code: otpCode,
        }),
      });
      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setError(json?.error || "Unable to verify OTP.");
        return;
      }

      showSuccess("Mobile verified", `Your free ${activeRole.title} account is active. Redirecting now.`, json.redirectTo || "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page-shell auth-gateway-shell">
      <div className="container">
        <div className="login-grid auth-gateway-grid">
          <section className="login-brand-panel auth-brand-panel" aria-labelledby="login-title">
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
                <div className="badge">Premium Sports Community Access</div>
                <h1 id="login-title" className="login-title">
                  Join the movement. Build your role. Enter the right court.
                </h1>
                <p className="login-copy">
                  Create a free account with Gmail or mobile OTP, choose your account type, and land directly in the dashboard built for your role.
                </p>
              </div>
            </div>

            <div className="login-metric-row auth-highlight-grid" aria-label="Access highlights">
              {accessHighlights.map((item) => (
                <div className="login-metric-card auth-highlight-card" key={item}>
                  <strong>{item.split(" ")[0]}</strong>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="login-route-card auth-role-preview">
              <div className="section-kicker">Free Membership</div>
              <h2>Every account starts free.</h2>
              <p className="helper">
                Choose Regular Member, Creator, Coach, Referee, Sponsor, or Partner. You can complete your profile and upgrade your participation later.
              </p>
              <div className="auth-step-list">
                <span>1. Choose role</span>
                <span>2. Verify Gmail or mobile</span>
                <span>3. Open dashboard</span>
              </div>
            </div>
          </section>

          <section className="login-card auth-card" aria-label="Authentication panel">
            {success ? (
              <div className="auth-success-panel">
                <div className="auth-success-mark">OK</div>
                <div className="section-kicker">Registration Complete</div>
                <h2>{success.title}</h2>
                <p>{success.message}</p>
                <Link className="button-link" href={success.redirectTo}>Open dashboard now</Link>
              </div>
            ) : (
              <>
                <div className="auth-mode-tabs" role="tablist" aria-label="Login or signup">
                  <button className={mode === "login" ? "active" : ""} type="button" onClick={() => setMode("login")}>
                    Login
                  </button>
                  <button className={mode === "signup" ? "active" : ""} type="button" onClick={() => setMode("signup")}>
                    Create New Account
                  </button>
                </div>

                {mode === "login" ? (
                  <>
                    <div className="login-card-header">
                      <div className="section-kicker">Secure Log-in</div>
                      <h2>Open your workspace</h2>
                      <p>Use your email or verified mobile number with password, or continue with Gmail if your account was created through Google.</p>
                    </div>

                    <div className="login-redirect-note">
                      <strong>Destination</strong>
                      <span>{nextTarget || "Your assigned dashboard after login"}</span>
                    </div>

                    <form className="login-form" onSubmit={submitLogin}>
                      <div className="login-field">
                        <label className="label" htmlFor="identifier">Email or mobile number</label>
                        <input
                          className="input"
                          id="identifier"
                          autoComplete="username"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="name@gmail.com or 09XXXXXXXXX"
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button className="login-password-toggle" type="button" onClick={() => setShowPassword((current) => !current)}>
                            {showPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>

                      {error ? <div className="notice error">{error}</div> : null}

                      <button className="btn login-submit" type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
                      </button>
                    </form>

                    <div className="auth-provider-card" style={{ marginTop: 20 }}>
                      <div>
                        <div className="section-kicker">Gmail Login</div>
                        <h3>Continue with Google</h3>
                        <p className="helper">Use this for accounts created with Gmail. Existing Google members will be signed in directly.</p>
                      </div>
                      {!googleClientId ? (
                        <button className="btn login-submit" type="button" disabled>
                          Continue with Gmail
                        </button>
                      ) : (
                        <div className="auth-google-wrap">
                          <div ref={googleButtonRef} />
                        </div>
                      )}
                      {!googleClientId ? (
                        <div className="notice error">Google sign-in needs NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel.</div>
                      ) : (
                        <div className="helper">Password login remains available for email and mobile-number accounts with saved credentials.</div>
                      )}
                    </div>

                    {canUseDemoAccounts ? (
                      <div className="login-demo-card">
                        <div>
                          <div className="section-kicker">Development Demo Access</div>
                          <p className="helper">Quick-fill seeded local email identifiers. Enter passwords manually.</p>
                        </div>
                        <div className="login-demo-grid">
                          {demoAccounts.map((account) => (
                            <button className="login-demo-button" key={account.email} type="button" onClick={() => useDemoAccount(account)}>
                              <strong>{account.role}</strong>
                              <span>{account.area}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="login-card-header">
                      <div className="section-kicker">Free Registration</div>
                      <h2>Create your Resurgence account</h2>
                      <p>Membership registration is free. Choose your role first so the platform can build the right path for you.</p>
                    </div>

                    <div className="auth-role-grid" aria-label="Choose account type">
                      {publicSignupRoleCards.map((item) => (
                        <button
                          className={`auth-role-card ${selectedRole === item.role ? "active" : ""}`}
                          key={item.role}
                          type="button"
                          onClick={() => setSelectedRole(item.role)}
                        >
                          <span>{item.highlight}</span>
                          <strong>{item.title}</strong>
                          <small>{item.description}</small>
                        </button>
                      ))}
                    </div>

                    <div className="auth-method-tabs" aria-label="Choose signup method">
                      <button className={signupMethod === "google" ? "active" : ""} type="button" onClick={() => setSignupMethod("google")}>
                        Continue with Gmail
                      </button>
                      <button className={signupMethod === "mobile" ? "active" : ""} type="button" onClick={() => setSignupMethod("mobile")}>
                        Continue with Mobile Number
                      </button>
                    </div>

                    <div className="auth-selected-role">
                      <strong>{activeRole.title}</strong>
                      <span>{activeRole.description}</span>
                    </div>

                    <div className="auth-consent-card">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(event) => setTermsAccepted(event.target.checked)}
                      />
                      <label htmlFor="terms">
                        I agree to the platform <Link href="/terms">terms</Link> and <Link href="/privacy">privacy notice</Link>. I understand that joining as a member is free.
                      </label>
                    </div>

                    <div className="login-field">
                      <label className="label" htmlFor="referral">Referral code (optional)</label>
                      <input
                        className="input"
                        id="referral"
                        value={referralCode}
                        onChange={(event) => setReferralCode(event.target.value)}
                        placeholder="Coach, creator, sponsor, or event code"
                      />
                    </div>

                    {signupMethod === "google" ? (
                      <div className="auth-provider-card">
                        <div>
                          <div className="section-kicker">Gmail Signup</div>
                          <h3>Fast Google authentication</h3>
                          <p className="helper">Select your role, accept the free membership terms, then continue with your Gmail account.</p>
                        </div>
                        {!googleClientId ? (
                          <button className="btn login-submit" type="button" disabled>
                            Continue with Gmail
                          </button>
                        ) : (
                          <div className={termsAccepted ? "auth-google-wrap" : "auth-google-wrap disabled"}>
                            <div ref={googleButtonRef} />
                          </div>
                        )}
                        {!googleClientId ? (
                          <div className="notice error">Google sign-in needs NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel.</div>
                        ) : null}
                        {!termsAccepted ? <div className="helper">Accept the terms first to activate Gmail signup.</div> : null}
                      </div>
                    ) : (
                      <div className="auth-provider-card">
                        {!otpSent ? (
                          <form className="login-form" onSubmit={requestMobileOtp}>
                            <div>
                              <div className="section-kicker">Mobile Signup</div>
                              <h3>Verify by OTP</h3>
                              <p className="helper">We will verify your mobile number before creating the account.</p>
                            </div>
                            <div className="login-field">
                              <label className="label" htmlFor="displayName">Full name</label>
                              <input className="input" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
                            </div>
                            <div className="login-field">
                              <label className="label" htmlFor="phoneNumber">Mobile number</label>
                              <input
                                className="input"
                                id="phoneNumber"
                                inputMode="tel"
                                autoComplete="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                                required
                              />
                            </div>
                            <div className="login-field">
                              <label className="label" htmlFor="mobilePassword">Password</label>
                              <input
                                className="input"
                                id="mobilePassword"
                                type="password"
                                autoComplete="new-password"
                                value={mobilePassword}
                                onChange={(e) => setMobilePassword(e.target.value)}
                                placeholder="At least 8 characters with letters and numbers"
                                required
                              />
                            </div>
                            {error ? <div className="notice error">{error}</div> : null}
                            <button className="btn login-submit" type="submit" disabled={loading || !termsAccepted}>
                              {loading ? "Sending OTP..." : "Send OTP Verification"}
                            </button>
                          </form>
                        ) : (
                          <form className="login-form" onSubmit={verifyMobileOtp}>
                            <div>
                              <div className="section-kicker">Verification Step</div>
                              <h3>Enter your OTP code</h3>
                              <p className="helper">We sent a 6-digit code to {phoneNumber}. Codes expire after 10 minutes.</p>
                            </div>
                            {demoOtp ? (
                              <div className="notice success">
                                Demo OTP for current setup: <strong>{demoOtp}</strong>
                              </div>
                            ) : null}
                            <div className="login-field">
                              <label className="label" htmlFor="otpCode">OTP or verification code</label>
                              <input
                                className="input auth-otp-input"
                                id="otpCode"
                                inputMode="numeric"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="123456"
                                required
                              />
                            </div>
                            {error ? <div className="notice error">{error}</div> : null}
                            <div className="btn-row">
                              <button className="btn" type="submit" disabled={loading || otpCode.length !== 6}>
                                {loading ? "Verifying..." : "Verify and Create Account"}
                              </button>
                              <button className="btn btn-secondary" type="button" onClick={() => {
                                setOtpSent(false);
                                setOtpCode("");
                                setDemoOtp("");
                              }}>
                                Change number
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}

                    {error && signupMethod === "google" ? <div className="notice error">{error}</div> : null}
                  </>
                )}

                <div className="login-support-row">
                  <Link href="/" className="button-link btn-secondary">Back to homepage</Link>
                  <Link href="/contact" className="button-link btn-secondary">Contact support</Link>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
