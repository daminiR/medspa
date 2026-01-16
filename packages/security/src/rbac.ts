/**
 * Role-Based Access Control (RBAC) Module
 *
 * Implements granular permissions for HIPAA compliance
 * - Role hierarchy
 * - Resource-level permissions
 * - Minimum necessary access principle
 */

// User roles in the system
export type UserRole =
  | 'admin'
  | 'medical_director'
  | 'physician'
  | 'nurse_practitioner'
  | 'registered_nurse'
  | 'aesthetician'
  | 'laser_technician'
  | 'injection_specialist'
  | 'front_desk'
  | 'office_manager'
  | 'billing_specialist'
  | 'marketing_coordinator'
  | 'patient_coordinator'
  | 'patient';

// Resource types in the system
export type ResourceType =
  | 'patient'
  | 'appointment'
  | 'invoice'
  | 'payment'
  | 'inventory'
  | 'treatment_record'
  | 'consent'
  | 'photo'
  | 'message'
  | 'campaign'
  | 'report'
  | 'analytics'
  | 'user'
  | 'settings'
  | 'referral'
  | 'prescription';

// Permission actions
export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'export'
  | 'print'
  | 'approve'
  | 'sign'
  | 'prescribe';

// Permission format: resource:action
export type Permission = `${ResourceType}:${PermissionAction}`;

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has all permissions
    'patient:create', 'patient:read', 'patient:update', 'patient:delete', 'patient:list', 'patient:export',
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete', 'appointment:list',
    'invoice:create', 'invoice:read', 'invoice:update', 'invoice:delete', 'invoice:list', 'invoice:export',
    'payment:create', 'payment:read', 'payment:update', 'payment:list',
    'inventory:create', 'inventory:read', 'inventory:update', 'inventory:delete', 'inventory:list',
    'treatment_record:create', 'treatment_record:read', 'treatment_record:update', 'treatment_record:list', 'treatment_record:sign',
    'consent:create', 'consent:read', 'consent:list',
    'photo:create', 'photo:read', 'photo:delete', 'photo:list',
    'message:create', 'message:read', 'message:list',
    'campaign:create', 'campaign:read', 'campaign:update', 'campaign:delete', 'campaign:list',
    'report:read', 'report:list', 'report:export',
    'analytics:read',
    'user:create', 'user:read', 'user:update', 'user:delete', 'user:list',
    'settings:read', 'settings:update',
    'referral:create', 'referral:read', 'referral:update', 'referral:list',
    'prescription:read', 'prescription:list',
  ],

  medical_director: [
    'patient:create', 'patient:read', 'patient:update', 'patient:list', 'patient:export',
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete', 'appointment:list',
    'invoice:create', 'invoice:read', 'invoice:update', 'invoice:list',
    'payment:create', 'payment:read', 'payment:list',
    'inventory:read', 'inventory:update', 'inventory:list',
    'treatment_record:create', 'treatment_record:read', 'treatment_record:update', 'treatment_record:list', 'treatment_record:sign',
    'consent:create', 'consent:read', 'consent:list',
    'photo:create', 'photo:read', 'photo:list',
    'message:create', 'message:read', 'message:list',
    'report:read', 'report:list',
    'analytics:read',
    'user:read', 'user:list',
    'settings:read',
    'prescription:create', 'prescription:read', 'prescription:update', 'prescription:list', 'prescription:sign',
  ],

  physician: [
    'patient:read', 'patient:update', 'patient:list',
    'appointment:read', 'appointment:update', 'appointment:list',
    'invoice:read', 'invoice:list',
    'inventory:read', 'inventory:list',
    'treatment_record:create', 'treatment_record:read', 'treatment_record:update', 'treatment_record:list', 'treatment_record:sign',
    'consent:create', 'consent:read', 'consent:list',
    'photo:create', 'photo:read', 'photo:list',
    'message:read', 'message:list',
    'prescription:create', 'prescription:read', 'prescription:update', 'prescription:list', 'prescription:sign',
  ],

  nurse_practitioner: [
    'patient:read', 'patient:update', 'patient:list',
    'appointment:read', 'appointment:update', 'appointment:list',
    'invoice:read', 'invoice:list',
    'inventory:read', 'inventory:update', 'inventory:list',
    'treatment_record:create', 'treatment_record:read', 'treatment_record:update', 'treatment_record:list', 'treatment_record:sign',
    'consent:create', 'consent:read', 'consent:list',
    'photo:create', 'photo:read', 'photo:list',
    'message:read', 'message:list',
    'prescription:create', 'prescription:read', 'prescription:list',
  ],

  registered_nurse: [
    'patient:read', 'patient:update', 'patient:list',
    'appointment:read', 'appointment:update', 'appointment:list',
    'inventory:read', 'inventory:update', 'inventory:list',
    'treatment_record:read', 'treatment_record:update', 'treatment_record:list',
    'consent:create', 'consent:read', 'consent:list',
    'photo:create', 'photo:read', 'photo:list',
    'message:read', 'message:list',
  ],

  aesthetician: [
    'patient:read', 'patient:list',
    'appointment:read', 'appointment:update', 'appointment:list',
    'inventory:read', 'inventory:list',
    'treatment_record:create', 'treatment_record:read', 'treatment_record:update', 'treatment_record:list',
    'consent:create', 'consent:read', 'consent:list',
    'photo:create', 'photo:read', 'photo:list',
  ],

  laser_technician: [
    'patient:read', 'patient:list',
    'appointment:read', 'appointment:update', 'appointment:list',
    'inventory:read', 'inventory:list',
    'treatment_record:create', 'treatment_record:read', 'treatment_record:update', 'treatment_record:list',
    'consent:create', 'consent:read', 'consent:list',
    'photo:create', 'photo:read', 'photo:list',
  ],

  injection_specialist: [
    'patient:read', 'patient:list',
    'appointment:read', 'appointment:update', 'appointment:list',
    'inventory:read', 'inventory:update', 'inventory:list',
    'treatment_record:create', 'treatment_record:read', 'treatment_record:update', 'treatment_record:list',
    'consent:create', 'consent:read', 'consent:list',
    'photo:create', 'photo:read', 'photo:list',
  ],

  front_desk: [
    'patient:create', 'patient:read', 'patient:update', 'patient:list',
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:list',
    'invoice:create', 'invoice:read', 'invoice:list',
    'payment:create', 'payment:read', 'payment:list',
    'consent:read', 'consent:list',
    'message:create', 'message:read', 'message:list',
    'referral:create', 'referral:read', 'referral:list',
  ],

  office_manager: [
    'patient:create', 'patient:read', 'patient:update', 'patient:list', 'patient:export',
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:delete', 'appointment:list',
    'invoice:create', 'invoice:read', 'invoice:update', 'invoice:list', 'invoice:export',
    'payment:create', 'payment:read', 'payment:update', 'payment:list',
    'inventory:create', 'inventory:read', 'inventory:update', 'inventory:list',
    'consent:read', 'consent:list',
    'message:create', 'message:read', 'message:list',
    'campaign:create', 'campaign:read', 'campaign:update', 'campaign:list',
    'report:read', 'report:list', 'report:export',
    'analytics:read',
    'user:read', 'user:list',
    'settings:read', 'settings:update',
    'referral:create', 'referral:read', 'referral:update', 'referral:list',
  ],

  billing_specialist: [
    'patient:read', 'patient:list',
    'appointment:read', 'appointment:list',
    'invoice:create', 'invoice:read', 'invoice:update', 'invoice:list', 'invoice:export',
    'payment:create', 'payment:read', 'payment:update', 'payment:list',
    'report:read', 'report:list', 'report:export',
  ],

  marketing_coordinator: [
    'patient:read', 'patient:list',
    'appointment:read', 'appointment:list',
    'message:create', 'message:read', 'message:list',
    'campaign:create', 'campaign:read', 'campaign:update', 'campaign:delete', 'campaign:list',
    'report:read', 'report:list',
    'referral:create', 'referral:read', 'referral:update', 'referral:list',
  ],

  patient_coordinator: [
    'patient:create', 'patient:read', 'patient:update', 'patient:list',
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:list',
    'invoice:read', 'invoice:list',
    'consent:read', 'consent:list',
    'message:create', 'message:read', 'message:list',
    'referral:create', 'referral:read', 'referral:list',
  ],

  patient: [
    // Patients can only access their own data (enforced at query level)
    'patient:read', // Own profile only
    'appointment:create', 'appointment:read', 'appointment:update', 'appointment:list', // Own appointments
    'invoice:read', 'invoice:list', // Own invoices
    'payment:create', 'payment:read', 'payment:list', // Own payments
    'consent:create', 'consent:read', 'consent:list', // Own consents
    'photo:read', // Own photos
    'message:create', 'message:read', 'message:list', // Own messages
    'referral:create', 'referral:read', 'referral:list', // Own referrals
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(permission) : false;
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role can access a resource with a specific action
 */
export function canAccess(
  role: UserRole,
  resource: ResourceType,
  action: PermissionAction
): boolean {
  return hasPermission(role, `${resource}:${action}` as Permission);
}

/**
 * RBAC middleware factory
 * Creates middleware that checks permissions
 */
export function requirePermission(...permissions: Permission[]) {
  return (userRole: UserRole): boolean => {
    return hasAllPermissions(userRole, permissions);
  };
}

/**
 * Check if role is a clinical role (can access PHI)
 */
export function isClinicalRole(role: UserRole): boolean {
  const clinicalRoles: UserRole[] = [
    'medical_director',
    'physician',
    'nurse_practitioner',
    'registered_nurse',
    'aesthetician',
    'laser_technician',
    'injection_specialist',
  ];
  return clinicalRoles.includes(role);
}

/**
 * Check if role is an admin role
 */
export function isAdminRole(role: UserRole): boolean {
  const adminRoles: UserRole[] = ['admin', 'office_manager'];
  return adminRoles.includes(role);
}

/**
 * Check if role can prescribe medications
 */
export function canPrescribe(role: UserRole): boolean {
  return hasPermission(role, 'prescription:sign');
}

// Role hierarchy for UI display
export const ROLE_HIERARCHY: UserRole[] = [
  'admin',
  'medical_director',
  'physician',
  'nurse_practitioner',
  'registered_nurse',
  'injection_specialist',
  'aesthetician',
  'laser_technician',
  'office_manager',
  'billing_specialist',
  'front_desk',
  'patient_coordinator',
  'marketing_coordinator',
  'patient',
];

// Human-readable role names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Administrator',
  medical_director: 'Medical Director',
  physician: 'Physician',
  nurse_practitioner: 'Nurse Practitioner',
  registered_nurse: 'Registered Nurse',
  aesthetician: 'Aesthetician',
  laser_technician: 'Laser Technician',
  injection_specialist: 'Injection Specialist',
  front_desk: 'Front Desk',
  office_manager: 'Office Manager',
  billing_specialist: 'Billing Specialist',
  marketing_coordinator: 'Marketing Coordinator',
  patient_coordinator: 'Patient Coordinator',
  patient: 'Patient',
};
