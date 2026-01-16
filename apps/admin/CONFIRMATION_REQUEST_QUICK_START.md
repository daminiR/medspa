# 48-Hour Confirmation Request System - Quick Start Guide

## For Admin Staff

### What Is This?

A system that automatically asks patients to confirm their appointments by replying "C" to a text message. This reduces no-shows by 50%.

---

## How It Works (3 Simple Steps)

### 1. Patient Books Appointment
```
┌─────────────────────────────┐
│ Patient books appointment   │
│ on calendar or online       │
└─────────────────────────────┘
```

### 2. Automatic SMS Sent
```
┌─────────────────────────────────────────────────┐
│ SMS SENT TO PATIENT:                            │
│                                                 │
│ "Your appointment at Luxe Medical Spa is        │
│  confirmed for Tuesday, Jan 9 at 2:00 PM        │
│  with Dr. Sarah Johnson.                        │
│  Reply C to confirm, R to reschedule."          │
└─────────────────────────────────────────────────┘
```

### 3. Patient Confirms
```
┌─────────────────────────────┐
│ Patient replies: "C"        │
│                             │
│ Calendar updates:           │
│ ✓ Green checkmark appears   │
│ ✓ Green left border         │
│ ✓ Status: Confirmed         │
└─────────────────────────────┘
```

---

## Calendar Visual Indicators

### ✓ GREEN = Confirmed
```
┌─────────────────────────┐
│┃✓ Sarah Johnson         │  <- Patient confirmed!
│┃ Botox • Dr. Smith      │
│┃ 60 min                 │
└─────────────────────────┘
```
**What it means**: Patient replied "C" to confirm. Very low no-show risk.

### ⏰ AMBER = Awaiting Confirmation
```
┌─────────────────────────┐
│┃⏰ John Doe             │  <- Waiting for confirmation
│┃ Filler • Dr. Smith     │
│┃ 45 min                 │
└─────────────────────────┘
```
**What it means**: SMS sent, but patient hasn't confirmed yet. May need phone follow-up.

### ⚠ RED = High Risk
```
┌─────────────────────────┐
│┃⚠ Jane Smith           │  <- HIGH RISK!
│┃ Consultation • RN      │
│┃ 30 min                 │
└─────────────────────────┘
```
**What it means**: New patient + unconfirmed + no deposit. **Call to confirm!**

---

## Staff Actions

### If Appointment is UNCONFIRMED (Amber)
1. Wait 24-48 hours for patient to confirm
2. System sends automatic follow-up reminder
3. If still unconfirmed after 48 hours → **call patient**

### If Appointment is HIGH RISK (Red)
1. **Call patient immediately** to confirm
2. Offer to take deposit over phone
3. Mark as confirmed manually if needed

### If Patient Calls to Confirm
1. In calendar, click appointment
2. Manually update status to "Confirmed"
3. Add note: "Confirmed via phone call"

---

## How to Enable/Disable

### To Turn ON Confirmation Requests:
1. Go to **Settings** → **Automated Messages**
2. Click **Appointment Booked** tab
3. Scroll to "Confirmation Request" section
4. Toggle **ON**
5. Enable "Set status to Unconfirmed"
6. Enable "Send follow-up if no response"
7. Set follow-up delay to **48 hours**
8. Click **Save Changes**

### To Turn OFF Confirmation Requests:
1. Go to **Settings** → **Automated Messages**
2. Click **Appointment Booked** tab
3. Scroll to "Confirmation Request" section
4. Toggle **OFF**
5. Click **Save Changes**

---

## Common Questions

### Q: What if patient doesn't have texting?
**A**: System won't send SMS. You'll need to call them to confirm.

### Q: What if patient replies with something other than "C"?
**A**: System detects variations like "Yes", "Confirm", "OK", etc. AI understands intent.

### Q: What if patient wants to reschedule?
**A**: They reply "R" and you'll get a notification to call them back.

### Q: Can I manually mark an appointment as confirmed?
**A**: Yes! Click the appointment and update the status to "Confirmed".

### Q: What's the follow-up message?
**A**:
```
"Reminder: Please confirm your appointment on Tuesday,
Jan 9 at 2:00 PM. Reply C to confirm or R to reschedule.
Call us at (555) 123-4567 if you have questions."
```

---

## Benefits

✅ **50% reduction in no-shows**
✅ **2-3 hours per week saved** (less phone call confirmations)
✅ **Easy to see** who's confirmed on calendar (green vs. amber)
✅ **Automatic follow-ups** for patients who forget
✅ **High-risk alerts** for new patients

---

## Quick Reference Card

| Status | Color | Icon | Action Needed |
|--------|-------|------|---------------|
| Confirmed | Green | ✓ | None - patient confirmed |
| Unconfirmed | Amber | ⏰ | Wait for auto follow-up |
| High Risk | Red | ⚠ | **Call immediately** |
| Arrived | Green ring | ✓ | Patient checked in |
| Cancelled | Gray | ✕ | None |

---

## Troubleshooting

### Patient says they never got the text
1. Check phone number is correct in their profile
2. Check if they've opted out of SMS (STOP)
3. Resend confirmation manually
4. Make note in appointment

### Calendar not showing green checkmark
1. Refresh the page (F5)
2. Check appointment details - is smsConfirmedAt set?
3. May be a sync delay - wait 30 seconds

### Too many unconfirmed appointments
1. Check if SMS system is working
2. Verify Twilio account has credits
3. Consider shorter follow-up time (24 hours instead of 48)

---

## Training Checklist

When training new staff, ensure they know:
- ✅ How to read calendar color codes
- ✅ What to do with high-risk appointments
- ✅ How to manually confirm if patient calls
- ✅ When to follow up on unconfirmed appointments
- ✅ How to check if confirmation SMS was sent

---

## Need Help?

**Technical Support**: Check Settings → Automated Messages
**SMS Not Sending**: Contact IT/Twilio support
**Questions**: Ask your practice manager

---

**Last Updated**: January 9, 2026
**System Version**: 1.0.0

---

## Print This Page

Cut along the dotted line and post near front desk:

✂️ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

**QUICK REMINDER:**

✓ **GREEN** = Patient confirmed. You're good!
⏰ **AMBER** = Waiting for confirmation. System will follow up.
⚠ **RED** = High risk! Call patient to confirm now.

Reply codes for patients:
- **C** = Confirm appointment
- **R** = Want to reschedule
