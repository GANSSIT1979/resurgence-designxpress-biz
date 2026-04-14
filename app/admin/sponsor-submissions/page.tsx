import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Sponsor Submissions"
      endpoint="/api/admin/sponsor-submissions"
      fields={[{"key": "sponsorName", "label": "Sponsor Name", "type": "text", "required": true}, {"key": "contactName", "label": "Contact Name", "type": "text", "required": true}, {"key": "email", "label": "Email", "type": "text", "required": true}, {"key": "phone", "label": "Phone", "type": "text"}, {"key": "company", "label": "Company", "type": "text"}, {"key": "packageInterest", "label": "Package Interest", "type": "text", "required": true}, {"key": "message", "label": "Message", "type": "textarea", "required": true}, {"key": "status", "label": "Status", "type": "text"}]}
    />
  );
}
