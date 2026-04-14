import { CrudManager } from "@/components/crud-manager";

export default function Page() {
  return (
    <CrudManager
      title="Users and Roles"
      endpoint="/api/admin/users"
      fields={[{"key": "name", "label": "Name", "type": "text", "required": true}, {"key": "email", "label": "Email", "type": "text", "required": true}, {"key": "password", "label": "Password", "type": "text"}, {"key": "role", "label": "Role", "type": "text", "required": true}, {"key": "status", "label": "Status", "type": "text"}, {"key": "sponsorId", "label": "Sponsor ID", "type": "text"}, {"key": "partnerId", "label": "Partner ID", "type": "text"}]}
    />
  );
}
