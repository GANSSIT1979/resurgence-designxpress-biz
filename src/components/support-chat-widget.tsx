"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ChatMessage = {
  id: string;
  role: string;
  content: string;
  createdAt: string;
};

type SupportStatus = {
  chatkitReady: boolean;
  webhookReady: boolean;
  productionReady: boolean;
};

const quickActions = [
  {
    key: "sponsorships",
    label: "Sponsorships",
    starterPrompt:
      "I want to ask about RESURGENCE sponsorship packages and what brand exposure is available.",
  },
  {
    key: "events",
    label: "Events",
    starterPrompt:
      "We want to collaborate on a basketball event and need booking or activation details.",
  },
  {
    key: "custom-apparel",
    label: "Custom Apparel",
    starterPrompt:
      "We need custom jerseys or uniforms and want to ask about design, pricing, and turnaround.",
  },
  {
    key: "partnerships",
    label: "Partnerships",
    starterPrompt:
      "We want to explore a partnership with RESURGENCE and need to know the right next steps.",
  },
];

function getConversationId() {
  const key = "resurgence_conversation_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const created = window.crypto.randomUUID();
  window.localStorage.setItem(key, created);
  return created;
}

export function SupportChatWidget() {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    fullName: "",
    organization: "",
    email: "",
    mobile: "",
    summary: ""
  });
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadDone, setLeadDone] = useState("");
  const [routeLabel, setRouteLabel] = useState("General Support");
  const [supportStatus, setSupportStatus] = useState<SupportStatus>({
    chatkitReady: false,
    webhookReady: false,
    productionReady: false,
  });

  useEffect(() => {
    const id = getConversationId();
    setConversationId(id);

    let cancelled = false;

    async function load() {
      setBooting(true);
      setError("");
      try {
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: id })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Unable to load support desk.");
        if (cancelled) return;
        setMessages(json.messages || []);
        setLeadCaptured(Boolean(json.leadCaptured));
        setRouteLabel(json.routeLabel || "General Support");
        setSupportStatus({
          chatkitReady: Boolean(json.chatkitReady),
          webhookReady: Boolean(json.webhookReady),
          productionReady: Boolean(json.productionReady),
        });
        setLeadForm((current) => ({
          ...current,
          fullName: json.lead?.visitorName || current.fullName,
          organization: json.lead?.organization || current.organization,
          email: json.lead?.email || current.email,
          mobile: json.lead?.mobile || current.mobile,
          summary: json.lead?.summary || current.summary
        }));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load support desk.");
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const intro = useMemo(() => {
    if (messages.length) return null;
    return {
      id: "intro",
      role: "assistant",
      content:
        "Welcome to the RESURGENCE support desk. Ask about sponsorship packages, partnerships, basketball events, or custom uniforms.",
      createdAt: new Date().toISOString()
    } satisfies ChatMessage;
  }, [messages.length]);

  async function submitMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !conversationId) return;

    const optimisticUser: ChatMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString()
    };

    setMessages((current) => [...current, optimisticUser]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chatkit/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to send message.");

      const assistantReply: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: json.output || "",
        createdAt: new Date().toISOString()
      };

      setMessages((current) => [...current, assistantReply]);
      setLeadCaptured(Boolean(json.leadCaptured));
      setRouteLabel(json.routeLabel || "General Support");
      if (json.leadCaptured) {
        setLeadOpen(false);
      } else if (/full name|organization|email address|mobile number|follow-up/i.test(String(json.output || ""))) {
        setLeadOpen(true);
      }
    } catch (err) {
      setMessages((current) => current.filter((item) => item.id !== optimisticUser.id));
      setError(err instanceof Error ? err.message : "Unable to send message.");
      setInput(trimmed);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!conversationId) return;
    setLeadSaving(true);
    setLeadDone("");
    setError("");

    try {
      const res = await fetch("/api/chatkit/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, ...leadForm })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to save business details.");
      setLeadCaptured(true);
      setLeadOpen(false);
      setLeadDone("Your business details are on file. The RESURGENCE team can follow up from here.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save business details.");
    } finally {
      setLeadSaving(false);
    }
  }

  return (
    <div className="support-widget card">
      <div className="support-widget-head">
        <div>
          <div className="eyebrow">Live Support Desk</div>
          <div className="card-title">RESURGENCE Customer Service</div>
        </div>
        <div className="inline-actions">
          <div className={leadCaptured ? "status-pill status-success" : "status-pill"}>
            {leadCaptured ? "Lead captured" : "General inquiry mode"}
          </div>
          <div className="status-pill">{routeLabel}</div>
        </div>
      </div>

      <p className="muted">
        Ask about sponsorship packages, partnership opportunities, basketball events, custom jerseys, or merchandise.
      </p>

      <div className="inline-actions" style={{ marginBottom: 14, flexWrap: "wrap" }}>
        {quickActions.map((category) => (
          <button
            key={category.key}
            className="button button-secondary"
            type="button"
            onClick={() => setInput(category.starterPrompt)}
            disabled={loading || booting}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="muted" style={{ marginBottom: 14 }}>
        {supportStatus.productionReady
          ? "The support desk and webhook verification are configured for production use."
          : supportStatus.chatkitReady
            ? "The support desk is live. Finish webhook setup to complete signed-event verification."
            : "The support desk is loading in fallback mode. Leads can still be captured while configuration is completed."}
      </div>

      {booting ? <div className="muted">Loading support desk...</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
      {leadDone ? <div className="success-text">{leadDone}</div> : null}

      <div className="support-thread">
        {intro ? (
          <div className="chat-bubble assistant">
            <strong>RESURGENCE</strong>
            <p>{intro.content}</p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div key={message.id} className={`chat-bubble ${message.role === "user" ? "user" : "assistant"}`}>
            <strong>{message.role === "user" ? "You" : "RESURGENCE"}</strong>
            <p>{message.content || "…"}</p>
          </div>
        ))}
      </div>

      <form className="support-composer" onSubmit={submitMessage}>
        <textarea
          rows={4}
          placeholder="Type your question here"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || booting}
        />
        <div className="inline-actions">
          <button className="button" type="submit" disabled={loading || booting || !input.trim()}>
            {loading ? "Sending..." : "Send message"}
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setLeadOpen((value) => !value)}
          >
            {leadCaptured ? "View saved details" : "Share business details"}
          </button>
        </div>
      </form>

      {leadOpen ? (
        <form className="form-card support-lead-form" onSubmit={submitLead}>
          <div className="card-title">Business follow-up details</div>
          <div>
            <label>Full name</label>
            <input value={leadForm.fullName} onChange={(e) => setLeadForm((s) => ({ ...s, fullName: e.target.value }))} required />
          </div>
          <div>
            <label>Organization / team / company</label>
            <input value={leadForm.organization} onChange={(e) => setLeadForm((s) => ({ ...s, organization: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div>
              <label>Email address</label>
              <input type="email" value={leadForm.email} onChange={(e) => setLeadForm((s) => ({ ...s, email: e.target.value }))} required />
            </div>
            <div>
              <label>Mobile number</label>
              <input value={leadForm.mobile} onChange={(e) => setLeadForm((s) => ({ ...s, mobile: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label>Brief summary of what you need</label>
            <textarea rows={4} value={leadForm.summary} onChange={(e) => setLeadForm((s) => ({ ...s, summary: e.target.value }))} required />
          </div>
          <div className="inline-actions">
            <button className="button" type="submit" disabled={leadSaving}>
              {leadSaving ? "Saving..." : leadCaptured ? "Update details" : "Save details"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
