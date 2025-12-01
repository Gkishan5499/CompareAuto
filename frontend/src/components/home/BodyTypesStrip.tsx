import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Car, 
  Truck, 
  Home as Suv, 
  Boxes, 
  Sparkles, 
  Bus, 
  ArrowRight, 
  LayoutGrid 
} from "lucide-react";
import { getBodyTypes, countModelsByBody } from "@/lib/data";

const BodyTypesStrip = () => {
  const bodyTypes = getBodyTypes();
  const counts = countModelsByBody();

  // Configuration for each body type
  const bodyTypeConfig: Record<string, { icon: any; displayName: string; description: string }> = {
    "micro-suv": { icon: Car, displayName: "Micro SUV", description: "Compact & Agile" },
    "mini-suv": { icon: Suv, displayName: "Mini SUV", description: "Urban Crossover" },
    "suv": { icon: Suv, displayName: "SUV", description: "Sport Utility" },
    "hatchback": { icon: Car, displayName: "Hatchback", description: "City Commuter" },
    "sedan": { icon: Car, displayName: "Sedan", description: "Premium Comfort" },
    "muv": { icon: Bus, displayName: "MUV", description: "Multi Utility" },
    "mpv": { icon: Bus, displayName: "MPV", description: "Family Mover" },
    "coupe": { icon: Sparkles, displayName: "Coupe", description: "Sporty Style" },
    "convertible": { icon: Sparkles, displayName: "Convertible", description: "Open Top" },
    "pickup": { icon: Truck, displayName: "Pickup", description: "Lifestyle Truck" },
    "wagon": { icon: Boxes, displayName: "Wagon", description: "Practical Estate" },
  };

  // Filter to show only body types with active models
  const availableBodyTypes = bodyTypes.filter((type) => (counts[type] || 0) > 0);

  if (availableBodyTypes.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-medium text-sm mb-2 uppercase tracking-wider">
              <LayoutGrid className="w-4 h-4" /> Browse by Category
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Shop by Body Type
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl text-base">
              Filter cars by their design to find exactly what fits your lifestyle.
            </p>
          </div>
          
          <Link to="/brands?filter=body">
            <Button variant="ghost" className="group hidden md:flex">
              View All Categories 
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {availableBodyTypes.map((bodyType) => {
            const config = bodyTypeConfig[bodyType];
            if (!config) return null;

            const Icon = config.icon;
            const count = counts[bodyType] || 0;

            return (
              <Link key={bodyType} to={`/brands?bodyType=${bodyType}`} className="group h-full">
                <Card className="h-full border-muted/60 hover:border-primary/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-card">
                  <CardContent className="p-5 flex flex-col items-center text-center justify-between h-full gap-4">
                    
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Icon className="w-7 h-7 text-slate-500 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                        {config.displayName}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {count} {count === 1 ? "Model" : "Models"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 snap-x snap-mandatory no-scrollbar">
          {availableBodyTypes.map((bodyType) => {
            const config = bodyTypeConfig[bodyType];
            if (!config) return null;

            const Icon = config.icon;
            const count = counts[bodyType] || 0;

            return (
              <Link 
                key={bodyType} 
                to={`/brands?bodyType=${bodyType}`} 
                className="snap-start flex-shrink-0 w-[140px]"
              >
                <Card className="h-full border-muted/60 active:scale-95 transition-transform bg-card">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1">{config.displayName}</h3>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                        {count} Models
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 text-center md:hidden">
           <Link to="/brands">
            <Button variant="outline" className="w-full">
              View All Categories
            </Button>
           </Link>
        </div>

      </div>
    </section>
  );
};

export default BodyTypesStrip;