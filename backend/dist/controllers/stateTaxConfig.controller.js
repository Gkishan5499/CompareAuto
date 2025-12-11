"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStateTaxConfig = exports.bulkUpdateStateTaxConfigs = exports.updateStateTaxConfig = exports.createStateTaxConfig = exports.getStateTaxConfig = exports.getAllStateTaxConfigs = void 0;
const StateTaxConfig_model_1 = __importDefault(require("../models/StateTaxConfig.model"));
/**
 * Get all state tax configurations
 */
const getAllStateTaxConfigs = async (req, res) => {
    try {
        const configs = await StateTaxConfig_model_1.default.find().sort({ state: 1 });
        res.json(configs);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch state tax configurations" });
    }
};
exports.getAllStateTaxConfigs = getAllStateTaxConfigs;
/**
 * Get tax config for a specific state
 */
const getStateTaxConfig = async (req, res) => {
    try {
        const { state } = req.params;
        const config = await StateTaxConfig_model_1.default.findOne({ state });
        if (!config) {
            return res.status(404).json({ message: `Tax configuration for ${state} not found` });
        }
        res.json(config);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch state tax configuration" });
    }
};
exports.getStateTaxConfig = getStateTaxConfig;
/**
 * Create a new state tax configuration
 */
const createStateTaxConfig = async (req, res) => {
    try {
        const { state, gstRate, rtoPercentage, insurancePercentage, registrationFee } = req.body;
        // Validation
        if (!state) {
            return res.status(400).json({ error: "State name is required" });
        }
        // Check if state already exists
        const existingConfig = await StateTaxConfig_model_1.default.findOne({ state });
        if (existingConfig) {
            return res.status(400).json({ error: `Configuration for ${state} already exists` });
        }
        const config = await StateTaxConfig_model_1.default.create({
            state,
            gstRate: gstRate || 5,
            rtoPercentage: rtoPercentage || 9,
            insurancePercentage: insurancePercentage || 3.5,
            registrationFee: registrationFee || 2000,
        });
        res.status(201).json(config);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create state tax configuration" });
    }
};
exports.createStateTaxConfig = createStateTaxConfig;
/**
 * Update state tax configuration
 */
const updateStateTaxConfig = async (req, res) => {
    try {
        const { state } = req.params;
        const { gstRate, rtoPercentage, insurancePercentage, registrationFee } = req.body;
        const config = await StateTaxConfig_model_1.default.findOneAndUpdate({ state }, {
            ...(gstRate !== undefined && { gstRate }),
            ...(rtoPercentage !== undefined && { rtoPercentage }),
            ...(insurancePercentage !== undefined && { insurancePercentage }),
            ...(registrationFee !== undefined && { registrationFee }),
        }, { new: true });
        if (!config) {
            return res.status(404).json({ message: `Configuration for ${state} not found` });
        }
        res.json(config);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update state tax configuration" });
    }
};
exports.updateStateTaxConfig = updateStateTaxConfig;
/**
 * Bulk update multiple state tax configurations
 */
const bulkUpdateStateTaxConfigs = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { state, gstRate, rtoPercentage, ... }
        if (!Array.isArray(updates)) {
            return res.status(400).json({ error: "Updates must be an array" });
        }
        const results = await Promise.all(updates.map(async (update) => {
            const { state, ...fields } = update;
            return StateTaxConfig_model_1.default.findOneAndUpdate({ state }, fields, { new: true, upsert: true });
        }));
        res.json({ updated: results.length, configs: results });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to bulk update state tax configurations" });
    }
};
exports.bulkUpdateStateTaxConfigs = bulkUpdateStateTaxConfigs;
/**
 * Delete state tax configuration
 */
const deleteStateTaxConfig = async (req, res) => {
    try {
        const { state } = req.params;
        const config = await StateTaxConfig_model_1.default.findOneAndDelete({ state });
        if (!config) {
            return res.status(404).json({ message: `Configuration for ${state} not found` });
        }
        res.json({ message: `Configuration for ${state} deleted` });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete state tax configuration" });
    }
};
exports.deleteStateTaxConfig = deleteStateTaxConfig;
