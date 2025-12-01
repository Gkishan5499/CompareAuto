import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CitySelector } from "@/components/layout/CitySelector";
import { useCity } from "@/contexts/CityContext";
import { MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PriceBoxProps {
  exShowroom?: number | null;
  city?: string;
  onShowBreakup?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

const PriceBox = ({ 
  exShowroom, 
  city, 
  onShowBreakup,
  disabled = false,
  disabledReason
}: PriceBoxProps) => {
  const { city: contextCity } = useCity();
  const selectedCity = city || contextCity;

  return (
    <Card className="p-6 sticky top-24" data-testid="pricebox">
      <div className="space-y-4">
        {/* Ex-Showroom Price */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Ex-Showroom Price</p>
          <p className="text-3xl font-bold text-primary">
            {exShowroom ? `₹${(exShowroom / 100000).toFixed(2)} Lakh` : "N/A"}
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

export default PriceBox;
