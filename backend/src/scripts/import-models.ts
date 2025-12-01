import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import CarModel from "../models/CarModel.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "models.json");

const importModels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await CarModel.deleteMany();
    await CarModel.insertMany(data);

    console.log(`Inserted ${data.length} car models`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importModels();
