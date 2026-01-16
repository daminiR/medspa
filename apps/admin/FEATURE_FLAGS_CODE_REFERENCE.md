# Feature Flags - Code Reference

## Type Definitions

```typescript
type ViewMode = 'simple' | 'advanced'

interface FeatureFlags {
  hasMemberships: boolean
  hasGiftCards: boolean
  hasWaitlist: boolean
}
```

## localStorage Keys

```typescript
'featureFlags'                  // Stores FeatureFlags object
'automatedMessagesViewMode'     // Stores ViewMode string
```

## Helper Functions

### getFeatureFlags()
```typescript
function getFeatureFlags(): FeatureFlags {
  if (typeof window === 'undefined') {
    return { hasMemberships: false, hasGiftCards: false, hasWaitlist: false }
  }

  const stored = localStorage.getItem('featureFlags')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return { hasMemberships: false, hasGiftCards: false, hasWaitlist: false }
    }
  }

  return { hasMemberships: false, hasGiftCards: false, hasWaitlist: false }
}
```

### saveFeatureFlags()
```typescript
function saveFeatureFlags(flags: FeatureFlags) {
  localStorage.setItem('featureFlags', JSON.stringify(flags))
}
```

## Component State

```typescript
const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
  hasMemberships: false,
  hasGiftCards: false,
  hasWaitlist: false,
})
const [showAddModal, setShowAddModal] = useState(false)
```

## Tab Configuration

```typescript
const tabs = [
  {
    id: 'appointment-booked',
    title: 'Appointment Booked',
    icon: CalendarCheck,
    description: 'Configure automated messages when appointments are scheduled',
    simpleMode: true,
    requiresFeature: null as keyof FeatureFlags | null,
    alwaysVisible: true,
  },
  // ... more default tabs ...
  {
    id: 'waitlist',
    title: 'Waitlist',
    icon: Clock,
    description: 'Configure automated messages for waitlist notifications',
    simpleMode: false,
    requiresFeature: 'hasWaitlist' as keyof FeatureFlags,
    alwaysVisible: false,
  },
  // ... more feature-gated tabs ...
]
```

## Tab Properties Explained

| Property | Type | Purpose |
|----------|------|---------|
| `id` | `TabId` | Unique identifier for the tab |
| `title` | `string` | Display name of the tab |
| `icon` | `LucideIcon` | Icon component to display |
| `description` | `string` | Description shown in tab header |
| `simpleMode` | `boolean` | Show in Simple Mode? |
| `requiresFeature` | `keyof FeatureFlags \| null` | Which feature flag is needed (null = always available) |
| `alwaysVisible` | `boolean` | Always show regardless of flags? |

## Visibility Logic

### isTabVisible()
```typescript
const isTabVisible = (tab: typeof tabs[0]) => {
  // Always show if it's always visible
  if (tab.alwaysVisible) return true

  // Check feature requirement
  if (tab.requiresFeature) {
    return featureFlags[tab.requiresFeature as keyof FeatureFlags]
  }

  // Form submitted is always available (no feature flag needed)
  return true
}
```

### Visible Tabs Calculation
```typescript
const visibleTabs = tabs.filter(tab => {
  // First check if tab is visible based on features
  if (!isTabVisible(tab)) return false

  // Then apply view mode filter
  if (viewMode === 'simple') {
    return tab.simpleMode
  }

  return true
})
```

### Available Tabs (for modal)
```typescript
const availableTabs = tabs.filter(tab => {
  // Skip if already visible
  if (isTabVisible(tab)) return false

  // Only show tabs that have feature requirements
  return tab.requiresFeature !== null
})
```

## Event Handlers

### Toggle Feature
```typescript
const toggleFeature = (featureKey: keyof FeatureFlags) => {
  const newFlags = {
    ...featureFlags,
    [featureKey]: !featureFlags[featureKey],
  }
  setFeatureFlags(newFlags)
  saveFeatureFlags(newFlags)
  setShowAddModal(false)
}
```

### Load on Mount
```typescript
useEffect(() => {
  const savedMode = localStorage.getItem('automatedMessagesViewMode') as ViewMode
  if (savedMode) {
    setViewMode(savedMode)
  }

  const flags = getFeatureFlags()
  setFeatureFlags(flags)
}, [])
```

