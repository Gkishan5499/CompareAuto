# On-Road Price Calculator - UI Placement Guide

## Model Overview Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Breadcrumbs & Navigation                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  TABS: Overview | Variants | Specs | Colors | Photos | FAQ          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┬──────────────────────────┐
│                                          │                          │
│  LEFT COLUMN (8/12 width)               │ RIGHT SIDEBAR (4/12)     │
│                                          │                          │
│  ┌────────────────────────────────────┐ │ ┌──────────────────────┐ │
│  │ HERO CARD (Hero Image)             │ │ │ MODEL INFO CARD      │ │
│  │                                    │ │ │ (Sticky Top)         │ │
│  │ [Large Car Image]                  │ │ │ ┌──────────────────┐ │ │
│  │                                    │ │ │ │ Brand Logo       │ │ │
│  └────────────────────────────────────┘ │ │ │ Model Name       │ │ │
│                                          │ │ │ Body Type        │ │ │
│  ┌────────────────────────────────────┐ │ │ │                  │ │ │
│  │ QUICK SPECS STRIP                  │ │ │ │ [SELECT CITY]    │ │ │
│  │ 🔥 Fuel │ ⚙️  Trans │ 🛣️  Mileage │ │ │ │ Dropdown         │ │ │
│  └────────────────────────────────────┘ │ │ │                  │ │ │
│                                          │ │ │ EX-SHOWROOM      │ │ │
│  ┌────────────────────────────────────┐ │ │ │ PRICE DISPLAY    │ │ │
│  │ OVERVIEW TAB (ACTIVE)              │ │ │ │                  │ │ │
│  │                                    │ │ │ │ ON-ROAD PRICE    │ │ │
│  │ ✅ Pros & Cons                    │ │ │ │ (City-wise)      │ │ │
│  │ 📝 Verdict                        │ │ │ │                  │ │ │
│  │ ⭐ Key Features                   │ │ │ │ CHECK PRICE BTN  │ │ │
│  │                                    │ │ │ └──────────────────┘ │ │
│  │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ │                          │
│  │ ┃ 💵 ON-ROAD PRICE CALCULATOR   ┃ │ │ ┌──────────────────────┐ │
│  │ ┃ [SELECT FUEL TYPE]            ┃ │ │ │ VARIANT PRICING      │ │
│  │ ┃ 🔥 Petrol / ⛽ Diesel        ┃ │ │ │ (Scrollable List)    │ │
│  │ ┃ 💨 CNG / 🔋 Hybrid / ⚡ EV   ┃ │ │ │ [Variant 1: ₹5.5L]   │ │
│  │ ┃                               ┃ │ │ │ [Variant 2: ₹6.2L]   │ │
│  │ ┃ Ex-Showroom: ₹5,50,000       ┃ │ │ │ [Variant 3: ₹7.1L]   │ │
│  │ ┃ RTO: ₹26,000 (Fuel+State)    ┃ │ │ │                      │ │
│  │ ┃ Insurance: ₹30,800 (Fuel)    ┃ │ │ │ [More...]            │ │
│  │ ┃ GST: ₹27,500                 ┃ │ │ └──────────────────────┘ │
│  │ ┃ TCS: ₹5,500                  ┃ │ │                          │
│  │ ┃ FASTag: ₹2,500               ┃ │ │ ┌──────────────────────┐ │
│  │ ┃                               ┃ │ │ │ [COMPARE BUTTON]     │ │
│  │ ┃ ON-ROAD PRICE: ₹6,42,300     ┃ │ │ │ [GET OFFERS BUTTON]  │ │
│  │ ┃ (Delhi, Petrol)              ┃ │ │ └──────────────────────┘ │
│  │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │ │                          │
│  │                                    │ │                          │
│  └────────────────────────────────────┘ │                          │
│                                          │                          │
└──────────────────────────────────────────┴──────────────────────────┘
```

---

## Variant Detail Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: Breadcrumbs & Navigation                                   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  TABS: Overview | Details | Colors | Price & EMI | Media            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┬──────────────────────────┐
│                                          │                          │
│  LEFT COLUMN (8/12 width)               │ RIGHT SIDEBAR (4/12)     │
│                                          │                          │
│  ┌────────────────────────────────────┐ │ ┌──────────────────────┐ │
│  │ VARIANT HERO IMAGE                 │ │ │ VARIANT INFO CARD    │ │
│  │ [Large Car Image]                  │ │ │ (Sticky Top)         │ │
│  │                                    │ │ │ ┌──────────────────┐ │ │
│  └────────────────────────────────────┘ │ │ │ Brand Logo       │ │ │
│                                          │ │ │ Variant Name     │ │ │
│  ┌────────────────────────────────────┐ │ │ │ Trim Name        │ │ │
│  │ PRICE & EMI TAB (WHEN OPENED)      │ │ │ │                  │ │ │
│  │                                    │ │ │ │ [SELECT CITY]    │ │ │
│  │ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ │ │ Dropdown         │ │ │
│  │ ┃ 🔥 VARIANT PRICE CALCULATOR   ┃ │ │ │                  │ │ │
│  │ ┃ [SELECT FUEL TYPE]            ┃ │ │ │ PRICING INFO     │ │ │
│  │ ┃ 🔥 Petrol / ⛽ Diesel        ┃ │ │ │ Ex-Showroom      │ │ │
│  │ ┃ 💨 CNG / 🔋 Hybrid / ⚡ EV   ┃ │ │ │ On-Road Price    │ │ │
│  │ ┃                               ┃ │ │ │                  │ │ │
│  │ ┃ Ex-Showroom: ₹6,50,000       ┃ │ │ │ ACTION BUTTONS   │ │ │
│  │ ┃ RTO: ₹31,200                 ┃ │ │ │ Check Price      │ │ │
│  │ ┃ Insurance: ₹36,400           ┃ │ │ │ Download         │ │ │
│  │ ┃ GST: ₹32,500                 ┃ │ │ │ Compare          │ │ │
│  │ ┃ Other: ₹10,000               ┃ │ │ │                  │ │ │
│  │ ┃                               ┃ │ │ │ LEADS FORM       │ │ │
│  │ ┃ ON-ROAD: ₹7,60,100           ┃ │ │ │ Email & Phone    │ │ │
│  │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │ │ │ Get Offers       │ │ │
│  │                                    │ │ │ └──────────────────┘ │ │
│  │ ┌────────────────────────────────┐ │ │                          │
│  │ │ EMI CALCULATOR                │ │ │                          │
│  │ │ Loan Amount | Rate | Duration │ │ │                          │
│  │ │ [Calculate EMI]               │ │ │                          │
│  │ └────────────────────────────────┘ │ │                          │
│  │                                    │ │                          │
│  │ ┌────────────────────────────────┐ │ │                          │
│  │ │ FUEL PRICE WIDGET              │ │ │                          │
│  │ │ Current Fuel Prices            │ │ │                          │
│  │ └────────────────────────────────┘ │ │                          │
│  │                                    │ │                          │
│  └────────────────────────────────────┘ │                          │
│                                          │                          │
└──────────────────────────────────────────┴──────────────────────────┘
```

