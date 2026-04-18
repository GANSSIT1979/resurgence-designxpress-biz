import { z } from "zod";

const nullableTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length ? value : null));

const optionalDateString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length ? value : null));

const optionalNumber = z.union([z.number(), z.string()]).optional().transform((value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
});

export const adminSettingsSchema = z.object({
  contactName: z.string().trim().min(1),
  contactEmail: z.string().trim().email(),
  contactPhone: z.string().trim().min(1),
  contactAddress: z.string().trim().min(1),
  adminTitle: z.string().trim().min(1),
  adminSubtitle: z.string().trim().min(1),
  reportFooter: z.string().trim().min(1),
});

export const sponsorProfileSchema = z.object({
  sponsorId: z.string().trim().optional().default(""),
  preferredPackageId: z.string().trim().optional().default(""),
  companyName: z.string().trim().min(1),
  contactName: z.string().trim().min(1),
  contactEmail: z.string().trim().email(),
  phone: z.string().trim().optional().default(""),
  websiteUrl: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
  brandSummary: z.string().trim().optional().default(""),
  assetLink: z.string().trim().optional().default(""),
});

export const galleryMediaSchema = z.object({
  mediaEventId: z.string().trim().min(1),
  mediaType: z.enum(["IMAGE", "VIDEO"]).or(z.string().trim().min(1)),
  url: z.string().trim().min(1),
  thumbnailUrl: z.string().trim().optional().default(""),
  caption: z.string().trim().optional().default(""),
  sortOrder: optionalNumber.transform((value) => value ?? 0),
});

export const pageContentSchema = z.object({
  key: z.string().trim().min(1),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional().default(""),
  body: z.string().trim().optional().default(""),
  ctaLabel: z.string().trim().optional().default(""),
  ctaHref: z.string().trim().optional().default(""),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().trim().min(1),
  sponsorId: z.string().trim().optional().default(""),
  companyName: z.string().trim().min(1),
  contactName: z.string().trim().optional().default(""),
  email: z.string().trim().email().optional().or(z.literal("")).default(""),
  tier: z.string().trim().optional().default(""),
  description: z.string().trim().min(1),
  amount: z.union([z.number(), z.string()]).transform((value) => Number(value)),
  balanceAmount: z.union([z.number(), z.string()]).optional().transform((value) => {
    if (value === undefined || value === null || value === "") return undefined;
    return Number(value);
  }),
  status: z.string().trim().optional().default("PENDING"),
  issueDate: optionalDateString.default(""),
  dueDate: optionalDateString.default(""),
  notes: z.string().trim().optional().default(""),
});

export const receiptSchema = z.object({
  receiptNumber: z.string().trim().min(1),
  invoiceId: z.string().trim().optional().default(""),
  transactionId: z.string().trim().optional().default(""),
  companyName: z.string().trim().min(1),
  receivedFrom: z.string().trim().min(1),
  amount: z.union([z.number(), z.string()]).transform((value) => Number(value)),
  paymentMethod: z.string().trim().min(1),
  issuedAt: optionalDateString.default(""),
  notes: z.string().trim().optional().default(""),
});

export const adminUserSchema = z.object({
  email: z.string().trim().email(),
  displayName: z.string().trim().min(1),
  title: z.string().trim().optional().default(""),
  role: z.string().trim().min(1),
  isActive: z.boolean().default(true),
  password: z.string().min(6),
});

export const adminUserUpdateSchema = z.object({
  email: z.string().trim().email(),
  displayName: z.string().trim().min(1),
  title: z.string().trim().optional().default(""),
  role: z.string().trim().min(1),
  isActive: z.boolean().default(true),
  password: z.string().min(6).optional(),
});
