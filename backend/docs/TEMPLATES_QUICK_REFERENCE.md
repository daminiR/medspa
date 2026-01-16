# Message Templates - Quick Reference

## Template ID Format
- System templates: `sys_001` through `sys_037`
- Custom templates: `tpl_{timestamp}_{random}`

## All 37 System Templates by Category

### Appointment (8 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_001 | Appointment Confirmation | patientName, service, date, time | "Hi {{patientName}}, your {{service}} appointment is confirmed..." |
| sys_002 | 48 Hour Reminder | service, date, time | "Reminder: Your {{service}} is in 2 days..." |
| sys_003 | 24 Hour Reminder | time | "Reminder: Your appointment is tomorrow at {{time}}..." |
| sys_004 | 2 Hour Reminder | service, time | "Your {{service}} appointment is in 2 hours..." |
| sys_005 | Appointment Rescheduled | date, time | "Your appointment has been rescheduled to {{date}}..." |
| sys_006 | Appointment Cancelled | date | "Your appointment on {{date}} has been cancelled..." |
| sys_007 | No Show Follow-up | service | "We missed you today! Please call us to reschedule..." |
| sys_008 | Waitlist Opening | service, date, time | "Great news! A {{service}} slot opened up..." |

### Treatment Aftercare (5 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_009 | Botox Aftercare | _(none)_ | "Post-Botox care: No lying down for 4 hours..." |
| sys_010 | Filler Aftercare | _(none)_ | "Post-filler care: Apply ice if needed..." |
| sys_011 | Chemical Peel Aftercare | _(none)_ | "Post-peel care: Moisturize frequently..." |
| sys_012 | Microneedling Aftercare | _(none)_ | "Post-microneedling: No makeup 24hrs..." |
| sys_013 | Laser Treatment Aftercare | _(none)_ | "Post-laser care: Apply ice if needed..." |

### Follow-up (4 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_014 | 24 Hour Follow-up | patientName, treatment | "Hi {{patientName}}, how are you feeling after..." |
| sys_015 | 3 Day Follow-up | treatment | "Checking in! How is your {{treatment}} healing..." |
| sys_016 | 1 Week Follow-up | treatment | "It's been a week since your {{treatment}}..." |
| sys_017 | 2 Week Follow-up | treatment | "Two weeks post-{{treatment}}! Loving your results..." |

### Marketing (6 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_018 | Birthday Greeting | patientName | "Happy Birthday, {{patientName}}! Enjoy 20% off..." |
| sys_019 | VIP Exclusive | _(none)_ | "VIP exclusive: Book this week and receive..." |
| sys_020 | Seasonal Special | discount, service | "Spring special! {{discount}}% off {{service}}..." |
| sys_021 | Referral Program | _(none)_ | "Refer a friend and you both get $50 off..." |
| sys_022 | Win Back Campaign | patientName, months, discount | "We miss you, {{patientName}}! It's been {{months}} months..." |
| sys_023 | Package Expiring | package, date | "Your {{package}} credits expire on {{date}}..." |

### Financial (3 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_024 | Payment Reminder | amount, date | "Reminder: Your balance of ${{amount}} is due..." |
| sys_025 | Payment Received | amount, balance | "Thank you! We received your payment of ${{amount}}..." |
| sys_026 | Package Purchased | package, credits | "Your {{package}} package is active! You have {{credits}} credits..." |

### Membership (4 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_027 | Membership Welcome | tier, benefits | "Welcome to our {{tier}} membership! Enjoy {{benefits}}..." |
| sys_028 | Monthly Credits Added | credits, balance | "{{credits}} credits have been added to your account..." |
| sys_029 | Credits Expiring | credits, date | "Your {{credits}} credits expire on {{date}}..." |
| sys_030 | Membership Renewal | date, credits | "Your membership renews on {{date}}..." |

### Review (2 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_031 | Review Request | patientName, service, reviewLink | "Hi {{patientName}}, how was your {{service}}?..." |
| sys_032 | Review Thank You | patientName | "Thank you for your review, {{patientName}}!..." |

### Emergency (2 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_033 | Emergency Clinic Closure | date, reason | "Luxe Medical Spa will be closed {{date}} due to..." |
| sys_034 | Provider Absence | provider, date | "Dr. {{provider}} is unavailable {{date}}..." |

### Administrative (3 templates)

