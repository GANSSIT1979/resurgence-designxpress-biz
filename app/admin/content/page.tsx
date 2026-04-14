import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Content CMS"
      endpoint="/api/admin/content"
      fields={[{"key": "key", "label": "Key", "type": "text", "required": true}, {"key": "title", "label": "Title", "type": "text", "required": true}, {"key": "subtitle", "label": "Subtitle", "type": "text"}, {"key": "body", "label": "Body", "type": "textarea", "required": true}, {"key": "ctaLabel", "label": "CTA Label", "type": "text"}, {"key": "ctaHref", "label": "CTA Href", "type": "text"}, {"key": "active", "label": "Active", "type": "checkbox"}]}
    />
  );
}
