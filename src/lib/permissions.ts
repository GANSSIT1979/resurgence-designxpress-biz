import { AppRole } from '@/lib/resurgence';

export const permissionCatalog = [
  { key: 'admin.dashboard.view', label: 'Admin dashboard', area: 'Admin' },
  { key: 'admin.cms.manage', label: 'Content, sponsors, creators, gallery, settings', area: 'Admin' },
  { key: 'admin.users.manage', label: 'Users and role assignments', area: 'Admin' },
  { key: 'admin.reports.manage', label: 'Executive reports and exports', area: 'Admin' },
  { key: 'cashier.dashboard.view', label: 'Cashier overview', area: 'Cashier' },
  { key: 'cashier.finance.manage', label: 'Invoices, transactions, and receipts', area: 'Cashier' },
  { key: 'cashier.reports.view', label: 'Cashier reports and analytics', area: 'Cashier' },
  { key: 'cashier.exports.manage', label: 'Finance exports and print views', area: 'Cashier' },
  { key: 'sponsor.dashboard.view', label: 'Sponsor portal overview', area: 'Sponsor' },
  { key: 'sponsor.applications.manage', label: 'Sponsor applications', area: 'Sponsor' },
  { key: 'sponsor.deliverables.manage', label: 'Sponsor deliverables', area: 'Sponsor' },
  { key: 'sponsor.billing.view', label: 'Sponsor billing and receipts', area: 'Sponsor' },
  { key: 'sponsor.profile.manage', label: 'Sponsor profile', area: 'Sponsor' },
  { key: 'staff.dashboard.view', label: 'Staff overview', area: 'Staff' },
  { key: 'staff.inquiries.manage', label: 'Inquiry workflow', area: 'Staff' },
  { key: 'staff.tasks.manage', label: 'Staff tasks', area: 'Staff' },
  { key: 'staff.schedule.manage', label: 'Staff schedule', area: 'Staff' },
  { key: 'staff.announcements.manage', label: 'Staff announcements', area: 'Staff' },
  { key: 'partner.dashboard.view', label: 'Partner overview', area: 'Partner' },
  { key: 'partner.campaigns.manage', label: 'Partner campaigns', area: 'Partner' },
  { key: 'partner.referrals.manage', label: 'Partner referrals', area: 'Partner' },
  { key: 'partner.agreements.manage', label: 'Partner agreements', area: 'Partner' },
  { key: 'partner.profile.manage', label: 'Partner profile', area: 'Partner' },
  { key: 'uploads.manage', label: 'Upload platform image assets', area: 'Shared' },
  { key: 'notifications.view', label: 'View notifications and automation inbox', area: 'Shared' },
] as const;

export type PermissionKey = (typeof permissionCatalog)[number]['key'];

const allPermissionKeys = permissionCatalog.map((item) => item.key) as PermissionKey[];

export const rolePermissionMatrix: Record<AppRole, readonly PermissionKey[]> = {
  SYSTEM_ADMIN: allPermissionKeys,
  CASHIER: ['cashier.dashboard.view', 'cashier.finance.manage', 'cashier.reports.view', 'cashier.exports.manage', 'notifications.view'],
  SPONSOR: [
    'sponsor.dashboard.view',
    'sponsor.applications.manage',
    'sponsor.deliverables.manage',
    'sponsor.billing.view',
    'sponsor.profile.manage',
    'uploads.manage',
    'notifications.view',
  ],
  STAFF: [
    'staff.dashboard.view',
    'staff.inquiries.manage',
    'staff.tasks.manage',
    'staff.schedule.manage',
    'staff.announcements.manage',
    'notifications.view',
  ],
  PARTNER: [
    'partner.dashboard.view',
    'partner.campaigns.manage',
    'partner.referrals.manage',
    'partner.agreements.manage',
    'partner.profile.manage',
    'uploads.manage',
    'notifications.view',
  ],
};

type RoutePermissionRule = {
  prefix: string;
  permission: PermissionKey;
  methods?: readonly string[];
};

