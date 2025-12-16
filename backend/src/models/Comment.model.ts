import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  articleId: string;
  name: string;
  email: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  articleId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IComment>("Comment", CommentSchema);
