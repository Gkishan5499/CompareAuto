import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFuelTypes, countModelsByFuel } from "@/lib/data";
import { updateMetaTags, injectStructuredData, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { Battery, Leaf, Wind, Fuel as FuelIcon, Zap } from "lucide-react";

const Fuel = () => {
  const fuelTypes = getFuelTypes();
  const counts = countModelsByFuel();

  const fuelIcons: Record<string, any> = {
    EV: Battery,
    Hybrid: Leaf,
    CNG: Wind,
    Petrol: FuelIcon,
    Diesel: Zap,
  };

  const fuelColors: Record<string, string> = {
    EV: "bg-primary/10 text-primary",
    Hybrid: "bg-primary/10 text-primary",
    CNG: "bg-primary/10 text-primary",
    Petrol: "bg-primary/10 text-primary",
    Diesel: "bg-primary/10 text-primary",
  };

  useEffect(() => {
    updateMetaTags({
      title: "Browse Cars by Fuel Type – EV, Hybrid, CNG, Petrol, Diesel | CompareAuto.in",
      description:
        "Explore cars by fuel type in India. Compare Electric, Hybrid, CNG, Petrol, and Diesel vehicles with prices, specs, and features.",
      keywords: ["fuel type", "electric cars", "hybrid cars", "CNG cars", "petrol cars", "diesel cars"],
      canonical: `${window.location.origin}/fuel`,
      ogImage: DEFAULT_OG_IMAGE,
    });

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Browse Cars by Fuel Type",
      description: "Explore cars categorized by fuel type in India",
      url: `${window.location.origin}/fuel`,
    };
    injectStructuredData(structuredData);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse by Fuel Type</h1>
            <p className="text-lg text-muted-foreground">
              Find the perfect car based on your preferred fuel type. Compare Electric, Hybrid, CNG, Petrol,
              and Diesel vehicles with detailed specifications and pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Fuel Type Cards */}
      <section className="py-12">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fuelTypes.map((fuel) => {
              const Icon = fuelIcons[fuel];
              return (
                <Link key={fuel} to={`/fuel/${fuel.toLowerCase()}`}>
                  <Card className="group hover:shadow-lg transition-all h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${fuelColors[fuel]}`}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <Badge variant="secondary">{counts[fuel] || 0} models</Badge>
                      </div>
                      <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {fuel} Cars
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4">
                        {fuel === "EV" && "Zero emission electric vehicles with instant torque and low running costs"}
                        {fuel === "Hybrid" && "Best of both worlds with electric and petrol powertrains"}
                        {fuel === "CNG" && "Eco-friendly and cost-effective compressed natural gas vehicles"}
                        {fuel === "Petrol" && "Smooth performance with widespread fuel availability"}
                        {fuel === "Diesel" && "High torque and excellent fuel economy for long drives"}
                      </p>
                      <div className="flex gap-2 text-xs">
                        <Link
                          to={`/fuel/${fuel.toLowerCase()}?filter=new`}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          New {fuel} cars
                        </Link>
                        <span className="text-muted-foreground">•</span>
                        <Link
                          to={`/fuel/${fuel.toLowerCase()}?filter=upcoming`}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Upcoming {fuel} cars
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Fuel;
