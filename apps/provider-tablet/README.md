# Provider Tablet App

## Overview
This is the tablet-optimized interface for medical spa providers to document treatments in real-time. It syncs with the main admin portal to create a seamless billing workflow.

## The Correct Medical Spa Workflow

### How It Actually Works:
1. **Provider opens tablet** → Sees their schedule for the day
2. **Patient arrives** → Front desk checks them in (Admin Portal)
3. **Provider takes patient to room** → Opens treatment documentation on tablet
4. **During treatment** → Provider taps face chart, records units in real-time
5. **Treatment complete** → Everything auto-syncs to front desk
6. **Patient goes to front desk** → Invoice is ready, just process payment

## Running the Apps

### Start Both Apps:
```bash
# Terminal 1 - Admin Portal (Front Desk)
cd apps/admin
npm run dev
# Runs on http://localhost:3000

# Terminal 2 - Provider Tablet
cd apps/provider-tablet
npm install  # First time only
npm run dev
# Runs on http://localhost:3001
```

## Testing on iPad

### Option 1: Local Network
1. Find your computer's IP address (e.g., 192.168.1.100)
2. On iPad, open Safari
3. Navigate to `http://YOUR-IP:3001`
4. Add to Home Screen for app-like experience

### Option 2: Using ngrok (Recommended)
```bash
# Install ngrok
brew install ngrok

# Expose tablet app
ngrok http 3001

# Use the provided URL on your iPad
```

## Key Features

### Provider Dashboard (`/`)
- Shows today's appointments
- Color-coded status (Waiting, In Progress, Completed)
- Large touch targets optimized for tablets
- Quick actions for common tasks

### Treatment Documentation (`/treatment/[id]`)
- Visual face chart with touch zones
- Product selection (Botox, Dysport, etc.)
- Unit adjustment with +/- buttons (increments of 5)
- Lot number tracking
- Treatment notes
- Photo capture integration (coming soon)

## Design Decisions

### Touch Optimization
- Minimum 44px touch targets (Apple HIG)
- Large buttons and inputs (18px font minimum)
- No hover-dependent interactions
- Swipe gestures for navigation (coming soon)

### Real-time Sync
- WebSocket connection to admin portal (TODO)
- Offline mode with queue (TODO)
- Auto-save every action
- Conflict resolution

## Workflow Differences

### OLD (Wrong) Way:
- Front desk does everything
- Documentation after treatment
- Duplicate data entry
- Patient waits while front desk figures out billing

### NEW (Correct) Way:
- Provider documents during treatment
- Real-time sync to front desk
- No duplicate entry
- Patient checkout is instant

## Next Steps

### High Priority:
1. WebSocket integration for real-time sync
2. Camera API for before/after photos
3. Offline mode with sync queue
4. Provider authentication

### Medium Priority:
1. Signature capture
2. Treatment templates/protocols
3. Voice notes
4. Multi-language support

### Low Priority:
1. Apple Pencil support for precise marking
2. 3D face models
3. AR visualization
4. Treatment history timeline

## Architecture

```
Provider Tablet (Port 3001)          Admin Portal (Port 3000)
       ↓                                    ↓
[Treatment Entry] →→ WebSocket →→ [Live Status Dashboard]
       ↓                                    ↓
[Photo Capture]   →→ Real-time →→ [Invoice Generation]
       ↓                                    ↓
[Save & Sync]     →→ Database →→  [Payment Processing]
```

## Why This Matters

1. **Accuracy**: Documentation happens DURING treatment
2. **Efficiency**: No duplicate data entry
3. **Speed**: Patient checkout takes seconds
4. **Compliance**: Real-time documentation for legal requirements
5. **Professional**: Matches industry standards (TouchMD, Aesthetic Record, etc.)

## Testing Checklist

- [ ] Open on actual iPad
- [ ] Test touch targets (should be easy to tap)
- [ ] Try landscape and portrait modes
- [ ] Test with multiple providers logged in
- [ ] Verify sync between tablet and admin
- [ ] Test offline mode (airplane mode)
- [ ] Check photo capture on iPad camera