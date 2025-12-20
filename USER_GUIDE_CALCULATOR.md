# On-Road Price Calculator - User Guide

## Where to Find the Calculator

### Location 1: Model Overview Page (Recommended)
**Path:** `/brands/{brand}/{model}`

1. Open any car model page
2. Look for the **"Overview"** tab at the top of the page
3. Scroll down past the "Key Features" section
4. Find the **"On-Road Price Breakdown"** card

**This is the best place to:**
- Select your preferred fuel type
- See the complete price breakdown
- Change your city using the right sidebar selector
- Understand the cost of owning that specific car

### Location 2: Variant Detail Page
**Path:** `/brands/{brand}/{model}/{variant}`

1. Open a specific variant page
2. Look for the **"Price & EMI"** tab
3. At the top of that section, you'll see the **variant-specific calculator**

**This is useful for:**
- Comparing different fuel types for a single variant
- Seeing exact variant pricing
- Planning your budget for that specific configuration

---

## How to Use the Calculator

### Step 1: Select Your Fuel Type
```
Dropdown: Select Fuel Type
├── 🔥 Petrol    (Most common, standard pricing)
├── ⛽ Diesel    (Better mileage, higher price)
├── 💨 CNG       (Economical, lower running cost)
├── 🔋 Hybrid    (Balanced efficiency)
└── ⚡ EV        (Zero emissions, premium pricing)
```

### Step 2: The Calculator Shows You:
```
On-Road Price Breakdown
├─ Ex-Showroom Price: ₹80,00,000 (base car price)
├─ RTO (Registration): ₹6,00,000 (varies by fuel & state)
├─ Insurance (Comprehensive): ₹44,800 (varies by fuel)
├─ GST (5%): ₹4,00,000 (fixed 5%)
├─ TCS (1%): ₹80,000 (fixed 1% tax)
├─ FASTag: ₹2,500 (fixed national charge)
└─ On-Road Price: ₹91,27,300 (total you'll pay)
```

### Step 3: Change Your City (Right Sidebar)
- Use the **"Select City"** dropdown in the right sidebar
- The calculator automatically recalculates for that state
- Different states have different RTO and tax rates

---

## What Each Component Means

### Ex-Showroom Price
- The base price of the car at the manufacturer's facility
- Does NOT include any taxes or additional charges
- This is the starting point for on-road calculation

### RTO (Registration Tax)
- Government tax for registering the vehicle
- **Varies by State:** Delhi 5%, Maharashtra 10%, etc.
- **Varies by Fuel Type:** EV can be 0-3%, Diesel 9-15%
- **Calculated as:** Percentage of ex-showroom price

### Insurance (Comprehensive)
- Third-party + own damage coverage
- Mandatory comprehensive insurance
- **Varies by State:** Different base rates per state
- **Varies by Fuel Type:** EV typically cheaper, Diesel more expensive
- **Calculated as:** Percentage of ex-showroom price

### GST (Goods & Services Tax)
- Fixed at **5%** on the ex-showroom price
- Applies to all vehicles
- Uniform across India

### TCS (Tax Collection at Source)
- Fixed at **1%** for most vehicles
- Government anti-tax evasion measure
- Applied on the transaction value

### FASTag Charges
- Electronic toll collection system charge
- Fixed at **₹2,500** nationally
- Mandatory for all new vehicles
- Can be refunded/reused for toll payments

### On-Road Price
- **Total cost to bring the car home**
- Sum of all components above
- This is what you'll actually pay + any dealer charges

---

## Example Calculations

### Example 1: Maruti Swift in Delhi
```
Fuel Type: Petrol
City: Delhi, NCR
Ex-Showroom Price: ₹5,50,000

Breakdown:
├─ Ex-Showroom: ₹5,50,000
├─ RTO (5% of ex-showroom): ₹27,500
├─ Insurance (Petrol, Delhi): ₹30,800
├─ GST (5%): ₹27,500
├─ TCS (1%): ₹5,500
└─ FASTag: ₹2,500
────────────────────────
On-Road Price: ₹6,43,800
```

