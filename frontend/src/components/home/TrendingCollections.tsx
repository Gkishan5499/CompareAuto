import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BatteryCharging, Coins, Shapes, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useModels } from "@/lib/api-hooks";
import ModelCard from "@/components/home/ModelCard";

const BODY_TABS = ["SUV", "Hatchback", "Sedan"] as const;
const BUDGET_TABS = [
  { key: "under-10", label: "Under 10L", min: 0, max: 1000000 },
  { key: "10-20", label: "10L - 20L", min: 1000000, max: 2000000 },
  { key: "20-plus", label: "20L+", min: 2000000, max: Number.POSITIVE_INFINITY },
] as const;

const getMinPrice = (model: any) => {
  const price = model?.priceRange?.min ?? model?.expectedPriceMin ?? model?.price ?? 0;
  return typeof price === "number" ? price : 0;
};

const matchBodyType = (model: any, bodyType: string) => {
  const raw = model?.bodyType || "";
  const normalized = raw.toLowerCase().replace(/\s+/g, "-");
  return normalized.includes(bodyType.toLowerCase());
};

const isEV = (model: any) => {
  const fuelType = model?.fuelType || "";
  const fuelTypes = Array.isArray(model?.fuelTypes) ? model.fuelTypes : [];
  const normalized = fuelType.toLowerCase();
  return (
    normalized === "electric" ||
    normalized === "ev" ||
    fuelTypes.some((f: string) => {
      const value = f.toLowerCase();
      return value === "electric" || value === "ev";
    })
  );
};

const TrendingCollections = () => {
  const { data: models = [], isLoading } = useModels();
  const [activeBody, setActiveBody] = useState<(typeof BODY_TABS)[number]>("SUV");
  const [activeBudget, setActiveBudget] = useState<(typeof BUDGET_TABS)[number]>(BUDGET_TABS[0]);

  const bodyTypeModels = useMemo(() => {
    return models
      .filter((model: any) => matchBodyType(model, activeBody))
      .slice(0, 4);
  }, [models, activeBody]);

  const budgetModels = useMemo(() => {
    return models
      .filter((model: any) => {
        const price = getMinPrice(model);
        return price >= activeBudget.min && price < activeBudget.max;
      })
      .sort((a: any, b: any) => getMinPrice(a) - getMinPrice(b))
      .slice(0, 4);
  }, [models, activeBudget]);

  const evModels = useMemo(() => {
    return models
      .filter((model: any) => isEV(model))
      .slice(0, 4);
  }, [models]);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-50/60 via-transparent to-transparent border-y border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-medium text-sm mb-3 uppercase tracking-wider bg-emerald-100/60 dark:bg-emerald-900/30 px-3 py-1 rounded-full w-fit border border-emerald-200/70 dark:border-emerald-800">
              <Sparkles className="w-4 h-4" /> Trending Picks
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Trending Cars, Curated for You
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mt-3">
              Discover what buyers are browsing most right now across body styles, budgets, and EVs.
            </p>
          </div>
          <Link to="/new-cars">
            <Button variant="ghost" className="group hidden md:flex text-base">
              View All Cars
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* By Body Type */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold">
              <Shapes className="w-4 h-4" /> By Body Type
            </div>
            <div className="flex gap-2 flex-wrap">
              {BODY_TABS.map((tab) => (
                <Button
                  key={tab}
                  size="sm"
                  variant={activeBody === tab ? "default" : "outline"}
                  onClick={() => setActiveBody(tab)}
                >
                  {tab}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : bodyTypeModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bodyTypeModels.map((model: any) => (
                <ModelCard key={model.id || model.slug} model={model} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No models found for {activeBody} right now.
              </CardContent>
            </Card>
          )}
        </div>

        {/* By Budget */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold">
              <Coins className="w-4 h-4" /> By Budget
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
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : budgetModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {budgetModels.map((model: any) => (
                <div key={model.id || model.slug}>
                  <ModelCard model={model} />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No models found in this budget range.
              </CardContent>
            </Card>
          )}
        </div>

        {/* EV */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm font-semibold">
              <BatteryCharging className="w-4 h-4" /> Electric Vehicles
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              Zero Emissions Picks
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : evModels.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {evModels.map((model: any) => (
                <ModelCard key={model.id || model.slug} model={model} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No EV models found right now.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:hidden">
          <Link to="/new-cars">
            <Button variant="outline" className="w-full">
              View All Cars
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingCollections;
