import { Car, Bike } from "lucide-react";
import { cn } from "@/lib/utils";

interface VehicleCategoryToggleProps {
  value: "all" | "car" | "bike";
  onChange: (value: "all" | "car" | "bike") => void;
  showAll?: boolean;
  className?: string;
}

const baseItemClass =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors";

const VehicleCategoryToggle = ({
  value,
  onChange,
  showAll = false,
  className,
}: VehicleCategoryToggleProps) => {
  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 p-1", className)}>
      {showAll && (
        <button
          type="button"
          onClick={() => onChange("all")}
          className={cn(baseItemClass, value === "all" ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-200")}
        >
          All
        </button>
      )}

      <button
        type="button"
        onClick={() => onChange("car")}
        className={cn(baseItemClass, value === "car" ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-200")}
      >
        <Car className="h-4 w-4" />
        Car
      </button>

      <button
        type="button"
        onClick={() => onChange("bike")}
        className={cn(baseItemClass, value === "bike" ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-200")}
      >
        <Bike className="h-4 w-4" />
        Bike
      </button>
    </div>
  );
};

export default VehicleCategoryToggle;
