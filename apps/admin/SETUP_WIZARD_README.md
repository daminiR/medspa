# Setup Wizard - Quick Start Guide

## Overview

The Setup Wizard is a 3-step onboarding flow that helps first-time users configure automated messages in just 30 seconds. It eliminates the overwhelming experience of manually configuring 15+ settings by focusing on the three most impactful automated message types.

## Features

- **3-Step Flow**: Simple, focused questions with clear Yes/No choices
- **Progress Tracking**: Visual progress bar showing completion percentage
- **Smart Defaults**: Pre-configured settings based on industry best practices
- **Skip Option**: Users can skip the wizard and configure manually
- **Re-runnable**: Wizard can be run again if users want to change their quick setup
- **Persistent Storage**: Uses localStorage to track completion and save selections

## User Flow

### First-Time Experience

1. User navigates to `/settings/automated-messages`
2. Wizard automatically appears (overlay modal)
3. User progresses through 3 steps:
   - **Step 1**: Enable appointment reminders? (24hr + 2hr)
   - **Step 2**: Enable confirmation requests? (48hr)
   - **Step 3**: Send thank you after checkout?
4. User clicks "Yes, Enable" or "No, Skip This" for each step
5. Wizard saves configuration and closes
6. User sees the full settings page

### Return User Experience

1. User navigates to `/settings/automated-messages`
2. Wizard does NOT appear (already completed)
3. User sees "Run Setup Wizard Again" button in header
4. Clicking button reopens the wizard

## Technical Implementation

### Files Created

```
src/components/settings/
├── SetupWizard.tsx              # Main wizard component
├── SetupWizard.example.tsx      # Integration examples
└── SetupWizard.test.tsx         # Test documentation

src/app/settings/automated-messages/
└── page.tsx                     # Updated to integrate wizard
```

### Component API

```typescript
interface SetupWizardProps {
  onComplete: (config: WizardConfig) => void
  onSkip: () => void
}

interface WizardConfig {
  appointmentReminders: boolean  // Enable 24hr + 2hr reminders
  confirmationRequests: boolean  // Enable 48hr confirmation
  thankYouMessages: boolean      // Enable sale closed thank you
}
```

### Helper Functions

```typescript
// Check if wizard has been completed
isWizardCompleted(): boolean

// Mark wizard as completed (saves to localStorage)
markWizardCompleted(): void

// Get saved wizard configuration
getWizardConfig(): WizardConfig | null

// Save wizard configuration
saveWizardConfig(config: WizardConfig): void
```

### localStorage Keys

- `setupWizardCompleted`: `'true'` or `null`
- `setupWizardConfig`: JSON string of `WizardConfig`

## Usage

### Basic Integration

```tsx
import { SetupWizard, isWizardCompleted, WizardConfig } from '@/components/settings/SetupWizard'

function YourPage() {
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    // Show wizard on first visit
    if (!isWizardCompleted()) {
      setShowWizard(true)
    }
  }, [])

  const handleWizardComplete = (config: WizardConfig) => {
    console.log('Wizard completed:', config)
    // Apply configuration to your settings
    setShowWizard(false)
  }

  const handleWizardSkip = () => {
    console.log('Wizard skipped')
    setShowWizard(false)
  }

  return (
    <div>
      {showWizard && (
        <SetupWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      )}
    </div>
  )
}
```

### Manual Testing

Open browser console and run:

```javascript
// Reset wizard (show it again)
localStorage.removeItem('setupWizardCompleted')
localStorage.removeItem('setupWizardConfig')
location.reload()

// Check wizard status
console.log('Completed:', localStorage.getItem('setupWizardCompleted'))
console.log('Config:', JSON.parse(localStorage.getItem('setupWizardConfig') || '{}'))
```

## Step Details

### Step 1: Appointment Reminders

**Question**: Enable Appointment Reminders?

**What it does**:
- Enables 24-hour reminder (sent 1 day before appointment)
- Enables 2-hour reminder (sent on appointment day)

