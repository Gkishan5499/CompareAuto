import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle2, ArrowRight } from "lucide-react";

interface ExpertReviewProps {
  score: number;
  summary: string;
  highlights: string[];
  fullReviewSlug?: string;
  reviewedAt: string;
}

export const ExpertReview = ({
  score,
  summary,
  highlights,
  fullReviewSlug,
  reviewedAt,
}: ExpertReviewProps) => {
  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl mb-2">Expert Review</CardTitle>
            <p className="text-sm text-muted-foreground">
              Reviewed on {new Date(reviewedAt).toLocaleDateString("en-IN", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge className="text-lg px-4 py-2 gap-2">
            <Star className="w-5 h-5 fill-current" />
            {score}/10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base leading-relaxed">{summary}</p>

        <div className="space-y-3 pt-2">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Key Highlights
          </h4>
          <div className="grid gap-2">
            {highlights.slice(0, 6).map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {fullReviewSlug && (
          <Button asChild className="w-full sm:w-auto gap-2 mt-4">
            <Link to={`/news/${fullReviewSlug}`}>
              Read Full Expert Review
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
