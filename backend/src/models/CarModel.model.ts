import { Schema, model, Document } from "mongoose";

export interface ICarModel extends Document {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  slug: string;
  image: string;
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
}

const CarModelSchema = new Schema<ICarModel>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brandId: { type: String, required: true },
    brandName: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, default: "/cars/placeholder.png" },
    bodyType: { type: String },
    fuelTypes: { type: [String], default: [] },
    priceRange: {
      min: Number,
      max: Number
    },
    variantCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    status: { type: String, default: "on_sale" }
  },
  { timestamps: true }
);

export default model<ICarModel>("CarModel", CarModelSchema);
