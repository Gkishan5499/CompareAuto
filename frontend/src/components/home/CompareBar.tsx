import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getBrands, getModels, getVariants } from "@/lib/data";
import { useBrands, useModels, useVariants } from "@/lib/api-hooks";
import { dataCache } from "@/lib/data-cache";

const CompareBar = () => {
  const [compareList, setCompareList] = useState<string[]>([]);
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: apiBrands } = useBrands();
  const brands = apiBrands || getBrands();

  const { data: apiModels } = useModels();
  const models = apiModels || getModels();

  const { data: apiVariants } = useVariants("");
  const variants = apiVariants || dataCache.getVariants();

  useEffect(() => {
    // Load initial list
    loadCompareList();

    // Listen for updates
    const handleUpdate = () => loadCompareList();
    window.addEventListener("compareListUpdated", handleUpdate);

    return () => window.removeEventListener("compareListUpdated", handleUpdate);
  }, []);

  const loadCompareList = () => {
    const rawList = JSON.parse(localStorage.getItem("compareList") || "[]");
    const normalized = Array.isArray(rawList)
      ? rawList
          .map((item) => {
            if (!item) return null;
            if (typeof item === "string") return item;
            if (typeof item === "object") {
              return item.id || item.variantId || item.modelId || item.slug || null;
            }
            return null;
          })
          .filter((value): value is string => Boolean(value))
      : [];
    setCompareList(normalized);
  };

  const removeItem = (variantId: string) => {
    const updatedList = compareList.filter((item) => item !== variantId);
    localStorage.setItem("compareList", JSON.stringify(updatedList));
    setCompareList(updatedList);
    setLastRemoved(variantId);
    window.dispatchEvent(new Event("compareListUpdated"));
  };

  const handleAddBack = () => {
    if (!lastRemoved || compareList.includes(lastRemoved) || compareList.length >= 3) return;
    const updatedList = [...compareList, lastRemoved];
    localStorage.setItem("compareList", JSON.stringify(updatedList));
    setCompareList(updatedList);
    setLastRemoved(null);
    window.dispatchEvent(new Event("compareListUpdated"));
  };

  const handleCompare = () => {
    const variantIds = compareList.join(",");
    navigate(`/compare?v=${variantIds}`);
  };

  const displayItems = useMemo(() => {
    return compareList.map((variantId) => {
      const variant = variants.find(
        (item: any) => item.id === variantId || item.slug === variantId || item._id === variantId
      );
      const model = variant
        ? models.find(
            (item) => item.id === variant.modelId || item.slug === variant.modelId || item._id === variant.modelId
          )
        : undefined;
      const brand = model
        ? brands.find((item) => item.id === model.brandId || item.slug === model.brandId)
        : undefined;

      return {
        id: variantId,
        brandName: brand?.name || "",
        modelName: model?.name || "",
        variantName: variant?.name || "",
      };
    });
  }, [compareList, variants, models, brands]);

  const lastRemovedDisplay = useMemo(() => {
    if (!lastRemoved) return "";
    const variant = variants.find(
      (item: any) => item.id === lastRemoved || item.slug === lastRemoved || item._id === lastRemoved
    );
    const model = variant
      ? models.find(
          (item) => item.id === variant.modelId || item.slug === variant.modelId || item._id === variant.modelId
        )
      : undefined;
    const brand = model
      ? brands.find((item) => item.id === model.brandId || item.slug === model.brandId)
      : undefined;

    const label = [brand?.name, model?.name, variant?.name].filter(Boolean).join(" ");
    return label || "Add back";
  }, [lastRemoved, variants, models, brands]);

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in-right">
      <Card className="container mx-auto bg-card/95 backdrop-blur-sm shadow-2xl border-2">
        <div className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap flex-1">
              <div className="font-semibold">
                Compare Cars ({compareList.length}/3)
              </div>
              <div className="flex gap-2 flex-wrap">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm"
                  >
                    <span className="font-medium">
                      {item.brandName} {item.modelName}{item.variantName ? ` ${item.variantName}` : ""}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {lastRemoved && compareList.length < 3 && (
                  <button
                    onClick={handleAddBack}
                    className="flex items-center gap-2 bg-muted/60 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">{lastRemovedDisplay}</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("compareList");
                  setCompareList([]);
                  setLastRemoved(null);
                  window.dispatchEvent(new Event("compareListUpdated"));
                }}
              >
                Clear All
              </Button>
              {compareList.length === 1 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.setItem("compareAutoShow", "1");
                    navigate("/compare");
                  }}
                >
                  New Comparison
                </Button>
              )}
              <Button onClick={handleCompare} disabled={compareList.length < 2}>
                Compare Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CompareBar;
