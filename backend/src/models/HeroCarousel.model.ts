import { Schema, model, Document } from "mongoose";

export interface IHeroCarousel extends Document {
  id: string;
  title: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  link?: string;
  description?: string;
}

const HeroCarouselSchema = new Schema<IHeroCarousel>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    link: { type: String },
    description: { type: String }
  },
  { timestamps: true }
);

export default model<IHeroCarousel>("HeroCarousel", HeroCarouselSchema);
