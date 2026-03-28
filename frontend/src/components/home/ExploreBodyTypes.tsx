import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useModels, useVariants } from "@/lib/api-hooks";
import { Car, CarFront, Truck, Bus, Zap, Sparkles, Boxes, LayoutGrid } from "lucide-react";
import VehicleCategoryToggle from "@/components/home/VehicleCategoryToggle";

type BodyTypeItem = {
  slug: string;
  label: string;
  count: number;
};

const toLabel = (raw: string) => {
  const cleaned = raw.replace(/[-_]+/g, " ").trim();
  if (!cleaned) return "";
  if (cleaned.toUpperCase() === cleaned) return cleaned;
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};

interface ExploreBodyTypesProps {
  showHeader?: boolean;
  vehicleCategory?: "all" | "car" | "bike";
  onVehicleCategoryChange?: (value: "all" | "car" | "bike") => void;
}

const ExploreBodyTypes = ({ showHeader = true, vehicleCategory = "all", onVehicleCategoryChange }: ExploreBodyTypesProps) => {
  const { data: models = [], isLoading: modelsLoading } = useModels(vehicleCategory);
  const { data: variants = [], isLoading: variantsLoading } = useVariants("", vehicleCategory);

  const allBodyTypes = [
    { name: "Hatchback", slug: "hatchback" },
    { name: "Sedan", slug: "sedan" },
    { name: "SUV", slug: "suv" },
    { name: "MUV", slug: "muv" },
    { name: "Coupe", slug: "coupe" },
    { name: "Convertible", slug: "convertible" },
    { name: "Pickup", slug: "pickup" },
    { name: "Luxury", slug: "luxury" },
    { name: "Electric", slug: "electric" },
    { name: "Crossover", slug: "crossover" },
    { name: "Micro Suv", slug: "micro-suv" },
    { name: "Mini Suv", slug: "mini-suv" },
    { name: "MPV", slug: "mpv" },
    { name: "Wagon", slug: "wagon" },
  ];

  const bodyTypes = useMemo<BodyTypeItem[]>(() => {
    const map = new Map<string, BodyTypeItem>();
    const modelBodyType = new Map<string, string>();

    models.forEach((model: any) => {
      const raw = (model?.bodyType || "").trim();
      if (!raw || !model?.id) return;
      modelBodyType.set(model.id, raw);
    });

    variants.forEach((variant: any) => {
      const raw = modelBodyType.get(variant?.modelId) || "";
      if (!raw) return;
      const slug = raw.toLowerCase().replace(/\s+/g, "-");
      if (!slug) return;

      const existing = map.get(slug);
      if (existing) {
        existing.count += 1;
        return;
      }

      map.set(slug, {
        slug,
        label: toLabel(raw),
        count: 1,
      });
    });

    const list = allBodyTypes.map((type) => {
      const entry = map.get(type.slug);
      return {
        slug: type.slug,
        label: type.name,
        count: entry ? entry.count : 0,
      };
    });

    return list.sort((a, b) => {
      const hasA = a.count > 0;
      const hasB = b.count > 0;
      if (hasA !== hasB) return hasA ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
  }, [models, variants]);

  const bodyTypeConfig: Record<string, { icon: any; description: string }> = {
    "micro-suv": { icon: CarFront, description: "Compact & agile" },
    "mini-suv": { icon: CarFront, description: "Urban crossover" },
    suv: { icon: CarFront, description: "Sport utility" },
    hatchback: { icon: CarFront, description: "City commuter" },
    sedan: { icon: CarFront, description: "Premium comfort" },
    muv: { icon: Bus, description: "Multi utility" },
    mpv: { icon: Bus, description: "Family mover" },
    coupe: { icon: Sparkles, description: "Sporty style" },
    convertible: { icon: Sparkles, description: "Open top" },
    pickup: { icon: Truck, description: "Lifestyle truck" },
    wagon: { icon: Boxes, description: "Practical estate" },
    luxury: { icon: Sparkles, description: "Premium class" },
    electric: { icon: Zap, description: "Zero emissions" },
    crossover: { icon: CarFront, description: "Mixed utility" },
  };

  const isLoading = modelsLoading || variantsLoading;
  const visibleBodyTypes = useMemo(
    () => (showHeader ? bodyTypes.slice(0, 5) : bodyTypes),
    [bodyTypes, showHeader]
  );
  const hasMoreBodyTypes = showHeader && bodyTypes.length > visibleBodyTypes.length;

  return (
    <section className="py-6 md:py-8 bg-gradient-to-b from-background to-muted/20 border-t">
      <div className="container mx-auto px-4 max-w-7xl 2xl:max-w-[90rem]">
        {showHeader && (
          <div className="mb-6 md:mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-2 uppercase tracking-wider">
                  <LayoutGrid className="w-4 h-4" /> Browse by Body Type
                </div>
                <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-3">
                  Explore by <span className="text-primary">Body Type</span>
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Browse cars by their body style and design
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                {onVehicleCategoryChange && (
                  <VehicleCategoryToggle value={vehicleCategory} onChange={onVehicleCategoryChange} />
                )}
                {hasMoreBodyTypes && (
                  <Link to="/body" className="hidden md:block">
                    <Button variant="outline">View more body types</Button>
                  </Link>
                )}
              </div>
            </div>
            {onVehicleCategoryChange && (
              <div className="md:hidden mt-4">
                <VehicleCategoryToggle value={vehicleCategory} onChange={onVehicleCategoryChange} />
              </div>
            )}
          </div>
        )}

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleBodyTypes.map((type) => {
            const config = bodyTypeConfig[type.slug];
            const Icon = config?.icon || Car;
            const description = config?.description || "";
            const countLabel = isLoading ? "..." : `${type.count} variants`;
            const isDisabled = type.count === 0;

            const content = (
              <Card
                className={`h-full border-muted/60 bg-card transition-all duration-300 ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                }`}
              >
                <CardContent className="p-5 flex flex-col items-center text-center gap-4 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Icon className="w-7 h-7 text-slate-500" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground">{type.label}</h3>
                    {description && (
                      <p className="text-xs text-muted-foreground font-medium">{description}</p>
                    )}
                  </div>
                  <div className="mt-auto pt-3 w-full border-t border-dashed border-slate-200 dark:border-slate-800">
                    <span className="text-xs font-medium text-slate-500">{countLabel}</span>
                  </div>
                </CardContent>
              </Card>
            );

            return isDisabled ? (
              <div key={type.slug}>{content}</div>
            ) : (
              <Link key={type.slug} to={`/body/${type.slug}`} className="group h-full">
                {content}
              </Link>
            );
          })}
        </div>

        <div className="md:hidden flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
          {visibleBodyTypes.map((type) => {
            const config = bodyTypeConfig[type.slug];
            const Icon = config?.icon || Car;
            const description = config?.description || "";
            const countLabel = isLoading ? "..." : `${type.count} variants`;
            const isDisabled = type.count === 0;

            const content = (
              <Card className={`h-full border-muted/60 bg-card transition-transform ${isDisabled ? "opacity-50" : "active:scale-95"}`}>
                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{type.label}</h3>
                    {description && (
                      <p className="text-[10px] text-muted-foreground mb-2">{description}</p>
                    )}
                    <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                      {countLabel}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );

            return isDisabled ? (
              <div key={type.slug} className="snap-start flex-shrink-0 w-[160px]">
                {content}
              </div>
            ) : (
              <Link key={type.slug} to={`/body/${type.slug}`} className="snap-start flex-shrink-0 w-[160px]">
                {content}
              </Link>
            );
          })}
        </div>

        {hasMoreBodyTypes && (
          <div className="mt-6 text-center md:hidden">
            <Link to="/body">
              <Button variant="outline">View more body types</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExploreBodyTypes;