### Example 2: Same car, Different Fuel Type
```
Fuel Type: CNG (Same Swift)
City: Delhi, NCR
Ex-Showroom Price: ₹5,50,000

Breakdown:
├─ Ex-Showroom: ₹5,50,000
├─ RTO (4.5% of ex-showroom): ₹24,750    ← Lower for CNG
├─ Insurance (CNG, Delhi): ₹28,600        ← Lower for CNG
├─ GST (5%): ₹27,500
├─ TCS (1%): ₹5,500
└─ FASTag: ₹2,500
────────────────────────
On-Road Price: ₹6,38,850                   ← ~₹5,000 cheaper
```

### Example 3: Same car, Different City
```
Fuel Type: Petrol
City: Mumbai, Maharashtra
Ex-Showroom Price: ₹5,50,000

Breakdown:
├─ Ex-Showroom: ₹5,50,000
├─ RTO (8.5% of ex-showroom): ₹46,750    ← Higher in Maharashtra
├─ Insurance (Petrol, Mumbai): ₹31,200    ← Slightly different rate
├─ GST (5%): ₹27,500
├─ TCS (1%): ₹5,500
└─ FASTag: ₹2,500
────────────────────────
On-Road Price: ₹6,63,450                   ← ~₹20,000 more expensive
```

---

## Pro Tips

### 💡 Tip 1: Compare Fuel Types
- Select the same car with different fuel types
- Notice the price difference in RTO & Insurance
- Consider fuel prices in your area for total cost

### 💡 Tip 2: Check Different Cities
- Test prices in different cities/states you might move to
- Some states have significantly higher RTO rates
- Plan accordingly if relocating

### 💡 Tip 3: Budget Planning
- Use the **on-road price** for budget planning, not ex-showroom
- Add 2-3% for dealer charges and accessories
- Add 5% for unexpected costs

### 💡 Tip 4: Tax Implications
- EV vehicles often have lower/zero RTO in some states
- Check your state's electric vehicle incentive scheme
- May qualify for GST exemption on EVs

### 💡 Tip 5: Future Plans
- If planning to relocate, compare prices in destination cities
- Tax rates change yearly, check updates regularly
- Consider on-road price trends in your decision

---

## Common Questions

### Q: Why is the on-road price different for the same city?
**A:** Different fuel types have different RTO and insurance percentages. EV might be ₹2,00,000 cheaper than Petrol due to government incentives.

### Q: Can I get a lower price if I bargain with the dealer?
**A:** The on-road price shown is the government-mandated tax portion. You might negotiate the ex-showroom price, but not GST, RTO, or insurance.

### Q: What if I buy from a different city?
**A:** Use the calculator with your registration city, not purchase city. RTO is based on where you register the vehicle.

### Q: Is the insurance premium final?
**A:** No, insurance premiums can vary by insurer. The shown value is an estimate. Get quotes from insurance companies for exact pricing.

### Q: What about accessories and extended warranty?
**A:** These are additional costs not included in the on-road price calculation. Add separately to your total budget.

### Q: Can I update the price if I know the exact insurance quote?
**A:** Not in this calculator, but you can manually add the difference to the shown price for your personal budgeting.

---

## Information You'll Need

### To Use the Calculator Effectively:

✅ **Required:**
- Car model and variant name
- Your city or preferred registration state
- Preferred fuel type

✅ **Nice to Have:**
- Current fuel prices in your area
- Insurance company quotes
- Dealer's final ex-showroom quote

---

## Additional Resources

### Understanding RTO
- **What is RTO?** Government tax for vehicle registration
- **When to pay?** Before first registration of the vehicle
- **Can it be negotiated?** No, it's fixed by state government
- **Refund possible?** Only if vehicle is scrapped or re-exported

### Understanding Insurance
- **Types:** Third-Party (mandatory) + Own-Damage (optional)
- **Cost varies by:** State, fuel type, vehicle age, claims history
- **Renewal:** Required annually, gets more expensive with age
- **Claim process:** Contact insurer with documentation

### Government Incentives
- **EV Incentives:** Check with your state for FAME-II subsidies
- **GST Exemption:** Some states offer GST waiver on EVs
- **Road Tax:** Some states waive road tax for EVs
- **Registration Fee:** Reduced in some states for EVs

---

## Feedback & Support

Have questions about the calculator?
- Check the calculator UI for helpful tooltips
- Review your state government's transport website for official rates
- Contact our support team for calculation discrepancies

**Last Updated:** [Current Date]
**Calculator Version:** 1.0
**Supported Vehicles:** All models in the database
**Coverage:** All 37 Indian states and union territories

