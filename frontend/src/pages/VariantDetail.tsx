import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SpecTable from "@/components/specs/SpecTable";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import { PriceBoxCard } from "@/components/variant/PriceBoxCard";
import { PriceBreakupModal } from "@/components/model/PriceBreakupModal";
import { PriceBreakupComponent } from "@/components/variant/PriceBreakupComponent";
import { VariantPriceCalculator } from "@/components/pricing/VariantPriceCalculator";
import { calculatePriceBreakdown, calculatePriceBreakdownWithConfig, getStateFromCity } from "@/lib/priceCalculations";
import VariantSwitcher from "@/components/variant/VariantSwitcher";
import FeatureGrid from "@/components/variant/FeatureGrid";
import ColorSwatches from "@/components/model/ColorSwatches";
import ColorImageGallery from "@/components/model/ColorImageGallery";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhotoGallery from "@/components/model/PhotoGallery";
import VideoEmbed from "@/components/model/VideoEmbed";
import Viewer360 from "@/components/model/Viewer360";
import EMICalculator from "@/components/variant/EMICalculator";
import { LeadsStrip } from "@/components/leads/LeadsStrip";
import { FuelPriceWidget } from "@/components/variant/FuelPriceWidget";
import { useVariant, useModel, useVariants } from "@/lib/api-hooks";
import { specsApi, citiesApi } from "@/lib/api";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { parseINRToRupees, formatINR } from "@/lib/guards";
import { getColorImageGallery, getDualToneColorImageGallery } from "@/lib/images";
import { useCity } from "@/contexts/CityContext";
import {
  Plus, Download, Fuel, Settings, Gauge,
  MapPin, Calculator, Share2, Info, CheckCircle2,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import AdSlot from "@/components/ads/AdSlot";
import { cn } from "@/lib/utils";

interface DualToneColor {
  name: string;
  primary: string;
  secondary: string;
}

const VariantDetail = () => {
  useScrollToTop();
  const { brand, model: modelSlug, variant: variantSlug } = useParams<{
    brand: string;
    model: string;
    variant: string;
  }>();

  // --- DATA FETCHING & STATE (Backend Only - No Fallback) ---
  const { data: variantData, isLoading: variantLoading } = useVariant(brand || "", modelSlug || "", variantSlug || "");
  const { data: modelData, isLoading: modelLoading } = useModel(brand || "", modelSlug || "");
  const { data: allVariants, isLoading: variantsLoading } = useVariants(modelData?.id || "");

  const loading = variantLoading || modelLoading || variantsLoading;
  const [specs, setSpecs] = useState<any | null>(null);

  // Get city from context and share selection globally
  const { city, setCity } = useCity();

  // Price Calculation Logic - MUST BE BEFORE STATE THAT USES IT
  const variantRawPrice = variantData?.exShowroomPrice ?? variantData?.price;
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

  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | DualToneColor>("White");
  const [selectedCity, setSelectedCity] = useState<string>(city || "Delhi NCR");
  const [cities, setCities] = useState<Array<{ id: string; name: string; state: string; slug: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  // Fetch cities from backend (single source of truth)
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        const allCities = await citiesApi.getAll();
        setCities(allCities || []);
      } catch (error) {
        console.error("Failed to fetch cities for selector:", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);
  const brandLogo = getBrandLogo(modelData?.brandName);
  const brandInitial = getBrandInitial(modelData?.brandName);

  // City-wise pricing - fetch state tax config from backend and prefer backend values
  const [priceBreakdown, setPriceBreakdown] = useState<any | null>(
    exShowroomPrice ? null : null
  );
  const selectedState = getStateFromCity(selectedCity);

  useEffect(() => {
    let cancelled = false;
    const compute = async () => {
      if (!exShowroomPrice) {
        setPriceBreakdown(null);
        return;
      }

      try {
        if (variantData?.id) {
          // Add timestamp to prevent caching and force fresh data
          const timestamp = new Date().getTime();
          const resp = await fetch(
            `/api/pricing/variant/${variantData.id}/price?state=${encodeURIComponent(selectedState)}&city=${encodeURIComponent(selectedCity)}&_t=${timestamp}`,
            {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            }
          );
          if (resp.ok) {
            const json = await resp.json();
            console.log('Fetched price breakdown from backend:', json.breakdown, 'for state:', selectedState, 'city:', selectedCity);
            if (!cancelled) setPriceBreakdown(json.breakdown);
            return;
          } else {
            console.warn('Backend pricing API failed:', resp.status, resp.statusText);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch backend pricing, using fallback:', err);
      }

      // If backend fails, do not fallback; indicate unavailable
      if (!cancelled) setPriceBreakdown(null);
    };

    compute();
    return () => {
      cancelled = true;
    };
  }, [exShowroomPrice, selectedCity, selectedState, variantData?.id]);

  // --- HELPERS ---
  const mediaData = variantData?.media || modelData?.media || {
    hero: "",
    gallery: Array(12).fill("photo"),
    videoUrl: undefined,
    spin360Url: undefined,
    spinFrames: undefined,
  };
  const galleryImages = useMemo(() => {
    // Try: modelData.gallery, then mediaData.gallery, then specs.media.gallery
    let images = [];
    
    if (modelData?.gallery && Array.isArray(modelData.gallery)) {
      images = modelData.gallery;
    } else if (mediaData.gallery && Array.isArray(mediaData.gallery)) {
      images = mediaData.gallery;
    } else if (specs?.media?.gallery && Array.isArray(specs.media.gallery)) {
      images = specs.media.gallery;
    }
    
    images = images.filter(Boolean);
    
    // Fallback to model.image if no gallery images
    if (images.length === 0 && modelData?.image) {
      images = [modelData.image];
    }
    
    console.log("🖼️ GALLERY IMAGES DEBUG:", {
      count: images.length,
      allUrls: images,
      filenames: images.map(url => {
        const parts = url.split("/");
        return parts[parts.length - 1];
      }),
      source: modelData?.gallery ? "modelData.gallery" : mediaData.gallery ? "mediaData.gallery" : specs?.media?.gallery ? "specs.media.gallery" : "model.image",
    });
    
    return images;
  }, [modelData?.gallery, modelData?.image, mediaData.gallery, specs?.media?.gallery]);

  const [heroIndex, setHeroIndex] = useState<number>(0);
  const carImage = galleryImages[heroIndex] || mediaData.hero || modelData?.image || DEFAULT_OG_IMAGE;

  // Parse dual tone colors FIRST - so we can use them for monotone filtering
  const parsedDualToneColorsForMatching = useMemo(() => {
    let dualToneData = 
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
      specs?.extras?.dualToneColorNames;

    let dualToneColors: Array<{ name: string; primary: string; secondary: string }> = [];

    // Parse dual tone color data
    if (Array.isArray(dualToneData)) {
      if (dualToneData.length > 0 && typeof dualToneData[0] === 'object' && 'name' in dualToneData[0]) {
        dualToneColors = dualToneData;
      } else if (dualToneData.length > 0 && typeof dualToneData[0] === 'string') {
        dualToneColors = dualToneData.map((colorStr: string) => {
          const parts = colorStr.split(' with ');
          return {
            name: colorStr.trim(),
            primary: parts[0]?.trim() || "",
            secondary: parts[1]?.trim() || ""
          };
        });
      }
    } else if (typeof dualToneData === 'string' && dualToneData.length > 0) {
      dualToneColors = dualToneData
        .split(',')
        .map((colorStr: string) => {
          const colorTrim = colorStr.trim();
          const parts = colorTrim.split(' with ');
          return {
            name: colorTrim,
            primary: parts[0]?.trim() || "",
            secondary: parts[1]?.trim() || ""
          };
        })
        .filter((c) => c.primary && c.secondary);
    }

    return dualToneColors;
  }, [specs?.exterior?.dual_tone_color_names, specs?.exterior?.exterior_dual_tone_color_names, specs?.exterior?.dual_tone_colors, specs?.exterior?.dualToneColors, specs?.exterior?.dualToneColorNames, specs?.dual_tone_color_names, specs?.exterior_dual_tone_color_names, specs?.dual_tone_colors, specs?.dualToneColors, specs?.dualToneColorNames, specs?.extras]);

  // Color-based image gallery - maps colors from specs to images
  const colorImages = useMemo(() => {
    // Check multiple possible locations for colors (matching the Colors Tab logic)
    let colorsFromSpecs = 
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
      
    const colorsFromVariant = variantData?.colors;
    
    // Parse colors if they're a string (comma-separated from backend)
    let colors: string[] = [];
    
    if (Array.isArray(colorsFromSpecs)) {
      colors = colorsFromSpecs;
    } else if (typeof colorsFromSpecs === 'string' && colorsFromSpecs.length > 0) {
      colors = colorsFromSpecs
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0);
    } else if (Array.isArray(colorsFromVariant)) {
      colors = colorsFromVariant;
    } else if (typeof colorsFromVariant === 'string' && colorsFromVariant.length > 0) {
      colors = colorsFromVariant
        .split(',')
        .map((c: string) => c.trim())
        .filter((c: string) => c.length > 0);
    }
    
    console.log("🎨 ColorImages UseMemo - Color Lookup:", {
      foundColors: colors,
      colorsLength: colors.length,
      galleryImagesCount: galleryImages?.length,
      galleryImageFilenames: galleryImages?.map(url => url.split("/").pop()),
    });
    
    if (!colors || colors.length === 0) {
      console.log("⚠️ No colors found for image matching");
      return {};
    }
    
    const result = getColorImageGallery(brand || "", modelSlug || "", variantSlug || "", colors, galleryImages, parsedDualToneColorsForMatching);
    console.log("✅ Color Images Matched:", {
      colorsWithImages: Object.keys(result).length,
      totalImages: Object.values(result).reduce((sum, arr) => sum + arr.length, 0),
    });
    return result;
  }, [specs?.exterior?.monotone_color_names, specs?.exterior?.colors, specs?.exterior?.body_colours, specs?.colors, specs?.exterior_monotone_color_names, specs?.exterior_colors, specs?.available_colors, specs?.color_names, specs?.extras, variantData?.colors, brand, modelSlug, variantSlug, galleryImages, parsedDualToneColorsForMatching]);

  // Dual tone colors - maps dual tone color combinations to images
  const dualToneColorImages = useMemo(() => {
    if (!parsedDualToneColorsForMatching || parsedDualToneColorsForMatching.length === 0) {
      return {};
    }

    console.log("🎨 Dual Tone Color Images Debug:", {
      foundDualToneColors: parsedDualToneColorsForMatching,
      dualToneCount: parsedDualToneColorsForMatching.length,
      galleryImagesCount: galleryImages?.length,
      galleryFilenames: galleryImages?.map(url => url.split("/").pop()),
    });

    const result = getDualToneColorImageGallery(brand || "", modelSlug || "", variantSlug || "", parsedDualToneColorsForMatching, galleryImages);
    console.log("✅ Dual Tone Color Images Matched:", {
      colorsWithImages: Object.keys(result).length,
      totalImages: Object.values(result).reduce((sum, arr) => sum + arr.length, 0),
      matchedColorNames: Object.keys(result),
    });
    return result;
  }, [parsedDualToneColorsForMatching, brand, modelSlug, variantSlug, galleryImages]);

  // Extract parsed dual tone color objects for UI components
  const parsedDualToneColors = useMemo(() => {
    let dualToneData = 
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
      specs?.extras?.dualToneColorNames;

    console.log("🔍 DUAL TONE DEBUG:", {
      dualToneData,
      dataType: typeof dualToneData,
      isArray: Array.isArray(dualToneData),
      "specs?.exterior": specs?.exterior,
      "specs?.extras": specs?.extras,
      "specs?.exterior?.exterior_dual_tone_color_names": specs?.exterior?.exterior_dual_tone_color_names,
      "specs?.exterior_dual_tone_color_names": specs?.exterior_dual_tone_color_names,
    });

    let dualToneColors: Array<{ name: string; primary: string; secondary: string }> = [];

    // Parse dual tone color data
    if (Array.isArray(dualToneData)) {
      console.log("✅ dualToneData is array:", dualToneData);
      // If array of objects
      if (dualToneData.length > 0 && typeof dualToneData[0] === 'object' && 'name' in dualToneData[0]) {
        dualToneColors = dualToneData;
        console.log("✅ Parsed as array of objects");
      } else if (dualToneData.length > 0 && typeof dualToneData[0] === 'string') {
        // If array of strings like ["Color1 with Color2", "Color3 with Color4"]
        dualToneColors = dualToneData.map((colorStr: string) => {
          const parts = colorStr.split(' with ');
          return {
            name: colorStr.trim(),
            primary: parts[0]?.trim() || "",
            secondary: parts[1]?.trim() || ""
          };
        });
        console.log("✅ Parsed as array of strings");
      }
    } else if (typeof dualToneData === 'string' && dualToneData.length > 0) {
      console.log("✅ dualToneData is string:", dualToneData);
      // If comma-separated string like "Color1 with Color2, Color3 with Color4"
      dualToneColors = dualToneData
        .split(',')
        .map((colorStr: string) => {
          const colorTrim = colorStr.trim();
          const parts = colorTrim.split(' with ');
          return {
            name: colorTrim,
            primary: parts[0]?.trim() || "",
            secondary: parts[1]?.trim() || ""
          };
        })
        .filter((c) => c.primary && c.secondary);
      console.log("✅ Parsed as comma-separated string, result:", dualToneColors);
    } else {
      console.log("❌ No dual tone data found or invalid format");
    }

    console.log("📋 Final parsedDualToneColors:", dualToneColors);
    return dualToneColors;
  }, [specs?.exterior?.dual_tone_color_names, specs?.exterior?.exterior_dual_tone_color_names, specs?.exterior?.dual_tone_colors, specs?.exterior?.dualToneColors, specs?.exterior?.dualToneColorNames, specs?.dual_tone_color_names, specs?.exterior_dual_tone_color_names, specs?.dual_tone_colors, specs?.dualToneColors, specs?.dualToneColorNames, specs?.extras]);

  // Features Data - Dynamically built from backend specs
  const featureCategories = useMemo(() => {
    if (!specs) return [];

    const categories = [];

    // Safety Features
    if (specs.safety) {
      const safetyFeatures = [];
      if (specs.safety.airbags) safetyFeatures.push({ name: `${specs.safety.airbags} Airbags`, available: true });
      if (specs.safety.abs) safetyFeatures.push({ name: "ABS", available: true });
      if (specs.safety.ebd) safetyFeatures.push({ name: "EBD", available: true });
      if (specs.safety.esp) safetyFeatures.push({ name: "ESP", available: true });
      if (specs.safety.tractionControl) safetyFeatures.push({ name: "Traction Control", available: true });
      if (specs.safety.hillHold) safetyFeatures.push({ name: "Hill Hold Control", available: true });
      if (specs.safety.hillDescent) safetyFeatures.push({ name: "Hill Descent Control", available: true });
      if (specs.safety.ncapRating) safetyFeatures.push({ name: `${specs.safety.ncapRating} NCAP Rating`, available: true });
      if (specs.safety.childSeatAnchor) safetyFeatures.push({ name: "ISOFIX Child Seat Anchor", available: true });

      if (safetyFeatures.length > 0) {
        categories.push({ title: "Safety", features: safetyFeatures });
      }
    }

    // Comfort Features
    if (specs.comfort) {
      const comfortFeatures = [];
      if (specs.comfort.ac) comfortFeatures.push({ name: specs.comfort.ac, available: true });
      if (specs.comfort.rearAC) comfortFeatures.push({ name: "Rear AC Vents", available: true });
      if (specs.comfort.cruiseControl) comfortFeatures.push({ name: "Cruise Control", available: true });
      if (specs.comfort.steeringAdjustment) comfortFeatures.push({ name: specs.comfort.steeringAdjustment, available: true });
      if (specs.comfort.parkingSensors) comfortFeatures.push({ name: specs.comfort.parkingSensors, available: true });

      if (comfortFeatures.length > 0) {
        categories.push({ title: "Comfort", features: comfortFeatures });
      }
    }

    // Infotainment & Tech Features
    if (specs.tech) {
      const techFeatures = [];
      if (specs.tech.infotainment) techFeatures.push({ name: specs.tech.infotainment, available: true });
      if (specs.tech.speakers) techFeatures.push({ name: `${specs.tech.speakers} Speakers`, available: true });
      if (specs.tech.androidAuto) techFeatures.push({ name: "Android Auto", available: true });
      if (specs.tech.appleCarPlay) techFeatures.push({ name: "Apple CarPlay", available: true });
      if (specs.tech.bluetooth) techFeatures.push({ name: "Bluetooth", available: true });

      if (techFeatures.length > 0) {
        categories.push({ title: "Infotainment", features: techFeatures });
      }
    }

    // Lighting Features
    if (specs.lighting) {
      const lightingFeatures = [];
      if (specs.lighting.headlamps) lightingFeatures.push({ name: specs.lighting.headlamps, available: true });
      if (specs.lighting.drl) lightingFeatures.push({ name: "Daytime Running Lights", available: true });
      if (specs.lighting.foglamps) lightingFeatures.push({ name: specs.lighting.foglamps, available: true });
      if (specs.lighting.taillamps) lightingFeatures.push({ name: specs.lighting.taillamps, available: true });

      if (lightingFeatures.length > 0) {
        categories.push({ title: "Lighting", features: lightingFeatures });
      }
    }

    return categories;
  }, [specs]);

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
    specsApi
      .getByVariant(variantData.id)
      .then((data) => {
        console.log("✅ Specs fetched for variant", variantData.id, ":", data);
        console.log("🏗️ Specs structure:", {
          hasExterior: !!data?.exterior,
          exteriorKeys: data?.exterior ? Object.keys(data.exterior) : [],
          monotoneColors: data?.exterior?.monotone_color_names,
          dualToneColors: data?.exterior?.dual_tone_color_names,
          allColors: data?.exterior?.colors,
          hasExtras: !!data?.extras,
          extrasKeys: data?.extras ? Object.keys(data.extras) : [],
          extrasColors: data?.extras?.monotone_color_names || data?.extras?.colors || data?.extras?.exterior_monotone_color_names,
          extrasDualTone: data?.extras?.dual_tone_color_names,
          allDataKeys: Object.keys(data || {}),
          fulldData: data // Log entire data for inspection
        });
        // Log extras to see what fields are available
        if (data?.extras) {
          console.log("📊 Specs extras keys:", Object.keys(data.extras));
          console.log("📦 All extras data:", data.extras);
          console.log("🎨 Looking for dual tone in extras:", {
            dual_tone_color_names: data?.extras?.dual_tone_color_names,
            dualToneColorNames: data?.extras?.dualToneColorNames,
            dual_tone_colors: data?.extras?.dual_tone_colors,
            dualToneColors: data?.extras?.dualToneColors,
            exterior_dual_tone_color_names: data?.extras?.exterior_dual_tone_color_names,
          });
        }
        if (data?.engine) {
          console.log("🔧 Specs engine keys:", Object.keys(data.engine));
        }
        setSpecs(data);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch specs for variant", variantData.id, ":", err);
        setSpecs(null);
      });
  }, [variantData]);

  // Helpers to render dynamic specs object
  const prettifyKey = (k: string) => {
    if (!k) return "";
    return k
      .replace(/[_\-]/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  };

  const renderSpecValue = (v: any): any => {
    if (v === null || v === undefined || v === "") return <span className="text-sm text-muted-foreground">N/A</span>;
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return <span className="text-sm">{String(v)}</span>;
    if (Array.isArray(v)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {v.map((it, idx) => (
            <li key={idx} className="text-sm">{typeof it === 'object' ? JSON.stringify(it) : String(it)}</li>
          ))}
        </ul>
      );
    }
    // object
    return (
      <div className="space-y-3">
        {Object.entries(v).map(([k, val]) => (
          <div key={k} className="flex justify-between items-start gap-4">
            <div className="text-sm text-muted-foreground w-1/3">{prettifyKey(k)}</div>
            <div className="w-2/3">{renderSpecValue(val)}</div>
          </div>
        ))}
      </div>
    );
  };

  // Default-open spec sections (prefer these if present)
  const preferredOpenSections = ["overview", "engine", "performance", "dimensions"];
  const defaultOpenSections = specs ? Object.keys(specs).filter((k) => preferredOpenSections.includes(k)) : [];

  // Category order and friendly names (matches backend DEFAULT_MAPPING structure)
  const specCategories = [
    { key: "overview", label: "Overview", icon: "ℹ️" },
    { key: "engine", label: "Engine", icon: "⚙️" },
    { key: "performance", label: "Performance", icon: "🏁" },
    { key: "dimensions", label: "Dimensions & Weight", icon: "📏" },
    { key: "safety", label: "Safety", icon: "🛡️" },
    { key: "comfort", label: "Comfort", icon: "🛋️" },
    { key: "lighting", label: "Lighting", icon: "💡" },
    { key: "interior", label: "Interior", icon: "🎨" },
    { key: "tech", label: "Infotainment & Tech", icon: "📱" },
    { key: "warranty", label: "Warranty", icon: "✅" },
    { key: "extras", label: "Additional Info", icon: "📋" },
  ];

  const friendlyKeyMap: Record<string, string> = {
    engine_cc: "Engine Displacement",
    cylinders: "Cylinders",
    engine_type: "Engine Type",
    turbocharger: "Turbocharger",
    hybrid: "Hybrid",
    battery: "Battery",
    motor: "Electric Motor",
    emissionStandard: "Emission Standard",
    mileage: "Mileage",
    drivingRange: "Driving Range",
    idleStartStop: "Idle Start Stop",
    drivetrain: "Drivetrain",
    transmission: "Transmission",
    length: "Length",
    width: "Width",
    height: "Height",
    wheelbase: "Wheelbase",
    kerbWeight: "Kerb Weight",
    groundClearance: "Ground Clearance",
    grossWeight: "Gross Weight",
    airbags: "Airbags",
    ncapRating: "NCAP Rating",
    abs: "ABS",
    ebd: "EBD",
    esp: "ESP",
    tractionControl: "Traction Control",
    hillHold: "Hill Hold Control",
    hillDescent: "Hill Descent Control",
    childSeatAnchor: "Child Seat Anchor Points",
    ac: "Air Conditioning",
    rearAC: "Rear AC",
    cruiseControl: "Cruise Control",
    steeringAdjustment: "Steering Adjustment",
    parkingSensors: "Parking Sensors",
    headlamps: "Headlights",
    drl: "Daytime Running Lights",
    taillamps: "Taillights",
    foglamps: "Fog Lights",
    upholstery: "Seat Upholstery",
    colorTheme: "Interior Color Theme",
    armrests: "Armrests",
    infotainment: "Infotainment Screen",
    speakers: "Speakers",
    androidAuto: "Android Auto",
    appleCarPlay: "Apple CarPlay",
    bluetooth: "Bluetooth",
    vehicleWarranty: "Vehicle Warranty",
    batteryWarranty: "Battery Warranty",
    price: "Ex-Showroom Price",
    brand: "Brand",
    model: "Model",
    variant: "Variant",
    body_type: "Body Type",
    seating_capacity: "Seating Capacity",
  };

  const getFriendlyKey = (k: string): string => {
    return friendlyKeyMap[k] || prettifyKey(k);
  };

  // Helper to extract spec values from multiple possible locations
  const getSpecValue = (paths: string[]): any => {
    if (!specs) return null;
    
    for (const path of paths) {
      const parts = path.split('.');
      let value: any = specs;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = value[part];
        } else {
          value = null;
          break;
        }
      }
      
      if (value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== 'No') {
        return value;
      }
    }
    
    return null;
  };

  // Helper to search for a value by key name (case-insensitive) in any object
  const findInObject = (obj: any, searchKeys: string[]): any => {
    if (!obj || typeof obj !== 'object') return null;
    
    // Try exact matches first
    for (const key of searchKeys) {
      if (key in obj && obj[key] !== null && obj[key] !== undefined && obj[key] !== '' && obj[key] !== 'N/A' && obj[key] !== 'No') {
        return obj[key];
      }
    }
    
    // Try case-insensitive matches
    const objKeysLower = Object.keys(obj).map(k => k.toLowerCase());
    for (const searchKey of searchKeys) {
      const searchLower = searchKey.toLowerCase();
      const matchIndex = objKeysLower.findIndex(k => k === searchLower || k.includes(searchLower));
      if (matchIndex !== -1) {
        const actualKey = Object.keys(obj)[matchIndex];
        const value = obj[actualKey];
        if (value !== null && value !== undefined && value !== '' && value !== 'N/A' && value !== 'No') {
          return value;
        }
      }
    }
    
    return null;
  };

  const handleAddToCompare = () => {
    if (!variantData) return;
    const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
    if (!compareList.includes(variantData.id) && compareList.length < 3) {
      compareList.push(variantData.id);
      localStorage.setItem("compareList", JSON.stringify(compareList));
      window.dispatchEvent(new Event("compareListUpdated"));
    }
  };

  const buildCompareHref = () => {
    if (!variantData) return "/compare";
    const rawList = JSON.parse(localStorage.getItem("compareList") || "[]");
    const base = Array.isArray(rawList) ? rawList.filter((item) => typeof item === "string") : [];
    if (base.includes(variantData.id)) return `/compare?v=${base.join(",")}`;
    if (base.length >= 3) return `/compare?v=${base.join(",")}`;
    return `/compare?v=${[...base, variantData.id].join(",")}`;
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
            <Card className="overflow-hidden border border-border shadow-premium-lg">
              <div className="relative bg-transparent p-0">
                {/* Tags */}
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <Badge className="bg-white/90 text-black hover:bg-white">{variantData.fuelType}</Badge>
                  <Badge variant="outline" className="bg-black/5 border-black/10">{variantData.transmission}</Badge>
                </div>
                
                <PhotoGallery photos={galleryImages} modelName={modelData.name} brandName={modelData.brandName} mode="hero" />
              </div>

              <div className="p-4 md:p-6 space-y-4">
                 <p className="text-muted-foreground leading-relaxed">
                        {specs?.overview?.vehicle_overview}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        The <strong>{variantData.name}</strong> variant
                        {specs?.engine?.engine_cc && ` comes with a ${specs.engine.engine_cc} engine`}
                        {specs?.engine?.power && ` producing ${specs.engine.power}`}
                        {specs?.performance?.mileage && `, delivering ${specs.performance.mileage} km/l mileage`}.
                        {featureCategories.length > 0 && featureCategories[0]?.features?.length > 0 &&
                          ` It offers ${featureCategories[0].title.toLowerCase()} features like ${featureCategories[0].features.slice(0, 2).map(f => f.name).join(' and ')}`}.
                        {modelData?.bodyType && ` A solid choice for ${modelData.bodyType} buyers`}
                        {exShowroomPrice && ` with a starting price of ${formatINR(exShowroomPrice, true)}`}.
                      </p>
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
                    <Card className="p-6 border-l-4 border-l-primary">
                      <p className="text-muted-foreground leading-relaxed">
                        {specs?.overview?.vehicle_overview}
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        The <strong>{variantData.name}</strong> variant
                        {specs?.engine?.engine_cc && ` comes with a ${specs.engine.engine_cc} engine`}
                        {specs?.engine?.power && ` producing ${specs.engine.power}`}
                        {specs?.performance?.mileage && `, delivering ${specs.performance.mileage} km/l mileage`}.
                        {featureCategories.length > 0 && featureCategories[0]?.features?.length > 0 &&
                          ` It offers ${featureCategories[0].title.toLowerCase()} features like ${featureCategories[0].features.slice(0, 2).map(f => f.name).join(' and ')}`}.
                        {modelData?.bodyType && ` A solid choice for ${modelData.bodyType} buyers`}
                        {exShowroomPrice && ` with a starting price of ${formatINR(exShowroomPrice, true)}`}.
                      </p>
                    </Card>


                    <Card className="p-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" /> Key Highlights
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Engine</p>
                          <p className="font-semibold">
                            {getSpecValue(['engine.engine', 'engine.engine_cc', 'extras.engine', 'extras.engine_cc']) || 
                             variantData.engine || "N/A"}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Power</p>
                          <p className="font-semibold text-primary">
                            {(() => {
                              // Try standard paths
                              let power = getSpecValue(['engine.power', 'engine.max_power', 'performance.power', 'extras.power']);
                              if (power) return power;
                              
                              // Search in extras for power-related fields
                              if (specs?.extras) {
                                power = findInObject(specs.extras, [
                                  'max_power_bhp_rpm', 
                                  'Max Power (bhp@rpm)', 
                                  'max_power',
                                  'power',
                                  'bhp'
                                ]);
                                if (power) return power;
                              }
                              
                              // Search in engine
                              if (specs?.engine) {
                                power = findInObject(specs.engine, ['max_power_bhp_rpm', 'max_power', 'bhp']);
                                if (power) return power;
                              }
                              
                              return "N/A";
                            })()}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Mileage</p>
                          <p className="font-semibold text-emerald-600">
                            {(() => {
                              const mileage = getSpecValue(['performance.mileage', 'extras.mileage', 'mileage']) || variantData.mileage;
                              return mileage ? `${mileage} km/l` : "N/A";
                            })()}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Seating</p>
                          <p className="font-semibold">
                            {getSpecValue(['overview.seating_capacity', 'extras.seating_capacity', 'seating_capacity']) || 
                             variantData.seating || "N/A"} Persons
                          </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Transmission</p>
                          <p className="font-semibold">
                            {getSpecValue(['performance.transmission', 'extras.transmission', 'transmission']) || 
                             variantData.transmission || "N/A"}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Fuel</p>
                          <p className="font-semibold">
                            {getSpecValue(['extras.fuel_type', 'engine.fuel_type', 'fuel_type']) || 
                             variantData.fuelType || "N/A"}
                          </p>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground">Body Type</p>
                          <p className="font-semibold">
                            {getSpecValue(['overview.body_type', 'extras.body_type', 'body_type']) || 
                             modelData?.bodyType || "N/A"}
                          </p>
                        </div>
                        {(() => {
                          const torque = getSpecValue(['engine.torque', 'engine.max_torque', 'performance.torque', 'extras.torque']) || 
                                        getSpecValue(['extras.max_torque_nm_rpm', 'extras.Max Torque (nm@rpm)']);
                          return torque ? (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Torque</p>
                              <p className="font-semibold">{torque}</p>
                            </div>
                          ) : null;
                        })()}
                        {(() => {
                          const groundClearance = getSpecValue(['dimensions.groundClearance', 'dimensions.ground_clearance', 'extras.ground_clearance']);
                          return groundClearance ? (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-xs text-muted-foreground">Ground Clearance</p>
                              <p className="font-semibold">{groundClearance} mm</p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </Card>



                    {/* Detailed Overview Information */}
                    {/* {specs?.overview && (
                                  <Card className="overflow-hidden">
                                    <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b flex items-center gap-2">
                                      <Info className="w-5 h-5 text-primary" />
                                      <h3 className="text-lg font-semibold">Overview</h3>
                                    </div>
                                    <CardContent className="p-0">
                                      <Table>
                                        <TableBody>
                                          {specs.overview.description && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 align-top py-4">Description</TableCell>
                                              <TableCell className="py-4">{specs.overview.description}</TableCell>
                                            </TableRow>
                                          )}
                                          {(specs.overview.summary || specs.summary) && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 align-top py-4">Summary</TableCell>
                                              <TableCell className="py-4">{specs.overview.summary || specs.summary}</TableCell>
                                            </TableRow>
                                          )}
                                          {(specs.overview.brand || modelData?.brandName) && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 py-4">Brand</TableCell>
                                              <TableCell className="py-4">{specs.overview.brand || modelData?.brandName}</TableCell>
                                            </TableRow>
                                          )}
                                          {(specs.overview.model || modelData?.name) && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 py-4">Model</TableCell>
                                              <TableCell className="py-4">{specs.overview.model || modelData?.name}</TableCell>
                                            </TableRow>
                                          )}
                                          {(specs.overview.variant || variantData.name) && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 py-4">Variant</TableCell>
                                              <TableCell className="py-4">{specs.overview.variant || variantData.name}</TableCell>
                                            </TableRow>
                                          )}
                                          {specs.overview.vehicle_overview && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 align-top py-4">Vehicle Overview</TableCell>
                                              <TableCell className="py-4 leading-relaxed">{specs.overview.vehicle_overview}</TableCell>
                                            </TableRow>
                                          )}
                                          {specs.overview.body_type && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 py-4">Body Type</TableCell>
                                              <TableCell className="py-4">{specs.overview.body_type}</TableCell>
                                            </TableRow>
                                          )}
                                          {specs.overview.seating_capacity && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 py-4">Seating Capacity</TableCell>
                                              <TableCell className="py-4">{specs.overview.seating_capacity} Persons</TableCell>
                                            </TableRow>
                                          )}
                                          {specs.overview.price && (
                                            <TableRow>
                                              <TableCell className="font-medium w-1/4 py-4">Ex-Showroom Price</TableCell>
                                              <TableCell className="py-4 font-semibold text-primary">{formatINR(parseINRToRupees(specs.overview.price), true)}</TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </Card>
                                )} */}
                  </TabsContent>

                  {/* SPECIFICATIONS TAB */}
                  <TabsContent value="specifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Dimensions Table - Backend Data Only */}
                    {specs?.dimensions && (
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
                              {specs.dimensions.length && <TableRow><TableCell className="font-medium">Length</TableCell><TableCell className="text-right">{specs.dimensions.length} mm</TableCell></TableRow>}
                              {specs.dimensions.width && <TableRow><TableCell className="font-medium">Width</TableCell><TableCell className="text-right">{specs.dimensions.width} mm</TableCell></TableRow>}
                              {specs.dimensions.height && <TableRow><TableCell className="font-medium">Height</TableCell><TableCell className="text-right">{specs.dimensions.height} mm</TableCell></TableRow>}
                              {specs.dimensions.wheelbase && <TableRow><TableCell className="font-medium">Wheelbase</TableCell><TableCell className="text-right">{specs.dimensions.wheelbase} mm</TableCell></TableRow>}
                              {specs.dimensions.groundClearance && <TableRow><TableCell className="font-medium">Ground Clearance</TableCell><TableCell className="text-right">{specs.dimensions.groundClearance} mm</TableCell></TableRow>}
                              {specs.dimensions.kerbWeight && <TableRow><TableCell className="font-medium">Kerb Weight</TableCell><TableCell className="text-right">{specs.dimensions.kerbWeight} kg</TableCell></TableRow>}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )}

                    {/* Engine & Performance - Backend Data Only */}
                    {specs?.engine && (
                      <SpecTable
                        title="Engine & Performance"
                        rows={[
                          specs.engine.engine_cc && { label: 'Displacement', value: specs.engine.engine_cc },
                          (specs.engine.power || getSpecValue(['extras.max_power_bhp_rpm', 'extras.Max Power (bhp@rpm)'])) && { 
                            label: 'Max Power', 
                            value: specs.engine.power || getSpecValue(['extras.max_power_bhp_rpm', 'extras.Max Power (bhp@rpm)']) 
                          },
                          (specs.engine.torque || getSpecValue(['extras.max_torque_nm_rpm', 'extras.Max Torque (nm@rpm)'])) && { 
                            label: 'Max Torque', 
                            value: specs.engine.torque || getSpecValue(['extras.max_torque_nm_rpm', 'extras.Max Torque (nm@rpm)']) 
                          },
                          specs.performance?.mileage && { label: 'ARAI Mileage', value: specs.performance.mileage + ' km/l' },
                          specs.engine.engine_type && { label: 'Engine Type', value: specs.engine.engine_type },
                          specs.engine.cylinders && { label: 'Cylinders', value: specs.engine.cylinders },
                        ].filter(Boolean)}
                      />
                    )}

                    {/* Brakes & Suspension - Backend Data Only */}
                    {(specs?.brakes || specs?.suspension) && (
                      <SpecTable
                        title="Brakes & Suspension"
                        rows={[
                          specs.brakes?.front && { label: 'Front Brakes', value: specs.brakes.front },
                          specs.brakes?.rear && { label: 'Rear Brakes', value: specs.brakes.rear },
                          specs.suspension?.front && { label: 'Front Suspension', value: specs.suspension.front },
                          specs.suspension?.rear && { label: 'Rear Suspension', value: specs.suspension.rear },
                        ].filter(Boolean)}
                      />
                    )}

                    {/* Professional Categorized Specs (CarDekho/CarWale style) */}
                    {specs ? (
                      <div className="space-y-2 mt-6">
                        <h3 className="text-lg font-semibold mb-4">All Specifications</h3>
                        <Accordion type="multiple" defaultValue={defaultOpenSections} className="w-full space-y-2">
                          {specCategories.map((category) => {
                            const categorySpecs = specs[category.key];
                            if (!categorySpecs || (typeof categorySpecs === "object" && Object.keys(categorySpecs).length === 0)) {
                              return null;
                            }
                            return (
                              <AccordionItem key={category.key} value={category.key} className="border rounded-lg px-4 data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-slate-900">
                                <AccordionTrigger className="py-4 hover:no-underline">
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl">{category.icon}</span>
                                    <span className="text-base font-semibold">{category.label}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-2">
                                  {typeof categorySpecs === "object" && !Array.isArray(categorySpecs) ? (
                                    <Table className="w-full">
                                      <TableBody>
                                        {Object.entries(categorySpecs).map(([specKey, specValue]) => (
                                          <TableRow key={specKey} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                                            <TableCell className="font-medium text-sm py-3">{getFriendlyKey(specKey)}</TableCell>
                                            <TableCell className="text-right text-sm py-3 text-slate-700 dark:text-slate-300">{renderSpecValue(specValue)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  ) : (
                                    <div className="py-3 text-sm">{renderSpecValue(categorySpecs)}</div>
                                  )}
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </div>
                    ) : (
                      <Card className="p-6 mt-6 border-dashed">
                        <p className="text-sm text-muted-foreground text-center">No specifications available for this variant yet.</p>
                      </Card>
                    )}
                  </TabsContent>

                  {/* FEATURES TAB */}
                  <TabsContent value="features" className="animate-in fade-in slide-in-from-bottom-2">
                    {featureCategories.length > 0 ? (
                      <FeatureGrid categories={featureCategories} />
                    ) : (
                      <Card className="p-8 border-dashed">
                        <div className="text-center">
                          <Info className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No Features Available</h3>
                          <p className="text-sm text-muted-foreground">
                            Features data for this variant is not yet populated. Please check the specifications tab for available details.
                          </p>
                        </div>
                      </Card>
                    )}

                    {/* Features from specs object (if present) */}
                    {(() => {
                      const featuresArray = specs?.features || specs?.extras?.features || specs?.summary?.features;
                      const validFeatures = Array.isArray(featuresArray) ? featuresArray : [];
                      
                      if (!specs || validFeatures.length === 0) return null;
                      
                      return (
                        <Card className="mt-6">
                          <CardHeader className="py-3 border-b bg-slate-50 dark:bg-slate-900">
                            <CardTitle className="text-base">Additional Features</CardTitle>
                            <CardDescription>Extra features from the database</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none">
                              {validFeatures.map((f: any, i: number) => (
                                <li key={i} className="text-sm flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  <span>{typeof f === 'string' ? f : JSON.stringify(f)}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      );
                    })()}
                  </TabsContent>

                  {/* COLORS TAB */}
                  <TabsContent value="colors" className="animate-in fade-in slide-in-from-bottom-2">
                    <Card className="p-8">
                      <h3 className="text-lg font-semibold mb-6">Available Colors</h3>
                      
    {(() => {
      // Check multiple possible locations for colors in specs
      let colorData = 
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
        specs?.extras?.body_colours ||
        variantData?.colors;
      
      // Ensure allColors is always an array
      let allColors: string[] = [];
      if (Array.isArray(colorData)) {
        allColors = colorData;
      } else if (typeof colorData === 'string') {
        // Split by comma and trim whitespace
        allColors = colorData
          .split(',')
          .map((c: string) => c.trim())
          .filter((c: string) => c.length > 0);
      } else if (colorData) {
        allColors = [String(colorData)];
      }
      
      const hasColors = allColors && allColors.length > 0;
      
      console.log("🎨 Final Colors Extracted:", {
        rawColorData: colorData,
        parsedColors: allColors,
        hasColors,
        colorCount: allColors.length
      });
      
      if (!hasColors) {
        return (
          <div className="text-center py-12 text-slate-500">
            <p>No colors configured for this variant</p>
          </div>
        );
      }
      
      console.log("🎨 Colors Tab - Render Decision:", {
        allColorsLength: allColors.length,
        colorImagesKeys: Object.keys(colorImages),
        colorImagesCount: Object.keys(colorImages).length,
        shouldShowGallery: Object.keys(colorImages).length > 0,
        colorImages: colorImages
      });
      
      if (Object.keys(colorImages).length > 0 || Object.keys(dualToneColorImages).length > 0) {
        console.log("✅ SHOWING ColorImageGallery");
        return (
          <ColorImageGallery
            colors={allColors}
            dualToneColors={parsedDualToneColors}
            colorImages={colorImages}
            dualToneColorImages={dualToneColorImages}
            modelName={modelData?.name || ""}
            brandName={modelData?.brandName}
            onColorChange={setSelectedColor}
          />
        );
      }
      

      console.log("❌ SHOWING Placeholder");

      console.log("🟣 DualTone Debug:", {
      parsedDualToneColors,
      dualToneColorImages,
     });


      return (
        <div className="space-y-6">
          {/* Placeholder for images - Reserved space that fills up when images uploaded */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center min-h-96 flex items-center justify-center">
            <div className="space-y-3">
              <div className="text-5xl">📸</div>
              <p className="text-slate-600 font-medium text-lg">Car images will appear here</p>
              <p className="text-sm text-slate-500">
                Upload color-specific images from the admin panel to display {allColors.length} available color{allColors.length !== 1 ? 's' : ''}: {allColors.join(', ')}
                {parsedDualToneColors.length > 0 && (
                  <><br /><strong>Dual Tone:</strong> {parsedDualToneColors.map(d => d.name).join(', ')}</>
                )}
              </p>
            </div>
          </div>

          {/* Tabs to switch between monotone and dual tone */}
          {parsedDualToneColors.length > 0 && (
            <div className="flex gap-2 border-b">
              <button
                onClick={() => {}}
                className="px-4 py-2 font-medium border-b-2 border-blue-500 text-blue-600"
              >
                Single Tone ({allColors.length})
              </button>
              <button
                onClick={() => {}}
                className="px-4 py-2 font-medium text-gray-500 hover:text-gray-700"
              >
                Dual Tone ({parsedDualToneColors.length})
              </button>
            </div>
          )}

          {/* Color swatches below placeholder */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">Available Colors ({allColors.length}{parsedDualToneColors.length > 0 ? ` + ${parsedDualToneColors.length} Dual Tone` : ''}):</p>
            </div>
            <ColorSwatches 
              colors={allColors} 
              dualToneColors={parsedDualToneColors}
              onColorChange={setSelectedColor} 
            />
          </div>
        </div>
      );
    })()}
                    </Card>
                  </TabsContent>

                  {/* PRICE & EMI TAB */}
                  <TabsContent value="price-emi" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    {variantData && (
                      <VariantPriceCalculator
                        variant={variantData}
                        selectedCity={selectedCity}
                      />
                    )}
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
                      <PhotoGallery photos={galleryImages} modelName={modelData.name} brandName={modelData.brandName} />
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
                    <img
                      src={brandLogo}
                      alt={modelData.brandName}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs">{brandInitial}</div>
                  )}
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{modelData.brandName}</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight leading-snug">{modelData.name} {variantData.name}</h1>

                {/* City Selector */}
                <div className="mt-4 space-y-2">
                  <label className="text-xs text-muted-foreground font-medium uppercase">Select City</label>
                  <Select
                    value={selectedCity}
                    onValueChange={(val) => {
                      setSelectedCity(val);
                      setCity(val);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[320px]">
                      {loadingCities ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Loading cities...</div>
                      ) : cities.length > 0 ? (
                        cities.map((city) => (
                          <SelectItem key={city.id} value={city.name}>
                            {city.name} ({city.state})
                          </SelectItem>
                        ))
                      ) : (
                        [
                          "Delhi NCR", "Mumbai", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Indore", "Kochi", "Coimbatore", "Visakhapatnam", "Nagpur", "Surat", "Vadodara", "Guwahati", "Bhopal", "Thiruvananthapuram", "Ranchi", "Patna", "Raipur", "Agra", "Varanasi"
                        ].map((name) => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                  {/* Ex-Showroom Price */}
                  <div>
                    <span className="text-xs text-muted-foreground font-medium uppercase">Ex-Showroom Price</span>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                      {exShowroomPrice ? formatINR(exShowroomPrice, true) : "TBA"}
                    </div>
                  </div>

                  {/* On-Road Price */}
                  {priceBreakdown && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-muted-foreground font-medium uppercase">On-Road Price ({selectedCity})</span>
                      <div className="text-3xl font-extrabold text-primary mt-1">
                        {formatINR(priceBreakdown.onRoadPrice, true)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Includes Individual Registration (₹{Math.round(priceBreakdown.rto).toLocaleString()}) + Insurance (₹{Math.round(priceBreakdown.insurance).toLocaleString()}) + Other Charges (₹{Math.round(priceBreakdown.otherCharges).toLocaleString()})
                      </p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <Button size="lg" className="w-full font-semibold shadow-lg shadow-primary/20" onClick={() => setPriceModalOpen(true)}>
                  <Calculator className="w-4 h-4 mr-2" /> Check On-Road Price
                </Button>
                {priceBreakdown && <PriceBreakupComponent breakdown={priceBreakdown} city={selectedCity} />}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild>
                    <Link to={buildCompareHref()} onClick={handleAddToCompare}>
                      <Plus className="w-4 h-4 mr-2" /> Compare
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="#leads">Get Offers</Link>
                  </Button>
                </div>

                {/* Quick Facts List */}
                <div className="pt-4 border-t mt-4 space-y-3 text-sm">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-muted-foreground flex-shrink-0">Engine</span>
                    <span className="font-medium text-right">
                      {(() => {
                        const engineFull = getSpecValue(['engine.engine', 'engine.engine_cc', 'extras.engine', 'extras.engine_cc']) || variantData.engine;
                        if (!engineFull) return "N/A";
                        // Extract just the CC value if it's a long description
                        const ccMatch = String(engineFull).match(/(\d+)\s*cc/i);
                        return ccMatch ? `${ccMatch[1]} cc` : engineFull;
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-muted-foreground flex-shrink-0">Power</span>
                    <span className="font-medium text-right">
                      {(() => {
                        // Try standard paths
                        let power = getSpecValue(['engine.power', 'engine.max_power', 'performance.power', 'extras.power']);
                        if (power) return power;
                        
                        // Search in extras for power-related fields
                        if (specs?.extras) {
                          power = findInObject(specs.extras, [
                            'max_power_bhp_rpm', 
                            'Max Power (bhp@rpm)', 
                            'max_power',
                            'power',
                            'bhp'
                          ]);
                          if (power) return power;
                        }
                        
                        // Search in engine
                        if (specs?.engine) {
                          power = findInObject(specs.engine, ['max_power_bhp_rpm', 'max_power', 'bhp']);
                          if (power) return power;
                        }
                        
                        return "N/A";
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-muted-foreground flex-shrink-0">Boot Space</span>
                    <span className="font-medium text-right">
                      {(() => {
                        // Try standard paths
                        let bootSpace = getSpecValue([
                          'capacity.boot_space', 
                          'capacity.bootSpace', 
                          'extras.boot_space', 
                          'extras.bootSpace', 
                          'dimensions.boot_space', 
                          'dimensions.bootSpace'
                        ]);
                        if (bootSpace) return `${bootSpace} L`;
                        
                        // Search in extras
                        if (specs?.extras) {
                          bootSpace = findInObject(specs.extras, [
                            'boot_space',
                            'bootSpace',
                            'Boot Space',
                            'boot',
                            'luggage',
                            'cargo'
                          ]);
                          if (bootSpace) return `${bootSpace} L`;
                        }
                        
                        // Search in capacity
                        if (specs?.capacity) {
                          bootSpace = findInObject(specs.capacity, ['boot_space', 'bootSpace', 'boot']);
                          if (bootSpace) return `${bootSpace} L`;
                        }
                        
                        // Search in dimensions
                        if (specs?.dimensions) {
                          bootSpace = findInObject(specs.dimensions, ['boot_space', 'bootSpace', 'boot']);
                          if (bootSpace) return `${bootSpace} L`;
                        }
                        
                        return "N/A";
                      })()}
                    </span>
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
        city={selectedCity}
        brandName={modelData.brandName}
        modelName={modelData.name}
        exShowroomPrice={exShowroomPrice || undefined}
      />
    </div>
  );
};

export default VariantDetail;