import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PAYMENT_FAILED'
  | 'WEBHOOK_INVALID'
  | 'DATABASE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

function shouldExposeDetails() {
  return process.env.NODE_ENV !== 'production';
}

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function apiError(code: ApiErrorCode, message: string, status = 500, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined && shouldExposeDetails() ? { details } : {}),
      },
    },
    { status },
  );
}

export function validationError(message = 'Invalid request payload', details?: unknown) {
  return apiError('VALIDATION_ERROR', message, 400, details);
}

export function unauthorizedError(message = 'Authentication is required') {
  return apiError('UNAUTHORIZED', message, 401);
}

export function forbiddenError(message = 'Insufficient permissions') {
  return apiError('FORBIDDEN', message, 403);
}

export function notFoundError(message = 'Resource not found') {
  return apiError('NOT_FOUND', message, 404);
}

export function conflictError(message = 'Request conflicts with the current resource state') {
  return apiError('CONFLICT', message, 409);
}

export function paymentFailed(message = 'Payment processing failed', details?: unknown) {
  return apiError('PAYMENT_FAILED', message, 502, details);
}

export function webhookInvalid(message = 'Invalid webhook signature') {
  return apiError('WEBHOOK_INVALID', message, 400);
}

export function internalError(message = 'Internal server error', details?: unknown) {
  return apiError('INTERNAL_ERROR', message, 500, details);
}

export function databaseUnavailable(message = 'Database is not configured') {
  return apiError('DATABASE_UNAVAILABLE', message, 503);
}
