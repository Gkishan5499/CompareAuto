# Pricing System Architecture - Complete Guide

## Overview
Unified pricing system that sources admin-configured taxes from the database and applies them consistently across frontend, backend, and admin panel.

## Architecture Flow

```
Admin Panel (PricingManagement.tsx)
    ↓
    ├─ /api/admin/pricing/taxes/update [POST]
    │   └─ Updates StateTaxConfig in MongoDB
    │
    └─ Database (StateTaxConfig)
        ├─ state: string (e.g., 'DL', 'MH', 'KA')
        ├─ gstRate: number (e.g., 5 or 0.05)
        ├─ rtoPercentage: number
        ├─ insurancePercentage: number
        └─ registrationFee: number (₹)
                ↓
         Backend (priceUtils.ts)
         └─ calcInsurance() [segment/fuel/state logic]
         └─ calculatePriceBreakdownWithConfig()
                ↓
         API Endpoints
         ├─ GET /api/pricing/variant/:id/price?state=DL
         │   └─ Returns SimplePriceBreakdown with admin taxes
         │
         └─ POST /api/pricing/calc
             └─ Returns SimplePriceBreakdown for custom price
                ↓
         Frontend (VariantDetail.tsx, ModelOverview.tsx)
         ├─ Fetches breakdown from backend
         ├─ Shows on-road price with breakdown
         └─ Falls back to local calculation if backend unavailable
```

## Data Flow

### 1. Admin Configures Taxes
**File**: `admin/src/pages/Pricing/PricingManagement.tsx`
- UI for managing state-wise tax configurations
- Saves to `/api/admin/pricing/taxes/update` endpoint
- Stores in MongoDB `StateTaxConfigs` collection

### 2. Backend Retrieves Admin Taxes
**File**: `backend/src/lib/priceUtils.ts`

**Function**: `calculatePriceBreakdownWithConfig()`
```typescript
const calculatePriceBreakdownWithConfig = (
  exShowroomPrice: number,
  config: {                      // ← From admin panel
    gstRate?: number;            // 5 or 0.05 (normalized)
    rtoPercentage?: number;      // RTO %
    insurancePercentage?: number;
    registrationFee?: number;    // ₹ amount
    state?: string;
  },
  options?: {                     // ← From variant
    fuelType?: string;
    engineCc?: number;
    stateCode?: string;
  }
): SimplePriceBreakdown
```

**Calculation Order**:
1. Normalize percentages (5 → 0.05)
2. Calculate GST: `exShowroom * gstRate`
3. Calculate RTO: `exShowroom * rtoPercentage`
4. Calculate Insurance via `calcInsurance()`:
   - Base %: segment-based (5.0–5.8%)
   - Uplift: diesel +0.2pp, EV +1pp, KA +0.3pp
5. Sum: `exShowroom + gst + rto + insurance + registrationFee`

**Output**: `SimplePriceBreakdown`
```typescript
{
  exShowroomPrice: 800000,
  gst: 40000,          // calculated from admin's gstRate
  rto: 72000,          // calculated from admin's rtoPercentage
  insurance: 48000,    // from calcInsurance() + segment logic
  registrationFee: 2500,  // from admin's registrationFee
  onRoadPrice: 962500
}
```

### 3. Backend API Endpoints
**Files**:
- `backend/src/controllers/pricing.controller.ts`
- `backend/src/routes/pricing.routes.ts`

#### GET /api/pricing/variant/:id/price?state=DL
- Fetches variant spec (fuel type, engine CC)
- Retrieves state tax config from database
- Calls `calculatePriceBreakdownWithConfig()` with admin taxes
- Returns complete breakdown

**Response**:
```json
{
  "variantId": "var123",
  "breakdown": {
    "exShowroomPrice": 800000,
    "gst": 40000,
    "rto": 72000,
    "insurance": 48000,
    "registrationFee": 2500,
    "onRoadPrice": 962500
  },
  "taxConfig": {
    "state": "DL",
    "gstRate": 5,
    "rtoPercentage": 9,
    "insurancePercentage": 3.5,
    "registrationFee": 2500
  },
  "state": "DL"
}
```

#### POST /api/pricing/calc
- Accept custom price + optional fuel type
- Resolves state from city or uses provided state
- Applies admin-configured taxes
- Returns breakdown for price estimation

