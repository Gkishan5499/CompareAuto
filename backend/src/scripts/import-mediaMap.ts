import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import MediaMap from "../models/MediaMap.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "media-map.json");

const importMediaMap = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    await MediaMap.deleteMany();

    const entries = Object.keys(data).map((key) => ({
      key,
      hero: data[key].hero,
      gallery: data[key].gallery || [],
      colors: data[key].colors || {},
      view360: data[key]["360"] || "",
      videos: data[key].videos || []
    }));

    await MediaMap.insertMany(entries);

    console.log(`Inserted ${entries.length} media map entries`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importMediaMap();