**Why it matters**: Reduces no-shows by up to 50%

**Yes button**: Saves `appointmentReminders: true`
**No button**: Saves `appointmentReminders: false`

### Step 2: Confirmation Requests

**Question**: Enable Confirmation Requests?

**What it does**:
- Sends confirmation request 48 hours before appointment
- Patients reply "C" to confirm or "R" to reschedule
- Appointments marked as "Unconfirmed" until patient responds

**Why it matters**: Helps identify cancellations early

**Yes button**: Saves `confirmationRequests: true`
**No button**: Saves `confirmationRequests: false`

### Step 3: Thank You Messages

**Question**: Send Thank You After Checkout?

**What it does**:
- Sends thank you message immediately after payment
- Includes receipt link
- Builds loyalty and encourages repeat visits

**Why it matters**: Shows appreciation and keeps clinic top-of-mind

**Yes button**: Saves `thankYouMessages: true` and completes wizard
**No button**: Saves `thankYouMessages: false` and completes wizard

## Design Decisions

### Why 3 Steps?

These three automated message types have the highest impact:
1. **Appointment Reminders**: Direct correlation with no-show reduction
2. **Confirmation Requests**: Proactive cancellation management
3. **Thank You Messages**: Patient retention and satisfaction

### Why Not Include More?

The wizard is intentionally limited to reduce decision fatigue. Users can configure:
- Appointment canceled messages
- Form submission notifications
- Waitlist notifications
- Gift card messages
- Membership messages

...after completing the wizard in the full settings interface.

### Why "Skip" Instead of "Cancel"?

"Skip - I'll configure manually" is more positive and clarifying than "Cancel". It tells users they're not missing out, just choosing a different path.

### Why Auto-Show on First Visit?

Most users benefit from the wizard. Power users can skip in 2 clicks. The time saved for the majority outweighs the minor friction for experts.

## Future Enhancements

Potential improvements for the wizard:

1. **Apply Configuration Automatically**: Currently the wizard just saves selections. It could automatically enable the corresponding settings.

2. **Success Confirmation**: Show a success modal after completion with summary of what was enabled.

3. **Smart Defaults Based on Clinic Type**: Different defaults for med spas vs dental offices vs salons.

4. **Analytics**: Track completion rates, which steps users skip, time to complete.

5. **Video Previews**: Show animated previews of what patients will receive for each message type.

6. **A/B Testing**: Test different copy, question order, or number of steps.

## Troubleshooting

**Wizard doesn't appear on first visit:**
- Check browser console for errors
- Verify `isWizardCompleted()` returns `false`
- Clear localStorage and refresh

**Wizard appears every time:**
- Check that `markWizardCompleted()` is being called
- Verify localStorage is working (not in incognito mode)
- Check for console errors

**"Run Setup Wizard Again" button missing:**
- Verify wizard has been completed once
- Check that `isWizardCompleted()` returns `true`
- Make sure you're on the correct page

## Testing Checklist

- [ ] Wizard appears on first visit to automated messages page
- [ ] Progress bar updates correctly (33%, 66%, 100%)
- [ ] "Back" button works on steps 2 and 3
- [ ] "Yes, Enable" advances to next step
- [ ] "No, Skip This" advances to next step
- [ ] "Skip - I'll configure manually" closes wizard
- [ ] X button closes wizard
- [ ] Final step "Yes, Enable & Finish" completes wizard
- [ ] Wizard does not appear on subsequent visits
- [ ] "Run Setup Wizard Again" button appears after completion
- [ ] Re-opening wizard shows previous selections
- [ ] Configuration saves to localStorage correctly
- [ ] Works on mobile viewport
- [ ] Works on tablet viewport
- [ ] Works on desktop viewport

## Support

For questions or issues with the Setup Wizard, contact the development team or create an issue in the repository.

## Version History

- **v1.0.0** (2026-01-09): Initial release
  - 3-step wizard flow
  - localStorage persistence
  - Integration with automated messages page
