import { Schema, model, Document } from "mongoose";
import { devNull } from "os";

export interface IFuelPrice extends Document {
  city: string;
  cityName: string;
  petrol: number;
  diesel: number;
  cng: number | null;
  updated: string;
}

const FuelPriceSchema = new Schema<IFuelPrice>(
  {
    city: { type: String, required: true, unique: true },
    cityName: { type: String, required: true },
    petrol: { type: Number, required: true },
    diesel: { type: Number, required: true },
    cng: { type: Number, default: null },
    updated: { type: String }
  },
  { timestamps: true }
);

export default model<IFuelPrice>("FuelPrice", FuelPriceSchema);
