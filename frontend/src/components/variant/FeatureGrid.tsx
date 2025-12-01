import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  name: string;
  available: boolean;
}

interface FeatureCategory {
  title: string;
  features: Feature[];
}

interface FeatureGridProps {
  categories: FeatureCategory[];
}

const FeatureGrid = ({ categories }: FeatureGridProps) => {
  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category.title} className="overflow-hidden">
          <div className="bg-primary/5 px-6 py-3 border-b">
            <h3 className="font-semibold">{category.title}</h3>
          </div>
          <div className="p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.features.map((feature) => (
                <div
                  key={feature.name}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    feature.available
                      ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900"
                      : "bg-muted/50"
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center",
                      feature.available
                        ? "bg-green-600 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {feature.available ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      !feature.available && "text-muted-foreground"
                    )}
                  >
                    {feature.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FeatureGrid;
