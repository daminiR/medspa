/**
 * Template Engine Tests
 * Comprehensive test suite for template variable substitution and rendering
 */

import { TemplateEngine, type TemplateContext } from '../template-engine';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  // ============= Variable Parsing Tests =============

  describe('parseVariables', () => {
    it('should extract single variable', () => {
      const template = 'Hello {patient.firstName}!';
      const variables = engine.parseVariables(template);
      expect(variables).toContain('patient.firstName');
    });

    it('should extract multiple variables', () => {
      const template = '{patient.firstName} {patient.lastName} has appointment on {appointment.date}';
      const variables = engine.parseVariables(template);
      expect(variables).toContain('patient.firstName');
      expect(variables).toContain('patient.lastName');
      expect(variables).toContain('appointment.date');
    });

    it('should handle nested properties', () => {
      const template = 'Your appointment is {appointment.date} at {appointment.time}';
      const variables = engine.parseVariables(template);
      expect(variables).toHaveLength(2);
    });

    it('should not include duplicates', () => {
      const template = 'Hello {patient.firstName}, welcome {patient.firstName}!';
      const variables = engine.parseVariables(template);
      expect(variables.filter(v => v === 'patient.firstName')).toHaveLength(1);
    });
  });

  // ============= Conditional Tests =============

  describe('parseConditionals', () => {
    it('should extract conditional blocks', () => {
      const template = '{if patient.hasPackage}You have a package{/if}';
      const conditionals = engine['parseConditionals'](template);
      expect(conditionals.size).toBe(1);
    });

    it('should handle multiple conditionals', () => {
      const template = '{if patient.hasPackage}Package{/if} and {if appointment.status == "confirmed"}Confirmed{/if}';
      const conditionals = engine['parseConditionals'](template);
      expect(conditionals.size).toBe(2);
    });
  });

  // ============= Template Rendering Tests =============

  describe('render', () => {
    it('should render simple template with patient data', async () => {
      const template = 'Hello {patient.firstName}!';
      const context: TemplateContext = {
        patient: {
          firstName: 'John',
        },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Hello John!');
      expect(result.variables.used).toContain('patient.firstName');
    });

    it('should render appointment template', async () => {
      const template = 'Your appointment is {appointment.date} at {appointment.time} with {appointment.provider}';
      const context: TemplateContext = {
        appointment: {
          date: new Date('2024-01-15'),
          time: '2:30 PM',
          provider: 'Dr. Smith',
        },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Jan 15');
      expect(result.message).toContain('2:30 PM');
      expect(result.message).toContain('Dr. Smith');
    });

    it('should handle missing variables gracefully', async () => {
      const template = 'Hello {patient.firstName} {patient.lastName}!';
      const context: TemplateContext = {
        patient: {
          firstName: 'John',
          // lastName is missing
        },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('John');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.variables.missing).toContain('patient.lastName');
    });

    it('should count SMS characters correctly', async () => {
      const template = 'Hi {patient.firstName}! Your appointment is confirmed.';
      const context: TemplateContext = {
        patient: { firstName: 'John' },
      };

      const result = await engine.render(template, context);

      expect(result.characterCount).toBeLessThanOrEqual(160);
      expect(result.segmentCount).toBe(1);
    });

    it('should warn about multi-segment SMS', async () => {
      const longService = 'A'.repeat(150);
      const template = 'Your appointment for {appointment.service} is scheduled';
      const context: TemplateContext = {
        appointment: { service: longService },
      };

      const result = await engine.render(template, context);

      expect(result.characterCount).toBeGreaterThan(160);
      expect(result.segmentCount).toBeGreaterThan(1);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should render with currency formatting', async () => {
      const template = 'Your account balance is {patient.balance}';
      const context: TemplateContext = {
        patient: { balance: 150.5 },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('$150.50');
    });

    it('should handle conditional - true condition', async () => {
      const template = 'Your balance is {patient.balance}{if patient.hasPackage}. Package includes 5 more sessions.{/if}';
      const context: TemplateContext = {
        patient: {
          balance: 150,
          hasPackage: true,
        },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Package includes');
    });

    it('should handle conditional - false condition', async () => {
      const template = 'Your balance is {patient.balance}{if patient.hasPackage}. Package includes 5 more sessions.{/if}';
      const context: TemplateContext = {
        patient: {
          balance: 150,
          hasPackage: false,
        },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).not.toContain('Package includes');
      expect(result.message).toBe('Your balance is $150.00');
    });

    it('should handle comparison conditionals', async () => {
      const template = '{if patient.balance > 100}You have plenty of credit!{/if}';
      const context: TemplateContext = {
        patient: { balance: 150 },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('You have plenty');
    });

    it('should handle status comparison', async () => {
      const template = '{if appointment.status == "confirmed"}Appointment confirmed!{/if}';
      const context: TemplateContext = {
        appointment: { status: 'confirmed' },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Appointment confirmed');
    });
  });

  // ============= Character Counting Tests =============

  describe('SMS character counting', () => {
    it('should count single segment SMS', async () => {
      const template = 'Hi there!';
      const context: TemplateContext = {};

      const result = await engine.render(template, context);

      expect(result.characterCount).toBe(9);
      expect(result.segmentCount).toBe(1);
    });

    it('should count multi-segment SMS', async () => {
      const template = 'A'.repeat(200);
      const context: TemplateContext = {};

      const result = await engine.render(template, context);

      expect(result.segmentCount).toBeGreaterThan(1);
    });

    it('should warn near SMS limit', async () => {
      const template = 'A'.repeat(150);
      const context: TemplateContext = {};

      const result = await engine.render(template, context);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('remaining');
    });
  });

  // ============= Real-world Template Tests =============

  describe('Real-world templates', () => {
    it('should render appointment confirmation template', async () => {
      const template =
        'Hi {patient.firstName}! Your appointment at {clinic.name} is confirmed for {appointment.date} at {appointment.time} with {appointment.provider} for {appointment.service}. Reply C to confirm or R to reschedule.';

      const context: TemplateContext = {
        patient: { firstName: 'Sarah' },
        appointment: {
          date: new Date('2024-01-20'),
          time: '2:00 PM',
          provider: 'Dr. Johnson',
          service: 'Botox',
        },
        clinic: { name: 'Luxe Medical Spa' },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Sarah');
      expect(result.message).toContain('Luxe Medical Spa');
      expect(result.message).toContain('Jan 20');
      expect(result.message).toContain('2:00 PM');
      expect(result.message).toContain('Dr. Johnson');
      expect(result.message).toContain('Botox');
      expect(result.characterCount).toBeLessThanOrEqual(160);
    });

    it('should render prep reminder template', async () => {
      const template =
        '{patient.firstName}, important prep for your {appointment.service} on {appointment.date}: Avoid alcohol 24hrs before. Arrive makeup-free. See you soon!';

      const context: TemplateContext = {
        patient: { firstName: 'John' },
        appointment: {
          date: new Date('2024-01-18'),
          service: 'Chemical Peel',
        },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.characterCount).toBeLessThanOrEqual(160);
    });

    it('should render complex template with conditionals', async () => {
      const template =
        'Hi {patient.firstName}! Your balance is {patient.balance}{if patient.hasPackage}. Your package includes {appointment.durationHours} sessions.{/if} Appointment: {appointment.date} at {appointment.time}. {if appointment.status == "confirmed"}See you then!{/if}';

      const context: TemplateContext = {
        patient: {
          firstName: 'Maria',
          balance: 200,
          hasPackage: true,
        },
        appointment: {
          date: new Date('2024-01-22'),
          time: '3:30 PM',
          durationHours: '1 hour',
          status: 'confirmed',
        },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Maria');
      expect(result.message).toContain('$200.00');
      expect(result.message).toContain('1 hour');
      expect(result.message).toContain('See you then');
    });
  });

  // ============= Edge Cases =============

  describe('Edge cases', () => {
    it('should handle empty template', async () => {
      const result = await engine.render('', {});
      expect(result.success).toBe(true);
      expect(result.message).toBe('');
    });

    it('should handle template with no variables', async () => {
      const template = 'This is a plain message with no variables';
      const result = await engine.render(template, {});
      expect(result.success).toBe(true);
      expect(result.message).toBe(template);
      expect(result.variables.used).toHaveLength(0);
    });

    it('should handle null/undefined context', async () => {
      const template = 'Hello {patient.firstName}!';
      const result = await engine.render(template, {});
      expect(result.success).toBe(true);
      expect(result.variables.missing).toContain('patient.firstName');
    });

    it('should handle special characters in values', async () => {
      const template = 'Patient: {patient.firstName}';
      const context: TemplateContext = {
        patient: { firstName: "O'Brien" },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain("O'Brien");
    });

    it('should handle dates with various formats', async () => {
      const template = 'Date: {appointment.date}';
      const context: TemplateContext = {
        appointment: {
          date: new Date('2024-01-15T14:30:00Z'),
        },
      };

      const result = await engine.render(template, context);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Jan');
    });
  });

  // ============= Available Variables Tests =============

  describe('getAvailableVariables', () => {
    it('should return patient variables when patient context exists', () => {
      const context: TemplateContext = { patient: { firstName: 'John' } };
      const variables = engine.getAvailableVariables(context);

      expect(variables.some(v => v.name === 'patient.firstName')).toBe(true);
      expect(variables.some(v => v.name === 'patient.balance')).toBe(true);
    });

    it('should return appointment variables when appointment context exists', () => {
      const context: TemplateContext = { appointment: { date: new Date() } };
      const variables = engine.getAvailableVariables(context);

      expect(variables.some(v => v.name === 'appointment.date')).toBe(true);
      expect(variables.some(v => v.name === 'appointment.time')).toBe(true);
    });

    it('should return clinic variables', () => {
      const context: TemplateContext = { clinic: { name: 'Luxe Spa' } };
      const variables = engine.getAvailableVariables(context);

      expect(variables.some(v => v.name === 'clinic.name')).toBe(true);
      expect(variables.some(v => v.name === 'clinic.phone')).toBe(true);
    });
  });
});
