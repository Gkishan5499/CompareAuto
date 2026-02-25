"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
// temp upload folder (required by multer)
const upload = (0, multer_1.default)({ dest: "tmp/" });
const handleUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Get folder from request body or query, default to "carwale-clone"
        const folder = req.body.folder || req.query.folder || "carwale-clone";
        // Get original filename without extension
        const originalName = req.file.originalname;
        const fileNameWithoutExt = path_1.default.parse(originalName).name;
        // Upload to Cloudinary with public_id to preserve filename
        const result = await cloudinary_1.default.uploader.upload(req.file.path, {
            folder: `carwale-clone/${folder}`,
            public_id: fileNameWithoutExt, // Use original filename as public_id to preserve name
            overwrite: true, // Allow overwriting if same filename uploaded again
        });
        // Delete temp file
        fs_1.default.unlinkSync(req.file.path);
        res.json({
            url: result.secure_url, // Cloudinary CDN URL with preserved filename
            public_id: result.public_id, // used for delete/update later
            originalName: originalName,
        });
    }
    catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
};
router.post("/", upload.single("file"), handleUpload);
router.post("/single", upload.single("file"), handleUpload);
exports.default = router;
