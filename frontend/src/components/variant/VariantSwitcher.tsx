import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Variant } from "@/lib/data";
import { ChevronRight } from "lucide-react";
import { formatINR, parseINRToRupees } from "@/lib/guards";

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
                  "min-w-[280px] p-4 hover:shadow-lg transition-all",
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
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-primary">
                    {(() => {
                      const p = parseINRToRupees(variant.price);
                      return p && p > 0 ? formatINR(p, true) : "—";
                    })()}
                  </p>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default VariantSwitcher;
