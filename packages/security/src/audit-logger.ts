/**
 * HIPAA-Compliant Audit Logger
 *
 * Tracks all access to Protected Health Information (PHI)
 * - Who accessed the data
 * - What data was accessed
 * - When it was accessed
 * - From where (IP, user agent)
 * - What action was performed
 *
 * HIPAA requires 6-year retention of audit logs
 */

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'PRINT'
  | 'VIEW'
  | 'SEARCH'
  | 'DOWNLOAD'
  | 'SHARE'
  | 'ACCESS_DENIED'
  | 'PASSWORD_CHANGE'
  | 'MFA_ENABLED'
  | 'MFA_DISABLED';

export interface AuditLogEntry {
  // Who
  userId?: string;
  userEmail?: string;
  userName?: string;
  patientId?: string; // If action involves patient data

  // What
  action: AuditAction;
  resourceType: string; // e.g., 'patient', 'appointment', 'invoice'
  resourceId?: string;
  resourceName?: string;

  // Changes (for UPDATE actions)
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];

  // Context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  locationId?: string;

  // PHI tracking
  phiAccessed?: boolean;
  phiFields?: string[];

  // Additional metadata
  metadata?: Record<string, unknown>;

  // Timestamp (auto-set)
  timestamp?: Date;
}

// In-memory buffer for batching audit logs
// In production, this would write to the database
let auditBuffer: AuditLogEntry[] = [];
const BUFFER_SIZE = 100;
const FLUSH_INTERVAL_MS = 5000;

// Database insert function (to be injected)
let dbInsertFn: ((entries: AuditLogEntry[]) => Promise<void>) | null = null;

/**
 * Initialize the audit logger with database connection
 */
export function initializeAuditLogger(
  insertFn: (entries: AuditLogEntry[]) => Promise<void>
): void {
  dbInsertFn = insertFn;

  // Set up periodic flushing
  setInterval(flushAuditBuffer, FLUSH_INTERVAL_MS);
}

/**
 * Flush the audit buffer to database
 */
async function flushAuditBuffer(): Promise<void> {
  if (auditBuffer.length === 0 || !dbInsertFn) return;

  const entries = [...auditBuffer];
  auditBuffer = [];

  try {
    await dbInsertFn(entries);
  } catch (error) {
    // Re-add to buffer on failure
    auditBuffer = [...entries, ...auditBuffer];
    console.error('Failed to flush audit logs:', error);
  }
}

/**
 * Log an audit event
 *
 * @example
 * // Log patient record access
 * await logAuditEvent({
 *   userId: 'user-123',
 *   action: 'READ',
 *   resourceType: 'patient',
 *   resourceId: 'patient-456',
 *   phiAccessed: true,
 *   ipAddress: req.ip,
 *   userAgent: req.headers['user-agent'],
 * });
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const completeEntry: AuditLogEntry = {
    ...entry,
    timestamp: entry.timestamp || new Date(),
  };

  auditBuffer.push(completeEntry);

  // Flush if buffer is full
  if (auditBuffer.length >= BUFFER_SIZE) {
    await flushAuditBuffer();
  }
}

/**
 * Create an audit middleware for Express/Hono
 * Automatically logs requests that access PHI
 */
export function createAuditMiddleware() {
  return async (
    req: {
      userId?: string;
      ip?: string;
      headers: Record<string, string | string[] | undefined>;
      method: string;
      path: string;
    },
    resourceType: string,
    resourceId?: string
  ): Promise<void> => {
    const actionMap: Record<string, AuditAction> = {
      GET: 'READ',
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    await logAuditEvent({
      userId: req.userId,
      action: actionMap[req.method] || 'READ',
      resourceType,
      resourceId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
      },
    });
  };
}

/**
 * Log a PHI access event with field-level tracking
 *
 * @example
 * logPHIAccess({
 *   userId: 'user-123',
 *   patientId: 'patient-456',
 *   action: 'READ',
 *   phiFields: ['ssn', 'medicalHistory', 'allergies'],
 *   ipAddress: '192.168.1.1',
 * });
 */
export async function logPHIAccess(entry: {
  userId: string;
  patientId: string;
  action: AuditAction;
  phiFields: string[];
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}): Promise<void> {
  await logAuditEvent({
    userId: entry.userId,
    patientId: entry.patientId,
    action: entry.action,
    resourceType: 'patient',
    resourceId: entry.patientId,
    phiAccessed: true,
    phiFields: entry.phiFields,
    ipAddress: entry.ipAddress,
    userAgent: entry.userAgent,
    metadata: entry.reason ? { reason: entry.reason } : undefined,
  });
}

/**
 * Log a login event
 */
export async function logLogin(
  userId: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: success ? 'LOGIN' : 'ACCESS_DENIED',
    resourceType: 'session',
    ipAddress,
    userAgent,
    metadata: failureReason ? { failureReason } : undefined,
  });
}

/**
 * Log a logout event
 */
export async function logLogout(
  userId: string,
  sessionId?: string,
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'LOGOUT',
    resourceType: 'session',
    sessionId,
    ipAddress,
  });
}

/**
 * Log data export (HIPAA requires tracking data exports)
 */
export async function logDataExport(
  userId: string,
  exportType: string,
  recordCount: number,
  patientIds?: string[],
  ipAddress?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: 'EXPORT',
    resourceType: exportType,
    phiAccessed: Boolean(patientIds?.length),
    ipAddress,
    metadata: {
      recordCount,
      patientCount: patientIds?.length || 0,
    },
  });
}

/**
 * Query audit logs (for compliance reports)
 * This is a placeholder - actual implementation would query the database
 */
export interface AuditQueryParams {
  userId?: string;
  patientId?: string;
  action?: AuditAction;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  phiOnly?: boolean;
  limit?: number;
  offset?: number;
}

// Force flush on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await flushAuditBuffer();
  });
}
