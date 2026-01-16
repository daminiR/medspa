# Charting System - Responsive Design Guide

This guide explains how to use the responsive charting styles for optimal iPad/tablet charting experiences.

## Overview

The charting system is optimized for:
- **iPad charting workflows** (primary use case)
- **Apple Pencil/Stylus precision**
- **Phone fallback** (emergency access)
- **Desktop expansion** (full features)

## Breakpoints

| Device | Width | Orientation | Description |
|--------|-------|------------|-------------|
| Phone | < 640px | Any | Full screen chart, bottom sheet tools |
| Tablet Portrait | 640-1024px | Portrait | Chart 85% height, minimal header, floating toolbar |
| Tablet Landscape | 1024-1366px | Landscape | Chart 90% width, 3-column layout with sidebars |
| Desktop | > 1366px | Any | Full UI with expanded toolbars and info panels |

## Grid Layout System

All charting layouts use CSS Grid with named template areas for clarity:

```css
grid-template-areas:
  "header header header"
  "left chart right"
  "footer footer footer";
```

## Component Class Reference

### Main Container Classes

```tsx
// Apply to root charting page/component
<div className="charting-container">
  <div className="charting-main-grid">
    {/* Layout adapts automatically based on screen size */}
  </div>
</div>
```

### Layout Sections

#### Header
```tsx
<header className="charting-header">
  <div className="charting-header-content">
    <div className="charting-header-patient-info">
      <div className="charting-header-avatar">SJ</div>
      <div className="charting-header-details">
        <h1 className="charting-header-title">Patient Name</h1>
        <div className="charting-header-meta">
          {/* Patient metadata */}
        </div>
      </div>
    </div>
  </div>
  <div className="charting-header-actions">
    {/* Action buttons */}
  </div>
</header>
```

**Responsive behavior:**
- **Phone**: 56px height (h-14), minimal padding
- **Tablet Portrait**: 64px height (h-16), ~8% of screen
- **Tablet Landscape**: 80px height (h-20)
- **Desktop**: 96px height (h-24), full patient info

#### Chart Area
```tsx
<main className="charting-chart-area">
  <div className="charting-face-chart-wrapper">
    <svg className="charting-face-chart-svg">
      {/* Face chart SVG */}
    </svg>
  </div>
</main>
```

**Responsive behavior:**
- **Phone**: Full screen width, fills available height
- **Tablet Portrait**: **85% height** (max-height: 85vh), centered, max-width: 600px
- **Tablet Landscape**: **90% width** of center column, max-width: 900px
- **Desktop**: Centered with max-width: 1000px

#### Sidebars
```tsx
// Left sidebar (tools, zones)
<aside className="charting-sidebar-left">
  <div className="charting-sidebar-left-header">Tools</div>
  <div className="charting-sidebar-left-content">
    {/* Zone buttons, product selector, etc. */}
  </div>
</aside>

// Right sidebar (patient info, totals)
<aside className="charting-sidebar-right">
  <div className="charting-sidebar-right-header">Summary</div>
  <div className="charting-sidebar-right-content">
    {/* Totals, patient history, etc. */}
  </div>
</aside>
```

**Responsive behavior:**
- **Phone**: Hidden (use bottom sheet instead)
- **Tablet Portrait**: Hidden (use floating toolbar/overlays)
- **Tablet Landscape**: Visible, 15% and 20% width respectively
- **Desktop**: Visible, 12% and 25% width respectively

#### Footer
```tsx
<footer className="charting-footer">
  <div className="charting-footer-summary">
    <div className="charting-footer-summary-item">
      Total: 40 units
    </div>
  </div>
  <div className="charting-footer-actions">
    <button>Save</button>
    <button>Export</button>
  </div>
</footer>
```

**Responsive behavior:**
- **Phone**: Fixed bottom nav (use `charting-bottom-nav` instead)
- **Tablet Portrait**: Collapsed, 48px height, minimal summary
- **Tablet Landscape**: 64px height
- **Desktop**: 80px height, full actions

## Mobile-Specific Components

### Bottom Sheet (Phone)
```tsx
<div className={`charting-bottom-sheet ${isOpen ? 'open' : ''}`}>
  <div className="charting-bottom-sheet-handle" />
  <div className="charting-bottom-sheet-content">
    {/* Tools, settings, zone selector */}
  </div>
</div>
```

### Bottom Navigation (Phone)
```tsx
<nav className="charting-bottom-nav">
  <button className="charting-bottom-nav-item active">
    <Icon />
    <span>Chart</span>
  </button>
  <button className="charting-bottom-nav-item">
    <Icon />
    <span>Tools</span>
  </button>
  {/* More nav items */}
</nav>
```

### Floating Toolbar (Tablet Portrait)
```tsx
<div className={`charting-floating-toolbar ${autoHidden ? 'auto-hidden' : ''}`}>
  <button className="charting-floating-toolbar-button active">
    <Icon />
    <span>Zone</span>
  </button>
  {/* More toolbar buttons */}
</div>
```

