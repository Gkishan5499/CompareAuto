import { Link } from "react-router-dom";
import { useBrands } from "@/lib/api-hooks";
import { useMemo } from "react";
import { popularApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ShieldCheck, LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const BrandsStrip = () => {
  const { data: allBrands = [], isLoading } = useBrands();
  
  const { data: popularBrands = [] } = useQuery({
    queryKey: ["popular", "brands"],
    queryFn: () => popularApi.getPopularBrands(18), // Increased count for better grid fill
    staleTime: 10 * 60 * 1000,
  });
  
  const displayBrands = useMemo(() => {
    if (popularBrands.length > 0) {
      return popularBrands;
    }
    // Fallback sorting logic
    const preferredOrder = [
      "Maruti Suzuki", "Hyundai", "Tata Motors", "Mahindra", 
      "Kia", "Toyota", "Honda", "Volkswagen", "Skoda", "MG"
    ];
    
    return [...allBrands].sort((a: any, b: any) => {
      const indexA = preferredOrder.indexOf(a.name);
      const indexB = preferredOrder.indexOf(b.name);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.name.localeCompare(b.name);
    }).slice(0, 18);
  }, [popularBrands, allBrands]);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-3 uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4 fill-current" /> Trusted Manufacturers
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
              Explore by <span className="text-primary">Brand</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Browse the complete lineup from India's most popular and trusted automotive manufacturers.
            </p>
          </div>

          <Link to="/brands">
            <Button variant="ghost" className="group hidden md:flex text-base">
              View All Brands
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-3">
                 <Skeleton className="h-32 w-full rounded-2xl" />
                 <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {displayBrands.map((brand: any) => (
              <Link
                key={brand.id}
                to={`/${brand.slug}`}
                className="group block"
              >
                <Card className="h-full border-muted/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-card overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center justify-center gap-4 h-full min-h-[160px]">
                    <div className="w-20 h-20 relative flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-300">
                      {brand.logo ? (
                        <img 
                          src={brand.logo} 
                          alt={`${brand.name} logo`}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      
                      {/* Fallback Initial */}
                      <div className={`w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-400 ${brand.logo ? 'hidden' : ''}`}>
                        {brand.name.charAt(0)}
                      </div>
                    </div>
                    
                    <span className="font-semibold text-sm text-center group-hover:text-primary transition-colors">
                      {brand.name}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
            
            {/* "View All" Card for Grid */}
            <Link to="/brands" className="group block sm:hidden lg:block">
               <Card className="h-full border-dashed border-2 hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 cursor-pointer flex items-center justify-center min-h-[160px]">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                      <div className="w-12 h-12 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center">
                          <LayoutGrid className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-sm">View All Brands</span>
                  </div>
               </Card>
            </Link>
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="mt-10 text-center md:hidden">
           <Link to="/brands">
            <Button variant="outline" className="w-full h-12 text-base">
              Show All Brands
            </Button>
           </Link>
        </div>

      </div>
    </section>
  );
};

export default BrandsStrip;