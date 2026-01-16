# Internal Staff Notifications - UI Guide

## Visual Overview

This guide shows what users will see when interacting with the internal staff notification system.

## 1. InternalNotificationConfig Component

### Location
Found in automated message settings tabs:
- Settings → Automated Messages → Appointment Canceled
- Settings → Automated Messages → Form Submitted
- Settings → Automated Messages → Check-In
- Settings → Automated Messages → Waitlist

### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ 👥 Internal Staff Notifications                         [ Toggle  ] │
│    Send notification copies to staff members for monitoring          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ 📧 Staff-Only Notifications                                          │
│    These notifications are sent to staff members only, not to        │
│    patients. Use this to keep your team informed about important     │
│    automated messages being sent.                                    │
│                                                                       │
│ Recipient Email Addresses                                            │
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────┐  │
│ │ [✉ admin@luxemedispa.com ×] [✉ frontdesk@luxemedispa.com ×]  │  │
│ └───────────────────────────────────────────────────────────────┘  │
│                                                                       │
│ ┌────────────────────────────────────────────────┐ [+ Add]          │
│ │ Enter email address and press Enter             │                 │
│ └────────────────────────────────────────────────┘                  │
│ Enter email addresses separated by commas or press Enter after each  │
│                                                                       │
│ 👥 2 recipients configured                                           │
└─────────────────────────────────────────────────────────────────────┘
```

### Features Visible to User

1. **Header Section**
   - Icon (Users icon, blue)
   - Title: "Internal Staff Notifications"
   - Description text
   - Toggle switch (enabled/disabled)

2. **Info Banner**
   - Mail icon
   - "Staff-Only Notifications" heading
   - Explanation of purpose

3. **Recipients Section**
   - Label: "Recipient Email Addresses"
   - Email tags (pills with × to remove)
     - Blue background
     - Email icon
     - Click × to remove
   - Input field
     - Placeholder: "Enter email address and press Enter"
     - Add button next to input
   - Helper text about comma/Enter separation

4. **Summary Footer**
   - Users icon
   - Recipient count: "X recipients configured"

### User Interactions

| Action | Result |
|--------|--------|
| Toggle switch | Enables/disables notifications, grays out content when disabled |
| Type email + Enter | Adds email to list (validates format) |
| Type email + comma | Adds email to list (validates format) |
| Click outside input (onBlur) | Adds email if valid |
| Click [+ Add] button | Adds email if valid |
| Click × on email tag | Removes that email from list |
| Enter invalid email | Shows red error: "Please enter a valid email address" |
| Enter duplicate email | Shows red error: "This email is already in the list" |

## 2. Notification Demo Page

### Location
`/settings/notifications-demo`

### Visual Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│ 🔔 Internal Staff Notifications                                          │
│    Test the internal notification system. Select an event type below...  │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Total Sent  │ Successful  │ Service     │ Configured  │
│    10       │     10      │  Enabled    │     8       │
└─────────────┴─────────────┴─────────────┴─────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Select Event Type                                                         │
│ Choose an event type to simulate and send a test notification            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ Appointments                                                              │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐        │
│ │ 📅 Appointment   │ │ 📅 Online        │ │ 📅 Appointment   │        │
│ │    Booked        │ │    Booking       │ │    Canceled      │        │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘        │
│                                                                           │
│ Check-In                                                                  │
│ ┌──────────────────┐ ┌──────────────────┐                              │
│ │ ✅ Patient       │ │ 🕐 Patient Late  │                              │
│ │    Checked In    │ │                  │                              │
│ └──────────────────┘ └──────────────────┘                              │
│                                                                           │
│ [... more categories ...]                                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Notification Preview                                                      │
│ This is what staff members will be notified about                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ 📅 Appointment Booked                                                    │
│    Source: online                                    [HIGH PRIORITY]     │
│                                                                           │
│ Notification Data:                                                        │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ {                                                                     │ │
│ │   "patient": {                                                        │ │
│ │     "id": "pat-123",                                                  │ │
│ │     "name": "Sarah Johnson",                                          │ │
│ │     "phone": "(555) 123-4567"                                         │ │
│ │   },                                                                  │ │
│ │   "appointment": { ... }                                              │ │
│ │ }                                                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │              [📤 Send Test Notification]                              │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ℹ How It Works                                                           │
│   When you click "Send Test Notification", the system will:             │
│   1. Log the notification details to the console                        │
│   2. Show a toast notification in the bottom-right corner               │
│   3. Update the statistics above                                        │
│   4. In production, this would also send emails to configured recipients│
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ Event Statistics                                   [Clear History]       │
│ Breakdown of notifications by event type                                │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌─────────────────┐ │
│ │ Appointment Booked   │ │ Online Booking       │ │ Form Submitted  │ │
│ │         5            │ │         3            │ │         2       │ │
│ └──────────────────────┘ └──────────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Color Coding

- **Selected Event**: Purple border (border-purple-500), purple background (bg-purple-50)
- **Unselected Event**: Gray border (border-gray-200), hover purple border
- **High Priority Badge**: Amber background (bg-amber-100), amber text
- **Urgent Priority Badge**: Red background (bg-red-100), red text
- **Info Banners**: Blue background (bg-blue-50), blue border

### User Journey

1. **User lands on demo page**
   - Sees welcome banner
   - Views statistics (all zeros initially)
   - Sees all event types organized by category

2. **User selects event type**
   - Clicks on an event card
   - Card highlights with purple border
   - Preview panel updates with event data

3. **User clicks "Send Test Notification"**
   - Button shows loading state: "Sending Notification..."
   - Spinner appears
   - After 1-2 seconds:
     - Console log appears (check browser console)
     - Toast notification slides in from bottom-right
     - Statistics panel updates (Total Sent +1)
     - Button returns to normal

4. **User checks console**
   ```
   [Internal Notification] appointment_booked
     Subject: New Appointment Booked - Sarah Johnson
     Recipients: admin@luxemedicalspa.com, frontdesk@luxemedicalspa.com
     Body: ...
     Context: ...
     Payload: ...
   ```

5. **User sees toast notification**
   - Bottom-right corner
   - Title: "Staff Notified: New Appointment Booked - Sarah Johnson"
   - Message: "Internal notification sent to 2 recipients"
   - Auto-dismisses after 5 seconds (unless persistent)

## 3. Toast Notifications

### What User Sees

```
┌─────────────────────────────────────────────────────┐
│ ℹ Staff Notified: New Appointment Booked - Sarah J... │
│ Internal notification sent to 2 recipients           │
└─────────────────────────────────────────────────────┘
```

### Types

| Priority | Icon | Color | Duration |
|----------|------|-------|----------|
| Normal   | ℹ    | Blue  | 5 seconds |
| High     | ℹ    | Blue  | 5 seconds |
| Urgent   | ⚠    | Yellow| Persistent |

### Position
- Bottom-right corner of screen
- Stacks vertically if multiple
- Slides in from right
- Slides out to right on dismiss

## 4. Console Output

### What Developer Sees

```javascript
[Internal Notifications] Configuration updated for appointment_booked:
{enabled: true, recipients: Array(2), includeDetails: true}

