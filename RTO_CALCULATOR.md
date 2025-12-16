# RTO (Road Tax) Calculator Implementation

## Overview

Sophisticated RTO calculator that handles multi-dimensional road tax calculations based on:
- **State/Union Territory** (35 states/UTs with varying base rates from 8% to 17%)
- **Fuel Type** (Petrol, Diesel, CNG, Hybrid, EV with type-specific surcharges)
- **Vehicle Price** (Price slab multipliers: <5L=1x, 5-10L=1.2x, 10-15L=1.5x, 15-20L=1.8x, >20L=2x)
- **Vehicle Age** (Green tax: 15-20yr=+3%, >20yr=+6%)
- **EV Incentives** (New electric vehicles get 100% RTO exemption in most states)

## Architecture

### Backend Components

#### 1. RTO Calculator Utility (`backend/src/utils/rtoCalculator.ts`)

Core calculation engine with exported functions:

```typescript
interface RTOCalculatorInput {
  state: string;
  exShowroomPrice: number;
  fuelType: FuelType;
  engineCapacity?: number;
  vehicleType?: VehicleType;
  vehicleAge?: number;
}

interface RTOResult {
  baseRTO: number;
  fuelTypeSurcharge: number;
  priceSlabRatio: number;
  greenTax: number;
  evSubsidy: number;
  totalRTOPercentage: number;
  totalRTOAmount: number;
}
```

**Key Functions:**
- `calculateRTO(input)` - Main calculation function returning RTOResult
- `calculateOnRoadPrice()` - Includes RTO + GST + Insurance + TCS + FASTag
- `getRTOBreakdown()` - Human-readable breakdown string

**State Base Rates:**
- Karnataka: 17% (highest)
- Maharashtra: 10%
- Most states: 8-9%
- Minimum: 8% (Arunachal Pradesh, Assam, Bihar, etc.)

**Fuel Type Surcharges (Default State):**
- Petrol: 0% (baseline)
- Diesel: +0.5%
- CNG: -0.5% (discount)
- Hybrid: -1% (incentive)
- EV: -3% (incentive)

**Delhi & Maharashtra** have custom surcharges:
- Delhi Diesel: +2% (higher emissions)
- Maharashtra Diesel: +1.5%
- All states EV: -5% (standard incentive)

**Price Slab Multipliers:**
```
₹0-5L:       1.0x (base rate)
₹5-10L:      1.2x (20% higher)
₹10-15L:     1.5x (50% higher)
₹15-20L:     1.8x (80% higher)
>₹20L:       2.0x (double - luxury tax)
```

**Green Tax (2025 Regulations):**
```
15-20 years: +3%
>20 years:   +6%
<15 years:   0% (not applicable)
```

#### 2. RTO Controller (`backend/src/controllers/rtoCalculator.controller.ts`)

Three endpoints:

**POST /api/pricing/calculate-rto**
Single vehicle RTO calculation
```json
{
  "state": "Delhi",
  "exShowroomPrice": 1000000,
  "fuelType": "petrol",
  "vehicleAge": 0,
  "includeTaxes": true,
  "gstRate": 5,
  "insurancePercentage": 3
}
```

Response:
```json
{
  "success": true,
  "rto": {
    "baseRTO": 9,
    "fuelTypeSurcharge": 0,
    "priceSlabRatio": 1.2,
    "greenTax": 0,
    "evSubsidy": 0,
    "totalRTOPercentage": 10.8,
    "totalRTOAmount": 108000
  },
  "breakdown": "RTO Calculation Breakdown..."
}
```

**POST /api/pricing/calculate-rto-bulk**
Bulk calculation for multiple vehicles
```json
{
  "vehicles": [
    { "state": "Delhi", "exShowroomPrice": 1000000, "fuelType": "petrol", "vehicleAge": 0 },
    { "state": "Maharashtra", "exShowroomPrice": 500000, "fuelType": "ev", "vehicleAge": 0 }
  ],
  "gstRate": 5,
  "insurancePercentage": 3
}
```

**GET /api/pricing/rto-rates**
Get all state base rates and calculation notes

### Frontend Components

