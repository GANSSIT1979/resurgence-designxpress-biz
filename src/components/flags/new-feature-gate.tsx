import type { ReactNode } from 'react';
import { showNewFeature } from '@/flags';

export async function NewFeatureGate({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const enabled = await showNewFeature();

  return enabled ? <>{children}</> : <>{fallback}</>;
}
