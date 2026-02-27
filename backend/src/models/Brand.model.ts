import { Schema, model, Document } from "mongoose";

export interface IBrand extends Document {
  id: string;
  name: string;
  logo: string;
  country: string;
  modelCount: number;
  slug: string;
  heroIntro?: string;
  popularModelsIntro?: string;
  latestUpcomingIntro?: string;
  brandOverview?: string;
  brandPositioning?: string;
  warrantyServiceNetwork?: string;
  brandProsCons?: string;
  brandHistory?: string;
  brandFaqs?: string;
}

const BrandSchema = new Schema<IBrand>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    country: { type: String, required: true },
    modelCount: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true },
    heroIntro: { type: String, default: "" },
    popularModelsIntro: { type: String, default: "" },
    latestUpcomingIntro: { type: String, default: "" },
    brandOverview: { type: String, default: "" },
    brandPositioning: { type: String, default: "" },
    warrantyServiceNetwork: { type: String, default: "" },
    brandProsCons: { type: String, default: "" },
    brandHistory: { type: String, default: "" },
    brandFaqs: { type: String, default: "" }
  },
  { timestamps: true }
);

export default model<IBrand>("Brand", BrandSchema);
