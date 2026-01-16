# Message Template Engine Guide

Complete guide for using the message template engine for SMS, email, and messaging templates.

## Overview

The template engine provides:
- **Variable substitution** - Replace {patient.firstName}, {appointment.date}, etc. with real data
- **Conditional rendering** - Show/hide content based on patient or appointment properties
- **Type-aware formatting** - Dates, times, currency, numbers automatically formatted
- **SMS character counting** - Know exactly how many SMS segments your message will use
- **HIPAA compliance checking** - Warnings for sensitive medical terms
- **Calculated fields** - Age from DOB, time remaining, days until appointment
- **Safe fallbacks** - Missing data gracefully handled with sensible defaults

## Quick Start

### Basic Variable Substitution

```typescript
import { TemplateEngine, type TemplateContext } from '@/services/templates';

const engine = new TemplateEngine();

const template = 'Hi {patient.firstName}! Your appointment is {appointment.date} at {appointment.time}.';

const context: TemplateContext = {
  patient: { firstName: 'Sarah' },
  appointment: {
    date: new Date('2024-01-15'),
    time: '2:30 PM',
  },
};

const result = await engine.render(template, context);

console.log(result.message);
// Output: "Hi Sarah! Your appointment is Jan 15 at 2:30 PM."

console.log(result.characterCount); // 52
console.log(result.segmentCount);   // 1 (single SMS)
console.log(result.warnings);        // []
```

## Variables

### Patient Variables

| Variable | Type | Example | Format |
|----------|------|---------|--------|
| `{patient.firstName}` | text | John | As-is |
| `{patient.lastName}` | text | Doe | As-is |
| `{patient.phone}` | text | (555) 123-4567 | Formatted |
| `{patient.email}` | text | john@example.com | As-is |
| `{patient.balance}` | number | $150.50 | Currency USD |
| `{patient.credits}` | number | 5 | Integer |
| `{patient.hasPackage}` | boolean | true/false | Boolean (use in conditionals) |
| `{patient.packageName}` | text | Premium 10 | As-is |
| `{patient.lastVisit}` | date | Jan 10, 2024 | Short format |
| `{patient.upcomingCount}` | number | 3 | Integer |
| `{patient.age}` | number | 35 | Calculated from DOB |
| `{patient.fullName}` | text | John Doe | Calculated |
| `{patient.initials}` | text | JD | Calculated |

### Appointment Variables

| Variable | Type | Example | Format |
|----------|------|---------|--------|
| `{appointment.date}` | date | Jan 15, 2024 | Short format |
| `{appointment.time}` | time | 2:30 PM | 12-hour format |
| `{appointment.duration}` | number | 60 | Minutes |
| `{appointment.service}` | text | Botox | As-is |
| `{appointment.provider}` | text | Dr. Smith | As-is |
| `{appointment.location}` | text | Suite 100 | As-is |
| `{appointment.status}` | text | confirmed | As-is |
| `{appointment.daysUntil}` | number | 5 | Calculated |
| `{appointment.timeRemaining}` | text | 5 days 3 hours | Calculated |

### Clinic Variables

| Variable | Type | Example | Format |
|----------|------|---------|--------|
| `{clinic.name}` | text | Luxe Medical Spa | As-is |
| `{clinic.phone}` | text | (555) 123-4567 | Formatted |
| `{clinic.address}` | text | 123 Main St | As-is |
| `{clinic.website}` | text | luxemedspa.com | As-is |

## Conditionals

### Basic Conditional

Show/hide content based on boolean properties:

```typescript
const template = `Your balance is {patient.balance}{if patient.hasPackage}. Your package includes 5 sessions.{/if}`;

// If patient.hasPackage = true:
// Output: "Your balance is $150.00. Your package includes 5 sessions."

// If patient.hasPackage = false:
// Output: "Your balance is $150.00"
```

### Comparison Conditional

Compare values:

```typescript
const template = `{if patient.balance > 100}You have plenty of credit!{/if}`;

// Supported operators: ==, !=, >, <, >=, <=
```

### Status Conditional

Check appointment status:

```typescript
const template = `{if appointment.status == "confirmed"}See you soon!{/if}`;
```

### Nested Conditionals Example

```typescript
const template = `
Hi {patient.firstName}!

Your {appointment.service} appointment is {appointment.date} at {appointment.time}.

{if patient.hasPackage}
This counts toward your package. You have {patient.credits} sessions remaining.
{/if}

{if appointment.status == "confirmed"}
We look forward to seeing you!
{/if}

{if appointment.daysUntil < 2}
⚠️ Your appointment is tomorrow! Please arrive 10 minutes early.
{/if}
`;
```

## Real-World Examples

### Appointment Confirmation SMS

