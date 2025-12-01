import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";

interface UsedFiltersProps {
  filters: {
    brand: string;
    fuel: string;
    transmission: string;
    priceMax: number;
    yearMin: number;
    kmsMax: number;
    owners: number;
  };
  onFilterChange: (key: string, value: any) => void;
  onClear: () => void;
  brands: string[];
}

export const UsedFilters = ({ filters, onFilterChange, onClear, brands }: UsedFiltersProps) => {
  return (
    <div className="space-y-6 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label>Brand</Label>
        <Select value={filters.brand} onValueChange={(val) => onFilterChange("brand", val)}>
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand} value={brand}>
                {brand}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <Label>Fuel Type</Label>
        <Select value={filters.fuel} onValueChange={(val) => onFilterChange("fuel", val)}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Petrol">Petrol</SelectItem>
            <SelectItem value="Diesel">Diesel</SelectItem>
            <SelectItem value="CNG">CNG</SelectItem>
            <SelectItem value="Electric">Electric</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transmission */}
      <div className="space-y-2">
        <Label>Transmission</Label>
        <Select value={filters.transmission} onValueChange={(val) => onFilterChange("transmission", val)}>
          <SelectTrigger>
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="MT">Manual</SelectItem>
            <SelectItem value="AT">Automatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <Label>Budget (Max): ₹{(filters.priceMax / 100000).toFixed(1)}L</Label>
        <Slider
          value={[filters.priceMax]}
          onValueChange={(val) => onFilterChange("priceMax", val[0])}
          max={5000000}
          min={100000}
          step={100000}
        />
      </div>

      {/* Year */}
      <div className="space-y-2">
        <Label>Year (Min): {filters.yearMin}</Label>
        <Slider
          value={[filters.yearMin]}
          onValueChange={(val) => onFilterChange("yearMin", val[0])}
          max={2024}
          min={2010}
          step={1}
        />
      </div>

      {/* KMs */}
      <div className="space-y-2">
        <Label>KMs Driven (Max): {(filters.kmsMax / 1000).toFixed(0)}k</Label>
        <Slider
          value={[filters.kmsMax]}
          onValueChange={(val) => onFilterChange("kmsMax", val[0])}
          max={200000}
          min={0}
          step={10000}
        />
      </div>

      {/* Owners */}
      <div className="space-y-2">
        <Label>Owners (Max)</Label>
        <Select 
          value={filters.owners.toString()} 
          onValueChange={(val) => onFilterChange("owners", parseInt(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="0">Any</SelectItem>
            <SelectItem value="1">1st Owner</SelectItem>
            <SelectItem value="2">Up to 2 Owners</SelectItem>
            <SelectItem value="3">Up to 3 Owners</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
