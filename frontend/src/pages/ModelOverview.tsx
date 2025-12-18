import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import VariantTable from "@/components/model/VariantTable";
import ColorSwatches from "@/components/model/ColorSwatches";
import { PriceBreakupModal } from "@/components/model/PriceBreakupModal";
import { PriceBreakupComponent } from "@/components/variant/PriceBreakupComponent";
import { calculatePriceBreakdown, calculatePriceBreakdownWithConfig, getStateFromCity } from "@/lib/priceCalculations";
import PhotoGallery from "@/components/model/PhotoGallery";
import VideoEmbed from "@/components/model/VideoEmbed";
import Viewer360 from "@/components/model/Viewer360";
import { LeadsStrip } from "@/components/leads/LeadsStrip";
import { useModel, useVariants, useModels } from "@/lib/api-hooks";
import { specsApi, citiesApi } from "@/lib/api";
import { updateMetaTags, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import { useCity } from "@/contexts/CityContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calculator, Plus, ChevronRight, Star, 
  Fuel, Gauge, Settings, ShieldCheck, 
  CheckCircle2, XCircle, MapPin, ArrowRight, Info 
} from "lucide-react";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import AdSlot from "@/components/ads/AdSlot";
import { cn } from "@/lib/utils";

const ModelOverview = () => {
  useScrollToTop();
  const { brand, model: modelSlug } = useParams<{ brand: string; model: string }>();
  const { city } = useCity();

  // Refs for smooth scrolling
  const variantsRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const colorsRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("White");
  const [selectedCity, setSelectedCity] = useState<string>(city || "Delhi NCR");
  const [activeTab, setActiveTab] = useState<"overview" | "variants" | "specs" | "colors" | "photos" | "faq">("overview");
  const [specs, setSpecs] = useState<any | null>(null);
  const [cities, setCities] = useState<Array<{ id: string; name: string; state: string; slug: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Backend API only - No fallback data
  const { data: modelData, isLoading: modelLoading } = useModel(brand || "", modelSlug || "");
  const { data: variants, isLoading: variantsLoading } = useVariants(modelData?.id || "");
  const { data: allModels = [] } = useModels();
  const loading = modelLoading || variantsLoading;

  const brandLogo = getBrandLogo(modelData?.brandName);
  const brandInitial = getBrandInitial(modelData?.brandName);

  // Competitors logic
  const competitors = allModels
    .filter((m: any) => m.bodyType === modelData?.bodyType && m.brandId !== modelData?.brandId)
    .slice(0, 4);

  // Media data
  const mediaData = modelData?.media || {
    hero: "",
    gallery: Array(12).fill("photo"),
    videoUrl: undefined,
    spin360Url: undefined,
    spinFrames: undefined,
  };

  const carImage = mediaData.hero || modelData?.image || DEFAULT_OG_IMAGE;
  const colors = variants?.[0]?.colors || ["White", "Black", "Silver", "Red", "Blue"];

  // Price Logic
  const { minPrice, maxPrice } = useMemo(() => {
    if (!modelData || !variants) return { minPrice: 0, maxPrice: 0 };
    
    // Calculate range from variants
    const prices = variants
       .map((v) => parseINRToRupees(v?.price))
       .filter((p) => p && p > 0) as number[];
    
    let min = 0, max = 0;
    
    if (prices.length > 0) {
        min = Math.min(...prices);
        max = Math.max(...prices);
    } else if (modelData.priceRange) {
        min = modelData.priceRange.min || 0;
        max = modelData.priceRange.max || 0;
    } else if (modelData.status === "upcoming") {
        min = modelData.expectedPriceMin || 0;
        max = modelData.expectedPriceMax || 0;
    }

    return { minPrice: min, maxPrice: max };
  }, [modelData, variants]);

  // SEO & Specs fetch
  useEffect(() => {
    if (!modelData || !brand || !modelSlug) return;
    updateMetaTags({
      title: `${modelData.brandName} ${modelData.name} – Price, Variants, Specs`,
      description: `Detailed review of ${modelData.brandName} ${modelData.name}.`,
      keywords: [`${modelData.name} price`, `${modelData.name} specs`],
      canonical: `${window.location.origin}/${brand}/${modelSlug}`,
      ogImage: DEFAULT_OG_IMAGE,
    });
  }, [modelData, brand, modelSlug]);

  // Fetch cities from backend
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const allCities = await citiesApi.getAll();
        setCities(allCities);
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        // Keep cities empty, will fallback to showing text input or default cities
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  useEffect(() => {
    if (variants && variants.length > 0) {
      specsApi.getByVariant(variants[0].id).then(setSpecs).catch(() => setSpecs(null));
    }
  }, [variants]);

  const handleCheckPrice = (variantId: string | null) => {
    setSelectedVariantId(variantId);
    setPriceModalOpen(true);
  };

  // Get ex-showroom price for selected variant or first variant
  const selectedVariant = variants?.find(v => v.id === selectedVariantId) || variants?.[0];
  const selectedVariantPrice = selectedVariant ? parseINRToRupees(selectedVariant.price) : null;
  
  // Use selected variant price for display
  const displayPrice = selectedVariantPrice || minPrice;

  const handleAddToCompare = () => {
    if (variants && variants[0]) {
      const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
      if (!compareList.includes(variants[0].id) && compareList.length < 3) {
        compareList.push(variants[0].id);
        localStorage.setItem("compareList", JSON.stringify(compareList));
        window.dispatchEvent(new Event("compareListUpdated"));
      }
    }
  };

    // City-wise pricing calculation - calculate both min and max on-road prices
    const [minPriceBreakdown, setMinPriceBreakdown] = useState<any | null>(null);
    const [maxPriceBreakdown, setMaxPriceBreakdown] = useState<any | null>(null);
    const selectedState = getStateFromCity(selectedCity);

    useEffect(() => {
        let cancelled = false;
        const compute = async () => {
            if (minPrice <= 0 && maxPrice <= 0) {
                setMinPriceBreakdown(null);
                setMaxPriceBreakdown(null);
                return;
            }

            try {
                // Calculate min price (base variant) on-road price
                if (minPrice > 0) {
                    const resp = await fetch(`/api/pricing/calc`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ exShowroomPrice: minPrice, state: selectedState }),
                    });
                    if (resp.ok) {
                        const json = await resp.json();
                        if (!cancelled) setMinPriceBreakdown(json.breakdown);
                    } else {
                        if (!cancelled) setMinPriceBreakdown(calculatePriceBreakdown(minPrice, selectedCity));
                    }
                }

                // Calculate max price (top variant) on-road price if different from min
                if (maxPrice > 0 && maxPrice !== minPrice) {
                    const resp2 = await fetch(`/api/pricing/calc`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ exShowroomPrice: maxPrice, state: selectedState }),
                    });
                    if (resp2.ok) {
                        const json2 = await resp2.json();
                        if (!cancelled) setMaxPriceBreakdown(json2.breakdown);
                    } else {
                        if (!cancelled) setMaxPriceBreakdown(calculatePriceBreakdown(maxPrice, selectedCity));
                    }
                } else {
                    if (!cancelled) setMaxPriceBreakdown(null);
                }
            } catch (err) {
                if (!cancelled) {
                    setMinPriceBreakdown(minPrice > 0 ? calculatePriceBreakdown(minPrice, selectedCity) : null);
                    setMaxPriceBreakdown(maxPrice > 0 && maxPrice !== minPrice ? calculatePriceBreakdown(maxPrice, selectedCity) : null);
                }
            }
        };

        compute();
        return () => { cancelled = true; };
    }, [minPrice, maxPrice, selectedCity, selectedState]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!modelData || !brand || !modelSlug) return <div>Not Found</div>;

  const hasPrice = minPrice > 0;
  // Show ex-showroom price range in compact format
  const priceLabel = minPrice === maxPrice || !maxPrice
      ? formatINR(minPrice || maxPrice, true)
      : `Rs. ${(minPrice / 100000).toFixed(2)} - ${(maxPrice / 100000).toFixed(2)} Lakh`;

  const primaryMileage = variants.length > 0
      ? Math.max(...variants.map((v) => (typeof v.mileage === "number" ? v.mileage : 0)))
      : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background pb-12">
      
      {/* 1) HEADER & BREADCRUMBS */}
      <div className="bg-white dark:bg-card border-b sticky top-0 z-40 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Brands", href: "/brands" },
              { label: modelData.brandName, href: `/${brand}` },
              { label: modelData.name },
            ]}
          />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 mt-8 space-y-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: VISUALS & TABS (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* HERO CARD */}
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-8">
                        {/* Rating Badge */}
                        {modelData.rating && (
                            <div className="absolute top-4 left-4 z-10 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm text-sm font-semibold">
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                <span>{modelData.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground font-normal text-xs">({modelData.reviews?.toLocaleString()} reviews)</span>
                            </div>
                        )}
                        
                        <img 
                            src={carImage} 
                            alt={`${modelData.brandName} ${modelData.name}`} 
                            className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                        />

                        <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-500 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
                             Color shown: {selectedColor}
                        </div>
                    </div>

                    {/* Quick Specs Strip */}
                    <div className="bg-white dark:bg-card border-t grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                             <Fuel className="w-5 h-5 text-primary" />
                             <span className="text-xs text-muted-foreground">Fuel Type</span>
                             <span className="font-semibold text-sm">{variants?.[0]?.fuelType || "Petrol/Diesel"}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                             <Settings className="w-5 h-5 text-slate-500" />
                             <span className="text-xs text-muted-foreground">Transmission</span>
                             <span className="font-semibold text-sm">Manual / Auto</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                             <Gauge className="w-5 h-5 text-emerald-500" />
                             <span className="text-xs text-muted-foreground">Mileage</span>
                             <span className="font-semibold text-sm">{primaryMileage ? `${primaryMileage} km/l` : "TBA"}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                             <ShieldCheck className="w-5 h-5 text-orange-500" />
                             <span className="text-xs text-muted-foreground">Safety</span>
                             <span className="font-semibold text-sm">Up to 6 Airbags</span>
                        </div>
                    </div>
                </Card>

                {/* TABS NAVIGATION */}
                <div className="sticky top-14 z-30 bg-slate-50/95 dark:bg-background/95 backdrop-blur-sm -mx-4 px-4 md:mx-0 md:px-0 py-2 border-b">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="w-full justify-start h-auto bg-transparent p-0 gap-6 overflow-x-auto no-scrollbar">
                            {["Overview", "Variants", "Specs", "Colors", "Photos", "FAQ"].map((tab) => (
                                <TabsTrigger 
                                    key={tab} 
                                    value={tab.toLowerCase()}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3 text-base"
                                >
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>

                {/* TAB CONTENT AREAS */}
                <div className="min-h-[500px]">
                    
                    {activeTab === "overview" && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Pros & Cons */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle2 className="w-5 h-5" /> Pros
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex gap-2"><span className="text-emerald-500">✓</span> Spacious and premium cabin feel</li>
                                            <li className="flex gap-2"><span className="text-emerald-500">✓</span> Smooth engine performance</li>
                                            <li className="flex gap-2"><span className="text-emerald-500">✓</span> High safety rating</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                                <Card className="border-l-4 border-l-rose-500 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg flex items-center gap-2 text-rose-700 dark:text-rose-400">
                                            <XCircle className="w-5 h-5" /> Cons
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex gap-2"><span className="text-rose-500">✗</span> Pricey top-end variants</li>
                                            <li className="flex gap-2"><span className="text-rose-500">✗</span> Firm ride quality on bumps</li>
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Verdict */}
                            <div className="prose dark:prose-invert max-w-none">
                                <h3 className="text-xl font-bold mb-2">Verdict</h3>
                                <p className="text-slate-600 dark:text-slate-300">
                                    The {modelData.brandName} {modelData.name} positions itself as a strong contender in the {modelData.bodyType} segment. 
                                    With its updated feature list including ADAS and a panoramic sunroof, it appeals to the modern buyer.
                                </p>
                            </div>

                            {/* Feature Highlights */}
                            <div>
                                <h3 className="text-xl font-bold mb-4">Key Features</h3>
                                <div className="flex flex-wrap gap-3">
                                    {["6 Airbags", "Sunroof", "Wireless CarPlay", "ADAS Level 2", "Ventilated Seats", "360° Camera"].map(feat => (
                                        <Badge key={feat} variant="secondary" className="px-3 py-1.5 text-sm font-normal">
                                            {feat}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "variants" && (
                        <div ref={variantsRef} className="animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold mb-6">Detailed Variant Comparison</h2>
                            <VariantTable variants={variants} brandSlug={brand} modelSlug={modelSlug} />
                        </div>
                    )}

                    {activeTab === "specs" && (
                         <div ref={specsRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                            <h2 className="text-2xl font-bold">Technical Specifications</h2>
                            
                            {/* Dimensions Diagram */}
                             <Card>
                                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-3">
                                    <CardTitle className="text-base">Dimensions</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center">
                                        <p className="mb-6 text-sm text-muted-foreground w-full">External measurements including length, width, and wheelbase.</p>

                                    </div>
                                    <Table className="mt-6">
                                        <TableBody>
                                            <TableRow><TableCell className="font-medium">Length</TableCell><TableCell className="text-right">{specs?.dimensions?.length || "4000"} mm</TableCell></TableRow>
                                            <TableRow><TableCell className="font-medium">Width</TableCell><TableCell className="text-right">{specs?.dimensions?.width || "1700"} mm</TableCell></TableRow>
                                            <TableRow><TableCell className="font-medium">Wheelbase</TableCell><TableCell className="text-right">{specs?.dimensions?.wheelbase || "2500"} mm</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            {/* Engine */}
                            <Card>
                                <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-3">
                                    <CardTitle className="text-base">Engine & Transmission</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableBody>
                                            <TableRow><TableCell className="font-medium">Displacement</TableCell><TableCell className="text-right">{specs?.engine?.engine_cc || variants?.[0]?.engine} cc</TableCell></TableRow>
                                            <TableRow><TableCell className="font-medium">Power</TableCell><TableCell className="text-right">{specs?.engine?.power || "115 BHP"}</TableCell></TableRow>
                                            <TableRow><TableCell className="font-medium">Torque</TableCell><TableCell className="text-right">{specs?.engine?.torque || "144 Nm"}</TableCell></TableRow>
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                         </div>
                    )}

                    {activeTab === "colors" && (
                        <div ref={colorsRef}>
                            <h2 className="text-2xl font-bold mb-6">Available Colors</h2>
                            <Card className="p-8">
                                 <ColorSwatches colors={colors} onColorChange={setSelectedColor} />
                            </Card>
                        </div>
                    )}

                     {activeTab === "photos" && (
                        <div ref={photosRef} className="space-y-8">
                            {mediaData.videoUrl && (
                                 <div>
                                    <h3 className="text-xl font-bold mb-4">Official Video</h3>
                                    <VideoEmbed videoUrl={mediaData.videoUrl} title="Official Video" />
                                 </div>
                            )}
                            <div>
                                 <h3 className="text-xl font-bold mb-4">Image Gallery</h3>
                                 <PhotoGallery photos={mediaData.gallery} modelName={modelData.name} brandName={modelData.brandName} />
                            </div>
                        </div>
                    )}

                    {activeTab === "faq" && (
                         <div ref={faqRef}>
                            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>What is the on-road price of {modelData.name}?</AccordionTrigger>
                                    <AccordionContent>On-road price includes Ex-showroom price + RTO + Insurance. Click the "Check On-Road Price" button to get a detailed breakdown.</AccordionContent>
                                </AccordionItem>
                                 <AccordionItem value="item-2">
                                    <AccordionTrigger>What is the mileage?</AccordionTrigger>
                                    <AccordionContent>The {modelData.name} delivers an ARAI-certified mileage of up to {primaryMileage} km/l depending on the fuel type.</AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}
                </div>

                 {/* Leads Strip */}
                {brand && modelSlug && (
                    <div className="pt-4" id="leads">
                        <LeadsStrip brand={brand} model={modelSlug} />
                    </div>
                )}
            </div>

            {/* RIGHT SIDEBAR (Desktop) - 4 Cols */}
            <div className="lg:col-span-4 space-y-6">
                
                {/* 1) MODEL INFO CARD (Sticky Top) */}
                <Card className="border-t-4 border-t-primary shadow-md">
                    <CardHeader className="pb-4">
                         <div className="flex items-center gap-3 mb-2">
                             {brandLogo ? (
                                <img src={brandLogo} alt={modelData.brandName} className="w-8 h-8 object-contain" />
                             ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{brandInitial}</div>
                             )}
                             <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{modelData.brandName}</span>
                         </div>
                         <h1 className="text-3xl font-extrabold tracking-tight mb-1">{modelData.name}</h1>
                         <div className="flex items-center gap-2 mb-4">
                            <Badge variant="outline">{modelData.bodyType}</Badge>
                            <span className="text-sm text-muted-foreground">{variants.length} Variants</span>
                         </div>

                         {/* City Selector */}
                         <div className="mt-4 space-y-2 mb-4">
                           <label className="text-xs text-muted-foreground font-medium uppercase">Select City</label>
                           <Select value={selectedCity} onValueChange={setSelectedCity}>
                             <SelectTrigger className="w-full">
                               <SelectValue placeholder="Select your city" />
                             </SelectTrigger>
                             <SelectContent className="max-h-[300px]">
                               {loadingCities ? (
                                 <div className="p-4 text-center text-sm text-muted-foreground">
                                   Loading cities...
                                 </div>
                               ) : cities.length > 0 ? (
                                 cities.map((city) => (
                                   <SelectItem key={city.id} value={city.name}>
                                     {city.name} ({city.state})
                                   </SelectItem>
                                 ))
                               ) : (
                                 <div className="p-4 text-center text-sm text-muted-foreground">
                                   No cities available
                                 </div>
                               )}
                             </SelectContent>
                           </Select>
                         </div>

                         <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                             {/* Ex-Showroom Price */}
                             <div>
                                 <span className="text-xs text-muted-foreground font-medium uppercase">Ex-Showroom Price</span>
                                 <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {hasPrice ? priceLabel : "Price TBA"}
                                 </div>
                             </div>

                             {/* On-Road Price */}
                             {minPriceBreakdown && (
                               <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                                 <span className="text-xs text-muted-foreground font-medium uppercase">On-Road Price ({selectedCity})</span>
                                 <div className="text-2xl font-extrabold text-primary mt-1">
                                    {minPrice === maxPrice || !maxPrice || !maxPriceBreakdown
                                      ? formatINR(minPriceBreakdown.onRoadPrice, true)
                                      : `Rs. ${(minPriceBreakdown.onRoadPrice / 100000).toFixed(2)} - ${(maxPriceBreakdown.onRoadPrice / 100000).toFixed(2)} Lakh`
                                    }
                                 </div>
                                 <p className="text-xs text-muted-foreground mt-2">
                                   Includes GST, RTO, Insurance & Taxes
                                 </p>
                               </div>
                             )}
                         </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                         <Button size="lg" className="w-full font-semibold shadow-lg shadow-primary/20" onClick={() => handleCheckPrice(variants?.[0]?.id)}>
                            <Calculator className="w-4 h-4 mr-2" /> Check On-Road Price
                         </Button>
                         {minPriceBreakdown && <PriceBreakupComponent breakdown={minPriceBreakdown} city={selectedCity} />}
                         <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={handleAddToCompare}>
                                <Plus className="w-4 h-4 mr-2" /> Compare
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="#leads">Get Offers</Link>
                            </Button>
                         </div>
                    </CardContent>
                </Card>

                {/* 2) VARIANT PRICE LIST WIDGET (The Request) */}
                <Card className="overflow-hidden shadow-sm flex flex-col max-h-[600px]">
                    <CardHeader className="bg-slate-50 dark:bg-slate-900/50 py-3 border-b shrink-0">
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>Variants & Pricing</span>
                            <Badge variant="secondary" className="font-normal">{variants.length} Total</Badge>
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-y-auto p-0">
                        {variants.length > 0 ? (
                            <div className="divide-y">
                                {variants.map((variant) => (
                                    <div key={variant.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <h4 className="font-bold text-sm text-foreground">{variant.name}</h4>
                                                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                    <span>{variant.engine ? `${variant.engine}cc` : ""}</span>
                                                    <span>•</span>
                                                    <span>{variant.fuelType}</span>
                                                    <span>•</span>
                                                    <span>{variant.transmission}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-primary text-base">
                                                    {(() => {
                                                        const p = parseINRToRupees(variant.price);
                                                        return p && p > 0 ? formatINR(p, true) : "TBA";
                                                    })()}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">Ex-Showroom</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <Button 
                                                variant="link" 
                                                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                                                onClick={() => setActiveTab("specs")}
                                            >
                                                View Specs
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-xs border-primary/20 hover:bg-primary/5 hover:text-primary"
                                                onClick={() => handleCheckPrice(variant.id)}
                                            >
                                                On-Road Price <ChevronRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Variant pricing coming soon.</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* 3) COMPETITORS WIDGET */}
                <Card>
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base">Alternatives</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {competitors.map((comp) => (
                            <Link key={comp.id} to={`/${comp.brandId}/${comp.slug}`} className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border-b last:border-0">
                                <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-slate-400">{getBrandInitial(comp.brandName)}</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{comp.brandName} {comp.name}</h4>
                                    <p className="text-xs text-muted-foreground">₹{(comp.priceRange?.min || 0)/100000}L Onwards</p>
                                </div>
                                <ArrowRight className="w-4 h-4 ml-auto text-slate-300" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                <AdSlot id="model_sidebar_rectangle" />
            </div>
        </div>
      </div>

      <PriceBreakupModal
        open={priceModalOpen}
        onOpenChange={setPriceModalOpen}
        variantId={selectedVariantId || variants?.[0]?.id || null}
        city={selectedCity}
        brandName={modelData.brandName}
        modelName={modelData.name}
        exShowroomPrice={selectedVariantPrice || undefined}
      />
    </div>
  );
};

export default ModelOverview;