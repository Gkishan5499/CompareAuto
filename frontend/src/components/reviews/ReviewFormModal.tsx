import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand: string;
  model: string;
}

export const ReviewFormModal = ({
  open,
  onOpenChange,
  brand,
  model,
}: ReviewFormModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    review: "",
    variant: "",
    kmsDriven: "",
    pros: "",
    cons: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Thank you! Your review has been submitted for moderation.");
    
    setFormData({ title: "", review: "", variant: "", kmsDriven: "", pros: "", cons: "" });
    setRating(0);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review for {brand} {model}</DialogTitle>
          <DialogDescription>
            Share your ownership experience to help other buyers make informed decisions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Review Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your experience in one line"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="variant">Variant Owned</Label>
            <Input
              id="variant"
              value={formData.variant}
              onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
              placeholder="e.g., VX CVT"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kms">Kilometers Driven</Label>
            <Input
              id="kms"
              type="number"
              value={formData.kmsDriven}
              onChange={(e) => setFormData({ ...formData, kmsDriven: e.target.value })}
              placeholder="e.g., 15000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Your Review *</Label>
            <Textarea
              id="review"
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="Share your detailed experience with this car..."
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pros">What did you like? (comma-separated)</Label>
            <Input
              id="pros"
              value={formData.pros}
              onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
              placeholder="e.g., Fuel efficiency, Comfort, Features"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cons">What could be better? (comma-separated)</Label>
            <Input
              id="cons"
              value={formData.cons}
              onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
              placeholder="e.g., Rear space, Boot capacity"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
