"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcPriceFromValue = exports.getVariantPriceBreakdown = void 0;
const Variant_model_1 = __importDefault(require("../models/Variant.model"));
const StateTaxConfig_model_1 = __importDefault(require("../models/StateTaxConfig.model"));
const priceUtils_1 = require("../lib/priceUtils");
const parseEngineCc = (engine) => {
    if (!engine)
        return undefined;
    const match = engine.match(/([0-9]+(?:\.[0-9]+)?)/);
    if (!match)
        return undefined;
    const value = parseFloat(match[1]);
    if (!Number.isFinite(value))
        return undefined;
    return value < 50 ? Math.round(value * 1000) : Math.round(value);
};
const getVariantPriceBreakdown = async (req, res) => {
    try {
        const { id } = req.params;
        const { city, state } = req.query;
        const variant = await Variant_model_1.default.findById(id).lean();
        if (!variant)
            return res.status(404).json({ error: "Variant not found" });
        const exShowroomPrice = variant.exShowroomPrice || variant.price || 0;
        const resolvedState = state || (0, priceUtils_1.getStateFromCity)(city);
        // Validate state exists in database
        if (!priceUtils_1.ALL_STATES.includes(resolvedState)) {
            return res.status(400).json({ error: `State "${resolvedState}" not recognized` });
        }
        const config = await StateTaxConfig_model_1.default.findOne({ state: resolvedState }).lean();
        if (!config) {
            return res.status(404).json({ error: `Tax config not found for state "${resolvedState}"` });
        }
        const breakdown = (0, priceUtils_1.calculatePriceBreakdownWithConfig)(exShowroomPrice, config, {
            fuelType: variant.fuelType,
            engineCc: parseEngineCc(variant.engine),
            stateCode: resolvedState,
        });
        // Set cache control headers to prevent caching
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        });
        return res.json({ variantId: id, breakdown, taxConfig: config, city, state: resolvedState });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to compute price breakdown" });
    }
};
exports.getVariantPriceBreakdown = getVariantPriceBreakdown;
const calcPriceFromValue = async (req, res) => {
    try {
        const { exShowroomPrice, city, state, fuelType, engineCc } = req.body;
        const resolvedState = state || (0, priceUtils_1.getStateFromCity)(city);
        // Validate state
        if (!priceUtils_1.ALL_STATES.includes(resolvedState)) {
            return res.status(400).json({ error: `State "${resolvedState}" not recognized` });
        }
        const config = await StateTaxConfig_model_1.default.findOne({ state: resolvedState }).lean();
        if (!config) {
            return res.status(404).json({ error: `Tax config not found for state "${resolvedState}"` });
        }
        const breakdown = (0, priceUtils_1.calculatePriceBreakdownWithConfig)(Number(exShowroomPrice) || 0, config, {
            fuelType,
            engineCc: typeof engineCc === "string" ? Number(engineCc) : engineCc,
            stateCode: resolvedState,
        });
        return res.json({ breakdown, taxConfig: config, city, state: resolvedState });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to calculate price" });
    }
};
exports.calcPriceFromValue = calcPriceFromValue;
