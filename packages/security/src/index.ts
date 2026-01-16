/**
 * @medical-spa/security
 *
 * HIPAA-compliant security utilities for Medical Spa Platform
 *
 * Features:
 * - AES-256-GCM encryption for PHI
 * - Comprehensive audit logging
 * - TOTP-based MFA
 * - Role-based access control
 * - Secure session management
 */

// Encryption
export {
  encryptPHI,
  decryptPHI,
  encryptFields,
  decryptFields,
  generateEncryptionKey,
  hashValue,
  generateSecureToken,
  secureCompare,
  PHI_FIELDS,
} from './encryption';

// Audit Logging
export {
  logAuditEvent,
  logPHIAccess,
  logLogin,
  logLogout,
  logDataExport,
  initializeAuditLogger,
  createAuditMiddleware,
  type AuditAction,
  type AuditLogEntry,
  type AuditQueryParams,
} from './audit-logger';

// MFA
export {
  generateMFASecret,
  generateMFASetupUrl,
  verifyMFAToken,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
  createMFASetup,
  isMFAConfigured,
  requiresMFA,
  type MFASetupResult,
} from './mfa';

// RBAC
export {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  canAccess,
  requirePermission,
  isClinicalRole,
  isAdminRole,
  canPrescribe,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  type UserRole,
  type ResourceType,
  type PermissionAction,
  type Permission,
} from './rbac';

// Session Management
export {
  generateSessionToken,
  generateSessionId,
  createSession,
  validateSession,
  extendSession,
  shouldShowTimeoutWarning,
  getRemainingSessionTime,
  hashSessionToken,
  verifySessionToken,
  parseAuthorizationHeader,
  createDeviceFingerprint,
  SESSION_PRESETS,
  type Session,
  type SessionConfig,
  type SessionValidationResult,
} from './session';
