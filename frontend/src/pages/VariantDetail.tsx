import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SpecTable from "@/components/specs/SpecTable";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import { PriceBoxCard } from "@/components/variant/PriceBoxCard";
import { PriceBreakupModal } from "@/components/model/PriceBreakupModal";
import VariantSwitcher from "@/components/variant/VariantSwitcher";
import FeatureGrid from "@/components/variant/FeatureGrid";
import ColorSwatches from "@/components/model/ColorSwatches";
import PhotoGallery from "@/components/model/PhotoGallery";
import VideoEmbed from "@/components/model/VideoEmbed";
import Viewer360 from "@/components/model/Viewer360";
import EMICalculator from "@/components/variant/EMICalculator";
import { LeadsStrip } from "@/components/leads/LeadsStrip";
import { FuelPriceWidget } from "@/components/variant/FuelPriceWidget";
import { getVariant, getVariants, getModel } from "@/lib/data";
import { useVariant, useModel, useVariants } from "@/lib/api-hooks";
import { specsApi } from "@/lib/api";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { parseINRToRupees, formatINR } from "@/lib/guards";
import { useCity } from "@/contexts/CityContext";
import { 
  Plus, Download, Fuel, Settings, Gauge, 
  MapPin, Calculator, Share2, Info, CheckCircle2 
} from "lucide-react";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import AdSlot from "@/components/ads/AdSlot";
import { cn } from "@/lib/utils";

