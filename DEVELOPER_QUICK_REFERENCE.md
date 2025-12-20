# Developer Quick Reference - On-Road Price Calculator

## Quick Start for Developers

### Import & Use in Component

```tsx
// Option 1: Model/Overview Price Calculator
import { OnRoadPriceCalculator } from "@/components/pricing/OnRoadPriceCalculator";

<OnRoadPriceCalculator
  exShowroomPrice={800000}
  selectedCity="Mumbai"
  fuelType="petrol"
  onFuelTypeChange={(fuel) => console.log(fuel)}
/>

// Option 2: Variant-Specific Calculator
import { VariantPriceCalculator } from "@/components/pricing/VariantPriceCalculator";

<VariantPriceCalculator
  variant={variantData}
  selectedCity="Delhi"
  onFuelTypeChange={(fuel) => console.log(fuel)}
/>
```

---

## Component APIs

### OnRoadPriceCalculator Props

```typescript
interface OnRoadPriceCalculatorProps {
  exShowroomPrice: number;        // Base vehicle price (required)
  selectedCity: string;            // City for state lookup (required)
  fuelType?: string;               // Default fuel (default: "petrol")
  onFuelTypeChange?: (fuel: string) => void;  // Fuel change callback
}
```

### VariantPriceCalculator Props

```typescript
interface VariantPriceCalculatorProps {
  variant: any;                    // Variant object (required)
  selectedCity: string;            // City for state lookup (required)
  onFuelTypeChange?: (fuel: string) => void;  // Fuel change callback
}
```

---

## Backend API

### Request Format

```bash
POST /api/pricing/calc
Content-Type: application/json

{
  "exShowroomPrice": 1000000,
  "state": "Delhi",
  "fuelType": "petrol"
}
```

### Response Format

```json
{
  "breakdown": {
    "exShowroomPrice": 1000000,
    "rto": 75000,
    "insurance": 56000,
    "gst": 50000,
    "tcs": 10000,
    "fastag": 2500,
    "onRoadPrice": 1191500
  },
  "taxConfig": { /* StateTaxConfig object */ },
  "state": "Delhi"
}
```

---

## File Locations

```
frontend/
├── src/
│   ├── components/
│   │   └── pricing/
│   │       ├── OnRoadPriceCalculator.tsx      ✨ NEW
│   │       └── VariantPriceCalculator.tsx     ✨ NEW
│   └── pages/
│       ├── ModelOverview.tsx                  ✏️  MODIFIED
│       └── VariantDetail.tsx                  ✏️  MODIFIED

Documentation/
├── ON_ROAD_PRICE_CALCULATOR.md                (Technical docs)
├── USER_GUIDE_CALCULATOR.md                   (User guide)
├── ON_ROAD_PRICE_CALCULATOR_IMPLEMENTATION.md (Implementation guide)
├── CALCULATOR_COMPLETION_SUMMARY.md           (Summary)
└── UI_PLACEMENT_GUIDE.md                      (Visual guide)
```

---

## Key Constants

### Supported Fuel Types
```typescript
const FUEL_TYPES = ["petrol", "diesel", "cng", "hybrid", "ev"];
```

### Default State Values
```typescript
const defaultState = {
  selectedFuelType: "petrol",
  loading: false,
  error: null,
  priceBreakdown: null
};
```

---

## Data Dependencies

### From Props
- `exShowroomPrice` → Send to API
- `selectedCity` → Convert to state via `getStateFromCity()`
- `fuelType` → Send to API

### From API Response
- `breakdown.exShowroomPrice` → Display
- `breakdown.rto` → Display
- `breakdown.insurance` → Display
- `breakdown.gst` → Display
- `breakdown.tcs` → Display (if > 0)
- `breakdown.fastag` → Display (if > 0)
- `breakdown.onRoadPrice` → Display (highlighted)

---

## Utility Functions Used

### From `@/lib/priceCalculations`
```typescript
getStateFromCity(city: string): string  // Maps city to state
```

### From `@/lib/guards`
```typescript
formatINR(amount: number, shortForm?: boolean): string  // Formats currency
```

### From `@/components/ui/*`
```typescript
Select, SelectContent, SelectItem, SelectTrigger, SelectValue  // Dropdown
Card, CardContent, CardHeader, CardTitle  // Card container
Badge  // Status badges
Button  // Action buttons (unused in calculator)
```

---

## State Management

### Internal State
```tsx
const [selectedFuel, setSelectedFuel] = useState(fuelType);
const [priceBreakdown, setPriceBreakdown] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
```

### External State (Props)
```tsx
const { exShowroomPrice, selectedCity, fuelType, onFuelTypeChange } = props;
```

### Derived State
```tsx
const selectedState = getStateFromCity(selectedCity);
```

---

## Effect Dependencies

```typescript
useEffect(() => {
  // Triggered when:
  // - exShowroomPrice changes
  // - selectedState (derived from city) changes
  // - selectedFuel changes
  
  // Action: Fetch new price breakdown from API
  
}, [exShowroomPrice, selectedState, selectedFuel]);
```

---

## Common Use Cases

### 1. Add to New Page
```tsx
import { OnRoadPriceCalculator } from "@/components/pricing/OnRoadPriceCalculator";

// In component:
<OnRoadPriceCalculator
  exShowroomPrice={price}
  selectedCity={city}
  fuelType={fuel}
  onFuelTypeChange={setFuel}
/>
```

### 2. Use with Variant Data
```tsx
import { VariantPriceCalculator } from "@/components/pricing/VariantPriceCalculator";

// In component:
{variant && (
  <VariantPriceCalculator
    variant={variant}
    selectedCity={selectedCity}
  />
)}
```

