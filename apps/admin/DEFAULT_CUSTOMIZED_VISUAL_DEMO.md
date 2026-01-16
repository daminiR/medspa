# Default vs Customized Visual Indicators - Demo

## Visual Examples

### Example 1: Default State (Collapsed)

```
┌─────────────────────────────────────────────────────────────────┐
│ ▶  Pre-Arrival Message                      [Default]  [SMS] ⚫ON │
│    Send 15 minutes before appointment                            │
└─────────────────────────────────────────────────────────────────┘
```

**Badge Details:**
- Text: "Default"
- Color: Green background (`bg-green-50`), Green text (`text-green-700`)
- Icon: ✓ CheckCircle icon
- Location: Next to title, only when collapsed

### Example 2: Customized State (Collapsed)

```
┌─────────────────────────────────────────────────────────────────┐
│ ▶  Pre-Arrival Message                  [Customized]  [SMS] ⚫ON │
│    Send 30 minutes before appointment                            │
└─────────────────────────────────────────────────────────────────┘
```

**Badge Details:**
- Text: "Customized"
- Color: Blue background (`bg-blue-50`), Blue text (`text-blue-700`)
- Icon: None
- Location: Next to title, only when collapsed

### Example 3: Default State (Expanded)

```
┌─────────────────────────────────────────────────────────────────┐
│ ▼  Pre-Arrival Message                            [SMS] ⚫ON     │
│    Send patients a check-in link before their appointment arrives│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃ ✓ Using Recommended Settings                              ┃  │
│  ┃ This message is configured with our recommended default   ┃  │
│  ┃ settings that work well for most medical spas.           ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                                   │
│  Send Timing                                                      │
│  Send [15] minutes before appointment                             │
│                                                                   │
│  Message Body                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Hi {firstName}! Your appointment with {providerName}    │    │
│  │ is in {minutes} minutes. Check in here: {checkInLink}   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  Available Variables - Click to insert:                          │
│  [{firstName}] [{providerName}] [{minutes}] [{checkInLink}]      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Success Banner Details:**
- Background: Light green (`bg-green-50`)
- Border: Green (`border-green-200`)
- Icon: ✓ CheckCircle (green)
- Text: Explains using recommended settings
- Location: Top of expanded content, before editor

### Example 4: Customized State (Expanded)

```
┌─────────────────────────────────────────────────────────────────┐
│ ▼  Pre-Arrival Message                            [SMS] ⚫ON     │
│    Send patients a check-in link before their appointment arrives│
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [ ↻ Reset to Recommended Settings ]                             │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  Send Timing                                                      │
│  Send [30] minutes before appointment  ← Modified!                │
│                                                                   │
│  Message Body                                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Hey {firstName}! Don't forget your appointment with     │    │
│  │ {providerName} in {minutes} minutes! {checkInLink}      │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ↑ Template has been customized                                  │
│                                                                   │
│  Available Variables - Click to insert:                          │
│  [{firstName}] [{providerName}] [{minutes}] [{checkInLink}]      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Reset Button Details:**
- Text: "Reset to Recommended Settings"
- Icon: ↻ RotateCcw icon
- Style: Gray button (`bg-gray-50`, `border-gray-300`)
- Location: Top of expanded content, before editor
- Below: Border separator

## Color Coding

### Default Badge
```css
/* Badge container */
bg-green-50      /* Light green background */
text-green-700   /* Dark green text */

/* Icon */
CheckCircle      /* Checkmark icon */
text-green-600   /* Green icon color */
h-3.5 w-3.5      /* Small icon size */
```

### Customized Badge
```css
/* Badge container */
bg-blue-50       /* Light blue background */
text-blue-700    /* Dark blue text */

/* No icon */
```

### Success Banner (Default/Expanded)
```css
/* Banner container */
bg-green-50      /* Light green background */
border-green-200 /* Green border */

/* Icon */
CheckCircle      /* Checkmark icon */
text-green-600   /* Green icon color */
h-5 w-5          /* Medium icon size */
```

### Reset Button (Customized/Expanded)
```css
/* Button */
bg-gray-50       /* Light gray background */
border-gray-300  /* Gray border */
text-gray-700    /* Dark gray text */
hover:bg-gray-100 /* Hover state */

/* Icon */
RotateCcw        /* Rotate counterclockwise icon */
h-4 w-4          /* Small icon size */
```

## Interaction Flow

### Flow 1: Modify Template

```
User Action                    Badge State         Button State
─────────────────────────────────────────────────────────────────
1. Load page                   [Default]           No button
2. Expand card                 (hidden)            No button
3. Modify template text        (hidden)            [Reset] appears
4. Collapse card               [Customized]        (hidden)
```

### Flow 2: Reset to Defaults

