"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUpcomingCar = exports.updateUpcomingCar = exports.createUpcomingCar = exports.getUpcomingCarById = exports.getAllUpcomingCars = void 0;
const UpcomingCar_model_1 = __importDefault(require("../models/UpcomingCar.model"));
const getAllUpcomingCars = async (req, res) => {
    try {
        const cars = await UpcomingCar_model_1.default.find().sort({ expectedLaunch: 1 });
        res.json(cars);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch upcoming cars" });
    }
};
exports.getAllUpcomingCars = getAllUpcomingCars;
const getUpcomingCarById = async (req, res) => {
    try {
        const car = await UpcomingCar_model_1.default.findOne({ id: req.params.id });
        if (!car)
            return res.status(404).json({ message: "Car not found" });
        res.json(car);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch upcoming car" });
    }
};
exports.getUpcomingCarById = getUpcomingCarById;
const createUpcomingCar = async (req, res) => {
    try {
        const car = await UpcomingCar_model_1.default.create(req.body);
        res.json(car);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create upcoming car" });
    }
};
exports.createUpcomingCar = createUpcomingCar;
const updateUpcomingCar = async (req, res) => {
    try {
        const car = await UpcomingCar_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(car);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update upcoming car" });
    }
};
exports.updateUpcomingCar = updateUpcomingCar;
const deleteUpcomingCar = async (req, res) => {
    try {
        await UpcomingCar_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Upcoming car deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete upcoming car" });
    }
};
exports.deleteUpcomingCar = deleteUpcomingCar;
