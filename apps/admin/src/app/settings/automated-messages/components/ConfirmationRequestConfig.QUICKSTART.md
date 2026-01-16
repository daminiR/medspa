# ConfirmationRequestConfig - Quick Start Guide

## 🚀 Import

```tsx
import { ConfirmationRequestConfig } from '@/app/settings/automated-messages/components'
```

## ⚡ Basic Usage

```tsx
const [config, setConfig] = useState({
  enabled: true,
  setUnconfirmed: true,
  followUpEnabled: true,
  followUpHours: 24
})

<ConfirmationRequestConfig
  enabled={config.enabled}
  setUnconfirmed={config.setUnconfirmed}
  followUpEnabled={config.followUpEnabled}
  followUpHours={config.followUpHours}
  onChange={setConfig}
/>
```

## 📋 Props at a Glance

| Prop | Type | Description |
|------|------|-------------|
| `enabled` | `boolean` | Feature on/off |
| `setUnconfirmed` | `boolean` | Mark appointments unconfirmed |
| `followUpEnabled` | `boolean` | Send follow-up reminder |
| `followUpHours` | `number` | Hours to wait (1-72) |
| `onChange` | `function` | Called when config changes |

## 🎨 What It Looks Like

```
┌─────────────────────────────────────┐
│ 💬 Confirmation Request      [ON]  │
│                                     │
│ ✓ Reduce No-Shows by 50%           │
│   Reply C to confirm, R to         │
│   reschedule...                    │
│                                     │
│ ☑ Set status to "Unconfirmed"     │
│                                     │
│ 🕐 Send follow-up [ON]             │
│    Delay: [24] hours               │
│                                     │
│ 💬 Example SMS                     │
│    Your appointment...              │
└─────────────────────────────────────┘
```

## ✅ What It Does

1. **Main Toggle** - Enable/disable confirmation requests
2. **Unconfirmed Option** - Mark appointments unconfirmed until patient replies
3. **Follow-up System** - Auto-send reminder if no response
4. **Hour Configuration** - Set delay (1-72 hours)
5. **SMS Examples** - Shows preview messages
6. **Best Practices** - Displays helpful tips

## 💡 Common Patterns

### Pattern 1: Simple Integration
```tsx
function Settings() {
  const [config, setConfig] = useState({
    enabled: true,
    setUnconfirmed: true,
    followUpEnabled: true,
    followUpHours: 24
  })

  return <ConfirmationRequestConfig {...config} onChange={setConfig} />
}
```

### Pattern 2: With API Persistence
```tsx
function Settings() {
  const [config, setConfig] = useState(initialConfig)

  const handleChange = async (newConfig) => {
    setConfig(newConfig)
    await api.saveConfirmationConfig(newConfig)
  }

  return <ConfirmationRequestConfig {...config} onChange={handleChange} />
}
```

### Pattern 3: Form Integration
```tsx
function Settings() {
  const [formData, setFormData] = useState({
    confirmationRequest: {
      enabled: true,
      setUnconfirmed: true,
      followUpEnabled: true,
      followUpHours: 24
    }
  })

  return (
    <ConfirmationRequestConfig
      {...formData.confirmationRequest}
      onChange={(config) => setFormData({ ...formData, confirmationRequest: config })}
    />
  )
}
```

## 🎯 Recommended Settings

**Maximum No-Show Prevention** ⭐
```json
{
  "enabled": true,
  "setUnconfirmed": true,
  "followUpEnabled": true,
  "followUpHours": 24
}
```

**Basic Confirmation**
```json
{
  "enabled": true,
  "setUnconfirmed": false,
  "followUpEnabled": false,
  "followUpHours": 24
}
```

**Aggressive Follow-up**
```json
{
  "enabled": true,
  "setUnconfirmed": true,
  "followUpEnabled": true,
  "followUpHours": 12
}
```

## 🔧 Customization

The component is styled with Tailwind and uses these colors:
- **Primary**: `amber-600`
- **Success**: `green-600`
- **Info**: `blue-600`

To customize, edit the component file directly.

## ⚠️ Important Notes

- ✅ Component is **controlled** - manage state in parent
- ✅ Hours must be 1-72 (validated in UI)
- ✅ When `enabled` is false, all controls are disabled
- ✅ Follow-up input only shows when `followUpEnabled` is true
- ✅ SMS previews only show when `enabled` is true

## 🐛 Troubleshooting

**Issue**: Component not showing
- Check import path
- Verify it's in a 'use client' component

**Issue**: onChange not firing
- Verify onChange prop is passed
- Check console for errors

**Issue**: Styling looks wrong
- Ensure Tailwind is configured
- Check for CSS conflicts

## 📚 Learn More

- Full docs: `ConfirmationRequestConfig.README.md`
- Visual guide: `ConfirmationRequestConfig.VISUAL.md`
- Example code: `ConfirmationRequestConfig.example.tsx`
- Tests: `ConfirmationRequestConfig.test.example.tsx`

## 🎓 5-Minute Integration

```tsx
// 1. Import
import { ConfirmationRequestConfig } from '@/app/settings/automated-messages/components'
import { useState } from 'react'

// 2. Add state
const [config, setConfig] = useState({
  enabled: true,
  setUnconfirmed: true,
  followUpEnabled: true,
  followUpHours: 24
})

// 3. Render
return (
  <div className="p-6">
    <ConfirmationRequestConfig {...config} onChange={setConfig} />
  </div>
)

// 4. Done! 🎉
```

## 🔗 Related Components

- `TimelineConfigurator` - Multiple reminders
- `MessageCard` - Individual messages
- `InternalNotificationConfig` - Staff alerts

---

**Need help?** Check the README or example files!
