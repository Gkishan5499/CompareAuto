import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Review from "../models/Review.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "reviews.json");

const importReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await Review.deleteMany();
    await Review.insertMany(data);

    console.log(`Inserted ${data.length} reviews`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importReviews();
