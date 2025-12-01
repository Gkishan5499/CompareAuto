"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.getArticleById = exports.getAllArticles = void 0;
const Article_model_1 = __importDefault(require("../models/Article.model"));
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article_model_1.default.find().sort({ date: -1 });
        res.json(articles);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch articles" });
    }
};
exports.getAllArticles = getAllArticles;
const getArticleById = async (req, res) => {
    try {
        const article = await Article_model_1.default.findOne({ id: req.params.id });
        if (!article)
            return res.status(404).json({ message: "Article not found" });
        res.json(article);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to fetch article" });
    }
};
exports.getArticleById = getArticleById;
const createArticle = async (req, res) => {
    try {
        const article = await Article_model_1.default.create(req.body);
        res.json(article);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create article" });
    }
};
exports.createArticle = createArticle;
const updateArticle = async (req, res) => {
    try {
        const article = await Article_model_1.default.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        res.json(article);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update article" });
    }
};
exports.updateArticle = updateArticle;
const deleteArticle = async (req, res) => {
    try {
        await Article_model_1.default.findOneAndDelete({ id: req.params.id });
        res.json({ message: "Article deleted" });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to delete article" });
    }
};
exports.deleteArticle = deleteArticle;
