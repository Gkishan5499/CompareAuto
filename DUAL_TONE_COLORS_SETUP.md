# Dual Tone Colors Implementation Guide

This document explains how to add and use dual-tone colors in the CompareAuto application. Dual-tone colors are two-color combinations commonly seen in car exteriors, like "Citrine Yellow with Stealth Black".

## Overview

The application now supports three color types:
1. **Monotone Colors** - Single color (e.g., "White", "Black")
2. **Dual Tone Colors** - Two-color combination (e.g., "Citrine Yellow with Stealth Black")
3. **Both** - Models can have both monotone and dual tone options

## Backend Data Structure

### Adding Dual Tone Colors to CarSpecs

Add a `dual_tone_colors` or `dualToneColors` field to your specs in the following format:

```json
{
  "exterior": {
    "monotone_color_names": ["White", "Black", "Silver"],
    "dual_tone_colors": [
      {
        "name": "Citrine Yellow with Stealth Black",
        "primary": "Citrine Yellow",
        "secondary": "Stealth Black"
      },
      {
        "name": "Deep Forest with Everest White",
        "primary": "Deep Forest",
        "secondary": "Everest White"
      },
      {
        "name": "Tango Red with Stealth Black",
        "primary": "Tango Red",
        "secondary": "Stealth Black"
      }
    ]
  }
}
```

### Alternative Field Names

The backend checks these locations (in order) for dual tone colors:
- `specs.exterior.dual_tone_colors`
- `specs.exterior.dualToneColors`
- `specs.dual_tone_colors`
- `specs.dualToneColors`
- `specs.extras.dual_tone_colors`
- `specs.extras.dualToneColors`

Choose whichever naming convention matches your database schema.

## API Response Example

```json
{
  "success": true,
  "data": {
    "variantId": "mahindra-xuv3xo-eq5-mt",
    "overview": { "price": "7.49 Lakh" },
    "exterior": {
      "monotone_color_names": [
        "Everest White",
        "Stealth Black",
        "Galaxy Grey",
        "Nebula Blue"
      ],
      "dual_tone_colors": [
        {
          "name": "Citrine Yellow with Stealth Black",
          "primary": "Citrine Yellow",
          "secondary": "Stealth Black"
        },
        {
          "name": "Dune Beige with Stealth Black",
          "primary": "Dune Beige",
          "secondary": "Stealth Black"
        }
      ]
    }
  }
}
```

## Image Naming Convention

### Monotone Color Images

Existing naming convention remains the same:
```
mahindra_xuv3xo_eq5_white.jpg
mahindra_xuv3xo_eq5_black.jpg
mahindra_xuv3xo_eq5_everest_white_front.jpg
```

### Dual Tone Color Images

Dual tone color images should follow this naming pattern:
```
{brand}_{model}_{variant}_{primary_color}_{secondary_color}.jpg
```

**Examples:**
```
mahindra_xuv3xo_eq5_citrine_yellow_stealth_black.jpg
mahindra_xuv3xo_eq5_citrine_yellow_stealth_black_front.jpg
mahindra_xuv3xo_eq5_citrine_yellow_stealth_black_side.jpg
mahindra_xuv3xo_eq5_citrine_yellow_stealth_black_rear.jpg

mahindra_xuv3xo_eq5_dune_beige_stealth_black.jpg
mahindra_xuv3xo_eq5_tango_red_stealth_black.jpg
```

### Shorter Alternative

You can also use the shorter naming pattern (without variant):
```
mahindra_xuv3xo_citrine_yellow_stealth_black.jpg
```

The system automatically matches both patterns.

### Image Upload Process

1. Go to the Admin Dashboard
2. Navigate to the specific model/variant
3. Upload images with the correct naming convention
4. The frontend automatically matches images to colors based on filenames
5. Images appear in the color gallery once matched

## Frontend Components

### ColorSwatches Component

Displays available colors with visual swatches.

**Monotone Only:**
```tsx
<ColorSwatches 
  colors={["White", "Black", "Silver"]} 
  onColorChange={(color) => console.log(color)}
/>
```

