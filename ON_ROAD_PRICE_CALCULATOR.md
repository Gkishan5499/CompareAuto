# On-Road Price Calculator - User Guide

## Overview
The system now includes two fuel-type-aware on-road price calculators to help users understand the complete cost of owning a car based on their selected fuel type and location.

## Features

### 1. **Model Overview On-Road Price Calculator**
**Location:** Model overview page → Overview tab

**What it does:**
- Shows on-road price breakdown for the selected model/variant
- Fuel type selector with all options: Petrol, Diesel, CNG, Hybrid, EV
- Displays detailed price breakdown:
  - Ex-Showroom Price
  - RTO (Registration Tax) - Varies by fuel type and state
  - Insurance - Varies by fuel type and state
  - GST (5% on base price)
  - TCS (Tax Collection at Source - 1%)
  - FASTag charges
  - **Total On-Road Price**

**How to use:**
1. Navigate to any car model page
2. Go to the "Overview" tab
3. Scroll to the "On-Road Price Breakdown" section
4. Select your fuel type from the dropdown
5. The calculator automatically recalculates the price
6. Location is based on the city selector in the right sidebar

---

### 2. **Variant Price Calculator**
**Location:** Variant detail pages (when viewing specific variants)

**What it does:**
- Compact version of the on-road calculator
- Pre-populated with the variant's fuel type
- Shows quick breakdown for the specific variant
- Perfect for comparing fuel types for a single variant

**Features:**
- Automatically loads with variant's default fuel type
- Dropdown to switch between fuel types
- Real-time price recalculation
- Location-aware (uses selected city)

---

## Technical Implementation

### Backend API Endpoint
`POST /api/pricing/calc`

**Request Body:**
```json
{
  "exShowroomPrice": 1000000,
  "state": "Delhi",
  "fuelType": "petrol"
}
```

**Response:**
```json
{
  "breakdown": {
    "exShowroomPrice": 1000000,
    "rto": 80000,
    "insurance": 56000,
    "gst": 50000,
    "tcs": 10000,
    "fastag": 2500,
    "onRoadPrice": 1198500
  },
  "taxConfig": { /* state tax configuration */ },
  "state": "Delhi"
}
```

### Frontend Components

#### `OnRoadPriceCalculator.tsx`
- **Props:**
  - `exShowroomPrice: number` - Base vehicle price
  - `selectedCity: string` - City for tax calculation
  - `fuelType?: string` - Default fuel type (default: "petrol")
  - `onFuelTypeChange?: (fuel: string) => void` - Callback when fuel changes

- **Usage:**
  ```tsx
  <OnRoadPriceCalculator
    exShowroomPrice={800000}
    selectedCity="Mumbai"
    fuelType="petrol"
    onFuelTypeChange={(fuel) => console.log(fuel)}
  />
  ```

#### `VariantPriceCalculator.tsx`
- **Props:**
  - `variant: any` - The variant object
  - `selectedCity: string` - City for tax calculation
  - `onFuelTypeChange?: (fuel: string) => void` - Callback when fuel changes

- **Usage:**
  ```tsx
  <VariantPriceCalculator
    variant={variantData}
    selectedCity="Delhi"
    onFuelTypeChange={(fuel) => console.log(fuel)}
  />
  ```

---

## Fuel Type Support

The system now supports 5 fuel types with state and fuel-specific tax calculations:

| Fuel Type | Icon | RTO Support | Insurance Support |
|-----------|------|-------------|-------------------|
| Petrol | 🔥 | ✅ All states | ✅ All states |
| Diesel | ⛽ | ✅ All states | ✅ All states |
| CNG | 💨 | ✅ All states | ✅ All states |
| Hybrid | 🔋 | ✅ All states | ✅ All states |
| EV | ⚡ | ✅ All states | ✅ All states |

---

## State-Specific Tax Configuration

The `StateTaxConfig` database stores state-specific tax information:

```javascript
{
  state: "Delhi",
  rtoByFuelType: {
    petrol: 7.5,    // RTO as % of ex-showroom price
    diesel: 9.5,
    cng: 5.5,
    hybrid: 6.5,
    ev: 0           // EV may have lower/zero RTO
  },
  insuranceByFuelType: {
    petrol: 5.6,    // Insurance as % of ex-showroom price
    diesel: 5.8,
    cng: 5.4,
    hybrid: 5.6,
    ev: 5.2
  },
  gstRate: 5,       // 5% on ex-showroom price
  tcsRate: 1,       // 1% tax collection at source
  fastagCharges: 2500,  // Fixed FASTag fee
  registrationFee: 5000  // Fixed registration fee
}
```

---

## User Benefits

1. **Accurate Cost Estimation**
   - See exactly what you'll pay including all taxes
   - Understand fuel-type specific tax implications

2. **Easy Comparison**
   - Compare prices across fuel types
   - Make informed fuel choice decisions

3. **Location-Aware**
   - Different states have different tax rates
   - RTO and insurance vary by location

4. **Real-Time Calculation**
   - Instant recalculation when fuel type changes
   - No page refresh needed

---

## Integration Points

### ModelOverview.tsx
- Imports `OnRoadPriceCalculator` component
- Displays in Overview tab after Key Features section
- Uses `displayPrice` (selected variant or min price)
- Fuel type state: `selectedFuelType`

### Admin Panel (PricingManagement.tsx)
- Can import fuel-type-specific tax data via CSV
- Can edit RTO and Insurance per fuel type
- Can apply predefined updates for all states

---

## Future Enhancements

- [ ] Add loan calculator (EMI based on fuel type)
- [ ] Add fuel efficiency comparison with running cost
- [ ] Show long-term ownership cost by fuel type
- [ ] Add resale value estimates by fuel type
- [ ] Insurance premium visualization

---

## Support

For questions or issues with the calculator:
1. Check if city/state is correctly selected
2. Verify fuel type is available for the selected state
3. Contact support if calculation seems incorrect

