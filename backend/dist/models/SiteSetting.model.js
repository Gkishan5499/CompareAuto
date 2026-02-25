"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SiteSettingSchema = new mongoose_1.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "url", "json"], default: "text" },
    description: { type: String },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("SiteSetting", SiteSettingSchema);
