/**
 * HIPAA-Compliant Audit Trail System
 * Tracks all access and modifications to patient data
 */

import { z } from 'zod';

// Audit event types
export enum AuditEventType {
  // Authentication events
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  SESSION_TIMEOUT = 'SESSION_TIMEOUT',
  
  // Patient data access
  PATIENT_VIEW = 'PATIENT_VIEW',
  PATIENT_CREATE = 'PATIENT_CREATE',
  PATIENT_UPDATE = 'PATIENT_UPDATE',
  PATIENT_DELETE = 'PATIENT_DELETE',
  PATIENT_SEARCH = 'PATIENT_SEARCH',
  
  // Medical records
  CHART_VIEW = 'CHART_VIEW',
  CHART_CREATE = 'CHART_CREATE',
  CHART_UPDATE = 'CHART_UPDATE',
  CHART_DELETE = 'CHART_DELETE',
  CHART_SIGN = 'CHART_SIGN',
  CHART_ADDENDUM = 'CHART_ADDENDUM',
  
  // Prescriptions
  PRESCRIPTION_CREATE = 'PRESCRIPTION_CREATE',
  PRESCRIPTION_VIEW = 'PRESCRIPTION_VIEW',
  PRESCRIPTION_SEND = 'PRESCRIPTION_SEND',
  PRESCRIPTION_CANCEL = 'PRESCRIPTION_CANCEL',
  
  // Appointments
  APPOINTMENT_VIEW = 'APPOINTMENT_VIEW',
  APPOINTMENT_CREATE = 'APPOINTMENT_CREATE',
  APPOINTMENT_UPDATE = 'APPOINTMENT_UPDATE',
  APPOINTMENT_CANCEL = 'APPOINTMENT_CANCEL',
  
  // Billing
  BILLING_VIEW = 'BILLING_VIEW',
  BILLING_CREATE = 'BILLING_CREATE',
  BILLING_UPDATE = 'BILLING_UPDATE',
  PAYMENT_PROCESS = 'PAYMENT_PROCESS',
  REFUND_PROCESS = 'REFUND_PROCESS',
  
  // Documents
  DOCUMENT_VIEW = 'DOCUMENT_VIEW',
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  DOCUMENT_DOWNLOAD = 'DOCUMENT_DOWNLOAD',
  DOCUMENT_DELETE = 'DOCUMENT_DELETE',
  DOCUMENT_SHARE = 'DOCUMENT_SHARE',
  
  // Photos
  PHOTO_VIEW = 'PHOTO_VIEW',
  PHOTO_UPLOAD = 'PHOTO_UPLOAD',
  PHOTO_DELETE = 'PHOTO_DELETE',
  PHOTO_CONSENT = 'PHOTO_CONSENT',
  
  // Reports
  REPORT_GENERATE = 'REPORT_GENERATE',
  REPORT_VIEW = 'REPORT_VIEW',
  REPORT_EXPORT = 'REPORT_EXPORT',
  
  // Administrative
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  
  // Security events
  ACCESS_DENIED = 'ACCESS_DENIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  BACKUP_CREATE = 'BACKUP_CREATE',
  BACKUP_RESTORE = 'BACKUP_RESTORE',
  
  // Communication
  MESSAGE_SEND = 'MESSAGE_SEND',
  MESSAGE_VIEW = 'MESSAGE_VIEW',
  EMAIL_SEND = 'EMAIL_SEND',
  
  // Consent
  CONSENT_OBTAINED = 'CONSENT_OBTAINED',
  CONSENT_REVOKED = 'CONSENT_REVOKED',
  
  // Emergency access
  EMERGENCY_ACCESS = 'EMERGENCY_ACCESS',
  BREAK_GLASS = 'BREAK_GLASS', // Emergency override
}

