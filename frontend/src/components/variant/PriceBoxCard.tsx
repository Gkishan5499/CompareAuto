import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/layout/CitySelector";
import { VariantSelect } from "@/components/variant/VariantSelect";
import { useCity } from "@/contexts/CityContext";
import { MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/guards";

interface PriceBoxCardProps {
  brand: string;
  model: string;
  currentVariantSlug?: string;
  exShowroom?: number | null;
  onShowBreakup?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  showVariantSelect?: boolean;
}

export const PriceBoxCard = ({ 
  brand,
  model,
  currentVariantSlug,
  exShowroom, 
  onShowBreakup,
  disabled = false,
  disabledReason,
  showVariantSelect = true,
}: PriceBoxCardProps) => {
  const { city } = useCity();

  return (
    <Card className="w-full rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6" data-testid="pricebox">
      <div className="space-y-4">
        {/* Variant Selector */}
        {showVariantSelect && currentVariantSlug && (
          <VariantSelect
            brand={brand}
            model={model}
            currentVariantSlug={currentVariantSlug}
            className="w-full"
          />
        )}

        {/* Ex-Showroom Price */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Ex-Showroom Price</p>
          <p 
            className="text-3xl font-bold text-primary break-words"
            data-testid="exshowroom-amount"
          >
            {formatINR(exShowroom, true)}
          </p>
        </div>

        {/* City Selector + Button */}
        <div className="border-t pt-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Price in my city
          </p>
          
          <CitySelector compact className="w-full" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    onClick={onShowBreakup}
                    className="w-full"
                    disabled={disabled}
                    data-testid="pricebreakup-button"
                  >
                    Show On-Road Price
                  </Button>
                </div>
              </TooltipTrigger>
              {disabled && disabledReason && (
                <TooltipContent>
                  <p>{disabledReason}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          * Prices subject to change. Contact dealer for latest prices.
        </p>
      </div>
    </Card>
  );
};