---

## On-Road Price Calculator Component (Close-up)

### Desktop View

```
┌──────────────────────────────────────────────────┐
│ 💵 On-Road Price Breakdown                        │
├──────────────────────────────────────────────────┤
│                                                   │
│ Select Fuel Type                                 │
│ ┌──────────────────────────────────────────────┐│
│ │ 🔥 Petrol                              ▼    ││
│ └──────────────────────────────────────────────┘│
│                                                   │
│ ────────────────────────────────────────────────  │
│ Ex-Showroom Price      ₹5,50,000                │
│ RTO Registration       ₹26,000                   │
│ Insurance (Comp)       ₹30,800                   │
│ GST (5%)              ₹27,500                    │
│ TCS (1%)              ₹5,500                     │
│ FASTag                ₹2,500                     │
│ ────────────────────────────────────────────────  │
│ ✨ On-Road Price       ₹6,42,300                │
│                                                   │
│ Calculated for Delhi                             │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Mobile View

```
┌─────────────────────────────┐
│ 💵 On-Road Price Breakdown   │
├─────────────────────────────┤
│ Select Fuel Type            │
│ ┌───────────────────────────┐│
│ │ 🔥 Petrol            ▼   ││
│ └───────────────────────────┘│
│ ─────────────────────────────│
│ Ex-Showroom ₹5,50,000       │
│ RTO         ₹26,000         │
│ Insurance   ₹30,800         │
│ GST         ₹27,500         │
│ Other       ₹8,000          │
│ ─────────────────────────────│
│ On-Road     ₹6,42,300       │
│ ─────────────────────────────│
│ Delhi, Petrol               │
└─────────────────────────────┘
```

---

## Color Scheme

| Component | Color | Usage |
|-----------|-------|-------|
| Header Background | Light Blue | On-Road Price Breakdown title |
| Fuel Selector | White/Slate | Dropdown with fuel options |
| RTO Value | Orange-600 | Highlighting variable cost |
| Insurance Value | Orange-600 | Highlighting variable cost |
| On-Road Total | Blue-600 | Main highlight (on blue bg) |
| Borders | Gray-200 | Subtle dividers |
| Text (Light) | Gray-600 | Muted labels |
| Text (Dark) | Black/Gray-900 | Values and headers |

---

## Responsive Behavior

### Desktop (1024px+)
- Calculator displays full width in tab
- Multi-line price breakdown
- Dropdown fuel selector
- Styled card with shadow

### Tablet (768px-1023px)
- Full width, slightly condensed
- Same component layout
- Touch-friendly dropdown

### Mobile (< 768px)
- Full screen width
- Compact spacing
- Touch-friendly buttons
- Scrollable if needed
- Single-column layout

---

## Interaction Flow

### User Flow 1: Select Fuel Type
```
1. User opens Model Overview page
2. User scrolls to Overview tab (or already there)
3. User sees "On-Road Price Breakdown" card
4. User clicks fuel type dropdown
5. Dropdown shows: Petrol, Diesel, CNG, Hybrid, EV
6. User selects "Diesel"
7. Calculator fetches new breakdown
8. New prices display (slightly different RTO & Insurance)
9. On-road total updates
```

### User Flow 2: Change City & Compare
```
1. User is on Model Overview
2. User selects "Mumbai" from City selector (right sidebar)
3. All price cards update (including calculator)
4. User notices on-road price increased (higher Mumbai RTO)
5. User selects "Petrol" fuel type in calculator
6. Calculator updates with Mumbai's Petrol rates
7. User compares prices: Delhi ₹6,42,300 vs Mumbai ₹6,63,450
8. User decides to negotiate in Delhi, lower prices there
```

### User Flow 3: Variant Comparison
```
1. User is on Variant Detail page
2. User clicks "Price & EMI" tab
3. "Variant Price Calculator" appears at top
4. User sees variant's fuel type pre-selected
5. User toggles to "Diesel" option
6. Variant calculator updates with Diesel pricing
7. User also sees EMI calculator below
8. User decides to compare with other variants
9. User navigates to different variant
10. Calculator updates with new variant data
```

---

## Tooltip Messages (Optional Enhancement)

```
On Hover / Focus:

