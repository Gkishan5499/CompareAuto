import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, DollarSign, Fuel } from "lucide-react";
import { formatINR } from "@/lib/guards";
import { getStateFromCity } from "@/lib/priceCalculations";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface VariantPriceCalculatorProps {
  variant: any;
  selectedCity: string;
  onFuelTypeChange?: (fuel: string) => void;
}

export const VariantPriceCalculator = ({
  variant,
  selectedCity,
  onFuelTypeChange,
}: VariantPriceCalculatorProps) => {
  const [selectedFuel, setSelectedFuel] = useState(variant?.fuelType || "petrol");
  const [priceBreakdown, setPriceBreakdown] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedState = getStateFromCity(selectedCity);
  const exShowroomPrice = variant?.price || variant?.exShowroomPrice || 0;

  useEffect(() => {
    let cancelled = false;

    const fetchPriceBreakdown = async () => {
      if (!exShowroomPrice || exShowroomPrice <= 0) {
        setPriceBreakdown(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/pricing/calc`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exShowroomPrice,
            state: selectedState,
            fuelType: selectedFuel,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to calculate on-road price");
        }

        const data = await response.json();
        if (!cancelled) {
          setPriceBreakdown(data.breakdown);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Error calculating price");
          setPriceBreakdown(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPriceBreakdown();
    return () => {
      cancelled = true;
    };
  }, [exShowroomPrice, selectedState, selectedFuel]);

  const handleFuelChange = (fuel: string) => {
    setSelectedFuel(fuel);
    onFuelTypeChange?.(fuel);
  };

  return (
    <Card className="w-full border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Fuel className="w-4 h-4 text-blue-600" />
          On-Road Price by Fuel Type
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Fuel Type Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase">Select Fuel Type</label>
          <Select value={selectedFuel} onValueChange={handleFuelChange}>
            <SelectTrigger className="w-full text-sm">
              <SelectValue placeholder="Choose fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">🔥 Petrol</SelectItem>
              <SelectItem value="diesel">⛽ Diesel</SelectItem>
              <SelectItem value="cng">💨 CNG</SelectItem>
              <SelectItem value="hybrid">🔋 Hybrid</SelectItem>
              <SelectItem value="ev">⚡ Electric (EV)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <Loader className="h-4 w-4 animate-spin text-blue-600 mr-2" />
            <span className="text-xs text-gray-600">Calculating...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Price Breakdown */}
        {priceBreakdown && !loading && (
          <div className="space-y-2">
            {/* Ex-Showroom Price */}
            <div className="flex justify-between items-center pb-2 border-b text-xs">
              <span className="text-muted-foreground">Ex-Showroom</span>
              <span className="font-semibold">{formatINR(exShowroomPrice || 0, true)}</span>
            </div>

            {/* RTO */}
            {priceBreakdown.rto !== undefined && (
              <div className="flex justify-between items-center text-xs pb-2">
                <span className="text-muted-foreground">RTO</span>
                <span className="font-semibold text-orange-600">
                  {formatINR(priceBreakdown.rto, true)}
                </span>
              </div>
            )}

            {/* Insurance */}
            {priceBreakdown.insurance !== undefined && (
              <div className="flex justify-between items-center text-xs pb-2">
                <span className="text-muted-foreground">Insurance</span>
                <span className="font-semibold text-orange-600">
                  {formatINR(priceBreakdown.insurance, true)}
                </span>
              </div>
            )}

            {/* GST */}
            {priceBreakdown.gst !== undefined && (
              <div className="flex justify-between items-center text-xs pb-2">
                <span className="text-muted-foreground">GST</span>
                <span className="font-semibold text-orange-600">
                  {formatINR(priceBreakdown.gst, true)}
                </span>
              </div>
            )}

            {/* TCS & FASTag */}
            {(priceBreakdown.tcs || priceBreakdown.fastag) && (
              <div className="flex justify-between items-center text-xs pb-2 border-b">
                <span className="text-muted-foreground">Other Charges</span>
                <span className="font-semibold text-orange-600">
                  {formatINR((priceBreakdown.tcs || 0) + (priceBreakdown.fastag || 0), true)}
                </span>
              </div>
            )}

            {/* On-Road Price Total */}
            <div className="flex justify-between items-center pt-2 bg-blue-50 dark:bg-blue-950 p-2 rounded">
              <span className="text-xs font-bold">On-Road Price</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                {formatINR(priceBreakdown.onRoadPrice, true)}
              </span>
            </div>
          </div>
        )}

        {/* No Price Available */}
        {!loading && !priceBreakdown && !error && (
          <div className="text-center py-3 text-gray-500 text-xs">
            Price information not available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantPriceCalculator;
