"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateReview = exports.createReview = exports.getReviewsByModel = exports.getReviewById = exports.getAllReviews = void 0;
const Review_model_1 = __importDefault(require("../models/Review.model"));
const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review_model_1.default.find().sort({ reviewedAt: -1 });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};
exports.getAllReviews = getAllReviews;
const getReviewById = async (req, res) => {
    try {
        const review = await Review_model_1.default.findOne({ id: req.params.id });
        if (!review)
            return res.status(404).json({ message: "Review not found" });
        res.json(review);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch review" });
    }
};
exports.getReviewById = getReviewById;
const getReviewsByModel = async (req, res) => {
    try {
        const { modelSlug } = req.params;
        const reviews = await Review_model_1.default.find({ modelSlug });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
};
exports.getReviewsByModel = getReviewsByModel;
const createReview = async (req, res) => {
    try {
        const review = await Review_model_1.default.create(req.body);
        res.json(review);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create review" });
    }
};
exports.createReview = createReview;
const updateReview = async (req, res) => {
    try {
        const review = await Review_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(review);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update review" });
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        await Review_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Review deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete review" });
    }
};
exports.deleteReview = deleteReview;
