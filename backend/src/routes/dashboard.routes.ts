import { Router } from "express";
import Brand from "../models/Brand.model";
import CarModel from "../models/CarModel.model";
import UsedCar from "../models/UsedCar.model";
import Article from "../models/Article.model";
import UpcomingCar from "../models/UpcomingCar.model";
import Dealer from "../models/Dealer.model";
import Review from "../models/Review.model";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [brands, models, usedCars, articles, upcoming, dealers, reviews] = await Promise.all([
      Brand.countDocuments(),
      CarModel.countDocuments(),
      UsedCar.countDocuments(),
      Article.countDocuments(),
      UpcomingCar.countDocuments(),
      Dealer.countDocuments(),
      Review.countDocuments(),
    ]);

    res.json({
      brands,
      models,
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
