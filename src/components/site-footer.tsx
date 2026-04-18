import { getPublicSettings } from '@/lib/settings';

export async function SiteFooter() {
  const settings = await getPublicSettings();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>{settings.brandName}</strong>
          <div>{settings.companyName}</div>
          <div>{settings.siteUrl}</div>
        </div>
        <div>
          <div>{settings.contactName}</div>
          <div>{settings.contactRole}</div>
          <div>{settings.contactEmail}</div>
          <div>{settings.supportEmail}</div>
          <div>{settings.supportPhone}</div>
        </div>
      </div>
    </footer>
  );
}
