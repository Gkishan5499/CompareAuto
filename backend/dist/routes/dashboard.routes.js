"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Brand_model_1 = __importDefault(require("../models/Brand.model"));
const CarModel_model_1 = __importDefault(require("../models/CarModel.model"));
const UsedCar_model_1 = __importDefault(require("../models/UsedCar.model"));
const Article_model_1 = __importDefault(require("../models/Article.model"));
const UpcomingCar_model_1 = __importDefault(require("../models/UpcomingCar.model"));
const Dealer_model_1 = __importDefault(require("../models/Dealer.model"));
const Review_model_1 = __importDefault(require("../models/Review.model"));
const router = (0, express_1.Router)();
router.get("/stats", async (req, res) => {
    try {
        const [brands, models, usedCars, articles, upcoming, dealers, reviews] = await Promise.all([
            Brand_model_1.default.countDocuments(),
            CarModel_model_1.default.countDocuments(),
            UsedCar_model_1.default.countDocuments(),
            Article_model_1.default.countDocuments(),
            UpcomingCar_model_1.default.countDocuments(),
            Dealer_model_1.default.countDocuments(),
            Review_model_1.default.countDocuments(),
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error loading dashboard stats" });
    }
});
exports.default = router;
