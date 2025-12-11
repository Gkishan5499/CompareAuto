# Pricing & Tax Management System - Implementation Summary

## Overview
A comprehensive backend and admin panel system for managing vehicle ex-showroom prices and state-wise tax configurations. Admins can update prices for all or filtered variants and manage tax rates (GST, RTO, Insurance, Registration Fee) by state.

## Architecture Overview

### Backend Components

#### 1. Models
- **StateTaxConfig.model.ts** - MongoDB schema for state tax configurations
  - Fields: state, gstRate, rtoPercentage, insurancePercentage, registrationFee
  - Unique index on state field
  
- **Variant.model.ts** (Updated) - Added exShowroomPrice field for explicit price management

#### 2. Controllers
- **stateTaxConfig.controller.ts** - CRUD operations for state tax configurations
- **pricing.admin.controller.ts** - Admin endpoints for batch price updates and tax management
- **variant.controller.ts** (Updated) - Added endpoints for price updates

#### 3. Routes
- **stateTaxConfig.routes.ts** - Public routes for tax configurations
  - GET /api/state-tax-config (all states)
  - GET /api/state-tax-config/:state (specific state)
  - POST /api/state-tax-config (create)
  - PUT /api/state-tax-config/:state (update)
  - POST /api/state-tax-config/bulk/update (bulk update)
  - DELETE /api/state-tax-config/:state (delete)

- **pricing.admin.routes.ts** - Admin-protected routes
  - GET /api/admin/pricing/summary
  - POST /api/admin/pricing/variants/update-all
  - GET /api/admin/pricing/taxes/state-wise
  - POST /api/admin/pricing/taxes/update
  - POST /api/admin/pricing/taxes/bulk-update

- **variant.routes.ts** (Updated) - Added price endpoints
  - PUT /api/variants/:id/price
  - POST /api/variants/prices/bulk
  - POST /api/variants/model/:modelId/update-prices

#### 4. Utilities & Scripts
- **seedStateTaxConfigs.ts** - Initializes all 30 Indian states with default tax rates on first run

### Frontend Components

#### 1. Admin Panel Page
- **PricingManagement.tsx** - Complete admin UI with 3 tabs:
  - **Overview Tab**: Summary stats + tax configuration table with edit buttons
  - **Update Prices Tab**: Interface to update all variant prices (percentage or fixed)
  - **State Taxes Tab**: Manage tax configurations by state

#### 2. Hooks
- **useStateTaxConfig.ts** - React Query hooks for fetching tax configurations
  - useStateTaxConfigs() - All states
  - useStateTaxConfig(state) - Specific state

#### 3. Navigation
- Updated Sidebar to include "Pricing & Taxes" menu item with DollarSign icon
- Route: /admin/pricing

### Price Calculation
- **priceCalculations.ts** (Frontend) - Calculates on-road prices using formula:
  ```
  onRoadPrice = exShowroomPrice + GST + RTO + Insurance + RegistrationFee
  ```
- Uses backend tax configurations for accurate calculations

---

## Key Features

### 1. Batch Price Updates
- Update all variant prices at once
- Support for percentage increase/decrease or fixed amount
- Optional filtering by model, fuel type, transmission
- Real-time feedback with count of updated variants

### 2. State-wise Tax Management
- Manage GST, RTO, Insurance %, and Registration Fee per state
- Covers all 30 Indian states + Delhi NCR
- Individual or bulk updates
- Full audit trail with timestamps

### 3. Pricing Summary Dashboard
- Total variants count
- Average, minimum, maximum prices
- Current tax configurations across all states
- Quick edit access to any state

### 4. Dynamic Price Calculations
- Frontend calculates on-road prices based on selected city
- Uses backend-managed tax rates
- Real-time updates when city is changed
- Detailed breakdown modal

---

## Database Schema

