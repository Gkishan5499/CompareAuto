import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { memo } from "react";
import { ArrowRight, MapPin } from "lucide-react";

interface BrandCardProps {
  brand: {
    id: string;
    name: string;
    logo: string;
    slug: string;
    modelCount?: number;
    country: string;
  };
}

const BrandCard = memo(({ brand }: BrandCardProps) => {
  if (!brand || !brand.slug) return null;

  const count = brand.modelCount || 0;

  return (
    <Link to={`/${brand.slug}`} target="_blank" rel="noopener noreferrer" className="block h-full">
      <Card className="group relative h-full overflow-hidden border-muted/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        
        {/* Hover Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative p-5 flex flex-col h-full items-center text-center">
          
          {/* Top Right Arrow (Initially hidden/subtle) */}
          <div className="absolute top-3 right-3 text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Logo Section */}
          <div className="mb-4 h-20 w-24 flex items-center justify-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 transition-transform duration-300 group-hover:scale-105">
            <img
              src={brand.logo}
              alt={`${brand.name} logo`}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          </div>

          {/* Brand Name */}
          <h3 className="mb-1 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            {brand.name}
          </h3>

          {/* Country */}
          <div className="mb-4 flex items-center gap-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">
            <MapPin className="h-3 w-3" />
            {brand.country}
          </div>

          {/* Spacer to push footer down if content varies */}
          <div className="flex-grow" />

          {/* Footer / Count Badge */}
          <div className="w-full pt-4 border-t border-dashed border-border/60">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Available Models</span>
                <Badge variant="secondary" className=" bg-gray-300 font-mono text-xs group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {count}
                </Badge>
            </div>
          </div>
          
        </div>
      </Card>
    </Link>
  );
});

BrandCard.displayName = "BrandCard";

export default BrandCard;