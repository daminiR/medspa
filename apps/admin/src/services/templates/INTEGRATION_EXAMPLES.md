# Template Engine Integration Examples

Real-world examples of integrating the template engine with the messaging system.

## Integration Pattern

```typescript
// 1. Import the template engine
import { TemplateEngine, type TemplateContext } from '@/services/templates';
import { messagingService } from '@/services/messaging/core';

// 2. Create engine instance (usually singleton)
const templateEngine = new TemplateEngine();

// 3. Build context from data sources
const context: TemplateContext = {
  patient: patientData,
  appointment: appointmentData,
  clinic: clinicData,
};

// 4. Render template
const result = await templateEngine.render(template, context);

// 5. Handle rendering result
if (!result.success) {
  logger.error('Template rendering failed', result.errors);
  return;
}

// 6. Send message
await messagingService.sendSMS({
  to: patient.phone,
  body: result.message,
  metadata: { characterCount: result.characterCount, segmentCount: result.segmentCount },
});

// 7. Log warnings/issues
if (result.warnings.length > 0) {
  logger.warn('Template warnings', result.warnings);
}
```

## Use Case 1: Appointment Confirmation

### Before (Hardcoded Template)

```typescript
// src/services/messaging/reminders.ts (existing code)
async sendConfirmation(appointment: Appointment): Promise<void> {
  if (!this.config.sendConfirmation || !appointment.smsOptIn) {
    return;
  }

  try {
    const message = generateMessage('appointment_confirmation', {
      patientFirstName: appointment.patientName.split(' ')[0],
      appointmentDate: this.formatDate(appointment.date),
      appointmentTime: appointment.time,
      providerName: appointment.provider,
      serviceName: appointment.service,
    });

    if (message.success && message.message) {
      await messagingService.sendSMS({
        to: appointment.patientPhone,
        body: message.message,
        patientId: appointment.patientId,
        metadata: { type: 'appointment_confirmation', appointmentId: appointment.id },
      });
    }
  } catch (error) {
    console.error('Error sending confirmation:', error);
  }
}
```

### After (Using Template Engine)

```typescript
import { TemplateEngine, type TemplateContext } from '@/services/templates';

const templateEngine = new TemplateEngine();

async sendConfirmation(appointment: Appointment): Promise<void> {
  if (!this.config.sendConfirmation || !appointment.smsOptIn) {
    return;
  }

  try {
    // Your template (can come from database)
    const template = `Hi {patient.firstName}! Your appointment at {clinic.name} is confirmed for {appointment.date} at {appointment.time} with {appointment.provider} for {appointment.service}. Reply C to confirm, R to reschedule, or STOP to opt out.`;

    // Build context from appointment data
    const context: TemplateContext = {
      patient: { firstName: appointment.patientName.split(' ')[0] },
      appointment: {
        date: appointment.date,
        time: appointment.time,
        provider: appointment.provider,
        service: appointment.service,
      },
      clinic: { name: 'Luxe Medical Spa' }, // From config
    };

    // Render template
    const result = await templateEngine.render(template, context);

    if (!result.success) {
      console.error('Template rendering failed:', result.errors);
      return;
    }

    // Log message details
    console.log(`[Confirmation] Sending SMS: ${result.characterCount} chars, ${result.segmentCount} segment(s)`);

    // Send message
    await messagingService.sendSMS({
      to: appointment.patientPhone,
      body: result.message,
      patientId: appointment.patientId,
      metadata: {
        type: 'appointment_confirmation',
        appointmentId: appointment.id,
        characterCount: result.characterCount,
        segmentCount: result.segmentCount,
      },
    });

    // Log warnings
    if (result.warnings.length > 0) {
      console.warn('Template warnings:', result.warnings);
    }

    // Mark as sent
    await this.markReminderSent(appointment.id, 'confirmation');
  } catch (error) {
    console.error('Error sending confirmation:', error);
  }
}
```

**Benefits**:
- Template stored in config/database instead of hardcoded
- Automatic formatting (dates, times, etc.)
- Character count tracking for billing
- Better error handling
- Conditional content support

## Use Case 2: 24-Hour Reminder with Conditionals

