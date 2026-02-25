"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cityStateMapping_1 = require("../lib/cityStateMapping");
const router = express_1.default.Router();
// Generate city list from mapping with proper format
const generateCities = () => {
    return Object.entries(cityStateMapping_1.CITY_TO_STATE)
        .map(([cityName, stateName]) => ({
        id: cityName.toLowerCase().replace(/\s+/g, "-"),
        name: cityName,
        state: stateName,
        slug: cityName.toLowerCase().replace(/\s+/g, "-"),
    }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
// Popular cities in India (top 20 major cities)
const POPULAR_CITY_NAMES = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Bengaluru",
    "Hyderabad",
    "Chennai",
    "Pune",
    "Kolkata",
    "Ahmedabad",
    "Jaipur",
    "Chandigarh",
    "Surat",
    "Lucknow",
    "Kochi",
    "Indore",
    "Nagpur",
    "Bhopal",
    "Visakhapatnam",
    "Patna",
    "Vadodara",
];
const CITIES = generateCities();
// Get all cities
router.get("/", (req, res) => {
    try {
        res.json(CITIES);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch cities" });
    }
});
// Get popular cities (top 20)
router.get("/popular", (req, res) => {
    try {
        const popularCities = CITIES.filter((city) => POPULAR_CITY_NAMES.includes(city.name));
        res.json(popularCities);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch popular cities" });
    }
});
// Get city by slug
router.get("/:slug", (req, res) => {
    try {
        const { slug } = req.params;
        const city = CITIES.find((c) => c.slug === slug);
        if (!city) {
            return res.status(404).json({ error: "City not found" });
        }
        res.json(city);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch city" });
    }
});
// Search cities
router.get("/search/:query", (req, res) => {
    try {
        const { query } = req.params;
        const searchQuery = query.toLowerCase();
        const filteredCities = CITIES.filter((city) => city.name.toLowerCase().includes(searchQuery) ||
            city.state.toLowerCase().includes(searchQuery));
        res.json(filteredCities);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to search cities" });
    }
});
exports.default = router;
