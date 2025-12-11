"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPricingAndTaxSummary = exports.bulkUpdateStateWiseTaxes = exports.updateStateWiseTaxes = exports.getStateWiseTaxes = exports.updateAllVariantPrices = void 0;
const Variant_model_1 = __importDefault(require("../models/Variant.model"));
const StateTaxConfig_model_1 = __importDefault(require("../models/StateTaxConfig.model"));
/**
 * Admin endpoint to update all variant ex-showroom prices
 * Supports percentage or fixed amount increase/decrease
 */
const updateAllVariantPrices = async (req, res) => {
    try {
        const { type, value, filters } = req.body;
        if (!type || !["percentage", "fixed"].includes(type)) {
            return res.status(400).json({ error: "Type must be 'percentage' or 'fixed'" });
        }
        if (value === undefined || typeof value !== "number") {
            return res.status(400).json({ error: "Value must be a number" });
        }
        // Optional filters: by brand, model, fuelType, transmission
        const query = {};
        if (filters) {
            if (filters.modelId)
                query.modelId = filters.modelId;
            if (filters.fuelType)
                query.fuelType = filters.fuelType;
            if (filters.transmission)
                query.transmission = filters.transmission;
        }
        const variants = await Variant_model_1.default.find(query);
        if (variants.length === 0) {
            return res.status(404).json({ message: "No variants found matching the filters" });
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
            message: `Successfully updated ${results.length} variant prices`,
            updateType: type,
            updateValue: value,
            variantsUpdated: results.length,
            variants: results,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update variant prices" });
    }
};
exports.updateAllVariantPrices = updateAllVariantPrices;
/**
 * Admin endpoint to get all state tax configurations
 */
const getStateWiseTaxes = async (req, res) => {
    try {
        const configs = await StateTaxConfig_model_1.default.find().sort({ state: 1 });
        res.json(configs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch state tax configurations" });
    }
};
exports.getStateWiseTaxes = getStateWiseTaxes;
/**
 * Admin endpoint to update state-wise taxes
 */
const updateStateWiseTaxes = async (req, res) => {
    try {
        const { state, gstRate, rtoPercentage, insurancePercentage, registrationFee, tcsRate, fastagCharges } = req.body;
        if (!state) {
            return res.status(400).json({ error: "State is required" });
        }
        const config = await StateTaxConfig_model_1.default.findOneAndUpdate({ state }, {
            ...(gstRate !== undefined && { gstRate }),
            ...(rtoPercentage !== undefined && { rtoPercentage }),
            ...(insurancePercentage !== undefined && { insurancePercentage }),
            ...(registrationFee !== undefined && { registrationFee }),
            ...(tcsRate !== undefined && { tcsRate }),
            ...(fastagCharges !== undefined && { fastagCharges }),
        }, { new: true, upsert: true });
        res.json({
            message: `State tax configuration for ${state} updated successfully`,
            config,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update state tax configuration" });
    }
};
exports.updateStateWiseTaxes = updateStateWiseTaxes;
/**
 * Admin endpoint to bulk update state-wise taxes
 */
const bulkUpdateStateWiseTaxes = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { state, gstRate, rtoPercentage, ... }
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ error: "Updates must be a non-empty array" });
        }
        const results = await Promise.all(updates.map(async (update) => {
            const { state, gstRate, rtoPercentage, insurancePercentage, registrationFee } = update;
            if (!state) {
                return { error: "State is required", data: update };
            }
            return StateTaxConfig_model_1.default.findOneAndUpdate({ state }, {
                ...(gstRate !== undefined && { gstRate }),
                ...(rtoPercentage !== undefined && { rtoPercentage }),
                ...(insurancePercentage !== undefined && { insurancePercentage }),
                ...(registrationFee !== undefined && { registrationFee }),
            }, { new: true, upsert: true });
        }));
        const successful = results.filter((r) => !r.error);
        const failed = results.filter((r) => r.error);
        res.json({
            message: `Successfully updated ${successful.length} state tax configurations`,
            totalUpdated: successful.length,
            totalFailed: failed.length,
            configs: successful,
            ...(failed.length > 0 && { errors: failed }),
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to bulk update state tax configurations" });
    }
};
exports.bulkUpdateStateWiseTaxes = bulkUpdateStateWiseTaxes;
/**
 * Admin endpoint to get pricing and tax summary
 */
const getPricingAndTaxSummary = async (req, res) => {
    try {
        const totalVariants = await Variant_model_1.default.countDocuments();
        const avgPrice = await Variant_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    average: { $avg: { $ifNull: ["$exShowroomPrice", "$price"] } },
                    min: { $min: { $ifNull: ["$exShowroomPrice", "$price"] } },
                    max: { $max: { $ifNull: ["$exShowroomPrice", "$price"] } },
                },
            },
        ]);
        // keep `_id` so frontend can use it as a stable key and for dialog control
        const taxConfigs = await StateTaxConfig_model_1.default.find().select("-__v").lean();
        res.json({
            variants: {
                total: totalVariants,
                priceStats: avgPrice[0] || { average: 0, min: 0, max: 0 },
            },
            taxConfigs,
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch pricing and tax summary" });
    }
};
exports.getPricingAndTaxSummary = getPricingAndTaxSummary;
