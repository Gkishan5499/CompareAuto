import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { getBodyTypes } from "@/lib/data";

const ExploreBodyTypes = () => {
  const existingBodyTypes = getBodyTypes();
  
  // All body types to display
  const allBodyTypes = [
    { name: "Hatchback", slug: "hatchback" },
    { name: "Sedan", slug: "sedan" },
    { name: "SUV", slug: "suv" },
    { name: "MUV", slug: "muv" },
    { name: "Coupe", slug: "coupe" },
    { name: "Convertible", slug: "convertible" },
    { name: "Pickup", slug: "pickup" },
    { name: "Luxury", slug: "luxury" },
    { name: "Electric", slug: "electric" },
    { name: "Crossover", slug: "crossover" }
  ];

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-muted/20 border-t">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8 md:mb-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">
            Explore by <span className="text-primary">Body Type</span>
          </h3>
          <p className="text-sm md:text-base text-muted-foreground">
            Browse cars by their body style and design
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {allBodyTypes.map((type) => {
            const exists = existingBodyTypes.some(
              bt => bt.toLowerCase().replace(/\s+/g, '-') === type.slug
            );
            
            return exists ? (
              <Link key={type.slug} to={`/body/${type.slug}`}>
                <Badge 
                  variant="outline" 
                  className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 border-2 font-semibold shadow-sm hover:shadow-md"
                >
                  {type.name}
                </Badge>
              </Link>
            ) : (
              <Badge 
                key={type.slug}
                variant="outline" 
                className="px-4 md:px-6 py-2 md:py-2.5 text-sm md:text-base opacity-50 cursor-not-allowed border-2"
              >
                {type.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExploreBodyTypes;
