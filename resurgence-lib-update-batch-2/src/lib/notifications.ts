import { AnnouncementLevel, Prisma, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { isPrismaSchemaDriftError } from '@/lib/prisma-schema-health';
import { roleMeta } from '@/lib/resurgence';

type NotificationInput = {
  recipientRole?: UserRole | null;
  recipientUserId?: string | null;
  title: string;
  message: string;
  level?: AnnouncementLevel;
  href?: string | null;
  metadata?: Record<string, unknown> | null;
};

type AutomatedEmailInput = {
  recipientRole?: UserRole | null;
  recipientUserId?: string | null;
  toEmail: string;
  toName?: string | null;
  subject: string;
  bodyText: string;
  bodyHtml?: string | null;
  eventKey: string;
  relatedType?: string | null;
  relatedId?: string | null;
};

export type AutomationInbox = {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    level: AnnouncementLevel;
    href: string | null;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    readAt: string | null;
    recipientRole: UserRole | null;
    recipientUserId: string | null;
    metadataJson: string | null;
  }>;
  emails: Array<{
    id: string;
    recipientRole: UserRole | null;
    recipientUserId: string | null;
    toEmail: string;
    toName: string | null;
    subject: string;
    bodyText: string;
    bodyHtml: string | null;
    eventKey: string;
    relatedType: string | null;
    relatedId: string | null;
    status: string;
    deliveryResponse: string | null;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
    sentAt: string | null;
    lastAttemptAt: string | null;
  }>;
  degradedReason: string | null;
};

function serializeMetadata(metadata?: Record<string, unknown> | null) {
  return metadata ? JSON.stringify(metadata) : null;
}

export async function createPlatformNotification(input: NotificationInput) {
  return prisma.platformNotification.create({
    data: {
      recipientRole: input.recipientRole ?? null,
      recipientUserId: input.recipientUserId ?? null,
      title: input.title,
      message: input.message,
      level: input.level ?? 'INFO',
      href: input.href ?? null,
      metadataJson: serializeMetadata(input.metadata),
    },
  });
}

export async function createDashboardWelcomeNotification(user: {
  id: string;
  role: UserRole;
  displayName: string;
}) {
  const role = user.role as keyof typeof roleMeta;
  const meta = roleMeta[role];
  const isMember = user.role === 'MEMBER';

  return createPlatformNotification({
    recipientRole: user.role,
    recipientUserId: user.id,
    title: isMember ? 'Welcome to your member dashboard' : `Welcome to your ${meta.label.toLowerCase()} dashboard`,
    message: isMember
      ? 'Complete your profile, follow creators, and keep your community, merch, and alerts in one place.'
      : `Your ${meta.label} account is active. Open the dashboard to review your current workspace and next actions.`,
    href: meta.defaultRoute,
    level: 'INFO',
  });
}

export async function queueAutomatedEmail(input: AutomatedEmailInput) {
  const record = await prisma.automatedEmail.create({
    data: {
      recipientRole: input.recipientRole ?? null,
      recipientUserId: input.recipientUserId ?? null,
      toEmail: input.toEmail,
      toName: input.toName ?? null,
      subject: input.subject,
      bodyText: input.bodyText,
      bodyHtml: input.bodyHtml ?? null,
      eventKey: input.eventKey,
      relatedType: input.relatedType ?? null,
      relatedId: input.relatedId ?? null,
    },
  });

  return dispatchAutomatedEmail(record.id);
}

export async function createWorkflowAutomation({
  notifications = [],
  emails = [],
}: {
  notifications?: NotificationInput[];
  emails?: AutomatedEmailInput[];
}) {
  const [notificationResults, emailResults] = await Promise.all([
    Promise.all(notifications.map((item) => createPlatformNotification(item))),
    Promise.all(emails.map((item) => queueAutomatedEmail(item))),
  ]);

  return {
    notifications: notificationResults,
    emails: emailResults,
  };
}

async function dispatchAutomatedEmail(emailId: string) {
  const record = await prisma.automatedEmail.findUnique({ where: { id: emailId } });
  if (!record) return null;

  const webhookUrl = process.env.EMAIL_WEBHOOK_URL;
  const webhookSecret = process.env.EMAIL_WEBHOOK_SECRET;

  if (!webhookUrl) {
    return prisma.automatedEmail.update({
      where: { id: emailId },
      data: {
        status: 'SKIPPED',
        errorMessage: 'EMAIL_WEBHOOK_URL is not configured.',
        lastAttemptAt: new Date(),
      },
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
      },
      body: JSON.stringify({
        to: {
          email: record.toEmail,
          name: record.toName,
        },
        subject: record.subject,
        text: record.bodyText,
        html: record.bodyHtml,
        eventKey: record.eventKey,
        relatedType: record.relatedType,
        relatedId: record.relatedId,
      }),
    });

    const payload = await response.text();

    if (!response.ok) {
      return prisma.automatedEmail.update({
        where: { id: emailId },
        data: {
          status: 'FAILED',
          errorMessage: payload || `Webhook returned ${response.status}.`,
          deliveryResponse: payload || null,
          lastAttemptAt: new Date(),
        },
      });
    }

    return prisma.automatedEmail.update({
      where: { id: emailId },
      data: {
        status: 'SENT',
        deliveryResponse: payload || null,
        lastAttemptAt: new Date(),
        sentAt: new Date(),
        errorMessage: null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Email dispatch failed.';
    return prisma.automatedEmail.update({
      where: { id: emailId },
      data: {
        status: 'FAILED',
        errorMessage: message,
        lastAttemptAt: new Date(),
      },
    });
  }
}

function buildInboxWhere(role: UserRole, userId?: string | null): Prisma.PlatformNotificationWhereInput {
  if (userId) {
    return {
      OR: [{ recipientRole: role }, { recipientUserId: userId }],
    };
  }

  return { recipientRole: role };
}

function buildEmailWhere(role: UserRole, userId?: string | null): Prisma.AutomatedEmailWhereInput {
  if (userId) {
    return {
      OR: [{ recipientRole: role }, { recipientUserId: userId }],
    };
  }

  return { recipientRole: role };
}

export async function getAutomationInbox(role: UserRole, userId?: string | null, limit = 6) {
  try {
    const [notifications, emails] = await Promise.all([
      prisma.platformNotification.findMany({
        where: buildInboxWhere(role, userId),
        orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
        take: limit,
      }),
      prisma.automatedEmail.findMany({
        where: buildEmailWhere(role, userId),
        orderBy: [{ createdAt: 'desc' }],
        take: limit,
      }),
    ]);

    return {
      notifications: notifications.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        readAt: item.readAt?.toISOString() ?? null,
      })),
      emails: emails.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        sentAt: item.sentAt?.toISOString() ?? null,
        lastAttemptAt: item.lastAttemptAt?.toISOString() ?? null,
      })),
      degradedReason: null,
    } satisfies AutomationInbox;
  } catch (error) {
    if (!isPrismaSchemaDriftError(error)) {
      throw error;
    }

    console.error('[automation-inbox] Workflow inbox is degraded because the database schema is out of sync.', error);

    return {
      notifications: [],
      emails: [],
      degradedReason:
        'Workflow inbox is temporarily unavailable while the production database schema catches up. Check /api/health for the current drift status.',
    } satisfies AutomationInbox;
  }
}

export async function markNotificationAsRead(notificationId: string, role: UserRole, userId?: string | null) {
  const where = buildInboxWhere(role, userId);
  const existing = await prisma.platformNotification.findFirst({
    where: {
      id: notificationId,
      ...where,
    },
  });

  if (!existing) return null;

  return prisma.platformNotification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
}

