"use client";

import { useState } from "react";

export function PublicContactForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    setLoading(true);
    setDone("");
    setError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        setError(json?.error || "Unable to submit inquiry");
        return;
      }

      setDone("Inquiry submitted successfully.");
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to submit inquiry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="form-card">
      <input name="name" placeholder="Full name" required />
      <input name="email" type="email" placeholder="Email address" required />
      <input name="phone" placeholder="Phone number" />
      <input name="company" placeholder="Company / organization" />
      <input name="subject" placeholder="Subject" required />
      <textarea name="message" placeholder="Tell us what you need" rows={5} required />
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Inquiry"}
      </button>
      {done ? <div className="success-text">{done}</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
    </form>
  );
}
