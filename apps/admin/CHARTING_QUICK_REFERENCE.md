# Charting Responsive Styles - Quick Reference Card

## Breakpoints
```
Phone:             < 640px
Tablet Portrait:   640px - 1024px    [Chart 85% height]
Tablet Landscape:  1024px - 1366px   [Chart 90% width]
Desktop:           > 1366px
```

## Essential Classes

### Layout
```tsx
charting-container              // Root container
charting-main-grid              // CSS Grid layout
charting-header                 // Responsive header
charting-chart-area             // Main chart area
charting-footer                 // Responsive footer
charting-sidebar-left           // Left sidebar (hidden < 1024px)
charting-sidebar-right          // Right sidebar (hidden < 1024px)
```

### Chart Components
```tsx
charting-face-chart-wrapper     // Chart container (handles sizing)
charting-face-chart-svg         // SVG element (responsive constraints)
charting-injection-marker       // Injection point marker
charting-injection-marker.neurotoxin  // Purple marker
charting-injection-marker.filler      // Pink marker
charting-injection-marker.selected    // Active marker
```

### Mobile Components
```tsx
charting-bottom-sheet           // Phone bottom sheet
charting-bottom-sheet.open      // Visible state
charting-bottom-nav             // Phone bottom navigation
charting-bottom-nav-item        // Nav button (56x56px)
charting-bottom-nav-item.active // Active nav item
```

### Tablet Components
```tsx
charting-floating-toolbar               // Tablet portrait toolbar
charting-floating-toolbar.auto-hidden   // Hidden state
charting-floating-toolbar-button        // Toolbar button (60x60px)
charting-floating-toolbar-button.active // Active button
```

### Touch Targets
```tsx
charting-touch-target           // 44x44px min (iPad), 48x48px (phone)
charting-no-zoom                // Prevent zoom on touch
```

### Animations
```tsx
charting-number-pulse           // Pulse animation on value change
charting-toolbar-slide-up       // Slide up animation
charting-toolbar-slide-down     // Slide down animation
charting-focus-mode-enter       // Enter focus mode
charting-focus-mode-exit        // Exit focus mode
charting-transition-layout      // Smooth layout transitions
```

### Utilities
```tsx
charting-auto-save-indicator          // Auto-save status
charting-auto-save-indicator.saving   // Yellow (saving)
charting-auto-save-indicator.saved    // Green (saved)
charting-auto-save-indicator.error    // Red (error)

charting-skeleton               // Loading skeleton
charting-skeleton-text          // Text skeleton
charting-skeleton-avatar        // Avatar skeleton

charting-backdrop               // Overlay backdrop
charting-backdrop.visible       // Visible backdrop

hide-on-phone                   // Hidden < 640px
show-on-phone                   // Visible < 640px
hide-on-tablet                  // Hidden < 1024px
show-on-tablet                  // Visible 640-1024px
```

## Responsive Behavior

### Phone (< 640px)
```
Header:   14px (56px)     Minimal
Chart:    100% height     Full screen
Footer:   Bottom nav      Fixed at bottom
Sidebars: Hidden          Use bottom sheet
```

### Tablet Portrait (640-1024px)
```
Header:   16px (64px)     ~8% of screen
Chart:    85% height      Centered, max-w: 600px
Footer:   12px (48px)     Collapsed, minimal
Sidebars: Hidden          Floating toolbar instead
Toolbar:  Auto-hide       Bottom center, 60px buttons
```

### Tablet Landscape (1024-1366px)
```
Header:   20px (80px)
Chart:    90% width       Center column, max-w: 900px
Footer:   16px (64px)
Sidebars: Visible         Left 15%, Right 20%
```

### Desktop (> 1366px)
```
Header:   24px (96px)     Full patient info
Chart:    Centered        max-w: 1000px
Footer:   20px (80px)     Full actions
Sidebars: Visible         Left 12%, Right 25%
```

## Touch Target Sizes

```
Device              Finger    Stylus    Use
Phone               48px      -         Always finger
iPad (touch)        44px      -         Finger tap
iPad (pencil)       -         32px      Precision mode
Desktop             36px      -         Mouse click
```

## Common Patterns

