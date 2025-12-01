import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UsedCarCard } from "@/components/used/UsedCarCard";
import { UsedFilters } from "@/components/used/UsedFilters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { searchUsedCars, UsedCar } from "@/lib/data";
import { updateMetaTags } from "@/lib/seo";

const UsedCarsSearch = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const cityParam = searchParams.get("city") || "";
  const priceMaxParam = searchParams.get("priceMax") || "";

  const [filteredCars, setFilteredCars] = useState<UsedCar[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const allBrands = Array.from(new Set(filteredCars.map((car) => car.brand))).sort();
  const [filters, setFilters] = useState({
    brand: "all",
    fuel: "all",
    transmission: "all",
    priceMax: priceMaxParam ? parseInt(priceMaxParam) * 100000 : 5000000,
    yearMin: 2010,
    kmsMax: 200000,
    owners: 0,
  });

  useEffect(() => {
    const results = searchUsedCars(query, {
      city: cityParam,
      priceMax: filters.priceMax,
    });
    setFilteredCars(results);

    // SEO
    updateMetaTags({
      title: `Search Results for "${query}" – Used Cars | CompareAuto.in`,
      description: `Find used cars matching "${query}". Browse verified second-hand cars with detailed specifications and prices.`,
      keywords: [`used cars ${query}`, "search used cars", `${query} second hand`],
      ogImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    });
  }, [query, cityParam, filters.priceMax]);

  useEffect(() => {
    let result = [...filteredCars];

    // Apply additional filters
    if (filters.brand !== "all") {
      result = result.filter((car) => car.brand === filters.brand);
    }
    if (filters.fuel !== "all") {
      result = result.filter((car) => car.fuel === filters.fuel);
    }
    if (filters.transmission !== "all") {
      result = result.filter((car) => car.transmission === filters.transmission);
    }
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
    }

    setFilteredCars(result);
  }, [filters, sortBy]);

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Search Results {query && `for "${query}"`}
          </h1>
          <p className="text-lg text-muted-foreground">
            {filteredCars.length} cars found {cityParam && `in ${cityParam}`}
          </p>
        </div>
      </section>

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
                  <p className="text-muted-foreground mb-4">No cars found matching your search</p>
                  <Button onClick={handleClearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsedCarsSearch;
