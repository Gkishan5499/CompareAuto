import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.model";
import { ALL_ADMIN_PERMISSIONS } from "../constants/adminPermissions";


dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI as string);
  const username = process.env.ADMIN_USER || "admin";
  const password = process.env.ADMIN_PASS || "password";
  const email = (process.env.ADMIN_EMAIL || "admin@comparecar.local").toLowerCase();
  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const hash = await bcrypt.hash(password, 10);
  await Admin.create({
    username,
    email,
    passwordHash: hash,
    role: "admin",
    permissions: ALL_ADMIN_PERMISSIONS,
  });
  console.log("Admin created:", username);
  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
