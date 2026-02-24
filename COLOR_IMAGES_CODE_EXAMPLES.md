# Color Images - Code Examples

## 1. Using ColorImageGallery Component

### Basic Usage
```typescript
import ColorImageGallery from "@/components/model/ColorImageGallery";
import { getColorImageGallery } from "@/lib/images";

export default function MyComponent() {
  const colors = ["Pearl White", "Deep Black", "Red Metallic"];
  const colorImages = getColorImageGallery(
    "maruti-suzuki", 
    "swift", 
    "zxi", 
    colors
  );

  const handleColorChange = (color: string) => {
    console.log(`User selected: ${color}`);
  };

  return (
    <ColorImageGallery
      colors={colors}
      colorImages={colorImages}
      modelName="Swift"
      brandName="Maruti Suzuki"
      onColorChange={handleColorChange}
    />
  );
}
```

### With Specs Data
```typescript
// In VariantDetail component
const colorImages = useMemo(() => {
  const colors = specs?.exterior?.monotone_color_names || 
                variantData?.colors || [];
  if (!colors || colors.length === 0) return {};
  return getColorImageGallery(brand || "", modelSlug || "", variantSlug || "", colors);
}, [specs?.exterior?.monotone_color_names, 
    specs?.exterior?.colors, 
    variantData?.colors, 
    brand, 
    modelSlug, 
    variantSlug]);

return (
  <ColorImageGallery
    colors={specs?.exterior?.monotone_color_names || variantData?.colors || []}
    colorImages={colorImages}
    modelName={modelData?.name || ""}
    brandName={modelData?.brandName}
    onColorChange={setSelectedColor}
  />
);
```

## 2. Image URL Generation

### getColorImageGallery Function
```typescript
import { getColorImageGallery } from "@/lib/images";

const colorImages = getColorImageGallery(
  "honda",           // brand
  "city",            // model
  "vx",             // variant
  ["Silver", "White", "Black"]  // colors
);

// Returns:
{
  "Silver": [
    "/cars/honda/city/vx/honda_city_vx_silver_front.png",
    "/cars/honda/city/vx/honda_city_vx_silver_side.png",
    "/cars/honda/city/vx/honda_city_vx_silver_rear.png",
    "/cars/honda/city/vx/honda_city_vx_silver_interior.png"
  ],
  "White": [
    "/cars/honda/city/vx/honda_city_vx_white_front.png",
    "/cars/honda/city/vx/honda_city_vx_white_side.png",
    "/cars/honda/city/vx/honda_city_vx_white_rear.png",
    "/cars/honda/city/vx/honda_city_vx_white_interior.png"
  ],
  "Black": [
    "/cars/honda/city/vx/honda_city_vx_black_front.png",
    "/cars/honda/city/vx/honda_city_vx_black_side.png",
    "/cars/honda/city/vx/honda_city_vx_black_rear.png",
    "/cars/honda/city/vx/honda_city_vx_black_interior.png"
  ]
}
```

### Manual URL Building
```typescript
// If you need to build URLs manually:
import { getCarImageUrl } from "@/lib/images";

// Get front view of car in white
const frontImage = getCarImageUrl(
  "maruti-suzuki",
  "swift",
  "zxi",
  "pearl-white",
  "front"
);
// Returns: /cars/maruti-suzuki/swift/zxi/maruti_suzuki_swift_zxi_pearl_white_front.png

// Get side view without angle (defaults to just color)
const colorImage = getCarImageUrl(
  "maruti-suzuki",
  "swift",
  "zxi",
  "deep-black"
);
// Returns: /cars/maruti-suzuki/swift/zxi/maruti_suzuki_swift_zxi_deep_black.png
```

## 3. CSV Import Configuration

### CSV File Format
```csv
brand,model,variant_id,exterior_monotone_color_names,hero,gallery
Maruti Suzuki,Swift,V001,"Pearl White, Deep Black, Red Metallic",/cars/maruti-suzuki/swift/zxi/hero.png,/cars/maruti-suzuki/swift/zxi/1.png|/cars/maruti-suzuki/swift/zxi/2.png
Honda City,City,V002,"Silver, White, Black",/cars/honda/city/vx/hero.png,/cars/honda/city/vx/1.png|/cars/honda/city/vx/2.png
```

### Admin CSV Importer Mapping
```typescript
// In SpecsCSVImport.tsx
const mapping = {
  "brand": "brand",
  "model": "model",
  "variant_id": "variant_id",
  "exterior_monotone_color_names": "exterior.monotone_color_names",  // ← Color mapping
  "hero": "media.hero",
  "gallery": "media.gallery"
};

// Or use custom path:
const customPaths = {
  "your_color_column": "exterior.monotone_color_names"
};
```

## 4. Backend Specs Model

### Interface Definition
```typescript
export interface ICarSpecs extends Document {
  exterior?: {
    monotone_color_names?: string[];  // ["Pearl White", "Deep Black"]
    colors?: string[];                // Alias for colors
  };
  // ... other fields
}
```

### Schema Definition
```typescript
const CarSpecsSchema = new Schema<ICarSpecs>({
  exterior: {
    monotone_color_names: [String],  // Array of color names
    colors: [String],
  },
  // ... other fields
}, { 
  timestamps: true,
  strict: false  // Allow dynamic fields for CSV imports
});
```

