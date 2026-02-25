"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.updateBrand = exports.bulkCreateBrands = exports.createBrand = exports.getBrandBySlug = exports.getBrandById = exports.getAllBrands = void 0;
const Brand_model_1 = __importDefault(require("../models/Brand.model"));
const CarModel_model_1 = __importDefault(require("../models/CarModel.model"));
const getAllBrands = async (req, res) => {
    try {
        const brands = await Brand_model_1.default.find().sort({ name: 1 }).lean();
        // Get model counts for each brand
        const brandIds = brands.map(b => b.id);
        const modelCounts = await CarModel_model_1.default.aggregate([
            { $match: { brandId: { $in: brandIds } } },
            { $group: { _id: "$brandId", count: { $sum: 1 } } }
        ]);
        // Create a map for quick lookup
        const countMap = new Map(modelCounts.map(mc => [mc._id, mc.count]));
        // Add model count to each brand
        const brandsWithCounts = brands.map(brand => ({
            ...brand,
            modelCount: countMap.get(brand.id) || 0
        }));
        res.json(brandsWithCounts);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch brands" });
    }
};
exports.getAllBrands = getAllBrands;
const getBrandById = async (req, res) => {
    try {
        const brand = await Brand_model_1.default.findOne({ id: req.params.id }).lean();
        if (!brand)
            return res.status(404).json({ message: "Brand not found" });
        // Get model count for this brand
        const modelCount = await CarModel_model_1.default.countDocuments({ brandId: brand.id });
        res.json({ ...brand, modelCount });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch brand" });
    }
};
exports.getBrandById = getBrandById;
const getBrandBySlug = async (req, res) => {
    try {
        const brand = await Brand_model_1.default.findOne({ slug: req.params.slug }).lean();
        if (!brand)
            return res.status(404).json({ message: "Brand not found" });
        // Get model count for this brand
        const modelCount = await CarModel_model_1.default.countDocuments({ brandId: brand.id });
        res.json({ ...brand, modelCount });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch brand" });
    }
};
exports.getBrandBySlug = getBrandBySlug;
const createBrand = async (req, res) => {
    try {
        const brand = await Brand_model_1.default.create(req.body);
        res.json(brand);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create brand" });
    }
};
exports.createBrand = createBrand;
const bulkCreateBrands = async (req, res) => {
    try {
        const { data } = req.body;
        if (!Array.isArray(data))
            return res.status(400).json({ error: "Invalid data" });
        const created = await Brand_model_1.default.insertMany(data);
        res.json(created);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to bulk create brands" });
    }
};
exports.bulkCreateBrands = bulkCreateBrands;
const updateBrand = async (req, res) => {
    try {
        const brand = await Brand_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(brand);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update brand" });
    }
};
exports.updateBrand = updateBrand;
const deleteBrand = async (req, res) => {
    try {
        await Brand_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Brand deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete brand" });
    }
};
exports.deleteBrand = deleteBrand;
