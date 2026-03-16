import express from "express";
import verifyAdmin from "../middleware/verifyAdmin";
import requirePermission from "../middleware/requirePermission";
import {
  getAllHeroImages,
  getActiveHeroImages,
  getHeroImageById,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
  reorderHeroImages
} from "../controllers/heroCarousel.controller";

const router = express.Router();

// Public routes
router.get("/active", getActiveHeroImages);

// Admin routes
router.get("/", verifyAdmin, requirePermission("heroCarousel"), getAllHeroImages);
router.get("/:id", verifyAdmin, requirePermission("heroCarousel"), getHeroImageById);
router.post("/", verifyAdmin, requirePermission("heroCarousel"), createHeroImage);
router.put("/:id", verifyAdmin, requirePermission("heroCarousel"), updateHeroImage);
router.delete("/:id", verifyAdmin, requirePermission("heroCarousel"), deleteHeroImage);
router.post("/reorder", verifyAdmin, requirePermission("heroCarousel"), reorderHeroImages);

export default router;