**Request**:
```json
{
  "exShowroomPrice": 800000,
  "city": "Mumbai",
  "fuelType": "petrol",
  "engineCc": 1200
}
```

### 4. Frontend Display
**File**: `frontend/src/pages/VariantDetail.tsx`

**Flow**:
```typescript
// 1. User selects city
const [selectedCity, setSelectedCity] = useState("Delhi NCR");
const selectedState = getStateFromCity(selectedCity); // → "DL"

// 2. Fetch from backend (with admin taxes)
useEffect(() => {
  const resp = await fetch(`/api/pricing/variant/${variantData.id}/price?state=${selectedState}`);
  const json = await resp.json();
  setPriceBreakdown(json.breakdown);  // ← Admin taxes applied
}, [selectedCity]);

// 3. Display on-road price
<div>{formatINR(priceBreakdown.onRoadPrice)}</div>

// 4. Show breakdown via PriceBreakupComponent
<PriceBreakupComponent breakdown={priceBreakdown} city={selectedCity} />
```

**Component**: `frontend/src/components/variant/PriceBreakupComponent.tsx`
- Shows table with all components
- Displays each charge as percentage of ex-showroom
- Highlights total on-road price

## Type Definitions

### Unified Types (Single Source of Truth)
**Files**:
- `backend/src/types/pricing.ts`
- `frontend/src/types/pricing.ts`
- `admin/src/types/pricing.ts`

```typescript
export type FuelType = 'petrol' | 'diesel' | 'ev';

export interface PriceInput {
  stateCode: string;
  city?: string;
  exShowroom: number;
  fuelType: FuelType;
  engineCc: number;
}

export interface InsuranceBreakup {
  premium: number;
  approxPercent: number;
  notes: string[];
}

export interface PriceBreakdown {
  exShowroom: number;
  stateCode: string;
  city?: string;
  fuelType: FuelType;
  engineCc: number;
  rto: number;
  mcd: number;
  roadSafetyCess: number;
  registrationFee: number;
  insurance: number;
  tcs: number;
  fastag: number;
  otherCharges: number;
  onRoad: number;
  notes: string[];
}
```

## Key Features

### ✅ Admin Control
- Edit state-wise tax rates in PricingManagement UI
- Changes apply immediately to all pricing calculations
- Supports percentage or fixed amount for each tax

### ✅ Segment-Based Insurance
- Automatic adjustment based on ex-showroom price bracket
- Fuel type uplift (diesel, EV)
- State-specific uplift (KA higher quotes)

### ✅ Fallback to Local Logic
- If backend unavailable, frontend uses `calculatePriceBreakdown()`
- Maintains consistent results across all states
- Graceful degradation

### ✅ City-to-State Mapping
- Centralized in `cityStateMapping.ts` (backend & frontend)
- All 25 major cities mapped to 30 states
- Single source of truth for location resolution

## Integration Checklist

- ✅ Admin panel edits taxes → database
- ✅ Backend reads admin taxes from database
- ✅ Backend applies admin taxes to calculations
- ✅ API returns admin-taxed breakdowns
- ✅ Frontend fetches and displays admin-taxed prices
- ✅ Fallback calculation available for resilience
- ✅ City-state mapping centralized
- ✅ Insurance logic unified across segments
- ✅ Type consistency across all layers

## Performance & Caching

- **Backend**: Lean queries, minimal DB hits (1 per state lookup)
- **Frontend**: Caches breakdown in component state
- **Admin**: Real-time updates (no cache invalidation needed)

## Testing Scenarios

1. **Admin changes Delhi RTO from 9% to 10%**
   - Edit in PricingManagement UI → /api/admin/pricing/taxes/update
   - Next frontend price fetch returns 10% RTO
   - Old prices auto-refresh on city change

2. **User views EV pricing**
   - Backend applies KA +0.3pp uplift if Karnataka state
   - Insurance shows 5.8% + 1.0pp = 6.8% for EV
   - Notes explain the uplifts

3. **Backend unavailable**
   - Frontend catches error, falls back to local calc
   - Uses hardcoded defaults (no admin taxes)
   - Same structure, different values

## Troubleshooting

**Frontend shows old prices**: Check city/state selection and network call to backend
**Admin taxes not applied**: Verify `StateTaxConfig` in database, check backend rebuild
**Fallback prices used**: Verify backend is running, check `/api/pricing/variant/:id/price` endpoint
**Type mismatches**: Ensure `types/pricing.ts` imports in all files

