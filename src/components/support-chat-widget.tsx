"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  createdAt: string;
  routeLabel?: string;
};

type SupportStatus = {
  chatkitReady: boolean;
  webhookReady: boolean;
  productionReady: boolean;
  missing: string[];
  supportModeLabel: string;
};

type SupportWidgetSettings = {
  brandName: string;
  companyName: string;
  contactName: string;
  contactRole: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  supportPhone: string;
  businessHours: string;
  location: string;
  currency: string;
  paymentMethods: string;
  shippingArea: string;
};

const conversationStorageKey = "resurgence_conversation_id";

const quickActions = [
  {
    key: "sponsorships",
    label: "Sponsorships",
    badge: "Brand activation",
    starterPrompt: "I want to ask about RESURGENCE sponsorship packages and what brand exposure is available.",
    summary: "Creator integrations, sponsor packages, and formal proposal routing.",
  },
  {
    key: "orders",
    label: "Orders & Shipping",
    badge: "Shop support",
    starterPrompt: "I need help with an order, delivery, product availability, or shipping question.",
    summary: "Order number, checkout, delivery coverage, and fulfillment support.",
  },
  {
    key: "payments",
    label: "Payments",
    badge: "Billing help",
    starterPrompt: "I need help with payment options, payment confirmation, or billing reference details.",
    summary: "GCash, Maya, bank transfer, card, cash, receipt, and reference guidance.",
  },
  {
    key: "events",
    label: "Events",
    badge: "Court operations",
    starterPrompt: "We want to collaborate on a basketball event and need booking or activation details.",
    summary: "League support, basketball events, venue needs, and activation handoff.",
  },
  {
    key: "custom-apparel",
    label: "Custom Apparel",
    badge: "Production",
    starterPrompt: "We need custom jerseys or uniforms and want to ask about design, pricing, and turnaround.",
    summary: "Jerseys, uniforms, apparel, quantity, sizing, design, and timeline.",
  },
  {
    key: "partnerships",
    label: "Partnerships",
    badge: "Collaboration",
    starterPrompt: "We want to explore a partnership with RESURGENCE and need to know the right next steps.",
    summary: "Media, brand, creator, community, and commercial collaboration.",
  },
];

function createId(prefix = "support") {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getConversationId() {
  const existing = window.localStorage.getItem(conversationStorageKey);
  if (existing) return existing;
  const created = createId("conversation");
  window.localStorage.setItem(conversationStorageKey, created);
  return created;
}

function messagesStorageKey(conversationId: string) {
  return `resurgence_support_messages:${conversationId}`;
}

function leadStorageKey(conversationId: string) {
  return `resurgence_support_lead:${conversationId}`;
}

function readStoredMessages(conversationId: string): ChatMessage[] {
  const raw = window.localStorage.getItem(messagesStorageKey(conversationId));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => item?.id && item?.role && typeof item.content === "string");
  } catch {
    return [];
  }
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildTranscript(messages: ChatMessage[]) {
  return messages
    .map((message) => `${message.role === "user" ? "Visitor" : "RESURGENCE"} (${formatTime(message.createdAt)}): ${message.content}`)
    .join("\n\n");
}

