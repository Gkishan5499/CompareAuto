"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Popular cities in India
const CITIES = [
    { id: "delhi-ncr", name: "Delhi NCR", state: "Delhi", slug: "delhi-ncr" },
    { id: "mumbai", name: "Mumbai", state: "Maharashtra", slug: "mumbai" },
    { id: "bangalore", name: "Bangalore", state: "Karnataka", slug: "bangalore" },
    { id: "hyderabad", name: "Hyderabad", state: "Telangana", slug: "hyderabad" },
    { id: "chennai", name: "Chennai", state: "Tamil Nadu", slug: "chennai" },
    { id: "pune", name: "Pune", state: "Maharashtra", slug: "pune" },
    { id: "kolkata", name: "Kolkata", state: "West Bengal", slug: "kolkata" },
    { id: "ahmedabad", name: "Ahmedabad", state: "Gujarat", slug: "ahmedabad" },
    { id: "jaipur", name: "Jaipur", state: "Rajasthan", slug: "jaipur" },
    { id: "chandigarh", name: "Chandigarh", state: "Chandigarh", slug: "chandigarh" },
    { id: "surat", name: "Surat", state: "Gujarat", slug: "surat" },
    { id: "lucknow", name: "Lucknow", state: "Uttar Pradesh", slug: "lucknow" },
    { id: "kochi", name: "Kochi", state: "Kerala", slug: "kochi" },
    { id: "indore", name: "Indore", state: "Madhya Pradesh", slug: "indore" },
    { id: "nagpur", name: "Nagpur", state: "Maharashtra", slug: "nagpur" },
    { id: "bhopal", name: "Bhopal", state: "Madhya Pradesh", slug: "bhopal" },
    { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", slug: "visakhapatnam" },
    { id: "patna", name: "Patna", state: "Bihar", slug: "patna" },
    { id: "vadodara", name: "Vadodara", state: "Gujarat", slug: "vadodara" },
    { id: "ghaziabad", name: "Ghaziabad", state: "Uttar Pradesh", slug: "ghaziabad" },
];
// Get all cities
router.get("/", (req, res) => {
    try {
        res.json(CITIES);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch cities" });
    }
});
// Get popular cities (top 10)
router.get("/popular", (req, res) => {
    try {
        const popularCities = CITIES.slice(0, 10);
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
