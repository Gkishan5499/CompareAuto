import { Schema, model, Document } from "mongoose";

export interface IArticle extends Document {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  author: string;
  heroImage: string;
  excerpt: string;
  body: string;
  relatedIds: string[];
  readingTime: number;
}

const ArticleSchema = new Schema<IArticle>(
  {
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    date: { type: String, required: true },
    author: { type: String, required: true },
    heroImage: { type: String },
    excerpt: { type: String },
    body: { type: String, required: true },
    relatedIds: { type: [String], default: [] },
    readingTime: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default model<IArticle>("Article", ArticleSchema);
