import { Schema, model, Document } from "mongoose";

export interface IVariant extends Document {
  id: string;
  modelId: string;
  name: string;
  slug: string;
  price: number;
  exShowroomPrice?: number; // Explicit ex-showroom price field
  fuelType: string;
  transmission: string;
  engine: string;
  mileage: number;
  seating: number;
  colors: string[];
  image?: string;
  images?: string[];
  heroSectionContent?: string;
  variantOverview?: string;
  keyFeaturesSummary?: string;
  uniqueVsLowerVariant?: string;
  engineTransmissionSummary?: string;
  featureDifferencesTable?: string;
  valueForMoneyAnalysis?: string;
  variantProsCons?: string;
  whoShouldBuy?: string;
  variantFaqs?: string;
}

const VariantSchema = new Schema<IVariant>(
  {
    id: { type: String, required: true, unique: true },
    modelId: { type: String, required: true },  // links to CarModel
    name: { type: String, required: true },
    slug: { type: String, required: true },
    price: { type: Number, required: true },
    exShowroomPrice: { type: Number }, // Explicit ex-showroom price
    fuelType: { type: String, required: true },
    transmission: { type: String, required: true },
    engine: { type: String },
    mileage: { type: Number },
    seating: { type: Number },
    colors: { type: [String], default: [] },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    heroSectionContent: { type: String, default: "" },
    variantOverview: { type: String, default: "" },
    keyFeaturesSummary: { type: String, default: "" },
    uniqueVsLowerVariant: { type: String, default: "" },
    engineTransmissionSummary: { type: String, default: "" },
    featureDifferencesTable: { type: String, default: "" },
    valueForMoneyAnalysis: { type: String, default: "" },
    variantProsCons: { type: String, default: "" },
    whoShouldBuy: { type: String, default: "" },
    variantFaqs: { type: String, default: "" }
  },
  { timestamps: true }
);

export default model<IVariant>("Variant", VariantSchema);
