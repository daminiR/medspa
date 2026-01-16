# CollapsedSummaryFooter - Component Structure

## Component Tree

```
CollapsedSummaryFooter
│
├─ Fixed Container (z-50, bottom-0)
│  │
│  ├─ [Collapsed View] (when !isExpanded)
│  │  └─ Button (toggle)
│  │     ├─ Left Section
│  │     │  ├─ Syringe Icon
│  │     │  └─ Summary Text ("12u Botox | 2ml Juvederm | $560")
│  │     └─ Right Section
│  │        └─ ChevronUp Icon
│  │
│  └─ [Expanded View] (when isExpanded)
│     ├─ Header Button (toggle)
│     │  ├─ Syringe Icon + "Treatment Summary"
│     │  └─ ChevronDown Icon
│     │
│     └─ Treatment Breakdown (scrollable)
│        ├─ Treatment Card 1
│        │  ├─ Left: Dot + Product Name + Type
│        │  └─ Right: Units/Volume + Cost
│        │
│        ├─ Treatment Card 2
│        │  └─ ...
│        │
│        └─ Grand Total Card
│           ├─ DollarSign Icon + "Total Treatment Cost"
│           └─ Total Amount
```

## State Management

```typescript
// Parent Component manages:
const [isExpanded, setIsExpanded] = useState(false)

// Component internally manages:
const totals = useMemo(() => {
  // Calculate totalCost, totalUnits, totalVolume
}, [treatments])

const summaryText = useMemo(() => {
  // Generate "12u Botox | 2ml Juvederm | $560"
}, [treatments, totals.totalCost])
```

## Props Flow

```
Parent Component
    │
    ├─ treatments[] ──────────> CollapsedSummaryFooter
    │                                  │
    ├─ isExpanded ────────────────────>│
    │                                  │
    └─ onToggleExpanded() ────────────>│
                                       │
                                       ├─ useMemo(totals)
                                       │     │
                                       ├─ useMemo(summaryText)
                                       │     │
                                       └─ Render based on isExpanded
```

## Data Transformation

```typescript
Input:
treatments = [
  {
    productName: "Botox",
    productType: "neurotoxin",
    totalUnits: 12,
    totalCost: 168
  },
  {
    productName: "Juvederm",
    productType: "filler",
    totalVolume: 2.0,
    totalCost: 1300
  }
]

Processing:
totals = {
  totalCost: 1468,
  totalUnits: 12,
  totalVolume: 2.0
}

summaryText = "12u Botox | 2.0ml Juvederm | $1468"

Output:
Rendered UI with treatment cards + grand total
```

## Conditional Rendering Logic

```typescript
if (treatments.length === 0) {
  return null  // Don't render anything
}

return (
  <div className="fixed bottom-0...">
    {!isExpanded && (
      <CollapsedView />  // Single line summary
    )}

    {isExpanded && (
      <ExpandedView>    // Full breakdown
        {treatments.map(treatment => (
          <TreatmentCard key={index} {...treatment} />
        ))}
        <GrandTotalCard {...totals} />
      </ExpandedView>
    )}
  </div>
)
```

## Styling Strategy

### Layout
- **Position**: `fixed bottom-0 left-0 right-0`
- **Z-index**: `50` (above most content)
- **Height**: Auto (collapsed: ~44px, expanded: dynamic)

### Colors by Product Type
```typescript
productType === 'neurotoxin'
  ? 'bg-purple-50 border-purple-100 text-purple-600'
  : 'bg-pink-50 border-pink-100 text-pink-600'
```

### Transitions
- Container: `transition-all duration-300`
- Buttons: `transition-colors`
- Expanded view: `animate-in slide-in-from-bottom duration-200`

## Performance Optimization

### Memoization
```typescript
// Prevents recalculation on every render
const totals = useMemo(() => {...}, [treatments])
const summaryText = useMemo(() => {...}, [treatments, totals.totalCost])
```

### Conditional Rendering
```typescript
// Only renders one view at a time
{!isExpanded && <CollapsedView />}
{isExpanded && <ExpandedView />}
```

## Accessibility

- **Semantic HTML**: Uses `<button>` for interactive elements
- **Keyboard Navigation**: All buttons are keyboard accessible
- **Focus States**: Native browser focus indicators
- **Clear Labels**: Descriptive text for screen readers

## Edge Cases Handled

1. **No Treatments**: Returns `null`, component disappears
2. **Single Treatment**: Works perfectly
3. **Mixed Types**: Handles neurotoxin + filler together
4. **Zero Values**: Shows "0u" or "0.0ml" and "$0.00"
5. **Large Numbers**: Formats correctly (no overflow)
6. **Decimal Precision**: Fillers show 1 decimal place
7. **Long Product Names**: Truncates gracefully
8. **Many Treatments**: Scrolls with `max-h-64 overflow-y-auto`

## Integration Pattern

```typescript
// In parent component:
const treatments = useMemo(() => {
  // Calculate from injection points or other sources
  return calculateTreatments(injectionPoints)
}, [injectionPoints])

return (
  <div className="pb-24"> {/* Padding for footer */}
    {/* Page content */}

    <CollapsedSummaryFooter
      treatments={treatments}
      isExpanded={isExpanded}
      onToggleExpanded={() => setIsExpanded(!isExpanded)}
    />
  </div>
)
```

## File Structure

```
charting/
├── CollapsedSummaryFooter.tsx          (Main component)
├── CollapsedSummaryFooter.example.tsx  (Usage example)
├── CollapsedSummaryFooter.README.md    (Documentation)
├── COMPONENT_STRUCTURE.md              (This file)
└── index.ts                            (Export)
```

## Dependencies

```json
{
  "react": "^18.x",
  "lucide-react": "Icons (Syringe, ChevronUp, ChevronDown, DollarSign)"
}
```

No additional dependencies required!

## Future Enhancement Ideas

- Add quick actions (edit, print, email)
- Show estimated time to complete
- Display practitioner info
- Add discount/promotion support
- Include tax breakdown
- Show treatment history comparison
- Add animation for individual items
- Support for custom currencies
- Export to PDF/print functionality
- Quick payment shortcut
