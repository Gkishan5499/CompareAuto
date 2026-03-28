import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useBrands } from "@/lib/api-hooks";
import { popularApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import VehicleCategoryToggle from "@/components/home/VehicleCategoryToggle";

const PREFERRED_BRANDS = ["Maruti Suzuki", "Hyundai", "Tata", "Honda", "Mahindra", "Toyota", "Kia", "MG"] as const;

const BRAND_ALIASES: Record<(typeof PREFERRED_BRANDS)[number], string[]> = {
  "Maruti Suzuki": ["maruti suzuki"],
  Hyundai: ["hyundai"],
  Tata: ["tata", "tata motors"],
  Honda: ["honda"],
  Mahindra: ["mahindra"],
  Toyota: ["toyota"],
  Kia: ["kia"],
  MG: ["mg", "morris garages"],
};

const normalizeBrand = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "").trim();

interface PopularBrandsRowProps {
  vehicleCategory?: "all" | "car" | "bike";
  onVehicleCategoryChange?: (value: "all" | "car" | "bike") => void;
}

const PopularBrandsRow = ({ vehicleCategory = "all", onVehicleCategoryChange }: PopularBrandsRowProps) => {
  const { data: allBrands = [] } = useBrands(vehicleCategory);
  const { data: popularBrands = [], isLoading } = useQuery({
    queryKey: ["popular", "brands", "row", vehicleCategory],
    queryFn: () => popularApi.getPopularBrands(8),
    staleTime: 10 * 60 * 1000,
  });

  const displayBrands = useMemo(() => {
    const preferred = PREFERRED_BRANDS.map((targetName) => {
      const aliases = BRAND_ALIASES[targetName].map(normalizeBrand);
      return allBrands.find((brand: any) => {
        const name = normalizeBrand(String(brand.name || ""));
        return aliases.some((alias) => name === alias || name.startsWith(alias));
      });
    }).filter(Boolean) as any[];

    if (preferred.length === 8) return preferred;

    const seen = new Set(preferred.map((brand: any) => brand.id || brand.slug || brand.name));
    const validIds = new Set(allBrands.map((brand: any) => brand.id || brand.slug));
    const fallback = [...popularBrands, ...allBrands].filter((brand: any) => {
      const key = brand.id || brand.slug || brand.name;
      if (vehicleCategory !== "all" && validIds.size > 0 && !validIds.has(brand.id || brand.slug)) {
        return false;
      }
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return [...preferred, ...fallback].slice(0, 8);
  }, [popularBrands, allBrands, vehicleCategory]);

  return (
    <section className="py-6 md:py-8 bg-background">
      <div className="container mx-auto px-4 max-w-7xl 2xl:max-w-[90rem]">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4 flex-1">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground whitespace-nowrap">
              Popular brands
            </h2>
            <div className="h-px flex-1 bg-sky-300/70" />
          </div>
          {onVehicleCategoryChange && (
            <VehicleCategoryToggle value={vehicleCategory} onChange={onVehicleCategoryChange} />
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-6">
            {displayBrands.map((brand: any) => (
              <Link
                key={brand.id || brand.slug}
                to={`/${brand.slug}`}
                className="group rounded-3xl border border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[176px]"
              >
                {brand.logo ? (
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-24 h-16 object-contain"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}

                <div className={`w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 ${brand.logo ? "hidden" : ""}`}>
                  {String(brand.name || "B").charAt(0)}
                </div>
                <span className="text-sm font-semibold text-slate-700 text-center line-clamp-1 group-hover:text-primary transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/brands">
            <Button variant="outline" className="group">
              View more brands
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularBrandsRow;
