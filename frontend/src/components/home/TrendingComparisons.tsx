import { Link } from "react-router-dom";
import { TrendingUp, ArrowRight, Scale, Flame, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getTrendingComparisons } from "@/lib/data";
import { cn } from "@/lib/utils";

const TrendingComparisons = () => {
  const comparisons = getTrendingComparisons().slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-background border-t border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 font-medium text-sm mb-3 uppercase tracking-wider bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full w-fit border border-orange-200 dark:border-orange-800">
              <Flame className="w-4 h-4 fill-current" /> Hot Battles
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Comparisons</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              See what other buyers are debating. The most popular head-to-head face-offs right now.
            </p>
          </div>

          <Link to="/compare">
            <Button variant="ghost" className="group hidden md:flex text-base">
              View All Battles
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
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
        </div>

        {/* Mobile View All Button */}
        <div className="mt-10 text-center md:hidden">
           <Link to="/compare">
            <Button variant="outline" className="w-full h-12 text-base">
              View All Battles
            </Button>
           </Link>
        </div>

      </div>
    </section>
  );
};

export default TrendingComparisons;