**Features:**
- Auto-hides after 3 seconds of inactivity
- Reappears on touch/interaction
- 60x60px minimum touch targets (Apple HIG compliant)
- Floating at bottom center of screen

## Touch Target Guidelines

All interactive elements follow Apple's Human Interface Guidelines:

```tsx
// Standard touch target
<button className="charting-touch-target">
  {/* Min 44x44px on iPad, 48x48px on phone */}
</button>

// Zone buttons (larger for fat-finger accuracy)
<button className="charting-zone-button charting-touch-target">
  Forehead
</button>

// Injection markers
<circle className="charting-injection-marker neurotoxin" />
```

### Touch Target Sizes
- **Phone (finger)**: 48x48px minimum
- **Tablet (finger)**: 44x44px minimum (Apple HIG)
- **Tablet (stylus)**: 32x32px (fine pointer detected)
- **Desktop**: 36x36px

## Stylus/Apple Pencil Optimization

The system detects fine pointers (stylus) automatically:

```css
@media (pointer: fine) {
  /* Smaller, more precise targets */
  /* Crosshair cursor */
  /* Reduced hover effects */
}
```

**Features:**
- Crosshair cursor for precision
- Smaller injection markers (16px vs 32px)
- Custom SVG cursor showing injection point preview
- No accidental zoom on double-tap

## Injection Marker Styling

```tsx
<circle
  className="charting-injection-marker neurotoxin selected"
  cx={x}
  cy={y}
  r={radius}
/>
```

**Classes:**
- `charting-injection-marker` - Base styles
- `neurotoxin` - Purple (for Botox, Dysport, etc.)
- `filler` - Pink (for Juvederm, Restylane, etc.)
- `selected` - Enlarged with glow effect

## Animations & Transitions

### Number Counter Pulse
```tsx
<span className="charting-number-pulse">
  {totalUnits}
</span>
```

Pulses briefly when value changes.

### Toolbar Slide
```tsx
<div className="charting-toolbar-slide-up">
  {/* Slides up and fades out */}
</div>

<div className="charting-toolbar-slide-down">
  {/* Slides down and fades in */}
</div>
```

### Focus Mode
```tsx
<div className="charting-focus-mode-enter">
  {/* UI fades out */}
</div>

<div className="charting-focus-mode-exit">
  {/* UI fades in */}
</div>
```

## Responsive Utilities

### Visibility Helpers
```tsx
<div className="hide-on-phone">Desktop/Tablet only</div>
<div className="show-on-phone">Phone only</div>
<div className="hide-on-tablet">Desktop only</div>
<div className="show-on-tablet">Tablet only</div>
```

### Auto-Save Indicator
```tsx
<div className="charting-auto-save-indicator saving">
  Saving...
</div>

<div className="charting-auto-save-indicator saved">
  All changes saved
</div>

<div className="charting-auto-save-indicator error">
  Save failed
</div>
```

### Loading Skeleton
```tsx
<div className="charting-skeleton h-12 w-full mb-4" />
<div className="charting-skeleton-text w-3/4 mb-2" />
<div className="charting-skeleton-avatar" />
```

## iPad Pro Specific Optimizations

For 11" and 12.9" iPad Pro devices:

```css
@media (min-width: 1024px) and (max-width: 1366px) and (-webkit-min-device-pixel-ratio: 2) {
  /* Optimized chart sizing */
  /* Apple Pencil precision adjustments */
}
```

