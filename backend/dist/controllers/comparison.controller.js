"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComparison = exports.updateComparison = exports.createComparison = exports.getComparisonById = exports.getAllComparisons = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Comparison_model_1 = __importDefault(require("../models/Comparison.model"));
const seedComparisonsPath = path_1.default.join(__dirname, "..", "data", "comparisons.json");
const loadSeedComparisons = () => {
    try {
        const raw = fs_1.default.readFileSync(seedComparisonsPath, "utf-8");
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    }
    catch (error) {
        return [];
    }
};
const getAllComparisons = async (req, res) => {
    try {
        const data = await Comparison_model_1.default.find().sort({ views: -1 });
        if (data.length >= 4) {
            return res.json(data);
        }
        const seedData = loadSeedComparisons();
        if (seedData.length === 0) {
            return res.json(data);
        }
        const existingIds = new Set(data.map((item) => item.id));
        const merged = [
            ...data,
            ...seedData.filter((item) => !existingIds.has(item.id)),
        ].sort((a, b) => (b.views || 0) - (a.views || 0));
        return res.json(merged);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch comparisons" });
    }
};
exports.getAllComparisons = getAllComparisons;
const getComparisonById = async (req, res) => {
    try {
        const item = await Comparison_model_1.default.findOne({ id: req.params.id });
        if (!item)
            return res.status(404).json({ message: "Comparison not found" });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch comparison" });
    }
};
exports.getComparisonById = getComparisonById;
const createComparison = async (req, res) => {
    try {
        const item = await Comparison_model_1.default.create(req.body);
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create comparison" });
    }
};
exports.createComparison = createComparison;
const updateComparison = async (req, res) => {
    try {
        const item = await Comparison_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update comparison" });
    }
};
exports.updateComparison = updateComparison;
const deleteComparison = async (req, res) => {
    try {
        await Comparison_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Comparison deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete comparison" });
    }
};
exports.deleteComparison = deleteComparison;
