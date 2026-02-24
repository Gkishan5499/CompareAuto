# Color Images Quick Reference

## 🎯 Quick Setup

### Step 1: Add Colors to Specs CSV
```csv
brand,model,variant_id,exterior_monotone_color_names
Maruti Suzuki,Swift,V001,"Pearl White, Deep Black, Red Metallic"
Honda City,City,V002,"Silver, White, Black"
```

### Step 2: Upload Images to Cloudinary
```
Format: {brand}_{model}_{variant}_{color}_{angle}.png

Examples:
- maruti_suzuki_swift_zxi_pearl_white_front.png
- maruti_suzuki_swift_zxi_pearl_white_side.png
- maruti_suzuki_swift_zxi_deep_black_front.png
- honda_city_vx_silver_front.png
```

### Step 3: Verify in Frontend
```
1. Go to: /brand/model/variant
2. Click "Colors" tab
3. Click color buttons to see images update
```

## 📁 File Changes

| File | Change | Purpose |
|------|--------|---------|
| `backend/src/models/carSpace/CarSpecs.model.ts` | Added `exterior.monotone_color_names` | Store car colors |
| `frontend/src/components/model/ColorImageGallery.tsx` | NEW | Display color-based gallery |
| `frontend/src/lib/images.ts` | Added `getColorImageGallery()` | Generate color image URLs |
| `frontend/src/pages/VariantDetail.tsx` | Updated colors tab | Use ColorImageGallery |

## 🖼️ Image Naming Rules

- **Color names**: Use proper spacing (e.g., "Pearl White")
- **Filenames**: Convert to slug format → `pearl_white`
- **Folder structure**: `/cars/{brand}/{model}/{variant}/`
- **Angles**: `front`, `side`, `rear`, `interior`

## 💾 CSV Column Mapping

When importing specs:
```
Your Column → System Field
exterior_monotone_color_names → exterior.monotone_color_names

If different name, use custom mapping:
exterior_colors → exterior.monotone_color_names
colors → exterior.monotone_color_names
```

## 🧪 Testing Checklist

- [ ] Colors appear in Colors tab
- [ ] Clicking color shows images update
- [ ] Correct number of images shown per color
- [ ] Fallback to color swatches works if no images
- [ ] No 404 errors in console
- [ ] Images load with correct URL pattern

## ⚡ Performance Tips

1. **Optimize images**: Use TinyPNG or ImageOptim
2. **Standard size**: 800x600px for car images
3. **File format**: PNG with optimization
4. **Preload**: System auto-preloads selected color images

## 🔧 Troubleshooting

**Problem**: Colors show but no images appear
```
Solution:
1. Check file names match exactly (case-sensitive)
2. Verify URLs in Network tab of DevTools
3. Check Cloudinary folder structure
4. Ensure color names match between CSV and images
```

**Problem**: Only showing simple color swatches
```
Solution:
1. Verify specs have exterior.monotone_color_names
2. Check colorImages object in console
3. Verify image URLs are being generated
```

**Problem**: 404 errors on images
```
Solution:
1. Check filename format: {brand}_{model}_{variant}_{color}_{angle}.png
2. Verify path structure in Cloudinary
3. Ensure spaces converted to underscores in filenames
```

## 📋 Example: Complete Setup

### CSV Row:
```csv
Maruti Suzuki,Swift,V001,"Pearl White, Deep Black, Red Metallic",hero.png,gallery1.png|gallery2.png
```

### Cloudinary Structure:
```
/cars/maruti-suzuki/swift/zxi/
├── maruti_suzuki_swift_zxi_pearl_white_front.png
├── maruti_suzuki_swift_zxi_pearl_white_side.png
├── maruti_suzuki_swift_zxi_deep_black_front.png
├── maruti_suzuki_swift_zxi_deep_black_side.png
└── maruti_suzuki_swift_zxi_red_metallic_front.png
```

### Frontend Result:
```
Colors Tab → Pearl White (3 colors)
             ├─ Pearl White (2 images)
             ├─ Deep Black (2 images)
             └─ Red Metallic (1 image)

Click color → Gallery updates with that color's images
```

## 📞 Support

For issues:
1. Check `COLOR_IMAGES_GUIDE.md` for detailed setup
2. Review `COLOR_IMAGES_IMPLEMENTATION.md` for architecture
3. Verify file names and paths match exactly
4. Check browser console for errors
