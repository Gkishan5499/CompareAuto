import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Box, Truck, Home as Suv, Boxes, Sparkles, TruckIcon, Bus } from "lucide-react";
import { getBodyTypes, countModelsByBody } from "@/lib/data";
import { updateMetaTags } from "@/lib/seo";

const Body = () => {
  const bodyTypes = getBodyTypes();
  const counts = countModelsByBody();

  useEffect(() => {
    updateMetaTags({
      title: "Browse Cars by Body Type – Hatchback, Sedan, SUV & More | CompareAuto.in",
      description: "Explore cars by body type in India. Find hatchbacks, sedans, SUVs, MUVs, and more with prices, specs, and variant comparisons.",
      keywords: ["body type", "hatchback", "sedan", "SUV", "MUV", "coupe", "car categories"],
      canonical: "https://compareauto.in/body",
    });
  }, []);

  // Map body types to icons and slugs
  const bodyTypeConfig: Record<string, { icon: any; slug: string; description: string }> = {
    Hatchback: { icon: Car, slug: "hatchback", description: "Compact and fuel-efficient city cars perfect for urban driving" },
    Sedan: { icon: Car, slug: "sedan", description: "Classic 4-door sedans with spacious interiors and boot space" },
    SUV: { icon: Suv, slug: "suv", description: "Sport utility vehicles with high ground clearance and powerful performance" },
    MUV: { icon: Bus, slug: "muv", description: "Multi utility vehicles with 7-8 seater capacity for families" },
    MPV: { icon: Bus, slug: "mpv", description: "Multi purpose vehicles designed for passenger comfort" },
    Coupe: { icon: Sparkles, slug: "coupe", description: "Sporty 2-door cars with sleek designs and performance focus" },
    Convertible: { icon: Sparkles, slug: "convertible", description: "Open-top cars for the ultimate driving experience" },
    Pickup: { icon: TruckIcon, slug: "pickup", description: "Pickup trucks with cargo capacity and rugged capability" },
    Wagon: { icon: Boxes, slug: "wagon", description: "Estate wagons combining practicality with style" },
  };

  // Filter to show only body types with models
  const availableBodyTypes = bodyTypes.filter((type) => counts[type] > 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="mb-4">Browse by Body Type</h1>
            <p className="text-lg text-muted-foreground">
              Find your perfect car by selecting the body style that fits your lifestyle. 
              From compact hatchbacks to spacious SUVs, explore all categories.
            </p>
          </div>
        </div>
      </section>

      {/* Body Type Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {availableBodyTypes.map((bodyType) => {
              const config = bodyTypeConfig[bodyType];
              if (!config) return null;

              const Icon = config.icon;
              const count = counts[bodyType] || 0;

              return (
                <Link key={bodyType} to={`/body/${config.slug}`}>
                  <Card className="group hover:shadow-xl transition-all hover:border-primary/50 h-full">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20   group-hover:scale-110 transition-transform">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                            {bodyType}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {config.description}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {count} {count === 1 ? "model" : "models"} available →
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {availableBodyTypes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No body types available at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Body;
