import { Schema, model, Document } from "mongoose";

export interface IUpcomingCar extends Document {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  slug: string;
  image: string;
  bodyType: string;
  fuelTypes: string[];
  status: string;
  expectedPriceMin: number;
  expectedPriceMax: number;
  expectedLaunch: string;
  launchWindow: string;
  variantCount: number;
  rating: number;
  reviews: number;
  keyFeatures: string[];
  media: {
    hero: string;
    gallery: string[];
  };
}

const UpcomingCarSchema = new Schema<IUpcomingCar>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brandId: { type: String, required: true },
    brandName: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String },
    bodyType: { type: String },
    fuelTypes: { type: [String], default: [] },
    status: { type: String, default: "upcoming" },

    expectedPriceMin: { type: Number },
    expectedPriceMax: { type: Number },
    expectedLaunch: { type: String },
    launchWindow: { type: String },

    variantCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },

    keyFeatures: { type: [String], default: [] },

    media: {
      hero: { type: String },
      gallery: { type: [String], default: [] }
    }
  },
  { timestamps: true }
);

export default model<IUpcomingCar>("UpcomingCar", UpcomingCarSchema);
