import mongoose from "mongoose";
import dotenv from "dotenv";
import HeroCarousel from "../models/HeroCarousel.model";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const importHeroCarousel = async () => {
  try {
    // Read JSON file manually to avoid TypeScript module resolution issues
    const heroData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../data/hero-carousel.json"), "utf-8")
    );

    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/camparecar");
    console.log("Connected to MongoDB");

    // Clear existing data
    await HeroCarousel.deleteMany({});
    console.log("Cleared existing hero carousel data");

    // Insert new data
    await HeroCarousel.insertMany(heroData);
    console.log(`Imported ${heroData.length} hero carousel images`);

    process.exit(0);
  } catch (error) {
    console.error("Error importing hero carousel:", error);
    process.exit(1);
  }
};

importHeroCarousel();
