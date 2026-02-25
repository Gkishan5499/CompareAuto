"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderHeroImages = exports.deleteHeroImage = exports.updateHeroImage = exports.createHeroImage = exports.getHeroImageById = exports.getActiveHeroImages = exports.getAllHeroImages = void 0;
const HeroCarousel_model_1 = __importDefault(require("../models/HeroCarousel.model"));
/**
 * Generate a unique ID for hero carousel
 */
const generateHeroId = () => {
    return `hero-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
/**
 * Get all hero carousel images (ordered by 'order' field)
 */
const getAllHeroImages = async (req, res) => {
    try {
        const images = await HeroCarousel_model_1.default.find().sort({ order: 1 });
        res.json(images);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch hero images" });
    }
};
exports.getAllHeroImages = getAllHeroImages;
/**
 * Get only active hero carousel images
 */
const getActiveHeroImages = async (req, res) => {
    try {
        const images = await HeroCarousel_model_1.default.find({ isActive: true }).sort({ order: 1 });
        res.json(images);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch active hero images" });
    }
};
exports.getActiveHeroImages = getActiveHeroImages;
/**
 * Get single hero image by ID
 */
const getHeroImageById = async (req, res) => {
    try {
        const image = await HeroCarousel_model_1.default.findOne({ id: req.params.id });
        if (!image)
            return res.status(404).json({ message: "Hero image not found" });
        res.json(image);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch hero image" });
    }
};
exports.getHeroImageById = getHeroImageById;
/**
 * Create new hero carousel image
 */
const createHeroImage = async (req, res) => {
    try {
        const heroData = {
            ...req.body,
            id: req.body.id || generateHeroId()
        };
        const heroImage = await HeroCarousel_model_1.default.create(heroData);
        res.json(heroImage);
    }
    catch (error) {
        console.error("Create hero image error:", error);
        res.status(400).json({ error: "Failed to create hero image", details: error.message });
    }
};
exports.createHeroImage = createHeroImage;
/**
 * Update hero carousel image
 */
const updateHeroImage = async (req, res) => {
    try {
        const heroImage = await HeroCarousel_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!heroImage)
            return res.status(404).json({ message: "Hero image not found" });
        res.json(heroImage);
    }
    catch (error) {
        console.error("Update hero image error:", error);
        res.status(400).json({ error: "Failed to update hero image", details: error.message });
    }
};
exports.updateHeroImage = updateHeroImage;
/**
 * Delete hero carousel image
 */
const deleteHeroImage = async (req, res) => {
    try {
        const result = await HeroCarousel_model_1.default.findOneAndDelete({ id: req.params.id });
        if (!result)
            return res.status(404).json({ message: "Hero image not found" });
        res.json({ message: "Hero image deleted successfully" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete hero image" });
    }
};
exports.deleteHeroImage = deleteHeroImage;
/**
 * Reorder hero carousel images
 */
const reorderHeroImages = async (req, res) => {
    try {
        const { imageIds } = req.body; // Array of IDs in desired order
        if (!Array.isArray(imageIds)) {
            return res.status(400).json({ error: "imageIds must be an array" });
        }
        // Update order for each image
        const updatePromises = imageIds.map((id, index) => HeroCarousel_model_1.default.findOneAndUpdate({ id }, { order: index }, { new: true }));
        await Promise.all(updatePromises);
        const updatedImages = await HeroCarousel_model_1.default.find().sort({ order: 1 });
        res.json(updatedImages);
    }
    catch (error) {
        console.error("Reorder hero images error:", error);
        res.status(400).json({ error: "Failed to reorder hero images" });
    }
};
exports.reorderHeroImages = reorderHeroImages;
