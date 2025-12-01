# Asset Management Guide

## Overview
This document outlines the standard operating procedures for managing images and assets in the CompareAuto project.

---

## PNG Image Standards

### General Requirements
- **Format**: PNG with transparency support
- **Background**: Light grey (#F5F5F5) or transparent
- **Shadows**: Preserve natural shadows for depth
- **Margins**: 1-inch (96px) margins on all sides
- **Compression**: Optimize with tools like TinyPNG or ImageOptim
- **Color Space**: sRGB

### Resolution Guidelines
Different image types require different resolutions for optimal performance:

| Use Case | Max Width | Max Height | Recommended Size |
|----------|-----------|------------|------------------|
| Hero Images | 1600px | 900px | ~200-400KB |
| Gallery Images | 1200px | 675px | ~150-300KB |
| Card Thumbnails | 600px | 400px | ~50-100KB |
| Color Swatches | 80px | 80px | ~5-10KB |
| 360° Frames | 800px | 600px | ~100-150KB each |

---

## File Naming Convention

### New Cars
Follow this strict naming pattern:
```
{brand}_{model}_{variant}_{color}_{angle}.png
```

**Examples:**
```
maruti_swift_zxi_red_front.png
honda_city_vx_white_side.png
tata_nexon_xz_blue_interior.png
```

**Angle Options:**
- `front` - Front 3/4 view (primary)
- `side` - Side profile view
- `rear` - Rear 3/4 view
- `interior` - Interior dashboard/cabin
- `top` - Top-down view
- `engine` - Engine bay

### Used Cars
```
{listingId}_{index}.png
```

**Examples:**
```
uc123_0.png  (primary image)
uc123_1.png  (second image)
uc123_2.png  (third image)
```

---

## Folder Structure

### New Cars
```
public/
└── cars/
    └── {brand}/          # Brand slug (lowercase, hyphenated)
        └── {model}/      # Model slug (lowercase, hyphenated)
            └── {variant}/  # Variant slug (lowercase, hyphenated)
                ├── maruti_swift_zxi_red_front.png
                ├── maruti_swift_zxi_red_side.png
                ├── maruti_swift_zxi_white_front.png
                └── colors/
                    ├── red.png       # Color swatch
                    └── white.png
```

**Example Path:**
```
public/cars/maruti-suzuki/swift/zxi/maruti_swift_zxi_red_front.png
```

### Used Cars
```
public/
└── used/
    └── {city}/          # City slug (lowercase, hyphenated)
        └── {listingId}/  # Listing ID (lowercase)
            ├── 0.png     # Primary image
            ├── 1.png     # Secondary image
            └── 2.png     # Additional images
```

**Example Path:**
```
public/used/delhi-ncr/uc123/0.png
```

### Brand Logos
```
public/
└── brands/
    ├── maruti-suzuki.png
    ├── honda.png
    └── tata.png
```

---

## 360° View Assets

### Sprite Method (Preferred)
Create 24-36 individual frames for smooth rotation:
```
public/
└── cars/
    └── {brand}/
        └── {model}/
            └── {variant}/
                └── 360/
                    ├── frame_001.png
                    ├── frame_002.png
                    ├── ...
                    └── frame_036.png
```

**Frame Requirements:**
- **Count**: 24 frames (minimum), 36 frames (recommended)
- **Size**: 800x600px
- **Format**: PNG or WebP
- **Rotation**: Clockwise, 10° increments (for 36 frames)

### Iframe Method (Alternative)
Store a single 360° viewer URL in the data layer:
```json
{
  "spin360Url": "https://360viewer.example.com/honda-city-vx"
}
```

---

## Video Assets

### Specifications
- **Format**: MP4 (H.264 codec)
- **Resolution**: 1920x1080 (Full HD)
- **Aspect Ratio**: 16:9
- **Bitrate**: 5-8 Mbps
- **Length**: 30-120 seconds

### Storage
Videos should be hosted externally (YouTube/Vimeo) and referenced by URL in data:
```json
{
  "videoUrl": "https://www.youtube.com/watch?v=..."
}
```

---

## CDN Integration

### Local Development
Images are served from the `/public` folder:
```
http://localhost:5173/cars/honda/city/vx/honda_city_vx_white_front.png
```

### Production with CDN
When `VITE_USE_CDN=true` in `.env`, images are loaded from the configured CDN:
```
https://cdn.example.com/cars/honda/city/vx/honda_city_vx_white_front.png
```

### Using the Helper
Always use the `getImageUrl()` helper from `@/lib/images`:
```typescript
import { getImageUrl, getCarImageUrl } from "@/lib/images";

// Generic image
const heroUrl = getImageUrl("cars/honda/city/hero.png");

// Car image with naming convention
const carUrl = getCarImageUrl("Honda", "City", "VX", "White", "front");
```

---

## Image Optimization Checklist

- [ ] Images are properly named following the convention
- [ ] Files are placed in the correct folder structure
- [ ] Images are optimized and compressed
- [ ] Dimensions match the recommended sizes
- [ ] Transparency/background is consistent
- [ ] 1-inch margins are applied
- [ ] Color space is sRGB
- [ ] Alt text is descriptive and SEO-friendly

---

## Batch Processing Scripts

### ImageMagick Batch Resize
```bash
# Resize all PNGs in a folder to 1200px width (maintaining aspect ratio)
mogrify -resize 1200x -format png *.png

# Add 96px margin to all images
mogrify -border 96x96 -bordercolor "#F5F5F5" *.png
```

### Optimization
```bash
# Using ImageOptim CLI
imageoptim --quality 85 *.png

# Using pngquant
pngquant --quality=80-95 --ext .png --force *.png
```

---

## Future Enhancements

- [ ] WebP format support for modern browsers
- [ ] Responsive image srcset generation
- [ ] Automatic thumbnail generation
- [ ] Image CDN caching strategy
- [ ] Lazy loading implementation
- [ ] Progressive JPEG support for photos
