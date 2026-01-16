const { describe, it, expect, beforeEach, vi } = require('vitest');

// Simple test to check if we can read from the store
describe('Debug Test', () => {
  it('should show what getPatientId returns', async () => {
    const consent = await import('../src/routes/messaging-consent.ts');
    
    // Clear and re-init stores
    consent.clearStores();
    
    const store = consent.getConsentStore();
    const consents = Array.from(store.values());
    
    console.log('Number of consents:', consents.length);
    if (consents.length > 0) {
      console.log('First patient ID:', consents[0].patientId);
      console.log('Is UUID:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(consents[0].patientId));
    }
  });
});
