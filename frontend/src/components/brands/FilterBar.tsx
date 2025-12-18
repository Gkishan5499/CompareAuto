import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
  selectedBodyType: string;
  selectedFuel: string;
  selectedTransmission: string;
  selectedPriceRange: string;
  onBodyTypeChange: (value: string) => void;
  onFuelChange: (value: string) => void;
  onTransmissionChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
  onClearAll: () => void;
  hideFuel?: boolean;
  hideBodyType?: boolean;
}

const bodyTypes = ["All", "Hatchback", "Sedan", "SUV", "MUV", "Coupe", "Convertible"];
const fuelTypes = ["All", "Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const transmissions = ["All", "Manual", "Automatic", "AMT", "CVT", "DCT"];
const priceRanges = [
  { label: "All Prices", value: "all" },
  { label: "Under ₹5L", value: "0-5" },
  { label: "₹5L - ₹10L", value: "5-10" },
  { label: "₹10L - ₹15L", value: "10-15" },
  { label: "₹15L - ₹25L", value: "15-25" },
  { label: "Above ₹25L", value: "25+" },
];

const FilterBar = ({
  selectedBodyType,
  selectedFuel,
  selectedTransmission,
  selectedPriceRange,
  onBodyTypeChange,
  onFuelChange,
  onTransmissionChange,
  onPriceRangeChange,
  onClearAll,
  hideFuel = false,
  hideBodyType = false,
}: FilterBarProps) => {
  const hasActiveFilters =
    selectedBodyType !== "All" ||
    selectedFuel !== "All" ||
    selectedTransmission !== "All" ||
    selectedPriceRange !== "all";

  return (
    <div className="bg-card border rounded-lg p-4 mb-8 sticky top-0 z-10 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Body Type Filter */}
        {!hideBodyType && (
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Body Type</label>
            <Select value={selectedBodyType} onValueChange={onBodyTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bodyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Fuel Type Filter */}
        {!hideFuel && (
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Fuel Type</label>
            <Select value={selectedFuel} onValueChange={onFuelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fuelTypes.map((fuel) => (
                  <SelectItem key={fuel} value={fuel}>
                    {fuel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Transmission Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Transmission</label>
          <Select value={selectedTransmission} onValueChange={onTransmissionChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transmissions.map((trans) => (
                <SelectItem key={trans} value={trans}>
                  {trans}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Price Range</label>
          <Select value={selectedPriceRange} onValueChange={onPriceRangeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={onClearAll}
              className="w-full lg:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedBodyType !== "All" && (
            <Badge variant="secondary">
              Body: {selectedBodyType}
            </Badge>
          )}
          {selectedFuel !== "All" && (
            <Badge variant="secondary">
              Fuel: {selectedFuel}
            </Badge>
          )}
          {selectedTransmission !== "All" && (
            <Badge variant="secondary">
              Trans: {selectedTransmission}
            </Badge>
          )}
          {selectedPriceRange !== "all" && (
            <Badge variant="secondary">
              Price: {priceRanges.find(r => r.value === selectedPriceRange)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
