import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ModelCard from "@/components/home/ModelCard";
import { useModels } from "@/lib/api-hooks";
import { Trophy, ArrowRight, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const TopPicks = () => {
  const { data: allModels = [], isLoading } = useModels();

  const topModels = useMemo(() => {
    return [...allModels]
      .sort((a: any, b: any) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        const aReviews = a.reviews || 0;
        const bReviews = b.reviews || 0;
        // Weighted sort: Rating has high impact, review count breaks ties
        return (bRating * 100 + bReviews) - (aRating * 100 + aReviews);
      })
      .slice(0, 4);
  }, [allModels]);

  return (
    <section className="py-16 md:py-24 bg-background relative overflow-hidden border-b">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-amber-500 font-medium text-sm mb-3 uppercase tracking-wider bg-amber-500/10 px-3 py-1 rounded-full w-fit">
              <Trophy className="w-4 h-4" /> Editors' Choice
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Top Picks <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">For You</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Curated selections based on popularity, expert ratings, and customer satisfaction. 
              Find out what everyone is driving.
            </p>
          </div>

          <Link to="/brands?sort=popular">
            <Button variant="outline" className="group border-primary/20 hover:bg-primary/5 hidden md:flex">
              View All Rankings
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
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