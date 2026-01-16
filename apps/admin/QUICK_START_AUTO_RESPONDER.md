# After-Hours Auto-Responder - Quick Start Guide

## What Was Built

A complete after-hours auto-responder system for the SMS Settings page that allows clinics to automatically reply to patient messages received outside business hours.

## How to Access

1. Navigate to the admin application
2. Go to **Settings** (gear icon in navigation)
3. Click **SMS Settings**
4. Scroll to **"After-Hours Auto-Responder"** section

## Key Features (All Complete ✅)

### 1. Master Toggle
**Location**: Top-right of the section
**What it does**: Turns the entire auto-responder system on/off
**How to use**: Click the purple/gray toggle switch

### 2. Out of Office Button
**Location**: Next to the master toggle
**What it does**: Manually override to send auto-responses 24/7
**How to use**: Click "In Office" to switch to "Out of Office" (orange)
**Bonus**: Shows toast notification and warning banner

### 3. Message Template
**Location**: Main content area (when enabled)
**What it does**: Customize the auto-response message
**How to use**: Type your message in the textarea
**Features**:
- Character counter (160 = 1 SMS)
- Multi-segment warning
- Real-time updates

### 4. Live Preview
**Location**: Below message template
**What it does**: Shows how your message will look to patients
**How to use**: Click "Preview" button
**Features**:
- iPhone-style message bubble
- Shows clinic name and phone
- "Active Now" badge when auto-responder is running
- Updates instantly as you type

### 5. Quick Templates
**Location**: Below preview
**What it does**: Pre-written messages you can use
**How to use**: Click any template to load it
**Options**:
- Standard After-Hours (professional)
- Friendly Casual (conversational)
- Professional Detailed (includes hours)

## Quick Test (2 Minutes)

1. ✅ Click the toggle **ON** (should turn purple)
2. ✅ Click "Preview" to see the message
3. ✅ Edit the message and watch preview update
4. ✅ Click "Out of Office" button (should turn orange with warning)
5. ✅ Try a quick template (message should change)
6. ✅ Click "Save Changes" (toast notification)

## Business Hours Logic

The system checks the current time against your configured business hours:

**Business Hours Set To**: 9:00 AM - 6:00 PM (default)

**Auto-Responder Will Send When**:
- Before 9:00 AM
- After 6:00 PM
- Or anytime if "Out of Office" is enabled

**Status Indicator**: Look for purple text showing:
- "(Currently within business hours)" = OFF
- "(Currently after hours - auto-responder active)" = ACTIVE

## Files Changed

- **Single file modified**: `/src/app/settings/sms/page.tsx`
- **Lines added**: ~180 lines of new code
- **No new dependencies**: Uses existing libraries
- **No database changes**: Frontend-only (for now)

## What Happens When You Save

Currently: Settings are saved to component state (in-memory)
Future: Will persist to database and trigger Twilio webhook configuration

## Common Questions

**Q: Can I have different hours for different days?**
A: Not yet - currently one time range for all days

**Q: Does it actually send SMS?**
A: Not yet - this is frontend only. Backend integration comes next.

**Q: Can I schedule "Out of Office" in advance?**
A: Not yet - it's manual toggle only for now

**Q: What if someone texts during business hours?**
A: No auto-response is sent - staff handles it normally

**Q: Can I see a log of sent auto-responses?**
A: Not yet - analytics/logging comes in Phase 2

## Next Steps

### For Users
1. Configure your business hours
2. Customize your auto-response message
3. Test the preview
4. Save your settings
5. Enable when ready to go live

### For Developers
1. Review `AFTER_HOURS_AUTO_RESPONDER_COMPLETE.md` for technical details
2. Review `AUTO_RESPONDER_TEST_PLAN.md` for test cases
3. Review `AUTO_RESPONDER_UI_GUIDE.md` for UI specifications

## Need Help?

**For Testing**: See `AUTO_RESPONDER_TEST_PLAN.md`
**For UI Details**: See `AUTO_RESPONDER_UI_GUIDE.md`
**For Implementation**: See `AFTER_HOURS_AUTO_RESPONDER_COMPLETE.md`
**For Code**: Look at `/src/app/settings/sms/page.tsx` lines 56-66 (state) and 369-544 (UI)

## Demo Flow

```
User Journey:
1. Staff arrives at office → Set to "In Office"
2. Configure business hours (9 AM - 6 PM)
3. Write custom message or use template
4. Preview how it looks
5. Enable auto-responder toggle
6. Save settings

Patient Experience:
1. Patient texts at 8 PM (after hours)
2. System detects after-hours
3. Automatically sends configured message
4. Patient receives friendly reply
5. Staff sees message next morning and responds

Emergency Override:
1. Staff going on vacation
2. Click "Out of Office" button
3. Auto-responder now active 24/7
4. All patients get immediate auto-response
5. Click again when back to normal
```

## Visual Preview

When configured, patients see:

```
┌────────────────────────────────┐
│  LM  Luxe Medical Spa          │
│      +1 (555) 123-4567         │
│                                 │
│  ┌──────────────────────────┐  │
│  │ Thank you for your       │  │
│  │ message. Our office is   │  │
│  │ currently closed. We will│  │
│  │ respond during business  │  │
│  │ hours. Call (555) 123-   │  │
│  │ 4567 for emergencies.    │  │
│  └──────────────────────────┘  │
│                                 │
│  Just now                       │
└────────────────────────────────┘
```

## Status: COMPLETE ✅

All requested features have been implemented and tested:
- ✅ Auto-responder toggle
- ✅ Customizable message template
- ✅ Business hours configuration
- ✅ Message preview
- ✅ Out of Office quick toggle

Ready for user testing and feedback!

---

**Feature**: After-Hours Auto-Responder
**Status**: Complete
**Date**: 2026-01-09
**Location**: `/settings/sms`
**Next Phase**: Backend integration with Twilio webhook
