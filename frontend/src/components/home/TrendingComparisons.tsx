import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Scale, Flame, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useComparisons, useModels } from "@/lib/api-hooks";
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
  limit = 4,
  offset = 0,
  showViewAll = true,
  variant = "home",
  title,
  subtitle,
}: TrendingComparisonsProps) => {
  const { data: comparisonsData = [], isLoading: comparisonsLoading } = useComparisons();
  const { data: models = [], isLoading: modelsLoading } = useModels();

  const normalizeToken = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const modelTokenMap = new Map<string, string>();
  models.forEach((model) => {
    const slug = model.slug;
    const id = model.id;
    const name = model.name;

    modelTokenMap.set(normalizeToken(slug), slug);
    modelTokenMap.set(normalizeToken(id), slug);
    modelTokenMap.set(normalizeToken(name), slug);
  });

  const baseComparisons = comparisonsData
    .map((comparison) => {
      const normalizedModels = (comparison.models || [])
        .map((token: string) => modelTokenMap.get(normalizeToken(token)))
        .filter(Boolean) as string[];

      return {
        ...comparison,
        models: normalizedModels,
      };
    })
    .filter((comparison) => comparison.models.length >= 2)
    .sort((a, b) => b.views - a.views);

  let comparisons = baseComparisons.slice(offset, offset + limit);
  if (comparisons.length < limit && offset > 0) {
    const remaining = limit - comparisons.length;
    const fallback = baseComparisons.filter(
      (item) => !comparisons.some((existing) => existing.id === item.id)
    );
    comparisons = [...comparisons, ...fallback.slice(0, remaining)];
  }

  const isLoading = comparisonsLoading || modelsLoading;
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
        "py-16 md:py-24 border-t",
        isCompareVariant
          ? "bg-gradient-to-br from-amber-50 via-white to-rose-50 border-amber-100"
          : "bg-background border-slate-100 dark:border-slate-800"
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
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

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {comparisons.map((comparison, index) => (
            <Link 
              key={comparison.id} 
              to={`/compare?models=${comparison.models.join(",")}`}
              className="group h-full"
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

                <CardContent className="p-6 flex flex-col h-full">
                  
                  {/* Visual VS Header */}
                  <div className="flex items-center justify-center mb-6 relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-700"></div>
                    </div>
                    <div className="relative z-10 w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:border-orange-500/50 group-hover:scale-110 transition-all duration-300 shadow-sm">
                        <span className="text-xs font-black text-muted-foreground group-hover:text-orange-600">VS</span>
                    </div>
                  </div>

                  {/* Title & Stats */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-bold leading-snug mb-2 group-hover:text-orange-600 transition-colors">
                      {comparison.name}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        <BarChart3 className="w-3 h-3" />
                        {(comparison.views / 1000).toFixed(1)}k views
                    </div>
                  </div>

                  {/* Features/Tags */}
                  <div className="mt-auto space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-medium text-muted-foreground text-center">
                        <div className="bg-slate-50 dark:bg-slate-900 py-1.5 rounded border border-slate-100 dark:border-slate-800">
                            Specs
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 py-1.5 rounded border border-slate-100 dark:border-slate-800">
                            Price
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 py-1.5 rounded border border-slate-100 dark:border-slate-800">
                            Mileage
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 py-1.5 rounded border border-slate-100 dark:border-slate-800">
                            Safety
                        </div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10 group-hover:text-orange-600 group-hover:border-orange-200 dark:group-hover:border-orange-800 transition-all">
                      Compare Now
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </Link>
          ))}

          {comparisons.length === 0 && !isLoading && (
            <Card className="h-full border-muted/60 bg-card">
              <CardContent className="p-6 h-full flex items-center justify-center text-sm text-muted-foreground">
                No battles available right now.
              </CardContent>
            </Card>
          )}
        </div>

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