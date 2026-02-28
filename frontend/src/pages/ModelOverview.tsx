import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import VariantTable from "@/components/model/VariantTable";
import ColorImageGallery from "@/components/model/ColorImageGallery";
import { PriceBreakupModal } from "@/components/model/PriceBreakupModal";
import { calculatePriceBreakdown, calculatePriceBreakdownWithConfig, getStateFromCity } from "@/lib/priceCalculations";
import PhotoGallery from "@/components/model/PhotoGallery";
import VideoEmbed from "@/components/model/VideoEmbed";
import Viewer360 from "@/components/model/Viewer360";
import { LeadsStrip } from "@/components/leads/LeadsStrip";
import { useModel, useVariants, useModels } from "@/lib/api-hooks";
import { specsApi, citiesApi } from "@/lib/api";
import { getColorImageGallery, getDualToneColorImageGallery } from "@/lib/images";
import { updateMetaTags, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import { useCity } from "@/contexts/CityContext";
import { useToast } from "@/hooks/use-toast";
import { Variant } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
    Calculator, Plus, ChevronRight, ChevronLeft, Star, 
    Fuel, Gauge, Settings, ShieldCheck, 
    CheckCircle2, XCircle, MapPin, ArrowRight, Info, 
    Cog,
    Repeat
} from "lucide-react";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import AdSlot from "@/components/ads/AdSlot";
import { cn } from "@/lib/utils";

// Helper function to render HTML content from ReactQuill
const renderHtmlContent = (html?: string) => {
  if (!html) return null;
  return (
    <div 
      className="prose prose-sm max-w-none text-foreground leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3 [&_li]:mb-1 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const countWords = (text: string) => {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0;
};

const parseProsConsFromString = (raw?: string): { pros: string[]; cons: string[] } => {
  if (!raw) return { pros: [], cons: [] };
  const parts = raw.split(/\n---\n/);
  const prosList = (parts[0] || "")
    .trim()
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
  const consList = (parts[1] || "")
    .trim()
    .split("\n")
    .map((c) => c.trim())
    .filter(Boolean);
  return { pros: prosList, cons: consList };
};

const parseFaqsFromString = (raw?: string) => {
  if (!raw) return [];
  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const items = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const qLine = lines.find((line) => /^q:\s*/i.test(line));
    const aIndex = lines.findIndex((line) => /^a:\s*/i.test(line));

    if (qLine && aIndex >= 0) {
      const question = qLine.replace(/^q:\s*/i, "").trim();
      const answer = lines.slice(aIndex).join("\n").replace(/^a:\s*/i, "").trim();
      if (question && answer) items.push({ question, answer });
    }
  }

  return items;
};

interface DualToneColor {
    name: string;
    primary: string;
    secondary: string;
}

