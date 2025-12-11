import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import fs from "fs";

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

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `carwale-clone/${folder}`,
    });

    // Delete temp file
    fs.unlinkSync(req.file.path);

    res.json({
      url: result.secure_url,       // Cloudinary CDN URL
      public_id: result.public_id, // used for delete/update later
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

router.post("/", upload.single("file"), handleUpload);
router.post("/single", upload.single("file"), handleUpload);

export default router;
