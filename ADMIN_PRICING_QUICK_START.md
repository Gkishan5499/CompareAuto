# Admin Quick Start Guide - Pricing & Tax Management

## How to Access Pricing Management

1. **Log in** to the admin panel at `http://localhost:3000/admin`
2. **Click** "Pricing & Taxes" in the left sidebar (with dollar sign icon)
3. You'll see three tabs: **Overview**, **Update Prices**, **State Taxes**

---

## Task 1: Update Ex-Showroom Prices for ALL Vehicles

### Scenario: Increase all car prices by 5%

1. Go to the **Update Prices** tab
2. **Update Type**: Select "Percentage (%)"
3. **Update Value**: Enter `5` (for 5% increase)
4. **Filter**: Leave empty (to update all variants)
5. **Click**: "Update Prices" button
6. ✅ Success! You'll see "Updated X variant prices"

### Alternative: Increase by fixed amount (₹50,000)

1. Go to the **Update Prices** tab
2. **Update Type**: Select "Fixed Amount (₹)"
3. **Update Value**: Enter `50000`
4. **Click**: "Update Prices"
5. ✅ All prices increased by ₹50,000

### Optional: Update only a specific model

1. **Filter by Model**: Enter model ID (e.g., "maruti-swift")
2. This will only update variants of that model
3. **Click**: "Update Prices"

---

## Task 2: Update State Tax Rates

### Scenario: Change GST rate for Delhi from 5% to 5.5%

#### Option A: From Overview Tab
1. Go to the **Overview** tab
2. Find "Delhi" in the **Tax Configurations by State** table
3. **Click** the "Edit" button in that row
4. A dialog will open with current values
5. Change **GST Rate** from `5` to `5.5`
6. **Click** "Update" button
7. ✅ Success! Message confirms "State tax configuration for Delhi updated"

#### Option B: From State Taxes Tab
1. Go to the **State Taxes** tab
2. Find "Delhi" in the table
3. **Click** "Edit"
4. Update any field:
   - **GST Rate** (%): Goods and Services Tax
   - **RTO %**: Road Tax as percentage of price
   - **Insurance %**: Insurance cost percentage
   - **Reg. Fee** (₹): Fixed registration fee
5. **Click** "Update"
6. ✅ Changes saved!

---

## Task 3: View Pricing Summary

1. Go to the **Overview** tab
2. You'll see:
   - **Total Variants**: How many car variants exist
   - **Average Price**: Mean price across all vehicles
   - **Price Range**: Minimum to maximum prices
   - **Tax Configurations**: All states with current tax rates

3. This gives you a quick snapshot of your pricing data

---

## Understanding the Tax Rates

### What each field means:

| Field | Example | Meaning |
|-------|---------|---------|
| **GST Rate** | 5% | Goods & Services Tax on vehicle price |
| **RTO %** | 8% | Road Tax (Road Transport Office fee) |
| **Insurance %** | 3.5% | Insurance as % of vehicle price |
| **Reg. Fee** | ₹2,000 | Fixed registration amount (not %) |

### Example Calculation:
```
Maruti Swift Ex-Showroom Price: ₹1,000,000 in Delhi

Delhi Taxes:
- GST (5%): ₹1,000,000 × 5% = ₹50,000
- RTO (8%): ₹1,000,000 × 8% = ₹80,000
- Insurance (3.5%): ₹1,000,000 × 3.5% = ₹35,000
- Registration: ₹2,000 (fixed)

On-Road Price = ₹1,000,000 + ₹50,000 + ₹80,000 + ₹35,000 + ₹2,000
              = ₹1,167,000
```

---

## Common Scenarios

### Scenario 1: Bulk Price Increase Before Festival Season
1. **Update Prices** tab
2. Type: Percentage
3. Value: `8` (8% increase)
4. Filter: (leave empty for all)
5. Click "Update Prices"
✅ All variant prices increased by 8%