**With Dual Tone:**
```tsx
<ColorSwatches 
  colors={["White", "Black"]}
  dualToneColors={[
    { name: "Citrine Yellow with Stealth Black", primary: "Citrine Yellow", secondary: "Stealth Black" }
  ]}
  onColorChange={(color) => console.log(color)}
/>
```

**Features:**
- Scrollable color selection
- Visual dual tone swatch with split colors
- Tab to switch between single and dual tone
- Color name display
- Arrow navigation for scrolling

### ColorImageGallery Component

Displays car images for selected color.

**Props:**
```tsx
interface ColorImageGalleryProps {
  colors?: string[];                              // Monotone color names
  dualToneColors?: DualToneColor[];              // Dual tone colors
  colorImages?: Record<string, string[]>;         // Monotone image map
  dualToneColorImages?: Record<string, string[]>; // Dual tone image map
  modelName: string;
  brandName?: string;
  onColorChange?: (color: string | DualToneColor) => void;
}
```

**Usage:**
```tsx
<ColorImageGallery
  colors={monotoneColors}
  dualToneColors={dualToneColors}
  colorImages={colorImageMap}
  dualToneColorImages={dualToneImageMap}
  modelName={modelName}
  brandName={brandName}
  onColorChange={handleColorChange}
/>
```

**Features:**
- Displays images for selected color
- Single/Dual tone tabs for switching
- Color selection buttons with photo count
- Responsive layout

## Color Mapping

The `colorMap` object in both components defines the visual appearance of each color:

```typescript
const colorMap: Record<string, string> = {
  "Citrine Yellow": "bg-yellow-400",
  "Deep Forest": "bg-green-900",
  "Dune Beige": "bg-amber-600",
  "Everest White": "bg-white border-2 border-gray-300",
  "Galaxy Grey": "bg-gray-600",
  "Nebula Blue": "bg-blue-800",
  "Stealth Black": "bg-black",
  "Tango Red": "bg-red-600",
  // ... more colors
};
```

**To add a new color:**
1. Add entry to `colorMap` in both `ColorSwatches.tsx` and `ColorImageGallery.tsx`
2. Use Tailwind CSS class names
3. Ensure the key matches exactly with the color name in the backend data

## Image Gallery Matching Algorithm

### How Images are Matched to Colors

1. **Gallery URLs Provided:** System extracts color from uploaded image URLs
2. **Pattern Matching:** Searches for patterns in filenames:
   - Pattern 1: `{brand}_{model}_{variant}_{color1}_{color2}`
   - Pattern 2: `{brand}_{model}_{color1}_{color2}`

3. **Color Normalization:**
   - "Citrine Yellow" → "citrine_yellow"
   - "Stealth Black" → "stealth_black"
   - Spaces converted to underscores
   - Hyphens converted to underscores

### Example Matching

**Color Name:** "Citrine Yellow with Stealth Black"
**Primary:** "Citrine Yellow" → "citrine_yellow"
**Secondary:** "Stealth Black" → "stealth_black"

**Pattern 1 Match:** `mahindra_xuv3xo_eq5_citrine_yellow_stealth_black`
**Pattern 2 Match:** `mahindra_xuv3xo_citrine_yellow_stealth_black`

Both filenames below would match:
- `mahindra_xuv3xo_eq5_citrine_yellow_stealth_black.jpg` ✅
- `mahindra_xuv3xo_eq5_citrine_yellow_stealth_black_front.jpg` ✅
- `mahindra_xuv3xo_citrine_yellow_stealth_black_side.jpg` ✅

## Display Example (from UI)

In the Colors Tab, dual tone colors appear as:

```
Colors Gallery
├─ Monotone Colors (swatches shown)
│  ├─ White
│  ├─ Black
│  └─ Silver
├─ Tab: Single Tone | Dual Tone ← User can toggle
└─ Dual Tone Colors (split swatches shown)
   ├─ Citrine Yellow | Stealth Black (6 photos)
   ├─ Dune Beige | Stealth Black (4 photos)
   └─ Tango Red | Stealth Black (5 photos)
```

## Available Color List

