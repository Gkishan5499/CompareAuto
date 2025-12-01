"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariant = exports.updateVariant = exports.bulkCreateVariants = exports.createVariant = exports.getVariantsByModel = exports.getVariantById = exports.getAllVariants = void 0;
const Variant_model_1 = __importDefault(require("../models/Variant.model"));
const getAllVariants = async (req, res) => {
    try {
        const variants = await Variant_model_1.default.find().sort({ price: 1 });
        res.json(variants);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch variants" });
    }
};
exports.getAllVariants = getAllVariants;
const getVariantById = async (req, res) => {
    try {
        const variant = await Variant_model_1.default.findOne({ id: req.params.id });
        if (!variant)
            return res.status(404).json({ message: "Variant not found" });
        res.json(variant);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch variant" });
    }
};
exports.getVariantById = getVariantById;
const getVariantsByModel = async (req, res) => {
    try {
        const variants = await Variant_model_1.default.find({ modelId: req.params.modelId });
        res.json(variants);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch model variants" });
    }
};
exports.getVariantsByModel = getVariantsByModel;
const createVariant = async (req, res) => {
    try {
        const variant = await Variant_model_1.default.create(req.body);
        res.json(variant);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create variant" });
    }
};
exports.createVariant = createVariant;
const bulkCreateVariants = async (req, res) => {
    try {
        const { data } = req.body;
        if (!Array.isArray(data))
            return res.status(400).json({ error: "Invalid data" });
        const created = await Variant_model_1.default.insertMany(data);
        res.json(created);
    }
    catch (err) {
        res.status(400).json({ error: "Failed to bulk create variants" });
    }
};
exports.bulkCreateVariants = bulkCreateVariants;
const updateVariant = async (req, res) => {
    try {
        const variant = await Variant_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(variant);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update variant" });
    }
};
exports.updateVariant = updateVariant;
const deleteVariant = async (req, res) => {
    try {
        await Variant_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Variant deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete variant" });
    }
};
exports.deleteVariant = deleteVariant;