**Features:**
- Chart max-width: 850px (optimal for iPad Pro 12.9")
- Injection markers: 20px (Apple Pencil precision)
- Touch targets: 48px (finger + pencil hybrid)

## Implementation Example

Here's a complete example of a charting page layout:

```tsx
'use client'

import React from 'react'

export default function ChartingPage() {
  return (
    <div className="charting-container">
      <div className="charting-main-grid">
        {/* Header - adapts based on screen size */}
        <header className="charting-header">
          <div className="charting-header-content">
            <div className="charting-header-patient-info">
              <div className="charting-header-avatar">SJ</div>
              <div className="charting-header-details">
                <h1 className="charting-header-title">Sarah Johnson</h1>
                <div className="charting-header-meta">
                  <span>MRN-45678</span>
                  <span>Last visit: 2024-01-15</span>
                </div>
              </div>
            </div>
          </div>
          <div className="charting-header-actions">
            <button>Save</button>
          </div>
        </header>

        {/* Left Sidebar - hidden on phone/tablet portrait */}
        <aside className="charting-sidebar-left">
          <div className="charting-sidebar-left-header">
            Treatment Zones
          </div>
          <div className="charting-sidebar-left-content">
            {/* Zone selector buttons */}
          </div>
        </aside>

        {/* Chart Area - responsive sizing */}
        <main className="charting-chart-area">
          <div className="charting-face-chart-wrapper">
            <svg className="charting-face-chart-svg">
              {/* Face chart */}
            </svg>
          </div>
        </main>

        {/* Right Sidebar - hidden on phone/tablet portrait */}
        <aside className="charting-sidebar-right">
          <div className="charting-sidebar-right-header">
            Treatment Summary
          </div>
          <div className="charting-sidebar-right-content">
            {/* Totals, patient info */}
          </div>
        </aside>

        {/* Footer - minimal on tablet portrait */}
        <footer className="charting-footer">
          <div className="charting-footer-summary">
            <span>Total: 40 units</span>
          </div>
          <div className="charting-footer-actions">
            <button>Export</button>
          </div>
        </footer>
      </div>

      {/* Phone-only bottom sheet */}
      <div className="charting-bottom-sheet">
        <div className="charting-bottom-sheet-handle" />
        <div className="charting-bottom-sheet-content">
          {/* Tools */}
        </div>
      </div>

      {/* Tablet portrait floating toolbar */}
      <div className="charting-floating-toolbar">
        <button className="charting-floating-toolbar-button">
          Tools
        </button>
      </div>
    </div>
  )
}
```

## Best Practices

### 1. Chart Height Priority (Tablet Portrait)
- **Target**: Chart should be **85% of viewport height**
- Header: ~8% (64px)
- Footer: ~7% (48px collapsed)
- Chart: 85% of remaining space

### 2. Touch Targets
- Always use `charting-touch-target` class
- Never make clickable elements smaller than 44x44px
- Add padding around small icons

### 3. Auto-Hide UI
- Toolbar auto-hides after 3 seconds on tablet portrait
- Reappears on any touch/mouse movement
- User can pin toolbar to keep it visible

### 4. Prevent Zoom
- Use `charting-no-zoom` class on chart area
- Prevents accidental double-tap zoom
- Allows pinch-zoom for accessibility

### 5. Injection Markers
- Use semantic class names: `neurotoxin`, `filler`
- Add `selected` class for active marker
- Ensure sufficient contrast (white border + shadow)

### 6. Sidebar Collapsing
- Provide toggle buttons on tablet landscape
- Use slide transitions (not fade)
- Persist user preference in localStorage

### 7. Print Support
- All UI chrome (header, footer, sidebars) hidden
- Chart fills page
- Colors preserved with `print-color-adjust: exact`

## Testing Checklist

- [ ] Phone portrait: Chart fills screen, bottom sheet works
- [ ] Phone landscape: Chart maintains aspect ratio
- [ ] iPad portrait: Chart is 85% height, floating toolbar appears
- [ ] iPad landscape: 3-column layout, sidebars collapsible
- [ ] iPad Pro 12.9": Chart doesn't exceed 850px width
- [ ] Desktop: Full UI with expanded sidebars
- [ ] Apple Pencil: Crosshair cursor, precise markers
- [ ] Finger touch: Larger touch targets, no accidental taps
- [ ] Auto-hide: Toolbar hides after 3 seconds, reappears on touch
- [ ] Print: Clean chart output, no UI elements

## Migration Guide

If you have existing charting components, follow these steps:

### 1. Update Imports
```tsx
// No import needed - styles are global via globals.css
```

### 2. Replace Container Divs
```tsx
// Before
<div className="flex flex-col h-screen">

// After
<div className="charting-container">
  <div className="charting-main-grid">
```

### 3. Use Semantic Class Names
```tsx
// Before
<div className="bg-white p-6 border-b">

// After
<header className="charting-header">
```

### 4. Add Responsive Components
```tsx
// Add floating toolbar for tablet
<div className="charting-floating-toolbar">
  {/* Tools */}
</div>

// Add bottom sheet for phone
<div className="charting-bottom-sheet">
  {/* Tools */}
</div>
```

### 5. Apply Touch Target Classes
```tsx
// Before
<button className="p-2">

// After
<button className="charting-touch-target">
```

## Troubleshooting

### Chart not filling 85% height on iPad
- Check that parent has `charting-face-chart-wrapper` class
- Ensure SVG has `charting-face-chart-svg` class
- Verify no fixed heights on parent containers

### Toolbar not auto-hiding
- Add state to track last interaction time
- Use `auto-hidden` class conditionally
- Implement setTimeout to hide after 3 seconds

### Touch targets too small
- Use `charting-touch-target` class
- Check with Safari Web Inspector on actual iPad
- Test with finger, not just simulator

### Sidebars not hiding on tablet portrait
- Verify media query matching
- Check `charting-sidebar-left/right` classes
- Ensure no `!important` overrides

## Performance Notes

- All transitions use GPU-accelerated properties (transform, opacity)
- Grid layout prevents reflows
- Auto-hide uses transform (not display) for smooth animations
- Touch events debounced for stylus input

## Future Enhancements

- [ ] Dark mode support (prefers-color-scheme: dark)
- [ ] Landscape mode optimizations for phone
- [ ] Split-screen iPad support
- [ ] Keyboard shortcuts overlay
- [ ] Gesture-based zoom controls

## Support

For questions or issues, check:
- `/src/styles/charting-responsive.css` - Source styles
- `/src/app/charting/page.tsx` - Reference implementation
- Tailwind docs for utility class reference