```typescript
const template = `Hi {patient.firstName}! Your appointment at {clinic.name} is confirmed for {appointment.date} at {appointment.time} with {appointment.provider} for {appointment.service}. Reply C to confirm or R to reschedule. STOP to opt out.`;

// Result (60 characters, 1 SMS):
// "Hi Sarah! Your appointment at Luxe Medical Spa is confirmed for Jan 15 at 2:00 PM with Dr. Smith for Botox. Reply C to confirm or R to reschedule. STOP to opt out."
```

### 24-Hour Reminder with Prep Instructions

```typescript
const template = `Tomorrow at {appointment.time}, you have {appointment.service}! Prep: Stay hydrated, avoid blood thinners, arrive makeup-free. Questions? Call {clinic.phone}`;

// Automatic formatting:
// - Date/time automatically formatted
// - Phone number formatted as (555) 123-4567
// - Only {clinic.phone} - no patient name, keeps it concise
```

### Post-Treatment Follow-up with Conditional Aftercare

```typescript
const template = `
{patient.firstName}, thanks for choosing us for your {appointment.service}!

{if appointment.service == "Botox"}
Aftercare: No lying down for 4 hours. Avoid exercise for 24hrs.
{/if}

{if appointment.service == "Filler"}
Aftercare: Ice for swelling, avoid strenuous activity for 24hrs.
{/if}

{if patient.hasPackage}
You have {patient.credits} sessions remaining. Book your next appointment now!
{/if}

Questions? Call {clinic.phone}
`;
```

### Balance Due Reminder with Package Option

```typescript
const template = `Hi {patient.firstName}! Your account has a balance of {patient.balance}.{if patient.hasPackage == false} Consider our {patient.packageName} package - save 20% on upcoming treatments!{/if} Call {clinic.phone} to pay or book your next appointment.`;
```

### Waitlist Opening Notification

```typescript
const template = `Great news {patient.firstName}! An opening just became available for {appointment.service} on {appointment.date} at {appointment.time}. Reply YES within 30 min to book, or NO to stay on waitlist.`;
```

## Character Counting

SMS has character limits per segment:

- **First segment**: 160 characters
- **Each additional segment**: 153 characters (3 chars lost to UDH)
- **Warning threshold**: 140 characters

The engine automatically calculates:

```typescript
const result = await engine.render(template, context);

console.log(result.characterCount);  // Total characters in rendered message
console.log(result.segmentCount);    // Number of SMS segments needed
console.log(result.warnings);        // Warnings if approaching or exceeding limits
```

### Example

```typescript
// 45 character message - fits in 1 SMS
const template = 'Hi there! Your appointment is confirmed.';
// result.characterCount = 45
// result.segmentCount = 1
// result.warnings = []

// 180 character message - needs 2 SMS
const template = 'A'.repeat(180);
// result.characterCount = 180
// result.segmentCount = 2
// result.warnings = ["Message is 180 characters (2 SMS segments). Additional charges may apply."]

// 150 character message - warning about limit
const template = 'A'.repeat(150);
// result.characterCount = 150
// result.segmentCount = 1
// result.warnings = ["Message is 150 characters. Only 10 characters remaining before split into multiple segments."]
```

## Response Format

```typescript
interface RenderResult {
  success: boolean;           // Whether rendering was successful
  message: string;            // Final rendered message
  characterCount: number;     // Total characters
  segmentCount: number;       // SMS segments needed
  warnings: string[];         // Non-fatal warnings (character count, HIPAA terms)
  errors: string[];           // Fatal errors
  variables: {
    used: string[];           // Variables that were found and substituted
    missing: string[];        // Variables that weren't found (used fallback)
    fallback: string[];       // Variables that used fallback values
  };
}
```

## Error Handling

```typescript
const result = await engine.render(template, context);

if (!result.success) {
  console.error('Rendering failed:', result.errors);
  // Fallback to plain template
  return template;
}

// Check for issues
if (result.variables.missing.length > 0) {
  console.warn('Missing variables:', result.variables.missing);
}

if (result.warnings.length > 0) {
  result.warnings.forEach(w => console.warn(w));
}

// Use rendered message
sendSMS(result.message);
```

## Best Practices

### 1. Always Check Character Count

```typescript
// ✅ GOOD - Check if message fits in single SMS
if (result.segmentCount > 1) {
  console.warn('Message requires multiple SMS - cost will be higher');
}

// ❌ BAD - Assume message fits
sendSMS(result.message);
```

### 2. Handle Missing Variables

```typescript
// ✅ GOOD - Fallback gracefully
if (result.variables.missing.length > 0) {
  // Log and monitor missing data
  logger.warn('Missing variables', { missing: result.variables.missing });
  // Message still sends, uses fallback values
}

// ❌ BAD - Fail if any variable is missing
if (result.variables.missing.length > 0) {
  throw new Error('Cannot send message without all variables');
}
```

