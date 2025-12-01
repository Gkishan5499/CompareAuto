import { Schema, model, Document } from "mongoose";

export interface IUsedCar extends Document {
  id: string;
  title: string;
  brand: string;
  carmodel: string;
  variant: string;
  year: number;
  fuel: string;
  transmission: string;
  kms: number;
  owners: number;
  city: string;
  price: number;
  images: string[];
  features: string[];
  sellerType: string;
  sellerName: string;
  sellerPhone: string;
  listingUrl: string;
  verified: boolean;
}

const UsedCarSchema = new Schema<IUsedCar>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    brand: { type: String, required: true },
    carmodel: { type: String, required: true },
    variant: { type: String },
    year: { type: Number, required: true },
    fuel: { type: String, required: true },
    transmission: { type: String, required: true },
    kms: { type: Number, required: true },
    owners: { type: Number, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },

    images: { type: [String], default: [] },
    features: { type: [String], default: [] },

    sellerType: { type: String },
    sellerName: { type: String },
    sellerPhone: { type: String },

    listingUrl: { type: String },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default model<IUsedCar>("UsedCar", UsedCarSchema);