export function SupportChatWidget({ settings }: { settings: SupportWidgetSettings }) {
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
    summary: "",
  });
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadDone, setLeadDone] = useState("");
  const [routeLabel, setRouteLabel] = useState("General Support");
  const [copied, setCopied] = useState("");
  const [supportStatus, setSupportStatus] = useState<SupportStatus>({
    chatkitReady: false,
    webhookReady: false,
    productionReady: false,
    missing: [],
    supportModeLabel: "Checking support desk status...",
  });

  useEffect(() => {
    const id = getConversationId();
    setConversationId(id);
    setMessages(readStoredMessages(id));

    const storedLead = window.localStorage.getItem(leadStorageKey(id));
    if (storedLead) {
      try {
        const parsed = JSON.parse(storedLead);
        setLeadForm({
          fullName: parsed.fullName || "",
          organization: parsed.organization || "",
          email: parsed.email || "",
          mobile: parsed.mobile || "",
          summary: parsed.summary || "",
        });
        setLeadCaptured(Boolean(parsed.leadCaptured));
      } catch {
        window.localStorage.removeItem(leadStorageKey(id));
      }
    }

    let cancelled = false;

    async function load() {
      setBooting(true);
      setError("");
      try {
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Unable to load support desk.");
        if (cancelled) return;

        if (Array.isArray(json.messages) && json.messages.length) {
          setMessages(json.messages);
        }
        setLeadCaptured((current) => Boolean(json.leadCaptured) || current);
        setRouteLabel(json.routeLabel || "General Support");
        setSupportStatus({
          chatkitReady: Boolean(json.chatkitReady),
          webhookReady: Boolean(json.webhookReady),
          productionReady: Boolean(json.productionReady),
          missing: Array.isArray(json.missing) ? json.missing : [],
          supportModeLabel: json.supportModeLabel || "Support desk status is available.",
        });
        setLeadForm((current) => ({
          ...current,
          fullName: json.lead?.visitorName || current.fullName,
          organization: json.lead?.organization || current.organization,
          email: json.lead?.email || current.email,
          mobile: json.lead?.mobile || current.mobile,
          summary: json.lead?.summary || current.summary,
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

  useEffect(() => {
    if (!conversationId || booting) return;
    window.localStorage.setItem(messagesStorageKey(conversationId), JSON.stringify(messages.slice(-40)));
  }, [booting, conversationId, messages]);

  useEffect(() => {
    if (!conversationId) return;
    window.localStorage.setItem(leadStorageKey(conversationId), JSON.stringify({ ...leadForm, leadCaptured }));
  }, [conversationId, leadCaptured, leadForm]);

  const intro = useMemo(() => {
    if (messages.length) return null;
    return {
      id: "intro",
      role: "assistant",
      content:
        `Welcome to the ${settings.brandName} live support desk. Ask about sponsorships, shop orders, payments, events, custom apparel, or partnerships. If details need approval, our team will route you to the correct human follow-up channel.`,
      createdAt: new Date().toISOString(),
    } satisfies ChatMessage;
  }, [messages.length, settings.brandName]);

  const latestMessageTime = messages.length ? formatTime(messages[messages.length - 1].createdAt) : "New session";

  async function submitMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || !conversationId) return;
    const history = messages
      .filter((item) => item.role === "user" || item.role === "assistant")
      .map((item) => ({
        role: item.role as "user" | "assistant",
        content: item.content,
      }));

    const optimisticUser: ChatMessage = {
      id: createId("visitor"),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticUser]);
    setInput("");
    setLoading(true);
    setError("");
    setCopied("");

    try {
      const res = await fetch("/api/chatkit/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: trimmed, history }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to send message.");

      const assistantReply: ChatMessage = {
        id: createId("assistant"),
        role: "assistant",
        content: json.output || "",
        routeLabel: json.routeLabel || "General Support",
        createdAt: new Date().toISOString(),
      };

      setMessages((current) => [...current, assistantReply]);
      setLeadCaptured((current) => current || Boolean(json.leadCaptured));
      setRouteLabel(json.routeLabel || "General Support");
      if (json.requiresLeadDetails || /full name|organization|email address|mobile number|follow-up/i.test(String(json.output || ""))) {
        setLeadOpen(true);
        setLeadForm((current) => ({
          ...current,
          summary: current.summary || trimmed,
        }));
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
        body: JSON.stringify({ conversationId, category: routeLabel, ...leadForm }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Unable to save business details.");
      setLeadCaptured(true);
      setLeadOpen(false);
      setLeadDone("Your details are saved. The RESURGENCE team can follow up from the admin workflow.");
      setMessages((current) => [
        ...current,
        {
          id: createId("assistant"),
          role: "assistant",
          content: "Thank you. Your business details were captured for human follow-up.",
          routeLabel,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save business details.");
    } finally {
      setLeadSaving(false);
    }
  }

  function selectQuickAction(action: (typeof quickActions)[number]) {
    setRouteLabel(action.label);
    setInput(action.starterPrompt);
  }

  async function copyTranscript() {
    setCopied("");
    try {
      await navigator.clipboard.writeText(buildTranscript(messages));
      setCopied("Transcript copied.");
    } catch {
      setCopied("Unable to copy transcript from this browser.");
    }
  }

  function resetConversation() {
    if (conversationId) {
      window.localStorage.removeItem(messagesStorageKey(conversationId));
      window.localStorage.removeItem(leadStorageKey(conversationId));
    }

    const nextId = createId("conversation");
    window.localStorage.setItem(conversationStorageKey, nextId);
    setConversationId(nextId);
    setMessages([]);
    setInput("");
    setLeadCaptured(false);
    setLeadOpen(false);
    setLeadDone("");
    setCopied("");
    setRouteLabel("General Support");
    setLeadForm({
      fullName: "",
      organization: "",
      email: "",
      mobile: "",
      summary: "",
    });
  }

  return (
    <div className="support-desk card">
      <div className="support-desk-hero">
        <div>
          <div className="section-kicker">Live Support Desk</div>
          <h2>RESURGENCE Customer Service</h2>
          <p>
            Human-ready support with AI-assisted routing for sponsorships, orders, payments, events, apparel, and partnerships.
          </p>
        </div>
        <div className="support-desk-status">
          <span className={`status-chip ${supportStatus.chatkitReady ? "tone-success" : "tone-warning"}`}>
            {supportStatus.chatkitReady ? "AI active" : "Fallback active"}
          </span>
          <span className={`status-chip ${supportStatus.webhookReady ? "tone-success" : "tone-neutral"}`}>
            {supportStatus.webhookReady ? "Webhook ready" : "Webhook pending"}
          </span>
          <span className={`status-chip ${leadCaptured ? "tone-success" : "tone-info"}`}>
            {leadCaptured ? "Lead captured" : "Lead capture ready"}
          </span>
        </div>
      </div>

      <div className="support-desk-metrics">
        <div>
          <span>Current route</span>
          <strong>{routeLabel}</strong>
        </div>
        <div>
          <span>Business hours</span>
          <strong>{settings.businessHours}</strong>
        </div>
        <div>
          <span>Latest activity</span>
          <strong>{latestMessageTime}</strong>
        </div>
      </div>

      <div className="support-mode-card">
        <strong>{supportStatus.supportModeLabel}</strong>
        {supportStatus.missing.length ? (
          <span>Missing setup: {supportStatus.missing.join(", ")}</span>
        ) : (
          <span>Official support contacts and lead capture are available.</span>
        )}
      </div>

      <div className="support-route-grid" aria-label="Support categories">
        {quickActions.map((category) => (
          <button
            key={category.key}
            className="support-route-card"
            type="button"
            onClick={() => selectQuickAction(category)}
            disabled={loading || booting}
          >
            <span>{category.badge}</span>
            <strong>{category.label}</strong>
            <small>{category.summary}</small>
          </button>
        ))}
      </div>

      {booting ? <div className="notice">Loading support desk...</div> : null}
      {error ? <div className="notice error">{error}</div> : null}
      {leadDone ? <div className="notice success">{leadDone}</div> : null}
      {copied ? <div className="notice">{copied}</div> : null}

      <div className="support-thread" aria-live="polite">
        {intro ? (
          <div className="support-chat-bubble assistant">
            <div className="support-chat-meta">
              <strong>RESURGENCE</strong>
              <span>{formatTime(intro.createdAt)}</span>
            </div>
            <p>{intro.content}</p>
          </div>
        ) : null}

        {messages.map((message) => (
          <div key={message.id} className={`support-chat-bubble ${message.role === "user" ? "user" : "assistant"}`}>
            <div className="support-chat-meta">
              <strong>{message.role === "user" ? "You" : "RESURGENCE"}</strong>
              <span>{message.routeLabel || formatTime(message.createdAt)}</span>
            </div>
            <p>{message.content || "..."}</p>
          </div>
        ))}
      </div>

      <form className="support-composer" onSubmit={submitMessage}>
        <label className="label" htmlFor="support-message">Ask the support desk</label>
        <textarea
          className="textarea"
          id="support-message"
          rows={4}
          placeholder="Type your question. Example: I need sponsorship proposal details for a brand campaign in Tarlac."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading || booting}
        />
        <div className="support-composer-footer">
          <span>{input.trim().length}/2000 characters</span>
          <div className="btn-row">
            <button className="btn" type="submit" disabled={loading || booting || !input.trim() || input.trim().length > 2000}>
              {loading ? "Sending..." : "Send message"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setLeadOpen((value) => !value)}>
              {leadCaptured ? "View saved details" : "Share business details"}
            </button>
            <button className="btn btn-secondary" type="button" onClick={copyTranscript} disabled={!messages.length}>
              Copy transcript
            </button>
            <button className="btn btn-secondary" type="button" onClick={resetConversation}>
              New conversation
            </button>
          </div>
        </div>
      </form>

      {leadOpen ? (
        <form className="support-lead-form" onSubmit={submitLead}>
          <div>
            <div className="section-kicker">Human Follow-up</div>
            <h3>Save business details for the RESURGENCE team</h3>
            <p className="helper">
              These details create an admin inquiry and internal notification so the correct person can follow up.
            </p>
          </div>
          <div className="form-grid">
            <input className="input" placeholder="Full name" value={leadForm.fullName} onChange={(e) => setLeadForm((s) => ({ ...s, fullName: e.target.value }))} required />
            <input className="input" placeholder="Organization / team / company" value={leadForm.organization} onChange={(e) => setLeadForm((s) => ({ ...s, organization: e.target.value }))} />
            <div className="card-grid grid-2">
              <input className="input" type="email" placeholder="Email address" value={leadForm.email} onChange={(e) => setLeadForm((s) => ({ ...s, email: e.target.value }))} required />
              <input className="input" placeholder="Mobile number" value={leadForm.mobile} onChange={(e) => setLeadForm((s) => ({ ...s, mobile: e.target.value }))} required />
            </div>
            <textarea className="textarea" rows={4} placeholder="Brief summary of what you need" value={leadForm.summary} onChange={(e) => setLeadForm((s) => ({ ...s, summary: e.target.value }))} required />
          </div>
          <div className="btn-row">
            <button className="btn" type="submit" disabled={leadSaving}>
              {leadSaving ? "Saving..." : leadCaptured ? "Update details" : "Save details"}
            </button>
            <a className="button-link btn-secondary" href={`mailto:${settings.supportEmail}`}>
              Email support
            </a>
          </div>
        </form>
      ) : null}

      <div className="support-contact-strip">
        <a href={`mailto:${settings.supportEmail}`}>{settings.supportEmail}</a>
        <a href={`tel:${settings.supportPhone.replace(/[^\d+]/g, "")}`}>{settings.supportPhone}</a>
        <a href={`mailto:${settings.contactEmail}`}>{settings.contactName} - {settings.contactRole}</a>
      </div>
    </div>
  );
}
