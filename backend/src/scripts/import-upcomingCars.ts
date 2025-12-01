import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import UpcomingCar from "../models/UpcomingCar.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "upcoming-cars.json");

const importUpcomingCars = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await UpcomingCar.deleteMany();
    await UpcomingCar.insertMany(data);

    console.log(`Inserted ${data.length} upcoming cars`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importUpcomingCars();
