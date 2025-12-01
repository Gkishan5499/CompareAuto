"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ArticleSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    tags: { type: [String], default: [] },
    date: { type: String, required: true },
    author: { type: String, required: true },
    heroImage: { type: String },
    excerpt: { type: String },
    body: { type: String, required: true },
    relatedIds: { type: [String], default: [] },
    readingTime: { type: Number, default: 0 }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Article", ArticleSchema);
