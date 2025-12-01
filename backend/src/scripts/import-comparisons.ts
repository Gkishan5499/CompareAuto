import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Comparison from "../models/Comparison.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "comparisons.json");

const importComparisons = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await Comparison.deleteMany();
    await Comparison.insertMany(data);

    console.log(`Inserted ${data.length} comparisons`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importComparisons();
