import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UsedCar from "../models/UsedCar.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "used-cars.json");

const importUsedCars = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await UsedCar.deleteMany();
    await UsedCar.insertMany(data);

    console.log(`Inserted ${data.length} used cars`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importUsedCars();
