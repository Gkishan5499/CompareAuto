// Canonical route file for specs CSV upload
// Keep this file as the only source of truth for CSV import logic.

import { Router } from "express";
import multer from "multer";
import { uploadSpecsCsv } from "../controllers/space/specsCSV.controller";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";

const router = Router();

/**
 * Multer configuration
 * - Saves to /uploads
 * - Max CSV size = 50 MB
 */
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

/**
 * ================================
 * Admin-only CSV Import
 * POST /api/specs/upload
 * ================================
 */
router.post(
  "/upload",
  verifyAdmin,
  requirePermission("specs"),
  upload.single("file"),
  uploadSpecsCsv
);

/**
 * ================================
 * Development Helper Route
 * POST /api/specs/upload-dev
 * NO AUTH — use only in dev mode!
 * ================================
 */
if (process.env.NODE_ENV !== "production") {
  router.post(
    "/upload-dev",
    upload.single("file"),
    uploadSpecsCsv
  );
}

export default router;
