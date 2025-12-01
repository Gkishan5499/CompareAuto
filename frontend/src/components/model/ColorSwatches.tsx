import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorSwatchesProps {
  colors: string[];
  onColorChange?: (color: string) => void;
}

const colorMap: Record<string, string> = {
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
  Pearl: "bg-gradient-to-br from-white to-gray-200",
  Metallic: "bg-gradient-to-br from-gray-400 to-gray-600",
};

const ColorSwatches = ({ colors, onColorChange }: ColorSwatchesProps) => {
  const [selectedColor, setSelectedColor] = useState(colors[0] || "White");

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    onColorChange?.(color);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorClick(color)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={cn(
                "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all",
                colorMap[color] || "bg-gray-400",
                selectedColor === color
                  ? "ring-4 ring-primary ring-offset-2 scale-110"
                  : "hover:scale-105 border-border"
              )}
            >
              {selectedColor === color && (
                <Check className="h-6 w-6 text-white drop-shadow-lg" />
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                selectedColor === color ? "text-primary" : "text-muted-foreground"
              )}
            >
              {color}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSwatches;
