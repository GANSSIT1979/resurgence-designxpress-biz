import { InquiryForm } from '@/components/forms/inquiry-form';
import { getContentMap } from '@/lib/site';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const [contentMap, settings] = await Promise.all([getContentMap(), getPublicSettings()]);
  const contact = contentMap['contact.details'];

  return (
    <main className="section">
      <div className="container split">
        <div>
          <div className="section-kicker">{contact.subtitle}</div>
          <h1 className="section-title">{contact.title}</h1>
          <p className="section-copy">{contact.body}</p>

          <div className="panel" style={{ marginTop: 24 }}>
            <div className="section-kicker">Business Profile</div>
            <div className="helper">Brand: {settings.brandName}</div>
            <div className="helper">Company: {settings.companyName}</div>
            <div className="helper">Website: {settings.siteUrl}</div>
            <div className="helper">Location: {settings.location}</div>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">Primary Contact</div>
            <div className="helper">Contact: {settings.contactName}</div>
            <div className="helper">Role: {settings.contactRole}</div>
            <div className="helper">Email: {settings.contactEmail}</div>
            <div className="helper">Phone: {settings.contactPhone}</div>
            <div className="helper">Coverage: {settings.contactAddress}</div>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">Support Desk</div>
            <div className="helper">Support Email: {settings.supportEmail}</div>
            <div className="helper">Support Phone: {settings.supportPhone}</div>
            <div className="helper">Business Hours: {settings.businessHours}</div>
          </div>

          <div className="panel" style={{ marginTop: 18 }}>
            <div className="section-kicker">Commercial Details</div>
            <div className="helper">Currency: {settings.currency}</div>
            <div className="helper">Payment Methods: {settings.paymentMethods}</div>
            <div className="helper">Shipping Area: {settings.shippingArea}</div>
          </div>
        </div>

        <div className="card">
          <div className="section-kicker">Inquiry Form</div>
          <h2 style={{ marginBottom: 12 }}>Request a proposal or partnership discussion.</h2>
          <InquiryForm />
        </div>
      </div>
    </main>
  );
}
