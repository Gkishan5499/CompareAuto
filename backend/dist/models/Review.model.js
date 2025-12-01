"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReviewSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    type: { type: String, enum: ["expert", "owner"], required: true },
    brandSlug: { type: String, required: true },
    modelSlug: { type: String, required: true },
    // Expert fields
    score: { type: Number },
    summary: { type: String },
    highlights: { type: [String], default: [] },
    fullReviewSlug: { type: String },
    reviewedAt: { type: String },
    // Owner fields
    rating: { type: Number },
    title: { type: String },
    review: { type: String },
    pros: { type: [String], default: [] },
    cons: { type: [String], default: [] },
    ownerName: { type: String },
    ownedSince: { type: String },
    kmsDriven: { type: Number },
    variant: { type: String },
    city: { type: String },
    postedAt: { type: String }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Review", ReviewSchema);
