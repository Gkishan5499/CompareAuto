import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import fs from "fs";
import path from "path";
import verifyAdmin from "../middleware/verifyAdmin";

const router = Router();

// temp upload folder (required by multer)
const upload = multer({ dest: "tmp/" });

const handleUpload = async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get folder from request body or query, default to "carwale-clone"
    const folder = req.body.folder || req.query.folder || "carwale-clone";

    // Get original filename without extension
    const originalName = req.file.originalname;
    const fileNameWithoutExt = path.parse(originalName).name;

    // Upload to Cloudinary with public_id to preserve filename
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `carwale-clone/${folder}`,
      public_id: fileNameWithoutExt, // Use original filename as public_id to preserve name
      overwrite: true, // Allow overwriting if same filename uploaded again
    });

    // Delete temp file
    fs.unlinkSync(req.file.path);

    res.json({
      url: result.secure_url,       // Cloudinary CDN URL with preserved filename
      public_id: result.public_id, // used for delete/update later
      originalName: originalName,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

router.post("/", verifyAdmin, upload.single("file"), handleUpload);
router.post("/single", verifyAdmin, upload.single("file"), handleUpload);

export default router;
