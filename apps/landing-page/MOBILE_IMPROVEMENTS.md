# Mobile Improvements for CTA Section and Footer

## Changes Made to `/Users/daminirijhwani/medical-spa-platform/apps/landing-page/src/app/landing/page.tsx`

### CTA Section (around line 725-760)

**Line 726: Section padding**
```tsx
// OLD:
className="py-32 px-8 bg-gradient-to-br..."

// NEW:
className="py-20 sm:py-32 px-4 sm:px-8 bg-gradient-to-br..."
```

**Line 729: Heading sizing**
```tsx
// OLD:
className="text-5xl lg:text-6xl font-black..."

// NEW:
className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6..."
```

**Line 730: Subtitle sizing**
```tsx
// OLD:
className="text-xl text-white/80 mb-12..."

// NEW:
className="text-lg sm:text-xl text-white/80 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed text-pretty font-medium px-4"
```

**Line 733: Design Partner card responsiveness**
```tsx
// OLD:
className="bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 mb-16..."

// NEW:
className="bg-white/10 backdrop-blur-xl rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 mb-10 sm:mb-16..."
```

**Line 734: Icon and text flex direction**
```tsx
// OLD:
<div className="flex items-center gap-5 mb-6">
  <div className="w-14 h-14 rounded-2xl...">

// NEW:
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-4 sm:mb-6">
  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl... flex-shrink-0">
```

**Line 738-739: Text sizing in card**
```tsx
// OLD:
<strong className="block text-white text-2xl...">
<span className="text-purple-200/70 text-sm...">

// NEW:
<strong className="block text-white text-xl sm:text-2xl...">
<span className="text-purple-200/70 text-xs sm:text-sm...">
```

**Line 747: Buttons container - stack vertically on mobile**
```tsx
// OLD:
<div className="flex justify-center gap-4 flex-wrap">

// NEW:
<div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
```

**Lines 748-758: All three CTA buttons**
```tsx
// Add to each button:
- justify-center (for centered text)
- px-6 sm:px-8 py-4 sm:py-5 (responsive padding)
- text-base sm:text-lg (responsive text)
- w-full sm:w-auto (full width on mobile)
```

### Footer Section (around line 764-786)

**Line 764: Footer padding**
```tsx
// OLD:
className="bg-gray-950 text-white py-24 px-8..."

// NEW:
className="bg-gray-950 text-white py-16 sm:py-24 px-4 sm:px-8..."
```

**Line 768: Trust badges spacing**
```tsx
// OLD:
<div className="flex flex-wrap justify-center gap-10 mb-20 pb-20...">

// NEW:
<div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-10 mb-12 sm:mb-20 pb-12 sm:pb-20...">
```

**Lines 769-784: Each trust badge**
```tsx
// OLD (for each badge):
<div className="flex items-center gap-3 px-6 py-3...">
  <svg className="w-6 h-6...">
  <span className="text-sm font-black uppercase tracking-widest...">

// NEW (for each badge):
<div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3...">
  <svg className="w-5 h-5 sm:w-6 sm:h-6... flex-shrink-0">
  <span className="text-xs sm:text-sm font-black uppercase tracking-wider sm:tracking-widest... whitespace-nowrap">
```

**Line 786: Footer links grid**
```tsx
// OLD:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">

// NEW:
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12 lg:gap-16 mb-12 sm:mb-20">
```

## Summary of Improvements

1. **CTA Buttons**: Now stack vertically on mobile (full-width) and sit in a row on larger screens
2. **Design Partner Card**: More compact on mobile with better icon/text layout
3. **Trust Badges**: Smaller, tighter spacing, prevent text wrapping with `whitespace-nowrap`
4. **Footer Links**: Proper 2-column layout on tablets, single column on mobile
5. **Overall Padding**: Reduced padding on mobile for better space utilization
6. **Text Sizing**: Responsive text sizes throughout using sm: breakpoints
