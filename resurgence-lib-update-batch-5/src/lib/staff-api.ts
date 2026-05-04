import { AnnouncementLevel, InquiryStatus, StaffTaskPriority, StaffTaskStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export function serializeStaffTask(item: any) {
  return {
    ...item,
    description: item.description ?? null,
    dueDate: item.dueDate ? item.dueDate.toISOString() : null,
    completedAt: item.completedAt ? item.completedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeInquiry(item: any) {
  return {
    ...item,
    organization: item.organization ?? null,
    phone: item.phone ?? null,
    internalNotes: item.internalNotes ?? null,
    followUpAt: item.followUpAt ? item.followUpAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeScheduleItem(item: any) {
  return {
    ...item,
    location: item.location ?? null,
    notes: item.notes ?? null,
    startAt: item.startAt.toISOString(),
    endAt: item.endAt.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export function serializeAnnouncement(item: any) {
  return {
    ...item,
    publishAt: item.publishAt ? item.publishAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function buildStaffTaskPayload(parsed: any, staffProfileId: string) {
  if (parsed.inquiryId) {
    const inquiry = await prisma.inquiry.findUnique({ where: { id: parsed.inquiryId } });
    if (!inquiry) throw new Error('Linked inquiry not found.');
  }

  if (parsed.sponsorSubmissionId) {
    const submission = await prisma.sponsorSubmission.findUnique({ where: { id: parsed.sponsorSubmissionId } });
    if (!submission) throw new Error('Linked sponsor submission not found.');
  }

  return {
    staffProfileId,
    title: parsed.title,
    description: parsed.description || null,
    priority: parsed.priority as StaffTaskPriority,
    status: parsed.status as StaffTaskStatus,
    dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
    inquiryId: parsed.inquiryId || null,
    sponsorSubmissionId: parsed.sponsorSubmissionId || null,
    completedAt: parsed.status === 'COMPLETED' ? new Date() : null,
  };
}

export function buildInquiryUpdatePayload(parsed: any, staffProfileId: string) {
  return {
    status: parsed.status as InquiryStatus,
    internalNotes: parsed.internalNotes || null,
    followUpAt: parsed.followUpAt ? new Date(parsed.followUpAt) : null,
    assignedStaffProfileId: staffProfileId,
  };
}

export function buildSchedulePayload(parsed: any, staffProfileId: string) {
  const startAt = new Date(parsed.startAt);
  const endAt = new Date(parsed.endAt);
  if (endAt < startAt) throw new Error('End date must be after start date.');

  return {
    staffProfileId,
    title: parsed.title,
    location: parsed.location || null,
    startAt,
    endAt,
    notes: parsed.notes || null,
  };
}

export function buildAnnouncementPayload(parsed: any, staffProfileId: string) {
  return {
    staffProfileId,
    title: parsed.title,
    body: parsed.body,
    level: parsed.level as AnnouncementLevel,
    isPinned: Boolean(parsed.isPinned),
    publishAt: parsed.publishAt ? new Date(parsed.publishAt) : null,
  };
}
