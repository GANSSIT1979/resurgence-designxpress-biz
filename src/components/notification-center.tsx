'use client';

import { useState } from 'react';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  level: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
};

type EmailItem = {
  id: string;
  subject: string;
  toEmail: string;
  status: string;
  eventKey: string;
  createdAt: string;
  sentAt: string | null;
  errorMessage: string | null;
};

export function NotificationCenter({
  title,
  notifications: initialNotifications,
  emails,
  degradedMessage,
}: {
  title: string;
  notifications: NotificationItem[];
  emails: EmailItem[];
  degradedMessage?: string | null;
}) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [error, setError] = useState<string | null>(null);

  async function markRead(id: string) {
    setError(null);

    const response = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Unable to update notification.');
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
  }

  return (
    <section className="card">
      <div className="section-kicker">Notifications and Automation</div>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {degradedMessage ? <div className="notice error" style={{ marginTop: 16 }}>{degradedMessage}</div> : null}
      {error ? <div className="notice error" style={{ marginTop: 16 }}>{error}</div> : null}

      <div className="card-grid grid-2" style={{ marginTop: 18 }}>
        <div className="panel-stack">
          <strong>Inbox</strong>
          {notifications.length === 0 ? (
            <div className="helper">No notifications yet.</div>
          ) : (
            notifications.map((item) => (
              <div className={`activity-item ${item.isRead ? 'is-read' : 'is-unread'}`} key={item.id}>
                <div className="activity-item-header">
                  <span className={`status-chip tone-${item.level.toLowerCase()}`}>{item.level}</span>
                  <span className="helper">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <strong>{item.title}</strong>
                <div className="helper">{item.message}</div>
                <div className="btn-row" style={{ marginTop: 10 }}>
                  {item.href ? <a className="button-link btn-secondary" href={item.href}>Open</a> : null}
                  {!item.isRead ? <button className="btn btn-secondary" type="button" onClick={() => markRead(item.id)}>Mark Read</button> : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="panel-stack">
          <strong>Email Automation</strong>
          {emails.length === 0 ? (
            <div className="helper">No automated emails queued yet.</div>
          ) : (
            emails.map((item) => (
              <div className="activity-item" key={item.id}>
                <div className="activity-item-header">
                  <span className={`status-chip tone-${mapEmailStatusTone(item.status)}`}>{item.status}</span>
                  <span className="helper">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <strong>{item.subject}</strong>
                <div className="helper">To: {item.toEmail}</div>
                <div className="helper">Event: {item.eventKey}</div>
                {item.sentAt ? <div className="helper">Sent: {new Date(item.sentAt).toLocaleString()}</div> : null}
                {item.errorMessage ? <div className="helper">{item.errorMessage}</div> : null}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function mapEmailStatusTone(status: string) {
  switch (status) {
    case 'SENT':
      return 'success';
    case 'FAILED':
      return 'danger';
    case 'SKIPPED':
      return 'warning';
    default:
      return 'neutral';
  }
}