### Enhanced Template with Conditionals

```typescript
const template = `
Hi {patient.firstName}! Reminder: Your {appointment.service} appointment is {appointment.date} at {appointment.time}.

Pre-treatment: Avoid alcohol, blood thinners, and heavy exercise. Arrive makeup-free.

{if patient.hasPackage}
This appointment counts toward your package. You have {patient.credits} sessions remaining.
{/if}

{if appointment.daysUntil < 1}
⚠️ Appointment is TODAY! Please arrive 10 minutes early.
{/if}

Questions? Call {clinic.phone} or visit {clinic.website}
`;

async send24HourReminder(appointment: Appointment): Promise<void> {
  if (!this.config.send24hrReminder || !appointment.smsOptIn) {
    return;
  }

  try {
    // Fetch complete patient data for context
    const patient = await this.getPatient(appointment.patientId);

    const context: TemplateContext = {
      patient: {
        firstName: patient.firstName,
        hasPackage: patient.hasPackage,
        credits: patient.credits,
      },
      appointment: {
        date: appointment.date,
        time: appointment.time,
        service: appointment.service,
        daysUntil: this.calculateDaysUntil(appointment.date),
      },
      clinic: {
        phone: '(555) 123-4567',
        website: 'luxemedspa.com/book',
      },
    };

    const result = await templateEngine.render(template, context);

    if (!result.success) {
      console.error('Template rendering failed:', result.errors);
      return;
    }

    // IMPORTANT: Check character count
    if (result.segmentCount > 1) {
      console.warn(`Message requires ${result.segmentCount} SMS segments - higher cost`);
      // Could optionally shorten template or skip for budget reasons
    }

    await messagingService.sendSMS({
      to: appointment.patientPhone,
      body: result.message,
      patientId: appointment.patientId,
      metadata: {
        type: 'reminder_24hr',
        appointmentId: appointment.id,
        characterCount: result.characterCount,
        segmentCount: result.segmentCount,
      },
    });

    await this.markReminderSent(appointment.id, 'reminder24hr');
  } catch (error) {
    console.error('Error sending 24hr reminder:', error);
  }
}
```

## Use Case 3: Dynamic Post-Treatment Follow-up

### Template with Service-Based Conditionals

```typescript
const template = `
{patient.firstName}, thanks for choosing us for your {appointment.service}!

{if appointment.service == "Botox"}
Aftercare: No lying down for 4 hours. Avoid strenuous exercise for 24hrs. Results appear in 3-7 days.
{/if}

{if appointment.service == "Filler"}
Aftercare: Ice for any swelling (20 min on, 20 min off). Avoid vigorous exercise for 48 hours. Results are immediate!
{/if}

{if appointment.service == "Chemical Peel"}
Aftercare: Keep skin moisturized. Apply SPF 30+ daily. Avoid sun exposure for 7 days. Mild redness is normal.
{/if}

{if appointment.service == "Microneedling"}
Aftercare: No makeup for 24 hours. Avoid hot water, saunas, and intense exercise for 48 hours. Apply soothing serum as recommended.
{/if}

{if appointment.service == "Laser"}
Aftercare: Avoid sun exposure completely. Apply ice if needed. Use SPF 50+ for 4 weeks. Results improve over 4-6 weeks.
{/if}

Questions? Call {clinic.phone}. Book your next appointment: {clinic.website}

{if patient.hasPackage}
Remember: You have {patient.credits} more sessions in your package!
{/if}
`;

async sendPostTreatmentFollowUp(appointment: Appointment): Promise<void> {
  try {
    const patient = await this.getPatient(appointment.patientId);

    const context: TemplateContext = {
      patient: {
        firstName: patient.firstName,
        hasPackage: patient.packageActive,
        credits: patient.remainingSessions,
      },
      appointment: {
        service: appointment.service,
      },
      clinic: {
        phone: '(555) 123-4567',
        website: 'luxemedspa.com/book',
      },
    };

    const result = await templateEngine.render(template, context);

    if (!result.success) {
      console.error('Template rendering failed:', result.errors);
      return;
    }

    // Verify message length before sending
    if (result.characterCount > 320) { // 2 segments
      console.warn(`Post-treatment message is long (${result.segmentCount} segments)`);
      // Consider if this is acceptable cost
    }

    await messagingService.sendSMS({
      to: appointment.patientPhone,
      body: result.message,
      patientId: appointment.patientId,
      metadata: {
        type: 'post_treatment_followup',
        appointmentId: appointment.id,
        service: appointment.service,
      },
    });
  } catch (error) {
    console.error('Error sending post-treatment follow-up:', error);
  }
}
```

