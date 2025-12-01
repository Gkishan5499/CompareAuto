# Dealers Data Format

This file documents the structure and format for dealer data in CompareAuto.in.

## JSON Structure

Each dealer entry must follow this structure:

```json
{
  "id": "DLR0001",
  "name": "ABC Hyundai Delhi",
  "brands": ["Hyundai"],
  "categories": ["Sales", "Service", "Spares"],
  "dealerCode": "HYD-DEL-001",
  "address": {
    "line1": "12, Main Road",
    "line2": "Near Metro",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "phones": ["+91-98xxxxxx", "+91-11-4xxxxxxx"],
  "email": "contact@dealer.in",
  "website": "https://dealer.in",
  "hours": {
    "mon_sat": "10:00–19:00",
    "sun": "Closed"
  },
  "location": {
    "lat": 28.61,
    "lng": 77.21
  },
  "rating": 4.3,
  "verified": true,
  "updated": "2025-11-09",
  "images": ["/public/dealers/dealer-1.jpg"]
}
```

## CSV Format for Bulk Import

For importing large numbers of dealers, use this CSV header format:

```csv
id,name,brands,categories,dealerCode,line1,line2,city,state,pincode,phones,email,website,hours_mon_sat,hours_sun,lat,lng,rating,verified,updated,images
```

### Field Specifications:

- **id**: Unique identifier (format: DLR####)
- **name**: Dealer name
- **brands**: Pipe-separated brand names (e.g., "Hyundai|Maruti")
- **categories**: Pipe-separated categories (Sales|Service|Spares)
- **dealerCode**: Official dealer code from manufacturer
- **line1, line2**: Address lines
- **city**: City name
- **state**: State name
- **pincode**: 6-digit postal code
- **phones**: Pipe-separated phone numbers
- **email**: Contact email
- **website**: Dealer website URL
- **hours_mon_sat**: Business hours (e.g., "10:00–19:00")
- **hours_sun**: Sunday hours (or "Closed")
- **lat, lng**: Geographic coordinates (decimal)
- **rating**: Dealer rating (0.0 to 5.0)
- **verified**: true or false
- **updated**: Date in YYYY-MM-DD format
- **images**: Pipe-separated image paths

### Example CSV Row:

```csv
DLR0001,ABC Hyundai Delhi,Hyundai,Sales|Service|Spares,HYD-DEL-001,"12, Main Road","Near Metro",New Delhi,Delhi,110001,+91-9876543210|+91-11-45678900,contact@abchyundai.in,https://abchyundai.in,10:00–19:00,Closed,28.61,77.21,4.3,true,2025-11-09,/public/dealers/abc-1.jpg
```

## Data Validation Rules

1. **id** must be unique and start with "DLR"
2. **brands** must contain at least one valid brand name
3. **categories** must include at least one of: Sales, Service, Spares
4. **pincode** must be exactly 6 digits
5. **phones** must include at least one phone number with country code
6. **email** must be a valid email format
7. **lat** must be between -90 and 90
8. **lng** must be between -180 and 180
9. **rating** must be between 0.0 and 5.0
10. **updated** must be a valid date in YYYY-MM-DD format

## Supported Brands

The system supports all major automotive brands in India. Refer to the brands.json file for the complete list.

## Categories

- **Sales**: New vehicle sales
- **Service**: After-sales service and maintenance
- **Spares**: Spare parts and accessories

## Future Enhancements

- Social media links
- Customer reviews integration
- Service appointment booking
- Inventory tracking
- Offers and promotions
