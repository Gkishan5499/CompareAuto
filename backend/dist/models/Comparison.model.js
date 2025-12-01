"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ComparisonSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    models: { type: [String], required: true }, // array of model ids
    views: { type: Number, default: 0 }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Comparison", ComparisonSchema);
