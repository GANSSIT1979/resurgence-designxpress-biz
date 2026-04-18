import { getPublicSettings } from '@/lib/settings';

export async function SiteFooter() {
  const settings = await getPublicSettings();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>RESURGENCE Powered by DesignXpress</strong>
          <div>Sports Management • Media • Apparel • Sponsorship</div>
        </div>
        <div>
          <div>{settings.contactName}</div>
          <div>{settings.contactEmail}</div>
          <div>{settings.contactPhone}</div>
        </div>
      </div>
    </footer>
  );
}
