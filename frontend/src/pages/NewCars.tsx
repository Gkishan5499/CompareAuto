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
import { useModels, useVariants } from "@/lib/api-hooks";
import { useCity } from "@/contexts/CityContext";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import { calculatePriceBreakdown } from "@/lib/priceCalculations";
import { updateMetaTags, injectStructuredData, generateItemListSchema } from "@/lib/seo";

const NewCars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allModels = [], isLoading: modelsLoading } = useModels();
  const { data: allVariants = [], isLoading: variantsLoading } = useVariants("");
  const { city } = useCity();
  const selectedCity = city || "Delhi";

  const parseNumberParam = (value: string | null, fallback: number) => {
    const parsed = value ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  
  const [filters, setFilters] = useState({
    search: searchParams.get("q") || "",
    priceMin: parseNumberParam(searchParams.get("priceMin"), 0),
    priceMax: parseNumberParam(searchParams.get("priceMax"), 5000000),
    bodyType: searchParams.get("body") || "all",
    fuelType: searchParams.get("fuel") || "all",
    transmission: searchParams.get("transmission") || "all",
    seating: searchParams.get("seating") || "all",
  });
  
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popularity");
  
  const modelLookup = useMemo(() => {
    const map = new Map<string, any>();
    allModels.forEach((model: any) => {
      [model.id, model._id, model.slug].filter(Boolean).forEach((key) => {
        map.set(String(key), model);
      });
    });
    return map;
  }, [allModels]);

  const normalizedVariants = useMemo(() => {
    return allVariants
      .map((variant: any) => {
        const key = String(variant.modelId || variant.model || variant.modelSlug || "");
        const model = modelLookup.get(key);
        return model ? { variant, model } : null;
      })
      .filter(Boolean) as Array<{ variant: any; model: any }>;
  }, [allVariants, modelLookup]);

  const normalizeBodyType = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

  const matchesBodyType = (modelBodyType: string | undefined, selectedBodyType: string) => {
    if (!modelBodyType) return false;
    const modelType = normalizeBodyType(modelBodyType);
    const selectedType = normalizeBodyType(selectedBodyType);
    if (selectedType === "suv") return modelType.includes("suv");
    if (selectedType === "muv") return modelType.includes("muv") || modelType.includes("mpv");
    return modelType === selectedType;
  };

  const filteredVariants = useMemo(() => {
    let result = [...normalizedVariants];

    // Filter by price (variant ex-showroom)
    result = result.filter(({ variant }) => {
      const price = parseINRToRupees(variant.price ?? variant.exShowroomPrice);
      if (!price) return filters.priceMin === 0;
      return price >= filters.priceMin && price <= filters.priceMax;
    });

    if (filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      result = result.filter(({ variant, model }) => {
        const brandName = model.brandName || model.brandId?.name || "";
        const haystack = `${brandName} ${model.name} ${model.slug} ${variant.name || ""} ${variant.slug || ""}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    // Filter by body type
    if (filters.bodyType !== "all") {
      result = result.filter(({ model }) => matchesBodyType(model.bodyType, filters.bodyType));
    }

    // Filter by fuel type
    if (filters.fuelType !== "all") {
      const fuelQuery = filters.fuelType.toLowerCase();
      result = result.filter(({ variant, model }) => {
        const modelFuel = model.fuelTypes || model.fuelType;
        const variantFuel = String(variant.fuelType || "").toLowerCase();
        if (variantFuel) return variantFuel === fuelQuery;
        if (Array.isArray(modelFuel)) return modelFuel.some((f: string) => f.toLowerCase() === fuelQuery);
        return String(modelFuel || "").toLowerCase() === fuelQuery;
      });
    }

    // Filter by transmission
    if (filters.transmission !== "all") {
      const transmissionQuery = filters.transmission.toLowerCase();
      result = result.filter(({ variant }) =>
        String(variant.transmission || "").toLowerCase().includes(transmissionQuery)
      );
    }

    // Filter by seating
    if (filters.seating !== "all") {
      const seatCount = parseInt(filters.seating, 10);
      result = result.filter(({ variant, model }) => {
        const seats = Number(variant.seating ?? model.seating);
        return Number.isFinite(seats) && seats === seatCount;
      });
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => {
          const priceA = parseINRToRupees(a.variant.price ?? a.variant.exShowroomPrice) || 0;
          const priceB = parseINRToRupees(b.variant.price ?? b.variant.exShowroomPrice) || 0;
          return priceA - priceB;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          const priceA = parseINRToRupees(a.variant.price ?? a.variant.exShowroomPrice) || 0;
          const priceB = parseINRToRupees(b.variant.price ?? b.variant.exShowroomPrice) || 0;
          return priceB - priceA;
        });
        break;
      case "popularity":
      default:
        result.sort((a, b) => (b.model.rating || 0) - (a.model.rating || 0));
        break;
    }

    return result;
  }, [normalizedVariants, filters, sortBy]);

  useEffect(() => {
    updateMetaTags({
      title: "New Cars in India – Prices, Best Picks & Filters | CompareAuto.in",
      description: "Explore all new cars in India. Filter by budget, body type, fuel, and more. Compare prices, specs, and find your perfect car.",
      keywords: ["new cars India", "car prices", "buy new car", "car comparison", "best cars 2024"],
      ogImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200",
    });

    if (filteredVariants.length > 0) {
      const schema = generateItemListSchema(
        filteredVariants.slice(0, 20).map(({ model, variant }, idx: number) => ({
          name: `${model.brandName || model.brandId?.name} ${model.name} ${variant.name || ""}`.trim(),
          url: `https://compareauto.in/${(model.brandName || model.brandId?.name || "").toLowerCase().replace(/\s+/g, "-")}/${model.slug}/${variant.slug}`,
          position: idx + 1,
        }))
      );
      injectStructuredData(schema);
    }
  }, [filteredVariants]);

  useEffect(() => {
    // Update URL
    const params = new URLSearchParams();
    if (filters.search.trim()) params.set("q", filters.search.trim());
    if (filters.priceMin > 0) params.set("priceMin", String(filters.priceMin));
    if (filters.priceMax !== 5000000) params.set("priceMax", String(filters.priceMax));
    if (filters.bodyType !== "all") params.set("body", filters.bodyType);
    if (filters.fuelType !== "all") params.set("fuel", filters.fuelType);
    if (filters.transmission !== "all") params.set("transmission", filters.transmission);
    if (filters.seating !== "all") params.set("seating", filters.seating);
    if (sortBy !== "popularity") params.set("sort", sortBy);
    setSearchParams(params, { replace: true });
  }, [filters, sortBy, setSearchParams]);

  const clearFilters = () => {
    setFilters({ search: "", priceMin: 0, priceMax: 5000000, bodyType: "all", fuelType: "all", transmission: "all", seating: "all" });
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
            Explore {allVariants.length}+ new car variants. Filter by budget, body type, and features to find your perfect match.
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
                <p className="text-muted-foreground">{filteredVariants.length} variants found</p>
                
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

              {modelsLoading || variantsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-muted animate-pulse rounded-lg"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredVariants.map(({ model, variant }) => {
                    const brandName = model.brandName || model.brandId?.name || "";
                    const brandSlug = brandName.toLowerCase().replace(/\s+/g, "-");
                    const rawPrice = parseINRToRupees(variant.exShowroomPrice ?? variant.price);
                    const onRoadPrice = rawPrice
                      ? calculatePriceBreakdown(rawPrice, selectedCity).onRoadPrice
                      : 0;
                    const cardImage = variant.image || model.image;
                    const fuelLabel = variant.fuelType || model.fuelType || model.fuelTypes?.[0] || "N/A";
                    return (
                      <Link key={variant.id || variant._id || variant.slug} to={`/${brandSlug}/${model.slug}/${variant.slug}`}>
                        <Card className="overflow-hidden hover:shadow-lg transition-all hover:scale-[1.02] h-full flex flex-col">
                          <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                            {cardImage ? (
                              <img
                                src={cardImage}
                                alt={`${brandName} ${model.name} ${variant.name || ""}`.trim()}
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
                            {/* <Badge className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm text-foreground shadow-sm">
                              {fuelLabel}
                            </Badge> */}
                          </div>
                          <CardContent className="p-4 md:p-5 flex-1 flex flex-col">
                            <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 min-h-[3rem]">
                              {brandName} {model.name} {variant.name || ""}
                            </h3>
                            <div className="mb-2">
                              <p className="text-xl md:text-2xl font-bold text-primary">
                                {onRoadPrice > 0 ? formatINR(onRoadPrice, true) : "TBA"}
                              </p>
                              <p className="text-xs text-muted-foreground">On-road price in {selectedCity}</p>
                            </div>
                            <div className="mt-auto flex items-center justify-between text-xs md:text-sm text-muted-foreground">
                              <span>{variant.transmission || "Transmission N/A"}</span>
                              <span>{variant.fuelType || "Fuel N/A"}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}

              {filteredVariants.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No variants match your filters</p>
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
