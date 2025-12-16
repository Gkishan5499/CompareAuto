import mongoose, { Schema, Document } from "mongoose";

export interface IEnquiry extends Document {
  fullName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  pincode: string;
  message?: string;
  pageType?: string;
  brand?: string;
  carModel?: string;
  variant?: string;
  usedId?: string;
  source?: string;
  ref: string;
  createdAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    message: { type: String },
    pageType: { type: String, default: "contact" },
    brand: { type: String },
    carModel: { type: String },
    variant: { type: String },
    usedId: { type: String },
    source: { type: String },
    ref: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEnquiry>("Enquiry", EnquirySchema);
