"use strict";
// Canonical route file for specs CSV upload
// Keep this file as the only source of truth for CSV import logic.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const specsCSV_controller_1 = require("../controllers/space/specsCSV.controller");
const verifyAdmin_1 = __importDefault(require("../middleware/verifyAdmin"));
const router = (0, express_1.Router)();
/**
 * Multer configuration
 * - Saves to /uploads
 * - Max CSV size = 50 MB
 */
const upload = (0, multer_1.default)({
    dest: "uploads/",
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});
/**
 * ================================
 * Admin-only CSV Import
 * POST /api/specs/upload
 * ================================
 */
router.post("/upload", verifyAdmin_1.default, upload.single("file"), specsCSV_controller_1.uploadSpecsCsv);
/**
 * ================================
 * Development Helper Route
 * POST /api/specs/upload-dev
 * NO AUTH — use only in dev mode!
 * ================================
 */
if (process.env.NODE_ENV !== "production") {
    router.post("/upload-dev", upload.single("file"), specsCSV_controller_1.uploadSpecsCsv);
}
exports.default = router;
