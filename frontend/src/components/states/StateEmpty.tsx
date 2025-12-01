import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchX } from "lucide-react";

interface StateEmptyProps {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const StateEmpty = ({
  title,
  description,
  ctaHref,
  ctaLabel,
  icon: Icon = SearchX,
}: StateEmptyProps) => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground max-w-md mb-6">{description}</p>
        {ctaHref && ctaLabel && (
          <Button asChild>
            <Link to={ctaHref}>{ctaLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
