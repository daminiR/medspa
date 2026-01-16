/**
 * Variable Resolver Service
 * Resolves template variables from patient, appointment, and clinic data
 *
 * Features:
 * - Resolve nested properties (patient.firstName, appointment.service)
 * - Type-aware formatting (dates, numbers, currencies)
 * - Safe fallback values for missing data
 * - Calculated fields (patient age from DOB, time remaining)
 * - Custom formatters for different field types
 *
 * Usage:
 * const resolver = new VariableResolver();
 * const result = await resolver.resolve('patient.firstName', context);
 */

import { TemplateContext } from './template-engine';

// ============= Types =============

export interface ResolveResult {
  found: boolean;
  value: string;
  type?: string;
  usedFallback?: boolean;
  error?: string;
}

export interface FieldFormatter {
  name: string;
  type: 'text' | 'date' | 'number' | 'currency' | 'percentage';
  format: (value: any) => string;
  fallback: string;
}

// ============= Variable Resolver Class =============

export class VariableResolver {
  private formatters: Map<string, FieldFormatter> = new Map();
  private fieldMappings: Map<string, { path: string; formatter: string }> = new Map();

  constructor() {
    this.initializeFormatters();
    this.initializeFieldMappings();
  }

  /**
   * Initialize built-in formatters for different field types
   */
  private initializeFormatters(): void {
    // Text formatter
    this.registerFormatter({
      name: 'text',
      type: 'text',
      format: (value) => String(value || '').trim(),
      fallback: '',
    });

    // Date formatters
    this.registerFormatter({
      name: 'date_short',
      type: 'date',
      format: (value) => this.formatDateShort(value),
      fallback: '[date]',
    });

    this.registerFormatter({
      name: 'date_long',
      type: 'date',
      format: (value) => this.formatDateLong(value),
      fallback: '[date]',
    });

    this.registerFormatter({
      name: 'time_12h',
      type: 'text',
      format: (value) => this.formatTime12h(value),
      fallback: '[time]',
    });

    this.registerFormatter({
      name: 'time_24h',
      type: 'text',
      format: (value) => this.formatTime24h(value),
      fallback: '[time]',
    });

    // Number formatters
    this.registerFormatter({
      name: 'number',
      type: 'number',
      format: (value) => String(Number(value).toFixed(0)),
      fallback: '0',
    });

    this.registerFormatter({
      name: 'decimal',
      type: 'number',
      format: (value) => String(Number(value).toFixed(2)),
      fallback: '0.00',
    });

    // Currency formatter
    this.registerFormatter({
      name: 'currency_usd',
      type: 'currency',
      format: (value) => `$${Number(value).toFixed(2)}`,
      fallback: '$0.00',
    });

    // Percentage formatter
    this.registerFormatter({
      name: 'percentage',
      type: 'percentage',
      format: (value) => `${Number(value).toFixed(0)}%`,
      fallback: '0%',
    });
  }

  /**
   * Initialize field-to-formatter mappings
   */
  private initializeFieldMappings(): void {
    // Patient fields
    this.fieldMappings.set('patient.firstName', { path: 'patient.firstName', formatter: 'text' });
    this.fieldMappings.set('patient.lastName', { path: 'patient.lastName', formatter: 'text' });
    this.fieldMappings.set('patient.phone', { path: 'patient.phone', formatter: 'text' });
    this.fieldMappings.set('patient.email', { path: 'patient.email', formatter: 'text' });
    this.fieldMappings.set('patient.balance', { path: 'patient.balance', formatter: 'currency_usd' });
    this.fieldMappings.set('patient.credits', { path: 'patient.credits', formatter: 'number' });
    this.fieldMappings.set('patient.packageName', { path: 'patient.packageName', formatter: 'text' });
    this.fieldMappings.set('patient.lastVisit', { path: 'patient.lastVisit', formatter: 'date_short' });
    this.fieldMappings.set('patient.upcomingCount', { path: 'patient.upcomingCount', formatter: 'number' });

    // Appointment fields
    this.fieldMappings.set('appointment.date', { path: 'appointment.date', formatter: 'date_short' });
    this.fieldMappings.set('appointment.time', { path: 'appointment.time', formatter: 'time_12h' });
    this.fieldMappings.set('appointment.duration', { path: 'appointment.duration', formatter: 'number' });
    this.fieldMappings.set('appointment.service', { path: 'appointment.service', formatter: 'text' });
    this.fieldMappings.set('appointment.provider', { path: 'appointment.provider', formatter: 'text' });
    this.fieldMappings.set('appointment.location', { path: 'appointment.location', formatter: 'text' });
    this.fieldMappings.set('appointment.status', { path: 'appointment.status', formatter: 'text' });

    // Clinic fields
    this.fieldMappings.set('clinic.name', { path: 'clinic.name', formatter: 'text' });
    this.fieldMappings.set('clinic.phone', { path: 'clinic.phone', formatter: 'text' });
    this.fieldMappings.set('clinic.address', { path: 'clinic.address', formatter: 'text' });
    this.fieldMappings.set('clinic.website', { path: 'clinic.website', formatter: 'text' });
  }

  /**
   * Register a custom formatter
   */
  registerFormatter(formatter: FieldFormatter): void {
    this.fieldMappings.set(formatter.name, formatter as any);
    this.formatters.set(formatter.name, formatter);
  }

