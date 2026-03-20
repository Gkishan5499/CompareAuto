import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Breadcrumbs from "@/components/brands/Breadcrumbs";
import FilterBar from "@/components/brands/FilterBar";
import ModelCard from "@/components/home/ModelCard";
import { useBrandBySlug, useModelsByBrand, useBrands } from "@/lib/api-hooks";
import { modelsApi, variantsApi, upcomingCarsApi } from "@/lib/api";
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
  Info, Star, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

type FaqItem = { question: string; answer: string };

const truncateToWords = (text: string, wordLimit: number) => {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordLimit) return { text, isTruncated: false };
  return {
    text: words.slice(0, wordLimit).join(" ") + "...",
    isTruncated: true,
  };
};

const splitParagraphs = (text?: string) => {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);
};

const parseFaqs = (raw?: string): FaqItem[] => {
  if (!raw) return [];
  const blocks = raw.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const items: FaqItem[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const qLine = lines.find((line) => /^q:\s*/i.test(line));
    const aIndex = lines.findIndex((line) => /^a:\s*/i.test(line));

    if (qLine && aIndex >= 0) {
      const question = qLine.replace(/^q:\s*/i, "").trim();
      const answer = lines.slice(aIndex).join("\n").replace(/^a:\s*/i, "").trim();
      if (question && answer) items.push({ question, answer });
      continue;
    }
  }

  return items;
};

const normalizeText = (value?: string) => (value || "").trim().toLowerCase();