#### RTOCalculator (`frontend/src/components/tools/RTOCalculator.tsx`)

User-friendly calculator with:
- **State Selection**: Dropdown with all 35 states/UTs
- **Price Input**: Ex-showroom price with validation
- **Fuel Type Selection**: Petrol, Diesel, CNG, Hybrid, EV
- **Vehicle Age**: Optional field for green tax calculation
- **Result Display**: Shows:
  - Total RTO percentage
  - Total RTO amount in INR
  - Breakdown of each component
  - Interactive info boxes explaining factors

#### Integration in Tools Page

Added to `/frontend/src/pages/Tools.tsx` alongside:
- EMI Calculator
- On-Road Price Estimator
- Fuel Cost Estimator

## Calculation Flow Example

**Scenario:** ₹10,00,000 sedan, Diesel, Bangalore, 3 years old

1. **Base RTO** (Karnataka): 17%
2. **Price Slab Ratio** (₹10-15L range): 1.5x
3. **Fuel Surcharge** (Diesel, default): +0.5%
4. **Green Tax** (3 years): 0% (only applies >15yr)
5. **EV Subsidy**: 0% (not EV)

**Calculation:**
```
Base: 17% × 1.5 = 25.5%
+ Fuel: 0.5%
= Total: 26%
Amount: ₹10,00,000 × 26% = ₹2,60,000
```

## Data Models

### Current StateTaxConfig (unchanged for now)
```typescript
{
  state: String (unique),
  gstRate: Number (5-18%),
  rtoPercentage: Number (single value),
  insurancePercentage: Number (3-5%),
  registrationFee: Number (removed from UI),
  tcsRate: Number (1% for vehicles >10L),
  fastagCharges: Number (₹500 standard)
}
```

**Note:** Current `rtoPercentage` field is a single value. The new RTO Calculator is independent and doesn't modify this schema, allowing phased migration.

## Features & Implementation Details

### ✅ Implemented Features

1. **Multi-State Support** (35 states/UTs)
   - Each state has unique base RTO percentage
   - Ranges from 8% (minimum) to 17% (Karnataka)
   - Includes all Indian Union Territories

2. **Fuel Type Differentiation**
   - Petrol: baseline rate
   - Diesel: slight premium (+0.5%)
   - CNG: discount incentive (-0.5%)
   - Hybrid: moderate incentive (-1%)
   - EV: significant incentive (-3% to -5%)
   - Delhi & Maharashtra have custom rates

3. **Price Slab Grading**
   - More expensive vehicles pay higher % tax (luxury tax concept)
   - 5 price tiers covering ₹0 to 1+ crore range
   - Multipliers: 1x → 2x based on ex-showroom price
   - Ensures luxury vehicles contribute more to road infrastructure

4. **Green Tax (2025 Regulations)**
   - 3% for vehicles 15-20 years old
   - 6% for vehicles >20 years old
   - Encourages new vehicle sales, discourages old cars
   - Aligns with environmental initiatives

5. **EV Incentives**
   - New EVs: 100% RTO exemption in most states
   - `totalRTOPercentage` can go to 0% for new EVs
   - Supports India's EV adoption goals

6. **On-Road Price Calculation**
   - Combines RTO with other charges
   - GST: 5% (standardized)
   - Insurance: 3% (typical third-party)
   - TCS: 1% (only for vehicles ≥₹10L)
   - FASTag: ₹500 standard
   - Returns complete on-road pricing

### 🔄 Related Calculations

The calculator is part of broader pricing suite:

- **EMI Calculator**: Monthly loan payments
- **On-Road Price Estimator**: Total purchase price
- **Fuel Cost Estimator**: Annual/monthly fuel expenses
- **Price Breakdown**: RTO component of on-road price

## Frontend Integration

### Tools Page Integration
- Added RTO tile to main tools grid
- Yellow/Zap icon for visual distinction
- Smooth scroll to RTO calculator section
- Consistent styling with other calculators

### API Integration
- Uses axios client with environment-based API URL
- Endpoint: `POST /api/pricing/calculate-rto`
- Error handling with user-friendly messages
- Loading states with spinner animation

