"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComparison = exports.updateComparison = exports.createComparison = exports.getComparisonById = exports.getAllComparisons = void 0;
const Comparison_model_1 = __importDefault(require("../models/Comparison.model"));
const getAllComparisons = async (req, res) => {
    try {
        const data = await Comparison_model_1.default.find().sort({ views: -1 });
        res.json(data);
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
