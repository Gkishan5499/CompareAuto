# Data Layer Documentation

## Overview
This document describes the JSON data structure and schemas used throughout the CompareAuto application.

---

## Data Files

| File | Description | Schema |
|------|-------------|--------|
| `brands.json` | All car brands/manufacturers | Brand[] |
| `models.json` | Car models with specifications | Model[] |
| `variants.json` | Model variants with pricing | Variant[] |
| `comparisons.json` | Trending comparisons data | Comparison[] |
| `articles.json` | News articles and content | Article[] |
| `used-cars.json` | Used car listings | UsedCar[] |
| `fuel-prices.json` | City-wise fuel prices | FuelPrice[] |
| `electricity-rates.json` | State/DISCOM electricity rates | ElectricityRate[] |

---

## Schema Definitions

### Brand Schema
```typescript
interface Brand {
  id: string;           // Unique identifier (e.g., "B001")
  name: string;         // Display name (e.g., "Maruti Suzuki")
  logo: string;         // Logo image path
  country: string;      // Country of origin
  modelCount: number;   // Number of models
  slug: string;         // URL-friendly slug
}
```

**Example:**
```json
{
  "id": "B001",
  "name": "Maruti Suzuki",
  "logo": "/brands/maruti-suzuki.png",
  "country": "India",
  "modelCount": 16,
  "slug": "maruti-suzuki"
}
```

---

### Model Schema
```typescript
interface Model {
  id: string;           // Unique identifier (e.g., "M001")
  name: string;         // Model name (e.g., "Swift")
  brandId: string;      // Foreign key to Brand
  brandName: string;    // Brand display name
  slug: string;         // URL-friendly slug
  image: string;        // Primary image path
  bodyType: string;     // "Hatchback" | "Sedan" | "SUV" | "MUV" | "Coupe"
  priceRange: {
    min: number;        // Minimum price in INR
    max: number;        // Maximum price in INR
  };
  variantCount: number; // Number of variants
  rating: number;       // Average rating (1-5)
  reviews: number;      // Number of reviews
  media?: {
    hero: string;               // Hero image path
    gallery: string[];          // Gallery image paths
    videoUrl?: string;          // YouTube/Vimeo URL
    spin360Url?: string;        // 360 viewer iframe URL
    spinFrames?: string[];      // Array of 360 frame paths
  };
}
```

**Example:**
```json
{
  "id": "M001",
  "name": "Swift",
  "brandId": "B001",
  "brandName": "Maruti Suzuki",
  "slug": "swift",
  "image": "/cars/maruti-suzuki/swift/swift-hero.png",
  "bodyType": "Hatchback",
  "priceRange": {
    "min": 599000,
    "max": 899000
  },
  "variantCount": 9,
  "rating": 4.5,
  "reviews": 1560,
  "media": {
    "hero": "/cars/maruti-suzuki/swift/hero.png",
    "gallery": [
      "/cars/maruti-suzuki/swift/front.png",
      "/cars/maruti-suzuki/swift/side.png"
    ],
    "videoUrl": "https://www.youtube.com/watch?v=example",
    "spinFrames": [
      "/cars/maruti-suzuki/swift/360/frame_001.png",
      "/cars/maruti-suzuki/swift/360/frame_002.png"
    ]
  }
}
```

---

### Variant Schema
```typescript
interface Variant {
  id: string;           // Unique identifier (e.g., "V001")
  modelId: string;      // Foreign key to Model
  name: string;         // Variant name (e.g., "ZXi+ AMT")
  slug: string;         // URL-friendly slug
  price: number;        // Ex-showroom price in INR
  fuelType: string;     // "Petrol" | "Diesel" | "CNG" | "Electric" | "Hybrid"
  transmission: string; // "MT" | "AT" | "AMT" | "CVT" | "DCT"
  engine: string;       // Engine spec (e.g., "1.2L K-Series")
  mileage: number;      // Mileage in km/l or km/charge
  seating: number;      // Seating capacity
  colors: string[];     // Available colors
  media?: {
    hero: string;               // Variant hero image
    gallery: string[];          // Variant-specific images
    videoUrl?: string;          // Variant video URL
    spin360Url?: string;        // Variant 360 viewer
    spinFrames?: string[];      // Variant 360 frames
  };
}
```

**Example:**
```json
{
  "id": "V001",
  "modelId": "M001",
  "name": "ZXi+ AMT",
  "slug": "zxi-plus-amt",
  "price": 899000,
  "fuelType": "Petrol",
  "transmission": "AMT",
  "engine": "1.2L K-Series",
  "mileage": 23.76,
  "seating": 5,
  "colors": ["Pearl Arctic White", "Solid Fire Red", "Premium Silver"]
}
```

