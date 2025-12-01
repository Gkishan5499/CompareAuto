import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
  username: string;
  passwordHash: string;
  role?: string;
}

const AdminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "admin" }
}, { timestamps: true });

export default model<IAdmin>("Admin", AdminSchema);
