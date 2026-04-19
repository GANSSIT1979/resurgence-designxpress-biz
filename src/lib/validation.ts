import { z } from 'zod';

const trimValue = (value: unknown) => (typeof value === 'string' ? value.trim() : value);

const requiredText = (minimum = 2) => z.preprocess(trimValue, z.string().min(minimum));

const optionalText = z.preprocess(trimValue, z.string().optional().default(''));

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}, z.union([z.string().url(), z.literal('')]).default(''));

const optionalPhone = z.preprocess(
  trimValue,
  z.union([
    z.string().regex(/^[+()0-9\s.-]{7,30}$/, 'Use a valid phone number.'),
    z.literal(''),
  ]).default(''),
);

const optionalDateString = z.preprocess(trimValue, z.string().optional().default('')).refine(
  (value) => !value || !Number.isNaN(Date.parse(value)),
  'Use a valid date.',
);

export const inquirySchema = z.object({
  name: z.string().min(2),
  organization: z.string().optional().or(z.literal('')),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  inquiryType: z.string().min(2),
  message: z.string().min(10),
});

export const sponsorSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  tier: z.string().min(2),
  logoUrl: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().optional().or(z.literal('')),
  shortDescription: z.string().min(10),
  packageValue: z.string().min(2),
  benefits: z.string().min(5),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const partnerSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  category: z.string().min(2),
  logoUrl: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().optional().or(z.literal('')),
  shortDescription: z.string().min(10),
  services: z.string().min(5),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const pageContentSchema = z.object({
  key: z.string().min(2),
  title: z.string().min(2),
  subtitle: z.string().optional().or(z.literal('')),
  body: z.string().min(10),
  ctaLabel: z.string().optional().or(z.literal('')),
  ctaHref: z.string().optional().or(z.literal('')),
});

export const sponsorSubmissionSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().optional().or(z.literal('')),
  category: z.string().min(2),
  interestedPackage: z.string().min(2),
  budgetRange: z.string().min(2),
  timeline: z.string().optional().or(z.literal('')),
  message: z.string().min(10),
});

export const sponsorPackageTemplateSchema = z.object({
  name: z.string().min(2),
  tier: z.string().min(2),
  rangeLabel: z.string().min(2),
  summary: z.string().min(10),
  benefits: z.string().min(5),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const creatorProfileSchema = z.object({
  name: requiredText(2),
  slug: optionalText,
  roleLabel: optionalText,
  platformFocus: optionalText,
  audience: optionalText,
  contactNumber: optionalPhone,
  address: optionalText,
  dateOfBirth: optionalDateString,
  jobDescription: requiredText(5),
  position: optionalText,
  height: optionalText,
  facebookPage: optionalUrl,
  facebookFollowers: optionalText,
  tiktokPage: optionalUrl,
  tiktokFollowers: optionalText,
  instagramPage: optionalUrl,
  instagramFollowers: optionalText,
  youtubePage: optionalUrl,
  youtubeFollowers: optionalText,
  trendingVideoUrl: optionalUrl,
  shortBio: optionalText,
  biography: optionalText,
  journeyStory: optionalText,
  pointsPerGame: z.coerce.number().optional().nullable(),
  assistsPerGame: z.coerce.number().optional().nullable(),
  reboundsPerGame: z.coerce.number().optional().nullable(),
  imageUrl: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  accountEmail: z.preprocess(
    trimValue,
    z.union([z.string().email(), z.literal('')]).optional().default(''),
  ),
  accountPassword: z.union([z.string().min(8), z.literal('')]).optional().default(''),
});

export const sponsorInventoryCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  examples: z.string().min(5),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().optional().or(z.literal('')),
  companyName: z.string().min(2),
  contactName: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  tier: z.string().optional().or(z.literal('')),
  description: z.string().min(5),
  amount: z.coerce.number().int().min(1),
  balanceAmount: z.coerce.number().int().min(0).optional(),
  status: z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED']).default('ISSUED'),
  issueDate: z.string().min(1),
  dueDate: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  sponsorId: z.string().optional().or(z.literal('')),
});

export const cashierTransactionSchema = z.object({
  transactionNumber: z.string().optional().or(z.literal('')),
  invoiceId: z.string().optional().or(z.literal('')),
  companyName: z.string().min(2),
  description: z.string().min(5),
  amount: z.coerce.number().int().min(1),
  kind: z.enum(['COLLECTION', 'REFUND', 'ADJUSTMENT']).default('COLLECTION'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'CHECK', 'OTHER']).default('BANK_TRANSFER'),
  referenceNumber: z.string().optional().or(z.literal('')),
  transactionDate: z.string().min(1),
  notes: z.string().optional().or(z.literal('')),
});

export const receiptSchema = z.object({
  receiptNumber: z.string().optional().or(z.literal('')),
  invoiceId: z.string().optional().or(z.literal('')),
  transactionId: z.string().optional().or(z.literal('')),
  companyName: z.string().min(2),
  receivedFrom: z.string().min(2),
  amount: z.coerce.number().int().min(1),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'CHECK', 'OTHER']).default('BANK_TRANSFER'),
  issuedAt: z.string().min(1),
  notes: z.string().optional().or(z.literal('')),
});

export const sponsorProfileSchema = z.object({
  sponsorId: z.string().optional().or(z.literal('')),
  preferredPackageId: z.string().optional().or(z.literal('')),
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  brandSummary: z.string().optional().or(z.literal('')),
  assetLink: z.string().optional().or(z.literal('')),
});

