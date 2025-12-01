import { Router } from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary";
import fs from "fs";

const router = Router();

// temp upload folder (required by multer)
const upload = multer({ dest: "tmp/" });

router.post("/", upload.single("file"), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "carwale-clone",
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
});

export default router;
