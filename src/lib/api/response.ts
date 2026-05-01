import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'PAYMENT_FAILED'
  | 'WEBHOOK_INVALID'
  | 'DATABASE_UNAVAILABLE'
  | 'INTERNAL_ERROR';

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
        details: details || null,
      },
    },
    { status },
  );
}

export function validationError(message: string, details?: unknown) {
  return apiError('VALIDATION_ERROR', message, 400, details);
}

export function internalError(message = 'Internal server error', details?: unknown) {
  return apiError('INTERNAL_ERROR', message, 500, details);
}

export function databaseUnavailable(message = 'Database is not configured') {
  return apiError('DATABASE_UNAVAILABLE', message, 503);
}
