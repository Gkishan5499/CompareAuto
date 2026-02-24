# Color-Based Car Images Implementation Guide

## Overview
The system now supports displaying different car images for each color variant. When users click on a color button, they see images of the car in that specific color.

## How It Works

### 1. Backend (CarSpecs Model)
The car specs now include an `exterior.monotone_color_names` field that stores available exterior colors:

```typescript
exterior?: {
  monotone_color_names?: string[];  // e.g., ["Pearl White", "Deep Black", "Red Metallic"]
  colors?: string[];                // Alias for colors
}
```

### 2. Frontend Components
- **ColorImageGallery**: New component that displays color buttons and switches images based on selected color
- **Images.ts Helper**: `getColorImageGallery()` function generates URLs for color-specific images

### 3. Image URL Structure
Images should follow this naming convention:

```
/cars/{brand}/{model}/{variant}/{brand}_{model}_{variant}_{color}_{angle}.png
```

**Example:**
```
/cars/maruti-suzuki/swift/zxi/maruti_suzuki_swift_zxi_pearl_white_front.png
/cars/maruti-suzuki/swift/zxi/maruti_suzuki_swift_zxi_pearl_white_side.png
/cars/maruti-suzuki/swift/zxi/maruti_suzuki_swift_zxi_deep_black_front.png
/cars/maruti-suzuki/swift/zxi/maruti_suzuki_swift_zxi_deep_black_side.png
```

### 4. Required Image Angles
For each color, upload images from these angles:
- `front` - Front 3/4 view (required)
- `side` - Side profile view
- `rear` - Rear 3/4 view
- `interior` - Interior/cabin view

At minimum, upload the `front` angle for each color.

## Setup Steps

### Step 1: Upload Images to Cloudinary
1. Go to Cloudinary dashboard
2. Navigate to the `/cars/{brand}/{model}/{variant}/` folder
3. Upload images with the naming convention:
   - `maruti_suzuki_swift_zxi_pearl_white_front.png`
   - `maruti_suzuki_swift_zxi_pearl_white_side.png`
   - `maruti_suzuki_swift_zxi_deep_black_front.png`
   - etc.

### Step 2: Add Colors to Specs CSV
When importing specs via the admin CSV import tool, include a column for colors:

```csv
brand,model,variant_id,exterior_monotone_color_names,hero,gallery
Maruti Suzuki,Swift,V001,"Pearl White, Deep Black, Red Metallic",/cars/maruti-suzuki/swift/zxi/hero.png,/cars/maruti-suzuki/swift/zxi/1.png|/cars/maruti-suzuki/swift/zxi/2.png
```

### Step 3: Verify in Frontend
1. Navigate to any variant detail page
2. Click the "Colors" tab
3. You should see:
   - Color buttons with swatches
   - Photo count for each color
   - Image gallery that updates when clicking colors

## CSV Import Mapping

When using the Specs CSV Import tool, map your color column to:
```
exterior_monotone_color_names → exterior.monotone_color_names
```

Or if you're using a different column name, map it in the custom paths field.

## Fallback Behavior

If color-based images are not available:
- The system falls back to the `ColorSwatches` component (simple color circles)
- Users can see colors but won't see color-specific images
- This ensures the feature degrades gracefully

## File Organization Example

```
public/
└── cars/
    └── maruti-suzuki/
        └── swift/
            └── zxi/
                ├── maruti_suzuki_swift_zxi_pearl_white_front.png
                ├── maruti_suzuki_swift_zxi_pearl_white_side.png
                ├── maruti_suzuki_swift_zxi_pearl_white_rear.png
                ├── maruti_suzuki_swift_zxi_pearl_white_interior.png
                ├── maruti_suzuki_swift_zxi_deep_black_front.png
                ├── maruti_suzuki_swift_zxi_deep_black_side.png
                ├── maruti_suzuki_swift_zxi_deep_black_rear.png
                ├── maruti_suzuki_swift_zxi_deep_black_interior.png
                ├── maruti_suzuki_swift_zxi_red_metallic_front.png
                ├── maruti_suzuki_swift_zxi_red_metallic_side.png
                └── ... more colors and angles
```

## Important Notes

1. **Color Names Match**: The color names in the CSV must match the uploaded image filenames exactly (after slug conversion)
   - "Pearl White" → `pearl_white`
   - "Deep Black" → `deep_black`
   - "Red Metallic" → `red_metallic`

2. **Performance**: Images are preloaded automatically for the currently selected color

3. **Image Quality**: Use consistent backgrounds and lighting across all color variants to maintain professional appearance

4. **File Naming**: Always use lowercase with underscores in filenames

## Testing

### To test locally:
1. Add some test images to `/public/cars/` folder with proper naming
2. Add the corresponding color names to the test specs
3. Visit a variant detail page and click "Colors" tab
4. You should see color buttons and switching images

### Console Debugging:
Open browser DevTools and check:
- Network tab: verify image URLs are being requested
- Console: check for any 404 errors on images
- Check if `getColorImageGallery()` is building correct URLs
