import { randomInt } from 'crypto';
import { z } from 'zod';
import { AppRole, roleMeta } from '@/lib/resurgence';
import { publicSignupRoles } from '@/lib/signup-roles';
import type { PublicSignupRole } from '@/lib/signup-roles';

export const publicRoleSchema = z.enum(publicSignupRoles);

export function isPublicSignupRole(value: unknown): value is PublicSignupRole {
  return typeof value === 'string' && publicSignupRoles.includes(value as PublicSignupRole);
}

export function normalizeEmail(value: unknown) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export function normalizePhoneNumber(value: unknown) {
  if (typeof value !== 'string') return '';

  const compact = value.replace(/[^\d+]/g, '');
  if (compact.startsWith('+')) return `+${compact.slice(1).replace(/\D/g, '')}`;

  const digits = compact.replace(/\D/g, '');
  if (digits.startsWith('09') && digits.length === 11) return `+63${digits.slice(1)}`;
  if (digits.startsWith('639') && digits.length === 12) return `+${digits}`;
  if (digits.length >= 7 && digits.length <= 15) return `+${digits}`;

  return '';
}

export function normalizeReferralCode(value: unknown) {
  if (typeof value !== 'string') return undefined;

  const normalized = value.trim().toUpperCase();
  return normalized || undefined;
}

export function phoneNumberToSyntheticEmail(phoneNumber: string) {
  const digits = phoneNumber.replace(/\D/g, '');
  return `mobile-${digits}@mobile.resurgence.local`;
}

export function getRoleRedirect(role: AppRole) {
  return roleMeta[role].defaultRoute;
}

export function generateOtpCode() {
  return String(randomInt(100000, 1000000));
}

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Za-z]/, 'Password must include at least one letter.')
  .regex(/[0-9]/, 'Password must include at least one number.');

const optionalReferralCodeSchema = z.preprocess(normalizeReferralCode, z.string().max(80).optional());

export const mobileSignupRequestSchema = z.object({
  phoneNumber: z.preprocess(normalizePhoneNumber, z.string().regex(/^\+[1-9]\d{6,14}$/, 'Use a valid mobile number.')),
  displayName: z.string().trim().min(2, 'Enter your full name.'),
  password: passwordSchema,
  role: publicRoleSchema,
  referralCode: optionalReferralCodeSchema,
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and privacy notice.' }),
  }),
});

export const mobileOtpVerifySchema = z.object({
  phoneNumber: z.preprocess(normalizePhoneNumber, z.string().regex(/^\+[1-9]\d{6,14}$/)),
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit verification code.'),
});

export const googleSignupSchema = z.object({
  credential: z.string().min(20),
  role: publicRoleSchema,
  referralCode: optionalReferralCodeSchema,
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and privacy notice.' }),
  }),
});

export const googleLoginSchema = z.object({
  credential: z.string().min(20),
  intent: z.literal('login'),
});
