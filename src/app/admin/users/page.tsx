import { AdminShell } from '@/components/admin-shell';
import { UserManager } from '@/components/forms/user-manager';
import { getPermissionMatrixRows } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: [{ role: 'asc' }, { createdAt: 'asc' }] });
  const permissionMatrix = getPermissionMatrixRows();

  return (
    <main>
      <AdminShell
        title="Users and Roles"
        description="Create, edit, disable, and delete multi-role accounts for System Admin, Cashier, Sponsor, Staff, Partner, and Creator dashboards."
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
  );
}