### 3. Handle Fuel Type Change
```tsx
const handleFuelTypeChange = (newFuel: string) => {
  setSelectedFuelType(newFuel);
  // Trigger any other fuel-dependent logic here
};

<OnRoadPriceCalculator
  exShowroomPrice={price}
  selectedCity={city}
  onFuelTypeChange={handleFuelTypeChange}
/>
```

### 4. Debug Price Calculation
```tsx
// In console:
fetch('/api/pricing/calc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exShowroomPrice: 1000000,
    state: 'Delhi',
    fuelType: 'petrol'
  })
}).then(r => r.json()).then(console.log);
```

---

## Common Issues & Solutions

### Issue: "State not recognized"
```typescript
// Check getStateFromCity mapping
const state = getStateFromCity(city);  // Should return valid state code
// If returns undefined, add city to mapping in lib/priceCalculations.ts
```

### Issue: API Returns 400 Error
```typescript
// Check request format:
{
  exShowroomPrice: 1000000,    // Must be number
  state: "Delhi",              // Must be valid state
  fuelType: "petrol"           // Must be one of: petrol, diesel, cng, hybrid, ev
}
```

### Issue: Price Shows as Zero/NaN
```typescript
// Verify:
1. exShowroomPrice > 0
2. API response has breakdown object
3. breakdown.onRoadPrice is a number
4. Check browser console for errors
```

### Issue: Loading Spinner Stuck
```typescript
// Check:
1. API endpoint is responding
2. Network tab shows API call
3. No JavaScript errors in console
4. Component not unmounted before response
```

---

## Performance Optimization

### Current Optimizations
- ✅ Cleanup function cancels pending requests
- ✅ Dependencies prevent unnecessary re-renders
- ✅ Memoized utility functions
- ✅ No props mutation

### To Further Optimize
```tsx
// Option 1: Memoize component
export const MemoizedCalculator = React.memo(OnRoadPriceCalculator);

// Option 2: Debounce fuel changes (if needed)
const debouncedFuelChange = useMemo(
  () => debounce((fuel) => onFuelTypeChange?.(fuel), 300),
  [onFuelTypeChange]
);

// Option 3: Cache API responses
const cacheKey = `${exShowroomPrice}-${selectedState}-${selectedFuel}`;
const cachedBreakdown = localStorage.getItem(cacheKey);
if (cachedBreakdown) setPriceBreakdown(JSON.parse(cachedBreakdown));
```

---

## Testing

### Unit Test Template
```typescript
import { render, screen } from '@testing-library/react';
import { OnRoadPriceCalculator } from '@/components/pricing/OnRoadPriceCalculator';

describe('OnRoadPriceCalculator', () => {
  test('renders with props', () => {
    render(
      <OnRoadPriceCalculator
        exShowroomPrice={1000000}
        selectedCity="Delhi"
      />
    );
    expect(screen.getByText(/On-Road Price/)).toBeInTheDocument();
  });

  test('calls onFuelTypeChange when fuel selected', async () => {
    const mock = jest.fn();
    render(
      <OnRoadPriceCalculator
        exShowroomPrice={1000000}
        selectedCity="Delhi"
        onFuelTypeChange={mock}
      />
    );
    // Simulate fuel selection
    // Assert mock was called with new fuel type
  });
});
```

---

## Styling Customization

### Key CSS Classes
```css
/* Card container */
.border-l-4.border-l-blue-500

/* Fuel selector */
.w-full.text-sm

/* Price breakdown row */
.flex.justify-between.items-center.pb-2

/* On-road total highlight */
.bg-blue-50.dark:bg-blue-950.p-3.rounded

/* Loading spinner */
.animate-spin.text-blue-600
```

### To Override Styles
```tsx
// Option 1: Extend component with custom className prop
interface Props extends OnRoadPriceCalculatorProps {
  className?: string;
}

// Option 2: Use CSS modules
import styles from './Calculator.module.css';

// Option 3: Wrap and add custom styles
<div className="custom-wrapper">
  <OnRoadPriceCalculator {...props} />
</div>
```

---

## Migration Guide

### From Old Calculator (if any)
```tsx
// Old way
const breakdown = calculatePriceBreakdown(price, city);
setBreakdown(breakdown);

// New way
<OnRoadPriceCalculator
  exShowroomPrice={price}
  selectedCity={city}
/>
// Component handles all logic internally
```

---

## Version History

| Version | Changes | Date |
|---------|---------|------|
| 1.0 | Initial release | Today |
| 1.1 (planned) | Add loan calculator | Q2 2024 |
| 1.2 (planned) | Add running cost comparison | Q3 2024 |

---

## Support

### Documentation Links
- Technical Docs: [ON_ROAD_PRICE_CALCULATOR.md](./ON_ROAD_PRICE_CALCULATOR.md)
- User Guide: [USER_GUIDE_CALCULATOR.md](./USER_GUIDE_CALCULATOR.md)
- Implementation: [ON_ROAD_PRICE_CALCULATOR_IMPLEMENTATION.md](./ON_ROAD_PRICE_CALCULATOR_IMPLEMENTATION.md)
- UI Guide: [UI_PLACEMENT_GUIDE.md](./UI_PLACEMENT_GUIDE.md)

### Quick Help
```bash
# Verify API endpoint
curl -X POST http://localhost:5000/api/pricing/calc \
  -H "Content-Type: application/json" \
  -d '{"exShowroomPrice":1000000,"state":"Delhi","fuelType":"petrol"}'

# Check component loads
npm run dev  # Start frontend
# Navigate to http://localhost:5173/brands/[brand]/[model]
# Look for "On-Road Price Breakdown" in Overview tab
```

---

**Quick Reference Version:** 1.0
**Last Updated:** [Current Date]
**Status:** ✅ Production Ready

