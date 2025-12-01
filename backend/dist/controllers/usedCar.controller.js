"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsedCar = exports.updateUsedCar = exports.createUsedCar = exports.getUsedCarsByCity = exports.getUsedCarById = exports.getAllUsedCars = void 0;
const UsedCar_model_1 = __importDefault(require("../models/UsedCar.model"));
const getAllUsedCars = async (req, res) => {
    try {
        const cars = await UsedCar_model_1.default.find().sort({ createdAt: -1 });
        res.json(cars);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch used cars" });
    }
};
exports.getAllUsedCars = getAllUsedCars;
const getUsedCarById = async (req, res) => {
    try {
        const car = await UsedCar_model_1.default.findOne({ id: req.params.id });
        if (!car)
            return res.status(404).json({ message: "Used car not found" });
        res.json(car);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch car" });
    }
};
exports.getUsedCarById = getUsedCarById;
const getUsedCarsByCity = async (req, res) => {
    try {
        const cars = await UsedCar_model_1.default.find({ city: req.params.city });
        res.json(cars);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch cars by city" });
    }
};
exports.getUsedCarsByCity = getUsedCarsByCity;
const createUsedCar = async (req, res) => {
    try {
        const car = await UsedCar_model_1.default.create(req.body);
        res.json(car);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create used car" });
    }
};
exports.createUsedCar = createUsedCar;
const updateUsedCar = async (req, res) => {
    try {
        const car = await UsedCar_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(car);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update used car" });
    }
};
exports.updateUsedCar = updateUsedCar;
const deleteUsedCar = async (req, res) => {
    try {
        await UsedCar_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Used car deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete used car" });
    }
};
exports.deleteUsedCar = deleteUsedCar;