### Auto-switch Tab
```typescript
useEffect(() => {
  const isActiveTabVisible = visibleTabs.some(tab => tab.id === activeTab)
  if (!isActiveTabVisible && visibleTabs.length > 0) {
    setActiveTab(visibleTabs[0].id)
  }
}, [viewMode, visibleTabs, activeTab])
```

## UI Components

### + Add Type Button
```typescript
{viewMode === 'advanced' && availableTabs.length > 0 && (
  <button
    onClick={() => setShowAddModal(true)}
    className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent
               text-gray-400 hover:text-purple-600 hover:border-purple-300
               font-medium text-sm transition-colors ml-2"
    title="Add more message types"
  >
    <Plus className="w-4 h-4" />
    Add Type
  </button>
)}
```

### Modal Structure
```typescript
{showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Add Message Types
          </h2>
          <button onClick={() => setShowAddModal(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Enable message types based on the features you use in your clinic
        </p>
      </div>

      {/* Feature List */}
      <div className="p-6 space-y-3">
        {availableTabs.map((tab) => {
          const Icon = tab.icon
          const featureKey = tab.requiresFeature as keyof FeatureFlags
          const isEnabled = featureKey && featureFlags[featureKey]

          return (
            <button
              key={tab.id}
              onClick={() => featureKey && toggleFeature(featureKey)}
              className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg
                         transition-all ${
                isEnabled
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isEnabled ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <div className="flex-1 text-left">
                <p className={`font-medium ${
                  isEnabled ? 'text-purple-900' : 'text-gray-900'
                }`}>
                  {tab.title}
                </p>
                <p className="text-sm text-gray-600">{tab.description}</p>
              </div>
              {/* Toggle Switch */}
              <div className={`w-10 h-6 rounded-full transition-colors ${
                isEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}>
                <div className={`w-4 h-4 bg-white rounded-full mt-1
                               transition-transform ${
                  isEnabled ? 'ml-5' : 'ml-1'
                }`} />
              </div>
            </button>
          )
        })}

        {availableTabs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">All available message types are enabled</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => setShowAddModal(false)}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg
                     hover:bg-purple-700 transition-colors font-medium"
        >
          Done
        </button>
      </div>
    </div>
  </div>
)}
```

## Styling Reference

### Colors
- **Purple (Active/Enabled):** `purple-600`, `purple-700`, `purple-50`
- **Gray (Inactive/Disabled):** `gray-300`, `gray-400`, `gray-500`
- **Background:** `bg-gray-50`, `bg-white`
- **Border:** `border-gray-200`, `border-purple-600`

### Transitions
```css
transition-colors     /* For color changes */
transition-all        /* For comprehensive animations */
transition-transform  /* For toggle switch movement */
```

### Z-Index
```css
z-50   /* Modal overlay (top layer) */
```

## State Flow Diagram

```
User Action → State Update → UI Update → localStorage
     ↓              ↓            ↓             ↓
  Click      featureFlags   Tabs render   Data saved
  Toggle        updated      show/hide    persisted
```

## Data Flow

```
1. Page Load
   ↓
2. getFeatureFlags() reads localStorage
   ↓
3. setFeatureFlags(stored values)
   ↓
4. tabs filtered by isTabVisible()
   ↓
5. visibleTabs calculated
   ↓
6. UI renders tabs

User clicks toggle
   ↓
7. toggleFeature(key) called
   ↓
8. setFeatureFlags(new values)
   ↓
9. saveFeatureFlags() writes to localStorage
   ↓
10. React re-renders with new visibleTabs
   ↓
11. Tabs appear/disappear
```

## Integration Points

### Where to Add New Features

1. **Add to FeatureFlags interface:**
```typescript
interface FeatureFlags {
  hasMemberships: boolean
  hasGiftCards: boolean
  hasWaitlist: boolean
  hasNewFeature: boolean  // Add here
}
```

2. **Update default values:**
```typescript
return {
  hasMemberships: false,
  hasGiftCards: false,
  hasWaitlist: false,
  hasNewFeature: false  // Add here
}
```

3. **Add tab configuration:**
```typescript
{
  id: 'new-feature',
  title: 'New Feature',
  icon: YourIcon,
  description: 'Description of new feature',
  simpleMode: false,
  requiresFeature: 'hasNewFeature',
  alwaysVisible: false,
}
```

4. **Create tab component:**
```typescript
import { NewFeatureTab } from './tabs/NewFeatureTab'

{activeTab === 'new-feature' && <NewFeatureTab />}
```

That's it! The feature flag system will automatically handle the rest.
