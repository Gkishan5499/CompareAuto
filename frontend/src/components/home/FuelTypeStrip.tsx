import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Battery, Leaf, Wind, Fuel, Zap, ArrowRight, Flame } from "lucide-react";
import { useModels, useVariants } from "@/lib/api-hooks";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const FuelTypeStrip = () => {
  const { data: allModels = [] } = useModels();
  const { data: allVariants = [] } = useVariants("");

  const counts = useMemo(() => {
    const countsMap: Record<string, number> = {};
    const modelKeys = new Set(
      allModels
        .map((model: any) => model.id || model._id || model.slug)
        .filter(Boolean)
        .map(String)
    );
    const fuelLabelMap: Record<string, string> = {
      petrol: "Petrol",
      diesel: "Diesel",
      cng: "CNG",
      hybrid: "Hybrid",
      electric: "EV",
      ev: "EV",
    };

    allVariants.forEach((variant: any) => {
      const modelKey = String(variant.modelId || variant.model || variant.modelSlug || "");
      if (!modelKey || (modelKeys.size > 0 && !modelKeys.has(modelKey))) return;
      const fuelKey = String(variant.fuelType || "").toLowerCase();
      const label = fuelLabelMap[fuelKey];
      if (!label) return;
      countsMap[label] = (countsMap[label] || 0) + 1;
    });

    return countsMap;
  }, [allModels, allVariants]);

  const fuelTypes = [
    { name: "EV", icon: Battery, slug: "ev", filterValue: "Electric", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", description: "Zero Emissions" },
    { name: "Hybrid", icon: Leaf, slug: "hybrid", filterValue: "Hybrid", color: "text-primary", bg: "bg-primary/10 dark:bg-primary/20", description: "Efficient & Smart" },
    { name: "CNG", icon: Wind, slug: "cng", filterValue: "CNG", color: "text-cyan-600", bg: "bg-cyan-100 dark:bg-cyan-900/30", description: "Budget Friendly" },
    { name: "Petrol", icon: Fuel, slug: "petrol", filterValue: "Petrol", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", description: "High Performance" },
    { name: "Diesel", icon: Zap, slug: "diesel", filterValue: "Diesel", color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", description: "Long Range" },
  ];

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl 2xl:max-w-[90rem]">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-2 uppercase tracking-wider">
              <Flame className="w-4 h-4" /> Power Your Drive
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Explore by Fuel Type
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-base">
              From electric efficiency to diesel durability, find the engine that matches your needs.
            </p>
          </div>
          
          <Link to="/new-cars?filter=fuel">
            <Button variant="ghost" className="group hidden md:flex">
              View All Options
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-5 gap-6">
          {fuelTypes.map(({ name, icon: Icon, filterValue, color, bg, description }) => {
            const count = counts[name] || 0;
            return (
              <Link key={name} to={`/new-cars?fuel=${encodeURIComponent(filterValue)}`} className="group h-full">
                <Card className="h-full border-muted/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card overflow-hidden relative">
                  {/* Subtle hover background tint based on color prop */}
                  <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity", color.replace("text-", "bg-"))} />
                  
                  <CardContent className="p-6 flex flex-col items-center text-center justify-between h-full gap-4 relative z-10">
                    
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bg)}>
                      <Icon className={cn("w-8 h-8", color)} />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {description}
                      </p>
                    </div>

                    <div className="mt-auto pt-4 w-full border-t border-dashed border-slate-200 dark:border-slate-800">
                         <span className="text-xs font-medium text-slate-500">
                           {count} {count === 1 ? "Variant" : "Variants"}
                         </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
          {fuelTypes.map(({ name, icon: Icon, filterValue, color, bg, description }) => {
            const count = counts[name] || 0;
            return (
              <Link 
                key={name} 
                to={`/new-cars?fuel=${encodeURIComponent(filterValue)}`} 
                className="snap-start flex-shrink-0 w-[160px]"
              >
                <Card className="h-full border-muted/60 active:scale-95 transition-transform bg-card">
                  <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", bg)}>
                      <Icon className={cn("w-6 h-6", color)} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1">{name}</h3>
                      <p className="text-[10px] text-muted-foreground mb-2">{description}</p>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        {count} Variants
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center md:hidden">
           <Link to="/brands?filter=fuel">
            <Button variant="outline" className="w-full">
              View All Options
            </Button>
           </Link>
        </div>

      </div>
    </section>
  );
};

export default FuelTypeStrip;