const matchesBrand = (model: any, brandData: any, brandSlug?: string) => {
  if (!brandData) return false;

  const byId =
    model?.brandId &&
    brandData?.id &&
    normalizeText(String(model.brandId)) === normalizeText(String(brandData.id));

  const bySlugInBrandId =
    model?.brandId &&
    (brandData?.slug || brandSlug) &&
    normalizeText(String(model.brandId)) === normalizeText(String(brandData?.slug || brandSlug));

  const byName =
    model?.brandName &&
    brandData?.name &&
    normalizeText(String(model.brandName)) === normalizeText(String(brandData.name));

  const bySlug =
    model?.brandSlug &&
    brandSlug &&
    normalizeText(String(model.brandSlug)) === normalizeText(String(brandSlug));

  return Boolean(byId || bySlugInBrandId || byName || bySlug);
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

// Template content generators
const getTemplateOverview = (brandName: string) => {
  return `${brandName} is a leading car manufacturer known for quality, innovation, and reliability. The brand offers a diverse range of vehicles designed to meet the needs of different customer segments, from budget-conscious buyers to premium car enthusiasts.\n\n${brandName} combines cutting-edge technology with practical design to deliver vehicles that perform exceptionally in Indian driving conditions. With a strong focus on customer satisfaction and after-sales service, ${brandName} has established itself as a trusted name in the automotive industry.`;
};

const getTemplatePositioning = (brandName: string) => {
  return `${brandName} positions itself as a customer-centric brand that values quality and affordability. The brand's commitment to innovation and durability makes it a preferred choice for millions of Indian families looking for reliable transportation solutions with excellent value for money.`;
};

const getTemplateWarrantyService = (brandName: string) => {
  return `${brandName} provides comprehensive warranty coverage on its vehicles and offers an extensive network of service centers across India. The brand is committed to providing reliable after-sales support, genuine spare parts, and skilled technician services to ensure long-term vehicle reliability and customer satisfaction.`;
};

const getTemplateProsCons = (): { pros: string[]; cons: string[] } => {
  return {
    pros: [
      "Reliable and fuel-efficient vehicles",
      "Affordable pricing across segments",
      "Strong resale value in the market",
      "Comprehensive warranty and after-sales support",
      "Wide range of color and variant options",
      "Good performance in Indian road conditions"
    ],
    cons: [
      "Limited advanced technology features in base models",
      "Interior space could be better in compact cars",
      "Competitive market limits exclusive features",
      "Service center wait times during peak seasons",
      "Some models have limited cargo space"
    ]
  };
};

const getTemplateHistory = (brandName: string) => {
  return `${brandName} has a rich history of innovation and excellence in the automotive industry. Over the years, the brand has evolved to meet changing customer preferences, introducing new models and technologies while maintaining its core values of quality and reliability. Today, ${brandName} continues to lead the market with a commitment to sustainability and customer-centric innovation.`;
};

const getTemplateHeroIntro = (brandName: string, modelsCount: number, variantsCount: number) => {
  return `Discover the complete ${brandName} lineup. From efficient city commuters to premium SUVs. Compare ${modelsCount} models and ${variantsCount} variants to find your perfect match.`;
};

const getTemplatePopularModelsIntro = (brandName: string) => {
  return `Explore the most popular ${brandName} models trusted by millions of Indian customers for their reliability, performance, and value for money.`;
};

const getTemplateLatestUpcomingIntro = (brandName: string) => {
  return `Stay updated with the latest ${brandName} launches and upcoming models bringing innovative features and cutting-edge technology to the Indian market.`;
};

const getTemplateFaqs = (brandName: string, startingPrice: number | null): FaqItem[] => {
  return [
    {
      question: `Which ${brandName} model is best for city driving?`,
      answer: "Compact models and smaller SUVs from " + brandName + " are easiest to maneuver in tight traffic and parking. Consider models with good fuel efficiency and easier parking assistance features."
    },
    {
      question: `Does ${brandName} offer CNG options?`,
      answer: `Use the fuel filter above to see all CNG models from ${brandName}. CNG vehicles offer excellent fuel economy and lower emissions, making them ideal for daily commuting.`
    },
    {
      question: "What is the starting price?",
      answer: startingPrice 
        ? `Prices for ${brandName} vehicles start from ₹${(startingPrice / 100000).toFixed(2)} Lakh ex-showroom. On-road prices vary based on your location and applicable taxes.`
        : `Pricing for ${brandName} vehicles varies based on model, variant, and location. Visit a nearby dealership for detailed pricing information.`
    },
    {
      question: "What warranty does " + brandName + " offer?",
      answer: `${brandName} offers comprehensive warranty coverage on its vehicles. Standard warranty typically includes engine, transmission, and suspension components. Visit a ${brandName} dealership for specific warranty details and extended warranty options.`
    },
    {
      question: "Are " + brandName + " vehicles reliable?",
      answer: `${brandName} has earned a reputation for reliability and durability. With proper maintenance and genuine spare parts, ${brandName} vehicles are designed to deliver exceptional performance over many years.`
    }
  ];
};

const BrandModels = () => {
  const { brand } = useParams<{ brand: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: brandData, isLoading: brandLoading } = useBrandBySlug(brand || "");
  const { data: allModels = [], isLoading: modelsLoading } = useModelsByBrand(brand || "");
  const { data: allBrands = [] } = useBrands();
  const { city } = useCity();
  const [isHeroExpanded, setIsHeroExpanded] = useState(false);
  const brandLogo = getBrandLogo(brandData?.name);
  const brandInitial = getBrandInitial(brandData?.name);
  const brandProsCons = useMemo(
    () => parseProsConsFromString(brandData?.brandProsCons),
    [brandData?.brandProsCons]
  );
  const heroIntro = brandData?.heroIntro?.trim();
  const popularModelsIntro = brandData?.popularModelsIntro?.trim();
  const latestUpcomingIntro = brandData?.latestUpcomingIntro?.trim();
  const bodyTypeSectionIntro = brandData?.bodyTypeSectionIntro?.trim();
  const budgetSectionIntro = brandData?.budgetSectionIntro?.trim();
  const brandOverview = brandData?.brandOverview?.trim();
  const brandPositioning = brandData?.brandPositioning?.trim();
  const warrantyServiceNetwork = brandData?.warrantyServiceNetwork?.trim();
  const brandHistory = brandData?.brandHistory?.trim();
  const brandFaqs = brandData?.brandFaqs?.trim();
  const faqItems = useMemo(() => parseFaqs(brandFaqs), [brandFaqs]);

  const [sort, setSort] = useState<string>(searchParams.get("sort") || "popular");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [activeBodyTypeTab, setActiveBodyTypeTab] = useState<string>("");
  const [activeBudgetTab, setActiveBudgetTab] = useState<string>("");
  const [spotlightOnRoadPrice, setSpotlightOnRoadPrice] = useState<{ min: number; max: number } | null>(null);
  const [spotlightVariantPriceRange, setSpotlightVariantPriceRange] = useState<{ min: number; max: number } | null>(null);
  
  // API Queries (New/Upcoming/Variants)
  const { data: newModels = [] } = useQuery({
    queryKey: ["models", "new", brand],
    queryFn: async () => {
      const allNew = await modelsApi.getNew();
      return allNew.filter((m: any) => matchesBrand(m, brandData, brand));
    },
    enabled: !!brandData?.id,
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: upcomingModels = [] } = useQuery({
    queryKey: ["upcoming-cars", "brand", brand],
    queryFn: async () => {
      const allUpcoming = await upcomingCarsApi.getAll();
      return allUpcoming.filter((m: any) => matchesBrand(m, brandData, brand));
    },
    enabled: !!brandData?.id,
    staleTime: 5 * 60 * 1000,
  });

  const brandUpcomingModels = useMemo(() => {
    if (upcomingModels.length > 0) return upcomingModels;
    return allModels.filter((m: any) => m?.status === "upcoming");
  }, [allModels, upcomingModels]);

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

  const sourceModelsForSections = useMemo(() => {
    return sortedModels.length > 0 ? sortedModels : allModels;
  }, [sortedModels, allModels]);

  const variantPricesByModelId = useMemo(() => {
    const priceMap = new Map<string, number[]>();

    allVariants.forEach((variant: any) => {
      const modelId = variant?.modelId ? String(variant.modelId) : "";
      const parsedPrice = parseINRToRupees(variant?.price);
      if (!modelId || !parsedPrice || parsedPrice <= 0) return;

      const existing = priceMap.get(modelId) || [];
      existing.push(parsedPrice);
      priceMap.set(modelId, existing);
    });

    priceMap.forEach((prices, modelId) => {
      const uniqueSorted = Array.from(new Set(prices)).sort((a, b) => a - b);
      priceMap.set(modelId, uniqueSorted);
    });

    return priceMap;
  }, [allVariants]);

  const getModelPrices = (model: any): number[] => {
    const modelId = model?.id ? String(model.id) : "";
    const variantPrices = variantPricesByModelId.get(modelId) || [];
    if (variantPrices.length > 0) return variantPrices;

    const minPrice = model.status === "upcoming" ? model.expectedPriceMin || 0 : model.priceRange?.min || 0;
    const maxPrice = model.status === "upcoming" ? model.expectedPriceMax || 0 : model.priceRange?.max || 0;
    if (minPrice > 0 && maxPrice > 0 && maxPrice !== minPrice) return [minPrice, maxPrice];
    if (minPrice > 0) return [minPrice];
    return [];
  };

  const modelsByBodyType = useMemo(() => {
    const grouped = new Map<
      string,
      {
        key: string;
        label: string;
        count: number;
        minPrice: number;
        models: any[];
      }
    >();

    sourceModelsForSections.forEach((model: any) => {
      const rawBodyType = (model?.bodyType || "").trim();
      if (!rawBodyType || rawBodyType.toLowerCase() === "other") return;
      const key = rawBodyType.toLowerCase();
      const label = rawBodyType;
      const prices = getModelPrices(model);
      const modelMinPrice = prices.length > 0 ? prices[0] : 0;

      const existing = grouped.get(key);
      if (existing) {
        existing.count += 1;
        existing.models.push(model);
        if (modelMinPrice > 0 && (existing.minPrice === 0 || modelMinPrice < existing.minPrice)) {
          existing.minPrice = modelMinPrice;
        }
      } else {
        grouped.set(key, {
          key,
          label,
          count: 1,
          minPrice: modelMinPrice > 0 ? modelMinPrice : 0,
          models: [model],
        });
      }
    });

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        models: [...item.models].sort((a: any, b: any) => {
          const aPrice = getModelPrices(a)[0] || 0;
          const bPrice = getModelPrices(b)[0] || 0;
          if (aPrice === 0 && bPrice === 0) return (a?.name || "").localeCompare(b?.name || "");
          if (aPrice === 0) return 1;
          if (bPrice === 0) return -1;
          return aPrice - bPrice;
        }),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [sourceModelsForSections, variantPricesByModelId]);

  const budgetBuckets = useMemo(() => {
    const ranges = [
      { key: "0-5", label: "Under 5 Lakh", min: 0, max: 500000, filterValue: "0-5" },
      { key: "5-10", label: "5 - 10 Lakh", min: 500000, max: 1000000, filterValue: "5-10" },
      { key: "10-20", label: "10 - 20 Lakh", min: 1000000, max: 2000000, filterValue: "10-20" },
      { key: "20-40", label: "20 - 40 Lakh", min: 2000000, max: 4000000, filterValue: "20-40" },
      { key: "40-plus", label: "Above 40 Lakh", min: 4000000, max: Number.POSITIVE_INFINITY, filterValue: "40-+" },
    ];

    return ranges
      .map((range) => {
        const models = sourceModelsForSections.filter((model: any) => {
          const prices = getModelPrices(model);
          const price = prices.length > 0 ? prices[0] : 0;
          if (price <= 0) return false;
          return price >= range.min && price < range.max;
        });

        return {
          ...range,
          count: models.length,
          models: [...models].sort((a: any, b: any) => {
            const aPrice = getModelPrices(a)[0] || 0;
            const bPrice = getModelPrices(b)[0] || 0;
            if (aPrice === 0 && bPrice === 0) return (a?.name || "").localeCompare(b?.name || "");
            if (aPrice === 0) return 1;
            if (bPrice === 0) return -1;
            return aPrice - bPrice;
          }),
        };
      })
      .filter((bucket) => bucket.count > 0);
  }, [sourceModelsForSections, variantPricesByModelId]);

  useEffect(() => {
    if (!modelsByBodyType.length) {
      setActiveBodyTypeTab("");
      return;
    }

    const stillExists = modelsByBodyType.some((item) => item.key === activeBodyTypeTab);
    if (!stillExists) {
      setActiveBodyTypeTab(modelsByBodyType[0].key);
    }
  }, [modelsByBodyType, activeBodyTypeTab]);

  useEffect(() => {
    if (!budgetBuckets.length) {
      setActiveBudgetTab("");
      return;
    }

    const stillExists = budgetBuckets.some((bucket) => bucket.key === activeBudgetTab);
    if (!stillExists) {
      setActiveBudgetTab(budgetBuckets[0].key);
    }
  }, [budgetBuckets, activeBudgetTab]);

  const activeBodyTypeGroup = useMemo(() => {
    return modelsByBodyType.find((item) => item.key === activeBodyTypeTab) || modelsByBodyType[0];
  }, [modelsByBodyType, activeBodyTypeTab]);

  const activeBudgetGroup = useMemo(() => {
    return budgetBuckets.find((bucket) => bucket.key === activeBudgetTab) || budgetBuckets[0];
  }, [budgetBuckets, activeBudgetTab]);

  // SEO & Structured Data (omitted detailed implementation for brevity, keeping hook calls)
  useEffect(() => {
    if (brandData) {
      updateMetaTags({
        title: `${brandData.name} Cars – Prices, Models & Variants`,
        description: heroIntro || brandOverview || `Explore ${brandData.name} cars in India.`,
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
                      <img src={brandLogo} alt={brandData.name} className="w-full h-full object-contain" loading="lazy" />
                    ) : (
                        <span className="text-4xl font-bold">{brandInitial}</span>
                    )}
                </div>

                {/* Text Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        {brandData.name} Cars
                    </h1>
                    <div className="text-muted-foreground max-w-2xl leading-relaxed">
                        {(() => {
                          const fullText = heroIntro || getTemplateHeroIntro(brandData.name, modelsCount, variantsCount);
                          const { text, isTruncated } = truncateToWords(fullText, 50);
                          
                          return (
                            <>
                              <p>{isHeroExpanded ? fullText : text}</p>
                              {isTruncated && (
                                <button
                                  onClick={() => setIsHeroExpanded(!isHeroExpanded)}
                                  className="text-primary hover:underline text-sm font-medium mt-2 inline-flex items-center gap-1"
                                >
                                  {isHeroExpanded ? (
                                    <>View Less</>
                                  ) : (
                                    <>View More</>
                                  )}
                                  <ArrowRight className={cn("w-3 h-3 transition-transform", isHeroExpanded && "rotate-90")} />
                                </button>
                              )}
                            </>
                          );
                        })()}
                    </div>
                    
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
                  {sortedModels.length > 0 ? "Popular Models" : "No Models Found"}
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
                view === "grid" ? (
                  <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent className="-ml-4">
                      {sortedModels.map((model) => (
                        <CarouselItem key={model.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                          <ModelCard model={model} />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="-left-4 md:-left-6 z-20 bg-background/95 hover:bg-background" />
                    <CarouselNext className="-right-4 md:-right-6 z-20 bg-background/95 hover:bg-background" />
                  </Carousel>
                ) : (
                  <div className="grid gap-6 grid-cols-1">
                    {sortedModels.map((model) => (
                      <div key={model.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border">
                        <ModelCard model={model} />
                      </div>
                    ))}
                  </div>
                )
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

        {(modelsByBodyType.length > 0 || budgetBuckets.length > 0) && (
        <section className="space-y-10">
          {modelsByBodyType.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Cars by Body Type</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {bodyTypeSectionIntro || `Browse ${brandData.name} by body style with exact model-wise prices. Use this section to compare hatchbacks, SUVs, sedans, and more in one place, then open the matching list by selecting the body type card.`}
            </p>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {modelsByBodyType.map((item) => (
                    <Button
                      key={item.key}
                      size="sm"
                      variant={activeBodyTypeTab === item.key ? "default" : "outline"}
                      onClick={() => setActiveBodyTypeTab(item.key)}
                    >
                      {item.label} ({item.count})
                    </Button>
                  ))}
                </div>

                {activeBodyTypeGroup && (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{activeBodyTypeGroup.label}</h4>
                        <Badge variant="outline">{activeBodyTypeGroup.count} models</Badge>
                        </div>
                      <div className="flex items-center justify-between gap-2">
                        {activeBodyTypeGroup.minPrice > 0 ? (
                          <p className="text-sm text-muted-foreground">Starts from ₹{formatINR(activeBodyTypeGroup.minPrice, true)}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Price details on model page</p>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSelectedBodyType(activeBodyTypeGroup.label)}>
                          View {activeBodyTypeGroup.label}
                        </Button>
                      </div>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {activeBodyTypeGroup.models.map((model: any) => (
                          <div key={model.id || model.slug}>
                            <ModelCard model={model} />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
          </div>
          )}

          {budgetBuckets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Cars by Budget</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {budgetSectionIntro || `See exact ${brandData.name} prices grouped by budget slabs. Each row lists model names with their current price range so buyers can quickly shortlist cars by affordability.`}
            </p>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {budgetBuckets.map((bucket) => (
                    <Button
                      key={bucket.key}
                      size="sm"
                      variant={activeBudgetTab === bucket.key ? "default" : "outline"}
                      onClick={() => setActiveBudgetTab(bucket.key)}
                    >
                      {bucket.label} ({bucket.count})
                    </Button>
                  ))}
                </div>

                {activeBudgetGroup && (
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{activeBudgetGroup.label}</h4>
                        <Badge variant="outline">{activeBudgetGroup.count} models</Badge>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline" onClick={() => setSelectedPriceRange(activeBudgetGroup.filterValue)}>
                          View {activeBudgetGroup.label}
                        </Button>
                      </div>
                      <Carousel opts={{ align: "start", loop: true }} className="w-full">
                        <CarouselContent className="-ml-4">
                          {activeBudgetGroup.models.map((model: any) => (
                            <CarouselItem key={model.id || model.slug} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                              <ModelCard model={model} />
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className="-left-4 md:-left-6 z-20 bg-background/95 hover:bg-background" />
                        <CarouselNext className="-right-4 md:-right-6 z-20 bg-background/95 hover:bg-background" />
                      </Carousel>
                    </CardContent>
                  </Card>
                )}
              </div>
          </div>
          )}
        </section>
        )}

        {brandUpcomingModels.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl font-bold">Upcoming {brandData.name} Cars</h3>
              <Link to={`/upcoming-cars?brand=${brand}`}>
                <Button size="sm" variant="outline">View All Upcoming</Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {latestUpcomingIntro || `Explore upcoming launches from ${brandData.name} with expected pricing and launch timelines.`}
            </p>
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4">
                {brandUpcomingModels.slice(0, 6).map((model: any) => (
                  <CarouselItem key={model.id || model.slug} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
                    <ModelCard model={model} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-4 md:-left-6 z-20 bg-background/95 hover:bg-background" />
              <CarouselNext className="-right-4 md:-right-6 z-20 bg-background/95 hover:bg-background" />
            </Carousel>
          </section>
        )}

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
                            loading="lazy"
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

        {/* 5) DISCOVER MORE */}
        {newModels.length > 0 && (
          <section>
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
            </section>
        )}

{(brandOverview || brandPositioning || warrantyServiceNetwork || brandProsCons.pros.length > 0 || brandProsCons.cons.length > 0 || brandHistory) && (
            <section className="space-y-8">
                {/* Brand Overview - Full Width Prominent Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-primary/10 p-8 md:p-12">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -mr-48 -mt-48 blur-3xl" />
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                            <span className="w-2 h-2 bg-primary rounded-full" />
                            About {brandData.name}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">{brandData.name} Overview</h2>
                        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline">
                            {brandOverview ? (
                                <div dangerouslySetInnerHTML={{ __html: brandOverview }} />
                            ) : (
                                splitParagraphs(getTemplateOverview(brandData.name)).map((paragraph, index) => (
                                    <p key={`overview-${index}`} className="text-base">{paragraph}</p>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Information - 2 Column Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Brand Positioning */}
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                <span className="text-lg">🎯</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Brand Positioning</h3>
                                <p className="text-xs text-muted-foreground">Market Position</p>
                            </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3 [&_li]:mb-1 [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline">
                            {brandPositioning ? (
                                <div dangerouslySetInnerHTML={{ __html: brandPositioning }} />
                            ) : (
                                <p>{getTemplatePositioning(brandData.name)}</p>
                            )}
                        </div>
                    </Card>

                    {/* Warranty & Service */}
                    <Card className="p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                <span className="text-lg">🔧</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Warranty & Service</h3>
                                <p className="text-xs text-muted-foreground">Support & Coverage</p>
                            </div>
                        </div>
                        <div className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3 [&_li]:mb-1 [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline">
                            {warrantyServiceNetwork ? (
                                <div dangerouslySetInnerHTML={{ __html: warrantyServiceNetwork }} />
                            ) : (
                                <p>{getTemplateWarrantyService(brandData.name)}</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Brand History */}
                <Card className="p-6 md:p-8 hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                            <span className="text-lg">📖</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold">Brand History</h3>
                            <p className="text-xs text-muted-foreground">Evolution & Journey</p>
                        </div>
                    </div>
                        <div className="prose prose-sm max-w-none text-sm text-muted-foreground leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3 [&_li]:mb-1 [&_h1]:text-base [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_a]:text-primary [&_a]:underline">
                        {brandHistory ? (
                            <div dangerouslySetInnerHTML={{ __html: brandHistory }} />
                        ) : (
                            <p>{getTemplateHistory(brandData.name)}</p>
                        )}
                    </div>
                </Card>

                {/* Pros & Cons - Full Width Section */}
                {(brandProsCons.pros.length > 0 || getTemplateProsCons().pros.length > 0 || brandProsCons.cons.length > 0 || getTemplateProsCons().cons.length > 0) && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-xl font-bold mb-1">Strengths & Considerations</h3>
                            <p className="text-sm text-muted-foreground">What makes {brandData.name} stand out</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Pros Card */}
                            {(brandProsCons.pros.length > 0 || getTemplateProsCons().pros.length > 0) && (
                                <Card className="p-6 md:p-8 border-l-4 border-l-green-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/20">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                                            <span className="text-lg font-bold text-green-600">✓</span>
                                        </div>
                                        <h4 className="text-lg font-semibold text-green-700 dark:text-green-400">Pros</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {(brandProsCons.pros.length > 0 ? brandProsCons.pros : getTemplateProsCons().pros).map((pro, index) => (
                                            <li key={index} className="text-sm text-muted-foreground flex gap-3">
                                                <span className="text-green-600 font-bold mt-0.5">•</span>
                                                <span>{pro}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )}

                            {/* Cons Card */}
                            {(brandProsCons.cons.length > 0 || getTemplateProsCons().cons.length > 0) && (
                                <Card className="p-6 md:p-8 border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50/50 to-transparent dark:from-orange-950/20">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                                            <span className="text-lg font-bold text-orange-600">!</span>
                                        </div>
                                        <h4 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Considerations</h4>
                                    </div>
                                    <ul className="space-y-3">
                                        {(brandProsCons.cons.length > 0 ? brandProsCons.cons : getTemplateProsCons().cons).map((con, index) => (
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
                )}
              </section>
          )}

        {/* 6) FAQ SECTION */}
        <section className="space-y-6">
            <div className="text-center space-y-2 mb-8">
                <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Find answers to common questions about {brandData.name} vehicles</p>
            </div>
            <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
              {(faqItems.length > 0 ? faqItems : getTemplateFaqs(brandData.name, startingPrice)).map((item, index) => (
                  <AccordionItem key={`faq-${index}`} value={`item-${index + 1}`} className="mb-3 border border-slate-200 dark:border-slate-700 rounded-lg px-4 overflow-hidden data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-slate-800/50 transition-colors">
                    <AccordionTrigger className="text-base font-semibold py-4 hover:no-underline hover:text-primary">
                      <span className="flex items-start gap-3 text-left">
                        <span className="text-lg font-bold text-primary mt-0.5">Q.</span>
                        <span>{item.question}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4 pt-0 leading-relaxed whitespace-pre-line">
                      <span className="flex gap-3">
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0">A.</span>
                        <span>{item.answer}</span>
                      </span>
                    </AccordionContent>
                  </AccordionItem>
                ))
              }
            </Accordion>
            
            <Card className="bg-gradient-to-br from-primary/5 to-primary/0 border-primary/20 p-8 mt-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="w-8 h-8 text-primary" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Didn't find your answer?</h4>
                <p className="text-sm text-muted-foreground mb-4">Our {brandData.name} dealership team is ready to help you with personalized assistance.</p>
                <Button className="gap-2">
                    📍 Find a Nearby Dealer
                </Button>
            </Card>
        </section>

        {/* 7) RELATED BRANDS */}
        <section>
             <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">Other Brands to Explore</h3>
             <div className="flex flex-wrap gap-4">
                 {relatedBrands.map((rb) => (
                     <Link key={rb.id} to={`/${rb.slug}`}>
                         <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border rounded-full px-4 py-2 hover:border-primary hover:shadow-sm transition-all">
                             {rb.logo ? (
                               <img src={rb.logo} alt={rb.name} className="w-6 h-6 object-contain" loading="lazy" />
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