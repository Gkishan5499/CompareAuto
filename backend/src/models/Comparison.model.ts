import { Schema, model, Document } from "mongoose";

export interface IComparison extends Document {
  id: string;
  name: string;
  models: string[]; // car model IDs
  views: number;
}

const ComparisonSchema = new Schema<IComparison>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    models: { type: [String], required: true }, // array of model ids
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default model<IComparison>("Comparison", ComparisonSchema);
