"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModelVariantsPrices = exports.bulkUpdateVariantPrices = exports.updateVariantPrice = exports.deleteVariant = exports.updateVariant = exports.bulkCreateVariants = exports.createVariant = exports.getVariantsByModel = exports.getVariantById = exports.getAllVariants = void 0;
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
/**
 * Update ex-showroom price for a single variant
 */
const updateVariantPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { exShowroomPrice, price } = req.body;
        if (exShowroomPrice === undefined && price === undefined) {
            return res.status(400).json({ error: "Either exShowroomPrice or price must be provided" });
        }
        const updateData = {};
        if (exShowroomPrice !== undefined)
            updateData.exShowroomPrice = exShowroomPrice;
        if (price !== undefined)
            updateData.price = price;
        const variant = await Variant_model_1.default.findOneAndUpdate({ id }, updateData, { new: true });
        if (!variant)
            return res.status(404).json({ message: "Variant not found" });
        res.json(variant);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update variant price" });
    }
};
exports.updateVariantPrice = updateVariantPrice;
/**
 * Bulk update prices for multiple variants
 */
const bulkUpdateVariantPrices = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { id, exShowroomPrice, price }
        if (!Array.isArray(updates)) {
            return res.status(400).json({ error: "Updates must be an array" });
        }
        if (updates.length === 0) {
            return res.status(400).json({ error: "No variants to update" });
        }
        const results = await Promise.all(updates.map(async (update) => {
            const { id, exShowroomPrice, price } = update;
            if (!id) {
                return { error: "Variant ID is required", id };
            }
            const updateData = {};
            if (exShowroomPrice !== undefined)
                updateData.exShowroomPrice = exShowroomPrice;
            if (price !== undefined)
                updateData.price = price;
            if (Object.keys(updateData).length === 0) {
                return { error: "No price fields provided", id };
            }
            const variant = await Variant_model_1.default.findOneAndUpdate({ id }, updateData, { new: true });
            if (!variant) {
                return { error: "Variant not found", id };
            }
            return variant;
        }));
        const updated = results.filter((r) => !r.error);
        const failed = results.filter((r) => r.error);
        res.json({
            totalRequested: updates.length,
            successfulUpdates: updated.length,
            failedUpdates: failed.length,
            updated,
            ...(failed.length > 0 && { failed }),
        });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to bulk update variant prices" });
    }
};
exports.bulkUpdateVariantPrices = bulkUpdateVariantPrices;
/**
 * Update prices for all variants of a model (percentage or fixed amount)
 */
const updateModelVariantsPrices = async (req, res) => {
    try {
        const { modelId } = req.params;
        const { type, value } = req.body; // type: 'percentage' | 'fixed', value: number
        if (!type || !["percentage", "fixed"].includes(type)) {
            return res.status(400).json({ error: "Type must be 'percentage' or 'fixed'" });
        }
        if (value === undefined || typeof value !== "number") {
            return res.status(400).json({ error: "Value must be a number" });
        }
        const variants = await Variant_model_1.default.find({ modelId });
        if (variants.length === 0) {
            return res.status(404).json({ message: `No variants found for model ${modelId}` });
        }
        const results = await Promise.all(variants.map(async (variant) => {
            const currentPrice = variant.exShowroomPrice || variant.price;
            let newPrice;
            if (type === "percentage") {
                newPrice = Math.round(currentPrice * (1 + value / 100));
            }
            else {
                newPrice = currentPrice + value;
            }
            return Variant_model_1.default.findOneAndUpdate({ id: variant.id }, { exShowroomPrice: newPrice, price: newPrice }, { new: true });
        }));
        res.json({
            modelId,
            variantsUpdated: results.length,
            updateType: type,
            updateValue: value,
            variants: results,
        });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update model variant prices" });
    }
};
exports.updateModelVariantsPrices = updateModelVariantsPrices;
