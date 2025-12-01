import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Globe, Star, CheckCircle2 } from "lucide-react";
import { Dealer } from "@/lib/dealers";

interface DealerCardProps {
  dealer: Dealer;
}

const DealerCard = ({ dealer }: DealerCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <Link to={`/dealers/${dealer.id}`}>
              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                {dealer.name}
                {dealer.verified && (
                  <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-green-600" />
                )}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-2 mt-2">
              {dealer.brands.map((brand) => (
                <Badge key={brand} variant="secondary">
                  {brand}
                </Badge>
              ))}
            </div>
          </div>
          {dealer.rating && (
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
              <Star className="h-4 w-4 text-primary fill-primary" />
              <span className="font-semibold text-sm">{dealer.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {dealer.categories.map((cat) => (
            <Badge key={cat} variant="outline">
              {cat}
            </Badge>
          ))}
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <div>{dealer.address.line1}</div>
            {dealer.address.line2 && <div>{dealer.address.line2}</div>}
            <div>
              {dealer.address.city}, {dealer.address.state} - {dealer.address.pincode}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          {dealer.phones[0] && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${dealer.phones[0]}`} className="hover:text-primary transition-colors">
                {dealer.phones[0]}
              </a>
            </div>
          )}
          {dealer.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${dealer.email}`} className="hover:text-primary transition-colors truncate">
                {dealer.email}
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button asChild className="flex-1" size="sm">
            <Link to={`/dealers/${dealer.id}`}>View Details</Link>
          </Button>
          {dealer.website && (
            <Button asChild variant="outline" size="sm">
              <a href={dealer.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealerCard;
