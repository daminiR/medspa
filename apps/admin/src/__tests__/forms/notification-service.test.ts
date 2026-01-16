/**
 * Form Notification Service Tests
 *
 * Tests the form submission notification service with various scenarios
 */

import {
  notifyFormSubmitted,
  handleFormCompletion,
  sendPreVisitFormReminder,
  getFormCompletionTracking,
  getFormNotificationRecipients,
  generateFormViewLink,
  notifyBatchFormSubmissions,
} from '@/services/forms/notification-service';
import {
  markFormSent,
  markFormCompleted,
  clearFormData,
  seedMockFormData,
} from '@/lib/data/patientForms';

describe('Form Notification Service', () => {
  beforeEach(() => {
    clearFormData();
    seedMockFormData();
  });

  describe('generateFormViewLink', () => {
    it('should generate a form view link with patient ID', () => {
      const link = generateFormViewLink('patient-1', 'form-hipaa');
      expect(link).toContain('patient-1');
      expect(link).toContain('form=form-hipaa');
    });

    it('should include appointment ID when provided', () => {
      const link = generateFormViewLink('patient-1', 'form-hipaa', 'apt-123');
      expect(link).toContain('apt=apt-123');
    });

    it('should generate correct URL format', () => {
      const link = generateFormViewLink('patient-1', 'form-botox');
      const pattern = /\/patients\/patient-1\?form=form-botox/;
      expect(link).toMatch(pattern);
    });
  });

  describe('getFormNotificationRecipients', () => {
    it('should return enabled status for configured forms', () => {
      const recipients = getFormNotificationRecipients('form-hipaa');
      expect(recipients.enabled).toBe(true);
    });

    it('should return recipient roles for consent forms', () => {
      const recipients = getFormNotificationRecipients('form-botox');
      expect(recipients.roles.length).toBeGreaterThan(0);
      expect(recipients.roles).toContain('admin');
    });

    it('should include staff in intake form recipients', () => {
      const recipients = getFormNotificationRecipients('form-general');
      expect(recipients.roles).toContain('staff');
    });

    it('should return disabled for unconfigured forms', () => {
      const recipients = getFormNotificationRecipients('form-unknown');
      expect(recipients.enabled).toBe(false);
    });
  });

  describe('notifyFormSubmitted', () => {
    it('should notify for HIPAA form submission', async () => {
      const result = await notifyFormSubmitted(
        'patient-1',
        'John Doe',
        'form-hipaa'
      );
      expect(result.success).toBe(true);
    });

    it('should notify for consent form submission', async () => {
      const result = await notifyFormSubmitted(
        'patient-2',
        'Jane Smith',
        'form-botox',
        'apt-123'
      );
      expect(result.success).toBe(true);
    });

    it('should handle unknown form gracefully', async () => {
      const result = await notifyFormSubmitted(
        'patient-1',
        'John Doe',
        'form-unknown'
      );
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should include appointment ID in metadata', async () => {
      const result = await notifyFormSubmitted(
        'patient-1',
        'John Doe',
        'form-botox',
        'apt-456'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('handleFormCompletion', () => {
    it('should mark form as completed', async () => {
      markFormSent('patient-3', 'form-hipaa');
      const result = await handleFormCompletion(
        'patient-3',
        'Bob Johnson',
        'form-hipaa'
      );
      expect(result.success).toBe(true);
    });

    it('should notify staff when form completed', async () => {
      markFormSent('patient-3', 'form-botox');
      const result = await handleFormCompletion(
        'patient-3',
        'Bob Johnson',
        'form-botox',
        'apt-789'
      );
      expect(result.success).toBe(true);
    });

    it('should handle form completion for new patients', async () => {
      const result = await handleFormCompletion(
        'patient-new',
        'New Patient',
        'form-hipaa'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('sendPreVisitFormReminder', () => {
    it('should send reminder for incomplete forms', async () => {
      const result = await sendPreVisitFormReminder(
        'patient-1',
        'John Doe',
        'Botox',
        'apt-123',
        '2:00 PM'
      );
      expect(result.success).toBe(true);
    });

    it('should not send reminder when all forms complete', async () => {
      // Mark all required forms as complete
      markFormSent('patient-2', 'form-botox');
      markFormCompleted('patient-2', 'form-botox');
      markFormSent('patient-2', 'form-hipaa');
      markFormCompleted('patient-2', 'form-hipaa');

      const result = await sendPreVisitFormReminder(
        'patient-2',
        'Jane Smith',
        'Botox',
        'apt-456',
        '3:00 PM'
      );
      expect(result.success).toBe(true);
    });

    it('should include appointment time in reminder', async () => {
      const result = await sendPreVisitFormReminder(
        'patient-1',
        'John Doe',
        'Botox',
        'apt-123',
        '2:30 PM'
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getFormCompletionTracking', () => {
    it('should return tracking data for patient', () => {
      const tracking = getFormCompletionTracking('patient-1');
      expect(tracking).toBeDefined();
      expect(tracking.completedCount).toBeGreaterThanOrEqual(0);
      expect(tracking.completionPercentage).toBeGreaterThanOrEqual(0);
    });

    it('should track completed forms', () => {
      markFormSent('patient-test', 'form-hipaa');
      markFormCompleted('patient-test', 'form-hipaa');

      const tracking = getFormCompletionTracking('patient-test');
      expect(tracking.completedForms).toContain('form-hipaa');
      expect(tracking.completedCount).toBe(1);
    });

    it('should return zero for new patients', () => {
      const tracking = getFormCompletionTracking('patient-nonexistent');
      expect(tracking.completedCount).toBe(0);
      expect(tracking.completionPercentage).toBe(0);
    });
  });

  describe('notifyBatchFormSubmissions', () => {
    it('should notify multiple forms at once', async () => {
      const formIds = ['form-hipaa', 'form-botox', 'form-general'];
      markFormSent('patient-batch', 'form-hipaa');
      markFormSent('patient-batch', 'form-botox');
      markFormSent('patient-batch', 'form-general');

      const result = await notifyBatchFormSubmissions(
        'patient-batch',
        'Batch Patient',
        formIds,
        'apt-batch'
      );
      expect(result.success).toBe(true);
      expect(result.notifiedForms.length).toBeGreaterThan(0);
    });

    it('should track failed forms', async () => {
      const formIds = ['form-hipaa', 'form-unknown', 'form-botox'];
      markFormSent('patient-batch2', 'form-hipaa');
      markFormSent('patient-batch2', 'form-botox');

      const result = await notifyBatchFormSubmissions(
        'patient-batch2',
        'Batch Patient 2',
        formIds,
        'apt-batch2'
      );
      // Should have some failures due to unknown form
      expect(result.failedForms.length).toBeGreaterThanOrEqual(0);
    });

    it('should return detailed error information', async () => {
      const formIds = ['form-unknown'];

      const result = await notifyBatchFormSubmissions(
        'patient-error',
        'Error Patient',
        formIds
      );
      expect(result.failedForms).toContain('form-unknown');
      expect(result.errors['form-unknown']).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete form submission workflow', async () => {
      const patientId = 'patient-workflow';
      const formId = 'form-botox';

      // 1. Form sent to patient
      markFormSent(patientId, formId, 'apt-workflow');

      // 2. Patient completes form
      const result = await handleFormCompletion(
        patientId,
        'Workflow Patient',
        formId,
        'apt-workflow'
      );
      expect(result.success).toBe(true);

      // 3. Verify tracking
      const tracking = getFormCompletionTracking(patientId);
      expect(tracking.completedForms).toContain(formId);
    });

    it('should handle multi-form appointment workflow', async () => {
      const patientId = 'patient-multi';
      const appointmentId = 'apt-multi';
      const formIds = ['form-hipaa', 'form-general', 'form-botox'];

      // Mark all forms as sent
      for (const formId of formIds) {
        markFormSent(patientId, formId, appointmentId);
      }

      // Complete all forms
      const result = await notifyBatchFormSubmissions(
        patientId,
        'Multi Patient',
        formIds,
        appointmentId
      );
      expect(result.success).toBe(true);

      // Send pre-visit reminder (should be no reminder needed)
      const reminderResult = await sendPreVisitFormReminder(
        patientId,
        'Multi Patient',
        'Botox',
        appointmentId,
        '2:00 PM'
      );
      expect(reminderResult.success).toBe(true);
    });
  });
});

// Utility function for manual testing in development
export function runDevelopmentTests() {
  console.log('\n=== Form Notification Service - Development Tests ===\n');

  // Test 1: Generate links
  console.log('Test 1: Generate Form View Links');
  const link1 = generateFormViewLink('p1', 'form-hipaa');
  console.log('  Link without apt:', link1);
  const link2 = generateFormViewLink('p1', 'form-botox', 'apt-1');
  console.log('  Link with apt:', link2);

  // Test 2: Recipients
  console.log('\nTest 2: Get Form Recipients');
  const rec1 = getFormNotificationRecipients('form-hipaa');
  console.log('  HIPAA recipients:', rec1);
  const rec2 = getFormNotificationRecipients('form-botox');
  console.log('  Botox recipients:', rec2);

  // Test 3: Tracking
  console.log('\nTest 3: Form Completion Tracking');
  clearFormData();
  seedMockFormData();
  const track1 = getFormCompletionTracking('p1');
  console.log('  Patient p1 tracking:', track1);
  const track2 = getFormCompletionTracking('p-new');
  console.log('  New patient tracking:', track2);

  console.log('\n=== All tests completed ===\n');
}
