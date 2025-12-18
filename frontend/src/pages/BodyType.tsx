import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, ChevronDown, IndianRupee } from "lucide-react";
import { getModelsByBody, getAllModels, sortByMinPriceAsc, Model, getVariants } from "@/lib/data";
import { updateMetaTags, injectStructuredData } from "@/lib/seo";
import ModelCard from "@/components/home/ModelCard";
import FilterBar from "@/components/brands/FilterBar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdSlot from "@/components/ads/AdSlot";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getBodyTypeDefinition, normalizeBodyType } from "@/lib/bodyTypes";

const BodyType = () => {
  const { type } = useParams<{ type: string }>();
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  
  // Filter states
  const [selectedBodyType, setSelectedBodyType] = useState("All");
  const [selectedFuel, setSelectedFuel] = useState("All");
  const [selectedTransmission, setSelectedTransmission] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");

  // Canonicalize slug and friendly display
  const canonicalSlug = useMemo(() => normalizeBodyType(type || ""), [type]);
  const bodyTypeDisplay = useMemo(() => {
    const def = type ? getBodyTypeDefinition(type) : null;
    if (def?.label) return def.label;
    if (!type) return "";
    return type.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }, [type]);

  const matchesBodyType = (modelBody: string, slug: string | null) => {
    if (!slug) return false;
    const mb = (modelBody || "").toLowerCase();
    if (slug === "suv") return mb.includes("suv");
    if (slug === "muv") return mb.includes("muv") || mb.includes("mpv");
    if (slug === "hatchback") return mb.includes("hatch");
    if (slug === "sedan") return mb.includes("sedan");
    return normalizeBodyType(modelBody) === slug;
  };

  // Apply filters whenever they change
  useEffect(() => {
    if (!type) return;

    // Flexible body-type matching to include sub-categories (e.g., micro/mini SUVs)
    let models = canonicalSlug
      ? getAllModels().filter((m) => matchesBodyType(m.bodyType, canonicalSlug))
      : getModelsByBody(type);

    // Apply fuel filter (check variants)
    if (selectedFuel !== "All") {
      models = models.filter((model) => {
        const variants = getVariants(model.id);
        return variants.some((v) => v.fuelType === selectedFuel);
      });
    }

    // Apply transmission filter (check variants)
    if (selectedTransmission !== "All") {
      models = models.filter((model) => {
        const variants = getVariants(model.id);
        return variants.some((v) => v.transmission === selectedTransmission);
      });
    }

    // Apply price filter
    if (selectedPriceRange !== "all") {
      const [minStr, maxStr] = selectedPriceRange.split("-");
      const min = parseFloat(minStr) * 100000;
      const max = maxStr === "+" ? Infinity : parseFloat(maxStr) * 100000;
      
      models = models.filter((model) => {
        const modelMinPrice = model.status === "upcoming"
          ? model.expectedPriceMin || 0
          : model.priceRange?.min || 0;
        
        if (max === Infinity) {
          return modelMinPrice >= min;
        }
        return modelMinPrice >= min && modelMinPrice <= max;
      });
    }

    // Sort
    const sorted = sortOrder === "asc" ? sortByMinPriceAsc(models) : sortByMinPriceAsc(models).reverse();
    setFilteredModels(sorted);
  }, [type, canonicalSlug, selectedFuel, selectedTransmission, selectedPriceRange, sortOrder]);

  useEffect(() => {
    if (!type) return;

    // SEO
    updateMetaTags({
      title: `${bodyTypeDisplay} Cars in India – Prices & Models | CompareAuto.in`,
      description: `Explore ${bodyTypeDisplay} cars in India. Compare prices, specs, features, and variants across brands. Find the best ${bodyTypeDisplay.toLowerCase()} for your needs.`,
      keywords: [
        `${bodyTypeDisplay} cars`,
        `${bodyTypeDisplay} prices`,
        `best ${bodyTypeDisplay}`,
        `${bodyTypeDisplay} comparison`,
        `${bodyTypeDisplay} india`,
      ],
      canonical: `https://compareauto.in/body/${type}`,
    });

    // ItemList structured data
    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${bodyTypeDisplay} Cars in India`,
      "itemListElement": filteredModels.slice(0, 50).map((model, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": `${model.brandName} ${model.name}`,
          "url": `https://compareauto.in/${model.slug}`,
        },
      })),
    };
    injectStructuredData(itemListSchema);
  }, [type, bodyTypeDisplay, filteredModels]);

  const handleClearAll = () => {
    setSelectedBodyType("All");
    setSelectedFuel("All");
    setSelectedTransmission("All");
    setSelectedPriceRange("all");
  };

  const handleSortChange = (value: string) => {
    const newOrder = value as "asc" | "desc";
    setSortOrder(newOrder);
  };

  const toggleModelExpanded = (modelId: string) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelId)) {
      newExpanded.delete(modelId);
    } else {
      newExpanded.add(modelId);
    }
    setExpandedModels(newExpanded);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto ">
      {/* Breadcrumbs */}
      <section className="py-4 bg-muted/30">
        <div className="container mx-auto   px-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/body">Body Types</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{bodyTypeDisplay}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Header */}
      <section className="py-10 md:py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto  px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <span className="text-sm font-medium text-primary">{filteredModels.length} {bodyTypeDisplay} {filteredModels.length === 1 ? "Model" : "Models"}</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">{bodyTypeDisplay} Cars in India</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Explore all {bodyTypeDisplay.toLowerCase()} models available in India. 
              Compare prices, specifications, and features to find your perfect match.
            </p>
          </div>
        </div>
      </section>

      {/* Ad Slot: Body Type Top Leaderboard */}
      <section className="py-4 bg-muted/30">
        <div className="container mx-auto px-4">
          <AdSlot id="bodytype_top_leaderboard" />
        </div>
      </section>

      {/* Filters & Sort */}
      <section className="py-6 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            <FilterBar
              selectedBodyType={selectedBodyType}
              selectedFuel={selectedFuel}
              selectedTransmission={selectedTransmission}
              selectedPriceRange={selectedPriceRange}
              onBodyTypeChange={setSelectedBodyType}
              onFuelChange={setSelectedFuel}
              onTransmissionChange={setSelectedTransmission}
              onPriceRangeChange={setSelectedPriceRange}
              onClearAll={handleClearAll}
              hideFuel={false}
              hideBodyType
            />
            
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Price: Low to High</SelectItem>
                  <SelectItem value="desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Models Grid */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 md:mb-6 flex items-center justify-between">
            <p className="text-sm md:text-base text-muted-foreground">
              Showing {filteredModels.length} {bodyTypeDisplay.toLowerCase()} {filteredModels.length === 1 ? "model" : "models"}
            </p>
          </div>

          {filteredModels.length > 0 ? (
            <div className="space-y-4">
              {/* Grid View Option */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
                {filteredModels.map((model) => (
                  <ModelCard key={model.id} model={model} />
                ))}
              </div>

              {/* Detailed List View with Variants */}
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-2xl font-bold mb-6">Variants by Model</h3>
                <div className="space-y-3">
                  {filteredModels.map((model) => {
                    const variants = getVariants(model.id);
                    const isExpanded = expandedModels.has(model.id);
                    
                    return (
                      <Collapsible key={model.id} open={isExpanded} onOpenChange={() => toggleModelExpanded(model.id)}>
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4 flex-1">
                              <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              <div className="flex-1 text-left">
                                <h4 className="font-semibold text-base">{model.brandName} {model.name}</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {variants.length} variant{variants.length !== 1 ? "s" : ""} • 
                                  {model.priceRange && ` ₹${(model.priceRange.min / 100000).toFixed(2)}L - ₹${(model.priceRange.max / 100000).toFixed(2)}L`}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">{model.bodyType}</Badge>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 ml-4 pl-4 border-l-2 border-primary/30 space-y-2">
                            {variants.length > 0 ? (
                              variants.map((variant, idx) => (
                                <Link key={variant.id} to={`/${model.slug}/${variant.slug}`}>
                                  <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer border border-muted">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-sm">{variant.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {variant.fuelType} • {variant.transmission} • {variant.mileage} km/l
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold flex items-center gap-1">
                                          <IndianRupee className="h-3 w-3" />
                                          {(variant.price / 100000).toFixed(2)}L
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground p-3">No variants available</p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 md:py-16">
              <p className="text-base md:text-lg text-muted-foreground mb-4">
                No {bodyTypeDisplay.toLowerCase()} models found with the selected filters.
              </p>
              <Button onClick={handleClearAll} size="lg">Clear Filters</Button>
            </div>
          )}
        </div>
      </section>

      {/* Related Links */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold mb-4">Explore Other Body Types</h2>
            <div className="flex flex-wrap gap-2">
              {["hatchback", "sedan", "suv", "muv"].map((bt) => (
                <Link
                  key={bt}
                  to={`/body/${bt}`}
                  className="text-sm px-4 py-2 rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors border"
                >
                  {bt.charAt(0).toUpperCase() + bt.slice(1)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BodyType;
