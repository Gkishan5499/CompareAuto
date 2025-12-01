import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UsedCarCard } from "@/components/used/UsedCarCard";
import { UsedFilters } from "@/components/used/UsedFilters";
import AdSlot from "@/components/ads/AdSlot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getUsedCars, UsedCar } from "@/lib/data";
import { updateMetaTags, injectStructuredData, generateItemListSchema } from "@/lib/seo";

const UsedCarsCity = () => {
  const { city } = useParams();
  const cityName = city?.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "";
  
  const [cars, setCars] = useState<UsedCar[]>([]);
  const [filteredCars, setFilteredCars] = useState<UsedCar[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const allBrands = Array.from(new Set(cars.map((car) => car.brand))).sort();
  const [filters, setFilters] = useState({
    brand: "all",
    fuel: "all",
    transmission: "all",
    priceMax: 5000000,
    yearMin: 2010,
    kmsMax: 200000,
    owners: 0,
  });

  useEffect(() => {
    const allCars = getUsedCars({ city: cityName });
    setCars(allCars);
    setFilteredCars(allCars);

    // SEO
    updateMetaTags({
      title: `Used Cars in ${cityName} – Best Deals & Prices | CompareAuto.in`,
      description: `Find the best deals on used cars in ${cityName}. Browse verified second-hand cars from trusted dealers with detailed specifications and prices.`,
      keywords: [`used cars ${cityName}`, `second hand cars ${cityName}`, `buy used cars ${cityName}`],
      ogImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    });

    const schema = generateItemListSchema(
      allCars.slice(0, 20).map((car, idx) => ({
        name: car.title,
        url: `https://compareauto.in${car.listingUrl}`,
        position: idx + 1,
      }))
    );
    injectStructuredData(schema);
  }, [cityName]);

  useEffect(() => {
    let result = cars;

    // Apply filters
    if (filters.brand !== "all") {
      result = result.filter((car) => car.brand === filters.brand);
    }
    if (filters.fuel !== "all") {
      result = result.filter((car) => car.fuel === filters.fuel);
    }
    if (filters.transmission !== "all") {
      result = result.filter((car) => car.transmission === filters.transmission);
    }
    result = result.filter((car) => car.price <= filters.priceMax);
    result = result.filter((car) => car.year >= filters.yearMin);
    result = result.filter((car) => car.kms <= filters.kmsMax);
    if (filters.owners > 0) {
      result = result.filter((car) => car.owners <= filters.owners);
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result = result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result = result.sort((a, b) => b.price - a.price);
        break;
      case "kms-low":
        result = result.sort((a, b) => a.kms - b.kms);
        break;
      case "year-new":
        result = result.sort((a, b) => b.year - a.year);
        break;
      default:
        // newest (default order from data)
        break;
    }

    setFilteredCars(result);
  }, [filters, sortBy, cars]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      brand: "all",
      fuel: "all",
      transmission: "all",
      priceMax: 5000000,
      yearMin: 2010,
      kmsMax: 200000,
      owners: 0,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Used Cars in {cityName}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore {filteredCars.length}+ verified used cars available in {cityName}
          </p>
        </div>
      </section>

      <AdSlot id="city_listing_top_banner" sizeMap={{ mobile: "320x50", desktop: "728x90" }} />

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:col-span-1">
              <UsedFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClearFilters}
                brands={allBrands}
              />
            </aside>

            {/* Listings Grid */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <p className="text-muted-foreground">{filteredCars.length} cars found</p>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Mobile Filters */}
                  <Sheet>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button variant="outline" className="flex-1 sm:flex-none">
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <UsedFilters
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onClear={handleClearFilters}
                        brands={allBrands}
                      />
                    </SheetContent>
                  </Sheet>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="kms-low">KMs: Low to High</SelectItem>
                      <SelectItem value="year-new">Year: Newest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <UsedCarCard key={car.id} {...car} />
                ))}
              </div>

              {filteredCars.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No cars found matching your criteria</p>
                  <Button onClick={handleClearFilters}>Clear Filters</Button>
                </div>
              )}

              {filteredCars.length > 0 && (
                <div className="mt-8 text-center">
                  <Button variant="outline" size="lg">
                    Load More
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsedCarsCity;
