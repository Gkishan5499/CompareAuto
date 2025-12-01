import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, User, Gauge } from "lucide-react";

interface UsedCarCardProps {
  id: string;
  title: string;
  year: number;
  brand: string;
  model: string;
  variant: string;
  kms: number;
  owners: number;
  city: string;
  price: number;
  images: string[];
  verified: boolean;
  listingUrl: string;
  fuel: string;
  transmission: string;
}

export const UsedCarCard = ({
  title,
  kms,
  owners,
  city,
  price,
  images,
  verified,
  listingUrl,
  fuel,
  transmission,
}: UsedCarCardProps) => {
  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={listingUrl}>
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={images[0]}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {verified && (
            <Badge className="absolute top-2 right-2 bg-primary">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={listingUrl} className="block hover:text-primary transition-colors">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
        </Link>
        
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Gauge className="w-4 h-4" />
            <span>{kms.toLocaleString()} km</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{owners} Owner{owners > 1 ? "s" : ""}</span>
          </div>
          <span>•</span>
          <span>{fuel}</span>
          <span>•</span>
          <span>{transmission}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">{formatPrice(price)}</p>
            <Badge variant="outline" className="mt-1 text-xs">
              {city}
            </Badge>
          </div>
          <Link to={listingUrl}>
            <Button size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
