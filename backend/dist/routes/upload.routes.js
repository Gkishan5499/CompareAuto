"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// temp upload folder (required by multer)
const upload = (0, multer_1.default)({ dest: "tmp/" });
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }
        // Upload to Cloudinary
        const result = await cloudinary_1.default.uploader.upload(req.file.path, {
            folder: "carwale-clone",
        });
        // Delete temp file
        fs_1.default.unlinkSync(req.file.path);
        res.json({
            url: result.secure_url, // Cloudinary CDN URL
            public_id: result.public_id, // used for delete/update later
        });
    }
    catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Upload failed" });
    }
});
exports.default = router;