const ModelOverview = () => {
  useScrollToTop();
  const { brand, model: modelSlug } = useParams<{ brand: string; model: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
  const { city } = useCity();

  // Refs for smooth scrolling
  const variantsRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const colorsRef = useRef<HTMLDivElement>(null);
  const photosRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | DualToneColor>("White");
  const [selectedCity, setSelectedCity] = useState<string>(city || "Delhi NCR");
  const [selectedFuelType, setSelectedFuelType] = useState<string>("petrol");
  const [activeTab, setActiveTab] = useState<"overview" | "variants" | "specs" | "colors" | "photos" | "faq">("overview");
  const [activePhotoTab, setActivePhotoTab] = useState<"gallery" | "interior" | "exterior" | "video">("gallery");
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
    const galleryImages = useMemo(() => {
        const images = (modelData?.gallery && Array.isArray(modelData.gallery) ? modelData.gallery : mediaData.gallery || []).filter(Boolean);
        // Fallback to model.image if no gallery images
        if (images.length === 0 && modelData?.image) {
            return [modelData.image];
        }
        return images;
    }, [modelData?.gallery, modelData?.image, mediaData.gallery]);

    const carImage = galleryImages[0] || mediaData.hero || modelData?.image || DEFAULT_OG_IMAGE;
  
    const parsedDualToneColors = useMemo(() => {
        const dualToneData =
            specs?.exterior?.dual_tone_color_names ||
            specs?.exterior?.exterior_dual_tone_color_names ||
            specs?.exterior?.dual_tone_colors ||
            specs?.exterior?.dualToneColors ||
            specs?.exterior?.dualToneColorNames ||
            specs?.dual_tone_color_names ||
            specs?.exterior_dual_tone_color_names ||
            specs?.dual_tone_colors ||
            specs?.dualToneColors ||
            specs?.dualToneColorNames ||
            specs?.extras?.dual_tone_color_names ||
            specs?.extras?.exterior_dual_tone_color_names ||
            specs?.extras?.dual_tone_colors ||
            specs?.extras?.dualToneColors ||
            specs?.extras?.dualToneColorNames ||
            specs?.extras?.exterior?.dual_tone_color_names ||
            specs?.extras?.exterior?.dual_tone_colors;

        let dualToneColors: DualToneColor[] = [];

        if (Array.isArray(dualToneData)) {
            if (dualToneData.length > 0 && typeof dualToneData[0] === "object" && "name" in dualToneData[0]) {
                dualToneColors = dualToneData as DualToneColor[];
            } else if (dualToneData.length > 0 && typeof dualToneData[0] === "string") {
                dualToneColors = dualToneData.map((colorStr: string) => {
                    const parts = colorStr.split(" with ");
                    return {
                        name: colorStr.trim(),
                        primary: parts[0]?.trim() || "",
                        secondary: parts[1]?.trim() || "",
                    };
                });
            }
        } else if (typeof dualToneData === "string" && dualToneData.length > 0) {
            dualToneColors = dualToneData
                .split(",")
                .map((colorStr: string) => {
                    const colorTrim = colorStr.trim();
                    const parts = colorTrim.split(" with ");
                    return {
                        name: colorTrim,
                        primary: parts[0]?.trim() || "",
                        secondary: parts[1]?.trim() || "",
                    };
                })
                .filter((c) => c.primary && c.secondary);
        }

        return dualToneColors;
    }, [specs?.exterior?.dual_tone_color_names, specs?.exterior?.exterior_dual_tone_color_names, specs?.exterior?.dual_tone_colors, specs?.exterior?.dualToneColors, specs?.exterior?.dualToneColorNames, specs?.dual_tone_color_names, specs?.exterior_dual_tone_color_names, specs?.dual_tone_colors, specs?.dualToneColors, specs?.dualToneColorNames, specs?.extras]);

    // Get colors from specs or variant
  const colors = useMemo(() => {
    // Check multiple possible locations for colors in specs
    const colorsFromSpecs = 
      specs?.exterior?.monotone_color_names || 
      specs?.exterior?.colors ||
      specs?.exterior?.body_colours ||
      specs?.colors ||
      specs?.exterior_monotone_color_names ||
      specs?.exterior_colors ||
      specs?.available_colors ||
      specs?.color_names ||
      specs?.extras?.exterior_monotone_color_names ||
      specs?.extras?.monotone_colors ||
      specs?.extras?.colors ||
      specs?.extras?.available_colors ||
      specs?.extras?.body_colours;
    
    const colorsFromVariant = variants?.[0]?.colors;
    const defaultColors = ["White", "Black", "Silver", "Red", "Blue"];
    
    // Ensure result is always an array
    let result: string[] = [];
    
        if (Array.isArray(colorsFromSpecs)) {
            if (colorsFromSpecs.length === 1 && typeof colorsFromSpecs[0] === "string") {
                const raw = colorsFromSpecs[0];
                if (raw.includes(",")) {
                    result = raw
                        .split(",")
                        .map((c: string) => c.trim())
                        .filter((c: string) => c.length > 0);
                } else {
                    result = colorsFromSpecs as string[];
                }
            } else {
                result = colorsFromSpecs as string[];
            }
    } else if (typeof colorsFromSpecs === 'string') {
      // Split by comma and trim whitespace
      result = colorsFromSpecs
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0);
    } else if (Array.isArray(colorsFromVariant)) {
            if (colorsFromVariant.length === 1 && typeof colorsFromVariant[0] === "string") {
                const raw = colorsFromVariant[0];
                if (raw.includes(",")) {
                    result = raw
                        .split(",")
                        .map((c: string) => c.trim())
                        .filter((c: string) => c.length > 0);
                } else {
                    result = colorsFromVariant as string[];
                }
            } else {
                result = colorsFromVariant as string[];
            }
    } else if (typeof colorsFromVariant === 'string') {
      result = colorsFromVariant.split(',').map(c => c.trim()).filter(Boolean);
    } else {
      result = defaultColors;
    }
    
    console.log("🎨 Colors Debug (ModelOverview):", {
      fromSpecs: colorsFromSpecs,
      fromVariant: colorsFromVariant,
      finalResult: result
    });
    
    return result;
    }, [specs?.exterior?.monotone_color_names, specs?.exterior?.colors, specs?.exterior?.body_colours, specs?.colors, specs?.exterior_monotone_color_names, specs?.exterior_colors, specs?.available_colors, specs?.color_names, specs?.extras, variants]);

  // Color-based image gallery
  const colorImages = useMemo(() => {
    if (!colors || colors.length === 0) return {};
        return getColorImageGallery(brand || "", modelSlug || "", "", colors, galleryImages, parsedDualToneColors);
    }, [colors, brand, modelSlug, galleryImages, parsedDualToneColors]);

    const dualToneColorImages = useMemo(() => {
        if (!parsedDualToneColors || parsedDualToneColors.length === 0) return {};
        return getDualToneColorImageGallery(brand || "", modelSlug || "", "", parsedDualToneColors, galleryImages);
    }, [brand, modelSlug, parsedDualToneColors, galleryImages]);

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



  interface VariantTableProps {
    variants: Variant[];
    brandSlug: string;
    modelSlug: string;
  }
  

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
            const rawList = JSON.parse(localStorage.getItem("compareList") || "[]");
            const compareList = Array.isArray(rawList)
                ? rawList.filter((item) => typeof item === "string")
                : [];

            if (!compareList.includes(variants[0].id) && compareList.length < 3) {
                compareList.push(variants[0].id);
                localStorage.setItem("compareList", JSON.stringify(compareList));
                window.dispatchEvent(new Event("compareListUpdated"));
            }

            const validVariants = compareList.filter((v: string) => v !== null && v !== undefined);
            navigate(`/compare?v=${validVariants.join(",")}`);
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
    <div className="min-h-screen bg-background pb-12">
      
      {/* 1) HEADER & BREADCRUMBS */}
      <div className="bg-card border-b border-border sticky top-0 z-40 shadow-premium-sm">
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
                
                {/* HERO CARD using shared PhotoGallery */}
                <Card className="overflow-hidden border border-border shadow-premium-lg">
                    <div className="relative bg-transparent p-0">
                        {/* Rating Badge */}
                        {/* {modelData.rating && (
                            <div className="absolute top-4 left-4 z-10 bg-card/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-premium-md text-sm font-semibold border border-border">
                                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                                <span>{modelData.rating.toFixed(1)}</span>
                                <span className="text-muted-foreground font-normal text-xs">({modelData.reviews?.toLocaleString()} reviews)</span>
                            </div>
                        )} */}
                        
                        <PhotoGallery photos={galleryImages} modelName={modelData.name} brandName={modelData.brandName} mode="hero" />
                    </div>


                                        {/* Quick Specs Strip */}
                    <div className="bg-card border-t border-border grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                             <Fuel className="w-5 h-5 text-primary" />
                             <span className="text-xs text-muted-foreground">Fuel Type</span>
                             <span className="font-semibold text-sm text-primary">{variants?.[0]?.fuelType || "Petrol/Diesel"}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                             <Repeat className="w-5 h-5 text-primary" />
                             <span className="text-xs text-muted-foreground">Transmission</span>
                             <span className="font-semibold text-sm text-primary">Manual / Auto</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                             <Gauge className="w-5 h-5 text-primary" />
                             <span className="text-xs text-muted-foreground">Mileage</span>
                             <span className="font-semibold text-sm text-primary">{primaryMileage ? `${primaryMileage} km/l` : "TBA"}</span>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                             <ShieldCheck className="w-5 h-5 text-primary" />
                             <span className="text-xs text-muted-foreground">Safety</span>
                             <span className="font-semibold text-sm text-primary">Up to 6 Airbags</span>
                        </div>
                    </div>
                </Card>

                {/* TABS NAVIGATION */}
                <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-sm -mx-4 px-4 md:mx-0 md:px-0 py-2 border-b border-border">
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="w-full justify-start h-auto bg-transparent p-0 gap-6 overflow-x-auto no-scrollbar">
                            {["Overview", "Variants", "Specs", "Colors", "Photos", "FAQ"].map((tab) => (
                                <TabsTrigger 
                                    key={tab} 
                                    value={tab.toLowerCase()}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary px-2 py-3 text-base"
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
                            {/* Overview Section - Like CarDekho/CarWale */}
                            <Card className="border-l-4 border-l-primary shadow-premium-md">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                                        {modelData.brandName} {modelData.name} Overview
                                    </CardTitle>
                                    <CardDescription className="text-base mt-2">
                                        {specs?.overview?.summary || `Explore the ${modelData.brandName} ${modelData.name}, a premium ${modelData.bodyType} designed for modern drivers.`}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Main Description */}
                                    {(specs?.overview?.description || specs?.overview?.vehicle_overview) ? (
                                        <div className="prose dark:prose-invert max-w-none">
                                            <p className="text-foreground leading-relaxed whitespace-pre-line">
                                                {specs.overview.description || specs.overview.vehicle_overview}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="prose dark:prose-invert max-w-none">
                                            <p className="text-muted-foreground leading-relaxed">
                                                The {modelData.brandName} {modelData.name} is a {modelData.bodyType?.toLowerCase()} that combines style, 
                                                performance, and advanced features. With {variants.length} variant options available, it caters to diverse 
                                                customer preferences. The model is equipped with modern technology and safety features, making it a 
                                                competitive choice in its segment.
                                            </p>
                                        </div>
                                    )}

                                    {/* Key Highlights Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <Fuel className="w-6 h-6 mx-auto mb-2 text-primary" />
                                            <p className="text-xs text-muted-foreground mb-1">Fuel Type</p>
                                            <p className="font-semibold text-sm text-primary">
                                                {modelData.fuelTypes?.join("/") || variants?.[0]?.fuelType || "Petrol"}
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <Repeat className="w-6 h-6 mx-auto mb-2 text-primary" />
                                            <p className="text-xs text-muted-foreground mb-1">Transmission</p>
                                            <p className="font-semibold text-sm text-primary">
                                                {[...new Set(variants.map(v => v.transmission))].join("/") || "Manual"}
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <Gauge className="w-6 h-6 mx-auto mb-2 text-primary" />
                                            <p className="text-xs text-muted-foreground mb-1">Mileage</p>
                                            <p className="font-semibold text-sm text-primary">
                                                {primaryMileage ? `${primaryMileage} km/l` : "Varies"}
                                            </p>
                                        </div>
                                        <div className="text-center p-3 bg-muted rounded-lg">
                                            <ShieldCheck className="w-6 h-6 mx-auto mb-2 text-primary" />
                                            <p className="text-xs text-muted-foreground mb-1">Seating</p>
                                            <p className="font-semibold text-sm text-primary">
                                                {specs?.capacity?.seatingCapacity || "5 Seater"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Feature Highlights */}
                            {specs?.features && Object.keys(specs.features).length > 0 && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Key Features & Equipment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {Object.entries(specs.features)
                                                .filter(([_, value]) => value && value !== "No" && value !== "N/A")
                                                .slice(0, 12)
                                                .map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2 p-2 bg-muted rounded-md border border-primary/20">
                                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="text-sm text-foreground capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Model Overview Content */}
                            {modelData?.modelOverview && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Model Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.modelOverview)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Variant Lineup */}
                            {modelData?.variantLineup && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Variant Lineup & Pricing</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.variantLineup)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Engine & Transmission Overview */}
                            {modelData?.engineTransmission && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Engine & Transmission</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.engineTransmission)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Mileage Explanation */}
                            {modelData?.mileageExplanation && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Mileage & Efficiency</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.mileageExplanation)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Features Highlight Content */}
                            {modelData?.featuresHighlight && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Features & Equipment</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.featuresHighlight)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Safety Overview */}
                            {modelData?.safetyOverview && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Safety Features</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.safetyOverview)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Interior Overview */}
                            {modelData?.interiorOverview && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Interior Design</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.interiorOverview)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Exterior Overview */}
                            {modelData?.exteriorOverview && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Exterior Design</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.exteriorOverview)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Ride & Handling */}
                            {modelData?.rideHandling && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Ride & Handling</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.rideHandling)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Ownership Cost Insight */}
                            {modelData?.ownershipCost && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Ownership Cost</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.ownershipCost)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Pros & Cons */}
                            {modelData?.modelProsCons && (() => {
                              const { pros, cons } = parseProsConsFromString(modelData.modelProsCons);
                              return (pros.length > 0 || cons.length > 0) ? (
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="text-xl font-bold mb-4">Strengths & Considerations</h3>
                                    <p className="text-sm text-muted-foreground">What makes {modelData.name} stand out</p>
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-6">
                                    {pros.length > 0 && (
                                      <Card className="p-6 md:p-8 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
                                        <div className="flex items-center gap-3 mb-5">
                                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                            <span className="text-lg font-bold text-green-600">✓</span>
                                          </div>
                                          <h4 className="text-lg font-semibold text-green-700 dark:text-green-400">Pros</h4>
                                        </div>
                                        <ul className="space-y-3">
                                          {pros.map((pro, index) => (
                                            <li key={index} className="text-sm text-muted-foreground flex gap-3">
                                              <span className="text-green-600 font-bold mt-0.5">•</span>
                                              <span>{pro}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </Card>
                                    )}
                                    {cons.length > 0 && (
                                      <Card className="p-6 md:p-8 border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20">
                                        <div className="flex items-center gap-3 mb-5">
                                          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                            <span className="text-lg font-bold text-orange-600">!</span>
                                          </div>
                                          <h4 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Cons</h4>
                                        </div>
                                        <ul className="space-y-3">
                                          {cons.map((con, index) => (
                                            <li key={index} className="text-sm text-muted-foreground flex gap-3">
                                              <span className="text-orange-600 font-bold mt-0.5">•</span>
                                              <span>{con}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </Card>
                                    )}
                                  </div>
                                </div>
                              ) : null;
                            })()}

                            {/* Competitors Section */}
                            {modelData?.competitorsSection && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Competitors & Comparison</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.competitorsSection)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Expert Verdict */}
                            {modelData?.expertVerdict && (
                                <Card className="shadow-premium-sm border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-950/20">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                            <span>⭐</span> Expert Verdict
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.expertVerdict)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Hero Section Content */}
                            {modelData?.heroSectionContent && (
                                <Card className="shadow-premium-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-bold text-primary">Quick Overview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {renderHtmlContent(modelData.heroSectionContent)}
                                    </CardContent>
                                </Card>
                            )}

                            {/* On-road price breakdown removed per request */}
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
                                                            {colors.length === 0 && parsedDualToneColors.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                                                    <p>No colors configured for this model</p>
                                </div>
                                                            ) : (
                                <ColorImageGallery
                                  colors={colors}
                                                                    dualToneColors={parsedDualToneColors}
                                  colorImages={colorImages}
                                                                    dualToneColorImages={dualToneColorImages}
                                  modelName={modelData?.name || ""}
                                  brandName={modelData?.brandName}
                                                                    onColorChange={setSelectedColor}
                                />
                              )}
                            </Card>
                        </div>
                    )}

                     {activeTab === "photos" && (
                        <div ref={photosRef} className="space-y-6">
                            {/* Photo Tabs */}
                            <div className="border-b border-border">
                                <div className="flex gap-6 overflow-x-auto">
                                    <button
                                        onClick={() => setActivePhotoTab("gallery")}
                                        className={cn(
                                            "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                            activePhotoTab === "gallery"
                                                ? "border-b-primary text-foreground"
                                                : "border-b-transparent text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Image Gallery
                                    </button>
                                    {modelData?.interiorImages && modelData.interiorImages.length > 0 && (
                                        <button
                                            onClick={() => setActivePhotoTab("interior")}
                                            className={cn(
                                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                                activePhotoTab === "interior"
                                                    ? "border-b-primary text-foreground"
                                                    : "border-b-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            Interior Photo
                                        </button>
                                    )}
                                    {modelData?.exteriorImages && modelData.exteriorImages.length > 0 && (
                                        <button
                                            onClick={() => setActivePhotoTab("exterior")}
                                            className={cn(
                                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                                activePhotoTab === "exterior"
                                                    ? "border-b-primary text-foreground"
                                                    : "border-b-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            Exterior Photo
                                        </button>
                                    )}
                                    {(modelData?.youtubeUrl || modelData?.videoUrl) && (
                                        <button
                                            onClick={() => setActivePhotoTab("video")}
                                            className={cn(
                                                "px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                                activePhotoTab === "video"
                                                    ? "border-b-primary text-foreground"
                                                    : "border-b-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            Video
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Image Gallery Tab */}
                            {activePhotoTab === "gallery" && (
                                <div className="space-y-4">
                                    <PhotoGallery photos={galleryImages} modelName={modelData.name} brandName={modelData.brandName} />
                                </div>
                            )}

                            {/* Interior Photos Tab */}
                            {activePhotoTab === "interior" && modelData?.interiorImages && modelData.interiorImages.length > 0 && (
                                <div className="space-y-4">
                                    <PhotoGallery photos={modelData.interiorImages} modelName={modelData.name} brandName={modelData.brandName} />
                                </div>
                            )}

                            {/* Exterior Photos Tab */}
                            {activePhotoTab === "exterior" && modelData?.exteriorImages && modelData.exteriorImages.length > 0 && (
                                <div className="space-y-4">
                                    <PhotoGallery photos={modelData.exteriorImages} modelName={modelData.name} brandName={modelData.brandName} />
                                </div>
                            )}

                            {/* Video Tab */}
                            {activePhotoTab === "video" && (
                                <div className="space-y-6">
                                    {modelData?.youtubeUrl && (
                                        <div className="space-y-3">
                                            <h3 className="text-lg font-semibold">YouTube Video</h3>
                                            <VideoEmbed videoUrl={modelData.youtubeUrl} title={modelData.name} />
                                        </div>
                                    )}
                                    {modelData?.videoUrl && (
                                        <div className="space-y-3">
                                            <h3 className="text-lg font-semibold">Model Showcase Video</h3>
                                            <video
                                                width="100%"
                                                height="auto"
                                                controls
                                                className="rounded-lg bg-black"
                                                poster={modelData.image}
                                            >
                                                <source src={modelData.videoUrl} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "faq" && (
                         <div ref={faqRef} className="space-y-6">
                            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
                            
                            {/* FAQ Content from Model */}
                            {modelData?.modelFaqs && (() => {
                              const faqItems = parseFaqsFromString(modelData.modelFaqs);
                              return faqItems.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                  {faqItems.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                                      <AccordionContent className="text-muted-foreground">
                                        {faq.answer}
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              ) : null;
                            })()}

                            {/* Default FAQs - Show if no custom FAQs */}
                            {!modelData?.modelFaqs && (
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
                            )}
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
                <Card className="border-t-4 border-t-primary shadow-premium-lg">
                    <CardHeader className="pb-4">
                         <div className="flex items-center gap-3 mb-2">
                                      {brandLogo ? (
                                          <img src={brandLogo} alt={modelData.brandName} className="w-8 h-8 object-contain" loading="lazy" />
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

                         <div className="bg-muted rounded-xl p-4 border border-border space-y-3">
                             {/* Ex-Showroom Price */}
                             <div>
                                 <span className="text-xs text-muted-foreground font-medium uppercase">Ex-Showroom Price</span>
                                 <div className="text-2xl font-bold text-primary">
                                    {hasPrice ? priceLabel : "Price TBA"}
                                 </div>
                             </div>

                             {/* On-Road Price */}
                             {minPriceBreakdown && (
                               <div className="pt-3 border-t border-border">
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
                                 <Button size="lg" className="w-full font-semibold bg-primary hover:bg-primary-light text-primary-foreground shadow-premium-md" onClick={() => handleCheckPrice(variants?.[0]?.id)}>
                                     <Calculator className="w-4 h-4 mr-2" /> Check On-Road Price
                                 </Button>
                          </CardContent>
                </Card>

                {/* 2) VARIANT PRICE LIST WIDGET (The Request) */}
                <Card className="overflow-hidden shadow-premium-md flex flex-col max-h-[600px]">
                    <CardHeader className="bg-muted py-3 border-b border-border shrink-0">
                        <CardTitle className="text-base flex items-center justify-between">
                            <span>Variants & Pricing</span>
                            <Badge variant="secondary" className="font-normal">{variants.length} Total</Badge>
                        </CardTitle>
                    </CardHeader>
                    <div className="overflow-y-auto p-0">
                        {variants.length > 0 ? (
                            <div className="divide-y divide-border">
                                {variants.map((variant) => (
                                    <div key={variant.id} className="p-4 hover:bg-muted transition-colors group">
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
                                           <Link to={`/${brand}/${modelSlug}/${variant.slug}`}>
                                            <Button 
                                                variant="link" 
                                                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
                                            >
                                                View Specs
                                            </Button>
                                         </Link>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-xs border-primary/30 hover:bg-muted hover:text-primary hover:border-primary"
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
                <Card className="shadow-premium-sm">
                    <CardHeader className="pb-3 border-b border-border">
                        <CardTitle className="text-base">Alternatives</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {competitors.map((comp) => (
                            <Link key={comp.id} to={`/${comp.brandId}/${comp.slug}`} className="flex items-center gap-4 p-4 hover:bg-muted transition-colors border-b border-border last:border-0">
                                <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-muted-foreground">{getBrandInitial(comp.brandName)}</span>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm">{comp.brandName} {comp.name}</h4>
                                    <p className="text-xs text-muted-foreground">₹{(comp.priceRange?.min || 0)/100000}L Onwards</p>
                                </div>
                                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
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