| ID | Name | Variables | Body Preview |
|----|------|-----------|--------------|
| sys_035 | Forms Reminder | formLink | "Please complete your intake forms before..." |
| sys_036 | Insurance Update | _(none)_ | "Please update your insurance information..." |
| sys_037 | General Update | message | "{{message}}" |

## Common Variable Names

### Patient Information
- `patientName` - Full name
- `patientFirstName` - First name only
- `patientEmail` - Email address
- `patientPhone` - Phone number

### Appointment Details
- `date` - Appointment date (formatted)
- `time` - Appointment time (formatted)
- `service` - Service name
- `serviceName` - Full service name
- `provider` - Provider name
- `providerName` - Full provider name

### Treatment Information
- `treatment` - Treatment name
- `treatmentName` - Full treatment name

### Financial
- `amount` - Dollar amount
- `balance` - Current balance
- `package` - Package name
- `credits` - Credit count
- `discount` - Discount percentage

### Marketing
- `expiryDate` - Offer expiry date
- `reviewLink` - Review URL
- `bookingUrl` - Booking URL
- `referralCode` - Referral code

### Membership
- `tier` - Membership tier
- `benefits` - Membership benefits
- `monthlyCredits` - Monthly credit amount

### Clinic Information
- `clinicPhone` - Clinic phone number
- `clinicAddress` - Clinic address
- `websiteUrl` - Website URL
- `formLink` - Form URL

## Usage Examples

### Example 1: Send Appointment Confirmation
```typescript
const template = await getTemplate('sys_001');
const message = await renderTemplate('sys_001', {
  patientName: 'Sarah Johnson',
  service: 'Botox',
  date: 'Dec 25, 2025',
  time: '2:00 PM'
});
// Result: "Hi Sarah Johnson, your Botox appointment is confirmed for Dec 25, 2025 at 2:00 PM. Reply C to confirm."
```

### Example 2: Send Birthday Message
```typescript
const message = await renderTemplate('sys_018', {
  patientName: 'Sarah Johnson'
});
// Result: "Happy Birthday, Sarah Johnson! Enjoy 20% off any treatment this month. Call to book!"
```

### Example 3: Send Follow-up
```typescript
const message = await renderTemplate('sys_014', {
  patientName: 'Sarah',
  treatment: 'Botox'
});
// Result: "Hi Sarah, how are you feeling after your Botox yesterday? Reply if you have questions."
```

## API Quick Commands

### List all templates
```bash
curl 'http://localhost:8080/api/templates'
```

### Get templates by category
```bash
curl 'http://localhost:8080/api/templates?category=appointment'
```

### Get specific template
```bash
curl 'http://localhost:8080/api/templates/sys_001'
```

### Render template
```bash
curl -X POST http://localhost:8080/api/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "sys_001",
    "variables": {
      "patientName": "Sarah",
      "service": "Botox",
      "date": "Dec 25",
      "time": "2:00 PM"
    }
  }'
```

### Search templates
```bash
curl 'http://localhost:8080/api/templates?query=reminder'
```

### Get categories
```bash
curl 'http://localhost:8080/api/templates/categories'
```

## Template Categories Breakdown

- **Appointment** (8): Confirmations, reminders, cancellations, waitlist
- **Treatment** (5): Aftercare instructions for different procedures
- **Follow-up** (4): Post-treatment check-ins at 24hr, 3d, 1w, 2w
- **Marketing** (6): Promotions, birthdays, VIP offers, win-back
- **Financial** (3): Payment reminders, receipts, package purchases
- **Membership** (4): Welcome, credits, renewals
- **Review** (2): Request reviews, thank you messages
- **Emergency** (2): Clinic closures, provider absence
- **Administrative** (3): Forms, insurance, general updates

## Compliance Notes

All templates are:
- ✅ HIPAA compliant (no PHI)
- ✅ Under 160 characters for SMS
- ✅ Include opt-out where required
- ✅ Professional and clear
- ✅ Production-ready

## Custom Template Creation

You can create custom templates via the API:

```typescript
const customTemplate = await createTemplate({
  name: 'My Custom Message',
  category: 'marketing',
  channel: 'sms',
  body: 'Hello {{name}}, check out our new {{offer}}!',
  tags: ['custom', 'promo'],
  isActive: true
});
```

Variables are automatically extracted from the body!
