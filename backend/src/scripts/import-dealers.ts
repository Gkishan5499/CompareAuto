import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Dealer from "../models/Dealer.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "dealers.json");

const importDealers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await Dealer.deleteMany();
    await Dealer.insertMany(data);

    console.log(`Inserted ${data.length} dealers`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importDealers();
