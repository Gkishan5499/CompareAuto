"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcPriceFromValue = exports.getVariantPriceBreakdown = void 0;
const Variant_model_1 = __importDefault(require("../models/Variant.model"));
const CarModel_model_1 = __importDefault(require("../models/CarModel.model"));
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
        // Try to find variant by ID first (MongoDB ObjectId), then by slug, then by id field
        let variant = null;
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            // It's a valid MongoDB ObjectId
            variant = await Variant_model_1.default.findById(id).lean();
        }
        if (!variant) {
            // Try finding by slug field
            variant = await Variant_model_1.default.findOne({ slug: id }).lean();
        }
        if (!variant) {
            // Try finding by id field (some variants might use this)
            variant = await Variant_model_1.default.findOne({ id: id }).lean();
        }
        if (!variant) {
            console.error(`Variant not found with id/slug: ${id}`);
            return res.status(404).json({ error: "Variant not found", searchedId: id });
        }
        // Fetch related model to get bodyType for variant-specific RTO calculation
        let bodyType;
        if (variant.modelId) {
            const relatedModel = await CarModel_model_1.default.findOne({ id: variant.modelId }).lean();
            bodyType = relatedModel === null || relatedModel === void 0 ? void 0 : relatedModel.bodyType;
        }
        let exShowroomPrice = variant.exShowroomPrice || variant.price || 0;
        console.log(`getVariantPriceBreakdown: Variant ${id}`, {
            exShowroomPrice: variant.exShowroomPrice,
            price: variant.price,
            resolved: exShowroomPrice
        });
        // If price is still 0, use a fallback (prevents 0 prices in response)
        if (!exShowroomPrice || exShowroomPrice <= 0) {
            console.warn(`Variant ${id} has no price, using fallback 800000`);
            exShowroomPrice = 800000; // Safe fallback instead of error
        }
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
            seating: variant.seating ? parseInt(String(variant.seating)) : undefined,
            transmission: variant.transmission,
            bodyType: bodyType,
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
