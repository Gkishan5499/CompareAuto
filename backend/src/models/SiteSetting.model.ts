import { Schema, model, Document } from "mongoose";

export interface ISiteSetting extends Document {
  key: string;
  value: string;
  type: "text" | "image" | "url" | "json";
  description?: string;
}

const SiteSettingSchema = new Schema<ISiteSetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "url", "json"], default: "text" },
    description: { type: String },
  },
  { timestamps: true }
);

export default model<ISiteSetting>("SiteSetting", SiteSettingSchema);
