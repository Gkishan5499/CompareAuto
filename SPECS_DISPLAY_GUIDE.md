# Specs Display Implementation Guide

## What's Fixed

### 1. **Specs API Response Handling** ✅
- File: `frontend/src/lib/api.ts` → `specsApi.getByVariant()`
- Fixed to handle both `{ data: {...} }` and direct `{...}` response formats
- Logs success/error to browser console for debugging

### 2. **Accordion Structure** ✅
- File: `frontend/src/pages/VariantDetail.tsx` → Specifications tab
- Removed nested Card-inside-Accordion bug (was breaking layout)
- Now uses clean, professional accordion structure
- Each category is a collapsible section with icon + label

### 3. **Professional Categorization** ✅
- Specs grouped into 11 categories (matching backend DEFAULT_MAPPING):
  - **Overview** 📋 (brand, model, body type, seating)
  - **Engine** ⚙️ (displacement, cylinders, turbo, emission)
  - **Performance** 🏁 (mileage, drivetrain, transmission)
  - **Dimensions & Weight** 📏 (length, width, height, wheelbase)
  - **Safety** 🛡️ (airbags, NCAP, ABS, ESP, hill controls)
  - **Comfort** 🛋️ (AC, cruise control, parking sensors)
  - **Lighting** 💡 (headlights, DRL, fog lights)
  - **Interior** 🎨 (upholstery, color theme, armrests)
  - **Infotainment & Tech** 📱 (screen, speakers, Android Auto, CarPlay)
  - **Warranty** ✅ (vehicle, battery warranties)
  - **Additional Info** 📋 (any extras)

### 4. **Friendly Key Labels** ✅
- Maps backend field names to human-readable labels
- Example: `engine_cc` → "Engine Displacement"
- Fallback to prettified camelCase if label not in map

### 5. **Default Collapsed Behavior** ✅
- Only 4 sections open by default: Overview, Engine, Performance, Dimensions
- All others collapsed for cleaner UI
- Users can click to expand any section

---

## How to Test

### Step 1: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Console tab
3. Navigate to variant page (e.g., `/maruti-suzuki/victoris/lxi-1-5-cng-mt`)
4. Look for:
   - ✅ `"✅ Specs fetched for variant..."` = specs loaded successfully
   - ❌ `"❌ Failed to fetch specs for variant..."` = specs API failed

### Step 2: Verify Data Structure
If specs are fetched, the console will log the full specs object. Check:
- Does it have `overview`, `engine`, `performance`, `dimensions`?
- Are fields named correctly (e.g., `engine_cc`, `length`, `airbags`)?

### Step 3: Check Visual Display
1. Scroll to "All Specifications" section in Specifications tab
2. Should see 4 open sections (Overview, Engine, Performance, Dimensions)
3. Click other categories to expand them
4. Each spec should display in a clean table format:
   - Left column: Friendly label
   - Right column: Value or N/A

---

## If Specs Don't Show

### Case A: No specs section appears at all
- **Cause**: `specs` is null or undefined
- **Fix**: Check browser console for fetch error
- **Debug**: Check if `/api/specs/{variantId}` endpoint returns data
  ```bash
  curl http://localhost:5000/api/specs/maruti-suzuki-victoris-lxi-1-5-cng-mt
  ```

### Case B: Specs section shows but is empty
- **Cause**: All category groups are empty (no specs in DB for this variant)
- **Fix**: Import specs via Admin CSV importer for this variant
- **Path**: Admin → Variants → Import CSV

### Case C: Specs show but layout is broken
- **Cause**: CSS class issues or Accordion component misconfiguration
- **Fix**: Check browser DevTools → Elements tab → inspect accordion
- **Debug**: Look for warning/error messages in Console

### Case D: Friendly labels not showing
- **Cause**: Key name not in `friendlyKeyMap`
- **Current**: Falls back to prettified camelCase (e.g., "Engine Cc" → "Engine Cc")
- **Fix**: Add the key to `friendlyKeyMap` in VariantDetail.tsx

---

## Database Sync Issues

If specs exist in DB but don't show on frontend:

1. **Variant ID Mismatch**
   - Spec record has `variantId: "..." ` but Variant has different `id`
   - Admin Variant list shows actual Variant IDs
   - Ensure specs CSV importer uses the same ID format

2. **Missing Specs Record**
   - If variant has no CarSpecs entry, "No specifications available" shows
   - Import specs via CSV or create manually via `/api/specs` POST

3. **Wrong Endpoint**
   - Frontend: `specsApi.getByVariant(variantData.id)` → `/api/specs/{variantId}`
   - Verify variantId format matches DB records

---

## Recent Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `frontend/src/pages/VariantDetail.tsx` | Refactored specs display into categorized accordions; added logging | Specs now render professionally and are debuggable |
| `frontend/src/lib/api.ts` | Fixed `specsApi.getByVariant()` response handling | Now handles both response formats correctly |
| Backend routes/controller | No changes (already working) | Continue to fetch specs by variantId |

---

## Next Steps (Optional)

- [ ] Add "Print Specs" button
- [ ] Add "Compare Specs" feature (cross-variant)
- [ ] Add spec search/filter within the page
- [ ] Add spec history/changelog if specs are updated
