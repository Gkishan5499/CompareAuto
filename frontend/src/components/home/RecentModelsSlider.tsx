import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { modelsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ModelCard from "@/components/home/ModelCard";

const RecentModelsSlider = () => {
  const { data: recent = [], isLoading } = useQuery({
    queryKey: ["models", "recent"],
    queryFn: () => modelsApi.getNew(12),
    staleTime: 5 * 60 * 1000,
  });

  if (!isLoading && recent.length === 0) return null;

  return (
    <section className="pt-4 pb-8 md:pt-8 md:pb-10 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="container mx-auto px-4 max-w-7xl 2xl:max-w-[90rem]">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <span className="text-sm font-medium text-primary">🆕 Recent Models</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground">Latest <span className="text-primary">Arrivals</span></h2>
          </div>
          <Link to="/new-cars" className="hidden md:block">
            <Button variant="ghost" className="group">
              View All New Cars
              <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[220px] w-full rounded-2xl" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <Carousel opts={{ align: "start" }}>
              <CarouselContent>
                {recent.map((model: any) => (
                  <CarouselItem key={model.id} className="basis-4/5 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 pr-4">
                    <div className="h-full">
                      <ModelCard model={model} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-3 md:-left-6" />
              <CarouselNext className="-right-3 md:-right-6" />
            </Carousel>
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link to="/new-cars">
            <Button variant="outline" className="w-full">View All New Cars</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentModelsSlider;