---

### UsedCar Schema
```typescript
interface UsedCar {
  id: string;           // Listing ID (e.g., "UC123")
  title: string;        // Full title with year
  brand: string;        // Brand name
  model: string;        // Model name
  variant: string;      // Variant name
  year: number;         // Manufacturing year
  fuel: string;         // Fuel type
  transmission: string; // Transmission type
  kms: number;          // Kilometers driven
  owners: number;       // Number of previous owners
  city: string;         // City name
  price: number;        // Asking price in INR
  images: string[];     // Array of image paths
  features: string[];   // Key features
  sellerType: string;   // "Dealer" | "Individual"
  sellerName: string;   // Seller/dealer name
  sellerPhone: string;  // Contact number
  listingUrl: string;   // Canonical URL
  verified: boolean;    // Verification status
}
```

**Example:**
```json
{
  "id": "UC123",
  "title": "2019 Maruti Swift ZXi+",
  "brand": "Maruti Suzuki",
  "model": "Swift",
  "variant": "ZXi+",
  "year": 2019,
  "fuel": "Petrol",
  "transmission": "MT",
  "kms": 34000,
  "owners": 1,
  "city": "Delhi NCR",
  "price": 635000,
  "images": [
    "/used/delhi-ncr/uc123/0.png",
    "/used/delhi-ncr/uc123/1.png"
  ],
  "features": ["Alloy wheels", "Rear camera", "ABS", "Airbags"],
  "sellerType": "Dealer",
  "sellerName": "Auto Star Delhi",
  "sellerPhone": "+91-98xxxxxx",
  "listingUrl": "/used-cars/delhi-ncr/uc123",
  "verified": true
}
```

---

### Article Schema
```typescript
interface Article {
  id: string;           // Unique identifier
  slug: string;         // URL-friendly slug
  title: string;        // Article title
  category: string;     // "News" | "Reviews" | "Guides" | "Comparisons"
  tags: string[];       // Tags for filtering
  date: string;         // ISO date string
  author: string;       // Author name
  heroImage: string;    // Hero image path
  excerpt: string;      // Short description (150-160 chars)
  body: string;         // Full article content (HTML or Markdown)
  relatedIds: string[]; // Related article IDs
  readingTime: number;  // Estimated reading time in minutes
}
```

---

### FuelPrice Schema
```typescript
interface FuelPrice {
  city: string;           // City slug (e.g., "delhi-ncr")
  cityName: string;       // Display name (e.g., "Delhi NCR")
  petrol: number;         // Petrol price per liter (₹)
  diesel: number;         // Diesel price per liter (₹)
  cng: number | null;     // CNG price per kg (₹) or null if N/A
  updated: string;        // Last updated (YYYY-MM-DD)
}
```

**Example:**
```json
{
  "city": "delhi-ncr",
  "cityName": "Delhi NCR",
  "petrol": 96.72,
  "diesel": 89.62,
  "cng": 75.61,
  "updated": "2025-11-09"
}
```

**Top Cities**: delhi-ncr, mumbai, bangalore, hyderabad, pune, chennai

---

### ElectricityRate Schema
```typescript
interface ElectricityRate {
  state: string;          // State slug (e.g., "delhi")
  stateName: string;      // Display name (e.g., "Delhi")
  discom: string;         // DISCOM slug (e.g., "bses")
  discomName: string;     // DISCOM name (e.g., "BSES Rajdhani")
  slab: string;           // Usage slab (e.g., "0-200", "201-400")
  ratePerUnit: number;    // ₹ per kWh
  fixedPerDay: number;    // Fixed daily charge (₹)
  updated: string;        // Last updated (YYYY-MM-DD)
}
```

**Example:**
```json
{
  "state": "delhi",
  "stateName": "Delhi",
  "discom": "bses",
  "discomName": "BSES Rajdhani",
  "slab": "0-200",
  "ratePerUnit": 4.50,
  "fixedPerDay": 0.50,
  "updated": "2025-11-09"
}
```

**EV Calculation Defaults**:
- kWh per km: 0.12 (≈ 12 kWh/100 km) - editable in UI
- Monthly fixed charge: fixedPerDay × 30

---

## Data Layer Functions

Located in `src/lib/data.ts`, these functions provide type-safe access to data:

### Brand Functions
```typescript
getBrands(): Brand[]
getBrandBySlug(slug: string): Brand | undefined
```

