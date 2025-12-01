"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BrandSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    logo: { type: String, required: true },
    country: { type: String, required: true },
    modelCount: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Brand", BrandSchema);
