# Unified Pricing Types Architecture

## Overview
Centralized, single-source-of-truth type definitions for all pricing calculations across backend, admin, and frontend.

## Type Definitions Location

### Primary Types File
- **Backend**: `backend/src/types/pricing.ts`
- **Frontend**: `frontend/src/types/pricing.ts`
- **Admin**: `admin/src/types/pricing.ts`

All three maintain identical definitions for consistency.

## Core Types

### FuelType
```typescript
export type FuelType = 'petrol' | 'diesel' | 'ev';
```
Restricted fuel type enumeration for type safety.

### PriceInput
Primary input interface for all pricing calculations:
- `stateCode: string` — e.g., 'DL', 'HR', 'MH', 'KA'
- `city?: string` — optional, used for city-specific rules (Mumbai vs Pune)
- `exShowroom: number` — base price in rupees
- `fuelType: FuelType` — vehicle fuel type
- `engineCc: number` — engine displacement in CC

### StateCharges
Component breakdown of state-level charges:
- `rto: number` — Road Tax (mandatory)
- `mcd?: number` — Municipal Corporate Duty
- `roadSafetyCess?: number` — Road Safety Cess
- `registrationFee?: number` — Vehicle Registration Fee
- `notes: string[]` — Calculation breakdown for transparency

### InsuranceBreakup
Insurance calculation with detailed breakdown:
- `premium: number` — calculated insurance amount in rupees
- `approxPercent: number` — insurance as percentage of ex-showroom (0.05 = 5%)
- `notes: string[]` — reasons for uplift (fuel type, state, segment)

### PriceBreakdown
Complete on-road price breakdown:
- `exShowroom: number` — base price
- `stateCode: string` — normalized state code
- `city?: string` — optional city
- `fuelType: FuelType` — vehicle fuel type
- `engineCc: number` — engine size
- **Charge Components**:
  - `rto: number` — road tax
  - `mcd: number` — municipal duty
  - `roadSafetyCess: number` — road safety cess
  - `registrationFee: number` — registration
  - `insurance: number` — insurance premium
  - `tcs: number` — TCS (on vehicles ≥ ₹1M)
  - `fastag: number` — FASTag registration (~₹500–750)
- **Derived**:
  - `otherCharges: number` — tcs + fastag
  - `onRoad: number` — total on-road price
- `notes: string[]` — full calculation trail

## Implementation Files Using Types

### Backend
- `backend/src/lib/onRoadRules.ts` — imports and re-exports types, implements detailed state rules
- `backend/src/lib/priceUtils.ts` — imports InsuranceBreakup, calculates insurance & config-based pricing
- `backend/src/controllers/pricing.controller.ts` — calls pricing functions with typed inputs
- `backend/src/models/Variant.model.ts` — variant schema with fuel type

### Frontend
- `frontend/src/lib/onRoadRules.ts` — imports and re-exports types, mirrors backend logic
- `frontend/src/lib/priceCalculations.ts` — imports InsuranceBreakup, fallback calculations
- `frontend/src/types/pricing.ts` — centralized definitions
- Components using pricing: `VariantDetail.tsx`, `ModelOverview.tsx`, `PriceBreakupModal.tsx`

### Admin
- `admin/src/types/pricing.ts` — centralized definitions available for tax management UI

## Migration Notes

### Backward Compatibility
- `LegacyStateCharges` — for existing database schemas with optional fields
- `LegacyPriceInput` — for existing code paths accepting ex-showroom as primary input

### Usage Pattern
All new pricing logic should:
1. Accept `PriceInput` as primary input type
2. Return `PriceBreakdown` for comprehensive breakdown or `InsuranceBreakup` for insurance-only
3. Import types from `../types/pricing` (relative) or `@/types/pricing` (alias)

### Build Status
✅ **Backend**: Builds successfully  
✅ **Frontend**: Builds successfully  
⚠️ **Admin**: Pre-existing TypeScript errors (unrelated to pricing types)

## State Rules Implementation
`onRoadRules.ts` (backend & frontend) implements:
- **Delhi (DL)**: Price-based RTO + fuel surcharge
- **Haryana (HR)**: Simple slab-based RTO
- **West Bengal (WB)**: Slab-based with EV flat rate
- **Maharashtra (MH)**: City-specific (Mumbai/Pune) with EV concession
- **Karnataka (KA)**: Price-based with EV flat rate + cess
- **Fallback**: Generic 10% + 2% diesel surcharge

Insurance premiums account for:
- **Segment**: <₹500k (5.8%), ₹500k–₹1M (5.6%), ₹1M–₹2M (5.2%), >₹2M (5%)
- **Fuel**: Diesel +0.2pp, EV +1pp
- **State**: Karnataka +0.3pp

TCS and FASTag fees:
- **TCS**: 1% on vehicles ≥ ₹1M
- **FASTag**: ₹600 (KA), ₹750 (Pune), ₹500 (default)
