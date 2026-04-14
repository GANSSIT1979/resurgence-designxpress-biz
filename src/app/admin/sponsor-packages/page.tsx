import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Sponsor Packages"
      endpoint="/api/admin/sponsor-packages"
      fields={[{"key": "title", "label": "Title", "type": "text", "required": true}, {"key": "priceRange", "label": "Price Range", "type": "text", "required": true}, {"key": "description", "label": "Description", "type": "textarea", "required": true}, {"key": "benefits", "label": "Benefits JSON", "type": "json", "required": true}, {"key": "deliverables", "label": "Deliverables JSON", "type": "json", "required": true}, {"key": "status", "label": "Status", "type": "text"}, {"key": "featured", "label": "Featured Badge", "type": "checkbox"}, {"key": "sortOrder", "label": "Sort Order", "type": "number"}]}
    />
  );
}
