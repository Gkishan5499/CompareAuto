import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, Edit } from "lucide-react";
import { ReviewFormModal } from "./ReviewFormModal";

interface OwnerReview {
  id: string;
  rating: number;
  title: string;
  review: string;
  pros: string[];
  cons: string[];
  ownerName: string;
  variant: string;
  city: string;
  kmsDriven: number;
  postedAt: string;
}

interface OwnerReviewsProps {
  reviews: OwnerReview[];
  brand: string;
  model: string;
}

export const OwnerReviews = ({ reviews, brand, model }: OwnerReviewsProps) => {
  const [showReviewModal, setShowReviewModal] = useState(false);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl mb-2">Owner Reviews</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(parseFloat(avgRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{avgRating} out of 5</span>
                <span className="text-muted-foreground">({reviews.length} reviews)</span>
              </div>
            </div>
            <Button onClick={() => setShowReviewModal(true)} className="gap-2">
              <Edit className="w-4 h-4" />
              Write a Review
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.slice(0, 3).map((review) => (
            <Card key={review.id} className="bg-muted/30">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{review.rating}.0</span>
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{review.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      by {review.ownerName} • {review.variant} • {review.city} •{" "}
                      {review.kmsDriven.toLocaleString()} km
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(review.postedAt).toLocaleDateString("en-IN", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-sm leading-relaxed">{review.review}</p>

                <div className="flex flex-wrap gap-2">
                  {review.pros.slice(0, 3).map((pro, idx) => (
                    <Badge key={idx} variant="outline" className="gap-1 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                      <ThumbsUp className="w-3 h-3" />
                      {pro}
                    </Badge>
                  ))}
                  {review.cons.slice(0, 2).map((con, idx) => (
                    <Badge key={idx} variant="outline" className="gap-1 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                      <ThumbsDown className="w-3 h-3" />
                      {con}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {reviews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No owner reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewFormModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        brand={brand}
        model={model}
      />
    </>
  );
};
