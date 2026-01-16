// User & Role Management Types

export type UserRole = 'Owner' | 'Admin' | 'Manager' | 'Provider' | 'Front Desk' | 'Billing';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  profilePhoto?: string;
  locationIds?: string[]; // Which locations user has access to
}

export type PermissionLevel = 'none' | 'view' | 'edit';

export interface RolePermissions {
  role: UserRole;
  permissions: {
    calendar: PermissionLevel;
    patients: PermissionLevel;
    billing: PermissionLevel;
    reports: PermissionLevel;
    settings: PermissionLevel;
    inventory: PermissionLevel;
  };
}

// Permission categories for the matrix
export const PERMISSION_CATEGORIES = [
  { key: 'calendar', label: 'Calendar', description: 'View and manage appointments' },
  { key: 'patients', label: 'Patients', description: 'View and edit patient records' },
  { key: 'billing', label: 'Billing', description: 'View and manage invoices, payments' },
  { key: 'reports', label: 'Reports', description: 'View business analytics and reports' },
  { key: 'settings', label: 'Settings', description: 'Manage clinic settings' },
  { key: 'inventory', label: 'Inventory', description: 'View and manage product inventory' },
] as const;

export type PermissionCategory = typeof PERMISSION_CATEGORIES[number]['key'];

// Default role permissions - this defines what each role can do
export const DEFAULT_ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'Owner',
    permissions: {
      calendar: 'edit',
      patients: 'edit',
      billing: 'edit',
      reports: 'view',
      settings: 'edit',
      inventory: 'edit',
    },
  },
  {
    role: 'Admin',
    permissions: {
      calendar: 'edit',
      patients: 'edit',
      billing: 'edit',
      reports: 'view',
      settings: 'edit',
      inventory: 'edit',
    },
  },
  {
    role: 'Manager',
    permissions: {
      calendar: 'edit',
      patients: 'edit',
      billing: 'edit',
      reports: 'view',
      settings: 'view',
      inventory: 'edit',
    },
  },
  {
    role: 'Provider',
    permissions: {
      calendar: 'edit',
      patients: 'edit',
      billing: 'view',
      reports: 'view',
      settings: 'none',
      inventory: 'view',
    },
  },
  {
    role: 'Front Desk',
    permissions: {
      calendar: 'edit',
      patients: 'view',
      billing: 'view',
      reports: 'none',
      settings: 'none',
      inventory: 'view',
    },
  },
  {
    role: 'Billing',
    permissions: {
      calendar: 'view',
      patients: 'view',
      billing: 'edit',
      reports: 'view',
      settings: 'none',
      inventory: 'none',
    },
  },
];

// User form data for create/edit
export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
}

// User filter options
export interface UserFilter {
  search?: string;
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
}

// All available roles
export const USER_ROLES: UserRole[] = ['Owner', 'Admin', 'Manager', 'Provider', 'Front Desk', 'Billing'];
