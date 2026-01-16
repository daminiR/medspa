# Notification Icons

This directory contains icon files for browser notifications.

## Required Files

- `notification-icon.png` - Icon displayed in browser notifications

## Setup

1. Add a notification icon file named `notification-icon.png` to this directory
2. Use your app logo or a bell icon
3. Recommended size: 192x192 pixels or larger

## Image Specifications

- Format: PNG (with transparency)
- Size: 192x192px or 512x512px (PWA standard)
- Color: Should match your brand colors
- Background: Transparent or solid color
- Style: Simple, recognizable icon

## Browser Notification Standards

Different browsers may display the icon at different sizes:
- Chrome/Edge: 80x80px (from 192x192 source)
- Firefox: 64x64px (from 192x192 source)
- Safari: Uses app icon

## Creating the Icon

You can:
1. Use your existing app logo
2. Design a custom notification bell icon
3. Use an icon from your design system
4. Generate from SVG using online tools

## Testing

After adding the icon:
1. Grant browser notification permission
2. Trigger a test notification
3. Check that the icon appears correctly in the browser notification
4. Test on different browsers if possible
