import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader, DollarSign } from "lucide-react";
import { formatINR } from "@/lib/guards";
import { getStateFromCity } from "@/lib/priceCalculations";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface OnRoadPriceCalculatorProps {
  exShowroomPrice: number;
  selectedCity: string;
  fuelType?: string;
  onFuelTypeChange?: (fuel: string) => void;
}

export const OnRoadPriceCalculator = ({
  exShowroomPrice,
  selectedCity,
  fuelType = "petrol",
  onFuelTypeChange,
}: OnRoadPriceCalculatorProps) => {
  const [selectedFuel, setSelectedFuel] = useState(fuelType);
  const [priceBreakdown, setPriceBreakdown] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedState = getStateFromCity(selectedCity);

  useEffect(() => {
    setSelectedFuel(fuelType);
  }, [fuelType]);

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          On-Road Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fuel Type Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Fuel Type</label>
          <Select value={selectedFuel} onValueChange={handleFuelChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="cng">CNG</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="ev">Electric (EV)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-6">
            <Loader className="h-5 w-5 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Calculating price...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Price Breakdown */}
        {priceBreakdown && !loading && (
          <div className="space-y-3">
            {/* Ex-Showroom Price */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium text-gray-700">Ex-Showroom Price</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatINR(priceBreakdown.exShowroomPrice || exShowroomPrice)}
              </span>
            </div>

            {/* RTO */}
            {priceBreakdown.rto !== undefined && (
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-gray-600">RTO Registration</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatINR(priceBreakdown.rto, true)}
                </span>
              </div>
            )}

            {/* Insurance */}
            {priceBreakdown.insurance !== undefined && (
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-gray-600">Insurance (Comprehensive)</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatINR(priceBreakdown.insurance, true)}
                </span>
              </div>
            )}

            {/* GST */}
            {priceBreakdown.gst !== undefined && (
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-gray-600">GST (5%)</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatINR(priceBreakdown.gst, true)}
                </span>
              </div>
            )}

            {/* TCS */}
            {priceBreakdown.tcs !== undefined && priceBreakdown.tcs > 0 && (
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-gray-600">TCS (1%)</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatINR(priceBreakdown.tcs, true)}
                </span>
              </div>
            )}

            {/* FASTag */}
            {priceBreakdown.fastag !== undefined && priceBreakdown.fastag > 0 && (
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-gray-600">FASTag</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatINR(priceBreakdown.fastag, true)}
                </span>
              </div>
            )}

            {/* Other Charges */}
            {priceBreakdown.otherCharges !== undefined && priceBreakdown.otherCharges > 0 && (
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-sm text-gray-600">Other Charges</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatINR(priceBreakdown.otherCharges, true)}
                </span>
              </div>
            )}

            {/* On-Road Price Total */}
            <div className="flex justify-between items-center pt-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3 rounded-lg">
              <span className="text-base font-bold text-gray-900 dark:text-white">
                On-Road Price ({selectedFuel.charAt(0).toUpperCase() + selectedFuel.slice(1)})
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {formatINR(priceBreakdown.onRoadPrice, false)}
              </span>
            </div>

            {/* City/State Info */}
            <div className="text-xs text-gray-500 pt-2">
              Calculated for {selectedCity}, {selectedState}
            </div>
          </div>
        )}

        {/* No Price Available */}
        {!loading && !priceBreakdown && !error && (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">Price information not available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnRoadPriceCalculator;
