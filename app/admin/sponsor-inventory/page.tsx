import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Sponsor Inventory"
      endpoint="/api/admin/sponsor-inventory"
      fields={[{"key": "title", "label": "Title", "type": "text", "required": true}, {"key": "category", "label": "Category", "type": "text", "required": true}, {"key": "description", "label": "Description", "type": "textarea", "required": true}, {"key": "value", "label": "Value", "type": "number", "required": true}, {"key": "image", "label": "Image", "type": "image"}, {"key": "packageApplicability", "label": "Package Applicability JSON", "type": "json", "required": true}, {"key": "active", "label": "Active", "type": "checkbox"}]}
    />
  );
}
