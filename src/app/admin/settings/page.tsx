import { AdminShell } from '@/components/admin-shell';
import { SettingsManager } from '@/components/forms/settings-manager';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getPublicSettings();

  return (
    <main>
      <AdminShell
        title="Settings and Deployment Notes"
        description="Update the brand profile, primary and support contacts, commercial details, and admin branding from one system-admin settings module."
        currentPath="/admin/settings"
      >
        <SettingsManager initialSettings={settings} />
      </AdminShell>
    </main>
  );
}
