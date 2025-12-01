import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CompareItem {
  modelId: string;
  brandName: string;
  modelName: string;
  slug: string;
  brandSlug: string;
}

const CompareBar = () => {
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load initial list
    loadCompareList();

    // Listen for updates
    const handleUpdate = () => loadCompareList();
    window.addEventListener("compareListUpdated", handleUpdate);

    return () => window.removeEventListener("compareListUpdated", handleUpdate);
  }, []);

  const loadCompareList = () => {
    const list = JSON.parse(localStorage.getItem("compareList") || "[]");
    setCompareList(list);
  };

  const removeItem = (modelId: string) => {
    const updatedList = compareList.filter((item) => item.modelId !== modelId);
    localStorage.setItem("compareList", JSON.stringify(updatedList));
    setCompareList(updatedList);
  };

  const handleCompare = () => {
    const modelIds = compareList.map((item) => item.modelId).join(",");
    navigate(`/compare?models=${modelIds}`);
  };

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
                {compareList.map((item) => (
                  <div
                    key={item.modelId}
                    className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm"
                  >
                    <span className="font-medium">
                      {item.brandName} {item.modelName}
                    </span>
                    <button
                      onClick={() => removeItem(item.modelId)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("compareList");
                  setCompareList([]);
                }}
              >
                Clear All
              </Button>
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
