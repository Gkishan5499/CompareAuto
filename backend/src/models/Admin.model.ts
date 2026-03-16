import { Schema, model, Document } from "mongoose";
import { DEFAULT_EDITOR_PERMISSIONS } from "../constants/adminPermissions";

export interface IAdmin extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  permissions: string[];
}

const ADMIN_ROLES = ["admin", "editor"] as const;

const AdminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ADMIN_ROLES, default: "editor" },
  permissions: { type: [String], default: DEFAULT_EDITOR_PERMISSIONS }
}, { timestamps: true });

export default model<IAdmin>("Admin", AdminSchema);
