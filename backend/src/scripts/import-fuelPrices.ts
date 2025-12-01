import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import FuelPrice from "../models/FuelPrice.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "fuel-prices.json");

const importFuelPrices = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await FuelPrice.deleteMany();
    await FuelPrice.insertMany(data);

    console.log(`Inserted ${data.length} fuel prices`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importFuelPrices();
