import { Schema, model, Document } from "mongoose";

export interface IFeatureFlag extends Document {
  enableDealers: boolean;
  enableBodyTypes: boolean;
  enableGuides: boolean;
  enableAIPersona: boolean;
  enableUsedCars: boolean;
  enableNews: boolean;
  enableComparisons: boolean;
  enableTools: boolean;
  enableAdSlots: boolean;
}

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    enableDealers: { type: Boolean, default: true },
    enableBodyTypes: { type: Boolean, default: true },
    enableGuides: { type: Boolean, default: false },
    enableAIPersona: { type: Boolean, default: true },
    enableUsedCars: { type: Boolean, default: true },
    enableNews: { type: Boolean, default: true },
    enableComparisons: { type: Boolean, default: true },
    enableTools: { type: Boolean, default: true },
    enableAdSlots: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model<IFeatureFlag>("FeatureFlag", FeatureFlagSchema);
