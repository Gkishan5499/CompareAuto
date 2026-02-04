import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import FilterBar from "@/components/brands/FilterBar";
import ModelCard from "@/components/home/ModelCard";
import { useBrandBySlug, useModelsByBrand, useBrands } from "@/lib/api-hooks";
import { modelsApi, variantsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import { useCity } from "@/contexts/CityContext";
import { getStateFromCity } from "@/lib/priceCalculations";
import AdSlot from "@/components/ads/AdSlot";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import { 
  CarFront, Layers, Banknote, ArrowRight, 
  SortAsc, LayoutGrid, List as ListIcon, 
  Info, Star, TrendingUp, Calendar 
} from "lucide-react";
import { cn } from "@/lib/utils";

const BrandModels = () => {
  const { brand } = useParams<{ brand: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: brandData, isLoading: brandLoading } = useBrandBySlug(brand || "");
  const { data: allModels = [], isLoading: modelsLoading } = useModelsByBrand(brand || "");
  const { data: allBrands = [] } = useBrands();
  const { city } = useCity();
  const brandLogo = getBrandLogo(brandData?.name);
  const brandInitial = getBrandInitial(brandData?.name);

  const [sort, setSort] = useState<string>(searchParams.get("sort") || "popular");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [spotlightOnRoadPrice, setSpotlightOnRoadPrice] = useState<{ min: number; max: number } | null>(null);
  const [spotlightVariantPriceRange, setSpotlightVariantPriceRange] = useState<{ min: number; max: number } | null>(null);
  
  // API Queries (New/Upcoming/Variants)
  const { data: newModels = [] } = useQuery({
    queryKey: ["models", "new", brand],
    queryFn: async () => {
      const allNew = await modelsApi.getNew();
      return allNew.filter((m: any) => m.brandId === brandData?.id);
    },
    enabled: !!brandData?.id,
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: upcomingModels = [] } = useQuery({
    queryKey: ["models", "upcoming", brand],
    queryFn: async () => {
      const allUpcoming = await modelsApi.getUpcoming();
      return allUpcoming.filter((m: any) => m.brandId === brandData?.id);
    },
    enabled: !!brandData?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allVariants = [] } = useQuery({
    queryKey: ["variants", "brand", brand, allModels.map((m: any) => m.id).join(",")],
    queryFn: async () => {
      if (!allModels.length) return [];
      const variantPromises = allModels.map((model: any) => 
        variantsApi.getByModel(model.id).catch(() => [])
      );
      const variantArrays = await Promise.all(variantPromises);
      return variantArrays.flat();
    },
    enabled: !!brand && allModels.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  
  // Computed Stats
  const variantsCount = allVariants ? allVariants.length : 0;
  const modelsCount = allModels ? allModels.length : 0;
  const startingPrice = useMemo(() => {
    if (!allModels || allModels.length === 0) return null;
    let min = Infinity;
    for (const m of allModels) {
      const p = m.status === "upcoming" ? m.expectedPriceMin || 0 : m.priceRange?.min || 0;
      if (p > 0 && p < min) min = p;
    }
    return min === Infinity ? null : min;
  }, [allModels]);

  // Filters
  const [selectedBodyType, setSelectedBodyType] = useState(searchParams.get("body") || "All");
  const [selectedFuel, setSelectedFuel] = useState(searchParams.get("fuel") || "All");
  const [selectedTransmission, setSelectedTransmission] = useState(searchParams.get("transmission") || "All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(searchParams.get("price") || "all");

  // Filter Logic
  const filteredModels = useMemo(() => {
    return allModels.filter((model) => {
      if (selectedBodyType !== "All" && model.bodyType !== selectedBodyType) return false;

      if (selectedFuel !== "All") {
        const modelVariants = allVariants.filter((v: any) => v.modelId === model.id);
        const hasFuel = modelVariants.some((v: any) => v.fuelType === selectedFuel);
        if (!hasFuel) return false;
      }

      if (selectedTransmission !== "All") {
        const modelVariants = allVariants.filter((v: any) => v.modelId === model.id);
        const hasTrans = modelVariants.some((v: any) => v.transmission === selectedTransmission);
        if (!hasTrans) return false;
      }

      if (selectedPriceRange !== "all") {
        const [min, max] = selectedPriceRange.split("-").map(p => {
          if (p === "+") return Infinity;
          return parseFloat(p) * 100000;
        });
        const modelMinPrice = model.status === "upcoming" ? model.expectedPriceMin || 0 : model.priceRange?.min || 0;
        if (max === Infinity) {
          if (modelMinPrice < min) return false;
        } else {
          if (modelMinPrice < min || modelMinPrice > max) return false;
        }
      }
      return true;
    });
  }, [allModels, allVariants, selectedBodyType, selectedFuel, selectedTransmission, selectedPriceRange]);

  const spotlightModel = useMemo(() => {
    const modelsToUse = filteredModels.length > 0 ? filteredModels : allModels;
    
    // Try to find a non-upcoming model with valid price
    let selectedModel = modelsToUse.find((m: any) => m.status !== "upcoming" && m.priceRange?.min > 0);
    
    // If not found, look for one with variants that have prices
    if (!selectedModel) {
      selectedModel = modelsToUse.find((m: any) => {
        if (m.status === "upcoming") return false;
        const modelVariants = allVariants.filter((v: any) => v.modelId === m.id);
        return modelVariants.some((v: any) => v.price && parseINRToRupees(v.price) > 0);
      });
    }
    
    // Fallback to first non-upcoming model
    if (!selectedModel) {
      selectedModel = modelsToUse.find((m: any) => m.status !== "upcoming");
    }
    
    // Last resort: return first model
    return selectedModel || modelsToUse[0];
  }, [filteredModels, allModels, allVariants]);
  const relatedBrands = allBrands.filter((b: any) => b.slug !== brand).slice(0, 6);

  // URL Updates
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedBodyType !== "All") params.set("body", selectedBodyType);
    if (selectedFuel !== "All") params.set("fuel", selectedFuel);
    if (selectedTransmission !== "All") params.set("transmission", selectedTransmission);
    if (selectedPriceRange !== "all") params.set("price", selectedPriceRange);
    if (sort && sort !== "popular") params.set("sort", sort);
    setSearchParams(params, { replace: true });
  }, [selectedBodyType, selectedFuel, selectedTransmission, selectedPriceRange, sort, setSearchParams]);

  // Sorting
  const sortedModels = useMemo(() => {
    if (!filteredModels) return [];
    const arr = [...filteredModels];
    if (sort === "price_low") {
      arr.sort((a: any, b: any) => (a.priceRange?.min || 0) - (b.priceRange?.min || 0));
    } else if (sort === "price_high") {
      arr.sort((a: any, b: any) => (b.priceRange?.min || 0) - (a.priceRange?.min || 0));
    } else if (sort === "newest") {
      arr.sort((a: any, b: any) => (new Date(b.createdAt || b.launchedAt || 0).getTime() || 0) - (new Date(a.createdAt || a.launchedAt || 0).getTime() || 0));
    }
    return arr;
  }, [filteredModels, sort]);

  // SEO & Structured Data (omitted detailed implementation for brevity, keeping hook calls)
  useEffect(() => {
    if (brandData) {
      updateMetaTags({
        title: `${brandData.name} Cars – Prices, Models & Variants`,
        description: `Explore ${brandData.name} cars in India.`,
        keywords: [`${brandData.name} cars`, `${brandData.name} price`],
        canonical: `${window.location.origin}/${brand}`,
        ogImage: DEFAULT_OG_IMAGE,
      });
      // ... structured data logic
    }
  }, [brandData, brand, filteredModels]);

  // Fetch variant prices for spotlight model
  useEffect(() => {
    const fetchSpotlightVariantPrices = async () => {
      if (!spotlightModel || spotlightModel.status === "upcoming") {
        setSpotlightVariantPriceRange(null);
        return;
      }

      try {
        const variants = await variantsApi.getByModel(spotlightModel.id);
        
        if (variants && variants.length > 0) {
          const prices = variants
            .map((v: any) => parseINRToRupees(v?.price))
            .filter((p) => p && p > 0) as number[];
          
          if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            setSpotlightVariantPriceRange({ min, max });
          } else {
            setSpotlightVariantPriceRange(null);
          }
        } else {
          setSpotlightVariantPriceRange(null);
        }
      } catch (error) {
        // Fallback to model price range
        if (spotlightModel.priceRange) {
          setSpotlightVariantPriceRange(spotlightModel.priceRange);
        }
      }
    };

    fetchSpotlightVariantPrices();
  }, [spotlightModel]);

  // Calculate on-road price for spotlight model
  useEffect(() => {
    const calculateSpotlightOnRoadPrice = async () => {
      if (!spotlightModel || spotlightModel.status === "upcoming") {
        setSpotlightOnRoadPrice(null);
        return;
      }

      const minExShowroom = spotlightVariantPriceRange?.min || spotlightModel.priceRange?.min || 0;
      const maxExShowroom = spotlightVariantPriceRange?.max || spotlightModel.priceRange?.max || 0;

      if (minExShowroom === 0) {
        setSpotlightOnRoadPrice(null);
        return;
      }

      try {
        const state = getStateFromCity(city);

        // Calculate min on-road price
        const minResp = await fetch(`/api/pricing/calc`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exShowroomPrice: minExShowroom, state }),
        });

        let minOnRoad = minExShowroom;
        if (minResp.ok) {
          const minData = await minResp.json();
          minOnRoad = minData.breakdown.onRoadPrice;
        }

        // Calculate max on-road price if different from min
        let maxOnRoad = minOnRoad;
        if (maxExShowroom > 0 && maxExShowroom !== minExShowroom) {
          const maxResp = await fetch(`/api/pricing/calc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exShowroomPrice: maxExShowroom, state }),
          });

          if (maxResp.ok) {
            const maxData = await maxResp.json();
            maxOnRoad = maxData.breakdown.onRoadPrice;
          }
        }

        setSpotlightOnRoadPrice({ min: minOnRoad, max: maxOnRoad });
      } catch (error) {
        setSpotlightOnRoadPrice(null);
      }
    };

    calculateSpotlightOnRoadPrice();
  }, [spotlightModel, spotlightVariantPriceRange, city]);

  const handleClearAll = () => {
    setSelectedBodyType("All");
    setSelectedFuel("All");
    setSelectedTransmission("All");
    setSelectedPriceRange("all");
  };

  if (brandLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!brandData) {
    return <div className="min-h-screen flex items-center justify-center">Brand Not Found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pb-20">
      
      {/* 1) BREADCRUMBS STRIP */}
      <div className="bg-white dark:bg-card border-b">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Brands", href: "/brands" },
              { label: brandData.name },
            ]}
          />
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-10">
        
        {/* 2) BRAND PROFILE CARD */}
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-sm border overflow-hidden p-6 md:p-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full -mr-16 -mt-16" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Logo Box */}
                <div className="w-28 h-28 bg-white dark:bg-black rounded-2xl shadow-md border flex items-center justify-center p-4">
                    {brandLogo ? (
                        <img src={brandLogo} alt={brandData.name} className="w-full h-full object-contain" />
                    ) : (
                        <span className="text-4xl font-bold">{brandInitial}</span>
                    )}
                </div>

                {/* Text Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        {brandData.name} Cars
                    </h1>
                    <p className="text-muted-foreground max-w-2xl leading-relaxed">
                        Discover the complete {brandData.name} lineup. From efficient city commuters to premium SUVs. 
                        Compare {modelsCount} models and {variantsCount} variants to find your perfect match.
                    </p>
                    
                    {/* Quick Stats Pills */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                        <Badge variant="secondary" className="px-3 py-1.5 h-auto text-sm gap-2">
                            <CarFront className="w-4 h-4 text-primary" />
                            {modelsCount} Models
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1.5 h-auto text-sm gap-2">
                          <Layers className="w-4 h-4 text-primary" />
                            {variantsCount} Variants
                        </Badge>
                        {startingPrice !== null && (
                            <Badge variant="secondary" className="px-3 py-1.5 h-auto text-sm gap-2">
                                <Banknote className="w-4 h-4 text-green-600" />
                                Starts ₹{formatINR(startingPrice, true)}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col gap-2 min-w-[160px]">
                    <Button className="w-full">Find a Dealer</Button>
                    <Button variant="outline" className="w-full">Book Test Drive</Button>
                </div>
            </div>
        </div>

        {/* 3) FILTERS & TOOLBAR */}
        <section>
            <div className="mb-6">
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
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                    {sortedModels.length > 0 ? "All Models" : "No Models Found"}
                    <Badge variant="outline" className="ml-1">{sortedModels.length}</Badge>
                 </h2>

                 <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border rounded-md px-3 py-1.5">
                        <SortAsc className="w-4 h-4 text-muted-foreground" />
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            className="bg-transparent text-sm font-medium outline-none cursor-pointer"
                        >
                            <option value="popular">Popularity</option>
                            <option value="price_low">Price: Low to High</option>
                            <option value="price_high">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-md">
                        <button
                            onClick={() => setView("grid")}
                            className={cn(
                                "p-1.5 rounded transition-all",
                                view === "grid" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={cn(
                                "p-1.5 rounded transition-all",
                                view === "list" ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
            </div>

            {sortedModels.length > 0 ? (
                <div className={cn(
                    "grid gap-6",
                    view === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {sortedModels.map((model) => (
                         <div key={model.id} className={view === "list" ? "bg-white dark:bg-slate-900 p-4 rounded-xl border" : ""}>
                            <ModelCard model={model} />
                        </div>
                    ))}
                </div>
            ) : (
                <Card className="py-16 text-center border-dashed">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Info className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No models match your filters</h3>
                    <Button variant="link" onClick={handleClearAll}>Clear Filters</Button>
                </Card>
            )}
        </section>

        <AdSlot id="brand_mid_leaderboard" />

        {/* 4) FEATURED SPOTLIGHT (Dark Theme) */}
        {spotlightModel && !modelsLoading && (
            <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-xl">
                 <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                 
                 <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 relative z-10 items-center">
                    <div className="order-2 md:order-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary-foreground text-xs font-semibold uppercase tracking-wider border border-primary/20">
                            <Star className="w-3 h-3 fill-current" /> Top Selling
                        </div>
                        
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-2">{spotlightModel.name}</h2>
                            <p className="text-slate-400 text-lg">The flagship experience from {brandData.name}.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-slate-400 uppercase">Starting At</p>
                                {spotlightOnRoadPrice ? (
                                    <>
                                        <p className="text-xl font-bold">
                                            {spotlightOnRoadPrice.min === spotlightOnRoadPrice.max
                                             ? `Rs. ${(spotlightOnRoadPrice.min / 100000).toFixed(2)} Lakh`
                                             : `Rs. ${(spotlightOnRoadPrice.min / 100000).toFixed(2)} - ${(spotlightOnRoadPrice.max / 100000).toFixed(2)} Lakh`
                                                // ? `₹${formatINR(spotlightOnRoadPrice.min, true)}`
                                                // : `₹${formatINR(spotlightOnRoadPrice.min, true)} - ${formatINR(spotlightOnRoadPrice.max, true)}`
                                            }
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">On-Road Price in {city}</p>
                                    </>
                                ) : spotlightModel.priceRange?.min && spotlightModel.priceRange.min > 0 ? (
                                    <>
                                        <p className="text-xl font-bold">
                                            ₹{formatINR(spotlightModel.priceRange.min, true)}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">Ex-Showroom Price</p>
                                    </>
                                ) : (
                                    <p className="text-xl font-bold">Price TBA</p>
                                )}
                            </div>
                            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                                <p className="text-xs text-slate-400 uppercase">Variants</p>
                                <p className="text-xl font-bold">{spotlightModel.variantCount || "Multiple"}</p>
                            </div>
                        </div>

                        <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200" asChild>
                            <Link to={`/${brand}/${spotlightModel.slug}`}>Explore Model <ArrowRight className="w-4 h-4 ml-2" /></Link>
                        </Button>
                    </div>

                    <div className="order-1 md:order-2 flex items-center justify-center">
                         {spotlightModel.image ? (
                             <img 
                                src={spotlightModel.image} 
                                alt={spotlightModel.name} 
                                className="w-full max-h-[350px] object-contain drop-shadow-2xl"
                             />
                         ) : (
                             <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center text-6xl font-bold text-white/20">
                                 {getBrandInitial(brandData.name)}
                             </div>
                         )}
                    </div>
                 </div>
            </section>
        )}

        {/* 5) DISCOVER MORE (Tabs for New/Upcoming) */}
        {(newModels.length > 0 || upcomingModels.length > 0) && (
            <section className="grid md:grid-cols-2 gap-8">
                {newModels.length > 0 && (
                     <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                             <h3 className="text-lg font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" /> New Arrivals
                             </h3>
                             <Link to={`/new-cars?brand=${brand}`} className="text-xs text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                             {newModels.slice(0, 3).map((model: any) => (
                                 <Link key={model.id} to={`/${brand}/${model.slug}`} className="flex items-center gap-4 group">
                                     <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                         {/* Placeholder/Icon if image missing */}
                                         <CarFront className="w-5 h-5 text-muted-foreground" />
                                     </div>
                                     <div className="flex-1">
                                         <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{model.name}</h4>
                                         <p className="text-xs text-muted-foreground">Launched Recently</p>
                                     </div>
                                     <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                                 </Link>
                             ))}
                        </div>
                     </Card>
                )}

                {upcomingModels.length > 0 && (
                     <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                             <h3 className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-amber-500" /> Coming Soon
                             </h3>
                             <Link to={`/upcoming-cars?brand=${brand}`} className="text-xs text-primary hover:underline">View All</Link>
                        </div>
                        <div className="space-y-4">
                             {upcomingModels.slice(0, 3).map((model: any) => (
                                 <Link key={model.id} to={`/${brand}/${model.slug}`} className="flex items-center gap-4 group">
                                     <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                         <CarFront className="w-5 h-5 text-muted-foreground" />
                                     </div>
                                     <div className="flex-1">
                                         <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{model.name}</h4>
                                         <p className="text-xs text-muted-foreground">Expected: {model.expectedLaunchDate || "Soon"}</p>
                                     </div>
                                     <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                                 </Link>
                             ))}
                        </div>
                     </Card>
                )}
            </section>
        )}

        {/* 6) FAQ SECTION */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border p-6 md:p-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-10">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                          
                          <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline hover:text-primary">
                          Which {brandData.name} model is best for city driving?</AccordionTrigger>
                        <AccordionContent  className="text-muted-foreground pb-6 leading-relaxed">
                            <p className="mb-4">
                                For city driving, compact models like hatchbacks or compact SUVs are preferred due to their 
                                shorter turning radius and ease of parking.
                            </p>
                            
 
                          [Image of car dimensions blueprint]

                            <p className="text-xs text-muted-foreground mt-2">
                                *Comparing dimensions helps understand maneuverability in tight city traffic.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline hover:text-primary">Does {brandData.name} offer CNG options?</AccordionTrigger>
                        <AccordionContent  className="text-muted-foreground pb-6 leading-relaxed">
                            Yes, select the "Fuel Type" filter at the top of this page and choose "CNG" to see all available models.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-lg font-medium py-6 hover:no-underline hover:text-primary">What is the starting price?</AccordionTrigger>
                        <AccordionContent  className="text-muted-foreground pb-6 leading-relaxed">
                             Prices start from ₹{formatINR(startingPrice || 0, true)}. Note that these are Ex-showroom prices.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="hidden md:flex items-center justify-center bg-slate-50 dark:bg-slate-950 rounded-xl p-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Info className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold">Need more help?</h4>
                        <p className="text-sm text-muted-foreground mb-4">Visit a dealership near you.</p>
                        <Button variant="outline" size="sm">Locate Dealer</Button>
                    </div>
                </div>
            </div>
        </section>

        {/* 7) RELATED BRANDS */}
        <section>
             <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Other Brands to Explore</h3>
             <div className="flex flex-wrap gap-4">
                 {relatedBrands.map((rb) => (
                     <Link key={rb.id} to={`/${rb.slug}`}>
                         <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border rounded-full px-4 py-2 hover:border-primary hover:shadow-sm transition-all">
                             {rb.logo ? (
                                 <img src={rb.logo} alt={rb.name} className="w-6 h-6 object-contain" />
                             ) : (
                                 <span className="font-bold text-xs">{getBrandInitial(rb.name)}</span>
                             )}
                             <span className="text-sm font-medium">{rb.name}</span>
                         </div>
                     </Link>
                 ))}
             </div>
        </section>

      </div>
    </div>
  );
};

export default BrandModels;