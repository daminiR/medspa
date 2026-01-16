# Simple Mode Toggle - Quick Reference Card

## At a Glance

### 🎯 Purpose
Allow users to toggle between simplified (3 tabs) and full (8 tabs) view of automated messages.

### 📍 Location
`/settings/automated-messages` page - Toggle in top-right corner

### 💾 Persistence
localStorage key: `automatedMessagesViewMode`

---

## Tab Visibility

### Simple Mode (3 tabs)
1. ✅ Appointment Booked
2. ✅ Appointment Canceled
3. ✅ Check-In

### Advanced Mode (8 tabs)
1. ✅ Appointment Booked
2. ✅ Appointment Canceled
3. ✅ Check-In
4. ✅ Form Submitted
5. ✅ Waitlist
6. ✅ Sale Closed
7. ✅ Gift Cards
8. ✅ Memberships

---

## Key Features

| Feature | Status |
|---------|--------|
| Toggle UI | ✅ Sparkles + Settings icons |
| Simple Mode Default | ✅ New users start here |
| LocalStorage Persistence | ✅ automatedMessagesViewMode |
| Auto Tab Reset | ✅ Switches to first visible tab |
| Visual Feedback | ✅ Purple active state |
| Help Text | ✅ Only in Simple Mode |

---

## User Actions

### To Switch to Simple Mode
1. Click "Simple Mode" button (Sparkles icon)
2. Sees 3 essential tabs
3. Sees help text

### To Switch to Advanced Mode
1. Click "Advanced Mode" button (Settings icon)
2. Sees all 8 tabs
3. No help text

### To Check Current Mode
- Purple background = active mode
- Gray text = inactive mode

---

## Developer Notes

### State
```typescript
const [viewMode, setViewMode] = useState<ViewMode>('simple')
```

### Toggle Handler
```typescript
const handleViewModeChange = (mode: ViewMode) => {
  setViewMode(mode)
  localStorage.setItem('automatedMessagesViewMode', mode)
}
```

### Tab Filtering
```typescript
const visibleTabs = viewMode === 'simple'
  ? tabs.filter(tab => tab.simpleMode)
  : tabs
```

---

## Testing Commands

### Browser Console
```javascript
// Check current mode
localStorage.getItem('automatedMessagesViewMode')

// Force Simple Mode
localStorage.setItem('automatedMessagesViewMode', 'simple')
location.reload()

// Force Advanced Mode
localStorage.setItem('automatedMessagesViewMode', 'advanced')
location.reload()

// Reset (will default to simple)
localStorage.removeItem('automatedMessagesViewMode')
location.reload()
```

---

## Edge Cases Handled

✅ **First-time user** → Defaults to Simple Mode
✅ **Hidden tab active** → Auto-switches to first visible tab
✅ **Mode persistence** → Survives page refresh
✅ **Invalid localStorage value** → Ignores, uses default

---

## Visual States

### Toggle Button - Simple Mode Active
```
[✨ Simple Mode]    [⚙ Advanced Mode]
  bg-purple-100       text-gray-600
  text-purple-700
```

### Toggle Button - Advanced Mode Active
```
[✨ Simple Mode]    [⚙ Advanced Mode]
  text-gray-600       bg-purple-100
                      text-purple-700
```

---

## Support

**File Location:**
`/apps/admin/src/app/settings/automated-messages/page.tsx`

**Documentation:**
- `SIMPLE_MODE_IMPLEMENTATION_COMPLETE.md` - Full implementation details
- `SIMPLE_MODE_VISUAL_GUIDE.md` - Visual design documentation
- `SIMPLE_MODE_TEST.md` - Testing checklist

**Status:** ✅ Complete and tested
