"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MediaMapSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true },
    hero: { type: String },
    gallery: { type: [String], default: [] },
    colors: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    view360: { type: String },
    videos: [
        {
            title: String,
            url: String
        }
    ]
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("MediaMap", MediaMapSchema);
