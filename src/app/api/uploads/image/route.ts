import { NextRequest, NextResponse } from 'next/server';
import { requireApiPermission } from '@/lib/api-utils';
import { getCurrentSessionUser } from '@/lib/session-server';
import { saveImageUpload, UploadScope } from '@/lib/uploads';

export const runtime = 'nodejs';

const scopeAccess: Record<string, UploadScope[]> = {
  SYSTEM_ADMIN: ['sponsor', 'creator', 'brand-profile', 'merch'],
  SPONSOR: ['brand-profile'],
  PARTNER: ['brand-profile'],
};

function isUploadScope(value: string): value is UploadScope {
  return value === 'sponsor' || value === 'creator' || value === 'brand-profile' || value === 'merch';
}

export async function POST(request: NextRequest) {
  const auth = await requireApiPermission(request, 'uploads.manage');
  if (auth.error) return auth.error;

  const context = await getCurrentSessionUser();
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const scopeValue = String(formData.get('scope') || '');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Please select an image file to upload.' }, { status: 400 });
  }

  if (!isUploadScope(scopeValue)) {
    return NextResponse.json({ error: 'Invalid upload scope.' }, { status: 400 });
  }

  const allowedScopes = scopeAccess[context.session.role] || [];
  if (!allowedScopes.includes(scopeValue)) {
    return NextResponse.json({ error: 'You do not have permission to upload this asset type.' }, { status: 403 });
  }

  try {
    const url = await saveImageUpload(file, scopeValue, {
      userId: context.user.id,
      userEmail: context.user.email,
    });
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to upload image.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
