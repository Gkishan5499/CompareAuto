import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/brands/FilterBar";
import ModelCard from "@/components/home/ModelCard";
import { getModelsByFuel, getNewModels, getUpcomingModels, getVariants } from "@/lib/data";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Battery, Leaf, Wind, Fuel as FuelIcon, Zap } from "lucide-react";

const FuelType = () => {
  const { type } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const fuelType = type?.charAt(0).toUpperCase() + type?.slice(1) || "";

  // Filter states
  const [selectedBodyType, setSelectedBodyType] = useState(searchParams.get("body") || "All");
  const [selectedTransmission, setSelectedTransmission] = useState(searchParams.get("transmission") || "All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(searchParams.get("price") || "all");
  const [filterChip, setFilterChip] = useState(searchParams.get("filter") || "all");

  const allModels = getModelsByFuel(fuelType);
  const newModels = getNewModels();
  const upcomingModels = getUpcomingModels();

  const filteredModels = useMemo(() => {
    let models = allModels;

    // Chip filter
    if (filterChip === "new") {
      models = models.filter((m) => newModels.some((n) => n.id === m.id));
    } else if (filterChip === "upcoming") {
      models = models.filter((m) => upcomingModels.some((u) => u.id === m.id));
    }

    // Body type filter
    if (selectedBodyType !== "All") {
      models = models.filter((m) => m.bodyType === selectedBodyType);
    }

    // Transmission filter (check variants)
    if (selectedTransmission !== "All") {
      models = models.filter((m) => {
        const variants = getVariants(m.id);
        return variants.some((v) => v.transmission === selectedTransmission);
      });
    }

    // Price range filter
    if (selectedPriceRange !== "all") {
      const [minStr, maxStr] = selectedPriceRange.split("-");
      const min = parseFloat(minStr) * 100000;
      const max = maxStr === "+" ? Infinity : parseFloat(maxStr) * 100000;
      
      models = models.filter((m) => {
        const minPrice = m.status === "upcoming"
          ? m.expectedPriceMin || 0
          : m.priceRange?.min || 0;
        if (max === Infinity) {
          return minPrice >= min;
        }
        return minPrice >= min && minPrice <= max;
      });
    }

    return models;
  }, [allModels, newModels, upcomingModels, filterChip, selectedBodyType, selectedTransmission, selectedPriceRange]);

  const fuelIcons: Record<string, any> = {
    EV: Battery,
    Hybrid: Leaf,
    CNG: Wind,
    Petrol: FuelIcon,
    Diesel: Zap,
  };

  const Icon = fuelIcons[fuelType] || FuelIcon;

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBodyType !== "All") params.set("body", selectedBodyType);
    if (selectedTransmission !== "All") params.set("transmission", selectedTransmission);
    if (selectedPriceRange !== "all") params.set("price", selectedPriceRange);
    if (filterChip !== "all") params.set("filter", filterChip);
    setSearchParams(params, { replace: true });
  }, [selectedBodyType, selectedTransmission, selectedPriceRange, filterChip, setSearchParams]);

  useEffect(() => {
    updateMetaTags({
      title: `${fuelType} Cars in India – Prices, Models & Specs | CompareAuto.in`,
      description: `Browse all ${fuelType} cars available in India. Compare prices, specifications, and features across brands.`,
      keywords: [`${fuelType} cars`, `${fuelType} vehicles`, `${fuelType} car prices`],
      canonical: `${window.location.origin}/fuel/${type}`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${fuelType} Cars in India`,
      itemListElement: filteredModels.map((model, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: `${model.brandName} ${model.name}`,
          url: `${window.location.origin}/${model.brandId}/${model.slug}`,
        },
      })),
    };
    injectStructuredData(structuredData);
  }, [fuelType, type, filteredModels]);

  const handleClearAll = () => {
    setSelectedBodyType("All");
    setSelectedTransmission("All");
    setSelectedPriceRange("all");
    setFilterChip("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-10 md:py-12 lg:py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 mb-6">
            <div className="p-3 md:p-4 rounded-xl bg-primary/10 flex-shrink-0">
              <Icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">{fuelType} Cars in India</h1>
              <p className="text-base md:text-lg text-muted-foreground">
                {allModels.length} models available
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
          <Button
            variant={filterChip === "all" ? "default" : "outline"}
            onClick={() => setFilterChip("all")}
            size="sm"
            className="text-xs md:text-sm"
          >
            All
          </Button>
          <Button
            variant={filterChip === "new" ? "default" : "outline"}
            onClick={() => setFilterChip("new")}
            size="sm"
            className="text-xs md:text-sm"
          >
            New
          </Button>
          <Button
            variant={filterChip === "upcoming" ? "default" : "outline"}
            onClick={() => setFilterChip("upcoming")}
            size="sm"
            className="text-xs md:text-sm"
          >
            Upcoming
          </Button>
        </div>

        {/* Filter Bar */}
        <FilterBar
          selectedBodyType={selectedBodyType}
          selectedFuel="All"
          selectedTransmission={selectedTransmission}
          selectedPriceRange={selectedPriceRange}
          onBodyTypeChange={setSelectedBodyType}
          onFuelChange={() => {}}
          onTransmissionChange={setSelectedTransmission}
          onPriceRangeChange={setSelectedPriceRange}
          onClearAll={handleClearAll}
          hideFuel
        />

        {/* Model Grid */}
        <section className="mt-6 md:mt-8">
          {filteredModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredModels.map((model) => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-16">
              <p className="text-base md:text-lg text-muted-foreground mb-4">
                No {fuelType} models found matching your filters.
              </p>
              <Button onClick={handleClearAll} size="lg">Clear all filters</Button>
            </div>
          )}
        </section>

        {/* Cross-link to Body Types */}
        <section className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-3">
            Prefer browsing by body type? See all{" "}
            <Link to="/body/suv" className="text-primary hover:underline font-medium">
              SUVs
            </Link>
            ,{" "}
            <Link to="/body/sedan" className="text-primary hover:underline font-medium">
              Sedans
            </Link>
            , or{" "}
            <Link to="/body/hatchback" className="text-primary hover:underline font-medium">
              Hatchbacks
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default FuelType;
