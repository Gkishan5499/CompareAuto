import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import FeatureFlag from "../models/FeatureFlag.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "feature-flags.json");

const importFeatureFlags = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await FeatureFlag.deleteMany();
    await FeatureFlag.create(data);

    console.log("Feature flags imported");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importFeatureFlags();