// Audit log entry schema
export const AuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  eventType: z.nativeEnum(AuditEventType),
  userId: z.string(),
  userName: z.string(),
  userRole: z.string(),
  patientId: z.string().optional(),
  patientName: z.string().optional(),
  resourceType: z.string(),
  resourceId: z.string(),
  action: z.string(),
  result: z.enum(['SUCCESS', 'FAILURE', 'ERROR']),
  ipAddress: z.string(),
  userAgent: z.string(),
  sessionId: z.string(),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  details: z.record(z.any()).optional(),
  changesMade: z.object({
    before: z.record(z.any()).optional(),
    after: z.record(z.any()).optional(),
    fieldsModified: z.array(z.string()).optional(),
  }).optional(),
  riskScore: z.number().min(0).max(100).optional(),
  flags: z.array(z.string()).optional(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

/**
 * HIPAA Audit Trail Service
 */
export class AuditTrailService {
  private static instance: AuditTrailService;
  private buffer: AuditLog[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Flush buffer every 5 seconds
    this.flushInterval = setInterval(() => this.flush(), 5000);
  }
  
  static getInstance(): AuditTrailService {
    if (!AuditTrailService.instance) {
      AuditTrailService.instance = new AuditTrailService();
    }
    return AuditTrailService.instance;
  }
  
  /**
   * Log an audit event
   */
  async log(event: Partial<AuditLog> & {
    eventType: AuditEventType;
    userId: string;
    resourceType: string;
    resourceId: string;
    action: string;
  }): Promise<void> {
    try {
      const auditLog: AuditLog = {
        id: this.generateId(),
        timestamp: new Date(),
        result: 'SUCCESS',
        userName: event.userName || 'Unknown',
        userRole: event.userRole || 'Unknown',
        ipAddress: event.ipAddress || '0.0.0.0',
        userAgent: event.userAgent || 'Unknown',
        sessionId: event.sessionId || 'Unknown',
        ...event,
      };
      
      // Calculate risk score
      auditLog.riskScore = this.calculateRiskScore(auditLog);
      
      // Check for suspicious activity
      if (auditLog.riskScore > 70) {
        auditLog.flags = [...(auditLog.flags || []), 'HIGH_RISK'];
        await this.handleHighRiskEvent(auditLog);
      }
      
      // Add to buffer
      this.buffer.push(auditLog);
      
      // Flush immediately for critical events
      if (this.isCriticalEvent(auditLog.eventType)) {
        await this.flush();
      }
      
    } catch (error) {
      console.error('Audit logging error:', error);
      // Never throw - audit failures shouldn't break the app
    }
  }
  
  /**
   * Log patient data access
   */
  async logPatientAccess(
    userId: string,
    patientId: string,
    action: 'VIEW' | 'UPDATE' | 'DELETE',
    details?: any
  ): Promise<void> {
    const eventMap = {
      VIEW: AuditEventType.PATIENT_VIEW,
      UPDATE: AuditEventType.PATIENT_UPDATE,
      DELETE: AuditEventType.PATIENT_DELETE,
    };
    
    await this.log({
      eventType: eventMap[action],
      userId,
      patientId,
      resourceType: 'PATIENT',
      resourceId: patientId,
      action,
      details,
    });
  }
  
  /**
   * Log chart access/modification
   */
  async logChartAccess(
    userId: string,
    patientId: string,
    chartId: string,
    action: 'VIEW' | 'CREATE' | 'UPDATE' | 'SIGN',
    changesMade?: any
  ): Promise<void> {
    const eventMap = {
      VIEW: AuditEventType.CHART_VIEW,
      CREATE: AuditEventType.CHART_CREATE,
      UPDATE: AuditEventType.CHART_UPDATE,
      SIGN: AuditEventType.CHART_SIGN,
    };
    
    await this.log({
      eventType: eventMap[action],
      userId,
      patientId,
      resourceType: 'CHART',
      resourceId: chartId,
      action,
      changesMade,
    });
  }
  
  /**
   * Log authentication events
   */
  async logAuth(
    userId: string,
    eventType: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED',
    ipAddress: string,
    userAgent: string,
    details?: any
  ): Promise<void> {
    const eventMap = {
      LOGIN: AuditEventType.LOGIN,
      LOGOUT: AuditEventType.LOGOUT,
      LOGIN_FAILED: AuditEventType.LOGIN_FAILED,
    };
    
    await this.log({
      eventType: eventMap[eventType],
      userId,
      resourceType: 'AUTH',
      resourceId: userId,
      action: eventType,
      ipAddress,
      userAgent,
      result: eventType === 'LOGIN_FAILED' ? 'FAILURE' : 'SUCCESS',
      details,
    });
  }
  
  /**
   * Log security events
   */
  async logSecurityEvent(
    userId: string,
    eventType: AuditEventType,
    details: any,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ): Promise<void> {
    const riskScores = {
      LOW: 25,
      MEDIUM: 50,
      HIGH: 75,
      CRITICAL: 100,
    };
    
    await this.log({
      eventType,
      userId,
      resourceType: 'SECURITY',
      resourceId: 'SYSTEM',
      action: eventType,
      details,
      riskScore: riskScores[riskLevel],
      flags: [riskLevel],
    });
  }
  
  /**
   * Query audit logs
   */
  async query(filters: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    patientId?: string;
    eventType?: AuditEventType;
    resourceType?: string;
    minRiskScore?: number;
  }): Promise<AuditLog[]> {
    // In production, query from database
    // For now, return filtered buffer
    return this.buffer.filter(log => {
      if (filters.startDate && log.timestamp < filters.startDate) return false;
      if (filters.endDate && log.timestamp > filters.endDate) return false;
      if (filters.userId && log.userId !== filters.userId) return false;
      if (filters.patientId && log.patientId !== filters.patientId) return false;
      if (filters.eventType && log.eventType !== filters.eventType) return false;
      if (filters.resourceType && log.resourceType !== filters.resourceType) return false;
      if (filters.minRiskScore && (log.riskScore || 0) < filters.minRiskScore) return false;
      return true;
    });
  }
  
  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalEvents: number;
    byEventType: Record<string, number>;
    byUser: Record<string, number>;
    highRiskEvents: AuditLog[];
    accessPatterns: any;
    anomalies: any[];
  }> {
    const logs = await this.query({ startDate, endDate });
    
    const report = {
      totalEvents: logs.length,
      byEventType: {} as Record<string, number>,
      byUser: {} as Record<string, number>,
      highRiskEvents: logs.filter(l => (l.riskScore || 0) > 70),
      accessPatterns: this.analyzeAccessPatterns(logs),
      anomalies: this.detectAnomalies(logs),
    };
    
    // Count by event type
    logs.forEach(log => {
      report.byEventType[log.eventType] = (report.byEventType[log.eventType] || 0) + 1;
      report.byUser[log.userId] = (report.byUser[log.userId] || 0) + 1;
    });
    
    return report;
  }
  
  /**
   * Export audit logs for compliance
   */
  async exportForCompliance(
    startDate: Date,
    endDate: Date,
    format: 'JSON' | 'CSV' | 'PDF'
  ): Promise<string | Buffer> {
    const logs = await this.query({ startDate, endDate });
    
    switch (format) {
      case 'JSON':
        return JSON.stringify(logs, null, 2);
      
      case 'CSV':
        return this.convertToCSV(logs);
      
      case 'PDF':
        // In production, use PDF library
        return Buffer.from('PDF export not implemented');
      
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  // Private methods
  
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private calculateRiskScore(log: AuditLog): number {
    let score = 0;
    
    // High-risk event types
    const highRiskEvents = [
      AuditEventType.PATIENT_DELETE,
      AuditEventType.DATA_EXPORT,
      AuditEventType.PERMISSION_CHANGE,
      AuditEventType.BREAK_GLASS,
      AuditEventType.SUSPICIOUS_ACTIVITY,
    ];
    
    if (highRiskEvents.includes(log.eventType)) {
      score += 50;
    }
    
    // Failed actions
    if (log.result === 'FAILURE') {
      score += 20;
    }
    
    // After hours access (assuming business hours 8am-6pm)
    const hour = log.timestamp.getHours();
    if (hour < 8 || hour > 18) {
      score += 15;
    }
    
    // Weekend access
    const day = log.timestamp.getDay();
    if (day === 0 || day === 6) {
      score += 10;
    }
    
    // Bulk operations
    if (log.details?.bulkOperation) {
      score += 25;
    }
    
    return Math.min(score, 100);
  }
  
  private isCriticalEvent(eventType: AuditEventType): boolean {
    const criticalEvents = [
      AuditEventType.PATIENT_DELETE,
      AuditEventType.BREAK_GLASS,
      AuditEventType.DATA_EXPORT,
      AuditEventType.PERMISSION_CHANGE,
      AuditEventType.SUSPICIOUS_ACTIVITY,
    ];
    
    return criticalEvents.includes(eventType);
  }
  
  private async handleHighRiskEvent(log: AuditLog): Promise<void> {
    console.warn('HIGH RISK EVENT DETECTED:', log);
    
    // In production:
    // - Send immediate alert to security team
    // - Create incident ticket
    // - Lock account if needed
    // - Send notification to compliance officer
  }
  
  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    
    try {
      // In production, batch insert to database
      console.log(`Flushing ${this.buffer.length} audit logs to database`);
      
      // Clear buffer
      this.buffer = [];
      
    } catch (error) {
      console.error('Failed to flush audit logs:', error);
      // Keep logs in buffer for retry
    }
  }
  
  private analyzeAccessPatterns(logs: AuditLog[]): any {
    // Analyze access patterns for anomaly detection
    const patterns = {
      averageAccessPerUser: 0,
      peakAccessTimes: [] as string[],
      unusualAccess: [] as any[],
    };
    
    // Implementation would analyze logs for patterns
    
    return patterns;
  }
  
  private detectAnomalies(logs: AuditLog[]): any[] {
    const anomalies = [];
    
    // Detect unusual patterns
    // - Excessive access by single user
    // - Access outside normal patterns
    // - Failed login attempts
    // - Data export patterns
    
    return anomalies;
  }
  
  private convertToCSV(logs: AuditLog[]): string {
    const headers = [
      'Timestamp',
      'Event Type',
      'User ID',
      'User Name',
      'Patient ID',
      'Resource Type',
      'Resource ID',
      'Action',
      'Result',
      'IP Address',
      'Risk Score',
    ];
    
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.eventType,
      log.userId,
      log.userName,
      log.patientId || '',
      log.resourceType,
      log.resourceId,
      log.action,
      log.result,
      log.ipAddress,
      log.riskScore || 0,
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// Export singleton instance
export const auditTrail = AuditTrailService.getInstance();