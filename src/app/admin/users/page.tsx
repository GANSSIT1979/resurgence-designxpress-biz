<<<<<<< HEAD
import { AdminShell } from '@/components/admin-shell';
import { UserManager } from '@/components/forms/user-manager';
import { getPermissionMatrixRows } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: [{ role: 'asc' }, { createdAt: 'asc' }] });
  const permissionMatrix = getPermissionMatrixRows();
=======
import { CrudManager } from "@/components/crud-manager";
>>>>>>> parent of d975526 (commit)

export default function Page() {
  return (
<<<<<<< HEAD
    <main>
      <AdminShell
        title="Users and Roles"
        description="Create, edit, disable, and delete multi-role accounts for System Admin, Cashier, Sponsor, Staff, and Partner dashboards."
        currentPath="/admin/users"
      >
        <UserManager
          initialUsers={users.map((user) => ({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            title: user.title,
            role: user.role,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
          }))}
          permissionMatrix={permissionMatrix}
        />
      </AdminShell>
    </main>
=======
    <CrudManager
      title="Users and Roles"
      endpoint="/api/admin/users"
      fields={[{"key": "name", "label": "Name", "type": "text", "required": true}, {"key": "email", "label": "Email", "type": "text", "required": true}, {"key": "password", "label": "Password", "type": "text"}, {"key": "role", "label": "Role", "type": "text", "required": true}, {"key": "status", "label": "Status", "type": "text"}, {"key": "sponsorId", "label": "Sponsor ID", "type": "text"}, {"key": "partnerId", "label": "Partner ID", "type": "text"}]}
    />
>>>>>>> parent of d975526 (commit)
  );
}
