import { Schema, model, Document } from "mongoose";

export interface IElectricityRate extends Document {
  state: string;
  stateName: string;
  discom: string;
  discomName: string;
  slab: string;
  ratePerUnit: number;
  fixedPerDay: number;
  updated: string;
}

const ElectricityRateSchema = new Schema<IElectricityRate>(
  {
    state: { type: String, required: true },
    stateName: { type: String, required: true },
    discom: { type: String, required: true },
    discomName: { type: String, required: true },
    slab: { type: String, required: true },
    ratePerUnit: { type: Number, required: true },
    fixedPerDay: { type: Number, required: true },
    updated: { type: String }
  },
  { timestamps: true }
);

export default model<IElectricityRate>("ElectricityRate", ElectricityRateSchema);
