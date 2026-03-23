import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ModelCard from "@/components/home/ModelCard";
import { useModels, useVariants } from "@/lib/api-hooks";
import { Trophy, ArrowRight, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseINRToRupees } from "@/lib/guards";

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

const TopPicks = () => {
  const { data: allModels = [], isLoading: modelsLoading } = useModels();
  const { data: allVariants = [], isLoading: variantsLoading } = useVariants("");

  const topModels = useMemo(() => {
    const metricsByModelKey = new Map<string, { minPrice: number; maxMileage: number }>();

    allVariants.forEach((variant: any) => {
      const keys = getVariantModelKeys(variant);
      if (keys.length === 0) return;

      const parsedPrice = parseINRToRupees(variant?.price);
      const price = parsedPrice && parsedPrice > 0 ? parsedPrice : 0;
      const mileage = Number(variant?.mileage ?? 0);

      keys.forEach((key) => {
        const current = metricsByModelKey.get(key) ?? { minPrice: 0, maxMileage: 0 };
        const minPrice =
          price > 0 && (current.minPrice === 0 || price < current.minPrice)
            ? price
            : current.minPrice;
        const maxMileage = mileage > current.maxMileage ? mileage : current.maxMileage;
        metricsByModelKey.set(key, { minPrice, maxMileage });
      });
    });

    const candidates = allModels.map((model: any) => {
      const keys = getModelKeys(model);
      let minPrice = 0;
      let maxMileage = 0;

      keys.forEach((key) => {
        const metrics = metricsByModelKey.get(key);
        if (!metrics) return;
        if (metrics.minPrice > 0 && (minPrice === 0 || metrics.minPrice < minPrice)) {
          minPrice = metrics.minPrice;
        }
        if (metrics.maxMileage > maxMileage) {
          maxMileage = metrics.maxMileage;
        }
      });

      if (minPrice === 0) {
        const fallback = parseINRToRupees(model?.priceRange?.min ?? model?.expectedPriceMin ?? model?.price);
        minPrice = fallback && fallback > 0 ? fallback : 0;
      }
      if (maxMileage === 0) {
        maxMileage = Number(model?.mileage ?? 0);
      }

      return { model, minPrice, maxMileage };
    });

    const validCandidates = candidates.filter((item) => item.minPrice > 0 || item.maxMileage > 0);
    if (validCandidates.length === 0) return [];

    const minPrice = Math.min(...validCandidates.map((item) => item.minPrice || Number.MAX_SAFE_INTEGER));
    const maxPrice = Math.max(...validCandidates.map((item) => item.minPrice || 0));
    const minMileage = Math.min(...validCandidates.map((item) => item.maxMileage));
    const maxMileage = Math.max(...validCandidates.map((item) => item.maxMileage));

    return validCandidates
      .map((item) => {
        const priceScore =
          maxPrice > minPrice ? (maxPrice - item.minPrice) / (maxPrice - minPrice) : 1;
        const mileageScore =
          maxMileage > minMileage ? (item.maxMileage - minMileage) / (maxMileage - minMileage) : 0;
        const score = mileageScore * 0.55 + priceScore * 0.45;
        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.model);
  }, [allModels, allVariants]);

  const isLoading = modelsLoading || variantsLoading;

  return (
    <section className="py-8 md:py-10 bg-background relative overflow-hidden border-b">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl 2xl:max-w-[90rem] relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-amber-500 font-medium text-sm mb-3 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full w-fit">
              <Trophy className="w-4 h-4" /> Editors' Choice
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Popular <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Cars</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Curated using a value-first mix of price and mileage.
              Discover cars that balance affordability with efficiency.
            </p>
          </div>

          {/* <Link to="/brands?sort=popular">
            <Button variant="outline" className="group border-primary/20 hover:bg-primary/5 hidden md:flex">
              View All Rankings
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link> */}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                 <Skeleton className="h-[220px] w-full rounded-2xl" />
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                 </div>
              </div>
            ))}
          </div>
        ) : topModels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {topModels.map((model: any, index: number) => (
              <div key={model.id} className="group relative">
                {/* Ranking Badge */}
                <div className={cn(
                    "absolute -top-3 -right-3 z-20 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 transition-transform group-hover:scale-110",
                    index === 0 ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white" : 
                    index === 1 ? "bg-gradient-to-r from-slate-200 to-slate-300 text-slate-700" :
                    index === 2 ? "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800" : 
                    "bg-white border text-muted-foreground"
                )}>
                    {index === 0 && <Sparkles className="w-3 h-3 fill-current" />}
                    #{index + 1} {index === 0 ? "Choice" : ""}
                </div>
                
                {/* Card Container with Hover Lift */}
                <div className="transform transition-all duration-300 hover:-translate-y-2 h-full">
                    <ModelCard model={model} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-3xl border border-dashed">
            <Star className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground text-lg">No trending models found at the moment.</p>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
           <Link to="/brands?sort=popular">
            <Button variant="outline" className="w-full h-12 text-base">
              View All Rankings
            </Button>
           </Link>
        </div>

      </div>
    </section>
  );
};

export default TopPicks;