RTO: "Government registration tax varies by state and fuel type"

Insurance: "Comprehensive insurance premium varies by fuel and state"

GST: "Goods and Services Tax - fixed at 5% nationally"

TCS: "Tax Collection at Source - 1% government anti-evasion tax"

FASTag: "Electronic toll collection system fee - ₹2,500 nationally"

On-Road Price: "Complete cost including all taxes and charges"
```

---

## States & Loading

### Loading State
```
┌──────────────────────────────┐
│ 💵 On-Road Price Breakdown   │
├──────────────────────────────┤
│                              │
│ Select Fuel Type             │
│ ┌────────────────────────────┐
│ │ 🔥 Petrol             ▼   │
│ └────────────────────────────┘
│                              │
│   ⏳ Calculating...          │
│                              │
└──────────────────────────────┘
```

### Error State
```
┌──────────────────────────────┐
│ 💵 On-Road Price Breakdown   │
├──────────────────────────────┤
│                              │
│ Select Fuel Type             │
│ ┌────────────────────────────┐
│ │ 🔥 Petrol             ▼   │
│ └────────────────────────────┘
│                              │
│ ⚠️ Failed to calculate        │
│    on-road price             │
│                              │
└──────────────────────────────┘
```

### Empty State
```
┌──────────────────────────────┐
│ 💵 On-Road Price Breakdown   │
├──────────────────────────────┤
│                              │
│ Select Fuel Type             │
│ ┌────────────────────────────┐
│ │ 🔥 Petrol             ▼   │
│ └────────────────────────────┘
│                              │
│ Price information            │
│ not available                │
│                              │
└──────────────────────────────┘
```

---

## Quick Reference

### Where to Find on Each Page

| Page | Location | Tab | Position |
|------|----------|-----|----------|
| Model Overview | Left column main area | Overview | After Key Features |
| Variant Detail | Left column main area | Price & EMI | At top of tab |

### What's Pre-populated

| Page | Fuel Type | City | Price |
|------|-----------|------|-------|
| Model Overview | User selects | Right sidebar | First/selected variant |
| Variant Detail | Variant's fuel | Right sidebar | Variant's ex-showroom |

### What Updates On Change

| Change | Effect |
|--------|--------|
| Fuel Type | RTO %, Insurance %, On-Road Price |
| City | All state-specific rates recalculate |
| Variant | Fuel type & base price update |

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Status:** ✅ Ready for Production

