import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";
import Brand from "../models/Brand.model";
import CarModel from "../models/CarModel.model";
import UsedCar from "../models/UsedCar.model";
import Article from "../models/Article.model";
import UpcomingCar from "../models/UpcomingCar.model";
import Dealer from "../models/Dealer.model";
import Review from "../models/Review.model";
import Variant from "../models/Variant.model";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

const loadJsonCount = async (fileName: string) => {
  try {
    const filePath = path.join(process.cwd(), fileName);
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
};

router.get("/stats", verifyAdmin, requirePermission("dashboard"), async (req, res) => {
  try {
    const [brands, models, variantsDb, usedCars, articles, upcoming, dealers, reviews] = await Promise.all([
      Brand.countDocuments(),
      CarModel.countDocuments(),
      Variant.countDocuments(),
      UsedCar.countDocuments(),
      Article.countDocuments(),
      UpcomingCar.countDocuments(),
      Dealer.countDocuments(),
      Review.countDocuments(),
    ]);

    const variants = variantsDb > 0 ? variantsDb : await loadJsonCount("variants.json");

    res.json({
      brands,
      models,
      variants,
      usedCars,
      articles,
      upcoming,
      dealers,
      reviews,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error loading dashboard stats" });
  }
});

export default router;