```
User Action                    Badge State         Button State
─────────────────────────────────────────────────────────────────
1. Open customized card        (hidden)            [Reset] visible
2. Click "Reset" button        (hidden)            [Reset] disappears
3. Template reverts            (hidden)            No button
4. Collapse card               [Default]           (hidden)
```

### Flow 3: Multiple Cards

```
Card 1: Pre-Arrival
  Status: Customized
  Badge: [Customized] (blue)

Card 2: Provider Ready
  Status: Default
  Badge: [Default] (green)

Card 3: Check-in Confirmation
  Status: Default
  Badge: [Default] (green)

Each card tracks its own state independently!
```

## Badge Positioning

### Collapsed Card Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [Chevron]  [Title]  [Badge]  [Channel Icons]  [Toggle Switch]   │
│            [Summary Text]                                        │
└─────────────────────────────────────────────────────────────────┘

Position hierarchy (left to right):
1. Expand/collapse chevron
2. Title text
3. Default/Customized badge ← NEW!
4. Channel badges (SMS/Email)
5. Toggle switch (ON/OFF)
```

### Expanded Card Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [Chevron]  [Title]                  [Channel Icons]  [Toggle]   │
│            [Description Text]                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  [Success Banner] OR [Reset Button] ← NEW!                       │
│  ───────────────────────────────────────                         │
│                                                                   │
│  [Editor Content]                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

Content order:
1. Success banner (if using defaults)
   OR Reset button (if customized)
2. Border separator
3. Rest of editor content
```

## Implementation Code Snippets

### Badge Rendering (Collapsed State)

```tsx
{!isExpanded && isUsingDefaults && (
  <div
    className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md"
    title="Using recommended settings"
  >
    <CheckCircle2 className="h-3.5 w-3.5" />
    <span className="text-xs font-medium">Default</span>
  </div>
)}

{!isExpanded && !isUsingDefaults && onResetToDefaults && (
  <div
    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md"
    title="Customized settings"
  >
    <span className="text-xs font-medium">Customized</span>
  </div>
)}
```

### Reset Button Rendering (Expanded State)

```tsx
{!isUsingDefaults && onResetToDefaults && (
  <div className="mb-4 pb-4 border-b border-gray-200">
    <button
      onClick={onResetToDefaults}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
    >
      <RotateCcw className="h-4 w-4" />
      Reset to Recommended Settings
    </button>
  </div>
)}
```

### Success Banner Rendering (Expanded State)

```tsx
{isUsingDefaults && (
  <div className="mb-4 pb-4 border-b border-gray-200">
    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-green-900">
          Using Recommended Settings
        </p>
        <p className="text-xs text-green-700 mt-1">
          This message is configured with our recommended default settings
          that work well for most medical spas.
        </p>
      </div>
    </div>
  </div>
)}
```

## Real-World Screenshots

### Before Modification (All Default)
```
┌─────────────────────────────────────────────────────────────────┐
│ ▶  Pre-Arrival Message              [Default]  [SMS] ⚫ON        │
└─────────────────────────────────────────────────────────────────┘
│ ▶  Check-in Confirmation            [Default]  [SMS] ⚫ON        │
└─────────────────────────────────────────────────────────────────┘
│ ▶  Provider Ready                   [Default]  [SMS] ⚫ON        │
└─────────────────────────────────────────────────────────────────┘
```
All badges are GREEN showing "Default"

### After Modifications (Mixed States)
```
┌─────────────────────────────────────────────────────────────────┐
│ ▶  Pre-Arrival Message          [Customized]  [SMS] ⚫ON         │
└─────────────────────────────────────────────────────────────────┘
│ ▶  Check-in Confirmation            [Default]  [SMS] ⚫ON        │
└─────────────────────────────────────────────────────────────────┘
│ ▶  Provider Ready               [Customized]  [SMS] ⚫ON         │
└─────────────────────────────────────────────────────────────────┘
```
Mixed: Some GREEN "Default", some BLUE "Customized"

## Key Takeaways

1. **Badge only shows when collapsed** - Saves space when editing
2. **Two states: Default (green) or Customized (blue)** - Clear visual distinction
3. **Reset button only shows when expanded AND customized** - Context-aware
4. **Success banner shows when expanded AND using defaults** - Positive reinforcement
5. **Each card tracks independently** - Can mix default and customized cards
6. **Deep comparison** - ANY change makes it "Customized", not just template
7. **Automatic persistence** - Settings saved to localStorage
8. **One-click reset** - Easy to restore defaults

## Summary

The visual indicators provide clear, immediate feedback about whether messages are using recommended defaults or have been customized, making it easy for users to:
- See at a glance which messages have been modified
- Understand which settings are recommended
- Quickly restore defaults if needed
- Maintain consistency across their messaging
