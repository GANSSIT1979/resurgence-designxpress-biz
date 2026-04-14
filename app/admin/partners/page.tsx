import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Partners"
      endpoint="/api/admin/partners"
      fields={[{"key": "name", "label": "Name", "type": "text", "required": true}, {"key": "slug", "label": "Slug", "type": "text", "required": true}, {"key": "description", "label": "Description", "type": "textarea", "required": true}, {"key": "website", "label": "Website", "type": "text"}, {"key": "logo", "label": "Logo", "type": "image"}, {"key": "status", "label": "Status", "type": "text"}]}
    />
  );
}
