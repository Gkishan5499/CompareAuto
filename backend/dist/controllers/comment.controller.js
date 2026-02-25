"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.updateCommentStatus = exports.adminListComments = exports.listCommentsByArticle = exports.createComment = void 0;
const Comment_model_1 = __importDefault(require("../models/Comment.model"));
const createComment = async (req, res) => {
    try {
        const { articleId, name, email, content } = req.body;
        if (!articleId || !name || !email || !content) {
            return res.status(400).json({ success: false, error: "Missing fields" });
        }
        const doc = await Comment_model_1.default.create({ articleId, name, email, content, status: "pending" });
        return res.json({ success: true, comment: doc });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: "Failed to create comment" });
    }
};
exports.createComment = createComment;
const listCommentsByArticle = async (req, res) => {
    try {
        const { articleId } = req.params;
        const items = await Comment_model_1.default.find({ articleId, status: "approved" }).sort({ createdAt: -1 });
        return res.json({ success: true, items });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: "Failed to fetch comments" });
    }
};
exports.listCommentsByArticle = listCommentsByArticle;
const adminListComments = async (req, res) => {
    try {
        const status = req.query.status || undefined;
        const filter = {};
        if (status)
            filter.status = status;
        const items = await Comment_model_1.default.find(filter).sort({ createdAt: -1 });
        return res.json({ success: true, items });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: "Failed to fetch comments" });
    }
};
exports.adminListComments = adminListComments;
const updateCommentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ success: false, error: "Invalid status" });
        }
        const updated = await Comment_model_1.default.findByIdAndUpdate(id, { status }, { new: true });
        return res.json({ success: true, comment: updated });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: "Failed to update comment" });
    }
};
exports.updateCommentStatus = updateCommentStatus;
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        await Comment_model_1.default.findByIdAndDelete(id);
        return res.json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ success: false, error: "Failed to delete comment" });
    }
};
exports.deleteComment = deleteComment;
