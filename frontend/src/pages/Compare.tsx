import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import VariantPicker from "@/components/compare/VariantPicker";
import CompareTable from "@/components/compare/CompareTable";
import { getTrendingComparisons } from "@/lib/data";
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

  // Parse URL query for initial values
  const urlVariants = searchParams.get("v")?.split(",") || [];
  
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
          return null;
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
          return null;
        }
      });
      const results = await Promise.all(promises);
      if (mounted) setModelDataList(results);
    })();
    return () => { mounted = false; };
  }, [variantDataList]);

  const trendingComparisons = getTrendingComparisons();
  const selectedCount = selectedVariants.filter(v => v !== null).length;

  // Update URL when selections change
  useEffect(() => {
    const validVariants = selectedVariants.filter(v => v !== null);
    if (validVariants.length > 0) {
      setSearchParams({ v: validVariants.join(",") });
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
    newSelections[slot] = variantId;
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
    <div className="min-h-screen bg-slate-50 dark:bg-background pb-20">
      
      {/* 1) COMPACT HEADER */}
      <div className="bg-white dark:bg-card border-b shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-6">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare" }]} />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Compare Cars</h1>
                    <p className="text-slate-500 mt-1">Select up to 3 vehicles to compare specs & prices.</p>
                </div>
                {selectedCount > 0 && (
                     <Button onClick={handleCopyLink} variant="outline" size="sm" className="hidden md:flex">
                        <Share2 className="h-4 w-4 mr-2" /> Share Comparison
                    </Button>
                )}
            </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Ad Slot */}
        <AdSlot id="compare_top_billboard" />

        {/* 2) THE GARAGE (Pickers + Cards) */}
        <section className="bg-white dark:bg-card rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    <CarFront className="w-5 h-5 text-primary" />
                    Select Vehicles
                </h2>
                {selectedCount > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                        onClick={() => setSelectedVariants([null, null, null])}
                    >
                        <Trash2 className="w-4 h-4 mr-2" /> Clear All
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                 {/* Visual VS Dividers for Desktop */}
                 <div className="hidden md:flex absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-muted border items-center justify-center font-bold text-xs text-muted-foreground">VS</div>
                 <div className="hidden md:flex absolute left-2/3 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-muted border items-center justify-center font-bold text-xs text-muted-foreground">VS</div>

                {[0, 1, 2].map((idx) => {
                    const variant = variantDataList[idx];
                    const model = modelDataList[idx];
                    const brandLogo = model ? getBrandLogo(model.brandName) : null;
                    const brandInitial = model ? getBrandInitial(model.brandName) : "";

                    return (
                        <div key={idx} className="flex flex-col h-full">
                            {/* The Picker Input */}
                            <div className="mb-4">
                                <VariantPicker
                                    slot={idx === 0 ? "A" : idx === 1 ? "B" : "C"}
                                    initialValue={urlVariants[idx]}
                                    onSelect={handleVariantSelect(idx)}
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
                                                />
                                            ) : model.gallery && model.gallery.length > 0 ? (
                                                <img 
                                                    src={model.gallery[0]} 
                                                    alt={`${model.brandName} ${model.name}`} 
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-slate-300 dark:bg-slate-700 rounded flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                                            )}
                                        </div>

                                        <div className="w-12 h-12 bg-white dark:bg-black rounded-full flex items-center justify-center shadow-sm p-2 mb-3 ring-1 ring-slate-100 dark:ring-slate-800">
                                            {brandLogo ? (
                                                <img src={brandLogo} alt={model.brandName} className="w-full h-full object-contain" />
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
            {selectedCount === 3 && (
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
                        Compare All Vehicles
                    </Button>
                </div>
            )}
        </section>

        {/* 3) EMPTY STATE / TRENDING */}
        {selectedCount < 2 && (
            <section className="bg-slate-100 dark:bg-slate-900/50 rounded-xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-semibold mb-2">
                        {selectedCount === 0 ? "Start a Comparison" : "Add Another Vehicle"}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        {selectedCount === 0 
                            ? "Select two or more cars from the dropdowns above to see a detailed spec sheet comparison." 
                            : "You need at least two vehicles to see the comparison table."}
                    </p>
                    
                    <div className="text-left">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Trending Comparisons</h3>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {trendingComparisons.slice(0, 3).map((comp) => (
                                <Card key={comp.id} className="hover:border-primary/50 cursor-pointer transition-colors group">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="text-xs font-normal">Trending</Badge>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <h4 className="font-semibold text-sm">{comp.name}</h4>
                                        <p className="text-xs text-muted-foreground mt-1">{comp.views.toLocaleString()} views</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )}

        {/* 4) DATA TABLES & RECOMMENDATIONS */}
        {showCompareTable && (
            <>
                {/* City Selector */}
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-background rounded-md shadow-sm">
                            <Banknote className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Check On-Road Prices</p>
                            <p className="text-xs text-muted-foreground">Prices vary by location</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Select value={selectedCity} onValueChange={setSelectedCity} disabled={loadingCities}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-background">
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
                        <Button onClick={handleShowPrices} disabled={loadingCities || cities.length === 0}>Update</Button>
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
                <Card className="overflow-hidden border-t-4 border-t-primary shadow-md" id="comparison-table">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
                        <CardTitle>Detailed Specification Comparison</CardTitle>
                    </CardHeader>
                    <div className="overflow-x-auto">
                         <CompareTable
                            variants={variantDataList}
                            models={modelDataList}
                            onRoadPrices={showPrices ? onRoadPrices : undefined}
                        />
                    </div>
                </Card>

                <AdSlot id="compare_mid_sidebar" />
            </>
        )}
      </div>
    </div>
  );
};

export default Compare;