### Primary Colors
- Citrine Yellow
- Deep Forest
- Dune Beige
- Everest White
- Galaxy Grey
- Nebula Blue
- Stealth Black
- Tango Red
- White
- Black
- Silver
- Gray
- Red
- Blue
- Green
- Orange
- Brown
- Beige
- Pearl
- Metallic

### Adding New Colors

1. **Backend:** Add color to your specs
2. **Frontend:** Add mapping in `colorMap`:
   ```typescript
   "Your Color Name": "bg-tailwind-class"
   ```
3. **Upload Images:** With proper naming convention
4. **Test:** Check Colors tab to verify display

## Console Debugging

Enable browser console (F12) to see helpful debug logs:

```javascript
// Color extraction debug
"🎨 Dual Tone Colors Debug:", {
  foundDualToneColors: [...],
  dualToneCount: 2,
  galleryImagesCount: 15
}

// Image matching debug
"🔍 [DUAL TONE: Citrine Yellow with Stealth Black]"
"  📄 Filename: mahindra_xuv3xo_eq5_citrine_yellow_stealth_black.jpg"
"  ✅ MATCHED: Found 6 image(s)"
```

## Troubleshooting

### Dual Tone Colors Not Showing

1. **Check backend response:**
   - Verify `specs.exterior.dual_tone_colors` exists in API response
   - Verify array format with `name`, `primary`, `secondary` fields

2. **Check console logs:**
   - Open browser DevTools (F12)
   - Look for 🎨 debug messages
   - Verify "dualToneCount" > 0

### Images Not Displaying

1. **Check image naming:**
   - Ensure files follow `{brand}_{model}_{variant}_{primary}_{secondary}.jpg`
   - Color names must have underscores (not spaces)
   - Upload to correct location via admin panel

2. **Check file matching:**
   - Look for "NO MATCH" in console
   - Verify filename contains exact color pattern

3. **File path validation:**
   - Images should be in `/public/cars/` or CDN
   - Verify via `getImageUrl()` in console

### Color Swatch Not Displaying Correctly

1. **Verify color in colorMap:**
   - Check `ColorSwatches.tsx` and `ColorImageGallery.tsx`
   - Add Tailwind CSS class if missing

2. **Example entry:**
   ```typescript
   "Citrine Yellow": "bg-yellow-400",
   "Stealth Black": "bg-black",
   ```

## Performance Tips

1. **Image Optimization:**
   - Use WebP format where possible
   - Compress images to <500KB
   - Use CDN for faster delivery

2. **Gallery URLs:**
   - Batch load images for selected color only
   - Lazy load additional angles
   - Preload hero images

3. **Component Rendering:**
   - ColorSwatches only rerenders on color change
   - ColorImageGallery memoizes image arrays
   - Tab switching is performant

## API Integration Example

```typescript
// Backend endpoint response
GET /api/specs/{variantId}

{
  "success": true,
  "data": {
    "exterior": {
      "monotone_color_names": ["White", "Black"],
      "dual_tone_colors": [
        {
          "name": "Yellow with Black",
          "primary": "Citrine Yellow",
          "secondary": "Stealth Black"
        }
      ]
    }
  }
}

// Frontend automatically:
// 1. Extracts dual tone colors
// 2. Matches images by filename
// 3. Displays tabs to switch between color types
// 4. Shows swatches with split colors for dual tone
```

## Testing Your Implementation

1. **Before Upload:**
   - Prepare images with correct naming
   - Verify dual tone data in backend API response

2. **After Upload:**
   - Navigate to Colors tab
   - Check if dual tone colors appear as tabs
   - Verify color swatches display correctly
   - Click each color and verify images load

3. **Console Check:**
   - Images matching should show ✅ MATCHED logs
   - Count should match number of uploaded files

## Next Steps

- [ ] Add dual tone colors to your car specs in backend
- [ ] Upload images with correct naming convention
- [ ] Add color names to `colorMap` in both components
- [ ] Test in development environment
- [ ] Deploy and verify on production

---

**Questions or Issues?** Check the console logs (F12) for detailed debugging information and error messages.
