# Color-Based Images UI Example

## What Users Will See

### Before: Simple Color Swatches Only
```
┌─────────────────────────────────────────┐
│           Available Colors              │
├─────────────────────────────────────────┤
│                                         │
│  ⚪  ⚫  🔴  🟡  🟢    (just circles)   │
│                                         │
│  White Black Red Yellow Green            │
│                                         │
└─────────────────────────────────────────┘
```

### After: Interactive Color Gallery
```
┌──────────────────────────────────────────────────┐
│        Available Colors with Images              │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────────────────────────────┐   │
│  │                                         │   │
│  │     [Car Image - Pearl White]           │   │ ← Updates when
│  │     (Shows multiple angles)             │   │   color clicked
│  │                                         │   │
│  │     Front  │ Side  │ Rear  │ Interior  │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                  │
│  Color Selection:                               │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐       │
│  │  ⭕  │  │  ⚫  │  │  🔴  │  │  🟡  │       │
│  │ (2)  │  │ (2)  │  │ (1)  │  │ (0)  │       │
│  └──────┘  └──────┘  └──────┘  └──────┘       │
│   Pearl    Deep      Red      Yellow           │
│   White    Black   Metallic   (no images)      │
│   ✓                                             │
│  (selected)                                     │
│                                                  │
└──────────────────────────────────────────────────┘
```

## Component Hierarchy

```
VariantDetail Page
├── Hero Card
│   └── PhotoGallery (general images)
├── Tabs
│   └── "Colors" Tab (Colors Tab Content)
│       └── ColorImageGallery (NEW)
│           ├── PhotoGallery (color-specific)
│           │   ├── Main Image Display
│           │   ├── Thumbnail Thumbnails
│           │   └── Navigation Arrows
│           └── Color Swatches
│               ├── Pearl White (with ring)
│               ├── Deep Black
│               ├── Red Metallic
│               └── ... more colors
```

## Interaction Flow

```
User Views Variant Detail Page
            ↓
User Clicks "Colors" Tab
            ↓
ColorImageGallery Renders
├─ Loads colors from specs.exterior.monotone_color_names
├─ Generates image URLs using getColorImageGallery()
├─ Shows PhotoGallery with first color images
└─ Shows color swatches below
            ↓
User Clicks Pearl White Button
├─ Updates selectedColor state to "Pearl White"
├─ Filters colorImages["Pearl White"] array
└─ PhotoGallery updates with those images
            ↓
User Clicks Deep Black Button
├─ Updates selectedColor state to "Deep Black"
├─ Filters colorImages["Deep Black"] array
└─ PhotoGallery updates smoothly with animation
            ↓
User Clicks Right Arrow in PhotoGallery
├─ Shows next image for Deep Black (side view)
└─ Navigation works smoothly
```

## Color Swatch Styling

```
Unselected Color:
┌─────────┐
│         │  Color name
│    ⚪    │  (e.g., Pearl White)
│         │
└─────────┘  2 photos (image count)
hover: scale 105%

Selected Color (With Ring):
┌───────────────────┐
│  ┌─────────────┐  │  Ring around button
│  │ ⭕          │  │  (4px ring with primary color)
│  │  (glow)     │  │
│  └─────────────┘  │  Scale 110%
│  Pearl White      │
│  2 photos         │
└───────────────────┘

No Images Available:
┌─────────┐
│         │
│    🟡    │  Faded
│         │
└─────────┘
Yellow
0 photos  ← Shows zero count
```

## Image Display Modes

### Gallery Mode (Multiple Images)
```
┌──────────────────────────────────┐
│  ◀  [Car in Pearl White]  ▶      │
│  Front view                  1/4  │
├──────────────────────────────────┤
│  [ 📷 ][ 📷 ][ 📷✓ ][ 📷 ]      │
│  Front  Side   Rear  Interior    │
│        (thumbnails below)         │
└──────────────────────────────────┘
```

### Single Image Mode (One Image)
```
┌──────────────────────────────────┐
│                                  │
│  [Car in Red Metallic - Front]   │
│                                  │
│  No gallery - only this angle    │
│                                  │
└──────────────────────────────────┘
```

### No Images Mode (Fallback)
```
┌──────────────────────────────────┐
│      ⚠️                          │
│  No images available for         │
│  This Color                      │
│      (dashed border)             │
└──────────────────────────────────┘
```

## Mobile View

```
Smartphone (375px):

┌─────────────────┐
│   Colors Tab    │
├─────────────────┤
│                 │
│  ┌───────────┐  │
│  │           │  │
│  │  [Image]  │  │
│  │           │  │
│  └───────────┘  │
│                 │
│  Colors:        │
│  ⭕ ⚫ 🔴 🟡   │
│  (stacked or   │
│  wrapped grid) │
│                 │
└─────────────────┘
```

## Real-World Example: Maruti Swift ZXi

```
Variant: Maruti Swift ZXi

Available Colors:
├─ Pearl White (4/4 images)      ← Full gallery
├─ Deep Black (4/4 images)       ← Full gallery  
├─ Red Metallic (2/4 images)     ← Partial gallery
├─ Silver (0/4 images)           ← No images
└─ Blue (1/4 images)             ← Only front

When User Selects Pearl White:
✓ Shows: Front, Side, Rear, Interior views
  All 4 angles available
  Click thumbnails to jump between views

When User Selects Silver:
✗ Shows: "No images available for Silver"
  Falls back to model's hero image
  Color button still shows for reference
```

## Accessibility Features

```
Color Button (HTML):
<button
  onClick={handleClick}
  aria-label="Select Pearl White (2 photos)"
  accessibility-view: ✓
>
  <div class="color-swatch" />
  <span class="color-label">Pearl White</span>
  <span class="photo-count">2 photos</span>
</button>

Keyboard Navigation:
Tab → Focus to color buttons
Enter/Space → Select color
Arrow Keys → Navigate between colors (if added)

Screen Reader:
"Pearl White button, 2 photos available, selected"
```

## Responsive Breakpoints

```
Desktop (1024px+):
- 5-6 color buttons per row
- Large preview image
- Full PhotoGallery features

Tablet (768px):
- 3-4 color buttons per row
- Medium preview image
- Optimized spacing

Mobile (375-400px):
- 2-3 color buttons per row
- Reduced spacing
- Touch-optimized buttons
- Stack layout for color info
```

## Performance Metrics

```
When color images are loaded:
┌─────────────────────────────────┐
│ Color: Pearl White              │
│ Images: 4 files                 │
│ Total Size: ~800KB              │
│ Load Time: ~2-3 seconds         │
│ Preload: Yes (automatic)        │
│ Cache: Browser cache enabled    │
└─────────────────────────────────┘

Smooth transitions:
- CSS animations for ring effect
- Rapid image switching (preloaded)
- No blocking operations
- GPU-accelerated transforms
```
