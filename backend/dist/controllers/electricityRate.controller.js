"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteElectricityRate = exports.updateElectricityRate = exports.createElectricityRate = exports.getElectricityRatesByState = exports.getAllElectricityRates = void 0;
const ElectricityRate_model_1 = __importDefault(require("../models/ElectricityRate.model"));
const getAllElectricityRates = async (req, res) => {
    try {
        const rates = await ElectricityRate_model_1.default.find().sort({ stateName: 1 });
        res.json(rates);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch electricity rates" });
    }
};
exports.getAllElectricityRates = getAllElectricityRates;
const getElectricityRatesByState = async (req, res) => {
    try {
        const rates = await ElectricityRate_model_1.default.find({ state: req.params.state });
        res.json(rates);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch state rates" });
    }
};
exports.getElectricityRatesByState = getElectricityRatesByState;
const createElectricityRate = async (req, res) => {
    try {
        const rate = await ElectricityRate_model_1.default.create(req.body);
        res.json(rate);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create electricity rate" });
    }
};
exports.createElectricityRate = createElectricityRate;
const updateElectricityRate = async (req, res) => {
    try {
        const rate = await ElectricityRate_model_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(rate);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update electricity rate" });
    }
};
exports.updateElectricityRate = updateElectricityRate;
const deleteElectricityRate = async (req, res) => {
    try {
        await ElectricityRate_model_1.default.findByIdAndDelete(req.params.id);
        res.json({ message: "Electricity rate deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete electricity rate" });
    }
};
exports.deleteElectricityRate = deleteElectricityRate;