  /**
   * Resolve a variable from context
   * Supports: patient.firstName, appointment.date, clinic.phone, etc.
   */
  async resolve(variablePath: string, context: TemplateContext): Promise<ResolveResult> {
    console.log('[VariableResolver] Resolving:', variablePath);

    try {
      // Check if we have a mapping for this variable
      const mapping = this.fieldMappings.get(variablePath);
      const formatterName = mapping?.formatter || 'text';
      const formatter = this.formatters.get(formatterName);

      if (!formatter) {
        console.warn('[VariableResolver] No formatter found:', formatterName);
        return {
          found: false,
          value: '[unknown]',
          usedFallback: true,
          error: `Unknown formatter: ${formatterName}`,
        };
      }

      // Resolve the value from context
      const value = this.resolvePath(variablePath, context);

      console.log('[VariableResolver] Resolved value:', { variablePath, value, isNull: value === null || value === undefined });

      if (value === null || value === undefined) {
        // Try to get a calculated field
        const calculated = this.getCalculatedField(variablePath, context);
        if (calculated) {
          console.log('[VariableResolver] Using calculated field:', { variablePath, calculated });
          return {
            found: true,
            value: calculated,
            type: formatter.type,
            usedFallback: false,
          };
        }

        // Use fallback
        console.log('[VariableResolver] Using fallback:', formatter.fallback);
        return {
          found: false,
          value: formatter.fallback,
          type: formatter.type,
          usedFallback: true,
          error: `Variable not found: ${variablePath}`,
        };
      }

      // Format the value
      const formatted = formatter.format(value);

      console.log('[VariableResolver] Formatted:', { variablePath, raw: value, formatted });

      return {
        found: true,
        value: formatted,
        type: formatter.type,
        usedFallback: false,
      };
    } catch (error: any) {
      console.error('[VariableResolver] Error resolving:', { variablePath, error: error.message });

      return {
        found: false,
        value: '[error]',
        usedFallback: true,
        error: error.message,
      };
    }
  }

  /**
   * Resolve nested property path from context
   * Examples: 'patient.firstName', 'appointment.date'
   */
  private resolvePath(path: string, context: TemplateContext): any {
    const parts = path.split('.');
    let value: any = context;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part.trim()];
      } else {
        return null;
      }
    }

    return value;
  }

  /**
   * Get calculated fields that don't exist in raw data
   * Examples: age from DOB, time until appointment, etc.
   */
  private getCalculatedField(variablePath: string, context: TemplateContext): string | null {
    const parts = variablePath.split('.');

    // Patient calculated fields
    if (parts[0] === 'patient') {
      if (parts[1] === 'age' && context.patient?.dateOfBirth) {
        const age = this.calculateAge(context.patient.dateOfBirth);
        return String(age);
      }

      if (parts[1] === 'firstName' && context.patient?.firstName) {
        return context.patient.firstName;
      }

      if (parts[1] === 'lastName' && context.patient?.lastName) {
        return context.patient.lastName;
      }

      if (parts[1] === 'fullName' && context.patient) {
        const firstName = context.patient.firstName || '';
        const lastName = context.patient.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'Patient';
      }

      if (parts[1] === 'initials' && context.patient) {
        const firstName = context.patient.firstName?.[0] || '';
        const lastName = context.patient.lastName?.[0] || '';
        return `${firstName}${lastName}`.toUpperCase() || 'P';
      }

      if (parts[1] === 'formattedPhone' && context.patient?.phone) {
        return this.formatPhone(context.patient.phone);
      }
    }

    // Appointment calculated fields
    if (parts[0] === 'appointment') {
      if (parts[1] === 'dateTime' && context.appointment?.date && context.appointment?.time) {
        return `${this.formatDateShort(context.appointment.date)} at ${context.appointment.time}`;
      }

      if (parts[1] === 'durationHours' && context.appointment?.duration) {
        const hours = context.appointment.duration / 60;
        return hours === 1 ? '1 hour' : `${hours.toFixed(1)} hours`;
      }

      if (parts[1] === 'daysUntil' && context.appointment?.date) {
        const daysUntil = this.calculateDaysUntil(context.appointment.date);
        return String(daysUntil);
      }

      if (parts[1] === 'timeRemaining' && context.appointment?.date) {
        return this.calculateTimeRemaining(context.appointment.date);
      }
    }

    return null;
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: Date | string): number {
    const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Calculate days until appointment
   */
  private calculateDaysUntil(date: Date | string): number {
    const appointmentDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);

    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Calculate human-readable time remaining until appointment
   */
  private calculateTimeRemaining(date: Date | string): string {
    const appointmentDate = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = appointmentDate.getTime() - now.getTime();

    if (diff < 0) {
      return 'passed';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    }

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  /**
   * Format phone number
   */
  private formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    return phone;
  }

  /**
   * Format date - short format (e.g., "Jan 15, 2024")
   */
  private formatDateShort(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return '[date]';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  }

  /**
   * Format date - long format (e.g., "Monday, January 15, 2024")
   */
  private formatDateLong(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return '[date]';
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  }

  /**
   * Format time in 12-hour format with AM/PM
   */
  private formatTime12h(time: string | Date): string {
    if (!time) {
      return '[time]';
    }

    // If it's already a string, try to parse it
    if (typeof time === 'string') {
      // Handle HH:MM format
      if (time.includes(':')) {
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);

        if (isNaN(h) || isNaN(m)) {
          return time;
        }

        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;

        return `${displayHour}:${String(m).padStart(2, '0')} ${ampm}`;
      }

      return time;
    }

    // If it's a Date object
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(time as Date);
  }

  /**
   * Format time in 24-hour format
   */
  private formatTime24h(time: string | Date): string {
    if (!time) {
      return '[time]';
    }

    if (typeof time === 'string') {
      return time;
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(time as Date);
  }
}

export default VariableResolver;
