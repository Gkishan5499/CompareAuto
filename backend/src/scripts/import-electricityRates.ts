import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ElectricityRate from "../models/ElectricityRate.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "electricity-rates.json");

const importElectricityRates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await ElectricityRate.deleteMany();
    await ElectricityRate.insertMany(data);

    console.log(`Inserted ${data.length} electricity rates`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importElectricityRates();
