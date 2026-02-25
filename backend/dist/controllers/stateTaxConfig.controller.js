"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importStateTaxCsv = exports.applyPredefinedUpdates = exports.deleteStateTaxConfig = exports.bulkUpdateStateTaxConfigs = exports.updateStateTaxConfig = exports.createStateTaxConfig = exports.getStateTaxConfig = exports.getAllStateTaxConfigs = void 0;
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
/**
 * Apply predefined updates to state tax configurations (Petrol fuel type)
 */
const applyPredefinedUpdates = async (req, res) => {
    try {
        const updatedStateTaxConfigs = [
            // States
            { state: "Andhra Pradesh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
            { state: "Arunachal Pradesh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
            { state: "Assam", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
            { state: "Bihar", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
            { state: "Chhattisgarh", rtoPercentage: 8, insurancePercentage: 6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 6 } },
            { state: "Goa", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Gujarat", rtoPercentage: 6, insurancePercentage: 5.4, rtoByFuelType: { petrol: 6 }, insuranceByFuelType: { petrol: 5.4 } },
            { state: "Haryana", rtoPercentage: 7, insurancePercentage: 5.6, rtoByFuelType: { petrol: 7 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Himachal Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Jharkhand", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Karnataka", rtoPercentage: 13, insurancePercentage: 5.8, rtoByFuelType: { petrol: 13 }, insuranceByFuelType: { petrol: 5.8 } },
            { state: "Kerala", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Madhya Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Maharashtra", rtoPercentage: 11, insurancePercentage: 5.8, rtoByFuelType: { petrol: 11 }, insuranceByFuelType: { petrol: 5.8 } },
            { state: "Manipur", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Meghalaya", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Mizoram", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Nagaland", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Odisha", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Punjab", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Rajasthan", rtoPercentage: 6, insurancePercentage: 5.4, rtoByFuelType: { petrol: 6 }, insuranceByFuelType: { petrol: 5.4 } },
            { state: "Sikkim", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Tamil Nadu", rtoPercentage: 9, insurancePercentage: 5.6, rtoByFuelType: { petrol: 9 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Telangana", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Tripura", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Uttar Pradesh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Uttarakhand", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "West Bengal", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
            // Union Territories
            { state: "Andaman and Nicobar Islands", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Chandigarh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Dadra & Nagar Haveli and Daman & Diu", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Delhi", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
            { state: "Delhi NCR", rtoPercentage: 5, insurancePercentage: 5.4, rtoByFuelType: { petrol: 5 }, insuranceByFuelType: { petrol: 5.4 } },
            { state: "Jammu & Kashmir", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Ladakh", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Lakshadweep", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
            { state: "Puducherry", rtoPercentage: 8, insurancePercentage: 5.6, rtoByFuelType: { petrol: 8 }, insuranceByFuelType: { petrol: 5.6 } },
        ];
        let updatedCount = 0;
        let notFoundStates = [];
        for (const config of updatedStateTaxConfigs) {
            const result = await StateTaxConfig_model_1.default.findOneAndUpdate({ state: config.state }, {
                $set: {
                    rtoPercentage: config.rtoPercentage,
                    insurancePercentage: config.insurancePercentage,
                    rtoByFuelType: config.rtoByFuelType,
                    insuranceByFuelType: config.insuranceByFuelType,
                },
            }, { new: true });
            if (result) {
                updatedCount++;
            }
            else {
                notFoundStates.push(config.state);
            }
        }
        res.json({
            success: true,
            message: `Updated ${updatedCount} state tax configurations`,
            updatedCount,
            notFoundStates,
            totalAttempted: updatedStateTaxConfigs.length
        });
    }
    catch (error) {
        console.error("Error applying predefined updates:", error);
        res.status(500).json({ error: "Failed to apply predefined updates" });
    }
};
exports.applyPredefinedUpdates = applyPredefinedUpdates;
/**
 * Import State/UT tax configs from CSV (multipart/form-data)
 * Accepts headers (case-insensitive):
 *  - state, code(optional), type(optional), fuel, rto%, insurance%
 *  Alternate header names allowed:
 *  - rto_percent | base_registration_tax | base registration tax (%)
 *  - insurance_percent | insurance % (incl gst)
 */
const importStateTaxCsv = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    try {
        if (!req.file)
            return res.status(400).json({ error: "CSV file is required (field name 'file')" });
        const fs = await Promise.resolve().then(() => __importStar(require("fs")));
        const { parse } = await Promise.resolve().then(() => __importStar(require("csv-parse")));
        const filePath = req.file.path;
        const report = {
            totalRows: 0,
            updated: 0,
            created: 0,
            skipped: 0,
            errors: [],
        };
        const normalizeKey = (s) => String(s || "").trim().toLowerCase();
        const toNumber = (v) => {
            if (v === undefined || v === null)
                return undefined;
            const n = parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
            return Number.isFinite(n) ? n : undefined;
        };
        const parser = fs.createReadStream(filePath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true, relax_column_count: true }));
        for await (const row of parser) {
            report.totalRows++;
            try {
                // Normalize headers to lowercase for flexible CSVs
                const norm = {};
                for (const k of Object.keys(row))
                    norm[normalizeKey(k)] = row[k];
                const state = norm["state"] || norm["state name"] || norm["region"];
                const fuelRaw = norm["fuel"] || norm["fueltype"] || norm["fuel_type"]; // petrol/diesel/cng/hybrid/ev
                if (!state) {
                    report.skipped++;
                    report.errors.push({ row: report.totalRows, reason: "Missing state" });
                    continue;
                }
                const fuel = String(fuelRaw || "").toLowerCase();
                // RTO percentage detection
                const rtoPct = (_g = (_f = (_e = (_d = (_c = (_b = (_a = toNumber(norm["rto%"])) !== null && _a !== void 0 ? _a : toNumber(norm["rto percent"])) !== null && _b !== void 0 ? _b : toNumber(norm["rto_percentage"])) !== null && _c !== void 0 ? _c : toNumber(norm["rto percentage"])) !== null && _d !== void 0 ? _d : toNumber(norm["base registration tax (%)"])) !== null && _e !== void 0 ? _e : toNumber(norm["base_registration_tax"])) !== null && _f !== void 0 ? _f : toNumber(norm["registration_tax"])) !== null && _g !== void 0 ? _g : undefined;
                // Insurance percentage detection
                const insPct = (_l = (_k = (_j = (_h = toNumber(norm["insurance %"])) !== null && _h !== void 0 ? _h : toNumber(norm["insurance % (incl gst)"])) !== null && _j !== void 0 ? _j : toNumber(norm["insurance_percent"])) !== null && _k !== void 0 ? _k : toNumber(norm["insurance percentage"])) !== null && _l !== void 0 ? _l : undefined;
                // Fetch existing or prepare upsert
                const existing = await StateTaxConfig_model_1.default.findOne({ state });
                let payload = {};
                if (fuel) {
                    // Update fuel-specific fields
                    if (rtoPct !== undefined) {
                        payload["rtoByFuelType." + fuel] = rtoPct;
                        // keep legacy rtoPercentage in sync when petrol provided
                        if (fuel === "petrol")
                            payload["rtoPercentage"] = rtoPct;
                    }
                    if (insPct !== undefined) {
                        payload["insuranceByFuelType." + fuel] = insPct;
                        if (fuel === "petrol")
                            payload["insurancePercentage"] = insPct;
                    }
                }
                else {
                    // Generic fallback when no fuel column provided
                    if (rtoPct !== undefined)
                        payload["rtoPercentage"] = rtoPct;
                    if (insPct !== undefined)
                        payload["insurancePercentage"] = insPct;
                }
                if (!existing) {
                    // create with minimal defaults
                    const base = {
                        state,
                        gstRate: 5,
                        rtoPercentage: (_m = payload.rtoPercentage) !== null && _m !== void 0 ? _m : 9,
                        insurancePercentage: (_o = payload.insurancePercentage) !== null && _o !== void 0 ? _o : 3.5,
                        registrationFee: 2000,
                    };
                    if (fuel) {
                        base.rtoByFuelType = { [fuel]: rtoPct };
                        base.insuranceByFuelType = { [fuel]: insPct };
                    }
                    await StateTaxConfig_model_1.default.create(base);
                    report.created++;
                }
                else {
                    if (Object.keys(payload).length === 0) {
                        report.skipped++;
                        continue;
                    }
                    await StateTaxConfig_model_1.default.updateOne({ _id: existing._id }, { $set: payload });
                    report.updated++;
                }
            }
            catch (e) {
                report.errors.push({ row: report.totalRows, reason: (e === null || e === void 0 ? void 0 : e.message) || String(e) });
                report.skipped++;
            }
        }
        try {
            fs.unlinkSync(filePath);
        }
        catch { }
        return res.json({ success: true, ...report });
    }
    catch (error) {
        console.error("CSV import failed:", error);
        return res.status(500).json({ error: "Failed to import state tax configuration CSV" });
    }
};
exports.importStateTaxCsv = importStateTaxCsv;
