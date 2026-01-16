# Simple Mode vs Advanced Mode - Visual Guide

## UI Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← [Back]  Automated Messages            [Simple Mode] [Advanced Mode]  │
│                                           └──────────┘  └──────────────┘│
│  Configure automated messages for different events                      │
│  Simple Mode: Showing essential message types only. Switch to           │
│  Advanced Mode for more options.                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Simple Mode - Active State

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                          [✨ Simple Mode] [⚙ Advanced]   │
│                                           └────────────┘  └──────────┘  │
│                                           PURPLE BG       GRAY TEXT      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ✓ Appointment Booked | ✓ Appointment Canceled | ✓ Check-In              │
│ └────────────────────┘  └──────────────────────┘  └──────────┘          │
│   VISIBLE                VISIBLE                   VISIBLE               │
│                                                                           │
│ HIDDEN TABS:                                                             │
│ - Form Submitted                                                         │
│ - Waitlist                                                               │
│ - Sale Closed                                                            │
│ - Gift Cards                                                             │
│ - Memberships                                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## Advanced Mode - Active State

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                          [✨ Simple] [⚙ Advanced Mode]   │
│                                           └────────┘  └────────────────┘│
│                                           GRAY TEXT    PURPLE BG         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ✓ Appointment Booked | ✓ Appointment Canceled | ✓ Check-In |           │
│ ✓ Form Submitted | ✓ Waitlist | ✓ Sale Closed | ✓ Gift Cards |         │
│ ✓ Memberships                                                           │
│ └─────────────┘                                                          │
│   ALL 8 TABS VISIBLE                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Toggle Button Design

### Simple Mode Button (Active)
```
┌───────────────────────┐
│ ✨ Simple Mode        │  ← Sparkles icon
│                       │  ← Purple background (bg-purple-100)
│                       │  ← Purple text (text-purple-700)
└───────────────────────┘
```

### Simple Mode Button (Inactive)
```
┌───────────────────────┐
│ ✨ Simple Mode        │  ← Sparkles icon
│                       │  ← White background
│                       │  ← Gray text (text-gray-600)
└───────────────────────┘
```

### Advanced Mode Button (Active)
```
┌───────────────────────┐
│ ⚙ Advanced Mode       │  ← Settings icon
│                       │  ← Purple background (bg-purple-100)
│                       │  ← Purple text (text-purple-700)
└───────────────────────┘
```

### Advanced Mode Button (Inactive)
```
┌───────────────────────┐
│ ⚙ Advanced Mode       │  ← Settings icon
│                       │  ← White background
│                       │  ← Gray text (text-gray-600)
└───────────────────────┘
```

## Help Text

### Simple Mode
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Simple Mode: Showing essential message types only. Switch to Advanced  │
│ Mode for more options.                                                  │
│ (Purple text - text-purple-600)                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Advanced Mode
```
(No help text shown)
```

## Tab Visibility Matrix

| Tab Name              | Simple Mode | Advanced Mode | Icon          |
|-----------------------|-------------|---------------|---------------|
| Appointment Booked    | ✅ VISIBLE  | ✅ VISIBLE    | CalendarCheck |
| Appointment Canceled  | ✅ VISIBLE  | ✅ VISIBLE    | CalendarX     |
| Check-In              | ✅ VISIBLE  | ✅ VISIBLE    | UserCheck     |
| Form Submitted        | ❌ HIDDEN   | ✅ VISIBLE    | FileCheck     |
| Waitlist              | ❌ HIDDEN   | ✅ VISIBLE    | Clock         |
| Sale Closed           | ❌ HIDDEN   | ✅ VISIBLE    | DollarSign    |
| Gift Cards            | ❌ HIDDEN   | ✅ VISIBLE    | Gift          |
| Memberships           | ❌ HIDDEN   | ✅ VISIBLE    | Users         |

## LocalStorage Structure

```javascript
// Key
"automatedMessagesViewMode"

// Values
"simple"    // Default for new users
"advanced"  // When user switches to advanced mode
```

## Behavior Flow

### 1. First Time User
```
User visits page
  ↓
Check localStorage for "automatedMessagesViewMode"
  ↓
Not found → Default to "simple"
  ↓
Show 3 tabs only
  ↓
Display help text
```

### 2. Returning User (Saved Preference)
```
User visits page
  ↓
Check localStorage for "automatedMessagesViewMode"
  ↓
Found: "advanced"
  ↓
Show all 8 tabs
  ↓
No help text
```

### 3. Switch from Advanced to Simple (with Hidden Tab Active)
```
User is on "Gift Cards" tab (Advanced Mode)
  ↓
User clicks "Simple Mode"
  ↓
Check if current tab is visible in Simple Mode
  ↓
"Gift Cards" is NOT visible
  ↓
Auto-switch to first visible tab: "Appointment Booked"
  ↓
Save preference to localStorage
```

### 4. Toggle Persistence
```
User clicks "Advanced Mode"
  ↓
localStorage.setItem('automatedMessagesViewMode', 'advanced')
  ↓
State updates → All tabs visible
  ↓
User refreshes page
  ↓
localStorage.getItem('automatedMessagesViewMode') → "advanced"
  ↓
Page loads with all tabs visible
```

## Code Structure

### State Management
```typescript
const [viewMode, setViewMode] = useState<ViewMode>('simple')
```

### LocalStorage Integration
```typescript
// Load on mount
useEffect(() => {
  const savedMode = localStorage.getItem('automatedMessagesViewMode')
  if (savedMode) setViewMode(savedMode)
}, [])

// Save on change
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

### Auto Tab Reset
```typescript
useEffect(() => {
  const isActiveTabVisible = visibleTabs.some(tab => tab.id === activeTab)
  if (!isActiveTabVisible && visibleTabs.length > 0) {
    setActiveTab(visibleTabs[0].id)
  }
}, [viewMode, visibleTabs, activeTab])
```

## User Experience Benefits

### Simple Mode
- **Reduces cognitive load** - Only 3 essential tabs
- **Faster onboarding** - New users aren't overwhelmed
- **Focuses on core features** - Appointment confirmations and check-in
- **Clear upgrade path** - Help text points to Advanced Mode

### Advanced Mode
- **Full control** - All 8 message types accessible
- **Power users** - Access to all features
- **No restrictions** - Configure any message type
- **Professional workflows** - Complete automation setup
