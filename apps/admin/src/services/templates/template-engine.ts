/**
 * Message Template Engine
 * Core template variable parsing and substitution engine
 *
 * Features:
 * - Variable substitution ({patient_name}, {appointment_date}, etc.)
 * - Conditional rendering (if patient.has_package show balance)
 * - Safe fallback for missing variables
 * - SMS character counting and segmentation
 * - HIPAA compliance checking
 *
 * Usage:
 * const engine = new TemplateEngine();
 * const result = await engine.render(template, context);
 */

import { VariableResolver } from './variable-resolver';

// ============= Types =============

export interface TemplateContext {
  patient?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    balance?: number;
    credits?: number;
    hasPackage?: boolean;
    packageName?: string;
    lastVisit?: Date;
    upcomingCount?: number;
    id?: string;
    [key: string]: any;
  };
  appointment?: {
    date?: Date;
    time?: string;
    duration?: number;
    service?: string;
    provider?: string;
    location?: string;
    status?: string;
    id?: string;
    [key: string]: any;
  };
  clinic?: {
    name?: string;
    phone?: string;
    address?: string;
    website?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface RenderResult {
  success: boolean;
  message: string;
  characterCount: number;
  segmentCount: number;
  warnings: string[];
  errors: string[];
  variables: {
    used: string[];
    missing: string[];
    fallback: string[];
  };
}

export interface TemplateVariable {
  name: string;
  type: 'text' | 'date' | 'number' | 'boolean';
  required: boolean;
  fallback?: string;
  description: string;
}

// ============= SMS Constants =============

const SMS_LIMITS = {
  SINGLE_SEGMENT: 160,
  MULTI_SEGMENT: 153,
  WARNING_THRESHOLD: 140,
};

// ============= Template Engine Class =============

export class TemplateEngine {
  private variableResolver: VariableResolver;
  private variableCache: Map<string, string> = new Map();

  constructor() {
    this.variableResolver = new VariableResolver();
  }

  /**
   * Parse template and extract variable names
   * Supports: {variable_name}, {object.nested.property}
   */
  parseVariables(template: string): string[] {
    const regex = /\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g;
    const variables: Set<string> = new Set();
    let match;

    while ((match = regex.exec(template)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Extract conditional blocks from template
   * Format: {if condition}content{/if}
   */
  parseConditionals(template: string): Map<string, { condition: string; content: string }> {
    const conditionals = new Map<string, { condition: string; content: string }>();
    const regex = /\{if\s+([^}]+)\}([\s\S]*?)\{\/if\}/g;
    let match;
    let index = 0;

    while ((match = regex.exec(template)) !== null) {
      const id = `__conditional_${index++}`;
      conditionals.set(id, {
        condition: match[1].trim(),
        content: match[2],
      });
    }

    return conditionals;
  }

  /**
   * Render template with context
   * Returns detailed result with variable tracking and character count
   */
  async render(template: string, context: TemplateContext): Promise<RenderResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const usedVariables: string[] = [];
    const missingVariables: string[] = [];
    const fallbackVariables: string[] = [];

    try {
      let result = template;

      // DEBUG: Log input
      console.log('[TemplateEngine] Rendering template with context:', {
        templateLength: template.length,
        contextKeys: Object.keys(context),
      });

      // Step 1: Process conditionals
      const conditionals = this.parseConditionals(result);
      const conditionalReplacements = new Map<string, string>();

      const conditionEntries = Array.from(conditionals.entries());
      for (const [id, { condition, content }] of conditionEntries) {
        console.log('[TemplateEngine] Processing conditional:', { id, condition });

        const conditionMet = this.evaluateCondition(condition, context);
        console.log('[TemplateEngine] Condition result:', { id, conditionMet });

        conditionalReplacements.set(id, conditionMet ? content : '');
      }

      // Replace conditionals with their placeholders
      const replacementEntries = Array.from(conditionalReplacements.entries());
      for (const [id, replacement] of replacementEntries) {
        const regex = new RegExp(`\\{if[^}]*\\}[\\s\\S]*?\\{/if\\}`, '');
        result = result.replace(regex, replacement);
      }

      // DEBUG: After conditionals
      console.log('[TemplateEngine] After conditionals:', { resultLength: result.length });

      // Step 2: Extract and resolve variables
      const variables = this.parseVariables(result);
      console.log('[TemplateEngine] Found variables:', variables);

      // Step 3: Resolve each variable
      const resolvedVariables = new Map<string, { value: string; usedFallback: boolean }>();

      for (const variable of variables) {
        console.log('[TemplateEngine] Resolving variable:', variable);

        const resolved = await this.variableResolver.resolve(variable, context);

        console.log('[TemplateEngine] Resolved variable:', { variable, ...resolved });

        if (resolved.found) {
          usedVariables.push(variable);
          resolvedVariables.set(variable, {
            value: resolved.value,
            usedFallback: resolved.usedFallback || false,
          });

          if (resolved.usedFallback) {
            fallbackVariables.push(variable);
          }
        } else {
          missingVariables.push(variable);
          // Use empty string or warning placeholder
          resolvedVariables.set(variable, {
            value: `[${variable}]`,
            usedFallback: true,
          });
          warnings.push(`Variable not found: {${variable}}`);
        }
      }

      // Step 4: Replace variables in template
      const varEntries = Array.from(resolvedVariables.entries());
      for (const [variable, { value }] of varEntries) {
        const regex = new RegExp(`\\{${this.escapeRegex(variable)}\\}`, 'g');
        result = result.replace(regex, value);
      }

      console.log('[TemplateEngine] After variable substitution:', { resultLength: result.length });

      // Step 5: Calculate character count and segments
      const charCount = result.length;
      const segmentCount = this.calculateSegments(charCount);

      // Step 6: Check for warnings
      if (charCount > SMS_LIMITS.SINGLE_SEGMENT) {
        warnings.push(
          `Message is ${charCount} characters (${segmentCount} SMS segments). ` +
          `Additional charges may apply.`
        );
      } else if (charCount > SMS_LIMITS.WARNING_THRESHOLD) {
        warnings.push(
          `Message is ${charCount} characters. Only ${SMS_LIMITS.SINGLE_SEGMENT - charCount} ` +
          `characters remaining before split into multiple segments.`
        );
      }

      // Step 7: Check for HIPAA compliance issues
      const hipaaWarnings = this.checkHIPAACompliance(result);
      warnings.push(...hipaaWarnings);

      console.log('[TemplateEngine] Render complete:', {
        success: true,
        charCount,
        segmentCount,
        usedVariablesCount: usedVariables.length,
        missingCount: missingVariables.length,
        warningsCount: warnings.length,
      });

      return {
        success: true,
        message: result,
        characterCount: charCount,
        segmentCount: segmentCount,
        warnings: warnings,
        errors: errors,
        variables: {
          used: usedVariables,
          missing: missingVariables,
          fallback: fallbackVariables,
        },
      };
    } catch (error: any) {
      console.error('[TemplateEngine] Render error:', error);

      errors.push(error.message || 'Unknown error during template rendering');

      return {
        success: false,
        message: template,
        characterCount: template.length,
        segmentCount: this.calculateSegments(template.length),
        warnings: warnings,
        errors: errors,
        variables: {
          used: usedVariables,
          missing: missingVariables,
          fallback: fallbackVariables,
        },
      };
    }
  }

  /**
   * Evaluate conditional expressions
   * Supports: patient.has_package, appointment.status == 'confirmed', etc.
   */
  private evaluateCondition(condition: string, context: TemplateContext): boolean {
    console.log('[TemplateEngine] Evaluating condition:', condition);

    try {
      // Handle simple property checks: {if patient.has_package}
      if (condition.includes('==') || condition.includes('!=') || condition.includes('>') || condition.includes('<')) {
        return this.evaluateComparison(condition, context);
      }

      // Handle property existence: {if patient.has_package}
      const parts = condition.split('.');
      let value: any = context;

      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          return false;
        }
      }

      // Treat as truthy/falsy
      return Boolean(value);
    } catch (error) {
      console.error('[TemplateEngine] Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Evaluate comparison expressions
   * Examples: appointment.status == 'confirmed', balance > 100
   */
  private evaluateComparison(condition: string, context: TemplateContext): boolean {
    // Simple comparison: appointment.status == 'confirmed'
    const operators = ['==', '!=', '>=', '<=', '>', '<'];
    let operator = '';
    let operatorIndex = -1;

    for (const op of operators) {
      const idx = condition.indexOf(op);
      if (idx > -1) {
        operator = op;
        operatorIndex = idx;
        break;
      }
    }

    if (operatorIndex === -1) {
      return false;
    }

    const leftSide = condition.substring(0, operatorIndex).trim();
    const rightSide = condition.substring(operatorIndex + operator.length).trim();

    const leftValue = this.resolvePath(leftSide, context);
    const rightValue = this.parseValue(rightSide);

    console.log('[TemplateEngine] Comparison:', { leftValue, operator, rightValue });

    switch (operator) {
      case '==':
        return leftValue == rightValue;
      case '!=':
        return leftValue != rightValue;
      case '>':
        return Number(leftValue) > Number(rightValue);
      case '<':
        return Number(leftValue) < Number(rightValue);
      case '>=':
        return Number(leftValue) >= Number(rightValue);
      case '<=':
        return Number(leftValue) <= Number(rightValue);
      default:
        return false;
    }
  }

  /**
   * Resolve nested property path from context
   * Example: 'patient.firstName' -> context.patient.firstName
   */
  private resolvePath(path: string, context: TemplateContext): any {
    const parts = path.trim().split('.');
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
   * Parse value - handles strings (quoted), numbers, booleans
   */
  private parseValue(value: string): any {
    value = value.trim();

    // String
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }

    // Number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Boolean
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Default to string
    return value;
  }

  /**
   * Calculate SMS segment count
   * First segment: 160 chars, subsequent: 153 chars
   */
  private calculateSegments(characterCount: number): number {
    if (characterCount <= SMS_LIMITS.SINGLE_SEGMENT) {
      return 1;
    }

    return 1 + Math.ceil((characterCount - SMS_LIMITS.SINGLE_SEGMENT) / SMS_LIMITS.MULTI_SEGMENT);
  }

  /**
   * Check for HIPAA compliance issues
   */
  private checkHIPAACompliance(message: string): string[] {
    const warnings: string[] = [];
    const sensitiveTerms = [
      'diagnosis',
      'condition',
      'treatment for',
      'medication',
      'prescription',
      'hiv',
      'cancer',
      'mental health',
      'psychiatric',
      'addiction',
      'substance abuse',
      'std',
      'pregnant',
      'pregnancy',
    ];

    const lowerMessage = message.toLowerCase();

    for (const term of sensitiveTerms) {
      if (lowerMessage.includes(term)) {
        warnings.push(`Contains potentially HIPAA-sensitive term: "${term}"`);
      }
    }

    return warnings;
  }

  /**
   * Escape regex special characters in variable name
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get available variables for a context
   */
  getAvailableVariables(context: TemplateContext): TemplateVariable[] {
    const variables: TemplateVariable[] = [];

    // Patient variables
    if (context.patient) {
      variables.push(
        { name: 'patient.firstName', type: 'text', required: false, description: 'Patient first name', fallback: 'there' },
        { name: 'patient.lastName', type: 'text', required: false, description: 'Patient last name', fallback: '' },
        { name: 'patient.phone', type: 'text', required: false, description: 'Patient phone number', fallback: '' },
        { name: 'patient.email', type: 'text', required: false, description: 'Patient email address', fallback: '' },
        { name: 'patient.balance', type: 'number', required: false, description: 'Patient account balance', fallback: '0' },
        { name: 'patient.credits', type: 'number', required: false, description: 'Patient credits available', fallback: '0' },
        { name: 'patient.hasPackage', type: 'boolean', required: false, description: 'Patient has active package' },
        { name: 'patient.packageName', type: 'text', required: false, description: 'Patient package name', fallback: '' },
        { name: 'patient.lastVisit', type: 'date', required: false, description: 'Date of last visit', fallback: 'Never' },
        { name: 'patient.upcomingCount', type: 'number', required: false, description: 'Number of upcoming appointments', fallback: '0' }
      );
    }

    // Appointment variables
    if (context.appointment) {
      variables.push(
        { name: 'appointment.date', type: 'date', required: false, description: 'Appointment date', fallback: '[date]' },
        { name: 'appointment.time', type: 'text', required: false, description: 'Appointment time', fallback: '[time]' },
        { name: 'appointment.duration', type: 'number', required: false, description: 'Appointment duration in minutes', fallback: '60' },
        { name: 'appointment.service', type: 'text', required: false, description: 'Service/treatment name', fallback: 'your appointment' },
        { name: 'appointment.provider', type: 'text', required: false, description: 'Provider name', fallback: 'your provider' },
        { name: 'appointment.location', type: 'text', required: false, description: 'Appointment location', fallback: 'our location' },
        { name: 'appointment.status', type: 'text', required: false, description: 'Appointment status', fallback: 'scheduled' }
      );
    }

    // Clinic variables
    if (context.clinic) {
      variables.push(
        { name: 'clinic.name', type: 'text', required: false, description: 'Clinic/spa name', fallback: 'Luxe Medical Spa' },
        { name: 'clinic.phone', type: 'text', required: false, description: 'Clinic phone number', fallback: '[phone]' },
        { name: 'clinic.address', type: 'text', required: false, description: 'Clinic address', fallback: '[address]' },
        { name: 'clinic.website', type: 'text', required: false, description: 'Clinic website', fallback: '' }
      );
    }

    return variables;
  }
}

export default TemplateEngine;
