"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HeroCarouselSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    isActive: { type: Boolean, default: true },
    link: { type: String },
    description: { type: String }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("HeroCarousel", HeroCarouselSchema);
