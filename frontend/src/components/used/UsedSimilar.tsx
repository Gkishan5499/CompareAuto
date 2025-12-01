import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

interface UsedCar {
  id: string;
  title: string;
  price: number;
  kms: number;
  year: number;
  city: string;
  images: string[];
  verified: boolean;
  listingUrl: string;
}

interface UsedSimilarProps {
  cars: UsedCar[];
}

export const UsedSimilar = ({ cars }: UsedSimilarProps) => {
  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price.toLocaleString("en-IN")}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Similar Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cars.map((car) => (
          <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={car.listingUrl}>
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img
                  src={car.images[0]}
                  alt={car.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {car.verified && (
                  <Badge className="absolute top-2 right-2 bg-primary text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </Link>
            <CardContent className="p-3">
              <Link to={car.listingUrl} className="block hover:text-primary transition-colors">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{car.title}</h3>
              </Link>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{car.kms.toLocaleString()} km</span>
                <span>•</span>
                <span>{car.year}</span>
                <span>•</span>
                <span>{car.city}</span>
              </div>
              <p className="text-lg font-bold text-primary">{formatPrice(car.price)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