### 3. Don't Include Sensitive Medical Information

```typescript
// ✅ GOOD - Generic language
'Your {appointment.service} appointment is {appointment.date} at {appointment.time}'

// ❌ BAD - Reveals medical condition
'Your HIV test appointment is scheduled for {appointment.date}'
```

### 4. Use Conditionals for Personalization

```typescript
// ✅ GOOD - Different messages for different patients
const template = `
{if patient.hasPackage}
Don't forget - you have {patient.credits} sessions left in your package!
{/if}

{if patient.hasPackage == false}
Interested in our package? Save 20% on your next booking.
{/if}
`;

// ❌ BAD - Generic message for everyone
'Book your next appointment today!'
```

### 5. Test with Real Data

```typescript
// ✅ GOOD - Test with realistic context
const context: TemplateContext = {
  patient: mockPatient,        // Real patient data structure
  appointment: mockAppointment, // Real appointment data
  clinic: mockClinic,           // Real clinic data
};

// ❌ BAD - Only test with minimal data
const context = { patient: { firstName: 'John' } };
```

## Integration with Messaging Service

```typescript
import { TemplateEngine } from '@/services/templates';
import { messagingService } from '@/services/messaging/core';

async function sendAppointmentReminder(appointment: any, patient: any) {
  const engine = new TemplateEngine();

  const template = `Hi {patient.firstName}! Reminder: Your {appointment.service} appointment is {appointment.date} at {appointment.time}. {if appointment.status == "confirmed"}See you soon!{/if}`;

  const context: TemplateContext = {
    patient,
    appointment,
    clinic: { name: 'Luxe Medical Spa', phone: '(555) 123-4567' },
  };

  const result = await engine.render(template, context);

  if (!result.success) {
    console.error('Failed to render template:', result.errors);
    return false;
  }

  // Log message details
  console.log(`Sending SMS: ${result.characterCount} chars, ${result.segmentCount} segment(s)`);

  // Send the message
  await messagingService.sendSMS({
    to: patient.phone,
    body: result.message,
    patientId: patient.id,
    metadata: {
      type: 'appointment_reminder',
      appointmentId: appointment.id,
      characterCount: result.characterCount,
      segmentCount: result.segmentCount,
    },
  });

  return true;
}
```

## Debugging

The template engine includes comprehensive debugging logging:

```typescript
// Enable debug logs
const engine = new TemplateEngine();
const result = await engine.render(template, context);

// Console output will include:
// [TemplateEngine] Rendering template with context: { templateLength: 100, contextKeys: [...] }
// [TemplateEngine] Found variables: ['patient.firstName', 'appointment.date']
// [TemplateEngine] Resolving variable: patient.firstName
// [TemplateEngine] Resolved variable: { variable: 'patient.firstName', value: 'John', ... }
// [TemplateEngine] After variable substitution: { resultLength: 95 }
// [TemplateEngine] Render complete: { success: true, charCount: 95, ... }
```

Check the console/logs to see:
- Which variables were found and resolved
- Which variables are missing (used fallback)
- Character count and segment calculations
- Any warnings or errors

## API Reference

### TemplateEngine

```typescript
class TemplateEngine {
  // Main rendering method
  async render(template: string, context: TemplateContext): Promise<RenderResult>

  // Parse variables from template
  parseVariables(template: string): string[]

  // Get available variables for a context
  getAvailableVariables(context: TemplateContext): TemplateVariable[]
}
```

### VariableResolver

```typescript
class VariableResolver {
  // Resolve a single variable
  async resolve(variablePath: string, context: TemplateContext): Promise<ResolveResult>

  // Register custom formatter
  registerFormatter(formatter: FieldFormatter): void
}
```

## Common Issues

### Issue: Variable not being replaced

**Cause**: Context doesn't have the expected structure

**Solution**: Check context matches expected format:
```typescript
// ✅ CORRECT
context: { patient: { firstName: 'John' } }

// ❌ WRONG
context: { patientFirstName: 'John' }
```

### Issue: Date showing as [date]

**Cause**: Date value is null, undefined, or invalid

**Solution**: Ensure date is a valid Date object:
```typescript
// ✅ CORRECT
appointment: { date: new Date('2024-01-15') }

// ❌ WRONG
appointment: { date: '2024-01-15' } // String, not Date
```

### Issue: Message longer than expected

**Cause**: Don't account for variable expansion

**Solution**: Preview before sending:
```typescript
const result = await engine.render(template, context);
if (result.segmentCount > 1) {
  console.warn('Message will use multiple SMS segments');
}
```

## Support

For issues or questions:
1. Check the debugging logs
2. Verify your context data structure
3. Test with `engine.getAvailableVariables(context)` to see available variables
4. Check `result.warnings` and `result.errors` for details