const VariantDetail = () => {
  useScrollToTop();
  const { brand, model: modelSlug, variant: variantSlug } = useParams<{
    brand: string;
    model: string;
    variant: string;
  }>();
  const navigate = useNavigate();

  // --- DATA FETCHING & STATE ---
  const fallbackVariant = brand && modelSlug && variantSlug ? getVariant(brand, modelSlug, variantSlug) : undefined;
  const fallbackModel = brand && modelSlug ? getModel(brand, modelSlug) : undefined;
  const fallbackAllVariants = fallbackModel ? getVariants(fallbackModel.id) : [];

  const { data: apiVariant, isLoading: variantLoading } = useVariant(brand || "", modelSlug || "", variantSlug || "");
  const { data: apiModel, isLoading: modelLoading } = useModel(brand || "", modelSlug || "");
  const { data: apiVariants, isLoading: variantsLoading } = useVariants(apiModel?.id || fallbackModel?.id || "");

  const variantData = apiVariant || fallbackVariant;
  const modelData = apiModel || fallbackModel;
  const loading = variantLoading || modelLoading || variantsLoading;
  const allVariants = apiVariants || fallbackAllVariants;
  const [specs, setSpecs] = useState<any | null>(null);

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("White");
  const { city } = useCity();
  const brandLogo = getBrandLogo(modelData?.brandName);
  const brandInitial = getBrandInitial(modelData?.brandName);

  // --- HELPERS ---
  const mediaData = variantData?.media || modelData?.media || {
    hero: "",
    gallery: Array(12).fill("photo"),
    videoUrl: undefined,
    spin360Url: undefined,
    spinFrames: undefined,
  };
  const carImage = mediaData.hero || modelData?.image || DEFAULT_OG_IMAGE;

  // Features Data
  const featureCategories = [
    {
      title: "Safety",
      features: [
        { name: "6 Airbags", available: true },
        { name: "ABS with EBD", available: true },
        { name: "ESP", available: true },
        { name: "Traction Control", available: true },
        { name: "Hill Hold Assist", available: true },
        { name: "360° Camera", available: false },
        { name: "ADAS Level 2", available: false },
        { name: "TPMS", available: true },
        { name: "ISOFIX", available: true },
      ],
    },
    {
      title: "Comfort",
      features: [
        { name: "Auto Climate Control", available: true },
        { name: "Cruise Control", available: true },
        { name: "Push Button Start", available: true },
        { name: "Rear AC Vents", available: true },
        { name: "Wireless Charger", available: true },
      ],
    },
    {
        title: "Infotainment",
        features: [
          { name: "Touchscreen System", available: true },
          { name: "Android Auto", available: true },
          { name: "Apple CarPlay", available: true },
          { name: "Premium Sound", available: true },
        ],
      },
  ];

  // Price Calculation Logic
  const variantRawPrice = variantData?.price;
  const variantNormalizedPrice = parseINRToRupees(variantRawPrice);
  const specsOverviewRawPrice = specs?.overview?.price;
  const specsOverviewNormalizedPrice = parseINRToRupees(specsOverviewRawPrice);
  
  const getSpecsShowroomRaw = (s: any) => {
    if (!s) return null;
    if (s.overview && s.overview.price) return s.overview.price;
    const extras = s.extras || {};
    const candidates = ["ex_showroom_price", "exShowroomPrice", "showroomPrice"];
    for (const k of candidates) if (extras[k]) return extras[k];
    return null;
  };
  const specsExtrasRawPrice = getSpecsShowroomRaw(specs);
  const specsExtrasNormalizedPrice = parseINRToRupees(specsExtrasRawPrice);
  
  const exShowroomPrice = (variantNormalizedPrice && variantNormalizedPrice > 0)
    ? variantNormalizedPrice
    : (specsExtrasNormalizedPrice && specsExtrasNormalizedPrice > 0)
      ? specsExtrasNormalizedPrice
      : (specsOverviewNormalizedPrice && specsOverviewNormalizedPrice > 0 ? specsOverviewNormalizedPrice : null);

  // --- EFFECTS ---
  useEffect(() => {
    if (variantData && modelData) {
      updateMetaTags({
        title: `${modelData.brandName} ${modelData.name} ${variantData.name} – Specs, Features`,
        description: `Detailed specs of ${modelData.brandName} ${modelData.name} ${variantData.name}.`,
        keywords: [`${variantData.name} price`, `${variantData.name} features`],
        canonical: `${window.location.origin}/${brand}/${modelSlug}/${variantSlug}`,
        ogImage: DEFAULT_OG_IMAGE,
      });
      // Structured data injection omitted for brevity
    }
  }, [variantData, modelData, brand, modelSlug, variantSlug]);

  useEffect(() => {
    if (!variantData) return;
    specsApi.getByVariant(variantData.id).then(setSpecs).catch(() => setSpecs(null));
  }, [variantData]);

  const handleAddToCompare = () => {
    if (variantData) {
      const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
      if (!compareList.includes(variantData.id) && compareList.length < 3) {
        compareList.push(variantData.id);
        localStorage.setItem("compareList", JSON.stringify(compareList));
        window.dispatchEvent(new Event("compareListUpdated"));
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!variantData || !modelData) return <div className="min-h-screen flex items-center justify-center">Not Found</div>;

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
              { label: modelData.name, href: `/${brand}/${modelSlug}` },
              { label: variantData.name },
            ]}
          />
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: VISUALS & TABS (8 Cols) */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 2) HERO CARD */}
                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-slate-200 dark:ring-slate-800">
                    <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-8">
                        {/* Tags */}
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <Badge className="bg-white/90 text-black hover:bg-white">{variantData.fuelType}</Badge>
                            <Badge variant="outline" className="bg-black/5 border-black/10">{variantData.transmission}</Badge>
                        </div>
                        
                        <img 
                            src={carImage} 
                            alt={`${modelData.brandName} ${modelData.name} ${variantData.name}`} 
                            className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
                        />

                        <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-500 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
                             Color: {selectedColor}
                        </div>
                    </div>
                </Card>

                {/* Variant Switcher Section */}
                <div className="bg-white dark:bg-card rounded-xl border p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <Settings className="w-4 h-4" /> Change Variant
                    </div>
                    <VariantSwitcher
                        variants={allVariants}
                        currentVariantId={variantData.id}
                        brandSlug={brand || ""}
                        modelSlug={modelSlug || ""}
                    />
                </div>

                {/* 3) TABS NAVIGATION */}
                <div className="sticky top-14 z-30 bg-slate-50/95 dark:bg-background/95 backdrop-blur-sm -mx-4 px-4 md:mx-0 md:px-0 py-2 border-b">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start h-auto bg-transparent p-0 gap-6 overflow-x-auto no-scrollbar">
                            {["Overview", "Specifications", "Features", "Colors", "Price & EMI", "Media"].map((tab) => (
                                <TabsTrigger 
                                    key={tab} 
                                    value={tab.toLowerCase().replace(/ & /g, "-")}
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3 text-base"
                                >
                                    {tab}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* TAB CONTENTS */}
                        <div className="mt-6 min-h-[500px]">
                            
                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Info className="w-5 h-5 text-primary" /> Key Highlights
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Engine</p>
                                            <p className="font-semibold">{variantData.engine || "N/A"}</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Mileage</p>
                                            <p className="font-semibold text-emerald-600">{variantData.mileage ? `${variantData.mileage} km/l` : "N/A"}</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Seating</p>
                                            <p className="font-semibold">{variantData.seating} Persons</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Transmission</p>
                                            <p className="font-semibold">{variantData.transmission}</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Fuel</p>
                                            <p className="font-semibold">{variantData.fuelType}</p>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-xs text-muted-foreground">Body Type</p>
                                            <p className="font-semibold">{modelData.bodyType}</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6 border-l-4 border-l-blue-500">
                                    <h3 className="text-lg font-semibold mb-2">Verdict</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        The <strong>{variantData.name}</strong> variant strikes a balance between features and affordability. 
                                        With {variantData.fuelType} efficiency and essential comforts like {featureCategories[1].features[0].name}, 
                                        it is a solid choice for {modelData.bodyType} buyers.
                                    </p>
                                </Card>
                            </TabsContent>

                            {/* SPECIFICATIONS TAB */}
                            <TabsContent value="specifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                {/* Dimensions Diagram */}
                                <Card>
                                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b py-3">
                                        <CardTitle className="text-base">Dimensions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center">
                                            <p className="mb-6 text-sm text-muted-foreground w-full">Detailed exterior measurements.</p>

                                        </div>
                                        <Table className="mt-6">
                                            <TableBody>
                                                <TableRow><TableCell className="font-medium">Length</TableCell><TableCell className="text-right">{specs?.dimensions?.length || "4000"} mm</TableCell></TableRow>
                                                <TableRow><TableCell className="font-medium">Width</TableCell><TableCell className="text-right">{specs?.dimensions?.width || "1700"} mm</TableCell></TableRow>
                                                <TableRow><TableCell className="font-medium">Height</TableCell><TableCell className="text-right">{specs?.dimensions?.height || "1500"} mm</TableCell></TableRow>
                                                <TableRow><TableCell className="font-medium">Wheelbase</TableCell><TableCell className="text-right">{specs?.dimensions?.wheelbase || "2500"} mm</TableCell></TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>

                                <SpecTable
                                    title="Engine & Performance"
                                    rows={[
                                        { label: 'Displacement', value: specs?.engine?.engine_cc ?? variantData.engine },
                                        { label: 'Max Power', value: specs?.engine?.power || "115 BHP @ 6000 rpm" },
                                        { label: 'Max Torque', value: specs?.engine?.torque || "144 Nm @ 4500 rpm" },
                                        { label: 'ARAI Mileage', value: (specs?.performance?.mileage ?? variantData.mileage) + ' km/l' },
                                    ]}
                                />
                                
                                <SpecTable
                                    title="Brakes & Suspension"
                                    rows={[
                                        { label: 'Front Brakes', value: 'Disc' },
                                        { label: 'Rear Brakes', value: 'Drum' },
                                        { label: 'Front Suspension', value: 'MacPherson Strut' },
                                        { label: 'Rear Suspension', value: 'Torsion Beam' },
                                    ]}
                                />
                            </TabsContent>

                            {/* FEATURES TAB */}
                            <TabsContent value="features" className="animate-in fade-in slide-in-from-bottom-2">
                                <FeatureGrid categories={featureCategories} />
                            </TabsContent>

                            {/* COLORS TAB */}
                            <TabsContent value="colors" className="animate-in fade-in slide-in-from-bottom-2">
                                <Card className="p-8">
                                    <h3 className="text-lg font-semibold mb-6">Available Colors</h3>
                                    <ColorSwatches colors={variantData.colors || []} onColorChange={setSelectedColor} />
                                </Card>
                            </TabsContent>

                            {/* PRICE & EMI TAB */}
                            <TabsContent value="price-emi" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                <EMICalculator defaultAmount={exShowroomPrice || 500000} />
                                <FuelPriceWidget />
                            </TabsContent>

                            {/* MEDIA TAB */}
                            <TabsContent value="media" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                                {mediaData.videoUrl && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Official Video</h3>
                                        <VideoEmbed videoUrl={mediaData.videoUrl} title="Official Video" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Image Gallery</h3>
                                    <PhotoGallery photos={mediaData.gallery} modelName={modelData.name} brandName={modelData.brandName} />
                                </div>
                            </TabsContent>

                        </div>
                    </Tabs>
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
                
                {/* 1) STICKY VARIANT PRICE CARD */}
                <Card className="sticky top-24 border-t-4 border-t-primary shadow-md z-20">
                    <CardHeader className="pb-4">
                         <div className="flex items-center gap-3 mb-3">
                             {brandLogo ? (
                                <img src={brandLogo} alt={modelData.brandName} className="w-8 h-8 object-contain" />
                             ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{brandInitial}</div>
                             )}
                             <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{modelData.brandName}</span>
                         </div>
                         <h1 className="text-2xl font-bold tracking-tight leading-snug">{modelData.name} {variantData.name}</h1>
                         
                         <div className="mt-4 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                             <div className="flex items-center justify-between mb-1">
                                 <span className="text-xs text-muted-foreground font-medium uppercase">Ex-Showroom Price</span>
                                 {city && <div className="flex items-center text-xs text-muted-foreground"><MapPin className="w-3 h-3 mr-1" /> {city}</div>}
                             </div>
                             <div className="text-3xl font-extrabold text-primary">
                                {exShowroomPrice ? formatINR(exShowroomPrice, true) : "TBA"}
                             </div>
                             <p className="text-xs text-muted-foreground mt-1">*Get on-road price for exact figures</p>
                         </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                         <Button size="lg" className="w-full font-semibold shadow-lg shadow-primary/20" onClick={() => setPriceModalOpen(true)}>
                            <Calculator className="w-4 h-4 mr-2" /> Check On-Road Price
                         </Button>
                         <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={handleAddToCompare}>
                                <Plus className="w-4 h-4 mr-2" /> Compare
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="#leads">Get Offers</Link>
                            </Button>
                         </div>
                         
                         {/* Quick Facts List */}
                         <div className="pt-4 border-t mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Engine</span>
                                <span className="font-medium">{variantData.engine}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Power</span>
                                <span className="font-medium">{specs?.engine?.power || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Boot Space</span>
                                <span className="font-medium">{specs?.capacity?.boot_space || "N/A"}</span>
                            </div>
                         </div>
                    </CardContent>
                </Card>

                <AdSlot id="variant_sidebar_rectangle" />
            </div>
        </div>
      </div>

      <PriceBreakupModal
        open={priceModalOpen}
        onOpenChange={setPriceModalOpen}
        variantId={variantData.id}
        city={city}
        brandName={modelData.brandName}
        modelName={modelData.name}
      />
    </div>
  );
};

export default VariantDetail;