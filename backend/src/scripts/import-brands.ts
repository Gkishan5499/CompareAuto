import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Brand from "../models/Brand.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "brands.json");

const importBrands = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const brands = JSON.parse(raw);

    await Brand.deleteMany(); // clear old data
    await Brand.insertMany(brands);

    console.log(`Inserted ${brands.length} brands`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importBrands();
