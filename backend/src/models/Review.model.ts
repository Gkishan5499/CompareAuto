import { Schema, model, Document } from "mongoose";

export interface IReview extends Document {
  id: string;
  type: "expert" | "owner";
  brandSlug: string;
  modelSlug: string;

  // Expert fields
  score?: number;
  summary?: string;
  highlights?: string[];
  fullReviewSlug?: string;
  reviewedAt?: string;

  // Owner review fields
  rating?: number;
  title?: string;
  review?: string;
  pros?: string[];
  cons?: string[];
  ownerName?: string;
  ownedSince?: string;
  kmsDriven?: number;
  variant?: string;
  city?: string;
  postedAt?: string;
}

const ReviewSchema = new Schema<IReview>(
  {
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ["expert", "owner"], required: true },

    brandSlug: { type: String, required: true },
    modelSlug: { type: String, required: true },

    // Expert fields
    score: { type: Number },
    summary: { type: String },
    highlights: { type: [String], default: [] },
    fullReviewSlug: { type: String },
    reviewedAt: { type: String },

    // Owner fields
    rating: { type: Number },
    title: { type: String },
    review: { type: String },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    ownerName: { type: String },
    ownedSince: { type: String },
    kmsDriven: { type: Number },
    variant: { type: String },
    city: { type: String },
    postedAt: { type: String }
  },
  { timestamps: true }
);

export default model<IReview>("Review", ReviewSchema);
