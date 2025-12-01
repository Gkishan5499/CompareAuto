import { Schema, model, Document } from "mongoose";

export interface IBrand extends Document {
  id: string;
  name: string;
  logo: string;
  country: string;
  modelCount: number;
  slug: string;
}

const BrandSchema = new Schema<IBrand>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    country: { type: String, required: true },
    modelCount: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default model<IBrand>("Brand", BrandSchema);
