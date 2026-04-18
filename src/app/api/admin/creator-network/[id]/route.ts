import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/passwords';
import { creatorProfileSchema } from '@/lib/validation';
import { serializeCreatorProfile, slugifyCreatorName } from '@/lib/creators';

type ParsedCreatorPayload = z.infer<typeof creatorProfileSchema>;

function nullableText(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : null;
}

function nullableNumber(value: number | null | undefined) {
  return Number.isFinite(value) ? value : null;
}

function nullableDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function serialize(item: any) {
  return serializeCreatorProfile(item);
}

async function ensureUniqueSlug(slugSource: string, currentId: string) {
  const base = slugifyCreatorName(slugSource);
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.creatorProfile.findUnique({ where: { slug } });
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
}

async function assertUniqueName(name: string, currentId: string) {
  const existing = await prisma.creatorProfile.findFirst({ where: { name } });
  if (existing && existing.id !== currentId) {
    throw new Error('A creator with this exact full name already exists.');
  }
}

async function resolveCreatorUserId(payload: ParsedCreatorPayload, currentCreatorId: string) {
  const email = payload.accountEmail?.trim().toLowerCase();
  if (!email) return undefined;

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { creatorProfile: true },
  });

  if (existing && existing.role !== 'CREATOR') {
    throw new Error('This email already belongs to a non-creator user.');
  }

  if (existing?.creatorProfile && existing.creatorProfile.id !== currentCreatorId) {
    throw new Error('This creator user is already linked to another profile.');
  }

  const userPayload = {
    email,
    displayName: payload.name,
    title: payload.jobDescription,
    role: 'CREATOR' as const,
    isActive: payload.isActive,
    ...(payload.accountPassword ? { password: hashPassword(payload.accountPassword) } : {}),
  };

  if (existing) {
    const user = await prisma.user.update({
      where: { id: existing.id },
      data: userPayload,
    });
    return user.id;
  }

  if (!payload.accountPassword) {
    throw new Error('Add a password when creating a new creator user account.');
  }

  const user = await prisma.user.create({
    data: userPayload as typeof userPayload & { password: string },
  });

  return user.id;
}

async function buildCreatorData(payload: ParsedCreatorPayload, currentId: string) {
  await assertUniqueName(payload.name, currentId);

  const slug = await ensureUniqueSlug(payload.slug || payload.name, currentId);
  const userId = await resolveCreatorUserId(payload, currentId);
  const roleLabel = nullableText(payload.roleLabel) || nullableText(payload.position) || 'Creator';
  const platformFocus = nullableText(payload.platformFocus) || payload.jobDescription;
  const audience = nullableText(payload.audience) || 'Basketball, creator, and sponsor-ready audience';
  const biography = nullableText(payload.biography) || nullableText(payload.shortBio) || payload.jobDescription;

  return {
    ...(userId !== undefined ? { userId } : {}),
    name: payload.name,
    slug,
    roleLabel,
    platformFocus,
    audience,
    biography,
    journeyStory: nullableText(payload.journeyStory),
    contactNumber: nullableText(payload.contactNumber),
    address: nullableText(payload.address),
    dateOfBirth: nullableDate(payload.dateOfBirth),
    jobDescription: payload.jobDescription,
    position: nullableText(payload.position),
    height: nullableText(payload.height),
    facebookPage: nullableText(payload.facebookPage),
    facebookFollowers: nullableText(payload.facebookFollowers),
    tiktokPage: nullableText(payload.tiktokPage),
    tiktokFollowers: nullableText(payload.tiktokFollowers),
    instagramPage: nullableText(payload.instagramPage),
    instagramFollowers: nullableText(payload.instagramFollowers),
    youtubePage: nullableText(payload.youtubePage),
    youtubeFollowers: nullableText(payload.youtubeFollowers),
    trendingVideoUrl: nullableText(payload.trendingVideoUrl),
    shortBio: nullableText(payload.shortBio),
    pointsPerGame: nullableNumber(payload.pointsPerGame),
    assistsPerGame: nullableNumber(payload.assistsPerGame),
    reboundsPerGame: nullableNumber(payload.reboundsPerGame),
    imageUrl: nullableText(payload.imageUrl),
    sortOrder: payload.sortOrder,
    isActive: payload.isActive,
  };
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.creatorProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!item) {
    return NextResponse.json({ error: 'Creator profile not found.' }, { status: 404 });
  }

  return NextResponse.json({ item: serialize(item) });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = creatorProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid creator payload. Check required fields, URLs, phone number, and date.' }, { status: 400 });
  }

  try {
    const data = await buildCreatorData(parsed.data, id);
    const item = await prisma.creatorProfile.update({
      where: { id },
      data,
      include: { user: true },
    });
    return NextResponse.json({ item: serialize(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update creator profile.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.creatorProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete creator profile.' }, { status: 400 });
  }
}
