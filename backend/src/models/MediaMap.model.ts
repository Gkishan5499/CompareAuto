import { Schema, model, Document } from "mongoose";

export interface IMediaMap extends Document {
  key: string; // e.g. "maruti-suzuki/swift"
  hero: string;
  gallery: string[];
  colors: Record<string, string>;
  view360: string;
  videos: {
    title: string;
    url: string;
  }[];
}

const MediaMapSchema = new Schema<IMediaMap>(
  {
    key: { type: String, required: true, unique: true },
    hero: { type: String },
    gallery: { type: [String], default: [] },
    colors: { type: Schema.Types.Mixed, default: {} },
    view360: { type: String },
    videos: [
      {
        title: String,
        url: String
      }
    ]
  },
  { timestamps: true }
);

export default model<IMediaMap>("MediaMap", MediaMapSchema);
