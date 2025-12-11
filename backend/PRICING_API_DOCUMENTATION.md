# Pricing & Tax Management System

## Overview
This system allows admins to manage ex-showroom prices of vehicles and state-wise tax configurations through the admin panel.

## Backend API Endpoints

### 1. State Tax Configuration Endpoints

#### Get All State Tax Configurations
```
GET /api/state-tax-config
```
**Response:**
```json
[
  {
    "_id": "...",
    "state": "Delhi",
    "gstRate": 5,
    "rtoPercentage": 8,
    "insurancePercentage": 3.5,
    "registrationFee": 2000
  }
]
```

#### Get Tax Configuration for Specific State
```
GET /api/state-tax-config/:state
```
**Example:** `GET /api/state-tax-config/Delhi`

#### Create New State Tax Configuration
```
POST /api/state-tax-config
```
**Request Body:**
```json
{
  "state": "Maharashtra",
  "gstRate": 5,
  "rtoPercentage": 9,
  "insurancePercentage": 3.5,
  "registrationFee": 3000
}
```

#### Update State Tax Configuration
```
PUT /api/state-tax-config/:state
```
**Request Body (all fields optional):**
```json
{
  "gstRate": 5.5,
  "rtoPercentage": 9.5,
  "insurancePercentage": 3.7,
  "registrationFee": 3100
}
```

#### Bulk Update State Tax Configurations
```
POST /api/state-tax-config/bulk/update
```
**Request Body:**
```json
{
  "updates": [
    {
      "state": "Delhi",
      "gstRate": 5.5
    },
    {
      "state": "Maharashtra",
      "rtoPercentage": 9.5
    }
  ]
}
```

#### Delete State Tax Configuration
```
DELETE /api/state-tax-config/:state
```

---

### 2. Variant Price Management Endpoints

#### Update Single Variant Price
```
PUT /api/variants/:id/price
```
**Request Body:**
```json
{
  "exShowroomPrice": 1500000,
  "price": 1500000
}
```

#### Bulk Update Variant Prices
```
POST /api/variants/prices/bulk
```
**Request Body:**
```json
{
  "updates": [
    {
      "id": "variant-1",
      "exShowroomPrice": 1500000
    },
    {
      "id": "variant-2",
      "exShowroomPrice": 2000000
    }
  ]
}
```

#### Update All Variants of a Model
```
POST /api/variants/model/:modelId/update-prices
```
**Request Body:**
```json
{
  "type": "percentage",
  "value": 5.5
}
```
Or:
```json
{
  "type": "fixed",
  "value": 100000
}
```

---

### 3. Admin Pricing Management Endpoints

#### Get Pricing and Tax Summary
```
GET /api/admin/pricing/summary
```
**Response:**
```json
{
  "variants": {
    "total": 150,
    "priceStats": {
      "average": 1500000,
      "min": 800000,
      "max": 5000000
    }
  },
  "taxConfigs": [...]
}
```

#### Update All Variant Prices (Admin)
```
POST /api/admin/pricing/variants/update-all
```
**Request Body:**
```json
{
  "type": "percentage",
  "value": 5.5,
  "filters": {
    "modelId": "maruti-swift",
    "fuelType": "petrol",
    "transmission": "automatic"
  }
}
```

#### Get All State Tax Configurations (Admin)
```
GET /api/admin/pricing/taxes/state-wise
```

#### Update State Tax (Admin)
```
POST /api/admin/pricing/taxes/update
```
**Request Body:**
```json
{
  "state": "Delhi",
  "gstRate": 5,
  "rtoPercentage": 8,
  "insurancePercentage": 3.5,
  "registrationFee": 2000
}
```

#### Bulk Update State Taxes (Admin)
```
POST /api/admin/pricing/taxes/bulk-update
```
**Request Body:**
```json
{
  "updates": [
    {
      "state": "Delhi",
      "gstRate": 5.5
    },
    {
      "state": "Maharashtra",
      "gstRate": 6
    }
  ]
}
```

---

## Admin Panel UI

### Location
`/pricing` - Access via the admin sidebar under "Pricing & Taxes"

### Features

#### 1. Overview Tab
- **Pricing Summary**: Total variants, average price, and price range
- **Tax Configurations Table**: View all states with their current tax rates
- **Edit Tax**: Click "Edit" button to modify tax configuration for any state

#### 2. Update Prices Tab
- **Update Type**: Choose between percentage (%) or fixed amount (₹)
- **Update Value**: Enter the percentage increase/decrease or fixed amount
- **Filter by Model**: Optional - only update variants of a specific model
- **Update Button**: Apply changes to all matching variants