**Benefits**:
- One template handles all service types
- Service-specific aftercare automatically included
- Conditional package information
- Reduces template maintenance burden

## Use Case 4: Balance/Payment Reminders

### Template with Financial Information

```typescript
const template = `
Hi {patient.firstName}, we noticed your account has a balance of {patient.balance}.

{if patient.balance > 150}
Don't forget to settle your account! Contact us at {clinic.phone} to pay via card, bank transfer, or payment plan.
{/if}

{if patient.balance <= 150}
Quick reminder: Please settle your account balance when convenient.
{/if}

{if patient.hasPackage}
Your {patient.packageName} package has {patient.credits} sessions remaining - great value!
{/if}

{if patient.hasPackage == false}
💡 TIP: Our packages offer 20% savings. Ask about options when you visit!
{/if}

Ready to book? Visit {clinic.website}
`;

async sendBalanceReminder(patient: Patient): Promise<void> {
  try {
    // Only send to patients with balance
    if (patient.balance <= 0) {
      return;
    }

    const context: TemplateContext = {
      patient: {
        firstName: patient.firstName,
        balance: patient.balance,
        hasPackage: patient.hasPackage,
        packageName: patient.packageName,
        credits: patient.remainingSessions,
      },
      clinic: {
        phone: '(555) 123-4567',
        website: 'luxemedspa.com/book',
      },
    };

    const result = await templateEngine.render(template, context);

    if (!result.success) {
      console.error('Template rendering failed:', result.errors);
      return;
    }

    await messagingService.sendSMS({
      to: patient.phone,
      body: result.message,
      patientId: patient.id,
      metadata: {
        type: 'balance_reminder',
        balanceAmount: patient.balance,
      },
    });

    // Track reminder sent
    await this.logBalanceReminder(patient.id);
  } catch (error) {
    console.error('Error sending balance reminder:', error);
  }
}
```

## Use Case 5: Waitlist Opening Notification

### Time-Sensitive Conditional Template

```typescript
const template = `
Great news {patient.firstName}! A {appointment.service} opening just became available!

📅 {appointment.date} at {appointment.time}
👨‍⚕️ With {appointment.provider}
📍 {clinic.name}

⏰ QUICK ACTION REQUIRED: Reply YES within 30 minutes to claim this slot, or NO to stay on waitlist.

{if appointment.daysUntil < 3}
🚀 This is super soon - act fast!
{/if}

Can't make it? No problem - stay on the waitlist for future openings.
`;

async sendWaitlistOpening(
  patient: Patient,
  appointment: Appointment
): Promise<void> {
  try {
    const context: TemplateContext = {
      patient: { firstName: patient.firstName },
      appointment: {
        date: appointment.date,
        time: appointment.time,
        service: appointment.service,
        provider: appointment.provider,
        daysUntil: this.calculateDaysUntil(appointment.date),
      },
      clinic: { name: 'Luxe Medical Spa' },
    };

    const result = await templateEngine.render(template, context);

    if (!result.success) {
      console.error('Template rendering failed:', result.errors);
      return;
    }

    // Time-sensitive message - high priority
    await messagingService.sendSMS({
      to: patient.phone,
      body: result.message,
      patientId: patient.id,
      priority: 'high', // Send immediately
      metadata: {
        type: 'waitlist_opening',
        appointmentId: appointment.id,
        expiresIn: 30, // minutes
      },
    });
  } catch (error) {
    console.error('Error sending waitlist notification:', error);
  }
}
```

## Use Case 6: Bulk Campaign with Template Engine

### Using template engine for campaigns

