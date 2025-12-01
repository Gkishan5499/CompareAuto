import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles, Calendar } from "lucide-react";
import ModelCard from "@/components/home/ModelCard";
import { modelsApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const NewLaunches = () => {
  const { data: newModels = [], isLoading } = useQuery({
    queryKey: ["models", "new"],
    queryFn: () => modelsApi.getNew(6),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && newModels.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium text-sm mb-3 uppercase tracking-wider bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-full w-fit border border-rose-200 dark:border-rose-800">
              <Sparkles className="w-4 h-4 fill-current" /> Just Arrived
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Fresh from the <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Factory</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Be the first to experience the latest engineering marvels. 
              Explore recently launched cars in the Indian market.
            </p>
          </div>

          <Link to="/new-cars">
            <Button variant="ghost" className="group hidden md:flex text-base">
              View All New Launches
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4">
                 <Skeleton className="h-[240px] w-full rounded-2xl" />
                 <div className="space-y-2 px-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {newModels.map((model: any, index: number) => (
              <div key={model.id} className="relative group">
                
                {/* "New" Badge with Glow Effect */}
                {index < 3 && (
                  <div className="absolute -top-3 -left-3 z-20">
                    <div className="relative">
                        <div className="absolute inset-0 bg-rose-500 blur-sm opacity-50 rounded-full" />
                        <div className="relative bg-gradient-to-br from-rose-500 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> NEW
                        </div>
                    </div>
                  </div>
                )}

                {/* Card Container */}
                <div className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl rounded-2xl bg-card border border-border/50 overflow-hidden">
                    <ModelCard model={model} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-10 text-center md:hidden">
           <Link to="/new-cars">
            <Button variant="outline" className="w-full h-12 text-base border-rose-200 hover:bg-rose-50 text-rose-700 dark:border-rose-800 dark:hover:bg-rose-900/30 dark:text-rose-400">
              Show All New Cars
            </Button>
           </Link>
        </div>

      </div>
    </section>
  );
};

export default NewLaunches;