### Scenario 2: Correct Prices Only for Petrol Models
1. **Update Prices** tab
2. Type: Percentage
3. Value: `-3` (negative for decrease)
4. Filter: `maruti-swift` (or any specific model)
5. Click "Update Prices"
✅ Only Maruti Swift variants decreased by 3%

### Scenario 3: Government Changes RTO in a State
1. **State Taxes** tab
2. Find your state in the table
3. Click "Edit"
4. Change **RTO %** field
5. Click "Update"
✅ Tax configuration updated for that state

### Scenario 4: Add Registration Fee for New State
1. **Overview** tab (or State Taxes)
2. If state not in table, you may need backend access to add it
3. Alternatively, use the state-tax-config API endpoint

---

## Tips & Best Practices

### ✅ DO:
- Keep tax rates updated with government changes
- Review prices monthly
- Test price changes on 1-2 variants first (if possible)
- Use percentage for proportional increases
- Use fixed amount for standardized markups
- Document major price changes

### ❌ DON'T:
- Enter negative tax rates
- Make excessive bulk changes without review
- Forget to update taxes when changing prices
- Rely on old cached prices (refresh page if needed)

---

## Price Update Results

When you click "Update Prices", you'll see:
```
Successfully updated 45 variant prices
Update Type: percentage
Update Value: 5
```

This means:
- ✅ 45 variants were updated
- 📈 Each was increased by 5%
- 🕐 Takes effect immediately
- 🌐 Visible to customers right away

---

## Frequently Asked Questions

**Q: Can I update prices of only one variant?**
A: Use the API directly: `PUT /api/variants/:id/price`

**Q: Will the price changes affect ongoing orders?**
A: No, only new quotes/orders use updated prices.

**Q: How do I revert a price increase?**
A: Use negative percentage or subtract amount:
- Increased by 5%? Use -5% to revert
- Increased by ₹50,000? Decrease by ₹50,000

**Q: Are tax rates per state or per city?**
A: Tax rates are per STATE. Multiple cities in same state use same taxes.

**Q: Can I create custom tax rates?**
A: Yes, each of 30 Indian states + Delhi NCR can have custom rates.

**Q: How many states are supported?**
A: All 30 Indian states + Delhi NCR (31 total) are available.

---

## Need Help?

### Common Issues:

**Issue: "Updated 0 variant prices"**
- Check if filter is correct
- Verify variant IDs exist
- Check exShowroomPrice field is set

**Issue: Tax rate not updating**
- Refresh the page
- Check spelling of state name (case-sensitive)
- Verify you have admin access

**Issue: Prices showing old values**
- Clear browser cache
- Refresh page (Ctrl+R)
- May take a moment to propagate

---

## Advanced: Direct API Usage

For developers, you can also use these APIs directly:

### Get all tax rates:
```bash
curl http://localhost:5000/api/state-tax-config
```

### Update Delhi tax:
```bash
curl -X POST http://localhost:5000/api/admin/pricing/taxes/update \
  -H "Content-Type: application/json" \
  -d '{
    "state": "Delhi",
    "gstRate": 5.5,
    "rtoPercentage": 8.5
  }'
```

### Bulk price update:
```bash
curl -X POST http://localhost:5000/api/admin/pricing/variants/update-all \
  -H "Content-Type: application/json" \
  -d '{
    "type": "percentage",
    "value": 5
  }'
```

See `PRICING_API_DOCUMENTATION.md` for more details.

---

## Summary

| Action | Where | Steps |
|--------|-------|-------|
| **View Summary** | Overview | Just view the tab |
| **Update All Prices** | Update Prices | Enter value, click Update |
| **Update State Tax** | State Taxes | Click Edit, modify, click Update |
| **View Tax Config** | Overview/State Taxes | See table with current rates |

---

## Next Steps

After implementing pricing changes:
1. ✅ Test on website to confirm changes
2. ✅ Inform sales team of new prices
3. ✅ Update marketing materials if needed
4. ✅ Monitor customer feedback
5. ✅ Adjust if needed using same process
