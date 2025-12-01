"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFeatureFlags = exports.getFeatureFlags = void 0;
const FeatureFlag_model_1 = __importDefault(require("../models/FeatureFlag.model"));
const getFeatureFlags = async (req, res) => {
    try {
        const flags = await FeatureFlag_model_1.default.findOne();
        res.json(flags);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch feature flags" });
    }
};
exports.getFeatureFlags = getFeatureFlags;
const updateFeatureFlags = async (req, res) => {
    try {
        const flags = await FeatureFlag_model_1.default.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true
        });
        res.json(flags);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update feature flags" });
    }
};
exports.updateFeatureFlags = updateFeatureFlags;
