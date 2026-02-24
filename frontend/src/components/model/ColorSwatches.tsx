import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DualToneColor {
  name: string;
  primary: string;
  secondary: string;
}

interface ColorSwatchesProps {
  colors?: string[];
  dualToneColors?: DualToneColor[];
  onColorChange?: (color: string | DualToneColor) => void;
}

const colorMap: Record<string, string> = {
  "Citrine Yellow": "bg-yellow-400",
  "Deep Forest": "bg-green-900",
  "Dune Beige": "bg-amber-600",
  "Everest White": "bg-white border-2 border-gray-300",
  "Galaxy Grey": "bg-gray-600",
  "Galvano Grey": "bg-gray-500",
  "Nebula Blue": "bg-blue-800",
  "Stealth Black": "bg-black",
  "Tango Red": "bg-red-600",
  
  White: "bg-white border-2 border-gray-300",
  Black: "bg-black",
  Silver: "bg-gray-400",
  Gray: "bg-gray-600",
  Red: "bg-red-600",
  Blue: "bg-blue-600",
  Green: "bg-green-600",
  Orange: "bg-orange-600",
  Brown: "bg-amber-800",
  Beige: "bg-amber-300",
  Pearl: "bg-gradient-to-br from-white to-gray-200",
  Metallic: "bg-gradient-to-br from-gray-400 to-gray-600",
};

const ColorSwatches = ({ colors = [], dualToneColors = [], onColorChange }: ColorSwatchesProps) => {
  const hasMonotone = colors && colors.length > 0;
  const hasDualTone = dualToneColors && dualToneColors.length > 0;
  
  const [selectedColor, setSelectedColor] = useState<string | DualToneColor>(
    hasMonotone ? colors[0] : (hasDualTone ? dualToneColors[0] : "White")
  );
  const [scrollPosition, setScrollPosition] = useState(0);
  const [colorMode, setColorMode] = useState<"monotone" | "dual">(hasMonotone ? "monotone" : "dual");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  console.log("🎨 ColorSwatches Component Received:", {
    monotoneColors: colors,
    monotoneCount: colors?.length || 0,
    dualToneColors: dualToneColors,
    dualToneCount: dualToneColors?.length || 0,
    selectedColor,
    colorMode,
    hasMonotone,
    hasDualTone,
  });

  const handleColorClick = (color: string | DualToneColor) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  const isDualToneSelected = (color: DualToneColor): boolean => {
    if (typeof selectedColor === "string") return false;
    return selectedColor.name === color.name;
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = 300;
    const newPosition =
      direction === "left"
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    container.scrollLeft = newPosition;
    setScrollPosition(newPosition);
  };

  // Reset scroll when changing color mode
  const handleColorModeChange = (mode: "monotone" | "dual") => {
    setColorMode(mode);
    setScrollPosition(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    if (mode === "monotone" && colors.length > 0) {
      setSelectedColor(colors[0]);
    } else if (mode === "dual" && dualToneColors.length > 0) {
      setSelectedColor(dualToneColors[0]);
    }
  };

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
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Single Tone ({colors.length})
          </button>
          <button
            onClick={() => handleColorModeChange("dual")}
            className={cn(
              "px-4 py-2 font-medium transition-colors",
              colorMode === "dual"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Dual Tone ({dualToneColors.length})
          </button>
        </div>
      )}

      {/* Horizontal scrollable color swatches */}
      <div className="relative">
        {/* Left Arrow */}
        {scrollPosition > 0 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-12 py-4"
          style={{ scrollBehavior: "smooth" }}
        >
          {colorMode === "monotone" && colors && colors.length > 0
            ? colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorClick(color)}
                  className="flex-shrink-0 w-20 h-20 transition-all hover:scale-110 focus:outline-none"
                >
                  <div
                    className={cn(
                      "w-full h-full rounded-lg border-4 flex items-center justify-center transition-all",
                      colorMap[color] || "bg-gray-400",
                      typeof selectedColor === "string" && selectedColor === color
                        ? "border-blue-500 ring-4 ring-blue-500 ring-offset-2 scale-110"
                        : "border-gray-300"
                    )}
                  />
                </button>
              ))
            : dualToneColors && dualToneColors.length > 0
            ? dualToneColors.map((dualColor) => (
                <button
                  key={dualColor.name}
                  onClick={() => handleColorClick(dualColor)}
                  className="flex-shrink-0 w-20 h-20 transition-all hover:scale-110 focus:outline-none"
                >
                  <div
                    className={cn(
                      "w-full h-full rounded-lg border-4 flex transition-all overflow-hidden",
                      isDualToneSelected(dualColor)
                        ? "border-blue-500 ring-4 ring-blue-500 ring-offset-2 scale-110"
                        : "border-gray-300"
                    )}
                  >
                    {/* Dual tone split */}
                    <div className={cn("flex-1", colorMap[dualColor.primary] || "bg-gray-400")} />
                    <div className={cn("flex-1", colorMap[dualColor.secondary] || "bg-gray-400")} />
                  </div>
                </button>
              ))
            : null}
        </div>

        {/* Right Arrow */}
        {scrollPosition < (colorMode === "monotone" ? colors.length : dualToneColors.length) * 120 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Selected Color Name - Prominent Display */}
      <div className="text-center">
        <div className="inline-block bg-blue-50 px-6 py-3 rounded-lg">
          <p className="text-xl font-semibold text-blue-600">
            {typeof selectedColor === "string"
              ? selectedColor
              : `${selectedColor.primary} with ${selectedColor.secondary}`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ColorSwatches;