```typescript
async sendCampaign(campaign: Campaign, patients: Patient[]): Promise<void> {
  const templateEngine = new TemplateEngine();
  const results = {
    sent: 0,
    failed: 0,
    warnings: 0,
  };

  for (const patient of patients) {
    try {
      // Skip non-opted-in patients
      if (!patient.smsOptIn) {
        continue;
      }

      const context: TemplateContext = {
        patient: {
          firstName: patient.firstName,
          lastVisit: patient.lastVisit,
          upcomingCount: patient.upcomingAppointments?.length || 0,
        },
        clinic: {
          name: 'Luxe Medical Spa',
          phone: '(555) 123-4567',
          website: 'luxemedspa.com',
        },
      };

      const result = await templateEngine.render(campaign.message, context);

      if (!result.success) {
        console.error(`Failed to render for patient ${patient.id}:`, result.errors);
        results.failed++;
        continue;
      }

      // Check character count for billing
      if (result.segmentCount > 1) {
        results.warnings++;
      }

      await messagingService.sendSMS({
        to: patient.phone,
        body: result.message,
        patientId: patient.id,
        metadata: {
          campaignId: campaign.id,
          characterCount: result.characterCount,
          segmentCount: result.segmentCount,
        },
      });

      results.sent++;

      // Rate limiting - wait between sends
      await this.delay(100);
    } catch (error) {
      console.error(`Error sending to patient ${patient.id}:`, error);
      results.failed++;
    }
  }

  console.log('Campaign send complete:', results);

  // Log campaign metrics
  await this.logCampaignResults(campaign.id, results);
}
```

## Service Enhancement: Replace generateMessage()

The existing `generateMessage()` function can be enhanced or replaced:

```typescript
// OLD: services/messaging/templates.ts
export function generateMessage(
  templateId: string,
  variables: Record<string, any>
): { success: boolean; message?: string } {
  // Current implementation
}

// NEW: services/messaging/templates.ts
import { TemplateEngine } from '@/services/templates';

const templateEngine = new TemplateEngine();

export async function generateMessage(
  templateId: string,
  variables: Record<string, any>
): Promise<{ success: boolean; message?: string; characterCount?: number; segmentCount?: number }> {
  try {
    // Get template from database or constants
    const template = TEMPLATES[templateId];

    if (!template) {
      return { success: false };
    }

    // Build context (backward compatible with existing code)
    const context: TemplateContext = {
      patient: {
        firstName: variables.patientFirstName,
        // ... map other patient variables
      },
      appointment: {
        date: variables.appointmentDate ? new Date(variables.appointmentDate) : undefined,
        // ... map other appointment variables
      },
      clinic: {
        phone: variables.clinicPhone,
        // ... map other clinic variables
      },
    };

    const result = await templateEngine.render(template.body, context);

    return {
      success: result.success,
      message: result.message,
      characterCount: result.characterCount,
      segmentCount: result.segmentCount,
    };
  } catch (error) {
    console.error('Error generating message:', error);
    return { success: false };
  }
}
```

## Key Integration Points

1. **In reminders service** (`src/services/messaging/reminders.ts`)
   - Replace `generateMessage()` calls with template engine
   - Track character count for SMS billing

2. **In messaging service** (`src/services/messaging/core.ts`)
   - Log character count in message metadata
   - Track multi-segment messages separately

3. **In campaigns** (`src/app/api/messaging/campaigns`)
   - Use template engine for bulk sending
   - Preview templates before sending

4. **In UI** (`src/components/messaging`)
   - Preview templates with character count
   - Test conditionals before saving

5. **In analytics**
   - Track average message length
   - Monitor multi-segment message costs
   - Analyze template usage

## Summary

The template engine provides:
- ✅ Flexible variable substitution
- ✅ Conditional content rendering
- ✅ Automatic formatting (dates, currency, etc.)
- ✅ Character counting for SMS cost management
- ✅ Safe fallbacks for missing data
- ✅ HIPAA compliance checking
- ✅ Calculated fields (age, days until, etc.)
- ✅ Easy integration with existing messaging system

This reduces code complexity, improves template management, and provides better visibility into message composition.
