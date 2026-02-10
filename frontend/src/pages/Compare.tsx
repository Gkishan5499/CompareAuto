import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import VariantPicker from "@/components/compare/VariantPicker";
import CompareTable from "@/components/compare/CompareTable";
import TrendingComparisons from "@/components/home/TrendingComparisons";
import { getTrendingComparisons, getModels, getVariants } from "@/lib/data";
import { variantsApi, modelsApi, getOnRoadPrice, citiesApi } from "@/lib/api";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Share2, ArrowRight, Trophy, Banknote, Zap, Plus, CarFront, Trash2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import AdSlot from "@/components/ads/AdSlot";
import { cn } from "@/lib/utils";

const Compare = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

    const resolveVariantIdsFromParams = (): (string | null)[] => {
        const variantsParam = searchParams.get("v");
        if (variantsParam) {
            const tokens = variantsParam.split(",").map((value) => value.trim());
            const padded = [...tokens, "", "", ""].slice(0, 3);
            return padded.map((value) => (value ? value : null));
        }

        const modelsParam = searchParams.get("models");
        if (!modelsParam) return [];

        const modelTokens = modelsParam
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
            .slice(0, 3);

        const models = getModels();

        const resolved = modelTokens
            .map((token) => {
                const model = models.find((item) => item.id === token || item.slug === token);
                if (!model) return null;
                const modelVariants = getVariants(model.id);
                if (modelVariants.length === 0) return null;

                const cheapestVariant = modelVariants.reduce((min, variant) => {
                    if (!min || variant.price < min.price) return variant;
                    return min;
                }, null as (typeof modelVariants)[number] | null);

                return (cheapestVariant || modelVariants[0]).id;
            })
            .filter((value): value is string => Boolean(value));

        return [...resolved, null, null, null].slice(0, 3);
    };

    const resolveInitialVariants = (): (string | null)[] => {
        const fromParams = resolveVariantIdsFromParams();
        if (fromParams.some(Boolean)) return fromParams;

        const stored = JSON.parse(localStorage.getItem("compareList") || "[]");
        if (!Array.isArray(stored)) return [null, null, null];
        const normalized = stored
            .map((item) => {
                if (!item) return null;
                if (typeof item === "string") return item;
                if (typeof item === "object") {
                    return item.id || item.variantId || item.modelId || item.slug || null;
                }
                return null;
            })
            .filter((value): value is string => Boolean(value))
            .slice(0, 3);
        return [...normalized, null, null, null].slice(0, 3);
    };

    const urlVariants = resolveInitialVariants();

    const [selectedVariants, setSelectedVariants] = useState<(string | null)[]>([
        urlVariants[0] || null,
        urlVariants[1] || null,
        urlVariants[2] || null,
    ]);

  const [selectedCity, setSelectedCity] = useState("delhi");
  const [onRoadPrices, setOnRoadPrices] = useState<(number | null)[]>([null, null, null]);
  const [showPrices, setShowPrices] = useState(false);
  const [cities, setCities] = useState<Array<{ id: string; name: string; state: string; slug: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showCompareTable, setShowCompareTable] = useState(false);
    const [compareMode, setCompareMode] = useState<"auto" | "manual">("auto");

    useEffect(() => {
        const shouldAutoShow = localStorage.getItem("compareAutoShow") === "1";

        if (searchParams.get("models") && !searchParams.get("v")) {
            setLastThirdVariant(null);
            localStorage.removeItem("compareLastThird");
        }

        const nextVariants = resolveInitialVariants();
        if (nextVariants.filter(Boolean).length === 3 && compareMode !== "manual") {
            setCompareMode("manual");
        }
        const nextSelection: (string | null)[] = [
            nextVariants[0] || null,
            nextVariants[1] || null,
            nextVariants[2] || null,
        ];

        const isSameSelection = nextSelection.every((value, index) => value === selectedVariants[index]);
        if (!isSameSelection) {
            const nextCount = nextSelection.filter(Boolean).length;
            setSelectedVariants(nextSelection);
            setShowCompareTable(shouldAutoShow && nextCount >= 2 ? true : false);
            setShowPrices(false);
            setOnRoadPrices([null, null, null]);
            if (shouldAutoShow) {
                localStorage.removeItem("compareAutoShow");
            }
        }
    }, [searchParams]);

  // Fetch cities from backend (single source of truth)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const allCities = await citiesApi.getAll();
        setCities(allCities || []);
        // Set default to first city if available
        if (allCities && allCities.length > 0) {
          setSelectedCity(allCities[0].slug);
        }
      } catch (error) {
        console.error("Failed to fetch cities for compare:", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, []);

  // Get variant data
  const [variantDataList, setVariantDataList] = useState<(any|null)[]>([null, null, null]);

  useEffect(() => {
    let mounted = true;
    (async () => {
            const promises = selectedVariants.map(async (variantId) => {
                if (!variantId) return null;
                try {
                    return await variantsApi.getById(variantId);
                } catch (err) {
                    try {
                        const allVariants = await variantsApi.getAll();
                        return allVariants.find(
                            (variant) =>
                                variant.id === variantId ||
                                variant.slug === variantId ||
                                variant._id === variantId
                        ) || null;
                    } catch (fallbackError) {
                        return null;
                    }
                }
            });
      const results = await Promise.all(promises);
      if (mounted) setVariantDataList(results);
    })();
    return () => { mounted = false; };
  }, [selectedVariants]);

  // Get model data for each variant
  const [modelDataList, setModelDataList] = useState<(any|null)[]>([null, null, null]);

  useEffect(() => {
    let mounted = true;
    (async () => {
            const promises = variantDataList.map(async (variant) => {
        if (!variant) return null;
        try {
                    return await modelsApi.getById(variant.modelId);
        } catch (err) {
                    try {
                        const modelBySlug = await modelsApi.getBySlug(variant.modelId);
                        if (modelBySlug) return modelBySlug;

                        const allModels = await modelsApi.getAll();
                        return allModels.find(
                            (model) =>
                                model.id === variant.modelId ||
                                model.slug === variant.modelId ||
                                model._id === variant.modelId
                        ) || null;
                    } catch (fallbackError) {
                        return null;
                    }
        }
      });
      const results = await Promise.all(promises);
      if (mounted) setModelDataList(results);
    })();
    return () => { mounted = false; };
  }, [variantDataList]);

    const trendingComparisons = getTrendingComparisons();
    const selectedCount = selectedVariants.filter((value): value is string => Boolean(value)).length;
    const slotIndices = compareMode === "manual" ? [0, 1, 2] : [0, 1];
    const maxSlots = slotIndices.length;

    const [lastThirdVariant, setLastThirdVariant] = useState<string | null>(() => {
        const stored = localStorage.getItem("compareLastThird");
        return stored && stored.trim() ? stored : null;
    });
    const prevModeRef = useRef<"auto" | "manual">(compareMode);

    useEffect(() => {
        if (compareMode === "auto" && selectedVariants[2]) {
            setLastThirdVariant(selectedVariants[2]);
            localStorage.setItem("compareLastThird", selectedVariants[2]);
            setSelectedVariants([selectedVariants[0], selectedVariants[1], null]);
        }
    }, [compareMode, selectedVariants]);

    useEffect(() => {
        const prevMode = prevModeRef.current;
        if (
            prevMode === "auto" &&
            compareMode === "manual" &&
            !selectedVariants[2] &&
            lastThirdVariant &&
            (selectedVariants[0] || selectedVariants[1])
        ) {
            setSelectedVariants([selectedVariants[0], selectedVariants[1], lastThirdVariant]);
        }
        prevModeRef.current = compareMode;
    }, [compareMode, selectedVariants, lastThirdVariant]);

    useEffect(() => {
        if (selectedCount < 2 && showCompareTable) {
            setShowCompareTable(false);
        }
    }, [selectedCount, showCompareTable]);

    useEffect(() => {
        const shouldAutoShow = localStorage.getItem("compareAutoShow") === "1";
        if (shouldAutoShow && selectedCount >= 2) {
            setShowCompareTable(true);
            localStorage.removeItem("compareAutoShow");
        }
    }, [selectedCount]);

  // Update URL when selections change
    useEffect(() => {
        const validVariants = selectedVariants.filter((value): value is string => Boolean(value));
        if (validVariants.length > 0) {
            const serialized = selectedVariants.map((value) => value || "").join(",");
            setSearchParams({ v: serialized });
            localStorage.setItem("compareList", JSON.stringify(validVariants));
        } else {
            setSearchParams({});
        }
    }, [selectedVariants, setSearchParams]);

  // SEO
  useEffect(() => {
    updateMetaTags({
      title: "Compare Car Variants – Specs & Price Differences",
      description: "Side-by-side comparison of car variants across brands with detailed specs, features, and prices.",
      keywords: ["compare cars", "car comparison", "variant comparison"],
      canonical: `${window.location.origin}/compare`,
      ogImage: DEFAULT_OG_IMAGE,
    });
    // ... structured data logic (omitted for brevity) ...
  }, [variantDataList]);

  const handleVariantSelect = (slot: number) => (variantId: string | null) => {
    const newSelections = [...selectedVariants];
        newSelections[slot] = variantId || null;
    setSelectedVariants(newSelections);
    setShowPrices(false);
    setOnRoadPrices([null, null, null]);
  };

  const handleRemoveVariant = (slot: number) => {
    const newSelections = [...selectedVariants];
    newSelections[slot] = null;
    setSelectedVariants(newSelections);
    setShowPrices(false);
    setOnRoadPrices([null, null, null]);
  };

  const handleShowPrices = async () => {
    const prices = await Promise.all(
      selectedVariants.map(async (variantId) => {
        if (!variantId) return null;
        const data = await getOnRoadPrice(variantId, selectedCity);
        return data.onRoadTotal;
      })
    );
    setOnRoadPrices(prices);
    setShowPrices(true);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied!",
      description: "Comparison link has been copied to clipboard.",
    });
  };

  // Recommendations
  const getRecommendations = () => {
    const variants = variantDataList.filter(v => v !== null);
    if (variants.length < 2) return null;

    const cheapest = variants.reduce((min, v) => (v && (!min || v.price < min.price)) ? v : min);
    const mostExpensive = variants.reduce((max, v) => (v && (!max || v.price > max.price)) ? v : max);
    const bestMileage = variants.reduce((best, v) => (v && (!best || v.mileage > best.mileage)) ? v : best);

    return { cheapest, mostExpensive, bestMileage };
  };

  const recommendations = getRecommendations();

    return (
        <div className="min-h-screen bg-[#f7f4ef] dark:bg-background pb-20">
      
            {/* 1) HERO HEADER */}
            <div className="relative overflow-hidden border-b bg-gradient-to-br from-white via-white to-amber-50/60">
                <div className="absolute -top-24 -right-10 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
                <div className="absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-rose-200/40 blur-3xl" />
                <div className="container max-w-7xl mx-auto px-4 py-4 relative">
                    <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mt-4">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                                Compare Hub
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mt-4">
                                Compare car variants side-by-side
                            </h1>
                            <p className="text-slate-600 mt-3 text-base md:text-lg">
                                Pick up to three cars and see prices, specs, and features in one clean view.
                            </p>
                        </div>
                        {selectedCount > 0 && (
                            <Button onClick={handleCopyLink} variant="outline" size="sm" className="hidden md:flex bg-white/90">
                                <Share2 className="h-4 w-4 mr-2" /> Share Comparison
                            </Button>
                        )}
                    </div>
                </div>
            </div>

    <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-5">
        
        {/* Ad Slot */}
        <AdSlot id="compare_top_billboard" />


        {/* 2) THE GARAGE (Pickers + Cards) */}
        <section className="bg-white/90 dark:bg-card rounded-2xl shadow-sm border border-slate-200/70 p-6 backdrop-blur">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="font-semibold text-lg flex items-center gap-2 text-slate-900">
                    <CarFront className="w-5 h-5 text-primary" />
                    Select Vehicles
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 rounded-full border bg-muted/40 px-2 py-1">
                        <Button
                            variant={compareMode === "auto" ? "default" : "ghost"}
                            size="sm"
                            className="h-7 px-3"
                            onClick={() => setCompareMode("auto")}
                        >
                            2-Car
                        </Button>
                        <Button
                            variant={compareMode === "manual" ? "default" : "ghost"}
                            size="sm"
                            className="h-7 px-3"
                            onClick={() => setCompareMode("manual")}
                        >
                            3-Car
                        </Button>
                    </div>
                    {selectedCount > 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                            onClick={() => {
                                setSelectedVariants([null, null, null]);
                                setLastThirdVariant(null);
                                setShowCompareTable(false);
                                setShowPrices(false);
                                setOnRoadPrices([null, null, null]);
                                localStorage.removeItem("compareLastThird");
                                localStorage.removeItem("compareList");
                                localStorage.removeItem("compareAutoShow");
                                setSearchParams({});
                                window.dispatchEvent(new Event("compareListUpdated"));
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Clear All
                        </Button>
                    )}
                </div>
            </div>

            <div className={cn(
                "grid grid-cols-1 gap-6 relative",
                compareMode === "manual" ? "md:grid-cols-3" : "md:grid-cols-2"
            )}>
                 {/* Visual VS Dividers for Desktop */}
                 {maxSlots >= 2 && (
                    <div className="hidden md:flex absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-muted border items-center justify-center font-bold text-xs text-muted-foreground">VS</div>
                 )}
                 {maxSlots === 3 && (
                    <div className="hidden md:flex absolute left-2/3 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-muted border items-center justify-center font-bold text-xs text-muted-foreground">VS</div>
                 )}

                {slotIndices.map((idx) => {
                    const variant = variantDataList[idx];
                    const model = modelDataList[idx];
                    const brandLogo = model ? getBrandLogo(model.brandName) : null;
                    const brandInitial = model ? getBrandInitial(model.brandName) : "";
                    const disabledVariantIds = selectedVariants.filter(
                        (value, index): value is string => Boolean(value) && index !== idx
                    );

                    return (
                        <div key={idx} className="flex flex-col h-full">
                            {/* The Picker Input */}
                            <div className="mb-4">
                                <VariantPicker
                                    slot={idx === 0 ? "A" : idx === 1 ? "B" : "C"}
                                    initialValue={selectedVariants[idx] || undefined}
                                    onSelect={handleVariantSelect(idx)}
                                    selectedVariantId={selectedVariants[idx] || null}
                                    disabledVariantIds={disabledVariantIds}
                                />
                            </div>

                            {/* The Visual Card */}
                            <div className={cn(
                                "flex-1 rounded-xl border-2 transition-all relative overflow-hidden group",
                                variant ? "bg-slate-50/50 dark:bg-slate-900/50 border-primary/20 hover:border-primary/50" : "border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex items-center justify-center min-h-[160px]"
                            )}>
                                {variant && model ? (
                                    <div className="p-5 flex flex-col h-full items-center text-center">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveVariant(idx)}
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </Button>

                                        {/* Model Image */}
                                        <div className="w-full h-32 flex items-center justify-center mb-4 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                                            {model.image ? (
                                                <img 
                                                    src={model.image} 
                                                    alt={`${model.brandName} ${model.name}`} 
                                                    className="w-full h-full object-contain p-2"
                                                    loading="lazy"
                                                />
                                            ) : model.gallery && model.gallery.length > 0 ? (
                                                <img 
                                                    src={model.gallery[0]} 
                                                    alt={`${model.brandName} ${model.name}`} 
                                                    className="w-full h-full object-contain p-2"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-300 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                                            )}
                                        </div>

                                        <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-sm p-2 mb-3 ring-1 ring-slate-100 dark:ring-slate-800">
                                            {brandLogo ? (
                                                <img src={brandLogo} alt={model.brandName} className="w-full h-full object-contain" loading="lazy" />
                                            ) : (
                                                <span className="text-sm font-bold">{brandInitial}</span>
                                            )}
                                        </div>
                                        
                                        <h3 className="font-bold text-slate-900 dark:text-slate-100 leading-tight mb-1">
                                            {model.brandName} {model.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3">{variant.name}</p>
                                        
                                        <div className="mt-auto pt-3 border-t w-full border-dashed border-slate-200 dark:border-slate-700">
                                            <p className="text-lg font-bold text-primary">
                                                 {(() => {
                                                    const p = parseINRToRupees(variant.price);
                                                    return p && p > 0 ? formatINR(p, true) : "—";
                                                })()}
                                            </p>
                                            <Link to={`/${model.brandId}/${model.slug}/${variant.slug}`} className="text-xs text-primary hover:underline mt-1 block">
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center p-6 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                                            <Plus className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-500">Add Vehicle</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Final Compare Button */}
            {selectedCount >= 2 && (
                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={() => {
                            setShowCompareTable(true);
                            setTimeout(() => {
                                document.getElementById("comparison-table")?.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                        }}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-12 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        Compare Selected Vehicles
                    </Button>
                </div>
            )}
        </section>

        {/* 4) DATA TABLES & RECOMMENDATIONS */}
        {showCompareTable && (
            <>
                {/* City Selector */}
                <div className="bg-white/90 border border-slate-200/70 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-md shadow-sm">
                            <Banknote className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-slate-900">Check On-Road Prices</p>
                            <p className="text-xs text-slate-500">Prices vary by location</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={selectedCity} onValueChange={setSelectedCity} disabled={loadingCities}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-white">
                                <SelectValue placeholder="Select city..." />
                            </SelectTrigger>
                            <SelectContent>
                                {loadingCities ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground">Loading cities...</div>
                                ) : cities.length > 0 ? (
                                    cities.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">No cities available</div>
                                )}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleShowPrices} disabled={loadingCities || cities.length === 0}>
                            Update
                        </Button>
                     </div>
                </div>

                {/* Recommendations */}
                {recommendations && (
                    <div className="grid md:grid-cols-3 gap-4">
                        <Card className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900">
                             <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wide">
                                    <Banknote className="w-4 h-4" /> Value Pick
                                </div>
                             </CardHeader>
                             <CardContent>
                                <p className="text-xl font-bold truncate" title={recommendations.cheapest.name}>
                                    {recommendations.cheapest.name}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Lowest price at ₹{(recommendations.cheapest.price / 100000).toFixed(2)}L
                                </p>
                             </CardContent>
                        </Card>

                        <Card className="bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900">
                             <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-sm uppercase tracking-wide">
                                    <Zap className="w-4 h-4" /> Mileage King
                                </div>
                             </CardHeader>
                             <CardContent>
                                <p className="text-xl font-bold truncate" title={recommendations.bestMileage.name}>
                                    {recommendations.bestMileage.name}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Best efficiency: {recommendations.bestMileage.mileage} km/l
                                </p>
                             </CardContent>
                        </Card>

                        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30">
                             <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wide">
                                    <Trophy className="w-4 h-4" /> Top Spec
                                </div>
                             </CardHeader>
                             <CardContent>
                                <p className="text-xl font-bold truncate" title={recommendations.mostExpensive.name}>
                                    {recommendations.mostExpensive.name}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Most premium features included
                                </p>
                             </CardContent>
                        </Card>
                    </div>
                )}

                {/* The Big Table */}
                <Card className="overflow-hidden border border-slate-200/70 shadow-md rounded-2xl" id="comparison-table">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="text-slate-900">Detailed Specification Comparison</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                         <CompareTable
                            variants={variantDataList}
                            models={modelDataList}
                            onRoadPrices={showPrices ? onRoadPrices : undefined}
                        />
                    </div>
                </Card>

            </>
        )}
      
      
          <TrendingComparisons
                    offset={4}
                    limit={4}
                    showViewAll={false}
                    variant="compare"
                    title="More Battles"
                    subtitle="Fresh matchups beyond the new trends."
                />
       
              
      </div>
    </div>
  );
};

export default Compare;