import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useModels, useFilterOptions } from "@/lib/api-hooks";
import { updateMetaTags, injectStructuredData, generateItemListSchema } from "@/lib/seo";

const NewCars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allModels = [], isLoading: modelsLoading } = useModels();
  
  const [filters, setFilters] = useState({
    priceMin: 0,
    priceMax: 5000000,
    bodyType: searchParams.get("body") || "all",
    fuelType: searchParams.get("fuel") || "all",
    transmission: searchParams.get("transmission") || "all",
    seating: searchParams.get("seating") || "all",
  });
  
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popularity");
  
  const filteredModels = useMemo(() => {
    let result = [...allModels];

    // Filter by price
    result = result.filter((model) => {
      const modelPrice = model.status === "upcoming" 
        ? model.expectedPriceMin || 0 
        : model.priceRange?.min || 0;
      return modelPrice <= filters.priceMax && modelPrice >= filters.priceMin;
    });

    // Filter by body type
    if (filters.bodyType !== "all") {
      result = result.filter((model) => model.bodyType === filters.bodyType);
    }

    // Filter by fuel type
    if (filters.fuelType !== "all") {
      result = result.filter((model) => {
        const modelFuel = model.fuelTypes || model.fuelType;
        if (Array.isArray(modelFuel)) {
          return modelFuel.some(f => f.toLowerCase() === filters.fuelType.toLowerCase());
        }
        return modelFuel?.toLowerCase() === filters.fuelType.toLowerCase();
      });
    }

    // Filter by transmission
    if (filters.transmission !== "all") {
      result = result.filter((model) => {
        const modelTrans = model.transmissions || model.transmission;
        if (Array.isArray(modelTrans)) {
          return modelTrans.some(t => t.toLowerCase().includes(filters.transmission.toLowerCase()));
        }
        return modelTrans?.toLowerCase().includes(filters.transmission.toLowerCase());
      });
    }

    // Filter by seating
    if (filters.seating !== "all") {
      const seatCount = parseInt(filters.seating);
      result = result.filter((model) => model.seating === seatCount);
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => {
          const aPrice = a.status === "upcoming" ? a.expectedPriceMin || 0 : a.priceRange?.min || 0;
          const bPrice = b.status === "upcoming" ? b.expectedPriceMin || 0 : b.priceRange?.min || 0;
          return aPrice - bPrice;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          const aPrice = a.status === "upcoming" ? a.expectedPriceMin || 0 : a.priceRange?.min || 0;
          const bPrice = b.status === "upcoming" ? b.expectedPriceMin || 0 : b.priceRange?.min || 0;
          return bPrice - aPrice;
        });
        break;
      case "popularity":
      default:
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [allModels, filters, sortBy]);

  useEffect(() => {
    updateMetaTags({
      title: "New Cars in India – Prices, Best Picks & Filters | CompareAuto.in",
      description: "Explore all new cars in India. Filter by budget, body type, fuel, and more. Compare prices, specs, and find your perfect car.",
      keywords: ["new cars India", "car prices", "buy new car", "car comparison", "best cars 2024"],
      ogImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    });

    if (filteredModels.length > 0) {
      const schema = generateItemListSchema(
        filteredModels.slice(0, 20).map((model: any, idx: number) => ({
          name: `${model.brandName || model.brandId?.name} ${model.name}`,
          url: `https://compareauto.in/${(model.brandName || model.brandId?.name || "").toLowerCase().replace(/\s+/g, "-")}/${model.slug}`,
          position: idx + 1,
        }))
      );
      injectStructuredData(schema);
    }
  }, [filteredModels]);

  useEffect(() => {
    // Update URL
    const params = new URLSearchParams();
    if (filters.bodyType !== "all") params.set("body", filters.bodyType);
    if (filters.fuelType !== "all") params.set("fuel", filters.fuelType);
    if (sortBy !== "popularity") params.set("sort", sortBy);
    setSearchParams(params);
  }, [filters, sortBy, setSearchParams]);

  const clearFilters = () => {
    setFilters({ priceMin: 0, priceMax: 5000000, bodyType: "all", fuelType: "all", transmission: "all", seating: "all" });
    setSortBy("popularity");
  };

  const bestOfShortcuts = [
    { label: "Under ₹10L", action: () => setFilters({ ...filters, priceMax: 1000000 }) },
    { label: "Best SUVs", action: () => setFilters({ ...filters, bodyType: "SUV" }) },
    { label: "Best Petrol Cars", action: () => setFilters({ ...filters, fuelType: "Petrol" }) },
    { label: "City-friendly", action: () => setFilters({ ...filters, bodyType: "Hatchback" }) },
  ];

  const FilterContent = () => (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Budget (Max): ₹{(filters.priceMax / 100000).toFixed(1)}L</Label>
        <Slider
          value={[filters.priceMax]}
          onValueChange={(val) => setFilters({ ...filters, priceMax: val[0] })}
          max={5000000}
          min={100000}
          step={100000}
        />
      </div>

      <div className="space-y-2">
        <Label>Body Type</Label>
        <Select value={filters.bodyType} onValueChange={(val) => setFilters({ ...filters, bodyType: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Hatchback">Hatchback</SelectItem>
            <SelectItem value="Sedan">Sedan</SelectItem>
            <SelectItem value="SUV">SUV</SelectItem>
            <SelectItem value="MUV">MUV</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fuel Type</Label>
        <Select value={filters.fuelType} onValueChange={(val) => setFilters({ ...filters, fuelType: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Fuel Types</SelectItem>
            <SelectItem value="Petrol">Petrol</SelectItem>
            <SelectItem value="Diesel">Diesel</SelectItem>
            <SelectItem value="CNG">CNG</SelectItem>
            <SelectItem value="Hybrid">Hybrid</SelectItem>
            <SelectItem value="Electric">Electric</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Transmission</Label>
        <Select value={filters.transmission} onValueChange={(val) => setFilters({ ...filters, transmission: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Transmission</SelectItem>
            <SelectItem value="Manual">Manual</SelectItem>
            <SelectItem value="Automatic">Automatic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Seating</Label>
        <Select value={filters.seating} onValueChange={(val) => setFilters({ ...filters, seating: val })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-background z-50">
            <SelectItem value="all">All Seating</SelectItem>
            <SelectItem value="2">2 Seater</SelectItem>
            <SelectItem value="5">5 Seater</SelectItem>
            <SelectItem value="7">7 Seater</SelectItem>
            <SelectItem value="8">8+ Seater</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 md:py-12 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">New Cars in India</h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            Explore {allModels.length}+ new car models. Filter by budget, body type, and features to find your perfect match.
          </p>
        </div>
      </section>

      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Best Of Shortcuts */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Best Of</h2>
            <div className="flex flex-wrap gap-2">
              {bestOfShortcuts.map((shortcut, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
                  onClick={shortcut.action}
                >
                  {shortcut.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Filters */}
            <aside className="hidden lg:block lg:col-span-1">
              <Card>
                <FilterContent />
              </Card>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <p className="text-muted-foreground">{filteredModels.length} cars found</p>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Sheet>
                    <SheetTrigger asChild className="lg:hidden">
                      <Button variant="outline" className="flex-1 sm:flex-none">
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                      <FilterContent />
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="price_asc">Price: Low to High</SelectItem>
                      <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {modelsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredModels.map((model: any) => {
                    const brandName = model.brandName || model.brandId?.name || "";
                    const brandSlug = brandName.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <Link key={model.id} to={`/${brandSlug}/${model.slug}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] h-full flex flex-col">
                          <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                            {model.image ? (
                              <img
                                src={model.image}
                                alt={`${brandName} ${model.name}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl font-bold text-muted-foreground">
                                  {brandName.charAt(0)}
                                </span>
                              </div>
                            )}
                            <Badge className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-foreground shadow-sm">
                              {model.bodyType}
                            </Badge>
                          </div>
                          <CardContent className="p-4 md:p-5 flex-1 flex flex-col">
                            <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 min-h-[3rem]">
                              {brandName} {model.name}
                            </h3>
                            <div className="mb-2">
                              <p className="text-xl md:text-2xl font-bold text-primary">
                                ₹{((model.status === "upcoming" 
                                  ? model.expectedPriceMin || 0 
                                  : model.priceRange?.min || 0) / 100000).toFixed(2)}L
                                {model.priceRange?.max && (
                                  <> - ₹{((model.status === "upcoming" 
                                    ? model.expectedPriceMax || 0 
                                    : model.priceRange?.max || 0) / 100000).toFixed(2)}L</>
                                )}
                              </p>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground mt-auto">{model.variantCount || 0} Variants</p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}

              {filteredModels.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No cars match your filters</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewCars;