### Fetching Specs with Colors
```typescript
// Backend API
app.get('/api/specs/:variantId', async (req, res) => {
  const specs = await CarSpecs.findOne({ variantId: req.params.variantId });
  
  return res.json({
    exterior: {
      monotone_color_names: specs?.exterior?.monotone_color_names,
      colors: specs?.exterior?.colors
    },
    // ... other spec data
  });
});

// Frontend usage
const { data: specs } = useQuery({
  queryKey: ["specs", variantId],
  queryFn: () => specsApi.getByVariantId(variantId)
});

// Access colors:
const colors = specs?.exterior?.monotone_color_names || [];
```

## 5. State Management

### In Component
```typescript
import { useState, useMemo } from "react";
import { getColorImageGallery } from "@/lib/images";

export default function VariantDetail() {
  const [selectedColor, setSelectedColor] = useState("White");

  // Compute color images from specs
  const colorImages = useMemo(() => {
    const colors = specs?.exterior?.monotone_color_names || [];
    return getColorImageGallery(brand, model, variant, colors);
  }, [specs?.exterior?.monotone_color_names, brand, model, variant]);

  // Handle color selection
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Track user interaction (optional)
    analytics?.track("color_selected", { color, variant: variantData.id });
  };

  return (
    <ColorImageGallery
      colors={specs?.exterior?.monotone_color_names || []}
      colorImages={colorImages}
      modelName={modelData.name}
      onColorChange={handleColorChange}
    />
  );
}
```

## 6. Error Handling & Fallbacks

### Graceful Degradation
```typescript
// If no color images available
const colorImages = useMemo(() => {
  try {
    const colors = specs?.exterior?.monotone_color_names || [];
    if (!colors || colors.length === 0) return {};  // ← Fallback to empty object
    return getColorImageGallery(brand, model, variant, colors);
  } catch (err) {
    console.error("Failed to generate color images:", err);
    return {};  // ← Fallback on error
  }
}, [specs?.exterior?.monotone_color_names, brand, model, variant]);

// Render fallback UI if no images
{Object.keys(colorImages).length === 0 ? (
  <ColorSwatches colors={variantData.colors || []} />  // ← Simple swatches as fallback
) : (
  <ColorImageGallery {...props} />
)}
```

### Image Loading States
```typescript
const ColorImageGalleryWithLoading = ({ 
  colorImages, 
  selectedColor 
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div>
      {isLoading && (
        <div className="animate-pulse bg-muted h-96 rounded-lg" />
      )}
      <PhotoGallery
        photos={colorImages[selectedColor] || []}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
};
```

## 7. Performance Optimization

### Preload Color Images
```typescript
import { preloadImages } from "@/lib/images";

useEffect(() => {
  // Preload images for all colors
  const allImages = Object.values(colorImages).flat();
  preloadImages(allImages);
}, [colorImages]);

// Or preload just selected color
useEffect(() => {
  const selectedImages = colorImages[selectedColor] || [];
  preloadImages(selectedImages);
}, [selectedColor, colorImages]);
```

### Memoization
```typescript
const ColorImageGalleryMemoized = memo(ColorImageGallery, (prev, next) => {
  // Only re-render if colors or images actually changed
  return (
    prev.selectedColor === next.selectedColor &&
    JSON.stringify(prev.colorImages) === JSON.stringify(next.colorImages)
  );
});

// Usage
<ColorImageGalleryMemoized
  colors={colors}
  colorImages={colorImages}
  selectedColor={selectedColor}
  modelName={modelName}
/>
```

## 8. Testing Examples

### Unit Test
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import ColorImageGallery from "@/components/model/ColorImageGallery";

describe("ColorImageGallery", () => {
  test("renders color buttons for all colors", () => {
    const colors = ["White", "Black", "Red"];
    const colorImages = {
      "White": ["/img/white.png"],
      "Black": ["/img/black.png"],
      "Red": ["/img/red.png"]
    };

    render(
      <ColorImageGallery
        colors={colors}
        colorImages={colorImages}
        modelName="Test Car"
      />
    );

    expect(screen.getByText("White")).toBeInTheDocument();
    expect(screen.getByText("Black")).toBeInTheDocument();
    expect(screen.getByText("Red")).toBeInTheDocument();
  });

  test("updates gallery when color clicked", () => {
    const onColorChange = jest.fn();
    
    render(
      <ColorImageGallery
        colors={["White", "Black"]}
        colorImages={{"White": ["/white.png"], "Black": ["/black.png"]}}
        modelName="Test Car"
        onColorChange={onColorChange}
      />
    );

    fireEvent.click(screen.getByText("Black"));
    expect(onColorChange).toHaveBeenCalledWith("Black");
  });
});
```

### Integration Test
```typescript
test("complete color selection flow", async () => {
  const { data: variant } = await fetchVariant("V001");
  
  render(<VariantDetail variantId="V001" />);
  
  // Wait for colors to load
  await screen.findByText("Pearl White");
  
  // Click a color
  fireEvent.click(screen.getByText("Deep Black"));
  
  // Verify images updated
  expect(screen.getByAltText(/deep black/i)).toBeInTheDocument();
});
```

---

All examples are production-ready and follow React best practices!
