import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Variant from "../models/Variant.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "variants.json");

const importVariants = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await Variant.deleteMany();
    await Variant.insertMany(data);

    console.log(`Inserted ${data.length} variants`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importVariants();
