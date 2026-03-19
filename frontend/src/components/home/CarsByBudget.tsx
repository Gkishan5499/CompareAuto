import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Coins, ArrowRight } from "lucide-react";
import { useModels, useVariants } from "@/lib/api-hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ModelCard from "@/components/home/ModelCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const BUDGET_TABS = [
  { key: "under-5", label: "Under 5L", min: 0, max: 500000 },
  { key: "under-10", label: "Under 10L", min: 0, max: 1000000 },
  { key: "under-15", label: "Under 15L", min: 0, max: 1500000 },
] as const;

const parsePriceNumber = (value: any) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return 0;
  const normalized = value.toLowerCase().replace(/,/g, "").trim();
  const numeric = Number(normalized.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric)) return 0;
  if (normalized.includes("crore") || normalized.includes("cr")) return numeric * 100;
  return numeric;
};

const toRupees = (value: any) => {
  const price = parsePriceNumber(value);
  if (!Number.isFinite(price) || price <= 0) return 0;
  // Values below 1,000 are most likely in lakhs.
  return price < 1000 ? Math.round(price * 100000) : price;
};

const getModelKeys = (model: any) => {
  return [model?.id, model?._id, model?.slug].filter(Boolean).map((value) => String(value));
};

const getVariantModelKeys = (variant: any) => {
  return [
    variant?.modelId,
    variant?.model,
    variant?.modelSlug,
    variant?.model?.id,
    variant?.model?._id,
    variant?.model?.slug,
  ]
    .filter(Boolean)
    .map((value) => String(value));
};

const CarsByBudget = () => {
  const { data: models = [], isLoading } = useModels();
  const { data: allVariants = [], isLoading: isVariantsLoading } = useVariants("");
  const [activeBudget, setActiveBudget] = useState<(typeof BUDGET_TABS)[number]>(BUDGET_TABS[1]);

  const variantMinPriceByModelKey = useMemo(() => {
    const map = new Map<string, number>();
    allVariants.forEach((variant: any) => {
      const keys = getVariantModelKeys(variant);
      const price = toRupees(variant?.price);
      if (keys.length === 0 || price <= 0) return;

      keys.forEach((key) => {
        const current = map.get(key) ?? 0;
        if (current === 0 || price < current) {
          map.set(key, price);
        }
      });
    });
    return map;
  }, [allVariants]);

  const getEffectiveMinPrice = (model: any) => {
    const keys = getModelKeys(model);
    let minVariantPrice = 0;
    keys.forEach((key) => {
      const price = variantMinPriceByModelKey.get(key) ?? 0;
      if (price > 0 && (minVariantPrice === 0 || price < minVariantPrice)) {
        minVariantPrice = price;
      }
    });

    if (minVariantPrice > 0) return minVariantPrice;
    return toRupees(model?.priceRange?.min ?? model?.expectedPriceMin ?? model?.price ?? 0);
  };

  const budgetModels = useMemo(() => {
    return models
      .filter((model: any) => {
        const price = getEffectiveMinPrice(model);
        if (price <= 0) return false;
        return price >= activeBudget.min && price < activeBudget.max;
      })
      .sort((a: any, b: any) => getEffectiveMinPrice(a) - getEffectiveMinPrice(b))
      .slice(0, 8);
  }, [models, activeBudget, variantMinPriceByModelKey]);

  return (
    <section className="py-16 md:py-20 bg-background border-y border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-2 uppercase tracking-wider">
              <Coins className="w-4 h-4" /> Budget Discovery
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">Cars by Budget</h2>
          </div>
          <Link
            to={`/new-cars?priceMin=${activeBudget.min}&priceMax=${activeBudget.max}&sort=price_asc`}
            className="hidden md:block"
          >
            <Button variant="ghost" className="group">
              View All Cars
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="flex gap-2 flex-wrap">
          {BUDGET_TABS.map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={activeBudget.key === tab.key ? "default" : "outline"}
              onClick={() => setActiveBudget(tab)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {isLoading || isVariantsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={idx} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : budgetModels.length > 0 ? (
          <div className="relative px-2 md:px-8">
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-3">
                {budgetModels.map((model: any) => (
                  <CarouselItem
                    key={model.id || model.slug}
                    className="pl-3 basis-[85%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                  >
                    <ModelCard model={model} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-2 md:-left-4" />
              <CarouselNext className="-right-2 md:-right-4" />
            </Carousel>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No cars found in {activeBudget.label}.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default CarsByBudget;