### StateTaxConfig Collection
```json
{
  "_id": ObjectId,
  "state": "Delhi",
  "gstRate": 5,
  "rtoPercentage": 8,
  "insurancePercentage": 3.5,
  "registrationFee": 2000,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Variant Collection (Updated Field)
```json
{
  "id": "maruti-swift-automatic",
  "modelId": "maruti-swift",
  "name": "Automatic",
  "exShowroomPrice": 1500000,  // NEW FIELD
  "price": 1500000,
  ...
}
```

---

## API Endpoints Reference

### State Tax Configuration (Public)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/state-tax-config` | Get all state taxes |
| GET | `/api/state-tax-config/:state` | Get specific state tax |
| POST | `/api/state-tax-config` | Create new state tax |
| PUT | `/api/state-tax-config/:state` | Update state tax |
| POST | `/api/state-tax-config/bulk/update` | Bulk update taxes |
| DELETE | `/api/state-tax-config/:state` | Delete state tax |

### Variant Prices
| Method | Endpoint | Purpose |
|--------|----------|---------|
| PUT | `/api/variants/:id/price` | Update single variant price |
| POST | `/api/variants/prices/bulk` | Bulk update variant prices |
| POST | `/api/variants/model/:modelId/update-prices` | Update all variants of a model |

### Admin Pricing (Protected)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/pricing/summary` | Get pricing & tax summary |
| POST | `/api/admin/pricing/variants/update-all` | Batch update all variant prices |
| GET | `/api/admin/pricing/taxes/state-wise` | Get all state taxes |
| POST | `/api/admin/pricing/taxes/update` | Update single state tax |
| POST | `/api/admin/pricing/taxes/bulk-update` | Bulk update state taxes |

---

## Usage Examples

### 1. Update All Variant Prices (5% increase)
```bash
POST /api/admin/pricing/variants/update-all
Content-Type: application/json

{
  "type": "percentage",
  "value": 5,
  "filters": {}
}
```

### 2. Update Prices of Specific Model (Fixed ₹50,000 increase)
```bash
POST /api/admin/pricing/variants/update-all
Content-Type: application/json

{
  "type": "fixed",
  "value": 50000,
  "filters": {
    "modelId": "maruti-swift"
  }
}
```

### 3. Update State Tax Configuration
```bash
POST /api/admin/pricing/taxes/update
Content-Type: application/json

{
  "state": "Delhi",
  "gstRate": 5.5,
  "rtoPercentage": 9
}
```

### 4. Get Price Summary
```bash
GET /api/admin/pricing/summary

Response:
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

---

## Data Flow Diagrams

### Price Update Flow
```
Admin UI (Update Prices Tab)
    ↓
[Enter: type, value, optional filters]
    ↓
POST /api/admin/pricing/variants/update-all
    ↓
Backend: Fetch variants matching filters
    ↓
Calculate new price (exShowroom × 1 + percentage/fixed)
    ↓
Batch update database
    ↓
Return count of updated variants
    ↓
UI shows success message + refreshes summary
```

### Tax Update Flow
```
Admin UI (State Taxes Tab)
    ↓
[Click Edit button on state row]
    ↓
[Dialog opens with current values]
    ↓
[Modify GST, RTO, Insurance, Registration Fee]
    ↓
POST /api/admin/pricing/taxes/update
    ↓
Backend: Update state tax document
    ↓
Return updated configuration
    ↓
UI shows success message + refreshes table
```

### Frontend Price Calculation Flow
```
User selects city on VariantDetail page
    ↓
getStateFromCity("Delhi") → "Delhi"
    ↓
Fetch tax config from /api/state-tax-config/Delhi (cached)
    ↓
calculatePriceBreakdown(1500000, "Delhi") 
    ↓
Calculate: GST, RTO, Insurance, RegFee based on tax rates
    ↓
Display on-road price: exShowroom + all taxes
    ↓
User clicks "Check On-Road Price" button
    ↓
Open PriceBreakupModal with detailed breakdown
```

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── StateTaxConfig.model.ts (NEW)
│   │   └── Variant.model.ts (UPDATED)
│   ├── controllers/
│   │   ├── stateTaxConfig.controller.ts (NEW)
│   │   ├── pricing.admin.controller.ts (NEW)
│   │   └── variant.controller.ts (UPDATED)
│   ├── routes/
│   │   ├── stateTaxConfig.routes.ts (NEW)
│   │   ├── pricing.admin.routes.ts (NEW)
│   │   └── variant.routes.ts (UPDATED)
│   ├── scripts/
│   │   └── seedStateTaxConfigs.ts (NEW)
│   ├── app.ts (UPDATED)
│   └── server.ts (UPDATED)
└── PRICING_API_DOCUMENTATION.md (NEW)

admin/
├── src/
│   ├── pages/
│   │   └── Pricing/
│   │       └── PricingManagement.tsx (NEW)
│   ├── components/
│   │   └── layout/
│   │       └── Sidebar.tsx (UPDATED)
│   └── App.tsx (UPDATED)

frontend/
├── src/
│   ├── hooks/
│   │   └── useStateTaxConfig.ts (NEW)
│   └── lib/
│       └── priceCalculations.ts (uses backend configs)
```

