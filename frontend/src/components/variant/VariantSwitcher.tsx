import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Variant } from "@/lib/data";
import { ChevronRight } from "lucide-react";
import { formatINR, parseINRToRupees } from "@/lib/guards";
import { useEffect, useState } from "react";
import { useCity } from "@/contexts/CityContext";

interface VariantSwitcherProps {
  variants: Variant[];
  currentVariantId: string;
  brandSlug: string;
  modelSlug: string;
}

const VariantSwitcher = ({
  variants,
  currentVariantId,
  brandSlug,
  modelSlug,
}: VariantSwitcherProps) => {
  const { city } = useCity();
  const [onRoadPrices, setOnRoadPrices] = useState<Record<string, number>>({});

  // Fetch on-road prices for all variants
  useEffect(() => {
    const fetchPrices = async () => {
      const prices: Record<string, number> = {};
      
      await Promise.all(
        variants.map(async (variant) => {
          try {
            const response = await fetch(
              `/api/pricing/variant/${variant.id}/price?city=${encodeURIComponent(city)}`
            );
            if (response.ok) {
              const data = await response.json();
              prices[variant.id] = data.breakdown?.onRoadPrice || 0;
            }
          } catch (error) {
            console.error(`Failed to fetch price for variant ${variant.id}:`, error);
          }
        })
      );
      
      setOnRoadPrices(prices);
    };

    if (variants.length > 0 && city) {
      fetchPrices();
    }
  }, [variants, city]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold">Other Variants</h3>
        <Badge variant="secondary">{variants.length} options</Badge>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {variants.map((variant) => {
          const isCurrent = variant.id === currentVariantId;
          return (
            <Link
              key={variant.id}
              to={`/${brandSlug}/${modelSlug}/${variant.slug}`}
              className="snap-start"
            >
              <Card
                className={cn(
                  "min-w-[280px] p-4 hover:shadow-lg transition-all relative",
                  isCurrent && "ring-2 ring-primary bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-semibold mb-1 line-clamp-1">
                      {variant.name}
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {variant.fuelType} · {variant.transmission}
                    </p>
                  </div>
                  {isCurrent && (
                    <Badge variant="default" className="ml-2">Current</Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Ex-Showroom</span>
                    <p className="text-sm font-semibold">
                      {(() => {
                        const p = parseINRToRupees(variant.price);
                        return p && p > 0 ? formatINR(p, true) : "—";
                      })()}
                    </p>
                  </div>
                  {onRoadPrices[variant.id] && (
                    <div className="flex items-center justify-between pt-1 border-t">
                      <span className="text-xs text-muted-foreground">On-Road ({city})</span>
                      <p className="text-lg font-bold text-primary">
                        {formatINR(onRoadPrices[variant.id], true)}
                      </p>
                    </div>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground absolute top-4 right-4" />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default VariantSwitcher;
