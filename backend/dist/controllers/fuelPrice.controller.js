"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFuelPrice = exports.updateFuelPrice = exports.createFuelPrice = exports.getFuelPriceByCity = exports.getAllFuelPrices = void 0;
const FuelPrice_model_1 = __importDefault(require("../models/FuelPrice.model"));
const getAllFuelPrices = async (req, res) => {
    try {
        const prices = await FuelPrice_model_1.default.find().sort({ cityName: 1 });
        res.json(prices);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch fuel prices" });
    }
};
exports.getAllFuelPrices = getAllFuelPrices;
const getFuelPriceByCity = async (req, res) => {
    try {
        const price = await FuelPrice_model_1.default.findOne({ city: req.params.city });
        res.json(price);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch fuel price" });
    }
};
exports.getFuelPriceByCity = getFuelPriceByCity;
const createFuelPrice = async (req, res) => {
    try {
        const price = await FuelPrice_model_1.default.create(req.body);
        res.json(price);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create fuel price" });
    }
};
exports.createFuelPrice = createFuelPrice;
const updateFuelPrice = async (req, res) => {
    try {
        const price = await FuelPrice_model_1.default.findOneAndUpdate({ city: req.params.city }, req.body, { new: true });
        res.json(price);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update fuel price" });
    }
};
exports.updateFuelPrice = updateFuelPrice;
const deleteFuelPrice = async (req, res) => {
    try {
        await FuelPrice_model_1.default.findOneAndDelete({ city: req.params.city });
        res.json({ message: "Fuel price deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete fuel price" });
    }
};
exports.deleteFuelPrice = deleteFuelPrice;
