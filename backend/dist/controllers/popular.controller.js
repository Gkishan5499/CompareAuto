"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getElectricCars = exports.getLatestLaunches = exports.getTrendingComparisons = exports.getPopularBrands = exports.getMostSearchedCars = void 0;
const CarModel_model_1 = __importDefault(require("../models/CarModel.model"));
const Brand_model_1 = __importDefault(require("../models/Brand.model"));
// Get most searched cars (by body type)
const getMostSearchedCars = async (req, res) => {
    try {
        const { bodyType } = req.query;
        const limit = parseInt(req.query.limit) || 10;
        let query = { status: { $ne: "upcoming" } };
        if (bodyType) {
            query.bodyType = bodyType;
        }
        const models = await CarModel_model_1.default.find(query)
            .sort({ rating: -1, reviews: -1 })
            .limit(limit)
            .populate("brandId", "name slug logo");
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch most searched cars" });
    }
};
exports.getMostSearchedCars = getMostSearchedCars;
// Get popular brands
const getPopularBrands = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 15;
        const brands = await Brand_model_1.default.find()
            .sort({ modelCount: -1, name: 1 })
            .limit(limit);
        res.json(brands);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch popular brands" });
    }
};
exports.getPopularBrands = getPopularBrands;
// Get trending comparisons
const getTrendingComparisons = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        // This would typically come from a comparisons collection with view counts
        // For now, returning a structure
        res.json([]);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch trending comparisons" });
    }
};
exports.getTrendingComparisons = getTrendingComparisons;
// Get latest launches
const getLatestLaunches = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const models = await CarModel_model_1.default.find({ status: "new" })
            .sort({ launchDate: -1 })
            .limit(limit)
            .populate("brandId", "name slug logo");
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch latest launches" });
    }
};
exports.getLatestLaunches = getLatestLaunches;
// Get electric cars
const getElectricCars = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        // This would need to check variants for electric fuel type
        const models = await CarModel_model_1.default.find()
            .sort({ name: 1 })
            .limit(limit)
            .populate("brandId", "name slug logo");
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch electric cars" });
    }
};
exports.getElectricCars = getElectricCars;