const pageRouteRules: readonly RoutePermissionRule[] = [
  { prefix: '/admin/users', permission: 'admin.users.manage' },
  { prefix: '/admin/reports', permission: 'admin.reports.manage' },
  { prefix: '/admin/content', permission: 'admin.cms.manage' },
  { prefix: '/admin/creator-network', permission: 'admin.cms.manage' },
  { prefix: '/admin/gallery', permission: 'admin.cms.manage' },
  { prefix: '/admin/inquiries', permission: 'admin.cms.manage' },
  { prefix: '/admin/partners', permission: 'admin.cms.manage' },
  { prefix: '/admin/product-services', permission: 'admin.cms.manage' },
  { prefix: '/admin/products', permission: 'admin.cms.manage' },
  { prefix: '/admin/orders', permission: 'admin.cms.manage' },
  { prefix: '/admin/settings', permission: 'admin.cms.manage' },
  { prefix: '/admin/sponsor-inventory', permission: 'admin.cms.manage' },
  { prefix: '/admin/sponsor-packages', permission: 'admin.cms.manage' },
  { prefix: '/admin/sponsor-submissions', permission: 'admin.cms.manage' },
  { prefix: '/admin/sponsors', permission: 'admin.cms.manage' },
  { prefix: '/admin', permission: 'admin.dashboard.view' },
  { prefix: '/cashier/reports', permission: 'cashier.reports.view' },
  { prefix: '/cashier/invoices', permission: 'cashier.finance.manage' },
  { prefix: '/cashier/transactions', permission: 'cashier.finance.manage' },
  { prefix: '/cashier/receipts', permission: 'cashier.finance.manage' },
  { prefix: '/cashier', permission: 'cashier.dashboard.view' },
  { prefix: '/sponsor/applications', permission: 'sponsor.applications.manage' },
  { prefix: '/sponsor/deliverables', permission: 'sponsor.deliverables.manage' },
  { prefix: '/sponsor/billing', permission: 'sponsor.billing.view' },
  { prefix: '/sponsor/profile', permission: 'sponsor.profile.manage' },
  { prefix: '/sponsor/packages', permission: 'sponsor.dashboard.view' },
  { prefix: '/sponsor/dashboard', permission: 'sponsor.dashboard.view' },
  { prefix: '/staff/inquiries', permission: 'staff.inquiries.manage' },
  { prefix: '/staff/tasks', permission: 'staff.tasks.manage' },
  { prefix: '/staff/schedule', permission: 'staff.schedule.manage' },
  { prefix: '/staff/announcements', permission: 'staff.announcements.manage' },
  { prefix: '/staff', permission: 'staff.dashboard.view' },
  { prefix: '/partner/campaigns', permission: 'partner.campaigns.manage' },
  { prefix: '/partner/referrals', permission: 'partner.referrals.manage' },
  { prefix: '/partner/agreements', permission: 'partner.agreements.manage' },
  { prefix: '/partner/profile', permission: 'partner.profile.manage' },
  { prefix: '/partner', permission: 'partner.dashboard.view' },
];

const apiRouteRules: readonly RoutePermissionRule[] = [
  { prefix: '/api/admin/users', permission: 'admin.users.manage' },
  { prefix: '/api/admin/reports', permission: 'admin.reports.manage' },
  { prefix: '/api/admin', permission: 'admin.cms.manage' },
  { prefix: '/api/cashier/reports/export', permission: 'cashier.exports.manage' },
  { prefix: '/api/cashier/reports', permission: 'cashier.reports.view' },
  { prefix: '/api/cashier', permission: 'cashier.finance.manage' },
  { prefix: '/api/sponsor/applications', permission: 'sponsor.applications.manage' },
  { prefix: '/api/sponsor/deliverables', permission: 'sponsor.deliverables.manage' },
  { prefix: '/api/sponsor/profile', permission: 'sponsor.profile.manage' },
  { prefix: '/api/sponsor', permission: 'sponsor.dashboard.view' },
  { prefix: '/api/staff/inquiries', permission: 'staff.inquiries.manage' },
  { prefix: '/api/staff/tasks', permission: 'staff.tasks.manage' },
  { prefix: '/api/staff/schedule', permission: 'staff.schedule.manage' },
  { prefix: '/api/staff/announcements', permission: 'staff.announcements.manage' },
  { prefix: '/api/partner/campaigns', permission: 'partner.campaigns.manage' },
  { prefix: '/api/partner/referrals', permission: 'partner.referrals.manage' },
  { prefix: '/api/partner/agreements', permission: 'partner.agreements.manage' },
  { prefix: '/api/partner/profile', permission: 'partner.profile.manage' },
  { prefix: '/api/uploads/image', permission: 'uploads.manage' },
  { prefix: '/api/notifications', permission: 'notifications.view' },
];

export function hasPermission(role: AppRole, permission: PermissionKey) {
  return rolePermissionMatrix[role].includes(permission);
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function findRouteRule(pathname: string, method: string, rules: readonly RoutePermissionRule[]) {
  const candidates = rules.filter((rule) => {
    if (!matchesPrefix(pathname, rule.prefix)) return false;
    if (!rule.methods?.length) return true;
    return rule.methods.includes(method.toUpperCase());
  });

  return candidates.sort((left, right) => right.prefix.length - left.prefix.length)[0] ?? null;
}

export function getRequiredPermission(pathname: string, method = 'GET') {
  const rules = pathname.startsWith('/api/') ? apiRouteRules : pageRouteRules;
  return findRouteRule(pathname, method, rules)?.permission ?? null;
}

export function getPermissionMatrixRows() {
  return permissionCatalog.map((permission) => ({
    ...permission,
    roles: Object.fromEntries(
      (Object.keys(rolePermissionMatrix) as AppRole[]).map((role) => [role, rolePermissionMatrix[role].includes(permission.key)]),
    ) as Record<AppRole, boolean>,
  }));
}
