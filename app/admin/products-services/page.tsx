import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Product and Services"
      endpoint="/api/admin/products-services"
      fields={[{"key": "title", "label": "Title", "type": "text", "required": true}, {"key": "slug", "label": "Slug", "type": "text", "required": true}, {"key": "description", "label": "Description", "type": "textarea", "required": true}, {"key": "image", "label": "Image", "type": "image"}, {"key": "featured", "label": "Featured", "type": "checkbox"}, {"key": "priceLabel", "label": "Price Label", "type": "text"}, {"key": "active", "label": "Active", "type": "checkbox"}]}
    />
  );
}