### Basic Layout
```tsx
<div className="charting-container">
  <div className="charting-main-grid">
    <header className="charting-header">...</header>
    <aside className="charting-sidebar-left">...</aside>
    <main className="charting-chart-area">
      <div className="charting-face-chart-wrapper">
        <svg className="charting-face-chart-svg">...</svg>
      </div>
    </main>
    <aside className="charting-sidebar-right">...</aside>
    <footer className="charting-footer">...</footer>
  </div>
</div>
```

### Floating Toolbar (Tablet)
```tsx
<div className={`charting-floating-toolbar ${autoHide ? 'auto-hidden' : ''}`}>
  <button className="charting-floating-toolbar-button active">
    <Icon />
    <span>Tools</span>
  </button>
</div>
```

### Bottom Sheet (Phone)
```tsx
<div className={`charting-bottom-sheet ${open ? 'open' : ''}`}>
  <div className="charting-bottom-sheet-handle" />
  <div className="charting-bottom-sheet-content">
    {/* Tools */}
  </div>
</div>
```

### Injection Marker
```tsx
<circle
  className="charting-injection-marker neurotoxin selected"
  cx={x}
  cy={y}
  r={8}
/>
```

### Auto-Save Status
```tsx
<div className={`charting-auto-save-indicator ${status}`}>
  {status === 'saving' && 'Saving...'}
  {status === 'saved' && 'All changes saved'}
  {status === 'error' && 'Save failed'}
</div>
```

## Tailwind Utilities (via @apply)

All classes use Tailwind's @apply directive internally:
```css
.charting-header {
  @apply h-14 px-3 py-2;           /* Phone */
  @apply sm:h-16 sm:px-6 sm:py-3;  /* Tablet */
  @apply lg:h-20 lg:px-6 lg:py-4;  /* Tablet Landscape */
  @apply xl:h-24 xl:px-8 xl:py-5;  /* Desktop */
}
```

## iPad Pro Specific

```css
@media (min-width: 1024px) and (max-width: 1366px)
       and (-webkit-min-device-pixel-ratio: 2) {
  Chart max-width: 850px
  Markers: 20px (w-5 h-5)
  Touch targets: 48px
}
```

## Print Styles

```
Hides:    Header, footer, sidebars, toolbars
Shows:    Chart only, full page
Colors:   Preserved (print-color-adjust: exact)
Page:     Auto-sized to fit chart
```

## Testing Devices

Priority:
1. iPad Pro 12.9" (portrait) - Primary use case
2. iPad Pro 11" (portrait)
3. iPad Air (portrait)
4. iPhone 14 Pro (fallback)
5. Desktop Chrome (development)

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Chart not 85% height | Add `charting-face-chart-wrapper` |
| Touch targets too small | Use `charting-touch-target` |
| Sidebars visible on iPad portrait | Check media query, ensure classes correct |
| Toolbar not auto-hiding | Implement setTimeout + `auto-hidden` class |
| Markers too small for finger | Check `@media (pointer: coarse)` styles |
| Print showing UI | Add classes to elements, print CSS hides them |

## Performance Tips

✅ **Do:**
- Use transform/opacity for animations
- Apply `charting-no-zoom` to chart area
- Debounce touch events
- Use CSS transitions (not JS animations)

❌ **Don't:**
- Animate width/height
- Use `display: none` for transitions
- Add fixed heights to chart containers
- Forget to test on actual iPad

## File Locations

```
/src/styles/charting-responsive.css  - Source styles
/src/styles/globals.css              - Import point
/src/app/charting/page.tsx           - Reference implementation
```

## Support Matrix

| Feature | Phone | Tablet P | Tablet L | Desktop |
|---------|-------|----------|----------|---------|
| Full UI | ❌ | ❌ | ✅ | ✅ |
| Chart 85% height | ❌ | ✅ | ❌ | ❌ |
| Chart 90% width | ❌ | ❌ | ✅ | ❌ |
| Sidebars | ❌ | ❌ | ✅ | ✅ |
| Floating toolbar | ❌ | ✅ | ❌ | ❌ |
| Bottom sheet | ✅ | ❌ | ❌ | ❌ |
| Auto-hide | ❌ | ✅ | ❌ | ❌ |
| Touch 44px | ✅ | ✅ | ✅ | ✅ |
| Stylus mode | ❌ | ✅ | ✅ | ❌ |
