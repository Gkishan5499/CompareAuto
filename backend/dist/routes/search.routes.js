"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Search cars by query
router.get("/cars", async (req, res) => {
    try {
        const { q, brand, bodyType, fuelType, priceMin, priceMax, city } = req.query;
        // This would typically query your database
        // For now, returning a structure
        const results = {
            query: q,
            filters: {
                brand,
                bodyType,
                fuelType,
                priceMin,
                priceMax,
                city,
            },
            results: [], // Would be populated from database
            total: 0,
        };
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ error: "Search failed" });
    }
});
// Get search suggestions
router.get("/suggestions", async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.json([]);
        }
        const query = q.toLowerCase();
        // This would typically query your database for suggestions
        // For now, returning empty array
        const suggestions = [];
        res.json(suggestions);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get suggestions" });
    }
});
// Get popular searches
router.get("/popular", (req, res) => {
    try {
        const popularSearches = [
            { term: "SUV", count: 12500, type: "bodyType" },
            { term: "Hyundai Creta", count: 8900, type: "model" },
            { term: "Electric Cars", count: 6700, type: "fuelType" },
            { term: "Maruti Swift", count: 5400, type: "model" },
            { term: "Under 10 Lakh", count: 4800, type: "price" },
            { term: "Tata Nexon", count: 4200, type: "model" },
            { term: "Sedan", count: 3800, type: "bodyType" },
            { term: "Mahindra Thar", count: 3500, type: "model" },
        ];
        res.json(popularSearches);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch popular searches" });
    }
});
exports.default = router;
