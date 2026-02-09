import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Model } from "@/lib/data";
import { toast } from "sonner";
import { memo, useState, useEffect } from "react";
import { getBrandLogo, getBrandInitial } from "@/lib/brandLogos";
import { useCity } from "@/contexts/CityContext";
import { getStateFromCity } from "@/lib/priceCalculations";
import { variantsApi } from "@/lib/api";
import { parseINRToRupees } from "@/lib/guards";

interface ModelCardProps {
  model: Model;
}

const ModelCard = memo(({ model }: ModelCardProps) => {
  const brandSlug = model.brandName.toLowerCase().replace(/\s+/g, "-");
  const brandLogo = getBrandLogo(model.brandName);
  const brandInitial = getBrandInitial(model.brandName);
  const { city } = useCity();
  const [onRoadPriceRange, setOnRoadPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [variantPriceRange, setVariantPriceRange] = useState<{ min: number; max: number } | null>(null);

  // Fetch variant prices from backend
  useEffect(() => {
    const fetchVariantPrices = async () => {
      try {
        const variants = await variantsApi.getByModel(model.id);
        
        if (variants && variants.length > 0) {
          const prices = variants
            .map((v: any) => parseINRToRupees(v?.price))
            .filter((p) => p && p > 0) as number[];
          
          if (prices.length > 0) {
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            setVariantPriceRange({ min, max });
          } else {
            setVariantPriceRange(null);
          }
        } else {
          setVariantPriceRange(null);
        }
      } catch (error) {
        // Fallback to model price range
        if (model.priceRange) {
          setVariantPriceRange(model.priceRange);
        }
      }
    };

    fetchVariantPrices();
  }, [model]);

  // Calculate on-road price range based on actual variant prices
  useEffect(() => {
    const calculateOnRoadRange = async () => {
      if (model.status === "upcoming") {
        setOnRoadPriceRange(null);
        return;
      }

      const minExShowroom = variantPriceRange?.min || model.priceRange?.min || 0;
      const maxExShowroom = variantPriceRange?.max || model.priceRange?.max || 0;

      if (minExShowroom === 0) {
        setOnRoadPriceRange(null);
        return;
      }

      try {
        const state = getStateFromCity(city);

        // Calculate min on-road price
        const minResp = await fetch(`/api/pricing/calc`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exShowroomPrice: minExShowroom, state }),
        });

        let minOnRoad = minExShowroom;
        if (minResp.ok) {
          const minData = await minResp.json();
          minOnRoad = minData.breakdown.onRoadPrice;
        }

        // Calculate max on-road price if different from min
        let maxOnRoad = minOnRoad;
        if (maxExShowroom > 0 && maxExShowroom !== minExShowroom) {
          const maxResp = await fetch(`/api/pricing/calc`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ exShowroomPrice: maxExShowroom, state }),
          });

          if (maxResp.ok) {
            const maxData = await maxResp.json();
            maxOnRoad = maxData.breakdown.onRoadPrice;
          }
        }

        setOnRoadPriceRange({ min: minOnRoad, max: maxOnRoad });
      } catch (error) {
        // Fallback: use ex-showroom prices
        setOnRoadPriceRange(null);
      }
    };

    calculateOnRoadRange();
  }, [model, city, variantPriceRange]);

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Get existing compare list
    const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");

    // Check if already in list
    if (compareList.some((item: any) => item.modelId === model.id)) {
      toast.info("This car is already in your comparison list");
      return;
    }

    // Limit to 3 items
    if (compareList.length >= 3) {
      toast.error("You can only compare up to 3 cars at a time");
      return;
    }

    // Add to compare list
    compareList.push({
      modelId: model.id,
      brandName: model.brandName,
      modelName: model.name,
      slug: model.slug,
      brandSlug: brandSlug,
    });

    localStorage.setItem("compareList", JSON.stringify(compareList));
    
    // Dispatch custom event to update CompareBar
    window.dispatchEvent(new Event("compareListUpdated"));
    
    toast.success(`${model.name} added to compare`);
  };

  return (
    <Link to={`/${brandSlug}/${model.slug}`}>
      <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden relative">
          {model.image ? (
            <img 
              src={model.image} 
              alt={`${model.brandName} ${model.name}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                // Fallback to logo if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className={`w-full h-full flex items-center justify-center ${model.image ? 'hidden' : ''}`}
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 shadow-lg flex items-center justify-center p-4 group-hover:scale-110 transition-transform duration-300">
              {brandLogo ? (
                <img 
                  src={brandLogo} 
                  alt={`${model.brandName} logo`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-3xl md:text-4xl font-bold text-muted-foreground">
                  {brandInitial}
                </span>
              )}
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="shadow-sm backdrop-blur-sm bg-gray-700">
              {model.bodyType}
            </Badge>
          </div>
        </div>

        <div className="p-4 md:p-5 flex-1 flex flex-col">
          <div className="text-xs text-muted-foreground mb-1 font-medium">{model.brandName}</div>
          <h5 className="font-semibold text-base md:text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {model.name}
          </h5>

          <div className="flex items-center gap-2 mb-4 text-xs flex-wrap">
            {model.fuelTypes && model.fuelTypes.length > 0 ? (
              model.fuelTypes.slice(0, 2).map((fuel, idx) => (
                <Badge key={idx} variant="outline" className="font-normal text-[10px] px-2 py-0.5">
                  {fuel}
                </Badge>
              ))
            ) : (
              <Badge variant="outline" className="font-normal text-[10px] px-2 py-0.5">
                {model.bodyType}
              </Badge>
            )}
          </div>

          <div className="mt-auto space-y-3 pt-2 border-t">
            <div className="flex flex-col gap-1">
              {model.status === "upcoming" ? (
                <>
                  <span className="text-xl md:text-2xl font-bold text-primary">
                    Rs. {((model.expectedPriceMin || 0) / 100000).toFixed(2)} Lakh
                  </span>
                  <span className="text-xs md:text-sm text-muted-foreground font-medium">
                    Expected
                  </span>
                </>
              ) : onRoadPriceRange ? (
                <>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-xl md:text-2xl font-bold text-primary">
                      {onRoadPriceRange.min === onRoadPriceRange.max
                        ? `Rs. ${(onRoadPriceRange.min / 100000).toFixed(2)} Lakh`
                        : `Rs. ${(onRoadPriceRange.min / 100000).toFixed(2)} - ${(onRoadPriceRange.max / 100000).toFixed(2)} Lakh`
                      }
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    On-Road Price in {city}
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 flex-wrap">
                    <span className="text-xl md:text-2xl font-bold text-primary">
                      Rs. {((model.priceRange?.min || 0) / 100000).toFixed(2)} Lakh
                    </span>
                    <span className="text-xs md:text-sm text-muted-foreground font-medium">
                      Onwards
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Ex-Showroom Price
                  </span>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 text-xs md:text-sm" size="sm">
                {model.status === "upcoming" ? "Notify Me" : "View Details"}
              </Button>
              {model.status !== "upcoming" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="px-2 md:px-3"
                  onClick={handleAddToCompare}
                  title="Add to Compare"
                >
                  <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
});

ModelCard.displayName = "ModelCard";

export default ModelCard;