---

## Default State Tax Configurations

All 30 Indian states + Delhi NCR are seeded with default values:
- **GST Rate**: 5%
- **RTO Percentage**: 8-10% (varies by state)
- **Insurance Percentage**: 3.5%
- **Registration Fee**: ₹2,000 - ₹3,000 (varies by state)

These can be edited via the admin panel as needed.

---

## Security Considerations

1. **Authentication**: All `/api/admin/pricing/*` endpoints should be protected
2. **Authorization**: Only admin users should access pricing management
3. **Input Validation**: All price values validated to prevent negative amounts
4. **Audit Logging**: Consider logging all price changes for compliance
5. **Rate Limiting**: Apply rate limits to prevent abuse
6. **Data Integrity**: Unique indexes prevent duplicate state configurations

---

## Future Enhancements

1. **Price History Tracking** - Log all price changes with timestamps
2. **Price Comparison Reports** - Compare prices across states/models
3. **CSV Import** - Bulk import price updates from CSV
4. **Discounts** - Add promotional discounts per state
5. **Analytics** - Show price trends and variations
6. **Notifications** - Alert when prices change significantly
7. **Scheduled Updates** - Schedule price changes for future dates
8. **Exchange Value** - Factor in trade-in value calculations

---

## Setup Instructions

### Backend
1. Models and controllers already created
2. Routes registered in app.ts
3. Database seed runs automatically on server start
4. No additional setup needed - just restart backend

### Admin Panel
1. PricingManagement component created
2. Route added to /pricing
3. Sidebar navigation updated
4. No additional setup - visit /admin/pricing to use

### Frontend
1. useStateTaxConfig hook available for components
2. Price calculations automatically use backend tax configs
3. No changes needed to existing components - they work as-is

---

## Testing

### Backend Testing
```bash
# Get all states
curl http://localhost:5000/api/state-tax-config

# Get specific state
curl http://localhost:5000/api/state-tax-config/Delhi

# Update variant prices (5% increase)
curl -X POST http://localhost:5000/api/admin/pricing/variants/update-all \
  -H "Content-Type: application/json" \
  -d '{"type":"percentage","value":5}'

# Get summary
curl http://localhost:5000/api/admin/pricing/summary
```

### Admin Panel Testing
1. Navigate to http://localhost:3000/admin/pricing
2. Overview tab shows summary + current tax configurations
3. Update Prices tab: Enter values and click Update
4. State Taxes tab: Click Edit on any state to modify taxes

---

## Troubleshooting

### Tax configurations not showing
- Check MongoDB connection
- Verify seedStateTaxConfigs ran successfully
- Check /api/state-tax-config endpoint

### Price updates not working
- Verify variant IDs are correct
- Check exShowroomPrice field exists in variants
- Review MongoDB update results

### Admin panel not loading
- Check authentication/authorization
- Verify /api/admin/pricing/summary endpoint works
- Check browser console for errors

---

## Maintenance

### Regular Tasks
1. Review price updates monthly
2. Monitor tax rate changes by government
3. Update registration fees annually
4. Audit bulk price changes

### Data Cleanup
```javascript
// MongoDB: View all state configurations
db.statetaxconfigs.find()

// Update a single state
db.statetaxconfigs.updateOne(
  { state: "Delhi" },
  { $set: { gstRate: 5.5 } }
)
```

---

## Support & Documentation

- **API Documentation**: See PRICING_API_DOCUMENTATION.md
- **Component Code**: frontend/src/pages/Pricing/PricingManagement.tsx
- **Hooks**: frontend/src/hooks/useStateTaxConfig.ts
- **Models**: backend/src/models/StateTaxConfig.model.ts
