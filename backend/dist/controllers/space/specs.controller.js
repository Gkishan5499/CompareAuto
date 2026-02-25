"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkCreateSpecs = exports.listSpecs = exports.deleteSpecs = exports.updateSpecs = exports.createSpecs = exports.getSpecsByVariant = void 0;
const CarSpecs_model_1 = __importDefault(require("../../models/carSpace/CarSpecs.model"));
/**
 * NOTE:
 * req: any  → allow req.admin, req.logActivity etc.
 */
/* ============================================
   HELPER: Convert boolean values to "Yes"/"No"
   Transforms stored boolean values AND string "true"/"false" to match CSV format (Yes/No)
============================================ */
function transformBooleansToYesNo(obj) {
    if (obj === null || obj === undefined)
        return obj;
    // Handle boolean values
    if (typeof obj === "boolean") {
        return obj ? "Yes" : "No";
    }
    // Handle string "true"/"false" values (case-insensitive)
    if (typeof obj === "string") {
        const lowerStr = obj.toLowerCase().trim();
        if (lowerStr === "true")
            return "Yes";
        if (lowerStr === "false")
            return "No";
        return obj; // Return original string if not true/false
    }
    if (Array.isArray(obj)) {
        return obj.map(item => transformBooleansToYesNo(item));
    }
    if (typeof obj === "object") {
        const transformed = {};
        for (const [key, value] of Object.entries(obj)) {
            transformed[key] = transformBooleansToYesNo(value);
        }
        return transformed;
    }
    return obj;
}
/* ============================================
   GET SPECS BY VARIANT ID
============================================ */
const getSpecsByVariant = async (req, res) => {
    try {
        const { variantId } = req.params;
        const specs = await CarSpecs_model_1.default.findOne({ variantId }).lean();
        if (!specs) {
            return res.status(404).json({ message: "Specifications not found" });
        }
        // Transform boolean values to "Yes"/"No" for display
        const transformedSpecs = transformBooleansToYesNo(specs);
        return res.json({
            success: true,
            data: transformedSpecs,
        });
    }
    catch (err) {
        console.error("getSpecsByVariant:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getSpecsByVariant = getSpecsByVariant;
/* ============================================
   CREATE SPECS (Strict: false → Accept any fields)
============================================ */
const createSpecs = async (req, res) => {
    try {
        const payload = req.body;
        if (!payload.variantId) {
            return res.status(400).json({ message: "variantId is required" });
        }
        const exists = await CarSpecs_model_1.default.findOne({ variantId: payload.variantId });
        if (exists) {
            return res.status(409).json({ message: "Specs already exist for this variant" });
        }
        const created = await CarSpecs_model_1.default.create(payload);
        if (req.logActivity) {
            await req.logActivity("create", "specs", created.variantId, payload);
        }
        // Transform boolean values to "Yes"/"No" for display
        const transformedCreated = transformBooleansToYesNo(created.toObject ? created.toObject() : created);
        return res.json({
            success: true,
            message: "Specs created",
            data: transformedCreated,
        });
    }
    catch (err) {
        console.error("createSpecs:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.createSpecs = createSpecs;
/* ============================================
   UPDATE SPECS (Upsert Enabled)
============================================ */
const updateSpecs = async (req, res) => {
    try {
        const { variantId } = req.params;
        const payload = req.body;
        const updated = await CarSpecs_model_1.default.findOneAndUpdate({ variantId }, { $set: payload }, { new: true, upsert: true } // merge + create if not exist
        );
        if (req.logActivity) {
            await req.logActivity("update", "specs", variantId, payload);
        }
        // Transform boolean values to "Yes"/"No" for display
        const transformedUpdated = transformBooleansToYesNo(updated.toObject ? updated.toObject() : updated);
        return res.json({
            success: true,
            message: "Specs updated",
            data: transformedUpdated,
        });
    }
    catch (err) {
        console.error("updateSpecs:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.updateSpecs = updateSpecs;
/* ============================================
   DELETE SPECS
============================================ */
const deleteSpecs = async (req, res) => {
    try {
        const { variantId } = req.params;
        const removed = await CarSpecs_model_1.default.findOneAndDelete({ variantId });
        if (!removed) {
            return res.status(404).json({ message: "Specs not found" });
        }
        if (req.logActivity) {
            await req.logActivity("delete", "specs", variantId, removed);
        }
        return res.json({
            success: true,
            message: "Specs deleted",
        });
    }
    catch (err) {
        console.error("deleteSpecs:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.deleteSpecs = deleteSpecs;
/* ============================================
   LIST SPECS (Pagination + Lean Optimized)
============================================ */
const listSpecs = async (req, res) => {
    try {
        const q = String(req.query.q || req.query.search || "").trim();
        const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
        const limit = Math.min(100, parseInt(String(req.query.limit || "50"), 10));
        const skip = (page - 1) * limit;
        const filter = {};
        if (q) {
            const regex = new RegExp(q, "i");
            filter.$or = [
                { variantId: regex },
                { "overview.summary": regex },
            ];
        }
        const [items, total] = await Promise.all([
            CarSpecs_model_1.default.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
            CarSpecs_model_1.default.countDocuments(filter),
        ]);
        // Transform boolean values to "Yes"/"No" for display
        const transformedItems = items.map(item => transformBooleansToYesNo(item));
        return res.json({
            success: true,
            page,
            limit,
            total,
            items: transformedItems,
        });
    }
    catch (err) {
        console.error("listSpecs:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.listSpecs = listSpecs;
/* ============================================
   BULK UPSERT (CSV Import Support)
============================================ */
const bulkCreateSpecs = async (req, res) => {
    var _a, _b;
    try {
        const { data } = req.body;
        if (!Array.isArray(data)) {
            return res.status(400).json({ message: "Invalid format: expected array" });
        }
        const invalid = [];
        const ops = [];
        data.forEach((row, idx) => {
            if (!row.variantId) {
                invalid.push({ rowIndex: idx, row });
                return;
            }
            ops.push({
                updateOne: {
                    filter: { variantId: row.variantId },
                    update: { $set: row },
                    upsert: true,
                },
            });
        });
        const result = await CarSpecs_model_1.default.bulkWrite(ops, { ordered: false });
        const upserted = (_b = (_a = result.upsertedCount) !== null && _a !== void 0 ? _a : result.nUpserted) !== null && _b !== void 0 ? _b : 0;
        if (req.logActivity) {
            await req.logActivity("bulk-upsert", "specs", "bulk", { count: upserted });
        }
        // Transform invalid rows for consistency
        const transformedInvalidRows = invalid.map((row) => ({
            ...row,
            row: transformBooleansToYesNo(row.row),
        }));
        return res.json({
            success: true,
            upsertedCount: upserted,
            invalidCount: transformedInvalidRows.length,
            invalidRows: transformedInvalidRows,
        });
    }
    catch (err) {
        console.error("bulkCreateSpecs:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.bulkCreateSpecs = bulkCreateSpecs;
