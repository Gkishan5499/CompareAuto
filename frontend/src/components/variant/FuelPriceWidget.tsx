import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCity } from "@/contexts/CityContext";
import { apiFuelPrice } from "@/lib/api-prices";

export const FuelPriceWidget = ({ className = "" }: { className?: string }) => {
  const { city: globalCity } = useCity();
  const [fuelPrices, setFuelPrices] = useState<{ petrol: number; diesel: number; cng: number | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cityName, setCityName] = useState(globalCity);

  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true);
      try {
        const citySlug = globalCity.toLowerCase().replace(/ /g, "-");
        const result = await apiFuelPrice(citySlug);
        if ("error" in result) {
          setFuelPrices(null);
        } else {
          setFuelPrices({ petrol: result.petrol, diesel: result.diesel, cng: result.cng });
          setCityName(result.cityName);
        }
      } catch (error) {
        setFuelPrices(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (globalCity) {
      fetchPrices();
    }
  }, [globalCity]);

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  if (!fuelPrices) {
    return null;
  }

  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/5 to-secondary/5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Fuel className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Today's Fuel Price in {cityName}</h3>
        </div>
        <Link to="/tools#fuel">
          <Button variant="ghost" size="sm">
            Open Calculator
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="text-base px-4 py-2">
          Petrol: ₹{fuelPrices.petrol.toFixed(2)}/L
        </Badge>
        <Badge variant="secondary" className="text-base px-4 py-2">
          Diesel: ₹{fuelPrices.diesel.toFixed(2)}/L
        </Badge>
        {fuelPrices.cng && (
          <Badge variant="secondary" className="text-base px-4 py-2">
            CNG: ₹{fuelPrices.cng.toFixed(2)}/kg
          </Badge>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-3">
        Prices may vary. Check your local dealer for exact rates.
      </p>
    </Card>
  );
};
