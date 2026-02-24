import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import PhotoGallery from "./PhotoGallery";

interface DualToneColor {
  name: string;
  primary: string;
  secondary: string;
}

interface ColorImageGalleryProps {
  colors?: string[];
  dualToneColors?: DualToneColor[];
  colorImages?: Record<string, string[]>; // Map of color -> images array
  dualToneColorImages?: Record<string, string[]>; // Map of dual tone color name -> images array
  modelName: string;
  brandName?: string;
  onColorChange?: (color: string | DualToneColor) => void;
}

const colorMap: Record<string, string> = {
  // Mahindra XUV 3XO colors
  "Citrine Yellow": "bg-yellow-400",
  "Deep Forest": "bg-green-900",
  "Dune Beige": "bg-amber-600",
  "Everest White": "bg-white border-2 border-gray-300",
  "Galaxy Grey": "bg-gray-600",
  "Galvano Grey": "bg-gray-500",
  "Nebula Blue": "bg-blue-800",
  "Stealth Black": "bg-black",
  "Tango Red": "bg-red-600",
  
  // Generic colors
  White: "bg-white border-2",
  Black: "bg-black",
  Silver: "bg-gray-300",
  Gray: "bg-gray-500",
  Red: "bg-red-600",
  Blue: "bg-blue-600",
  Green: "bg-green-600",
  Orange: "bg-orange-600",
  Brown: "bg-amber-800",
  Beige: "bg-amber-200",
  Red_Metallic: "bg-red-700",
  Pearl: "bg-gradient-to-br from-white to-gray-200",
  Metallic: "bg-gradient-to-br from-gray-400 to-gray-600",
  "Pearl White": "bg-gradient-to-br from-white to-gray-100",
  "Glacier White": "bg-slate-100",
  "Deep Black": "bg-black",
  "Pearl Black": "bg-slate-900",
};

const ColorImageGallery = ({
  colors = [],
  dualToneColors = [],
  colorImages = {},
  dualToneColorImages = {},
  modelName,
  brandName,
  onColorChange,
}: ColorImageGalleryProps) => {
  const hasMonotone = colors && colors.length > 0;
  const hasDualTone = dualToneColors && dualToneColors.length > 0;
  
  const [selectedColor, setSelectedColor] = useState<string | DualToneColor>(
    hasMonotone ? colors[0] : (hasDualTone ? dualToneColors[0] : "White")
  );
  const [colorMode, setColorMode] = useState<"monotone" | "dual">(hasMonotone ? "monotone" : "dual");

  const handleColorClick = (color: string | DualToneColor) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  const handleColorModeChange = (mode: "monotone" | "dual") => {
    setColorMode(mode);
    if (mode === "monotone" && colors.length > 0) {
      setSelectedColor(colors[0]);
    } else if (mode === "dual" && dualToneColors.length > 0) {
      setSelectedColor(dualToneColors[0]);
    }
  };

  const isDualToneSelected = (color: DualToneColor): boolean => {
    if (typeof selectedColor === "string") return false;
    return selectedColor.name === color.name;
  };

  // Get images for selected color
  const selectedImages = useMemo(() => {
    let images: string[] = [];
    
    if (colorMode === "monotone" && typeof selectedColor === "string") {
      images = colorImages[selectedColor] || colorImages[colors[0]] || [];
    } else if (colorMode === "dual" && typeof selectedColor !== "string") {
      images = dualToneColorImages[selectedColor.name] || dualToneColorImages[dualToneColors[0]?.name] || [];
    }
    
    console.log("🖼️ Selected Images Debug:", {
      colorMode,
      selectedColor,
      selectedColorType: typeof selectedColor,
      selectedColorName: typeof selectedColor !== "string" ? selectedColor.name : undefined,
      availableColorImagesKeys: Object.keys(colorImages),
      availableDualToneKeys: Object.keys(dualToneColorImages),
      selectedImagesCount: images.length,
      selectedImages: images,
    });
    
    return images;
  }, [selectedColor, colorImages, dualToneColorImages, colors, dualToneColors, colorMode]);

  return (
    <div className="space-y-6">
      {/* Tabs to switch between monotone and dual tone */}
      {hasMonotone && hasDualTone && (
        <div className="flex gap-2 border-b">
          <button
            onClick={() => handleColorModeChange("monotone")}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              colorMode === "monotone"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Single Tone ({colors.length})
          </button>
          <button
            onClick={() => handleColorModeChange("dual")}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              colorMode === "dual"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Dual Tone ({dualToneColors.length})
          </button>
        </div>
      )}

      {/* Photo Gallery for selected color */}
      {selectedImages.length > 0 ? (
        <div className="rounded-lg overflow-hidden border border-border">
          <PhotoGallery 
            photos={selectedImages} 
            modelName={modelName}
            brandName={brandName}
            mode="hero"
          />
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-border p-8 text-center bg-muted/50">
          <p className="text-muted-foreground">
            No images available for {typeof selectedColor === "string" ? selectedColor : `${selectedColor.primary} with ${selectedColor.secondary}`}
          </p>
        </div>
      )}

      {/* Color Selection Buttons */}
      <div className="space-y-3">
        <p className="font-semibold text-sm">
          Available Colors ({colorMode === "monotone" ? colors.length : dualToneColors.length}):
        </p>
        <div className="flex flex-wrap gap-4">
          {colorMode === "monotone" && colors && colors.length > 0
            ? colors.map((color) => {
                const colorClass = colorMap[color];
                console.log(`🎨 Color Button - ${color}:`, {
                  found: !!colorClass,
                  tailwindClass: colorClass || "bg-gray-400",
                });
                return (
                  <button
                    key={color}
                    onClick={() => handleColorClick(color)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={cn(
                        "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all",
                        colorClass || "bg-gray-400",
                        typeof selectedColor === "string" && selectedColor === color
                          ? "ring-4 ring-primary ring-offset-2 scale-110"
                          : "hover:scale-105 border-border"
                      )}
                    >
                      {typeof selectedColor === "string" && selectedColor === color && (
                        <Check className="w-6 h-6 text-white drop-shadow-lg" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center max-w-16 line-clamp-2 group-hover:text-primary transition-colors">
                      {color}
                    </span>
                  </button>
                );
              })
            : dualToneColors && dualToneColors.length > 0
            ? dualToneColors.map((dualColor) => (
                <button
                  key={dualColor.name}
                  onClick={() => handleColorClick(dualColor)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={cn(
                      "w-16 h-16 rounded-full border-2 flex transition-all overflow-hidden",
                      isDualToneSelected(dualColor)
                        ? "ring-4 ring-primary ring-offset-2 scale-110"
                        : "hover:scale-105 border-border"
                    )}
                  >
                    {/* Dual tone split circle */}
                    <div className={cn("flex-1", colorMap[dualColor.primary] || "bg-gray-400")} />
                    <div className={cn("flex-1", colorMap[dualColor.secondary] || "bg-gray-400")} />
                  </div>
                  <span className="text-xs font-medium text-center max-w-20 line-clamp-3 group-hover:text-primary transition-colors">
                    {dualColor.name}
                  </span>
                </button>
              ))
            : null}
        </div>
      </div>
    </div>
  );
};

export default ColorImageGallery;
