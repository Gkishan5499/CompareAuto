import { Schema, model, Document } from "mongoose";

interface Address {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

interface Hours {
  mon_sat: string;
  sun: string;
}

interface Location {
  lat: number;
  lng: number;
}

export interface IDealer extends Document {
  id: string;
  name: string;
  brands: string[];
  categories: string[];
  dealerCode: string;
  address: Address;
  phones: string[];
  email: string;
  website: string;
  hours: Hours;
  location: Location;
  rating: number;
  verified: boolean;
  updated: string;
  images: string[];
}

const DealerSchema = new Schema<IDealer>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    brands: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    dealerCode: { type: String, required: true },

    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String
    },

    phones: { type: [String], default: [] },
    email: { type: String },
    website: { type: String },

    hours: {
      mon_sat: String,
      sun: String
    },

    location: {
      lat: Number,
      lng: Number
    },

    rating: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    updated: { type: String },
    images: { type: [String], default: [] }
  },
  { timestamps: true }
);

export default model<IDealer>("Dealer", DealerSchema);