### User Experience
- Real-time validation of inputs
- Clear explanatory text for each field
- Result breakdown showing factor contributions
- Info boxes explaining green tax, price slabs, and EV subsidies

## Testing & Validation

### Edge Cases Handled
- ✅ Zero price (validation error)
- ✅ Very high prices (>1 crore, 2x multiplier applies)
- ✅ New vehicles (age = 0, no green tax)
- ✅ Old vehicles (>20 years, 6% green tax)
- ✅ EVs (potential 100% exemption)
- ✅ Negative fuel surcharges (CNG, Hybrid)

### Example Test Cases

**Test 1: Budget Petrol Car**
- State: Delhi
- Price: ₹3,00,000
- Fuel: Petrol
- Age: 0
- Expected RTO: ~9.6% (₹28,800)

**Test 2: Premium Diesel SUV**
- State: Karnataka
- Price: ₹25,00,000
- Fuel: Diesel
- Age: 0
- Expected RTO: ~44% (₹11,00,000) [17% base × 2x multiplier + 0.5% diesel]

**Test 3: Old CNG Vehicle (Green Tax)**
- State: Maharashtra
- Price: ₹5,00,000
- Fuel: CNG
- Age: 18 (triggers green tax)
- Expected RTO: ~22% (~₹11,000) [10% base × 1.2x slab - 0.5% CNG + 3% green]

**Test 4: New EV**
- State: Any
- Price: ₹15,00,000
- Fuel: EV
- Age: 0
- Expected RTO: ~15% (EV subsidy reduces base to near-zero or exemption)

## Configuration & Customization

### To Update State Base Rates
Edit `backend/src/utils/rtoCalculator.ts`:
```typescript
const STATE_RTO_BASE: Record<string, number> = {
  'State Name': percentage,
  // ...
};
```

### To Modify Price Slabs
Edit `PRICE_SLABS` array:
```typescript
const PRICE_SLABS: Array<{ maxPrice: number; ratio: number }> = [
  { maxPrice: 500000, ratio: 1.0 },
  // ...
];
```

### To Adjust Fuel Surcharges
Edit `FUEL_SURCHARGE` object for state-specific or default surcharges

### To Update Green Tax Rates
Edit `GREEN_TAX` object:
```typescript
const GREEN_TAX: Record<string, number> = {
  '15-20': 3,   // 3% for 15-20 year vehicles
  '20-plus': 6, // 6% for >20 year vehicles
};
```

## Future Enhancements

### Potential Features
1. **Engine Capacity-Based Calculation**
   - Some states use CC instead of price (especially Delhi)
   - Add CC-based tier system

2. **Vehicle Type Differentiation**
   - 2-wheeler, 4-wheeler, commercial, heavy vehicles
   - Different rate structures per category

3. **Bharat Series (BH) Registration**
   - Uniform tax structure across states
   - Potential discount for interstate vehicles

4. **Time-Based Updates**
   - Auto-update rates based on budget announcements
   - Version control for calculation changes

5. **Database Integration**
   - Store RTO rates in MongoDB
   - Admin panel to update rates without code changes
   - Audit log for rate modifications

6. **Integration with Variant Pricing**
   - Pre-populate calculator with variant data
   - Show RTO as component of on-road price

7. **City-Specific Variations**
   - Some cities have additional taxes/charges
   - Incorporate CITY_TO_STATE mapping

## Related Documentation

- [Pricing System Overview](../docs/PRICING.md)
- [Variant Data Model](../docs/VARIANT_MODEL.md)
- [Tax Configuration Guide](../docs/TAX_CONFIG.md)
- [API Documentation](../docs/API.md)

## Support & Debugging

### Common Issues

**Issue:** RTO showing negative percentage
**Solution:** Ensure EV subsidy doesn't exceed base RTO; check calculation logic

**Issue:** Price slab multiplier not applying
**Solution:** Verify price format (should be in INR as number, not string with ₹)

**Issue:** State not found
**Solution:** Verify exact state name spelling from STATE_RTO_BASE mapping

### Debug Mode
Enable logging in controller:
```typescript
console.log('Input:', input);
console.log('RTO Result:', rtoResult);
```

Frontend error logging available in browser console via RTOCalculator component error handling.