export const sponsorDeliverableSchema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'NEEDS_REVISION', 'COMPLETED']).default('PENDING'),
  dueDate: z.string().optional().or(z.literal('')),
  assetLink: z.string().optional().or(z.literal('')),
  sponsorNotes: z.string().optional().or(z.literal('')),
});

export const partnerProfileSchema = z.object({
  partnerId: z.string().optional().or(z.literal('')),
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  websiteUrl: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  companySummary: z.string().optional().or(z.literal('')),
  assetLink: z.string().optional().or(z.literal('')),
  preferredServices: z.string().optional().or(z.literal('')),
});

export const partnerCampaignSchema = z.object({
  title: z.string().min(2),
  campaignType: z.string().min(2),
  status: z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  description: z.string().optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  contributionValue: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
  assetLink: z.string().optional().or(z.literal('')),
});

export const partnerReferralSchema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST']).default('NEW'),
  notes: z.string().optional().or(z.literal('')),
  estimatedValue: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
});

export const partnerAgreementSchema = z.object({
  title: z.string().min(2),
  agreementType: z.string().min(2),
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']).default('DRAFT'),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  documentUrl: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const staffTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().or(z.literal('')),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED']).default('TODO'),
  dueDate: z.string().optional().or(z.literal('')),
  inquiryId: z.string().optional().or(z.literal('')),
  sponsorSubmissionId: z.string().optional().or(z.literal('')),
});

export const staffScheduleSchema = z.object({
  title: z.string().min(2),
  location: z.string().optional().or(z.literal('')),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  notes: z.string().optional().or(z.literal('')),
});

export const staffAnnouncementSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(5),
  level: z.enum(['INFO', 'SUCCESS', 'WARNING', 'URGENT']).default('INFO'),
  isPinned: z.coerce.boolean().default(false),
  publishAt: z.string().optional().or(z.literal('')),
});

export const staffInquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'PENDING_RESPONSE', 'CLOSED', 'ARCHIVED']),
  internalNotes: z.string().optional().or(z.literal('')),
  followUpAt: z.string().optional().or(z.literal('')),
});


export const mediaEventSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().or(z.literal('')),
  eventDate: z.string().optional().or(z.literal('')),
  creatorId: z.string().optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const galleryMediaSchema = z.object({
  mediaEventId: z.string().min(2),
  mediaType: z.enum(['IMAGE', 'VIDEO', 'YOUTUBE', 'VIMEO']).default('IMAGE'),
  url: z.string().min(4),
  thumbnailUrl: z.string().optional().or(z.literal('')),
  caption: z.string().optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
});


export const productServiceSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().min(10),
  features: z.string().min(5),
  priceLabel: z.string().optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
});

const adminUserBaseSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(2),
  title: z.string().optional().or(z.literal('')),
  role: z.enum(['SYSTEM_ADMIN', 'CASHIER', 'MEMBER', 'SPONSOR', 'STAFF', 'PARTNER', 'CREATOR', 'COACH', 'REFEREE']),
  isActive: z.coerce.boolean().default(true),
});

export const adminUserSchema = adminUserBaseSchema.extend({
  password: z.string().min(8),
});

export const adminUserUpdateSchema = adminUserBaseSchema.extend({
  password: z.string().min(8).optional().or(z.literal('')),
});

export const adminSettingsSchema = z.object({
  brandName: z.string().min(2),
  companyName: z.string().min(2),
  siteUrl: z.string().url(),
  contactName: z.string().min(2),
  contactRole: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(5),
  supportEmail: z.string().email(),
  supportPhone: z.string().min(5),
  businessHours: z.string().min(5),
  location: z.string().min(2),
  currency: z.string().min(2),
  paymentMethods: z.string().min(2),
  shippingArea: z.string().min(2),
  contactAddress: z.string().min(5),
  adminTitle: z.string().min(2),
  adminSubtitle: z.string().min(2),
  reportFooter: z.string().min(2),
});

export const adminReportSchema = z.object({
  title: z.string().min(2),
  summary: z.string().optional().or(z.literal('')),
  payloadJson: z.string().min(2),
  reportType: z.string().min(2).default('SYSTEM_ADMIN'),
  generatedByEmail: z.string().email().optional().or(z.literal('')),
});


export const shopProductSchema = z.object({
  name: requiredText(2),
  slug: requiredText(2),
  sku: optionalText,
  description: requiredText(10),
  shortDescription: optionalText,
  price: z.coerce.number().int().min(1),
  compareAtPrice: z.union([z.coerce.number().int().min(1), z.literal('')]).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  imageUrl: optionalText,
  badgeLabel: optionalText,
  material: optionalText,
  fitNotes: optionalText,
  careInstructions: optionalText,
  availableSizes: optionalText,
  availableColors: optionalText,
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isOfficialMerch: z.coerce.boolean().default(true),
  categoryId: optionalText,
});

export const shopOrderUpdateSchema = z.object({
  status: z.enum(['PENDING','AWAITING_PAYMENT','PAID','PROCESSING','PACKED','SHIPPED','DELIVERED','CANCELLED','REFUNDED']).optional(),
  paymentStatus: z.enum(['PENDING','PAID','FAILED','REFUNDED']).optional(),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(7),
  addressLine1: z.string().min(4),
  addressLine2: z.string().optional().or(z.literal('')),
  city: z.string().min(2),
  province: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  paymentMethod: z.enum(['COD','GCASH_MANUAL','MAYA_MANUAL','BANK_TRANSFER','CARD_MANUAL','CASH']),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1),
    variantLabel: optionalText,
  })).min(1),
});
