import { Schema, model, Document } from "mongoose";

export interface IStateTaxConfig extends Document {
  state: string;
  gstRate: number; // percentage (e.g., 5, 12)
  rtoPercentage: number; // percentage of vehicle price
  insurancePercentage: number; // percentage of vehicle price
  registrationFee: number; // fixed amount in INR
  tcsRate?: number; // Tax Collected at Source percentage (default: 1%)
  fastagCharges?: number; // FASTag charges in INR (default: 500)
  updatedAt: Date;
}

const StateTaxConfigSchema = new Schema<IStateTaxConfig>(
  {
    state: { type: String, required: true, unique: true, index: true },
    gstRate: { type: Number, required: true, default: 5 },
    rtoPercentage: { type: Number, required: true, default: 9 },
    insurancePercentage: { type: Number, required: true, default: 3.5 },
    registrationFee: { type: Number, required: true, default: 2000 },
    tcsRate: { type: Number, default: 1 }, // 1% for vehicles ≥10L
    fastagCharges: { type: Number, default: 500 }, // Default FASTag charges
  },
  { timestamps: true }
);

export default model<IStateTaxConfig>("StateTaxConfig", StateTaxConfigSchema);
