import { Schema, model, Document } from "mongoose";

export interface IStateTaxConfig extends Document {
  state: string;
  gstRate: number; // percentage (e.g., 5, 12)
  rtoPercentage: number; // LEGACY: single percentage (for backwards compatibility)
  rtoByFuelType?: {
    petrol?: number;
    diesel?: number;
    cng?: number;
    hybrid?: number;
    ev?: number;
  }; // Fuel-type specific RTO percentages
  insurancePercentage: number; // LEGACY: single percentage (for backwards compatibility)
  insuranceByFuelType?: {
    petrol?: number;
    diesel?: number;
    cng?: number;
    hybrid?: number;
    ev?: number;
  }; // Fuel-type specific Insurance percentages
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
    rtoByFuelType: {
      type: {
        petrol: { type: Number, default: 9 },
        diesel: { type: Number, default: 9.5 },
        cng: { type: Number, default: 8.5 },
        hybrid: { type: Number, default: 8 },
        ev: { type: Number, default: 0 },
      },
      default: {
        petrol: 9,
        diesel: 9.5,
        cng: 8.5,
        hybrid: 8,
        ev: 0,
      },
    },
    insurancePercentage: { type: Number, required: true, default: 3.5 },
    insuranceByFuelType: {
      type: {
        petrol: { type: Number, default: 5.6 },
        diesel: { type: Number, default: 5.8 },
        cng: { type: Number, default: 5.4 },
        hybrid: { type: Number, default: 5.2 },
        ev: { type: Number, default: 5.0 },
      },
      default: {
        petrol: 5.6,
        diesel: 5.8,
        cng: 5.4,
        hybrid: 5.2,
        ev: 5.0,
      },
    },
    registrationFee: { type: Number, required: true, default: 2000 },
    tcsRate: { type: Number, default: 1 }, // 1% for vehicles ≥10L
    fastagCharges: { type: Number, default: 500 }, // Default FASTag charges
  },
  { timestamps: true }
);

export default model<IStateTaxConfig>("StateTaxConfig", StateTaxConfigSchema);
