import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Article from "../models/Article.model";

dotenv.config();

const filePath = path.join(__dirname, "..", "data", "articles.json");

const importArticles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB connected");

    const raw = fs.readFileSync(filePath, "utf-8");
    const articles = JSON.parse(raw);

    await Article.deleteMany();
    await Article.insertMany(articles);

    console.log(`Inserted ${articles.length} articles`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importArticles();
