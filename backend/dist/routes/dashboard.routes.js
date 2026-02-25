"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const Brand_model_1 = __importDefault(require("../models/Brand.model"));
const CarModel_model_1 = __importDefault(require("../models/CarModel.model"));
const UsedCar_model_1 = __importDefault(require("../models/UsedCar.model"));
const Article_model_1 = __importDefault(require("../models/Article.model"));
const UpcomingCar_model_1 = __importDefault(require("../models/UpcomingCar.model"));
const Dealer_model_1 = __importDefault(require("../models/Dealer.model"));
const Review_model_1 = __importDefault(require("../models/Review.model"));
const Variant_model_1 = __importDefault(require("../models/Variant.model"));
const router = (0, express_1.Router)();
const loadJsonCount = async (fileName) => {
    try {
        const filePath = path_1.default.join(process.cwd(), fileName);
        const raw = await fs_1.promises.readFile(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.length : 0;
    }
    catch {
        return 0;
    }
};
router.get("/stats", async (req, res) => {
    try {
        const [brands, models, variantsDb, usedCars, articles, upcoming, dealers, reviews] = await Promise.all([
            Brand_model_1.default.countDocuments(),
            CarModel_model_1.default.countDocuments(),
            Variant_model_1.default.countDocuments(),
            UsedCar_model_1.default.countDocuments(),
            Article_model_1.default.countDocuments(),
            UpcomingCar_model_1.default.countDocuments(),
            Dealer_model_1.default.countDocuments(),
            Review_model_1.default.countDocuments(),
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error loading dashboard stats" });
    }
});
exports.default = router;