#### 3. State Taxes Tab
- **Tax Configuration Table**: View all states and their tax rates
- **Edit Button**: Open dialog to modify tax configuration
- **Edit Dialog**: Update GST Rate, RTO %, Insurance %, and Registration Fee

---

## Frontend Integration

### Using State Tax Configs in Components

#### Hook: `useStateTaxConfigs()`
```typescript
import { useStateTaxConfigs } from "@/hooks/useStateTaxConfig";

function MyComponent() {
  const { data: configs, isLoading } = useStateTaxConfigs();
  
  return (
    // Use configs...
  );
}
```

#### Hook: `useStateTaxConfig(state)`
```typescript
import { useStateTaxConfig } from "@/hooks/useStateTaxConfig";

function MyComponent({ state }: { state: string }) {
  const { data: config, isLoading } = useStateTaxConfig(state);
  
  return (
    // Use config...
  );
}
```

#### Utility Function: `calculatePriceBreakdown()`
```typescript
import { calculatePriceBreakdown } from "@/lib/priceCalculations";

const breakdown = calculatePriceBreakdown(1500000, "Delhi");
// Returns: { exShowroomPrice, gst, rto, insurance, registrationFee, onRoadPrice }
```

---

## Data Flow

### Price Update Flow
1. Admin opens **Pricing & Taxes** page
2. Enters update value and selects type (percentage/fixed)
3. Optionally filters by model/fuel type
4. Clicks **Update Prices**
5. Backend updates all matching variant prices in database
6. Frontend shows success message with count of updated variants
7. Summary stats are refreshed

### Tax Update Flow
1. Admin views current tax configurations
2. Clicks **Edit** on a state row
3. Opens dialog with current values
4. Modifies one or more tax fields
5. Clicks **Update**
6. Backend updates tax configuration in database
7. Frontend shows success message
8. Tax table is refreshed

### Frontend Price Calculation Flow
1. User selects a city from dropdown
2. Frontend determines state from city using `getStateFromCity()`
3. Fetches tax config from backend (cached via React Query)
4. Calls `calculatePriceBreakdown(exShowroomPrice, city)` with tax data
5. Displays calculated on-road price and breakdown

---

## Database Schema

### StateTaxConfig Collection
```javascript
{
  _id: ObjectId,
  state: String,          // e.g., "Delhi", "Maharashtra"
  gstRate: Number,        // 5, 5.5, 12 (in percent)
  rtoPercentage: Number,  // 8, 9, 10 (in percent)
  insurancePercentage: Number, // 3.5, 4 (in percent)
  registrationFee: Number, // 2000, 2500, 3000 (in INR)
  createdAt: Date,
  updatedAt: Date
}
```

### Variant Collection (Updated)
```javascript
{
  id: String,
  modelId: String,
  name: String,
  slug: String,
  price: Number,
  exShowroomPrice: Number,  // NEW: Explicit ex-showroom price
  fuelType: String,
  transmission: String,
  engine: String,
  mileage: Number,
  seating: Number,
  colors: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Price Calculation Formula

```
onRoadPrice = exShowroomPrice + GST + RTO + Insurance + RegistrationFee

Where:
  GST = exShowroomPrice × (gstRate / 100)
  RTO = exShowroomPrice × (rtoPercentage / 100)
  Insurance = exShowroomPrice × (insurancePercentage / 100)
  RegistrationFee = fixed amount per state
```

---

## Error Handling

### Common Error Responses

**404 - Not Found**
```json
{ "message": "Configuration for Delhi not found" }
```

**400 - Bad Request**
```json
{ "error": "State name is required" }
```

**500 - Server Error**
```json
{ "error": "Failed to fetch state tax configurations" }
```

---

## Security Considerations

- All admin endpoints should be protected with authentication
- Only authenticated admin users should access `/api/admin/pricing/*`
- Validate all price updates to prevent negative values
- Log all admin modifications for audit trail
- Consider implementing role-based access control (RBAC)

---

## Future Enhancements

1. **Price History**: Track price changes over time
2. **Discount Management**: Add promotional discounts by city/state
3. **Exchange Value Calculator**: Factor in car exchange values
4. **Bulk CSV Import**: Import price updates from CSV
5. **Price Comparison**: Compare prices across states/cities
6. **Notifications**: Alert when prices change
7. **Analytics Dashboard**: Show price trends and variations