[Internal Notification] appointment_booked
  ▼ Subject: New Appointment Booked - Sarah Johnson
  ▼ Recipients: admin@luxemedicalspa.com, frontdesk@luxemedicalspa.com
  ▼ Body:
    A appointment booked event occurred.

    Patient: Sarah Johnson
    Phone: (555) 123-4567
    Email: sarah@example.com

    Appointment Details:
    Date: January 15, 2026
    Time: 2:00 PM
    Service: Botox
    Provider: Dr. Emily Chen

    Source: online
    Channel: online portal
    Priority: HIGH

    Quick Actions:
    View: /calendar?appointmentId=appt-456
    Edit: /calendar/edit/appt-456

    Timestamp: 1/9/2026, 2:30:45 PM

  ▼ Context: {source: 'online', bookingChannel: 'online_portal', priority: 'high', actionUrls: {…}}
  ▼ Payload: {patient: {…}, appointment: {…}}
```

### Console Features

- **Grouped Logs**: Click to expand/collapse
- **Color Coding**: Info (blue), Warning (yellow), Error (red)
- **Object Inspection**: Click to explore nested data
- **Timestamps**: Every notification has timestamp

## 5. Settings Tab Example Usage

### In AppointmentCanceledTab

User sees:
1. Email notification configuration
2. SMS notification configuration
3. **Internal Staff Notifications section** ← Our component
4. Additional settings
5. Save Changes button

The internal notifications section fits seamlessly with other settings, maintaining consistent styling and behavior.

## 6. Responsive Design

### Desktop (1200px+)
- Full width layout
- Event cards in 3 columns
- All panels side-by-side
- Statistics in 4 columns

### Tablet (768px - 1199px)
- Event cards in 2 columns
- Panels stack vertically
- Statistics in 2 columns

### Mobile (< 768px)
- Event cards in 1 column
- All content stacks
- Statistics in 1 column
- Touch-friendly button sizes

## 7. Accessibility

- ✅ Keyboard navigation support
- ✅ ARIA labels on interactive elements
- ✅ Color contrast meets WCAG AA standards
- ✅ Screen reader friendly
- ✅ Focus indicators visible
- ✅ Semantic HTML structure

## 8. Loading & Error States

### Loading State
```
┌─────────────────────────────────────────────────────────┐
│  [⟳ Sending Notification...]                            │
└─────────────────────────────────────────────────────────┘
```

### Error State
```
┌─────────────────────────────────────────────────────────┐
│ ⚠ Please enter a valid email address                    │
└─────────────────────────────────────────────────────────┘
```

### Success State
```
┌─────────────────────────────────────────────────────────┐
│ ✓ Email added successfully                              │
└─────────────────────────────────────────────────────────┘
```

## 9. Animation & Transitions

- Toggle switch: Smooth slide animation (0.2s)
- Email tags: Fade in when added
- Email tags: Fade out when removed
- Event card selection: Border color transition (0.2s)
- Button hover: Background color transition (0.2s)
- Toast notifications: Slide in from right (0.3s)
- Loading spinner: Continuous rotation

## Summary

The UI is designed to be:
- **Intuitive**: Clear labels and helpful text
- **Responsive**: Works on all screen sizes
- **Accessible**: Keyboard and screen reader friendly
- **Consistent**: Matches existing design patterns
- **Informative**: Clear feedback for all actions
- **Professional**: Clean, modern appearance

Users will find it easy to:
- Enable/disable notifications
- Add/remove recipients
- Test different event types
- Monitor notification activity
- Understand what's happening

---

**Note**: All UI elements use Tailwind CSS classes and match the existing design system of the Medical Spa Admin Platform.
