import { CrudManager } from "@/components/crud-manager";

export default function AdminGalleryPage() {
  return (
    <div className="list-stack">
      <CrudManager
        title="Media Events"
        endpoint="/api/admin/media-events"
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "slug", label: "Slug", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea" },
          { key: "featured", label: "Featured", type: "checkbox" }
        ]}
      />
      <CrudManager
        title="Gallery Media"
        endpoint="/api/admin/gallery"
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "caption", label: "Caption", type: "text" },
          { key: "description", label: "Description", type: "textarea" },
          { key: "image", label: "Image", type: "image", required: true },
          { key: "featured", label: "Featured", type: "checkbox" },
          { key: "eventId", label: "Event ID", type: "text" }
        ]}
      />
    </div>
  );
}
