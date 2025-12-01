"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateCarModels = exports.getUpcomingCarModels = exports.getNewCarModels = exports.getPopularCarModels = exports.getCarModelsByFuelType = exports.getCarModelsByBodyType = exports.getCarModelsByBrand = exports.getCarModelBySlug = exports.deleteCarModel = exports.updateCarModel = exports.createCarModel = exports.getCarModelById = exports.getAllCarModels = void 0;
const CarModel_model_1 = __importDefault(require("../models/CarModel.model"));
const getAllCarModels = async (req, res) => {
    try {
        const models = await CarModel_model_1.default.find().sort({ name: 1 });
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch car models" });
    }
};
exports.getAllCarModels = getAllCarModels;
const getCarModelById = async (req, res) => {
    try {
        const model = await CarModel_model_1.default.findOne({ id: req.params.id });
        if (!model)
            return res.status(404).json({ message: "Model not found" });
        res.json(model);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch model" });
    }
};
exports.getCarModelById = getCarModelById;
const createCarModel = async (req, res) => {
    try {
        const model = await CarModel_model_1.default.create(req.body);
        res.json(model);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create model" });
    }
};
exports.createCarModel = createCarModel;
const updateCarModel = async (req, res) => {
    try {
        const model = await CarModel_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(model);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update model" });
    }
};
exports.updateCarModel = updateCarModel;
const deleteCarModel = async (req, res) => {
    try {
        await CarModel_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Model deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete model" });
    }
};
exports.deleteCarModel = deleteCarModel;
const getCarModelBySlug = async (req, res) => {
    try {
        const model = await CarModel_model_1.default.findOne({ slug: req.params.slug });
        if (!model)
            return res.status(404).json({ message: "Model not found" });
        res.json(model);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch model" });
    }
};
exports.getCarModelBySlug = getCarModelBySlug;
const getCarModelsByBrand = async (req, res) => {
    try {
        const { brandId } = req.params;
        const models = await CarModel_model_1.default.find({ brandId }).sort({ name: 1 });
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch models" });
    }
};
exports.getCarModelsByBrand = getCarModelsByBrand;
const getCarModelsByBodyType = async (req, res) => {
    try {
        const { bodyType } = req.params;
        const models = await CarModel_model_1.default.find({ bodyType }).sort({ name: 1 });
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch models" });
    }
};
exports.getCarModelsByBodyType = getCarModelsByBodyType;
const getCarModelsByFuelType = async (req, res) => {
    try {
        const { fuelType } = req.params;
        // This would need to check variants for fuel type
        const models = await CarModel_model_1.default.find().sort({ name: 1 });
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch models" });
    }
};
exports.getCarModelsByFuelType = getCarModelsByFuelType;
const getPopularCarModels = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const models = await CarModel_model_1.default.find({ status: { $ne: "upcoming" } })
            .sort({ rating: -1, reviews: -1 })
            .limit(limit);
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch popular models" });
    }
};
exports.getPopularCarModels = getPopularCarModels;
const getNewCarModels = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const models = await CarModel_model_1.default.find({ status: "new" })
            .sort({ launchDate: -1 })
            .limit(limit);
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch new models" });
    }
};
exports.getNewCarModels = getNewCarModels;
const getUpcomingCarModels = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const models = await CarModel_model_1.default.find({ status: "upcoming" })
            .sort({ expectedLaunch: 1 })
            .limit(limit);
        res.json(models);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch upcoming models" });
    }
};
exports.getUpcomingCarModels = getUpcomingCarModels;
const bulkCreateCarModels = async (req, res) => {
    try {
        const { data } = req.body;
        if (!Array.isArray(data))
            return res.status(400).json({ error: "Invalid data" });
        const created = await CarModel_model_1.default.insertMany(data);
        res.json(created);
    }
    catch (err) {
        res.status(400).json({ error: "Failed to bulk create car models" });
    }
};
exports.bulkCreateCarModels = bulkCreateCarModels;