### Model Functions
```typescript
getModels(): Model[]
getModelsByBrand(brandSlug: string): Model[]
getModel(brandSlug: string, modelSlug: string): Model | undefined
getFeaturedModels(): Model[]
```

### Variant Functions
```typescript
getVariants(modelId: string): Variant[]
getVariant(brandSlug: string, modelSlug: string, variantSlug: string): Variant | undefined
```

### Search Functions
```typescript
searchCars(query: string): (Brand | Model | Variant)[]
searchArticles(query: string): Article[]
searchUsedCars(query: string, filters?: object): UsedCar[]
```

### Used Cars Functions
```typescript
getUsedCars(params?: { city?: string }): UsedCar[]
getUsedCar(id: string): UsedCar | undefined
getUsedCities(): string[]
```

### Fuel & Electricity Functions (in `src/lib/prices.ts`)
```typescript
// City-wise fuel prices
listCities(): Array<{ slug: string; name: string }>
getFuelPrice(citySlug: string): FuelPrice | null

// State/DISCOM electricity rates
listStates(): Array<{ slug: string; name: string }>
listDiscoms(stateSlug: string): Array<{ slug: string; name: string }>
getElectricityRates({ stateSlug, discomSlug }): ElectricityRatesResponse | null
```

### API Mock Functions (in `src/lib/api-prices.ts` and `src/lib/api-otp.ts`)
```typescript
// Price APIs
getOnRoadPrice({ variantId, city }): Promise<OnRoadPriceBreakup>
getFuelPriceAPI(city: string): Promise<FuelPrice>
getElectricityRateAPI({ state, discom }): Promise<ElectricityRatesResponse>

// OTP & Enquiry (mock, no real SMS)
requestOTP(mobile: string): Promise<{ success: boolean; txnId: string; ttl: number }>
verifyOTP(txnId: string, code: string): Promise<{ success: boolean }>
submitEnquiry(payload: EnquiryPayload): Promise<{ success: boolean; ref: string }>
```

---

## CSV Import Guidelines (Future)

### Expected Format
When importing bulk data from "Car Details Format" spreadsheets:

**Mapping:**
| CSV Column | JSON Field | Transformation |
|------------|------------|----------------|
| Brand Name | brandName | Direct |
| Model Name | name | Direct |
| Variant Name | variant.name | Direct |
| Ex-Showroom Price | variant.price | Parse number, multiply by 100 |
| Fuel Type | variant.fuelType | Capitalize |
| Transmission | variant.transmission | Map to standard codes |
| Mileage | variant.mileage | Parse number |
| Engine Capacity | variant.engine | Format with unit |
| Seating Capacity | variant.seating | Parse number |

**Import Script Pseudocode:**
```typescript
// Future implementation
function importVariantsFromCSV(csvPath: string) {
  const rows = parseCSV(csvPath);
  
  rows.forEach(row => {
    const variant: Variant = {
      id: generateId(),
      modelId: findModelId(row.brandName, row.modelName),
      name: row.variantName,
      slug: slugify(row.variantName),
      price: parsePrice(row.exShowroomPrice),
      fuelType: standardizeFuelType(row.fuelType),
      transmission: mapTransmission(row.transmission),
      engine: formatEngine(row.engineCapacity),
      mileage: parseFloat(row.mileage),
      seating: parseInt(row.seatingCapacity),
      colors: parseColors(row.availableColors)
    };
    
    saveVariant(variant);
  });
}
```

---

## Data Validation

### Pre-Flight Checks
Before deploying data updates:

- [ ] All IDs are unique within their collection
- [ ] All foreign keys reference existing records
- [ ] Image paths are valid and accessible
- [ ] Prices are in INR (no decimals for ex-showroom)
- [ ] Slugs are URL-safe (lowercase, hyphenated)
- [ ] Required fields are present (no null/undefined)
- [ ] Enum values match allowed types (fuelType, bodyType, etc.)
- [ ] Dates are in ISO 8601 format

### Validation Script
Run this command to validate JSON data:
```bash
npm run validate-data
```

---

## Backup & Version Control

- All JSON files are tracked in Git
- Create backups before bulk imports/updates
- Use descriptive commit messages when updating data
- Tag releases with data schema version numbers

---

## Future Enhancements

- [ ] Database migration (Supabase/PostgreSQL)
- [ ] GraphQL API layer
- [ ] Real-time price updates via API
- [ ] CSV import/export tools
- [ ] Data validation CI/CD pipeline
- [ ] Automated testing for data integrity
