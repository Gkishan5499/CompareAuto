import { Schema, model, Document } from "mongoose";

export interface ICarModel extends Document {
  id: string;
  name: string;
  vehicleCategory?: "car" | "bike";
  wheels?: 2 | 4;
  brandId: string;
  brandName: string;
  slug: string;
  image: string;
  gallery: string[];
  interiorImages?: string[];
  exteriorImages?: string[];
  youtubeUrl?: string;
  videoUrl?: string;
  bodyType: string;
  fuelTypes: string[];
  priceRange: {
    min: number;
    max: number;
  };
  variantCount: number;
  rating: number;
  reviews: number;
  status: string; // on_sale / upcoming
  // Content Fields
  heroSectionContent?: string;
  modelOverview?: string;
  variantLineup?: string;
  engineTransmission?: string;
  mileageExplanation?: string;
  featuresHighlight?: string;
  safetyOverview?: string;
  interiorOverview?: string;
  exteriorOverview?: string;
  rideHandling?: string;
  ownershipCost?: string;
  modelProsCons?: string;
  competitorsSection?: string;
  expertVerdict?: string;
  modelFaqs?: string;
}

const CarModelSchema = new Schema<ICarModel>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    vehicleCategory: { type: String, enum: ["car", "bike"], default: "car" },
    wheels: { type: Number, enum: [2, 4], default: 4 },
    brandId: { type: String, required: true },
    brandName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: "/cars/placeholder.png" },
    gallery: { type: [String], default: [] },
    interiorImages: { type: [String], default: [] },
    exteriorImages: { type: [String], default: [] },
    youtubeUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    bodyType: { type: String },
    fuelTypes: { type: [String], default: [] },
    priceRange: {
      min: Number,
      max: Number
    },
    variantCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    status: { type: String, default: "on_sale" },
    // Content Fields
    heroSectionContent: { type: String, default: "" },
    modelOverview: { type: String, default: "" },
    variantLineup: { type: String, default: "" },
    engineTransmission: { type: String, default: "" },
    mileageExplanation: { type: String, default: "" },
    featuresHighlight: { type: String, default: "" },
    safetyOverview: { type: String, default: "" },
    interiorOverview: { type: String, default: "" },
    exteriorOverview: { type: String, default: "" },
    rideHandling: { type: String, default: "" },
    ownershipCost: { type: String, default: "" },
    modelProsCons: { type: String, default: "" },
    competitorsSection: { type: String, default: "" },
    expertVerdict: { type: String, default: "" },
    modelFaqs: { type: String, default: "" }
  },
  { timestamps: true }
);

export default model<ICarModel>("CarModel", CarModelSchema);
