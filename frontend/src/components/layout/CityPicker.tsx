import { useState, useEffect } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCity } from "@/contexts/CityContext";
import { citiesApi } from "@/lib/api";

interface City {
  id: string;
  name: string;
  state: string;
  slug: string;
}

export const CityPicker = () => {
  const { city, setCity } = useCity();
  const [open, setOpen] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadCities();
    }
  }, [open]);

  const loadCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allCities, popular] = await Promise.all([
        citiesApi.getAll(),
        citiesApi.getPopular(),
      ]);
      setCities(allCities);
      setPopularCities(popular);
    } catch (err) {
      setError("Failed to load cities");
      console.error("Error loading cities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (cityName: string) => {
    setCity(cityName);
    setOpen(false);
    setSearchQuery("");
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      return;
    }
    try {
      setLoading(true);
      const results = await citiesApi.search(query);
      setCities(results);
    } catch (err) {
      console.error("Error searching cities:", err);
    } finally {
      setLoading(false);
    }
  };

  const displayCities = searchQuery.trim().length >= 2 ? cities : popularCities;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium hover:bg-primary/10">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">{city}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Select Your City</DialogTitle>
          <DialogDescription>
            Choose your city to see accurate on-road prices and local offers
          </DialogDescription>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search city..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive py-4 text-center">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {searchQuery.trim().length >= 2 ? "Search Results" : "Popular Cities"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayCities.map((cityData) => (
                  <Badge
                    key={cityData.id}
                    variant={city === cityData.name ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all px-4 py-2 text-sm font-medium hover:scale-105"
                    onClick={() => handleCityChange(cityData.name)}
                  >
                    {cityData.name}
                    {cityData.state && (
                      <span className="ml-1 text-xs opacity-70">({cityData.state})</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {displayCities.length === 0 && searchQuery.trim().length >= 2 && (
              <div className="text-center py-8 text-muted-foreground">
                No cities found matching "{searchQuery}"
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
