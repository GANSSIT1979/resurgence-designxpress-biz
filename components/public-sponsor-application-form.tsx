"use client";

import { useState } from "react";

export function PublicSponsorApplicationForm() {
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
      const res = await fetch("/api/sponsor-applications", {
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
        setError(json?.error || "Unable to submit application");
        return;
      }

      setDone("Sponsor application submitted successfully.");
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to submit application");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="form-card">
      <input name="sponsorName" placeholder="Sponsor name" required />
      <input name="contactName" placeholder="Contact person" required />
      <input name="email" type="email" placeholder="Email address" required />
      <input name="phone" placeholder="Phone number" />
      <input name="company" placeholder="Company" />
      <input name="packageInterest" placeholder="Package interest" required />
      <textarea name="message" placeholder="Campaign objectives and requirements" rows={5} required />
      <button className="button" type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Sponsor Application"}
      </button>
      {done ? <div className="success-text">{done}</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
    </form>
  );
}
