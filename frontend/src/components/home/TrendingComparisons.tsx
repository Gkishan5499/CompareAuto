import { Link } from "react-router-dom";
import { ArrowRight, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useComparisons, useModels, useVariants } from "@/lib/api-hooks";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import { cn } from "@/lib/utils";

interface TrendingComparisonsProps {
  limit?: number;
  offset?: number;
  showViewAll?: boolean;
  variant?: "home" | "compare";
  title?: string;
  subtitle?: string;
}

const TrendingComparisons = ({
  limit = 6,
  offset = 0,
  showViewAll = true,
  variant = "home",
  title,
  subtitle,
}: TrendingComparisonsProps) => {
  const { data: comparisonsData = [], isLoading: comparisonsLoading } = useComparisons();
  const { data: models = [], isLoading: modelsLoading } = useModels();
  const { data: variants = [], isLoading: variantsLoading } = useVariants("");

  const normalizeToken = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const modelTokenMap = new Map<string, string>();
  const modelBySlug = new Map<string, any>();
  const compactModelTokenMap = new Map<string, string>();
  const modelKeyToSlug = new Map<string, string>();
  models.forEach((model) => {
    const slug = model.slug;
    const id = model.id;
    const _id = model._id;
    const name = model.name;
    const brandName = model.brandName || "";

    modelBySlug.set(slug, model);
    modelKeyToSlug.set(String(slug), slug);
    if (id) modelKeyToSlug.set(String(id), slug);
    if (_id) modelKeyToSlug.set(String(_id), slug);
    modelTokenMap.set(normalizeToken(slug), slug);
    modelTokenMap.set(normalizeToken(id), slug);
    modelTokenMap.set(normalizeToken(name), slug);
    modelTokenMap.set(normalizeToken(`${brandName} ${name}`), slug);

    const compactKeys = [slug, id, name, `${brandName} ${name}`]
      .filter(Boolean)
      .map((key) => normalizeToken(String(key)).replace(/\s+/g, ""));
    compactKeys.forEach((key) => compactModelTokenMap.set(key, slug));
  });

  const resolveModelSlug = (token: string): string | undefined => {
    const normalized = normalizeToken(token);
    const direct = modelTokenMap.get(normalized);
    if (direct) return direct;

    const compact = normalized.replace(/\s+/g, "");
    const compactDirect = compactModelTokenMap.get(compact);
    if (compactDirect) return compactDirect;

    for (const [key, slug] of compactModelTokenMap.entries()) {
      if (key.includes(compact) || compact.includes(key)) {
        return slug;
      }
    }

    return undefined;
  };

  const variantMinPriceByModelSlug = new Map<string, number>();
  variants.forEach((variant: any) => {
    const rawModelKey = String(variant?.modelId || variant?.model || variant?.modelSlug || "");
    if (!rawModelKey) return;

    const linkedSlug =
      modelKeyToSlug.get(rawModelKey) ||
      modelTokenMap.get(normalizeToken(rawModelKey)) ||
      resolveModelSlug(rawModelKey);

    if (!linkedSlug) return;

    const variantPrice = parseINRToRupees(variant?.exShowroomPrice ?? variant?.price);
    if (!variantPrice || variantPrice <= 0) return;

    const currentMin = variantMinPriceByModelSlug.get(linkedSlug);
    if (!currentMin || variantPrice < currentMin) {
      variantMinPriceByModelSlug.set(linkedSlug, variantPrice);
    }
  });

  const getModelImage = (model: any) => {
    if (model?.image) return model.image;
    if (Array.isArray(model?.gallery) && model.gallery.length > 0) return model.gallery[0];
    return "/placeholder.svg";
  };

  const getModelExShowroomPrice = (model: any) => {
    const modelSlug = model?.slug;
    const rawPrice =
      model?.exShowroomPrice ??
      model?.priceRange?.min ??
      model?.startingPrice ??
      model?.minPrice ??
      model?.price ??
      (modelSlug ? variantMinPriceByModelSlug.get(modelSlug) : null) ??
      model?.expectedPriceMin ??
      null;

    return parseINRToRupees(rawPrice);
  };

  const baseComparisons = comparisonsData
    .map((comparison) => {
      const normalizedModels = (comparison.models || [])
        .map((token: string) => resolveModelSlug(token))
        .filter(Boolean) as string[];

      return {
        ...comparison,
        models: normalizedModels,
        modelA: modelBySlug.get(normalizedModels[0]),
        modelB: modelBySlug.get(normalizedModels[1]),
      };
    })
    .filter((comparison) => comparison.models.length >= 2)
    .sort((a, b) => b.views - a.views);

  const model7xoSlug =
    modelTokenMap.get(normalizeToken("7xo")) ||
    modelTokenMap.get(normalizeToken("xuv 7xo")) ||
    modelTokenMap.get(normalizeToken("mahindra xuv 7xo"));
  const model3xoSlug =
    modelTokenMap.get(normalizeToken("3xo")) ||
    modelTokenMap.get(normalizeToken("xuv 3xo")) ||
    modelTokenMap.get(normalizeToken("mahindra xuv 3xo"));

  const has7xoVs3xo = baseComparisons.some((comparison) => {
    const [first, second] = comparison.models;
    if (!first || !second || !model7xoSlug || !model3xoSlug) return false;
    return (
      (first === model7xoSlug && second === model3xoSlug) ||
      (first === model3xoSlug && second === model7xoSlug)
    );
  });

  const manual7xoVs3xo =
    model7xoSlug && model3xoSlug
      ? {
          id: "manual-7xo-vs-3xo",
          name: "7XO vs 3XO",
          views: 999999,
          models: [model7xoSlug, model3xoSlug],
          modelA: modelBySlug.get(model7xoSlug),
          modelB: modelBySlug.get(model3xoSlug),
        }
      : null;

  const comparisonsPool =
    manual7xoVs3xo && !has7xoVs3xo
      ? [manual7xoVs3xo, ...baseComparisons]
      : baseComparisons;

  const visibleLimit = Math.max(limit, 6);
  let comparisons = comparisonsPool.slice(offset, offset + visibleLimit);
  if (comparisons.length < visibleLimit && offset > 0) {
    const remaining = visibleLimit - comparisons.length;
    const fallback = comparisonsPool.filter(
      (item) => !comparisons.some((existing) => existing.id === item.id)
    );
    comparisons = [...comparisons, ...fallback.slice(0, remaining)];
  }

  const isLoading = comparisonsLoading || modelsLoading || variantsLoading;
  const isEmpty = !isLoading && comparisons.length === 0;

  const isCompareVariant = variant === "compare";
  const resolvedTitle = title || (isCompareVariant ? "More Battles" : "Trending Comparisons");
  const resolvedSubtitle =
    subtitle ||
    (isCompareVariant
      ? "Fresh matchups beyond the homepage trends."
      : "See what other buyers are debating. The most popular head-to-head face-offs right now.");

  return (
    <section
      className={cn(
        "",
        isCompareVariant ? "py-10 md:py-12" : "pt-4 pb-6 md:pt-4 md:pb-8",
        isCompareVariant
          ? "bg-gradient-to-br from-amber-50 via-white to-rose-50 border-amber-100"
          : "bg-background border-slate-100 dark:border-slate-800"
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl 2xl:max-w-[90rem]">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-6">
          <div className="max-w-2xl">
            <div
              className={cn(
                "inline-flex items-center gap-2 font-medium text-sm mb-3 uppercase tracking-wider px-3 py-1 rounded-full w-fit border",
                isCompareVariant
                  ? "text-amber-700 bg-amber-100 border-amber-200"
                  : "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800"
              )}
            >
              <Flame className="w-4 h-4 fill-current" /> Hot Battles
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              {resolvedTitle.split(" ")[0]}{" "}
              <span
                className={cn(
                  "text-transparent bg-clip-text",
                  isCompareVariant
                    ? "bg-gradient-to-r from-amber-600 to-rose-600"
                    : "bg-gradient-to-r from-orange-500 to-red-600"
                )}
              >
                {resolvedTitle.split(" ").slice(1).join(" ") || "Battles"}
              </span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{resolvedSubtitle}</p>
          </div>

          {showViewAll && (
            <Link to="/compare">
              <Button variant="ghost" className="group hidden md:flex text-base">
                View All Battles
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>

        {/* Comparison Carousel */}
        <Carousel opts={{ align: "start" }} className="w-full">
          <CarouselContent className="-ml-4">
            {comparisons.map((comparison, index) => (
              <CarouselItem key={comparison.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <Link
                  to={`/compare?models=${comparison.models.join(",")}`}
                  className="group h-full block"
                >
                  <Card className="h-full border-muted/60 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card overflow-hidden relative">
                
                {/* Hot Badge for #1 */}
                {index === 0 && (
                  <div className="absolute top-0 right-0 z-20">
                    <div className="bg-gradient-to-bl from-orange-500 to-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                      #1 Trending
                    </div>
                  </div>
                )}

                <CardContent className="p-4 md:p-5 h-full flex flex-col">
                  <div className="relative mb-4">
                    <div className="absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 bg-slate-200 dark:bg-slate-700" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full border border-blue-500 bg-white dark:bg-slate-950 flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-blue-600">VS</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="min-w-0">
                        <div className="h-24 md:h-28 mb-3 overflow-hidden flex items-center justify-center">
                          <img
                            src={getModelImage(comparison.modelA)}
                            alt={comparison.modelA ? `${comparison.modelA.brandName || ""} ${comparison.modelA.name || ""}`.trim() : "Car A"}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground leading-tight truncate">
                          {comparison.modelA?.brandName || ""}
                        </p>
                        <p className="text-[1rem] md:text-2xl font-bold leading-tight truncate">
                          {comparison.modelA?.name || comparison.models[0]}
                        </p>
                        <p className="text-lg md:text-xl font-semibold leading-tight mt-2 truncate">
                          {formatINR(getModelExShowroomPrice(comparison.modelA), true)}
                        </p>
                        <p className="text-muted-foreground text-sm">ex-showroom</p>
                      </div>

                      <div className="min-w-0">
                        <div className="h-24 md:h-28 mb-3 overflow-hidden flex items-center justify-center">
                          <img
                            src={getModelImage(comparison.modelB)}
                            alt={comparison.modelB ? `${comparison.modelB.brandName || ""} ${comparison.modelB.name || ""}`.trim() : "Car B"}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground leading-tight truncate">
                          {comparison.modelB?.brandName || ""}
                        </p>
                        <p className="text-[1rem] md:text-2xl font-bold leading-tight truncate">
                          {comparison.modelB?.name || comparison.models[1]}
                        </p>
                        <p className="text-lg md:text-xl font-semibold leading-tight mt-2 truncate">
                          {formatINR(getModelExShowroomPrice(comparison.modelB), true)}
                        </p>
                        <p className="text-muted-foreground text-sm">ex-showroom</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-11 text-xl border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-600"
                  >
                    Compare Now
                  </Button>
                </CardContent>
                  </Card>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-3 md:-left-6" />
          <CarouselNext className="-right-3 md:-right-6" />
        </Carousel>

        {comparisons.length === 0 && !isLoading && (
            <Card className="h-full border-muted/60 bg-card">
              <CardContent className="p-6 h-full flex items-center justify-center text-sm text-muted-foreground">
                No battles available right now.
              </CardContent>
            </Card>
        )}

        {/* Mobile View All Button */}
        {showViewAll && (
          <div className="mt-10 text-center md:hidden">
            <Link to="/compare">
              <Button variant="outline" className="w-full h-12 text-base">
                View All Battles
              </Button>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};

export default TrendingComparisons;